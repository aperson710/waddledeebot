const fs = require("fs");
const path = require("path");
const ms = require("ms");
const { EmbedBuilder } = require("discord.js");
const { LN2, log2 } = require("mathjs");
const { Emojis } = require("../mods");

let data = {};
try {
  data = JSON.parse(fs.readFileSync("users.json"));
} catch (err) {
  fs.writeFileSync("users.json", JSON.stringify(data));
}

function saveProfiles() {
  fs.writeFile("users.json", JSON.stringify(data, null, 4), (err) => {
    if (err) console.error("Error saving data to JSON file:", err);
  });
}

function getProfile(userId) {
  return data[userId] || null;
}

function getProfileSet() {
  return data || null;
}

function isOnCooldown(userId, commandName, cooldownTime) {
  const profile = getProfile(userId);

  if (!profile.cooldowns) {
    // If no cooldown data exists for the user, create a new cooldown data object
    profile.cooldowns = {};
  }

  const now = Date.now();
  const cmd = profile.cooldowns[commandName];

  if (cmd && cmd > now) {
    const remainingTime = cmd - now;
    const expiryTimestamp = Math.round((now + remainingTime) / 1000); // Convert milliseconds to seconds
    return `<t:${expiryTimestamp}:R>`; // Format as Discord timestamp
  } else {
    // User is not on cooldown, update cooldown data
    profile.cooldowns[commandName] = now + ms(cooldownTime); // Parse human-readable time to milliseconds
    saveData();
    return false;
  }
}

function createProfile(userId, username, globalName) {
  if (!data[userId]) {
    data[userId] = {
      userinfo: {
        id: userId,
        username: username,
        globalName: globalName,
      },
      currencies: {
        cash: 100,
        gems: 0,
      },
      plus: {
        active: true,
      },
      multiplier: 1,
      effects: [],
      rank: {
        level: 0,
        xp: 0,
        rxp: 100,
        allxp: 0,
      },
      cooldowns: {
        work: Date.now() - ms("30s"),
        beg: Date.now() - ms("30s"),
        crime: Date.now() - ms("30s"),
      },
      inventory: [],
    };
    saveProfiles();
    const now = new Date();
    const formattedDate = now.toLocaleString();
    console.log(
      `users.json update | ${formattedDate} | A profile for ${username} (${userId}) was created`
    );
    return true;
  } else {
    return false;
  }
}

const getLeaderboardPosition = (userId) => {
  // Step 1: Fetch the user objects
  const userObjects = getProfileSet(); // Replace with your actual function to get the data

  // Step 2: Convert the userObjects into an array and sort by level (descending)
  const usersArray = Object.entries(userObjects)
    .filter(([key, value]) => value.rank.allxp > 0) // Filter out unranked users
    .map(([id, userData]) => ({
      id,
      name: userData.userinfo.username,
      lvl: userData.rank.level,
      xp: userData.rank.xp,
      rxp: userData.rank.rxp,
      allxp: userData.rank.allxp,
    }))
    .sort((a, b) => b.lvl - a.lvl);

  // Step 3: Find the user's rank
  const user = usersArray.find((user) => user.id === userId);

  if (!user) {
    return {
      rank: "Unranked",
      data: null,
    };
  }

  const userRankIndex = usersArray.findIndex((u) => u.id === userId);
  const userRank = userRankIndex + 1;

  // Step 4: Return the user's rank and data
  return {
    rank: userRank,
    data: user,
  };
};

function awardAchievement(userId, achievementName) {}

function profileOnCooldown(userId, commandName, cooldownTime) {
  let profile = getProfile(userId);

  const now = Date.now();
  if (!profile.cooldowns[commandName]) {
    profile.cooldowns[commandName] = 0;
    saveProfiles();
  }
  const cmd = profile.cooldowns[commandName];

  if (cmd && cmd > now) {
    const remainingTime = cmd - now;
    const expiryTimestamp = Math.round((now + remainingTime) / 1000); // Convert milliseconds to seconds
    return `<t:${expiryTimestamp}:R>`; // Format as Discord timestamp
  } else {
    // User is not on cooldown, update cooldown data
    profile.cooldowns[commandName] = now + ms(cooldownTime); // Parse human-readable time to milliseconds
    saveProfiles();
    return false;
  }
}

async function addXP(interaction, value) {
  let profile = getProfile(interaction.user.id);

  if (profile.plus.active) {
    profile.rank.xp += Math.round(value * 1.5);
    profile.rank.allxp += Math.round(value * 1.5);
  } else {
    profile.rank.xp += value;
    profile.rank.allxp += value * 1.5;
  }

  let levelInfo = {
    leveled: false,
    initialLevel: profile.rank.level,
    finalLevel: profile.rank.level,
    cash: 0,
    gems: 0,
  };

  while (profile.rank.xp > profile.rank.rxp) {
    profile.rank.level += 1;
    profile.rank.xp -= profile.rank.rxp;
    profile.rank.rxp += 100;

    levelInfo.leveled = true;
    levelInfo.finalLevel += 1;
    levelInfo.gems += 10 * profile.rank.level;
    levelInfo.cash += 100 * profile.rank.level;
  }

  saveProfiles();

  if (levelInfo.leveled) {
    try {
      await interaction.user.send(
        `${Emojis.info} | Hey there, your level increased from **${levelInfo.initialLevel}** to **${levelInfo.finalLevel}**! Nice. \n As a reward, have:\n💵 ${levelInfo.cash} Cash\n💎 ${levelInfo.gems} Gems\n\nHappy grinding!\n\n-# If you'd like to disable DMs related to level ups, run "/settings", pick Level up DMs, and then hit Disable.`
      );
    } catch (error) {
      return;
    }
  }
}

let itemsList = [
  {
    name: "Ethereum",
    desc: "Ethereum is a decentralized blockchain with smart contract functionality. Ether/ETH is the native cryptocurrency of the platform. Among cryptocurrencies, ether is second only to bitcoin in market capitalization. It is open-source software.\n\nBut in this economy, using an ETH will grant you $2000",
    type: "Consumable",
    emoji: Emojis.Items.Ethereum,
    quantity: 1,
    grants: [{ type: "Currency", currency: "cash", value: 2000 }],
    grantMessage: "You gained :dollar: 2000 from the ETH."
  },
];

let achievementsList = [
  {
    name: `Welcome`,
    desc: `Use the bot`,
    acquired: 0,
    rewardsString: `500 Coins`,
    rewards: [
      {
        type: "Currency",
        cname: "coins",
        value: 500,
      },
    ],
  },
  {
    name: `Out of the Box`,
    desc: `Escape prison sucessfully`,
    acquired: 0,
    rewardsString: `1 Escape Tool, 200 Coupons`,
    rewards: [
      {
        type: "Currency",
        cname: "coupons",
        value: 200,
      },
      {
        type: "Item",
        name: "Escape Tool",
        quantity: 1,
      },
    ],
  },
];

function addItemToInventory(userId, item) {
  let profile = getProfile(userId);

  let selectedItem = itemsList.find((obj) => obj.name === item);

  if (!selectedItem) return false;

  let itemInInventory = profile.inventory.find((obj) => obj.name === item);
  if (itemInInventory) {
    itemInInventory.quantity += 1;
  } else {
    profile.inventory.push(selectedItem);
  }

  saveProfiles();
  return true;
}

function getRandomNumber(x, y) {
  const range = y - x + 1;
  const randomNumber = Math.floor(Math.random() * range);
  return randomNumber + x;
}

module.exports = {
  saveProfiles,
  getProfile,
  createProfile,
  getProfileSet,
  profileOnCooldown,
  addXP,
  getLeaderboardPosition,
  getRandomNumber,
  itemsList,
  addItemToInventory,
};
