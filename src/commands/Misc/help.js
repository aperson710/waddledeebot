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
            .setValue("info"),
        new StringSelectMenuOptionBuilder()
            .setLabel(`/work`)
            .setDescription(`Work a shift for some moneys.`)
            .setValue("work"),
        new StringSelectMenuOptionBuilder()
            .setLabel(`/beg`)
            .setDescription(`Attempt to ask for moneys.`)
            .setValue("beg"),
        new StringSelectMenuOptionBuilder()
            .setLabel(`/crime`)
            .setDescription(`Do illegals for high moneys but with high risk.`)
            .setValue("crime"),
        new StringSelectMenuOptionBuilder()
            .setLabel(`/profile`)
            .setDescription(`View user profiles.`)
            .setValue("profile")
      );


    const row = new ActionRowBuilder().addComponents(menu)

    const reply = interaction.reply({ content: `Pick a command from the menu below:`, components: [row], fetchReply: true});
  },
};
