const discord = require("discord.js");
const figlet = require("figlet");
const logErr = require("../../errorLogger.js");

module.exports.cmdNames = [
  "text",
  "txt",
  "figlet"
]

module.exports.args = {
  list: {
    names: ["list", "ls"],
    needsValue: false,
    help: "Gives font list."
  },
  font: {
    names: ["font", "f", "typeface"],
    needsValue: true,
    help: "Sets the font to use."
  },
  kerning: {
    names: ["kerning", "k", "orizontalLayou"],
    needsValue: true,
    help: "sets the kerning to use."
  }
}

module.exports.info = {
  description: "This command generates ASCII art from text using FIGlet.",
  textName: "text"
}

module.exports.run = async function (message, args, client) {
  console.log(args);
  //is kerning valid?
  if (args.hasOwnProperty("kerning")) {
    //check if kerning is valid
    let kerningCheck = checkKerning(args);
    if (kerningCheck[0] === false) {
      message.reply([
        `\`${args.kerning}\` is not a valid kerning option.`,
        `The possible options are \`${kerningCheck[1]}\``,
        `Using \`default\` for this time`
      ]).catch((err) => {
        //ignore permission errors
        if (err.code === 50013 || err.message === "Missing Permissions") return;
        //log the error
        console.error(err);
        logErr(err);
      });
      args.kerning = "default"
    }
  }

  //if user wants list
  if (args.list) {
    //if user is not in DM tell him that messages will be sent there
    if (message.channel.type !== "dm") {
      message.reply("Sending you the font list").catch((err) => {
        //ignore permission errors
        if (err.code === 50013 || err.message === "Missing Permissions") return;
        //log the error
        console.error(err);
        logErr(err);
      });
    }
    //change the text to "FONTS:", this way te font ank kerning will be transferred to the list header
    args.text = "FONTS:";
    //get the header
    renderText(args, (errRender, rendered) => {
      if (errRender) {
        switch (errRender) {
          case errRender.errno === -4058 || err.code === "ENOENT":
            message.reply(`\`${args.font}\` is not a valid font. For a list of all the fonts use \`text -ls\``).catch((err) => {
              //ignore permission errors
              if (err.code === 50013 || err.message === "Missing Permissions") return;
              //log the error
              console.error(err);
              logErr(err);
            });
            rendered = "Font list:"
            break;

          default:
            message.reply("An unknown error happened while rendering the list header, this has been reported to the developer and will be fixed as soon as possible.").catch((err) => {
              //ignore permission errors
              if (err.code === 50013 || err.message === "Missing Permissions") return;
              //log the error
              console.error(err);
              logErr(err);
            });
            rendered = "Font list:"
            break;
        }
      }
      message.author.send(rendered).catch((err) => {
        //ignore permission errors
        if (err.code === 50013 || err.message === "Missing Permissions") return;
        //log the error
        console.error(err);
        logErr(err);
      });
      //get the fonts
      figlet.fonts((err, fonts) => {
        if (err) {
          console.error(err);
          logErr(err);
          message.reply("An unknown error happened while getting the font list, this has been reported to the developer and will be fixed as soon as possible.").catch((err) => {
            //ignore permission errors
            if (err.code === 50013 || err.message === "Missing Permissions") return;
            //log the error
            console.error(err);
            logErr(err);
          });
          return;
        }
        message.author.send(fonts, { split: true }).catch((err) => {
          //ignore permission errors
          if (err.code === 50013 || err.message === "Missing Permissions") return;
          //log the error
          console.error(err);
          logErr(err);
        });
      });
    });
    return;
  }

  //if user wants text

  //is the  message empty or only spaces?
  if (args.text.length === 0 || args.text.search(/^ +$/gi) !== -1) {
    message.reply("Please enter some text").catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
    return;
  }
  //render text
  renderText(args, (err, rendered) => {
    if (err) {
      console.error(err);
      logErr(err);
      switch (err) {
        case err.errno === -4058 || err.code === "ENOENT":
          message.reply(`\`${args.font}\` is not a valid font. For a list of fonts use \`text -ls\``).catch((err) => {
            //ignore permission errors
            if (err.code === 50013 || err.message === "Missing Permissions") return;
            //log the error
            console.error(err);
            logErr(err);
          });
          return;

        default:
          message.reply("An unknown error happened, this has been reported to the developer and will be fixed as soon as possible.").catch((err) => {
            //ignore permission errors
            if (err.code === 50013 || err.message === "Missing Permissions") return;
            //log the error
            console.error(err);
            logErr(err);
          });
          return;
      }
    }
    if (rendered.length > 2000) {
      message.channel.send("The output is longer than 2000 characters and Discord won't allow messages that long.\nAnyways it would have never fitted the screen, so try splitting your message across more commands.").catch((err) => {
        //ignore permission errors
        if (err.code === 50013 || err.message === "Missing Permissions") return;
        //log the error
        console.error(err);
        logErr(err);
      });
    }
    message.channel.send(rendered).catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
  });

}

function checkKerning(args) {
  let possibleKernings = ["default", "full", "fitted", "controlled smushing", "universal smushing"];
  for (var i = 0; i < possibleKernings.length; i++) {
    if (possibleKernings[i] === args.kerning) {
      return true;
    }
  }
  return [false, possibleKernings];
}

function renderText(args, callback) {
  figlet.text(args.text, {
    font: args.hasOwnProperty("font") ? args.font : "Standard",
    orizontalLayout: args.hasOwnProperty("kerning") ? args.kerning : "default"
  }, (err, rendered) => {
    callback(err, "```" + rendered + "```");
  });
}
