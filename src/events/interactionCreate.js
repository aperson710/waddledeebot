const { Interaction, EmbedBuilder } = require("discord.js");
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
    createProfile(
      interaction.user.id,
      interaction.user.username,
      interaction.user.username
    );
    let profile = getProfile(interaction.user.id);

    profile.userinfo.globalName = interaction.user.globalName;
    profile.userinfo.username = interaction.user.username;

    // This code will check whether the interaction is not a slash command. If not, it'll execute logic for buttons/select menus such as /help, battles etc.
    if (!interaction.isChatInputCommand()) {
      if (interaction.customId === "commands-list") {
        // This code will execute if the interaction is from the /help select menu. The ".values" is the option selected.
        if (interaction.values[0] === "help") {
          interaction.reply({
            ephemeral: true,
            content: `${Emojis.info} **/help**\n\nView a list of commands available in this bot`,
          });
        } else if (interaction.values[0] === "info") {
          interaction.reply({
            ephemeral: true,
            content: `${Emojis.info} **/info**\n\nView information about this bot.`,
          });
        } else if (interaction.values[0] === "profile") {
          interaction.reply({
            ephemeral: true,
            content: `${Emojis.info} **/profile**\n\nView a user's profile. Has 3 subcommands:\n\n**/profile balance** > View a user's balance\n**/profile rank** > View a user's level and XP, and their position in the leaderboard\n**/profile view** > View a user's entire profile, including both their balance and rank.`,
          });
        } else if (interaction.values[0] === "work") {
          interaction.reply({
            ephemeral: true,
            content: `${Emojis.info} **/work**\n\nWork a shift to get some money. \n\nCooldown: 45s \n\n${Emojis.warning} Cannot be executed while in prison.`,
          });
        } else if (interaction.values[0] === "crime") {
          interaction.reply({
            ephemeral: true,
            content: `${Emojis.info} **/crime**\n\nCommit theoretical crimes in attempt to get higher withdrawals but with risk.\n\n${Emojis.warning} This command has a chance to give you the **Prison** effect, preventing you from running most commands. There are several ways to escape this however \n\nCooldown: 90s\n\n${Emojis.warning} Cannot be executed while in prison.`,
          });
        } else if (interaction.values[0] === "beg") {
          interaction.reply({
            ephemeral: true,
            content: `${Emojis.info} **/beg**\n\nBeg to attempt getting a short amount of money with a lower cooldown. \n\nCooldown: 20s \n\n${Emojis.warning} Cannot be executed while in prison.`,
          });
        }
      }

      if (interaction.customId === "pay-bail") {
        let prisonEffect = profile.effects.find((obj) => obj.type === "Prison");
        if (!prisonEffect) {
          return interaction.reply({
            content: `You're not in prison currently.`,
            ephemeral: true,
          });
        }
        let bailCost = prisonEffect.bailCost;
        if (profile.currencies.cash >= bailCost) {
          profile.currencies.cash -= bailCost;
          let prisonEffectIndex = profile.effects.findIndex(
            (obj) => obj.type === "Prison"
          );
          profile.effects.splice(prisonEffectIndex, 1);
          saveProfiles();
          interaction.reply({
            content: `Successfully paid the bail! :dollar: ${bailCost} has been debited from your account.`,
            ephemeral: true
          });
        } else {
          interaction.reply({
            content: `Your bail costs :dollar: ${bailCost}, you only have :dollar: ${profile.currencies.cash}.`,
            ephemeral: true,
          });
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

    let inPrison = profile.effects.find((obj) => obj.type === "Prison");
    if (command.mustNotBeJailed && inPrison) {
      const bailButton = new ButtonBuilder()
        .setLabel("Pay the bail")
        .setEmoji("🚪")
        .setCustomId("pay-bail")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(bailButton);

      return interaction.reply({
        content: `You're in prison, you can't execute this command. You'll be released <t:${Math.round(inPrison.endsAt / 1000)}:R>, or you can pay ${inPrison.bailCost} to be let out.`,
        components: [row],
        ephemeral: true,
      });
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
