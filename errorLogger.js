fs = require("fs");

module.exports = function logErr(toLog) {
  console.log("Writing error to log...")
  fs.appendFile("errors.log", `${new Date()}\n ${toLog}\n\n`, (err) => {
    if (err) {
      console.error("An error occured while logging:\n", err);
      return;
    }
    console.log("Error logged.");
  });
}