const pollData = require('../../data/polldata.js');

module.exports = {
	customId: 'modalPollSubmit',
	async execute(interaction) {
		// Get the user's input from the modal
		// const rankedVotes = ...;

		// Submit the user's votes
		console.log(interaction);
		const rankedVotes = [];
		interaction.fields.fields.forEach((value, key) => {
			const choiceNumber = key;
			const rankingAmount = parseInt(value.value);
			rankedVotes.push({ choiceNumber, rankingAmount });
		});
		let result = '';
		result = pollData.submitVote(pollData.name, interaction.user.id, rankedVotes);

		// Acknowledge the interaction
		await interaction.reply({ content: result, ephemeral: true });
	},
};