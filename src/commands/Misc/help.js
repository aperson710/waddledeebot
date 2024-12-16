const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`help`)
    .setDescription(`View a list of commands`),

  async execute(interaction, client) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("commands-list")
      .setPlaceholder(`Pick a command to see its details.`)
      .addOptions(
        
        new StringSelectMenuOptionBuilder()
          .setLabel(`/help`)
          .setDescription(`View a list of commands.`)
          .setValue("help"),
        new StringSelectMenuOptionBuilder()
            .setLabel(`/info`)
            .setDescription(`View some details about this bot.`)
            .setValue("info")
      );


    const row = new ActionRowBuilder().addComponents(menu)

    const reply = interaction.reply({ content: `Pick a command from the menu below:`, components: [row], fetchReply: true});
  },
};
