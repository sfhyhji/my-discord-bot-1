import discord
from discord.ext import commands

# إعداد البوت مع الصلاحيات اللازمة
intents = discord.Intents.default()
intents.guilds = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.command()
async def ticket(ctx):
    # إنشاء قناة جديدة باسم المستخدم
    guild = ctx.guild
    ticket_channel = await guild.create_text_channel(f'ticket-{ctx.author.name}')
    
    # رسالة تأكيد
    await ctx.send(f"تم فتح التذكرة بنجاح في: {ticket_channel.mention}")
    await ticket_channel.send(f"مرحباً {ctx.author.mention}، كيف يمكننا مساعدتك؟")

client.login(process.env.TOKEN).catch(err => {
  console.error("❌ فشل تسجيل الدخول: " + err.message);
});



