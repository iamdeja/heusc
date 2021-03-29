import Command from "./base/Command";

export default class Ping extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Is this bot alive?",
    });
  }

  async execute(message) {
    message.channel.send("Pong.");
  }
}
