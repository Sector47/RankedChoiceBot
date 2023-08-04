const { Events } = require('discord.js');

const pollData = require('../data/polldata.js');

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		// const Guilds = client.guilds.cache.map(guild => guild.id);
		// console.log(Guilds);
		// Load existing polls from disk
		pollData.loadPolls();
	},
};