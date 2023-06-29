const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const pollData = require('../../data/polldata.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('closeallpolls')
		.setDescription('Close all active polls'),

	async execute(interaction) {
		const activePolls = [...pollData.polls];
		try {
			if (activePolls.length != 0) {
				await interaction.reply('Closing all polls');
				for (const poll of activePolls) {
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
					const result = await pollData.closePoll(poll.id);
					interaction.followUp({ embeds: [pollFinishEmbed], components: [] });
					interaction.followUp(result.winningChoice + ' wins with ' + result.winningVotes + ' votes!');
				}
				await interaction.followUp('All polls have been closed.');
			}
			else {
				await interaction.reply('There are no polls to close.');
			}
		}
		catch (e) {
			console.log(e);
		}
	},
};
