const { Client, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const textChannelId = process.env.CHANNEL_ID;
const guildId = process.env.GUILD_ID;
const targetTag = process.env.TARGET_ID;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    console.log('Voice state update triggered.');

    const textChannel = client.channels.cache.get(textChannelId);
    const guild = client.guilds.cache.get(guildId);

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

        membersWithRole.filter(async (member) => {
            let message = 'Voice Channels Users update:\n';

            // Fetch the channels to make sure the cache is up to date
            await newState.guild.channels.fetch();

            voiceChannels.forEach((channel) => {
                const permissions = member.permissionsIn(channel);
                const hasViewChannelPermission = permissions && permissions.has('ViewChannel');
                if (hasViewChannelPermission) {
                    const members = channel.members.map((member) => member.user.tag);
                    message += `${channel.name} (${members.join(', ')})\n`;
                }
            });

            try {
                member.send(message)
                        .catch((error) => console.error(`Error sending message to ${member.user.tag}:`, error));
                console.log('Message sent successfully.');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

    }
});



client.login(process.env.BOT_TOKEN); // Replace with your bot token
