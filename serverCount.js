const request = require("superagent");
const settings = require("./settings.json");
const logErr = require("./errorLogger.js");
const tokens = require("./tokens.json");

let lists = {
  "bots.discord.pw": {
    url: "https://bots.discord.pw/api/bots/:id/stats",
    token: tokens["bots.discord.pw"]
  },
  "discordbots.org": {
    url: "https://discordbots.org/api/bots/:id/stats",
    token: tokens["discordbots.org"]
  }
}

module.exports = function updateServerCounts(count, id) {
  if (!settings.updateServerCounts) {
    console.log("Server count update is disabled in the setting");
    return;
  }
  console.log("Updating server counts...");
  //for each botlist
  for (let listName in lists) {
    let list = lists[listName];
    if (list.token !== ("" && undefined)) {
      //put the botID in the url
      let url = list.url.replace(":id", id);
      //post the server count
      request.post(url)
        .set('Authorization', list.token)
        .send({ server_count: count })
        .end((err, res) => {
          if (err) {
            console.error(`Could not update ${listName}`, err);
            logErr(err);
            return;
          }
          console.log("Response:", res.body);
          console.log(`Server count on ${listName} updated.`)
        });
    } else {
      console.error(`No token for ${listName}`);
    }
  }
  console.log("Server count update finished.");
}