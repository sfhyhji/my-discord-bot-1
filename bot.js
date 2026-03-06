const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log("البوت اشتغل!");
});

client.on("messageCreate", message => {
  if (message.content === "ping") {
    message.reply("pong 🏓");
  }
});

client.login("MTIzNTI1MTQyMTczODMwMzU5OA.GX6h5b.bXSu8OCrQD803oLoTP_m2O-ox-VIInPl2l3PGU");