const { SlashCommandBuilder, EmbedBuilder, Embed} = require("discord.js")
const { getProfile, saveProfiles, addXP} = require("../../data/profilesControl")
const { Emojis, getRandomNumber } = require("../../mods")

module.exports = {
    executableWhileImprisoned: false,
    cooldown: "20s",
    data: new SlashCommandBuilder()
        .setName("beg")
        .setDescription("Ask for some moneys"),

    async execute (interaction, client) {
        let profile = getProfile(interaction.user.id)
        let chance = getRandomNumber(1, 100)

        if (chance <= 40) {
            return interaction.reply(`You didn't earn any moneys this time.`)
        }

        let minEarn = 10
        let maxEarn = 100

        let multiplier = profile.multiplier

        let amt = getRandomNumber(minEarn, maxEarn) * multiplier

        profile.currencies.cash += amt;
        addXP(interaction, 3)
        saveProfiles();

        const embed = new EmbedBuilder()
            .setTitle("Asking for Moneys Simulator")
            .setDescription(`You asked nicely and earned 💵 ${amt}.`)
            .setTimestamp()
            .setColor("Purple")
            .setFooter({ text: `You earned 3XP`, iconURL: interaction.user.displayAvatarURL()})

        interaction.reply({ embeds: [embed]})
    }
}