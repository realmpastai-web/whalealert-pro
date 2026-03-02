import dotenv from 'dotenv';
dotenv.config();

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN || '',
    clientId: process.env.DISCORD_CLIENT_ID || '',
  },
  apis: {
    etherscan: process.env.ETHERSCAN_API_KEY || '',
    bscscan: process.env.BSCSCAN_API_KEY || '',
    solscan: process.env.SOLSCAN_API_KEY || '',
  },
  bot: {
    defaultThreshold: parseInt(process.env.DEFAULT_ALERT_THRESHOLD || '100000'),
    checkIntervalSeconds: parseInt(process.env.CHECK_INTERVAL_SECONDS || '60'),
    maxFreeWatches: parseInt(process.env.MAX_FREE_WATCHES || '3'),
    premiumAlertDelay: parseInt(process.env.PREMIUM_ALERT_DELAY_SECONDS || '30'),
    freeAlertDelay: parseInt(process.env.FREE_ALERT_DELAY_SECONDS || '120'),
  },
  database: {
    path: process.env.DATABASE_PATH || './data/whalealert.db',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;