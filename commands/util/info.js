const discord = require("discord.js");
const logErr = require("../../errorLogger.js");

module.exports.cmdNames = [
  "info",
  "information",
  "add",
  "invite",
  "support"
]

module.exports.args = {

}

module.exports.info = {
  description: "Gives info about the bot."
}

function getUptime(client) {
  let timestamp = client.uptime
  var date = new Date(timestamp);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  return `${hours - 1}h ${minutes}min ${seconds}sec`
}

module.exports.run = async function (message, args, client) {
  message.reply(`
Uptime:\`${getUptime(client)}\`
Servers:\`${client.guilds.size}\`
Invite ${client.user.username} to your server: <https://goo.gl/KT4Zrk>
Join the ${client.user.username} support server: <https://discord.gg/nE3uaSW>
`).catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
}