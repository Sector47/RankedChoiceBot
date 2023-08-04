const { SlashCommandBuilder } = require('discord.js');
const pollData = require('../../data/polldata.js');
const closePoll = require('../../functions/closePoll.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('closeallpolls')
		.setDescription('Close all active polls'),

	async execute(interaction) {
		const activePolls = [...pollData.polls];
		try {
			let pollsClosed = false;
			if (activePolls.length != 0) {
				await interaction.reply('Closing all polls');
				for (const poll of activePolls) {
					if (poll.guildId == interaction.guild.id) {
						pollsClosed = true;
						await closePoll(interaction, poll.id);
					}
				}
			}
			if (pollsClosed) {
				await interaction.followUp('All polls have been closed.');
			}
			else {
				await interaction.editReply('There are no polls to close.');
			}
		}
		catch (e) {
			console.log(e);
		}
	},
};
