const discord = require("discord.js");
const settings = require("../../settings.json");
const logErr = require("../../errorLogger.js");

module.exports.cmdNames = [
  "help",
  "hlp",
  "?"
]

module.exports.args = {

}

module.exports.info = {
  description: "This command gives help about other commands.",
  textName: "command"
}

module.exports.run = async function (message, args, client, botCmd) {
  //if user is not in DM
  if (message.channel.type !== "dm") {
    message.reply("Sending help in DM.").catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
  }

  //if text is empty or only spaces give command list
  if (args.text.length === 0 || args.text.search(/^ +$/gi) !== -1) { //check if is empty or only contains spaces
    let defaultHelp = `To run a command in any server, use \`@${client.user.username}#${client.user.discriminator} command\` or \`${settings.prefix} command\`. For example, \`@${client.user.username}#${client.user.discriminator} help\`.
To run a command in this DM, simply use \`command\` with no prefix.

Use help <command> to view detailed information about a specific command.
Use help without arguments to get a list of commands.

**NOTE**: using a command in the comment of an attached file will run the command and the convert the attached images.
If you only want to convert the images you can just mention \`@${client.user.username}#${client.user.discriminator}\` or type \`${settings.prefix}\`
`
    let listHeader = "AVAIABLE COMMANDS:"
    let list = getCmdList(botCmd);
    message.author.send([defaultHelp, listHeader, list], { split: true }).catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
    return;
  }

  //if user specifies a command
  /* STUFF mostly COPY-PASTED FROM main.js (functions in particular) */

  //call getCmd() funct
  let gotCmd = getCmd(botCmd, args.text);

  //give error if command is not found
  if (gotCmd.category === "notFound" || gotCmd.command === "notFound") {
    message.reply("Error: command not found.\nUse `help` to get a list of all the commands").catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
    return;
  }
  //get syntax
  let syntax = getSyntax(botCmd[gotCmd.category][gotCmd.command], gotCmd.command);
  //get aliases
  let aliases = "**Aliases:** " + botCmd[gotCmd.category][gotCmd.command].cmdNames;
  let note = botCmd[gotCmd.category][gotCmd.command].info.hasOwnProperty("note") ? "**NOTE**:" + botCmd[gotCmd.category][gotCmd.command].info.note : "";
  let toSend = [`__**COMMAND:**: ${gotCmd.command}__\n`, syntax, aliases + "\n", note];
  message.author.send(toSend, { split: true }).catch((err) => {
    //ignore permission errors
    if (err.code === 50013 || err.message === "Missing Permissions") return;
    //log the error
    console.error(err);
    logErr(err);
  });
}

function getSyntax(command, commandName) {
  //if the object has no options, don't return them
  if (Object.keys(command.args).length === 0 && command.args.constructor === Object) {
    let stringStart = `**Syntax:** \`${commandName} ${command.info.hasOwnProperty("textName") ? `<${command.info.textName}>` : ""}\``
    return stringStart;
  }
  let stringStart = `**Syntax:** \`${commandName} ${command.info.hasOwnProperty("textName") ? `<${command.info.textName}>` : ""} [options]\``
  //do stuff, get options and return string
  let options = "";
  //for each option
  for (var i in command.args) {
    if (command.args.hasOwnProperty(i)) {
      let currentOption = command.args[i];
      //inser option name
      options = options + `*${i}:* `;
      //for each name:
      currentOption.names.forEach((currentName) => {
        options = options + `[-${currentName}],`
      });
      //insert option help and make new line
      options = options + `\n  ${currentOption.help}\n`; //2 spaces for indentation
    }
  }
  return stringStart + "\n" + "**Options:**\n" + options;
}

function getCmdList(botCmd) {
  let list = "";

  //for each category
  for (var i in botCmd) {
    if (botCmd.hasOwnProperty(i)) {
      var category = botCmd[i];
      list = list + `**__${i}__**\n`;

      //for each command
      for (var z in category) {
        if (category.hasOwnProperty(z)) {
          var command = category[z];
          list = list + `  -${z}\n`; //2 spaces for indentation
        }
      }

    }
  }
  return list;
}

function getCmd(botCmd, foundCmdName) {
  //for each category
  for (var i in botCmd) {
    if (botCmd.hasOwnProperty(i)) {
      var category = botCmd[i];

      //for each command
      for (var z in category) {
        if (category.hasOwnProperty(z)) {
          var command = category[z];

          //for each alias
          for (var x = 0; x < command.cmdNames.length; x++) {
            var currentName = command.cmdNames[x];

            if (foundCmdName.toLowerCase() === currentName) {
              return {
                category: i,
                command: z
              }
            }

          }

        }
      }

    }
  }

  return {
    category: "notFound",
    command: "notFound"
  }
} 