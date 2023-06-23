const { EmbedBuilder } = require('discord.js');
const pollData = require('../../data/polldata.js');
module.exports = {
	customId: 'closePollButton',
	async execute(interaction) {
		if (interaction.user.id == pollData.creatorId) {
			await interaction.deferReply();
			const finishedFields = [];
			let count = 0;
			for (const option in pollData.choices) {
				count++;

				finishedFields.push({ name:'Choice ' + count, value:pollData.choices[option].value });
			}

			const pollFinishEmbed = new EmbedBuilder()
				.setColor('Red')
				.setTitle(pollData.name + ' - This poll is closed.')
				.addFields(finishedFields);

			pollData.message.edit({ embeds: [pollFinishEmbed], components: [] });
			const result = await pollData.closePoll();
			interaction.editReply(result.winningChoice + ' wins with ' + result.winningVotes + ' votes!');
		}
		else {
			await interaction.deferReply({ ephemeral: true });
			interaction.editReply({ content:'Only the creator of the poll may close the poll.', ephemeral: true });
		}
	},
};
