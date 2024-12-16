const { createCode, useCode } = require("../data/settingsManager");
const {
  getProfile,
  saveProfiles,
  createProfile,
  getProfileSet,
} = require("../data/profilesControl");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!message.author.bot) {
    }

    let profiles = getProfileSet();

    if (message.webhookId) {
      return;
    }

    if (
      message.content.includes(
        "https://cdn.discordapp.com/attachments/839555436440584192/1273356992806653972/british-speech-bubble-union-jack-speech-bubble.png?ex=66be519c&is=66bd001c&hm=9b7c4e67f013332af69d1cd0412b3e0ffc87ccf8171028583aae607a415ae451&"
      )
    ) {
      message.delete();
    }

    if (message.content.includes("Alex Salty")) {
      message.channel.send(
        "https://tenor.com/view/alex-marmot-screaming-squirrel-name-gif-16020589"
      );
      message.channel.send(
        "https://tenor.com/view/so-salty-salt-bae-bitter-jealous-angry-gif-17584364"
      );
    }

    if (message.content === "wd!new monthCode") {
      const key = createCode("plus", "Monthly");
      message.reply(
        `A new code for 1 month access for Plus, Early Access has been created. The key is: \n ${key} \n It has one use, so give it out wisely.`
      );
    }

    if (message.content === "wd!new unlimited") {
      const key = createCode("plus", "Unlimited");
      message.reply(
        `A new code for full unlmited access of Plus has been created. The key is: \n ${key} \n It has one use, so give it out wisely.`
      );
    }

    if (message.content === "wd!new ProfileBundle") {
      const key = createCode("profilecurrency", "Bundle 1");
      message.reply(
        `A new code for Profile Currencies: Bundle 1 has been created. The key is: \n ${key} \n It has one use, so give it out wisely.`
      );
    }

    if (message.content === "wd!clear usedPromotions") {
      // Iterate over the profiles, picking out each individual "profile" object
      Object.values(profiles).forEach((obj) => {
        // Access and modify the usedPromotions property
        obj.usedPromotions = [];
      });

      message.reply(`Cleared all used codes and promotions for all users.`);
    }

    if (message.content.startsWith("wd!clearcds")) {
      const commandArgs = message.content.split(" ");
      if (commandArgs.length !== 3) {
        return message.reply(
          "Invalid command format. Use: `wd!clearcds <user mention or user ID> <command name>`"
        );
      }

      const target = commandArgs[1]; // User mention or ID
      const cmd = commandArgs[2];

      if (message.mentions.users.size > 0) {
        user = message.mentions.users.first(); // Get the first mentioned user
      } else {
        try {
          user = await client.users.fetch(target); // Try to fetch the user by ID
        } catch (error) {
          return message.reply(
            "Invalid user mention or ID. Please provide a valid user."
          );
        }
      }

      let profile = getProfile(user.id);

      if (cmd === "all") {
        profile.cooldowns.work = Date.now()
        profile.cooldowns.beg = Date.now()
        profile.cooldowns.crime = Date.now()
        saveProfiles()
        message.reply(`Reset all cooldowns for ${user}`)
      } else {
        profile.cooldowns[cmd] = Date.now()
        saveProfiles()
        message.reply(`Reset cooldown for "${cmd}" for ${user}`)
      }


    }

    if (message.content.startsWith("wd!setcurrency")) {
      // Get the arguments after the command
      const commandArgs = message.content.split(" ");

      // Validate that we have at least 4 arguments (command, user mention or ID, currency name, value)
      if (commandArgs.length !== 4) {
        return message.reply(
          "Invalid command format. Use: `wd!setcurrency <user mention or user ID> <currency name> <value>`"
        );
      }

      const target = commandArgs[1]; // User mention or ID
      const currencyName = commandArgs[2]; // Currency name
      const value = parseInt(commandArgs[3], 10); // Currency value to increment

      // Check if the value is a valid number
      if (isNaN(value)) {
        return message.reply(
          "Invalid value. Please provide a valid number for the currency value."
        );
      }

      // Try to get the user by ID or mention
      let user;
      if (message.mentions.users.size > 0) {
        user = message.mentions.users.first(); // Get the first mentioned user
      } else {
        try {
          user = await client.users.fetch(target); // Try to fetch the user by ID
        } catch (error) {
          return message.reply(
            "Invalid user mention or ID. Please provide a valid user."
          );
        }
      }

      if (!user) {
        return message.reply(
          "Could not find the user. Please provide a valid user mention or ID."
        );
      }

      let profile = getProfile(user.id);

      console.log(profile.currencies);

      // Validate if the currency exists in the profile
      if (!profile.currencies[currencyName]) {
        profile.currencies[currencyName] = 0; // Initialize the currency with 0
      }

      // Increment the currency value
      profile.currencies[currencyName] = value;

      saveProfiles();

      message.reply(
        `${user.username} has been given ${value} ${currencyName}. Their new balance is ${profile.currencies[currencyName]}.`
      );
    }
  },
};
