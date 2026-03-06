
const http = require('http');

http.createServer((req, res) => {
  res.write("I am alive!");
  res.end();
}).listen(process.env.PORT || 8080);

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


client.login(process.env.TOKEN);

