const {
    SlashCommandBuilder,
    ButtonBuilder,
    ComponentType,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonStyle,
  } = require("discord.js");
  const { getProfileSet, getLeaderboardPosition } = require("../../data/profilesControl");
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("leaderboard")
      .setDescription("View leaderboards throughout the economy."),

    async execute(interaction, client) {
      const userObjects = getProfileSet(); // Fetch user data
      console.log(userObjects)

      if (!userObjects) {
        return interaction.reply({ content: `There is no one in the rankings.`})
      }
  
      const usersArray = Object.entries(userObjects)
        .filter(([key, value]) => key !== "e" && value.rank.allxp > 0) // Exclude unranked users
        .map(([id, userData]) => ({
          id,
          gname: userData.userinfo.globalName,
          name: userData.userinfo.username,
          allxp: userData.rank.allxp,
          xp: userData.rank.xp,
          rxp: userData.rank.rxp,
          lvl: userData.rank.level,
        }))
        .sort((a, b) => b.value - a.value); // Sort descending by value (either xp or coins)
  
      const pageSize = 10; // Items per page
      let currentPage = 0; // Initial page
      const totalPages = Math.ceil(usersArray.length / pageSize);
  
      const generateLeaderboardEmbed = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const leaderboardPage = usersArray.slice(start, end);
  
        const userId = interaction.user.id;
        const { rank, data } = getLeaderboardPosition(userId);
  
        const embed = new EmbedBuilder()
          .setTitle(
            `Rankings Leaderboard (Page ${page + 1}/${totalPages})`
          )
          .setColor(0x0000ff);
  
        leaderboardPage.forEach((user, index) => {
          embed.addFields({
            name: `${index + 1 + page * pageSize}. ${user.gname} (${user.name})`,
            value: `Level: ${user.lvl}, XP: ${user.xp}/${user.rxp}`,
            inline: true,
          });
        });
  
        if (data) {
          embed.setFooter({
            text: `Your Rank: ${rank} | ${`Level: ${data.lvl}, XP: ${data.xp}/${data.rxp}`}`,
          });
        } else {
          embed.setFooter({ text: "You are not ranked yet." });
        }
  
        return embed;
      };
  
      // Initial embed and buttons
      let embed = generateLeaderboardEmbed(currentPage);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("⬅️")
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("➡️")
          .setDisabled(currentPage === totalPages - 1)
      );
  
      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
      });
  
      // Button collector
      const filter = (i) => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({
        filter,
        time: 120000, // 2 minutes timeout
      });
  
      collector.on("collect", async (i) => {
        if (i.customId === "prev" && currentPage > 0) {
          currentPage--;
        } else if (i.customId === "next" && currentPage < totalPages - 1) {
          currentPage++;
        }
  
        // Update embed and buttons
        embed = generateLeaderboardEmbed(currentPage);
        row.components[0].setDisabled(currentPage === 0);
        row.components[1].setDisabled(currentPage === totalPages - 1);
  
        await i.update({ embeds: [embed], components: [row] });
      });
  
      collector.on("end", async () => {
        // Disable buttons after collector ends
        row.components.forEach((button) => button.setDisabled(true));
        await message.edit({ components: [row] });
      });
    },
  };
  