import Command from "./base/Command.js";

export default class Ping extends Command {
    constructor() {
        super({
            name: "ping",
            description: "Ping!",
        });
    }

    async execute(message, args) {
        message.channel.send("Pong.");
    }
}