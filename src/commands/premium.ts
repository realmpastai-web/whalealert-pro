import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('premium')
  .setDescription('Learn about WhaleAlert Pro premium features');

export async function execute(interaction: CommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle('⭐ WhaleAlert Pro Premium')
    .setDescription('Unlock the full power of whale tracking')
    .addFields(
      {
        name: '💎 Premium Features',
        value: [
          '**Unlimited Watches** - Monitor as many tokens as you want',
          '**Instant Alerts** - Get notified within 30 seconds',
          '**Multi-Chain Support** - ETH, BSC, and Solana',
          '**Whale Labels** - Know who is moving funds (exchanges, known whales)',
          '**Smart Alerts** - AI-powered pattern detection',
          '**Custom Channels** - Route alerts to different channels per token',
          '**API Access** - Build your own integrations',
          '**Priority Support** - Fast response from our team'
        ].join('\n'),
      },
      {
        name: '💰 Pricing',
        value: [
          '**Monthly:** $10/month',
          '**Yearly:** $79/year (Save $41!)',
          '**Enterprise:** Custom pricing for large communities',
          '',
          'Payment via Instamojo (India) or Crypto (Global)'
        ].join('\n'),
      },
      {
        name: '🚀 Upgrade Now',
        value: 'Contact the bot owner or visit our website to upgrade.\nServer admins can use premium features for the entire server.',
      }
    )
    .setTimestamp()
    .setFooter({ text: 'WhaleAlert Pro' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}