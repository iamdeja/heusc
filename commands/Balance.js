import { MessageEmbed } from "discord.js";
import Command from "./base/Command.js";
import User from "../models/user.js";
import { createUser, getGuildUser } from "./helpers/guildFunctions.js";

export default class Balance extends Command {
  constructor() {
    super({
      name: "balance",
      description: "Get your money.",
    });
  }

  async execute(message) {
    let user = await User.findById(message.author.id);
    if (!user) user = await createUser(message.author, message.guild);

    const guildUser = getGuildUser(user, message.guild);

    let { balance } = guildUser;
    if (balance === -1) balance = "unlimited";

    const embed = new MessageEmbed()
      .setAuthor(message.author.username)
      .setTitle(`balance: ${balance}`);

    await message.channel.send(embed);
  }
}
