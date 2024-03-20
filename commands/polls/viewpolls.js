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
			let hasPoll = false;
			for (const poll of activePolls) {
				if (poll.guildId == interaction.guild.id) {
					if (!hasPoll) {
						await interaction.reply('These are the active polls.');
					}
					hasPoll = true;
					let pollEmbed;
					if (pollData.getVoteNumbers(poll.id) != 0) {
						const finishedFields = [];
						let pointValue = '';
						for (const option in poll.choices) {
							const index = Object.keys(poll.choices).indexOf(option);
							pointValue = poll.hidden ? 'Results are hidden' : `${pollData.getRanks(poll.id, poll.choices[option].name)} votes.`;
							finishedFields.push({ name:`Choice ${index + 1}: ${poll.choices[option].value}`, value:`${pointValue}` });
						}
						pollEmbed = new EmbedBuilder()
							.setColor('Blurple')
							.setTitle(poll.name + `: ${pollData.getVoteNumbers(poll.id)} votes.`)
							.addFields(finishedFields);
					}
					else {
						pollEmbed = new EmbedBuilder()
							.setColor('Blurple')
							.setTitle(poll.name)
							.addFields(poll.choices.map((choice, index) => ({ name: 'Choice ' + (index + 1) + ': ', value: choice.value })));
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

					console.log('viewPolls.js' + poll.message);

					poll.embed = pollEmbed;
					poll.message = await interaction.channel.send({ embeds: [pollEmbed], components: [row] });
					poll.messageId = poll.message.id;
					poll.channelId = poll.message.channelId;
					pollData.updatePollMessageId(poll.id, poll.messageId);
					pollData.savePolls();
				}
			}
			if (!hasPoll) {
				await interaction.reply('No active polls found');
			}
		}
		else {
			await interaction.reply('No active polls found');
		}

	},
};