import { MessageEmbed } from "discord.js";
import { Link } from "../models/models";
import { getUserFromLink } from "./helpers/guildFunctions";

const lookup = {
  name: "lookup",
  execute: async (message, args) => {
    switch (args[0]) {
      case "set":
        if (!args[1] || !args[2]) {
          return message.channel.send(
            "Wrong arguments! Usage: `set id discord_id`."
          );
        }
        try {
          await Link.create({
            _id: args[1].toLowerCase(),
            discordId: args[2],
          });
          return message.channel.send("Created link!");
        } catch (e) {
          if (e.code === 11000) {
            return message.channel.send(
              "A link with the given id already exists."
            );
          }
          console.log(e.code);
          return message.channel.send("Unknown error in creating link.");
        }
        break;
      case "get":
        if (!args[1]) {
          return message.channel.send("Improper syntax! Usage: " + "`get id`.");
        }
        const discordId = await getUserFromLink(args[1].toLowerCase());
        if (!discordId) {
          return message.channel.send("No user with this id found.");
        }
        let user;
        try {
          user = await message.guild.members.fetch(discordId);
        } catch (e) {
          return message.channel.send(
            "Member not found. The bot is designed only for usage within Sea of Decay."
          );
        }
        const roles = [];
        user.roles.cache.each((role) => {
          roles.push(`\`${role.name}\``);
        });
        roles.pop();
        const embed = new MessageEmbed()
          .setAuthor(user.user.tag, user.user.displayAvatarURL())
          // .setImage(user.user.displayAvatarURL())
          .setColor(user.displayColor)
          .setTitle(user.displayName)
          .setDescription(`Roles: ${roles.join(", ")}`);
        return message.channel.send(embed);
        break;
      default:
        return message.channel.send(
          "Wrong usage. Available arguments: " + "`get, set`."
        );
    }
  },
};

export default lookup;
