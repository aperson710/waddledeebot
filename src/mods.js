const { EmbedBuilder } = require("discord.js")

const Emojis = {
  yes: "<:yes:1314660982978777099>",
  no: "<:no:1314660999705661481>",
  question: "<:question:1314661019322421288>",
  warning: "<:warning:1314661054952767538>",
  info: "<:info:1314661035818352672>",
};

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // All possible letters
  let result = "";
  for (let i = 0; i < length; i++) {
    // Append a random character from the characters string
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getRandomNumber(x, y) {
  const range = y - x + 1;
  const randomNumber = Math.floor(Math.random() * range);
  return randomNumber + x;
}

const helpMenuEmbeds = [
  { name: "help", embed: new EmbedBuilder()}
]

module.exports = { Emojis, generateRandomString, getRandomNumber };
