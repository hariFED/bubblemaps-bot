const cloudinary = require('./cloudinary');
const streamifier = require('streamifier');
require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const { fetchTokenData } = require('./utils/fetchTokenData');
const path = require('path');

// Express setup
const app = express();
const PORT = process.env.PORT || 3000;

// Telegram bot using polling (not webhook)


// Puppeteer screenshot
async function captureIframeScreenshotAndUpload(url) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1280, height: 720 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    const buffer = await page.screenshot(); // No file system
    await browser.close();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'bubblemaps_bot',
                public_id: `screenshot-${Date.now()}`,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url); // Cloudinary image URL
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

// Send screenshot with inline button
async function sendIframeScreenshot(chatId, tokenInfo, contractAddress) {
    const iframeUrl = `https://app.bubblemaps.io/${tokenInfo.chain}/token/${contractAddress}?small_text&hide_context`;
    const screenshotUrl = await captureIframeScreenshotAndUpload(iframeUrl);

    await bot.sendPhoto(chatId, screenshotUrl, {
        caption: '🫧 BubbleMap Preview',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🔎 View Full Bubble Map',
                        url: `https://app.bubblemaps.io/${tokenInfo.chain}/token/${contractAddress}?theme=themename&loading_color=ffffff`,
                    },
                ],
            ],
        },
    });
}


if (process.env.ENABLE_BOT === 'true') {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    // bot logic goes here

    // /start handler
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, `
👋 *Welcome to the Bubblemaps Token Analyzer Bot!*

This bot lets you:
• 🧠 Analyze any EVM-compatible token
• 🔎 Visualize top holders on a Bubble Map
• 📊 Review decentralization metrics

To get started:
👉 Just *send a contract address (CA)* — 40 to 64 hex characters.

👉 Example: *0x1234567890abcdef1234567890abcdef12345678*
    `, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
        });
    });

    // Catch all messages
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const input = msg.text?.trim();

        if (input === '/start') return;

        if (input && /^[a-zA-Z0-9]{40,64}$/.test(input)) {
            try {
                await bot.sendAnimation(chatId, 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3RycXFlOHlvbG1nbWdodWM0b3d2MWNqMnpqeG85bWd5bHZqZnJscSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HdkzWcDvoRmLmkrWOt/giphy.gif', {
                    caption: '🔍 Scanning blockchain… Please wait!',
                });

                const tokenInfo = await fetchTokenData(input);

                const topHolders = tokenInfo.topHolders
                    ?.map((h) => `👤 *${h.name}*`)
                    .join('\n') || 'No holder data found.';

                await sendIframeScreenshot(chatId, tokenInfo, input);

                await bot.sendMessage(chatId, `
🎯 *BubbleMap Deep Dive Complete!*

📜 *Contract Address:* \`${input}\`
🧬 *Chain:* \`${tokenInfo.chain.toUpperCase()}\`
🏷️ *Token:* *${tokenInfo.name || 'N/A'}*  (${tokenInfo.symbol || 'N/A'})
📦 *Max Supply:* \`${tokenInfo.maxsupply || 'N/A'}\`
🧠 *Decentralization Score:* \`${tokenInfo.decentralizationScore || 'N/A'}\`
🔄 *Supply in CEXs:* \`${tokenInfo.percentcexs || 'N/A'}\`
ℹ *Supply in Contracts:* \`${tokenInfo.percentcontracts || 'N/A'}\`

🏆 *Top Holders*:
${topHolders}
            `, { parse_mode: 'Markdown' });

                await bot.sendMessage(chatId, "😊 If you're happy with the result, please provide the next contract address. Time is ticking! ⏳", {
                    parse_mode: "Markdown"
                });

            } catch (err) {
                console.error(err);
                await bot.sendMessage(chatId, `
🚫 *Oops! Couldn't find the contract.*

🔍 Please check if the contract address is correct.

📌 This bot supports:
• Chains available on *Bubblemaps*
• Contracts with historical data only

💬 Need help? Reach out here: [@Bubblemaps_BD](https://t.me/Bubblemaps_BD)
            `, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
            }
        } else {
            await bot.sendMessage(chatId, "❗ Please give me the correct *CA* to find you the fortune 🪙🔮", {
                parse_mode: "Markdown"
            });
        }
    });
}
// Health check route for Render
app.get('/', (req, res) => {
    res.send('🟢 Bot is alive!');
});

// Start Express server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
