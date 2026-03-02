import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import cron from 'node-cron';
import { getDb } from '../database/db';
import { getTokenTransfers, WhaleTransaction, getEtherscanTxUrl, formatAddress } from './etherscan';
import logger from '../utils/logger';
import { config } from '../config';

// Track processed transactions to avoid duplicates
const processedTxs = new Set<string>();
const MAX_PROCESSED_SIZE = 10000;

export function startAlertMonitor(client: Client): void {
  logger.info('Starting alert monitor...');
  
  // Run every minute
  cron.schedule(`*/${Math.max(1, Math.floor(config.bot.checkIntervalSeconds / 60))} * * * *`, async () => {
    await checkForWhaleAlerts(client);
  });
  
  // Also run immediately on startup (with delay to let client connect)
  setTimeout(() => checkForWhaleAlerts(client), 5000);
}

async function checkForWhaleAlerts(client: Client): Promise<void> {
  try {
    const db = getDb();
    
    // Get all active watches grouped by guild
    const watches = await db.all(`
      SELECT w.*, g.is_premium as guild_premium
      FROM watched_tokens w
      LEFT JOIN guild_settings g ON w.guild_id = g.guild_id
    `);
    
    if (watches.length === 0) {
      return;
    }
    
    logger.debug(`Checking ${watches.length} watched tokens for whale activity`);
    
    // Group by token to batch API calls
    const tokenGroups: Record<string, typeof watches> = {};
    for (const watch of watches) {
      const key = `${watch.chain}:${watch.token_address}`;
      if (!tokenGroups[key]) {
        tokenGroups[key] = [];
      }
      tokenGroups[key].push(watch);
    }
    
    // Check each token
    for (const [tokenKey, tokenWatches] of Object.entries(tokenGroups)) {
      const [chain, tokenAddress] = tokenKey.split(':');
      
      // Get the lowest threshold among watchers (to catch all relevant transactions)
      const minThreshold = Math.min(...tokenWatches.map(w => w.threshold_usd));
      
      // Fetch recent transactions
      const transactions = await getTokenTransfers(tokenAddress, minThreshold);
      
      for (const tx of transactions) {
        // Skip if already processed
        if (processedTxs.has(tx.hash)) {
          continue;
        }
        
        // Add to processed set
        processedTxs.add(tx.hash);
        if (processedTxs.size > MAX_PROCESSED_SIZE) {
          const firstItem = processedTxs.values().next().value;
          if (firstItem) processedTxs.delete(firstItem);
        }
        
        // Store in history
        await db.run(`
          INSERT INTO alert_history (guild_id, tx_hash, token_address, from_address, to_address, amount_tokens, amount_usd, chain)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['global', tx.hash, tokenAddress, tx.from, tx.to, tx.amount.toString(), tx.amountUsd, chain]);
        
        // Alert relevant guilds
        for (const watch of tokenWatches) {
          if (tx.amountUsd >= watch.threshold_usd) {
            await sendAlert(client, watch, tx, tokenAddress);
          }
        }
      }
      
      // Rate limiting between tokens
      await sleep(200);
    }
    
  } catch (error) {
    logger.error('Error in alert monitor:', error);
  }
}

async function sendAlert(
  client: Client, 
  watch: any, 
  tx: WhaleTransaction,
  tokenAddress: string
): Promise<void> {
  try {
    const guild = await client.guilds.fetch(watch.guild_id).catch(() => null);
    if (!guild) return;
    
    const channel = await guild.channels.fetch(watch.channel_id).catch(() => null) as TextChannel;
    if (!channel || !channel.isTextBased()) return;
    
    // Check if this guild should receive this alert (rate limiting for free tier)
    const isPremium = watch.is_premium || watch.guild_premium;
    if (!isPremium) {
      // Free tier delay already applied by batch processing, but could add extra here
    }
    
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('🐋 WHALE ALERT!')
      .setDescription(`Large ${tx.tokenSymbol || 'token'} transfer detected!`)
      .addFields(
        { name: '💰 Value', value: `$${tx.amountUsd.toLocaleString()}`, inline: true },
        { name: '🪙 Amount', value: `${tx.amount.toLocaleString()} ${tx.tokenSymbol || 'tokens'}`, inline: true },
        { name: '⏰ Time', value: `<t:${Math.floor(tx.timestamp / 1000)}:R>`, inline: true },
        { name: '📤 From', value: `\`${formatAddress(tx.from)}\``, inline: false },
        { name: '📥 To', value: `\`${formatAddress(tx.to)}\``, inline: false },
      )
      .addFields({
        name: '🔗 Transaction',
        value: `[View on Etherscan](${getEtherscanTxUrl(tx.hash)})`,
        inline: false
      })
      .setTimestamp()
      .setFooter({ 
        text: isPremium ? '⭐ WhaleAlert Pro Premium' : 'WhaleAlert Pro (Free Tier)',
        iconURL: isPremium ? undefined : 'https://etherscan.io/images/brandassets/etherscan-logo-circle.png'
      });
    
    await channel.send({ embeds: [embed] });
    logger.info(`Sent whale alert to guild ${watch.guild_id} for tx ${tx.hash}`);
    
  } catch (error) {
    logger.error(`Error sending alert to guild ${watch.guild_id}:`, error);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}