import { MessageEmbed } from "discord.js";
import Command from "./base/Command";
import User from "../models/user";

export default class Profile extends Command {
  constructor() {
    super({
      name: "profile",
      description: "Setup user profile.",
    });
  }

  async execute(message, args) {
    const user = await User.findById(message.author.id);
    const guildId = message.guild.id;
    let guildUser;

    if (!user) {
      await User.create({
        _id: message.author.id,
        servers: [
          {
            _id: guildId,
          },
        ],
      });
    } else {
      let guildIndex = -1;
      for (let i = 0; i < user.servers.length; ++i) {
        // eslint-disable-next-line no-underscore-dangle
        if (user.servers[i]._id === guildId) guildIndex = i;
      }
      if (guildIndex === -1) return;
      guildUser = user.servers[guildIndex];
    }

    console.log(guildUser);

    if (args[0] === "show") {
      const embed = new MessageEmbed()
        .setAuthor(message.author.username)
        .setFooter("HEUSC ver alpha");
      await message.channel.send(embed);
    }
  }
}
