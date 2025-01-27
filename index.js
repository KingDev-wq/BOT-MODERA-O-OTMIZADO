const { Client, Intents } = require("discord.js");
const { token, prefix } = require("./config.json");

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]
});

// Evento: Quando o bot estiver pronto
client.once("ready", () => {
    console.log(`Bot online como ${client.user.tag}!`);
});

// Evento: Quando o bot receber uma mensagem
client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // **COMANDOS DE DIVERSÃO**
    if (command === "joke") {
        const jokes = [
            "Por que o JavaScript foi ao terapeuta? Porque estava tendo problemas de callback!",
            "Por que o dev foi para a praia? Porque precisava desbugar a mente!",
            "Você sabia que 99% dos bugs desaparecem... se você desligar o computador?"
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        return message.channel.send(randomJoke);
    }

    else if (command === "8ball") {
        const responses = [
            "Com certeza!", "Não tenho tanta certeza...", "Talvez.", "Definitivamente não.", 
            "Pergunte novamente mais tarde."
        ];
        const question = args.join(" ");
        if (!question) {
            return message.reply("Você precisa fazer uma pergunta!");
        }
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return message.channel.send(`🎱 **Pergunta:** ${question}\n**Resposta:** ${randomResponse}`);
    }

    // **COMANDOS DE MODERAÇÃO**
    else if (command === "ban") {
        if (!message.member.permissions.has("BAN_MEMBERS")) {
            return message.reply("Você não tem permissão para usar este comando!");
        }
        const user = message.mentions.users.first();
        if (!user) return message.reply("Você precisa mencionar um usuário para banir!");
        const reason = args.slice(1).join(" ") || "Sem motivo especificado.";
        try {
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                await member.ban({ reason });
                return message.channel.send(`${user.tag} foi banido com sucesso! Motivo: ${reason}`);
            } else {
                return message.reply("Esse usuário não está no servidor.");
            }
        } catch (error) {
            console.error(error);
            return message.reply("Não foi possível banir o usuário.");
        }
    }

    else if (command === "kick") {
        if (!message.member.permissions.has("KICK_MEMBERS")) {
            return message.reply("Você não tem permissão para usar este comando!");
        }
        const user = message.mentions.users.first();
        if (!user) return message.reply("Você precisa mencionar um usuário para expulsar!");
        const reason = args.slice(1).join(" ") || "Sem motivo especificado.";
        try {
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                await member.kick(reason);
                return message.channel.send(`${user.tag} foi expulso com sucesso! Motivo: ${reason}`);
            } else {
                return message.reply("Esse usuário não está no servidor.");
            }
        } catch (error) {
            console.error(error);
            return message.reply("Não foi possível expulsar o usuário.");
        }
    }

    else if (command === "mute") {
        if (!message.member.permissions.has("MODERATE_MEMBERS")) {
            return message.reply("Você não tem permissão para usar este comando!");
        }
        const user = message.mentions.users.first();
        if (!user) return message.reply("Você precisa mencionar um usuário para mutar!");
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply("Esse usuário não está no servidor!");

        const duration = parseInt(args[1]); // Duração em minutos
        if (!duration || isNaN(duration)) return message.reply("Você precisa especificar uma duração em minutos!");

        try {
            await member.timeout(duration * 60 * 1000);
            return message.channel.send(`${user.tag} foi mutado por ${duration} minutos.`);
        } catch (error) {
            console.error(error);
            return message.reply("Não foi possível mutar o usuário.");
        }
    }

    else if (command === "unmute") {
        if (!message.member.permissions.has("MODERATE_MEMBERS")) {
            return message.reply("Você não tem permissão para usar este comando!");
        }
        const user = message.mentions.users.first();
        if (!user) return message.reply("Você precisa mencionar um usuário para desmutar!");
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply("Esse usuário não está no servidor!");

        try {
            await member.timeout(null); // Remove o mute
            return message.channel.send(`${user.tag} foi desmutado com sucesso.`);
        } catch (error) {
            console.error(error);
            return message.reply("Não foi possível desmutar o usuário.");
        }
    }

    else if (command === "clear") {
        if (!message.member.permissions.has("MANAGE_MESSAGES")) {
            return message.reply("Você não tem permissão para usar este comando!");
        }
        const amount = parseInt(args[0]);
        if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Você precisa especificar um número de mensagens entre 1 e 100!");
        }

        try {
            await message.channel.bulkDelete(amount, true);
            return message.channel.send(`${amount} mensagens foram apagadas com sucesso!`).then(msg => setTimeout(() => msg.delete(), 5000));
        } catch (error) {
            console.error(error);
            return message.reply("Não foi possível apagar as mensagens.");
        }
    }

    // **COMANDO PADRÃO PARA COMANDOS NÃO RECONHECIDOS**
    else {
        return message.reply("Esse comando não existe! Use um comando válido.");
    }
});

// Login do bot
client.login(token);
