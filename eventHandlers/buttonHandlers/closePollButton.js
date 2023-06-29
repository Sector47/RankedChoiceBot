const { EmbedBuilder } = require('discord.js');
const pollData = require('../../data/polldata.js');
module.exports = {
	customId: 'closePollButton',
	async execute(interaction) {
		const [customId, pollId] = interaction.customId.split('-');
		console.log(customId + ', ' + pollId);
		const poll = pollData.getPoll(pollId);
		if (interaction.user.id == poll.creatorId) {
			await interaction.deferReply();
			const finishedFields = [];
			let count = 0;
			for (const option in poll.choices) {
				count++;

				finishedFields.push({ name:'Choice ' + count, value:poll.choices[option].value });
			}

			const pollFinishEmbed = new EmbedBuilder()
				.setColor('Red')
				.setTitle(poll.name + ' - This poll is closed.')
				.addFields(finishedFields);

			poll.message.edit({ embeds: [pollFinishEmbed], components: [] });
			const result = await pollData.closePoll(pollId);
			interaction.editReply(result.winningChoice + ' wins with ' + result.winningVotes + ' votes!');
		}
		else {
			await interaction.deferReply({ ephemeral: true });
			interaction.editReply({ content:'Only the creator of the poll may close the poll.', ephemeral: true });
		}
	},
};
