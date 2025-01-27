const { Client, Intents } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const config = require('./config.json');

// Lista de palavras ofensivas (adicione mais palavras conforme necessário)
const offensiveWords = [
    'palavrão1', 'palavrão2', 'palavrão3', 'palavrão4', 'idiota', 'otário', 'merda', 
    'porra', 'caralho', 'bosta', 'vagabundo', 'filho da puta', 'cuzão', 'puta', 'cu',
    'desgraçado', 'arrombado', 'cuzinho', 'viado', 'bichona', 'puta que pariu', 'merdinha',
    'cachorrinho', 'filha da puta', 'vagabundinho', 'porquinha', 'otária', 'trouxa', 'puta merda',
    'x9', 'cão', 'arrombada', 'piranha', 'foda-se', 'caralho', 'baba ovo', 'otárinha', 'desgraçadinha',
    'otáriozinho', 'safada', 'marmita'
];

// Função para verificar se a mensagem contém palavras ofensivas
function containsOffensiveWord(message) {
    return offensiveWords.some(word => message.content.toLowerCase().includes(word));
}

// Comandos de moderação
const prefix = config.prefix;
let mutedMembers = [];

client.once('ready', () => {
    console.log('Bot está online!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return; // Ignorar mensagens de outros bots

    // Bloqueio de xingamentos
    if (containsOffensiveWord(message)) {
        message.delete();
        message.channel.send(`${message.author}, você não pode usar palavras ofensivas aqui!`);
    }

    // Comando de ajuda
    if (message.content.startsWith(`${prefix}help`)) {
        const helpMessage = `
        **Comandos de Moderação:**
        - \`${prefix}ban <@usuário>\`: Banir um usuário
        - \`${prefix}kick <@usuário>\`: Expulsar um usuário
        - \`${prefix}mute <@usuário>\`: Silenciar um usuário
        - \`${prefix}unmute <@usuário>\`: Desilenciar um usuário
        - \`${prefix}clear <número>\`: Limpar mensagens
        - \`${prefix}muted\`: Listar membros silenciados
        `;
        message.channel.send(helpMessage);
    }

    // Comando de banimento
    if (message.content.startsWith(`${prefix}ban`)) {
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply("Você não tem permissão para banir membros.");
        }
        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                member.ban({ reason: 'Comando de banimento' }).then(() => {
                    message.reply(`${user.tag} foi banido.`);
                }).catch(err => {
                    message.reply('Não consegui banir o usuário.');
                    console.error(err);
                });
            } else {
                message.reply('Esse usuário não está no servidor.');
            }
        } else {
            message.reply('Você precisa mencionar um usuário para banir.');
        }
    }

    // Comando de expulsão
    if (message.content.startsWith(`${prefix}kick`)) {
        if (!message.member.permissions.has('KICK_MEMBERS')) {
            return message.reply("Você não tem permissão para expulsar membros.");
        }
        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                member.kick('Expulsão via comando').then(() => {
                    message.reply(`${user.tag} foi expulso.`);
                }).catch(err => {
                    message.reply('Não consegui expulsar o usuário.');
                    console.error(err);
                });
            } else {
                message.reply('Esse usuário não está no servidor.');
            }
        } else {
            message.reply('Você precisa mencionar um usuário para expulsar.');
        }
    }

    // Comando para limpar mensagens
    if (message.content.startsWith(`${prefix}clear`)) {
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply("Você não tem permissão para limpar mensagens.");
        }

        const args = message.content.split(' ');
        const amount = args[1];
        if (!amount || isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply('Você deve fornecer um número entre 1 e 100 para limpar mensagens.');
        }

        await message.channel.messages.fetch({ limit: amount }).then(messages => {
            message.channel.bulkDelete(messages, true);
            message.reply(`Deletadas ${messages.size} mensagens.`);
        });
    }

    // Comando de listagem de membros mutados
    if (message.content.startsWith(`${prefix}muted`)) {
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply("Você não tem permissão para listar membros silenciados.");
        }

        if (mutedMembers.length === 0) {
            return message.reply('Não há membros silenciados no momento.');
        }

        const mutedList = mutedMembers.map(user => user.tag).join(', ');
        message.channel.send(`Membros silenciados: ${mutedList}`);
    }

    // Comando de mutar
    if (message.content.startsWith(`${prefix}mute`)) {
        if (!message.member.permissions.has('MUTE_MEMBERS')) {
            return message.reply("Você não tem permissão para silenciar membros.");
        }

        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                member.voice.setMute(true, 'Comando de mutação').then(() => {
                    mutedMembers.push(user);
                    message.reply(`${user.tag} foi silenciado.`);
                }).catch(err => {
                    message.reply('Não consegui silenciar o usuário.');
                    console.error(err);
                });
            } else {
                message.reply('Esse usuário não está no servidor.');
            }
        } else {
            message.reply('Você precisa mencionar um usuário para silenciar.');
        }
    }

    // Comando de desmutar
    if (message.content.startsWith(`${prefix}unmute`)) {
        if (!message.member.permissions.has('MUTE_MEMBERS')) {
            return message.reply("Você não tem permissão para desmutar membros.");
        }

        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                member.voice.setMute(false, 'Comando de desmutação').then(() => {
                    mutedMembers = mutedMembers.filter(u => u.id !== user.id);
                    message.reply(`${user.tag} foi desmutado.`);
                }).catch(err => {
                    message.reply('Não consegui desmutar o usuário.');
                    console.error(err);
                });
            } else {
                message.reply('Esse usuário não está no servidor.');
            }
        } else {
            message.reply('Você precisa mencionar um usuário para desmutar.');
        }
    }
});

client.login(config.token);
