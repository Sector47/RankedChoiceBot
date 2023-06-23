// polldata.js
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const pollData = {
	name: '',
	creatorId: '',
	modal: '',
	pollDataEmbed: '',
	choices: [],
	votes: {},
	init: function(name, creatorId, choices) {
		this.name = name;
		this.creatorId = creatorId;
		this.choices = choices;
		this.pollDataEmbed = '';
		this.pollDataRow = '';
		this.votes = {};
		this.modal = this.generateModal();
	},
	submitVote: function(pollName, userId, rankedVotes) {
		let result = '';
		if (pollName !== this.name) {
			console.log('Poll name does not match');
			result = 'Poll name does not match';
			return result;
		}
		if (this.votes[userId]) {
			console.log('User has already voted');
			result = 'User has already voted';
			return result;
		}
		console.log(rankedVotes);
		// Validate the ranking amounts
		const rankingAmounts = rankedVotes.map(vote => vote.rankingAmount);
		const uniqueRankingAmounts = [...new Set(rankingAmounts)];
		if (uniqueRankingAmounts.length !== rankingAmounts.length) {
			console.log('Ranking amounts contain duplicates');
			result = 'Ranking amounts contain duplicates';
			return result;
		}
		if (Math.min(...rankingAmounts) <= 0 || Math.max(...rankingAmounts) > this.choices.length) {
			console.log('Ranking amounts are out of range');
			result = 'Ranking amounts are out of range';
			return result;
		}
		this.votes[userId] = rankedVotes;
		result = 'Vote submitted';
		return result;
	},
	getTotalVotes: function() {
		const totalVotes = {};
		for (const choice of this.choices) {
			totalVotes[choice.name] = 0;
		}
		for (const userId in this.votes) {
			const rankedVotes = this.votes[userId];
			for (const vote of rankedVotes) {
				const choice = vote.choiceNumber;
				const rank = vote.rankingAmount;
				totalVotes[choice] += rank;
				console.log(choice + ' ' + rank);
			}
		}
		console.log(totalVotes);
		return totalVotes;
	},
	getResults: function() {
		const totalVotes = this.getTotalVotes();
		let highestChoice = '';
		let highestVote = -Infinity;
		for (const choice in totalVotes) {
			const vote = totalVotes[choice];
			if (vote > highestVote) {
				highestChoice = choice;
				highestVote = vote;
			}
		}
		// Find the winning choice object
		const winningChoiceObject = this.choices.find(choice => choice.name === highestChoice);
		const winningChoice = winningChoiceObject.value;

		return { highestChoice: winningChoice, highestVote };
	},
	closePoll: function() {
		const totalVotes = this.getTotalVotes();
		const results = this.getResults();
		const winningChoice = results.highestChoice;
		const winningVotes = results.highestVote;

		// Reset the poll data
		delete this.name;
		delete this.choices;
		delete this.votes;
		delete this.modal;
		delete this.pollDataRow;
		delete this.pollDataEmbed;

		return { totalVotes, winningChoice, winningVotes };
	},
	generateModal: function() {
		const modal = new ModalBuilder()
			.setTitle(this.name)
			.setCustomId('modalPollSubmit');
		for (const choice of this.choices) {
			const optionInput = new TextInputBuilder()
				.setCustomId(choice.name)
				// The label is the prompt the user sees for this input
				.setLabel(choice.value)
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('Input a rank. Highest value given to your top choice.')
				.setMaxLength(2)
				.setRequired(true);

			const actionRow = new ActionRowBuilder().addComponents(optionInput);
			modal.addComponents(actionRow);
		}
		return modal;
	},
	hasVoted: function(userId) {
		return !!this.votes[userId];
	},
};

module.exports = pollData;