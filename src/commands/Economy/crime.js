const { SlashCommandBuilder, EmbedBuilder, Embed} = require("discord.js")
const { getProfile, saveProfiles, addXP} = require("../../data/profilesControl")
const { Emojis, getRandomNumber } = require("../../mods")

module.exports = {
    cooldown: "90s",
    data: new SlashCommandBuilder()
        .setName("crime")
        .setDescription("Commit (fake) crimes in an attempt to get big returns but with risks."),

    async execute (interaction, client) {
        let profile = getProfile(interaction.user.id)
        let chance = getRandomNumber(1, 100)

        if (chance <= 70) {
            return interaction.reply(`You didn't earn any moneys this time.`)
        }

        let minEarn = 100
        let maxEarn = 750

        let multiplier = profile.multiplier

        let amt = getRandomNumber(minEarn, maxEarn) * multiplier

        profile.currencies.cash += amt;
        addXP(interaction, 25)
        saveProfiles();

        const embed = new EmbedBuilder()
            .setTitle("Doing the Illegals")
            .setDescription(`You successfully did some illegals and earned 💵 ${amt}.`)
            .setTimestamp()
            .setColor('DarkRed')
            .setFooter({ text: `You earned 25XP`})

        interaction.reply({ embeds: [embed]})
    }
}