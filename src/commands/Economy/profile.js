const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
const {
  getProfile,
  getLeaderboardPosition,
} = require("../../data/profilesControl");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View someone's profile")
    .addSubcommand((cmd) =>
      cmd
        .setName("balance")
        .setDescription("View a member's balance.")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription(
              "User to check balance of. Leave blank to select yourself."
            )
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("rank")
        .setDescription("View a member's rank.")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription(
              "User to check rank of. Leave blank to select yourself."
            )
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("view")
        .setDescription("View a member's profile.")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("User to check. Leave blank to select yourself.")
        )
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user") || interaction.user;
    let profile = getProfile(user.id);

    if (sub === "balance") {
      const embed = new EmbedBuilder()
        .setTitle(`${user.globalName}'s balance`)
        .setDescription(
          `\n💵 Cash: ${profile.currencies.cash}\n\n💎 Gems: ${profile.currencies.gems}`
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } else if (sub === "rank") {
      let pos = getLeaderboardPosition(user.id);
      const embed = new EmbedBuilder()
        .setTitle(`${user.globalName}'s rank`)
        .setDescription(
          pos.rank === "Unranked"
            ? "User is not in the leaderboard"
            : `Leaderboard Position: ${pos.rank}`
        )
        .addFields(
          {
            name: `Level`,
            value: `${profile.rank.level}`,
          },
          {
            name: `XP`,
            value: `${profile.rank.xp} / ${profile.rank.rxp}`,
          },
          {
            name: `Total XP`,
            value: `${profile.rank.allxp}`,
          }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } else {
      let pos = getLeaderboardPosition(user.id);
      const embed = new EmbedBuilder()
        .setTitle(`${user.globalName} (${user.username})`)
        .setDescription(
          pos.rank === "Unranked"
            ? "User is not in the leaderboard"
            : `Leaderboard Position: ${pos.rank}`
        )
        .addFields(
          {
            name: `Level: ${profile.rank.level}`,
            value: `Total XP: ${profile.rank.allxp} `,
          },
          {
            name: `XP to next level:`,
            value: `${profile.rank.xp} / ${profile.rank.rxp}`,
          },
          {
            name: "💵 Cash",
            value: `${profile.currencies.cash}`,
          },
          {
            name: ":gem: Gems",
            value: `${profile.currencies.gems}`,
          }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    }
  },
};
