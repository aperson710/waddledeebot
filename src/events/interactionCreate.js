const {
    Interaction,
    EmbedBuilder
  } = require("discord.js");
  const { getSettings } = require("../data/settingsManager");
  const {
    createProfile,
    getProfile,
    profileOnCooldown,
    saveProfiles,
  } = require("../data/profilesControl");
  const { check } = require("prettier");
  const { Emojis } = require("../mods");
  
  module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {

      let settings = getSettings();
      createProfile(interaction.user.id, interaction.user.username, interaction.user.username);
      let profile = getProfile(interaction.user.id);
  
      profile.userinfo.globalName = interaction.user.globalName
      profile.userinfo.username = interaction.user.username
  
      // This code will check whether the interaction is not a slash command. If not, it'll execute logic for buttons/select menus such as /help, battles etc.
      if (!interaction.isChatInputCommand()) {
        if (interaction.customId === "commands-list") {
          // This code will execute if the interaction is from the /help select menu. The ".values" is the option selected.
          if (interaction.values[0] === "help") {
            interaction.reply({ ephemeral: true, content: `${Emojis.info} **/help**\n\nView a list of commands available in this bot`})
          } else if (interaction.values[0] === "info") {
            interaction.reply({ ephemeral: true, content: `${Emojis.info} **/info**\n\nView information about this bot.`})
          }
        }
      }

      // If not a slash command return
      if (!interaction.isCommand()) return;
  
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
  
      // Blacklist Check
      const isBlacklisted = settings.blacklist.find(
        (obj) => obj.user === interaction.user.id
      );
  
      if (isBlacklisted) {
        return interaction.reply({
          content: `Sorry, but you're blacklisted from using this bot. The reason why is: ${isBlacklisted.reason}`,
          ephemeral: true,
        });
      }
      // Permission Handling
  
      if (interaction.guild) {
        const missingPermissions = [];
  
        const botMember = interaction.guild.members.cache.get(client.user.id);
  
        // Iterate over the list of required permissions and check if the bot has them
        if (command.botperms) {
          command.botperms.forEach((permission) => {
            if (!botMember.permissions.has(permission)) {
              // If the bot doesn't have the permission, add it to the missingPermissions list
              missingPermissions.push(permission);
            }
          });
  
          // If there are missing permissions, notify
          if (missingPermissions.length > 0) {
            const missingPermsNames = missingPermissions
              .map((perm) => PermissionsBitField.Flags[perm])
              .join(", ");
            interaction.reply({
              content: `${Emojis.question} | Hey there, to use this command, I need the following permissions: ${missingPermsNames}. \n If you're the server owner or one of the server admins, try checking the bot's role permissions, or just enable the Administrator permission. Make sure to check the channel's permissions too.`,
              ephemeral: true,
            });
          }
        }
      }
  
      // Cooldown handling
      if (command.cooldown) {
        const cd = profileOnCooldown(
          interaction.user.id,
          interaction.commandName,
          command.cooldown
        );
  
        if (cd) {
          return interaction.reply({
            content: `This command is on cooldown, it can be retried ${cd}`,
            ephemeral: true,
          });
        }
      }
  
      // Check if dev only command
      if (
        command.perms === "dev" &&
        interaction.user.id !== "968526814664343602"
      ) {
        return interaction.reply({
          content: `${Emojis.question} | Sorry, but only the bot developer can use this command.`,
          ephemeral: true,
        });
      }
  
      for (let i = profile.effects.length - 1; i >= 0; i--) {
        if (profile.effects[i].endsAt < Date.now()) {
          profile.effects.splice(i, 1); // Remove the item
        }
      }
      saveProfiles();
  
  
      // Attempt to execute
      try {
        const now = new Date();
        const formattedDate = now.toLocaleString();
        console.log(
          `Command Used Logs | ${formattedDate} | User ${interaction.user.globalName} (${interaction.user.username}) used ${interaction.commandName}`
        );
        await command.execute(interaction, client);
      } catch (error) {
        console.log(error);
        await interaction.reply({
          content: `${Emojis.info} | Hey there, an error occured while running the command, and it has not been executed yet. You may want to try again later.`,
          ephemeral: true,
        });
      }
    },
  };
  