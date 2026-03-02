# 🐋 WhaleAlert Pro

A professional Discord bot for tracking crypto whale movements and blockchain transactions. Get instant alerts when large token transfers happen.

[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Features

### Free Tier
- 🔭 Watch up to 3 tokens per server
- 🔔 Whale alerts with configurable thresholds
- ⏱️ 2-minute alert delay
- 🌐 Ethereum mainnet support
- 📊 Recent alert history

### Premium Tier ($10/month)
- 💎 Unlimited token watches
- ⚡ Instant alerts (< 30 seconds)
- 🔗 Multi-chain support (ETH, BSC, SOL)
- 🏷️ Whale wallet labels
- 🤖 Smart pattern detection
- 📡 Custom alert channels
- 🔌 API access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Discord Bot Token ([Get one here](https://discord.com/developers/applications))
- Etherscan API Key ([Get one here](https://etherscan.io/apis))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/realmpastai-web/whalealert-pro.git
cd whalealert-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Build and run**
```bash
npm run build
npm start
```

### Docker Deployment (Recommended)

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📋 Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/watch [token] [threshold]` | Start monitoring a token | Manage Server |
| `/unwatch [token]` | Stop monitoring a token | Manage Server |
| `/watches` | List all monitored tokens | Everyone |
| `/recent [limit]` | Show recent whale alerts | Everyone |
| `/help` | Show help information | Everyone |
| `/premium` | Show premium features | Everyone |

## 🎯 Usage Example

1. Find a token contract address on [Etherscan](https://etherscan.io)
2. Run `/watch 0x...` in your Discord server
3. The bot will monitor for whale transactions
4. Get alerts like this:

![Whale Alert Example](docs/alert-example.png)

## 🏗️ Architecture

```
whalealert-pro/
├── src/
│   ├── commands/        # Slash command handlers
│   ├── services/        # Blockchain APIs & monitoring
│   ├── database/        # SQLite database
│   ├── utils/           # Helpers & logging
│   ├── config.ts        # Configuration
│   └── index.ts         # Entry point
├── data/               # SQLite database files
├── logs/               # Application logs
├── docker-compose.yml  # Docker deployment
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | Yes |
| `DISCORD_CLIENT_ID` | Discord application ID | Yes |
| `ETHERSCAN_API_KEY` | Etherscan API key | Yes |
| `DEFAULT_ALERT_THRESHOLD` | Minimum USD value (default: 100000) | No |
| `CHECK_INTERVAL_SECONDS` | Polling interval (default: 60) | No |

## 💰 Monetization

This bot uses a **freemium** model:

- **Free**: Basic whale tracking for small communities
- **Premium**: $10/month per server for advanced features
- **Enterprise**: Custom pricing for large communities

Payment processing via:
- Instamojo (India)
- Cryptocurrency (Global)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/realmpastai-web/whalealert-pro)
- [Discord Support Server](https://discord.gg/whalealert)
- [Documentation](https://docs.whalealert.pro)

---

Built with ❤️ by [QuantBitRealm](https://github.com/realmpastai-web)