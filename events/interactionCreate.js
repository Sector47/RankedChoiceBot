// InteractionCreate event, fired when an interaction is received from discord (slash commands, button press, etc...)

const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
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
				const buttonHandler = interaction.client.buttonHandlers.get(interaction.customId);
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
				const submitHandler = interaction.client.submitHandlers.get(interaction.customId);
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