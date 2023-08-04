const { EmbedBuilder } = require('discord.js');
const pollData = require('../data/polldata.js');

async function closePoll(interaction, pollId) {
	await interaction.deferReply();
	const poll = pollData.getPoll(pollId);
	const finishedFields = [];
	let pointValue = '';
	for (const option in poll.choices) {
		pointValue = pollData.getRanks(pollId, poll.choices[option].name);
		finishedFields.push({ name:poll.choices[option].value, value:`${pointValue}` });
	}

	const pollFinishEmbed = new EmbedBuilder()
		.setColor('Red')
		.setTitle(poll.name + ' - This poll is closed.')
		.addFields(finishedFields);

	const message = await pollData.getPollMessage(pollId, interaction.client);
	message.edit({ embeds: [pollFinishEmbed], components: [] });
	const result = await pollData.closePoll(poll.id);

	// check if tie
	if (Array.isArray(result.winningChoice)) {
		let resultString = '';
		for (const tiedChoice in result.winningChoice) {
			if (tiedChoice != result.winningChoice.length - 1 && tiedChoice == 0) {
				resultString += result.winningChoice[tiedChoice];
			}
			else if (tiedChoice != result.winningChoice.length - 1) {
				resultString += ', ' + result.winningChoice[tiedChoice];
			}
			else if (tiedChoice > 1) {
				resultString += ', and ' + result.winningChoice[tiedChoice];
			}
			else {
				resultString += ' and ' + result.winningChoice[tiedChoice];
			}
		}
		interaction.followUp(resultString + ' tie for the win with ' + result.winningVotes + ' points!');
	}
	else {
		interaction.followUp(result.winningChoice + ' wins with ' + result.winningVotes + ' points!');
	}
}

module.exports = closePoll;