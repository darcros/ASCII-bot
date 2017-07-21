const request = require("superagent");
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
  console.log("Updating server counts...");
  //for each botlist
  for (let listName in lists) {
    let list = lists[listName];
    //put the botID in the token
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
    console.log("Server count update finished.");
  }
}