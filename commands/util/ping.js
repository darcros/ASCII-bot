const discord = require("discord.js");
const logErr = require("../../errorLogger.js");

module.exports.cmdNames = [
  "ping",
  "pong",
  "latency"
]

module.exports.args = {

}

module.exports.info = {
  description: "This command is just to know if the bot is working."
}

module.exports.run = async function (message, args, client) {
  message.reply(`
Last ping: \`${client.pings[0]}\`ms
Average ping: \`${client.ping}\`ms
`).catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
}