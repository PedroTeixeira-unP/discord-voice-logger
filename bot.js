const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const textChannelId = env(CHANNEL_ID)
const guildId = env(GUILD_ID)
const targetTag = env(TARGET_ID)

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate',async  (oldState, newState) => {
    console.log('Voice state update triggered.');

    const textChannel = client.channels.cache.get(textChannelId);
    const guild = client.guilds.cache.get(guildId);

    // Additional checks
    if (!oldState || !newState) {
        console.log('oldState or newState is undefined.');
        return;
    }

    if (newState.channel?.id !== oldState.channel?.id) {
        const voiceChannels = newState.guild.channels.cache.filter(
            (channel) => channel.type === 'GUILD_VOICE' || channel.type === 'GUILD_STAGE_VOICE' || channel.type == 2
        );
        
        const role = guild.roles.cache.get(targetTag);
        let membersWithRole = [];
        if (role) {
            membersWithRole = guild.members.cache.filter((member) => member.roles.cache.has(role.id));

            console.log(`Members with the role "${role.name}":`, membersWithRole.map((member) => member.user.username));
        } else {
            console.error('Role not found.');
        }
        
        let message = 'Voice channels:\n';
        
        voiceChannels.forEach((channel) => {
            const members = channel.members.map((member) => member.user.tag);
            message += `${channel.name} (${members.join(', ')})\n`;
        });
        
        console.log('Message:', message);
        
        try {
            membersWithRole.forEach((member) => {
                console.log(member.user.username)
                if (member.user.dmable) {
                    member.send('Hello! This is a message sent to members with the specified role.')
                        .catch((error) => console.error(`Error sending message to ${member.user.tag}:`, error));
                } else {
                    console.log(`${member.user.tag} has DMs disabled.`);
                }
            });

            // Optionally, send the list of usernames to the channel where the command was received
            textChannel.send(`Members with the role "${role.name}": ${membersWithRole.map((member) => member.user.username).join(', ')}`);

            textChannel.send('new input');
            // textChannel.send(message);
            console.log('Message sent successfully.');
        } catch (error) {
            console.error('Error sending message:', error);
        }
        
    }
});



client.login(env('BOT_TOKEN')); // Replace with your bot token
