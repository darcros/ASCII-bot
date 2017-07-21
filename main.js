//modules and files
const discord = require("discord.js");
const requireDir = require('require-dir');
const botCmd = requireDir("./commands", { recurse: true });
const parseOptions = require("./parser.js");
const updateServerCount = require("./serverCount.js");
const settings = require("./settings.json");
const tokens = require("./tokens.json");

console.log("registerd commands:\n", botCmd);

//new client
const client = new discord.Client
client.login(tokens.discord);

//events
client
  .on("error", (err) => {
    console.error(err);
  })
  .on("warn", console.warn)
  .on("debug", console.log)
  .on("ready", () => {
    console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
    client.user.setGame(`ASCII help`);
    //updates server count on startup
    updateServerCount(client.guilds.size, client.user.id);
  })
  .on("disconnect", () => { console.warn("Disconnected!"); })
  .on("reconnecting", () => { console.warn("Reconnecting..."); })
  .on("guildCreate", (guild) => {
    console.log(`ASCII bot has been added to the guild ${guild.name}`);
    updateServerCount(client.guilds.size, client.user.id);
  })
  .on("guildDelete", (guild) => {
    console.log(`ASCII bot has been removed from the guild ${guild.name}`);
    updateServerCount(client.guilds.size, client.user.id);
  })
  .on("message", (message) => {
    //ignore bots (and itself)
    if (message.author.bot) return;

    //check if message is a botCmd
    let isCmd = cmdTest(message, message.content);
    if (!isCmd.isCmd) return;

    let alreadyRan = false;
    //check if message has attached images
    if (message.attachments.size > 0) {
      message.attachments.forEach((attachment) => {
        //if the attachment is an image
        if (!attachment.width || !attachment.height) return;
        alreadyRan = true;
        //if the attachment is in a supported format
        if (attachment.url.endsWith(".jpg") || attachment.url.endsWith(".jpeg") || attachment.url.endsWith(".png")) {
          console.log("running ASCII:image directly");
          botCmd.ASCII.image.run(message, {text: attachment.url}, client);
        } else {
          message.reply(`File: \`${attachment.filename}\`; \`${attachment.filename.split(".").last()}\` is not a supported format`).catch((err) => {
            //ignore permission errors
            if (err.code === 50013 || err.message === "Missing Permissions") return;
            //log the error
            console.error(err);
            logErr(err);
          });
        }
      });
    }

    //get args for getCmd() funct
    let strNoPrefix = message.content.substring(isCmd.cutfrom); //this could be moved in getName()
    let foundCmdName = getName(strNoPrefix);
    //if there is no command
    if (foundCmdName === undefined) {
      if (alreadyRan) return;
      message.reply("Please specify a command.\nUse `help` to get a list of all the commands.").catch((err) => {
        //ignore permission errors
        if (err.code === 50013 || err.message === "Missing Permissions") return;
        //log the error
        console.error(err);
      });
      return;
    }

    //call getCmd() funct
    let gotCmd = getCmd(botCmd, foundCmdName);

    //give error if command is not found
    if (gotCmd.category === "notFound" || gotCmd.command === "notFound") {
      if (alreadyRan) return;
      message.reply("Error: command not found.\nUse `help` to get a list of all the commands.").catch((err) => {
        //ignore permission errors
        if (err.code === 50013 || err.message === "Missing Permissions") return;
        //log the error
        console.error(err);
      });
      return;
    }

    //parse arguments
    let strNoCmd = strNoPrefix.substring(strNoPrefix.indexOf(foundCmdName) + foundCmdName.length + 1); //to fix: +1 will break if there are more spaces 
    console.log(`parsing arguments for ${gotCmd.category}:${gotCmd.command}`);
    let args = parseOptions(strNoCmd, botCmd[gotCmd.category][gotCmd.command].args);

    //call the Cmd
    console.log(`running ${gotCmd.category}:${gotCmd.command}`);
    //if the command is help it also needs the botCmd obj
    if (gotCmd.category === "util" && gotCmd.command === "help") {
      botCmd[gotCmd.category][gotCmd.command].run(message, args, client, botCmd);
      return;
    }
    botCmd[gotCmd.category][gotCmd.command].run(message, args, client);

  });

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


function getName(strNoPrefix) {
  let split = strNoPrefix.split(" ");
  //delete white space
  split = split.filter((str) => {
    return /\S/.test(str);
  });
  return split[0];
}


function cmdTest(message, msgContent) {
  const cmdRegex = new RegExp(`^(${settings.prefix}|<@${client.user.id}>)`, "i");
  //if message is from dm it's certainly a command
  if (message.channel.type === "dm") {
    //if message ha prefix handle like regular command
    if (cmdRegex.test(msgContent)) {
      let isCmd = cmdRegex.test(msgContent);
      let match = cmdRegex.exec(msgContent);
      let cutfrom = isCmd ? match.index + match[0].length : undefined;
      return {
        isCmd: isCmd,
        cutfrom: cutfrom
      }
      //if hasn't got prefix cut from 0 to avoid cutting arguments
    } else {
      return {
        isCmd: true,
        cutfrom: 0
      }
    }
    //if message is from server, check if it's command and return
  } else {
    let isCmd = cmdRegex.test(msgContent);
    //bug to fix (status: probably fixed): tries to give values even if there isn't a match
    let match = cmdRegex.exec(msgContent);
    let cutfrom = isCmd ? match.index + match[0].length : undefined;
    return {
      isCmd: isCmd,
      cutfrom: cutfrom
    }
  }
}

//adds .last method to array
Array.prototype.last = function () {
  return this[this.length - 1];
};