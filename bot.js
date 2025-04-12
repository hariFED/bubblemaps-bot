require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const { fetchTokenData } = require('./utils/fetchTokenData');
const path = require('path');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Capture screenshot of the iframe URL using Puppeteer
async function captureIframeScreenshot(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Wait for 4-5 seconds before taking the screenshot
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.screenshot({ path: 'screenshot.png' });
    await browser.close();
}

// Send the screenshot to Telegram
async function sendIframeScreenshot(chatId, tokenInfo, contractAddress) {
    const iframeUrl = `https://app.bubblemaps.io/${tokenInfo.chain}/token/${contractAddress}?small_text&hide_context`;
    await captureIframeScreenshot(iframeUrl);

    // Send image to Telegram
    await bot.sendPhoto(chatId, path.join(__dirname, 'screenshot.png'), {
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

// Handle contract address input
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const input = msg.text?.trim();

    // Check if input is exactly 40 characters
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

            const bubbleMapLink = `https://bubblemaps.io?chain=${tokenInfo.chain}&token=${input}`;

            await bot.sendMessage(chatId, `
🎯 *BubbleMap Deep Dive Complete!*

📜 *Contract Address:-*
\`${input}\`

🧬 *Chain:* \`${tokenInfo.chain.toUpperCase()}\`
🏷️ *Token:* *${tokenInfo.name || 'N/A'}*  (${tokenInfo.symbol || 'N/A'})
📦 *Max Supply:* \`${tokenInfo.maxsupply || 'N/A'}\`
🧠 *Decentralization Score:* \`${tokenInfo.decentralizationScore || 'N/A'}\`
                **Identified Supply in CEXs:** \`${tokenInfo.percentcexs || 'N/A'}\`
                **Identified Supply in Contracts:** \`${tokenInfo.percentcontracts || 'N/A'}\`
    
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


