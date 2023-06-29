const pollData = require('../../data/polldata.js');

module.exports = {
	customId: 'modalPollSubmit',
	async execute(interaction) {
		// Get the user's input from the modal
		// const rankedVotes = ...;
		const [customId, pollId] = interaction.customId.split('-');
		console.log(customId + ', ' + pollId);
		const poll = pollData.getPoll(pollId);

		// Submit the user's votes
		console.log(interaction);
		const rankedVotes = [];
		interaction.fields.fields.forEach((value, key) => {
			const choiceNumber = key;
			const rankingAmount = parseInt(value.value);
			rankedVotes.push({ choiceNumber, rankingAmount });
		});
		let result = '';
		result = pollData.submitVote(poll.id, interaction.user.id, rankedVotes);

		// Acknowledge the interaction
		await interaction.reply({ content: result, ephemeral: true });
	},
};