const { SlashCommandBuilder, EmbedBuilder, Embed} = require("discord.js")
const { getProfile, saveProfiles, addXP} = require("../../data/profilesControl")
const { Emojis, getRandomNumber } = require("../../mods")

module.exports = {
    cooldown: "45s",
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Work a shift for some moneys"),

    async execute (interaction, client) {
        let profile = getProfile(interaction.user.id)

        let earnRate = 1.0;

        let minEarn = 50 * earnRate;
        let maxEarn = 300 * earnRate;

        let multiplier = profile.multiplier

        let amt = getRandomNumber(minEarn, maxEarn) * multiplier

        profile.currencies.cash += amt;
        addXP(interaction, 10)
        saveProfiles();

        const embed = new EmbedBuilder()
            .setTitle("Work shift")
            .setDescription(`You earned 💵 ${amt}. \n\n Earn rate: ${earnRate * 100}%`)
            .setTimestamp()
            .setFooter({ text: `You earned 10XP`})

        interaction.reply({ embeds: [embed]})

    }

}