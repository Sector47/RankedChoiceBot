// InteractionCreate event, fired when an interaction is received from discord (slash commands, button press, etc...)

const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// console.log(`Received at guild: ${interaction.guildId}`);
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		}
		else if (interaction.isButton()) {
			try {
				const [customId, pollId] = interaction.customId.split('-');
				console.log(customId + ', ' + pollId);
				const buttonHandler = interaction.client.buttonHandlers.get(customId);
				if (buttonHandler) {
					await buttonHandler.execute(interaction);
				}
				else {
					console.error(`No button handler matching ${interaction.customId} was found.`);
				}
			}
			catch (e) {
				console.error(e);
			}
		}
		else if (interaction.isModalSubmit()) {
			// Get the user's input from the modal
			try {
				const [customId, pollId] = interaction.customId.split('-');
				console.log(customId + ', ' + pollId);
				const submitHandler = interaction.client.submitHandlers.get(customId);
				if (submitHandler) {
					await submitHandler.execute(interaction);
				}
				else {
					console.error(`No submit handler matching ${interaction.customId} was found.`);
				}
			}
			catch (e) {
				console.error(e);
			}
		}
	},
};