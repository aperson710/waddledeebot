const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { Emojis } = require("../../mods")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get information about this bot"),

    async execute (interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle(`${Emojis.info} | Information`)
            .setDescription(`Waddle Dee is an in-development economy bot with some definitely accurate branding.`)
            .addFields({ name: `Version`, value: `0.1.0`}, { name: `Content added this update:`, value: `This command exists.`})
            .setFooter({ text: `Bot code, emojis, and concepts made (with procrastination) by A_Person-exe`, iconURL: client.user.displayAvatarURL()});

        interaction.reply({ embeds: [embed]})
    }
}