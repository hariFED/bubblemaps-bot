
> ⚠️ **Note:** Unfortunately, there might be situations where the bot is not hosted online. In such cases, we kindly request you to run the bot locally by following the instructions below.

# 💬 Bubblemaps Telegram Bot

Watch a full demo of the Bubblemaps Token Analyzer Bot on YouTube:

[![Watch on YouTube](https://img.youtube.com/vi/rjYZFnBdVp4/0.jpg)](https://youtu.be/rjYZFnBdVp4)

A beautifully crafted Telegram bot that delivers insightful token visualizations directly to your chat. Powered by Bubblemaps API, it allows users to send any supported token contract address and instantly receive:

- 📊 Key token metrics (name, symbol, chain, supply)
- 🧠 Decentralization score
- 👤 Top holders (by wallet name)
- 🖼️ A screenshot of the token’s bubble map
- 🔗 A clickable link to explore the live bubble map

---

## 🌟 Features

✅ Supports all Bubblemaps-compatible chains  
✅ Automatically detects chain from CA  
✅ Captures dynamic bubble map using Puppeteer  
✅ Stylish inline buttons and markdown messages  
✅ Friendly error handling with community support link  
✅ Validates address length before processing

---

## 🚀 Tech Stack

- **Node.js** - Core runtime
- **Telegram Bot API** - User interface
- **Puppeteer** - Dynamic screenshot of Bubblemaps
- **dotenv** - Secure environment variables
- **Bubblemaps API** - Token & holder insights

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hariFED/bubblemaps-telegram-bot.git
cd bubblemaps-telegram-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory and add:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

> Replace `your_telegram_bot_token` with the one from [BotFather](https://t.me/BotFather).

---

## 🛠️ Run Locally

```bash
node bot.js
```

Your bot will start polling and respond to valid 40-64 character token contract addresses.

---

## ✉️ How to Use the Bot

1. Open your bot on Telegram.
2. Paste a 40-64 character contract address (EVM-compatible).
3. The bot will:
   - Detect the blockchain
   - Fetch token data
   - Send a screenshot of the bubble map
   - List top holders
   - Provide a clickable link to Bubblemaps

---

## ❗ Error Handling

If the address is incorrect or unsupported, the bot will notify the user:

```
❗ Please give me the correct CA to find you the fortune 🪙🔮
```

Or:

```
🚫 Oops! Couldn't find the contract.
Check if your CA is correct and supported by Bubblemaps.
Need help? Reach out to our team: @Bubblemaps_BD
```

---

## 💬 Support

Telegram Community: [@Bubblemaps_BD](https://t.me/Bubblemaps_BD)
