const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { LN2, log2 } = require("mathjs");

let data = {};
try {
  data = JSON.parse(fs.readFileSync("settings.json"));
} catch (err) {
  fs.writeFileSync("settings.json", JSON.stringify(data));
}

function getRandomNumber(x, y) {
  const range = y - x + 1;
  const randomNumber = Math.floor(Math.random() * range);
  return randomNumber + x;
}

function saveSettings() {
  fs.writeFile("settings.json", JSON.stringify(data, null, 4), (err) => {
    if (err) console.error("Error saving data to JSON file:", err);
  });
}

function getSettings() {
  return data || null;
}

function createCode(codeFor, variant) {
  let code
  if (codeFor === "plus" && variant === "Unlimited") {
    code = {
      key: generateRandomString(getRandomNumber(10, 30)),
      rewards: "Plus",
      validityType: "Unlimited",
      membershipType: "Member",
      uses: 1,
      unlimited: false,
    };
  }
  if (codeFor === "plus" && variant === "Monthly") {
    code = {
      key: generateRandomString(getRandomNumber(10, 30)),
      rewards: "Plus",
      validityType: "Monthly",
      membershipType: "Member",
      uses: 1,
      unlimited: false,
    };
  }
  if (codeFor === "profilecurrency" && variant === "Bundle 1") {
    code = {
      key: generateRandomString(getRandomNumber(10, 30)),
      rewards: "Plus",
      uses: 1,
      unlimited: false,
      cash: 2500,
      gems: 100
    }; 
  }
  
  data.codes.push(code);
  saveSettings();

  const now = new Date();
  const formattedDate = now.toLocaleString();
  console.log(
    `Code Generation| ${formattedDate} | A key for ${codeFor} of variant ${variant} has been created. The key is ${code.key}`
  );

  return code.key;
}

function useCode(key) {
  let code = data.codes.find((obj) => obj.key === key);
  
  if (!code) {
    return { success: false };
  }

  if (!code.unlimted) {
    code.uses -= 1;
  }

  if (code.uses < 1 && !code.unlimited) {
    let codeIndex = data.codes.findIndex((obj) => obj.key === key);
    data.codes.splice(codeIndex, 1);
  }

  if (code.rewards === "Plus") {
    const validityType = code.validityType;
    const membershipType = code.membershipType;

    saveSettings()
    return { type: "Plus", validityType, membershipType, success: true };
  }

  if (code.rewards === "Profile Currency") {
    const cash = code.cash || null
    const coupons = code.coupons || null
    const gems = code.gems || null

    return { type: "Profile Currency", cash, coupons, gems, success: true}
  }

  
}

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

module.exports = {
  saveSettings,
  getSettings,
  createCode,
  useCode,
};
