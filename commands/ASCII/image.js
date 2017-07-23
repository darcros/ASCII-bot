const discord = require("discord.js");
const imageToAscii = require("image-to-ascii");
const isUrl = require("is-url");
const logErr = require("../../errorLogger.js");

module.exports.cmdNames = [
  "image",
  "img"
]

module.exports.args = {
  reverse: {
    names: ["reverse", "rev", "r", "negative", "neg"],
    needsValue: false,
    help: "Creates a negative image effect."
  }
}

module.exports.info = {
  description: "This command generates ASCII art from images.",
  textName: "URL"
}

module.exports.run = async function (message, args, client) {
  console.log(args);
  //check URL before rendering
  if (args.text.length === 0 || args.text.search(/^ +$/gi) !== -1) { //check if is empty or only contains spaces
    message.reply("Please specify an url.\nUse `help image` to get help about syntax and options.").catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
    return;
  } else if (!isUrl(args.text)) { //check if is url
    message.reply(`\`${args.text}\` is not an URL (remember to write \`https://\`/\`http://\`). Use \`help image\` to get help about syntax and options.`).catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
    return;
  }
  
  imageToAscii(args.text, {
    pxWidth: 2,
    size: {
      heigth: "100%"
      //the width is computed to keep aspect ratio
    },
    size_options: {
      screen_size: {
        width: 22,
        heigth: 22
      }
    },
    preserve_aspect_ratio: true,
    fit_screen: true,
    colored: false,
    reverse: args.reverse !== undefined ? !args.reverse : true
  }, (err, rendered) => {
    if (err) {
      //if there is no rendered then the URL was not a valid iamge
    if (rendered === undefined) {
      message.reply("An error occured, either because the image format is not supported or because you used a redirect/shortened link.\n The supported formats are: `.jpg`/`.jpeg`, `.png`").catch((err) => {
        //ignore permission errors
        if (err.code === 50013 || err.message === "Missing Permissions") return;
        //log the error
        console.error(err);
        logErr(err);
      });
      return;
    }
      console.error(err);
      logErr(err);
    }

    //if rendered is too big
    if (rendered.length > 2000) {
      message.channel.send("This image is too big so it has been split in more messages.").catch((err) => {
        //ignore permission errors
        if (err.code === 50013 || err.message === "Missing Permissions") return;
        //log the error
        console.error(err);
        logErr(err);
      });
    }
    message.channel.send(rendered, {
      split: true,
      code: true
    }).catch((err) => {
      //ignore permission errors
      if (err.code === 50013 || err.message === "Missing Permissions") return;
      //log the error
      console.error(err);
      logErr(err);
    });
  });
}