const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const PREFIX = "!"; // يمكنك تغييره حسب رغبتك

client.once('ready', () => {
    console.log(`✅ البوت جاهز وسجل دخوله باسم: ${client.user.tag}`);
});

// 1. أمر إرسال لوحة التذاكر
client.on('messageCreate', async (message) => {
    if (message.content === `${PREFIX}setup` && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        
        const embed = new EmbedBuilder()
            .setTitle('مركز الدعم الفني 🎫')
            .setDescription('إذا كنت بحاجة إلى مساعدة، اضغط على الزر أدناه لفتح تذكرة جديدة.')
            .setColor('#2F3136')
            .setFooter({ text: 'نظام التذاكر الاحترافي' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket')
                    .setLabel('فتح تذكرة')
                    .setEmoji('📩')
                    .setStyle(ButtonStyle.Primary),
            );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// 2. معالجة الضغط على الزر
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        const guild = interaction.guild;
        const user = interaction.user;

        // التحقق مما إذا كان للمستخدم تذكرة مفتوحة بالفعل (اختياري)
        const channelName = `ticket-${user.username}`.toLowerCase();
        
        // إنشاء القناة
        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id, // منع الجميع من رؤية القناة
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: user.id, // السماح لصاحب التذكرة بالرؤية والكتابة
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
                // أضف رتبة الإدارة هنا (استبدل STAFF_ROLE_ID برقم رتبة الإدارة)
                 {
                    id: '1479311780780970146',
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                } 
            ],
        });

        // رسالة الترحيب داخل التذكرة مع زر الإغلاق
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('تذكرة جديدة')
            .setDescription(`مرحباً ${user}، فريق الدعم سيتواصل معك قريباً.\nاضغط على الزر أدناه لإغلاق التذكرة.`)
            .setColor('#5865F2');

        const closeRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('إغلاق التذكرة')
                    .setStyle(ButtonStyle.Danger),
            );

        await ticketChannel.send({ embeds: [welcomeEmbed], components: [closeRow] });
        await interaction.reply({ content: `تم فتح تذكرتك بنجاح: ${ticketChannel}`, ephemeral: true });
    }

    // زر الإغلاق
    if (interaction.customId === 'close_ticket') {
        await interaction.reply('سيتم إغلاق التذكرة خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});
;

client.login(process.env.TOKEN).catch(err => {
  console.error("❌ فشل تسجيل الدخول: " + err.message);
});





