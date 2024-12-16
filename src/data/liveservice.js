const fs = require("fs");
const path = require("path");
const ms = require("ms");
const { EmbedBuilder } = require("discord.js");
const { LN2, log2 } = require("mathjs");

let data = {};
try {
  data = JSON.parse(fs.readFileSync("live.json"));
} catch (err) {
  fs.writeFileSync("live.json", JSON.stringify(data));
}

function uploadData() {
  fs.writeFile("live.json", JSON.stringify(data, null, 4), (err) => {
    if (err) console.error("Error saving data to JSON file:", err);
  });
}

function getDatabase() {
    return data || null;
}

function getSection(name) {
    return data[name] || null
}

module.exports = { uploadData, getDatabase, getSection }