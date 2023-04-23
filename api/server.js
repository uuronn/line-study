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

    // console.log("正常かどうか", res.ok);
    // console.log("body:", body);
    // console.log("$ｄｄｄ:", $("p"));

    $("li").each((i, elem) => {
      // console.log("elm", elem);

      //'m_unit'クラス内のh3タグ内要素に対して処理実行
      titles_arr[i] = $(elem).text(); //配列にタイトルを挿入していく

      // console.log("titles_araaar", titles_arr[i]);
    });
  })();
} catch (e) {
  console.log(e);
}

// request(url, (e, response, body) => {
//   if (e) {
//     console.error(e);
//   }
//   try {
//     const $ = cheerio.load(body); //bodyの読み込み
//     // console.log("body: ", body);
//     // const $p = $("li");
//     console.log("test", $);
//     $("li").each((i, elem) => {
//       // console.log("elm", elem);

//       //'m_unit'クラス内のh3タグ内要素に対して処理実行
//       titles_arr[i] = $(elem).text(); //配列にタイトルを挿入していく

//       // console.log("titles_arr", titles_arr[2]);
//     });
//   } catch (e) {
//     console.error(e);
//   }
// });

const isMidi = (i, link) => {
  // Return false if there is no href attribute.
  if (typeof link.attribs.href === "undefined") {
    return false;
  }

  return link.attribs.href.includes(".mid");
};

const app = express();

app.get("/", (req, res) => res.send("Hello LINE BOT!(GET)")); //ブラウザ確認用(無くても問題ない)
app.post("/webhook", line.middleware(config), (req, res) => {
  console.log("ああああ", req.body.events[0].message.text);

  //ここのif分はdeveloper consoleの"接続確認"用なので削除して問題ないです。
  if (
    req.body.events[0].replyToken === "00000000000000000000000000000000" &&
    req.body.events[1].replyToken === "ffffffffffffffffffffffffffffffff"
  ) {
    res.send("Hello LINE BOT!(POST)");
    console.log("疎通確認用");
    return;
  }

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

  console.log(event);

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

// app.listen(PORT);
// console.log(`Server running at ${PORT}`);

process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
console.log(`Server running at ${PORT}`);
