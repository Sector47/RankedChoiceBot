const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const pollData = require('../../data/polldata.js');
// const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createpoll')
		.setDescription('Create a poll')
		.addStringOption(option =>
			option.setName('pollname')
				.setDescription('Name of the poll')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('choice1')
				.setDescription('Poll choice 1')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('choice2')
				.setDescription('Poll choice 2')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('choice3')
				.setDescription('Poll choice 3'))
		.addStringOption(option =>
			option.setName('choice4')
				.setDescription('Poll choice 4'))
		.addStringOption(option =>
			option.setName('choice5')
				.setDescription('Poll choice 5')),

	async execute(interaction) {
		const optionList = [];
		for (const option in interaction.options.data) {
			if (interaction.options.data[option].value != '' && interaction.options.data[option].name != 'pollname') {
				optionList.push({ name:interaction.options.data[option].name, value:interaction.options.data[option].value });
			}
		}

		const pollname = interaction.options.getString('pollname');
		/* if (!pollData.modal == '') {
			await interaction.reply({ content: 'A poll with that name already exists', ephemeral: true });
			return;
		} */

		// Initialize the poll data
		const poll = pollData.createPoll(pollname, interaction.user.id, optionList);

		// Generate the modal using the poll data
		// const modal = pollData.generateModal();

		const fields = [];
		let count = 0;
		for (const option in optionList) {
			count++;

			fields.push({ name:'Choice ' + count, value:optionList[option].value });
		}

		const pollEmbed = new EmbedBuilder()
			.setColor('Blurple')
			.setTitle(pollname)
			.addFields(fields);

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


		await interaction.reply({ embeds: [pollEmbed], components: [row] });
		poll.embed = pollEmbed;
		poll.message = await interaction.fetchReply();
	},
};
