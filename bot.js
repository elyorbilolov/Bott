require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Bot tokenini .env faylidan olish
const token = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

// Bot yaratish
const bot = new TelegramBot(token, { polling: true });

// Xabar turini aniqlash
function getMessageType(msg) {
    if (msg.text) return { type: 'text', content: msg.text };
    if (msg.photo) return { type: 'photo', content: msg.caption || 'Rasm' };
    if (msg.video) return { type: 'video', content: msg.caption || 'Video' };
    if (msg.voice) return { type: 'voice', content: msg.caption || 'Ovozli xabar' };
    if (msg.document) return { type: 'document', content: msg.caption || 'Fayl' };
    if (msg.sticker) return { type: 'sticker', content: 'Sticker' };
    if (msg.animation) return { type: 'animation', content: msg.caption || 'GIF' };
    if (msg.contact) return { type: 'contact', content: 'Kontakt' };
    if (msg.location) return { type: 'location', content: 'Lokatsiya' };
    if (msg.new_chat_members) return { type: 'new_member', content: 'Guruhga yangi a\'zo qo\'shildi' };
    if (msg.left_chat_member) return { type: 'left_member', content: 'Guruhdan a\'zo chiqib ketdi' };
    if (msg.new_chat_title) return { type: 'new_title', content: 'Guruh nomi o\'zgartirildi' };
    if (msg.new_chat_photo) return { type: 'new_photo', content: 'Guruh rasmi o\'zgartirildi' };
    if (msg.delete_chat_photo) return { type: 'delete_photo', content: 'Guruh rasmi o\'chirildi' };
    if (msg.group_chat_created) return { type: 'group_created', content: 'Guruh yaratildi' };
    return { type: 'unknown', content: 'Noma\'lum turdagi xabar' };
}

// /start komandasi uchun handler
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
        bot.sendMessage(chatId, 'Assalomu alaykum! Menga xabar yuboring, men uni admin ga yetkazaman.');
    }
});

// Oddiy xabarlarni qayta ishlash
bot.on('message', async (msg) => {
    if (msg.chat.type === 'private') {
        const messageInfo = getMessageType(msg);
        const userId = msg.from.id;
        const username = msg.from.username ? `@${msg.from.username}` : 'username yo\'q';
        const firstName = msg.from.first_name || '';
        const lastName = msg.from.last_name || '';
        
        // Admin uchun xabar matni
        const adminMessage = `Yangi xabar:
Kimdan: ${firstName} ${lastName} (${username})
ID: ${userId}
Xabar turi: ${messageInfo.type}
Matn: ${messageInfo.content}`;
        
        try {
            await bot.forwardMessage(ADMIN_ID, msg.chat.id, msg.message_id);
            await bot.sendMessage(ADMIN_ID, adminMessage);
            await bot.sendMessage(msg.chat.id, "✅ Xabaringiz adminga yetkazildi!");
        } catch (error) {
            await bot.sendMessage(msg.chat.id, "❌ Xabar yuborishda xatolik yuz berdi.");
        }
    }
});

// Admin javobini foydalanuvchiga yuborish
bot.on('message', async (msg) => {
    if (msg.chat.id.toString() === ADMIN_ID && msg.reply_to_message) {
        try {
            const originalMessage = msg.reply_to_message;
            if (originalMessage.forward_from) {
                const userId = originalMessage.forward_from.id;
                await bot.sendMessage(userId, msg.text || "Admin javob yubordi");
                await bot.sendMessage(ADMIN_ID, "✅ Javob yuborildi!");
            }
        } catch (error) {
            await bot.sendMessage(ADMIN_ID, "❌ Javob yuborishda xatolik yuz berdi.");
        }
    }
});

// Xatoliklarni ushlab qolish
bot.on('polling_error', (error) => {
    console.error('Polling xatolik:', error);
});

console.log('Bot ishga tushdi...');
