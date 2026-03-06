const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const http = require('http');

// --- 1. إرضاء منصة RENDER (فتح منفذ PORT) ---
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is Alive!');
}).listen(process.env.PORT || 3000, () => {
    console.log('✅ Web Server for Render is active.');
});

// --- 2. إعداد البوت مع الصلاحيات (Intents) ---
// تأكد من تفعيل MESSAGE CONTENT من صفحة المطورين لكي يعمل هذا الجزء
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// --- 3. الإعدادات الأساسية ---
const PREFIX = "!"; 
const STAFF_ROLE_ID = "ضع_هنا_ID_رتبة_الادارة"; // استبدل هذا الرقم بـ ID الرتبة التي ترى التذاكر

client.once('ready', () => {
    console.log(`🚀 تم تشغيل البوت! الاسم: ${client.user.tag}`);
    console.log(`📌 تأكد من تفعيل Message Content Intent من Discord Developer Portal`);
});

// --- 4. أمر الإعداد (!setup) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // طباعة الرسائل في الـ Logs للتأكد من أن البوت "يرى" الكلام
    console.log(`[Message] ${message.author.tag}: ${message.content}`);

    if (message.content === `${PREFIX}setup`) {
        // التحقق من صلاحياتك أنت كمدير
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ هذا الأمر للمديرين فقط!");
        }

        const setupEmbed = new EmbedBuilder()
            .setTitle('مركز الدعم الفني 🎫')
            .setDescription('لفتح تذكرة جديدة للحصول على مساعدة، اضغط على الزر أدناه.')
            .setColor('#2F3136')
            .setTimestamp()
            .setFooter({ text: 'Ticket Support System' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('فتح تذكرة')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Success)
        );

        try {
            await message.channel.send({ embeds: [setupEmbed], components: [row] });
            console.log("✅ تم إرسال لوحة التذاكر بنجاح.");
        } catch (error) {
            console.error("❌ فشل إرسال اللوحة: ", error);
        }
    }
});

// --- 5. نظام التعامل مع الأزرار (فتح وإغلاق) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        const guild = interaction.guild;
        const user = interaction.user;

        // منع فتح أكثر من تذكرة لنفس المستخدم (اختياري)
        const existingChannel = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase()}`);
        if (existingChannel) {
            return interaction.reply({ content: `لديك تذكرة مفتوحة بالفعل: ${existingChannel}`, ephemeral: true });
        }

        try {
            // إنشاء قناة التذكرة
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id, // إخفاء عن الجميع
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id, // العضو يرى القناة
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: STAFF_ROLE_ID, // الإدارة ترى القناة
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                ],
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle('دعم فني جديد')
                .setDescription(`مرحباً ${user}، تفضل بطرح مشكلتك وسيرد عليك الفريق المختص قريباً.`)
                .setColor('#5865F2');

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('إغلاق التذكرة')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `${user} | <@&${STAFF_ROLE_ID}>`, embeds: [welcomeEmbed], components: [closeRow] });
            await interaction.reply({ content: `✅ تم فتح تذكرتك بنجاح: ${ticketChannel}`, ephemeral: true });

        } catch (error) {
            console.error("❌ خطأ أثناء إنشاء التذكرة: ", error);
            await interaction.reply({ content: "حدث خطأ أثناء محاولة فتح التذكرة.", ephemeral: true });
        }
    }

    // زر الإغلاق
    if (interaction.customId === 'close_ticket') {
        await interaction.reply('🛡️ سيتم حذف التذكرة نهائياً خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// --- 6. تسجيل الدخول ---
client.login(process.env.TOKEN);


