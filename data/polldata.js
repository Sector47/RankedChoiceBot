// polldata.js
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const fs = require('fs');
const { MAX_POLLS } = require('../config.json');


const pollData = {
	polls: [],
	createPoll: function(name, creatorId, choices, guildId, hidden = false) {
		if (this.polls.length >= MAX_POLLS) {
			return { error: 'Too many active polls, you may only have 5 active polls at a time. Please close an existing poll before creating a new one.' };
		}
		const id = this.generateId();
		const poll = {
			id,
			name,
			creatorId,
			guildId,
			hidden,
			embed: '',
			row: '',
			choices,
			votes: {},
			modal: this.generateModal(id, name, choices),
			messageId: null,
			channelId: null,
		};
		this.polls.push(poll);
		this.savePolls();
		return poll;
	},
	getPollMessage: async function(pollId, client) {
		const poll = this.getPoll(pollId);
		if (poll.messageId) {
			return await client.channels.cache.get(poll.channelId).messages.fetch(poll.messageId);
		}
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
		fs.writeFileSync('polls.json', JSON.stringify(this.polls), (e) => {
			if (e) throw e;
			console.log('Polls saved to disk');
		});
	},
	submitVote: function(pollId, userId, rankedVotes) {
		const poll = this.getPoll(pollId);
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
	getVoteNumbers: function(pollId) {
		const poll = this.getPoll(pollId);
		if (!poll) {
			console.log('Poll not found');
			return 'Poll not found';
		}
		console.log('poll.votes.length: ' + Object.keys(poll.votes).length);
		return Object.keys(poll.votes).length;
	},
	getTotalVotes: function(pollId) {
		const poll = this.getPoll(pollId);
		if (!poll) {
			console.log('Poll not found');
			return 'Poll not found';
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
			}
		}
		console.log(totalVotes);
		return totalVotes;
	},
	getResults: function(pollId) {
		const poll = this.getPoll(pollId);
		if (!poll) {
			console.log('Poll not found');
			return 'Poll not found';
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

		// Check if there is a draw
		const tiedWins = [];
		for (const choiceIndex in totalVotes) {
			const vote = totalVotes[choiceIndex];
			if (vote === highestVote && choiceIndex !== highestChoice) {
				const choiceName = poll.choices.find(
					(choice) => choice.name === choiceIndex,
				).value;
				tiedWins.push(choiceName);
			}
		}

		if (tiedWins.length > 0) {
			const choiceName = poll.choices.find(
				(choice) => choice.name === highestChoice,
			).value;
			tiedWins.push(choiceName);
			return { highestChoice: tiedWins, highestVote };
		}

		// Find the winning choice object
		const winningChoiceObject = poll.choices.find(
			(choice) => choice.name === highestChoice,
		);
		const winningChoice = winningChoiceObject.value;

		return { highestChoice: winningChoice, highestVote };
	},
	getRanks: function(pollId, choice) {
		const poll = this.getPoll(pollId);
		if (!poll) {
			console.log('Poll not found');
			return 'Poll not found';
		}
		let totalRanks = 0;
		if (poll.votes) {
			for (const userId in poll.votes) {
				const rankedVotes = poll.votes[userId];
				for (const vote of rankedVotes) {
					if (vote.choiceNumber === choice) {
						totalRanks += vote.rankingAmount;
					}
				}
			}
		}
		console.log(choice + 'got x ranks: ' + totalRanks);
		return totalRanks;
	},
	closePoll: function(pollId) {
		const pollIndex = this.polls.findIndex((p) => p.id === parseInt(pollId, 10));
		if (pollIndex === -1) {
			console.log('Poll not found');
			return 'Poll not found';
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
		return this.polls.find((p) => p.id === parseInt(pollId, 10));
	},
};

module.exports = pollData;