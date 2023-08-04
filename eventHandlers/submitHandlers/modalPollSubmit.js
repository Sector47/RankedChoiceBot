const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
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
		const rankedVotes = [];
		interaction.fields.fields.forEach((value, key) => {
			const choiceNumber = key;
			const rankingAmount = parseInt(value.value);
			rankedVotes.push({ choiceNumber, rankingAmount });
		});
		let result = '';
		result = pollData.submitVote(poll.id, interaction.user.id, rankedVotes);

		// Update pollembed with new vote total:
		if (result == 'Vote submitted') {
			const finishedFields = [];
			let pointValue = '';
			for (const option in poll.choices) {
				pointValue = pollData.getRanks(pollId, poll.choices[option].name);
				finishedFields.push({ name:poll.choices[option].value, value:`${pointValue}` });
			}

			const pollEmbed = new EmbedBuilder()
				.setColor('Blurple')
				.setTitle(poll.name + `: ${pollData.getVoteNumbers(pollId)} votes.`)
				.addFields(finishedFields);

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

			console.log('modalPollButtonSubmit.js ' + poll.message);
			console.log('modalPollButtonSubmit.js pollmessage' + pollData.getPollMessage(pollId, interaction.client));
			poll.message.edit({ embeds: [pollEmbed], components: [row] });
		}

		// Acknowledge the interaction
		await interaction.reply({ content: result, ephemeral: true });
	},
};