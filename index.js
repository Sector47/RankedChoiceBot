// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// add the commands to our client so they accessible outside of index.js
client.commands = new Collection();
client.buttonHandlers = new Collection();
client.submitHandlers = new Collection();

// get commands from .js files within commands dir
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// go through folders and collect commands.js
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// go through folders and collect our events.js
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// go through the buttonHandlers folder and collect our button handlers
const eventHandlersPath = path.join(__dirname, 'eventHandlers');
const eventHandlerFiles = fs.readdirSync(eventHandlersPath);

for (const folder of eventHandlerFiles) {
	const buttonsPath = path.join(eventHandlersPath, folder);
	const buttonHandlerFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
	for (const file of buttonHandlerFiles) {
		const filePath = path.join(buttonsPath, file);
		const buttonHandler = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		client.buttonHandlers.set(buttonHandler.customId, buttonHandler);
	}
}

const submitsPath = path.join(eventHandlersPath, 'submitHandlers');
const submitHandlerFiles = fs.readdirSync(submitsPath).filter(file => file.endsWith('.js'));
for (const file of submitHandlerFiles) {
	const filePath = path.join(submitsPath, file);
	const submitHandler = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	client.submitHandlers.set(submitHandler.customId, submitHandler);
}

// Log in to Discord with your client's token
client.login(token);
