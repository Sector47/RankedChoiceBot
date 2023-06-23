// const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, TextChannel, ModalBuilder, Events, TextInputBuilder, TextInputStyle, bold, CommandInteraction } = require('discord.js');
// const { EmbedBuilder } = require('discord.js');
const pollData = require('../../data/polldata.js');
// const wait = require('node:timers/promises').setTimeout;

module.exports = {
	customId: 'voteModalPopupButton',
	async execute(interaction) {
	// Check if the user has already voted
		console.log(interaction.user.id);
		const userId = interaction.user.id;
		if (pollData.hasVoted(userId)) {
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply({ content: 'You have already voted', ephemeral: true });
			return;
		}
		await interaction.showModal(pollData.modal);
	},
};
