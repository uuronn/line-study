"use strict";

const express = require("express");
require("dotenv").config();
const cheerio = require("cheerio");
const url =
  "https://www.lego.com/ja-jp?ef_id=Cj0KCQjwi46iBhDyARIsAE3nVrZOK0KMfSoe-IHb48lbxV37mS0Rm1R9LIkagog3tX3ZjjP6vf3xz08aAlnBEALw_wcB:G:s&s_kwcid=AL!12577!3!610610898868!e!!g!!%E3%83%AC%E3%82%B4!13613106899!121781482297&cmp=KAC-INI-GOOGJP-GO-JP-JA-RE-PS-BUY-CREATE-MASTERBRAND-SHOP-BC-EX-WV-PURE_BRAND";
const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 3000;
const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};
const titles_arr = [];

try {
  (async () => {
    const res = await fetch(url);
    const body = await res.text();

    const $ = cheerio.load(body);

    $("li").each((i, elem) => {
      titles_arr[i] = $(elem).text();
    });
  })();
} catch (e) {
  console.log(e);
}

const app = express();

app.get("/", (req, res) => res.send("Hello LINE BOT!(GET)")); //ブラウザ確認用(無くても問題ない)
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) => {
    res.json(result);
    console.log("test", result);
  });
});

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  let replyText = "";
  if (event.message.text === "こんにちは") {
    replyText = "こんばんわの時間ですよ";
  } else {
    replyText = "うざ";
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text:
      url +
      "\n⬆︎のurlから適当にスクレイピング\n" +
      titles_arr.map((item) => item), //実際に返信の言葉を入れる箇所
  });
}

process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
console.log(`Server running at ${PORT}`);
