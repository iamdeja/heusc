import { MessageEmbed } from "discord.js";
import Command from "./base/Command.js";
import User from "../models/user.js";
import { createUser, getGuildUser } from "./helpers/guildFunctions.js";

export default class Xp extends Command {
  constructor() {
    super({
      name: "xp",
      description: "Get your server xp.",
    });
  }

  async execute(message) {
    let user = await User.findById(message.author.id);
    if (!user) user = await createUser(message.author, message.guild);

    const guildUser = getGuildUser(user, message.guild);

    const embed = new MessageEmbed()
      .setAuthor(message.author.username)
      .setTitle(`xp: ${guildUser.xp}`);

    await message.channel.send(embed);
  }
}
