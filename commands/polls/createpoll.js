const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
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
				.setDescription('Poll choice 5'))
		.addBooleanOption(option =>
			option.setName('hidden')
				.setDescription('Toggle visibility of poll responses')
				.setRequired(false)),

	async execute(interaction) {
		const optionList = [];

		const pollname = interaction.options.getString('pollname');

		// Check if the poll name is 45 characters or less
		if (pollname.length > 45) {
			await interaction.reply({ content: 'Poll Name must be 45 characters or less', ephemeral: true });
			throw new Error('Poll Name must be 45 characters or less');
		}

		for (const option in interaction.options.data) {
			if (interaction.options.data[option].value != '' && interaction.options.data[option].name != 'pollname' && interaction.options.data[option].name != 'hidden') {
				if (interaction.options.data[option].value.length > 45) {
					await interaction.reply({ content: `Option ${interaction.options.data[option].name} must be 45 characters or less`, ephemeral: true });
					throw new Error(`Option ${interaction.options.data[option].name} must be 45 characters or less`);
				}

				// only use this if additional options are added like modifiers for the poll: otherwise the option should match withconst number = parseInt(name.match(/\d+/)[0]);
				optionList.push({ name:option, value:interaction.options.data[option].value });
			}
		}

		// Initialize the poll data
		const poll = pollData.createPoll(pollname, interaction.user.id, optionList, interaction.guild.id, interaction.options.getBoolean('hidden'));

		if (poll.error) {
			await interaction.reply(poll.error);
			return;
		}

		const pollEmbed = new EmbedBuilder()
			.setColor('Blurple')
			.setTitle(pollname)
			.addFields(poll.choices.map((choice, index) => ({ name: 'Choice ' + (index + 1) + ': ' + choice.value, value: ' ' })));

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
		poll.messageId = poll.message.id;
		poll.channelId = poll.message.channelId;
		pollData.savePolls();
	},
};
