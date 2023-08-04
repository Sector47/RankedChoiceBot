const pollData = require('../../data/polldata.js');
const closePoll = require('../../functions/closePoll.js');
module.exports = {
	customId: 'closePollButton',
	async execute(interaction) {
		const [customId, pollId] = interaction.customId.split('-');
		console.log(customId + ', ' + pollId);
		const poll = pollData.getPoll(pollId);
		if (interaction.user.id == poll.creatorId) {
			console.log('closePollButton.js' + poll.message);
			closePoll(interaction, pollId);
		}
		else {
			await interaction.deferReply({ ephemeral: true });
			interaction.editReply({ content:'Only the creator of the poll may close the poll.', ephemeral: true });
		}
	},
};
