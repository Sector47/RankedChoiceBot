const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const pollData = require('../../data/polldata.js');
// const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('viewpolls')
		.setDescription('Refresh the discord view with all active polls.'),

	async execute(interaction) {
		const activePolls = pollData.polls;

		if (activePolls.length != 0) {
			await interaction.reply('These are the active polls.');
			for (const poll of activePolls) {
				let pollEmbed;
				if (pollData.getVoteNumbers(poll.id) != 0) {
					pollEmbed = new EmbedBuilder()
						.setColor('Blurple')
						.setTitle(poll.name + `: ${pollData.getVoteNumbers(poll.id)} votes.`)
						.addFields(poll.choices.map((choice, index) => ({ name: 'Choice ' + (index + 1), value: choice.value })));
				}
				else {
					pollEmbed = new EmbedBuilder()
						.setColor('Blurple')
						.setTitle(poll.name)
						.addFields(poll.choices.map((choice, index) => ({ name: 'Choice ' + (index + 1), value: choice.value })));
				}


				const voteButton = new ButtonBuilder()
					.setCustomId(`voteModalPopupButton-${poll.id}`)
					.setLabel('Vote')
					.setStyle(ButtonStyle.Success);

				const closePollButton = new ButtonBuilder()
					.setCustomId(`closePollButton-${poll.id}`)
					.setLabel('Close Poll')
					.setStyle(ButtonStyle.Danger);

				const row = new ActionRowBuilder()
					.addComponents(voteButton, closePollButton);

				console.log(poll.message.id);
				poll.message = await interaction.channel.send({ embeds: [pollEmbed], components: [row] });
				poll.embed = pollEmbed;
				console.log(poll.message.id);
			}
		}
		else {
			await interaction.reply('No active polls found');
		}

	},
};