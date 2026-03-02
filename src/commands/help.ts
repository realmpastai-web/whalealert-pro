import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../config';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show help and information about WhaleAlert Pro');

export async function execute(interaction: CommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x00aaff)
    .setTitle('🐋 WhaleAlert Pro - Help')
    .setDescription('Track crypto whale movements in your Discord server')
    .addFields(
      {
        name: '📋 Available Commands',
        value: [
          '`/watch [token] [threshold]` - Start monitoring a token',
          '`/unwatch [token]` - Stop monitoring a token',
          '`/watches` - List all monitored tokens',
          '`/recent [limit]` - Show recent whale alerts',
          '`/help` - Show this help message',
          '`/premium` - Show premium features'
        ].join('\n'),
      },
      {
        name: '🆓 Free Tier',
        value: [
          `• Watch up to ${config.bot.maxFreeWatches} tokens`,
          '• Alerts with 2-minute delay',
          '• Basic whale detection',
          '• ETH mainnet support'
        ].join('\n'),
      },
      {
        name: '⭐ Premium Tier - $10/month',
        value: [
          '• Unlimited token watches',
          '• Instant alerts (< 30 seconds)',
          '• Multi-chain support (ETH, BSC, SOL)',
          '• Whale wallet labels',
          '• Smart alerts & pattern detection',
          '• Priority support'
        ].join('\n'),
      },
      {
        name: '🔧 Getting Started',
        value: [
          '1. Find a token contract address on [Etherscan](https://etherscan.io)',
          '2. Use `/watch [address]` to start monitoring',
          '3. Alerts will appear in this channel when whales move!'
        ].join('\n'),
      }
    )
    .setTimestamp()
    .setFooter({ text: 'WhaleAlert Pro by QuantBitRealm' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}