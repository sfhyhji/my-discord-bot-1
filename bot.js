const http = require('http');

// هذا الجزء مخصص لإرضاء منصة Render ومنعها من إغلاق البوت
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is Alive!');
}).listen(process.env.PORT || 3000, () => {
    console.log('✅ Web Server is running for Render port binding.');
});

const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const http = require('http');

// 1. تشغيل سيرفر ويب بسيط لحل مشكلة استضافة Render
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is Alive and Running!');
}).listen(process.env.PORT || 3000);

// 2. إعداد البوت والصلاحيات
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = "!"; // يمكنك تغيير البريفكس هنا
const STAFF_ROLE_ID = "ضع_هنا_ID_رتبة_الادارة"; // هام جداً لكي ترى الإدارة التذاكر

client.once('ready', () => {
    console.log(`✅ سجل الدخول بنجاح باسم: ${client.user.tag}`);
});

// 3. أمر إعداد لوحة التذاكر (!setup)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content === `${PREFIX}setup`) {
        // التأكد أن الشخص الذي يكتب الأمر لديه صلاحيات أدمن
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const setupEmbed = new EmbedBuilder()
            .setTitle('مركز الدعم الفني | Support Center 🎫')
            .setDescription('للحصول على مساعدة، يرجى الضغط على الزر أدناه لفتح تذكرة جديدة.')
            .setColor('#2b2d31')
            .setFooter({ text: 'نظام حماية وإدارة التذاكر' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('فتح تذكرة / Open Ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Success)
        );

        await message.channel.send({ embeds: [setupEmbed], components: [row] });
    }
});

// 4. نظام التعامل مع الأزرار (فتح وإغلاق التذكرة)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // حالة فتح تذكرة جديدة
    if (interaction.customId === 'open_ticket') {
        const user = interaction.user;
        const guild = interaction.guild;

        // إنشاء القناة تحت اسم المستخدم وضبط الصلاحيات
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id, // إخفاء القناة عن الجميع
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: user.id, // إظهارها لصاحب التذكرة
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
                {
                    id: STAFF_ROLE_ID, // إظهارها لفريق الدعم
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
            ],
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle('تذكرة دعم فني')
            .setDescription(`أهلاً بك ${user}، من فضلك اشرح مشكلتك هنا وسيقوم فريق الدعم بالرد عليك.\nلإغلاق التذكرة اضغط على الزر أدناه.`)
            .setColor('#5865f2');

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒')
        );

        await ticketChannel.send({ content: `${user} | <@&${STAFF_ROLE_ID}>`, embeds: [welcomeEmbed], components: [closeRow] });
        await interaction.reply({ content: `✅ تم إنشاء تذكرتك بنجاح: ${ticketChannel}`, ephemeral: true });
    }

    // حالة إغلاق التذكرة
    if (interaction.customId === 'close_ticket') {
        await interaction.reply({ content: 'سيتم إغلاق وحذف التذكرة خلال 5 ثوانٍ...' });
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

// 5. تسجيل الدخول باستخدام التوكن من Environment Variables
client.login(process.env.TOKEN);


