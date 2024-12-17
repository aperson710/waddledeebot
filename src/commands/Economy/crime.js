const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require("discord.js")
const { getProfile, saveProfiles, addXP} = require("../../data/profilesControl")
const { Emojis, getRandomNumber } = require("../../mods")
const ms = require("ms")

module.exports = {
    executableWhileImprisoned: false,
    cooldown: "90s",
    data: new SlashCommandBuilder()
        .setName("crime")
        .setDescription("Commit (fake) crimes in an attempt to get big returns but with risks."),

    async execute (interaction, client) {
        let profile = getProfile(interaction.user.id)
        let chance = getRandomNumber(1, 100)

        if (chance <= 40) {
            const jailEffect = {
                type: "Prison",
                display: {
                    name: "In Prison",
                    desc: "Nice one, you've landed yourself in prison. Wait out your time."
                },
                bailCost: 500,
                endsAt: Date.now() + getRandomNumber(ms("5m"), ms("1h"))
            }
            profile.effects.push(jailEffect)
            saveProfiles()

            const bailButton = new ButtonBuilder()
                .setLabel("Pay the bail")
                .setEmoji("🚪")
                .setCustomId("pay-bail")
                .setStyle(ButtonStyle.Primary)

            const row = new ActionRowBuilder().addComponents(bailButton)

            
            return interaction.reply({ content: `You landed yourself in prison! You'll be released <t:${Math.round(jailEffect.endsAt / 1000)}:R> \n\nAlternatively, you can pay ${jailEffect.bailCost} to be let out.`, components: [row], ephemeral: true})
        } else if (chance <= 70) {
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
            .setFooter({ text: `You earned 25XP`, iconURL: interaction.user.displayAvatarURL()})

        interaction.reply({ embeds: [embed]})
    }
}