// polldata.js
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const fs = require('fs');


const pollData = {
	polls: [],
	createPoll: function(name, creatorId, choices) {
		const id = this.generateId();
		const poll = {
			id,
			name,
			creatorId,
			embed: '',
			row: '',
			choices,
			votes: {},
			modal: this.generateModal(id, name, choices),
		};
		this.polls.push(poll);
		this.savePolls();
		return poll;
	},
	loadPolls: function() {
		try {
			const data = fs.readFileSync('polls.json', 'utf8');
			const loadedPolls = JSON.parse(data);
			for (const poll of loadedPolls) {
				this.polls.push(poll);
			}
		}
		catch (e) {
			console.error(e);
		}
	},
	savePolls: function() {
		fs.writeFile('polls.json', JSON.stringify(this.polls), (e) => {
			if (e) throw e;
			console.log('Polls saved to disk');
		});
	},
	submitVote: function(pollId, userId, rankedVotes) {
		const poll = this.polls.find((p) => p.id === parseInt(pollId, 10));
		if (!poll) {
			console.log('Poll not found');
			return 'Poll not found';
		}
		if (poll.votes[userId]) {
			console.log('User has already voted');
			return 'User has already voted';
		}
		// Validate the ranking amounts
		const rankingAmounts = rankedVotes.map((vote) => vote.rankingAmount);
		const uniqueRankingAmounts = [...new Set(rankingAmounts)];
		if (uniqueRankingAmounts.length !== rankingAmounts.length) {
			console.log('Ranking amounts contain duplicates');
			return 'Ranking amounts contain duplicates';
		}
		if (
			Math.min(...rankingAmounts) <= 0 ||
			Math.max(...rankingAmounts) > poll.choices.length
		) {
			console.log('Ranking amounts are out of range');
			return 'Ranking amounts are out of range';
		}
		poll.votes[userId] = rankedVotes;
		this.savePolls();
		return 'Vote submitted';
	},
	getTotalVotes: function(pollId) {
		const poll = this.polls.find((p) => p.id === parseInt(pollId, 10));
		if (!poll) {
			console.log('Poll not found');
			return {};
		}
		const totalVotes = {};
		for (const choice of poll.choices) {
			totalVotes[choice.name] = 0;
		}
		for (const userId in poll.votes) {
			const rankedVotes = poll.votes[userId];
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
	getResults: function(pollId) {
		const poll = this.polls.find((p) => p.id === parseInt(pollId, 10));
		if (!poll) {
			console.log('Poll not found');
			return {};
		}

		const totalVotes = this.getTotalVotes(parseInt(pollId, 10));
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
		const winningChoiceObject = poll.choices.find(
			(choice) => choice.name === highestChoice,
		);
		const winningChoice = winningChoiceObject.value;

		return { highestChoice: winningChoice, highestVote };
	},
	closePoll: function(pollId) {
		const pollIndex = this.polls.findIndex((p) => p.id === parseInt(pollId, 10));
		if (pollIndex === -1) {
			console.log('Poll not found');
			return;
		}

		const totalVotes = this.getTotalVotes(pollId);
		const results = this.getResults(pollId);
		const winningChoice = results.highestChoice;
		const winningVotes = results.highestVote;

		// Remove the poll from the polls array
		this.polls.splice(pollIndex, 1);
		this.savePolls();

		return { totalVotes, winningChoice, winningVotes };
	},
	generateModal: function(pollId, name, choices) {
		const modal = new ModalBuilder()
			.setTitle(name)
			.setCustomId(`modalPollSubmit-${pollId}`);
		for (const choice of choices) {
			const optionInput = new TextInputBuilder()
				.setCustomId(choice.name)
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
	generateId: function() {
		let nextId = 1;
		const existingPollIds = this.polls.map((p) => p.id);
		while (existingPollIds.includes(nextId)) {
			nextId++;
		}
		return nextId;
	},
	hasVoted: function(pollId, userId) {
		const poll = this.polls.find((p) => p.id === parseInt(pollId, 10));
		if (!poll) {
			console.log('Poll not found');
			return false;
		}
		return !!poll.votes[userId];
	},
	getPoll: function(pollId) {
		console.log(this.polls);
		return this.polls.find((p) => p.id === parseInt(pollId, 10));
	},
};

module.exports = pollData;