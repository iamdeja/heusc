import Command from "./base/Command.js";
import Pc from "../models/dndPc.js";
import { getUserFromLink } from "./helpers/guildFunctions.js";
import { MessageEmbed } from "discord.js";

const handlePC = async (message, args) => {
  if (!args[1]) {
    return message.channel.send("Wrong usage. Help coming when I'm not lazy.");
  }

  if (args[1] === "set") {
    args = args.slice(2);
    const options = {};
    let error = false;

    for (let i = 0; i < args.length; i += 2) {
      const arg = args[i];
      if (arg[0] !== "-" && arg[1] !== "-") {
        error = true;
        break;
      }
      options[arg.slice(2)] = args[i + 1].replace(/_/g, " ");
    }

    if (error) {
      return message.channel.send(
        "Could not parse arguments. Please recheck your syntax!"
      );
    }

    let userId;

    if (options.hasOwnProperty("id")) {
      userId = await getUserFromLink(options.id.toLowerCase());
      if (!userId) return message.channel.send("No user with this id found.");
    } else return message.channel.send("You must specify an user id.");

    userId += "_1";

    const mongoOptions = {};

    for (let [key, value] of Object.entries(options)) {
      /*if (key !== "bio") {
              value = value.toLowerCase();
              value = value.charAt(0).toUpperCase() + value.slice(1);
            }*/

      switch (key) {
        case "name":
          mongoOptions.name = value;
          break;
        case "race":
          mongoOptions.race = value;
          break;
        case "class":
          mongoOptions.class = value;
          break;
        case "pictureURL":
          mongoOptions.pictureURL = value;
          break;
        case "bio":
          mongoOptions.bio = value;
          break;
      }
    }

    try {
      await Pc.findByIdAndUpdate(
        userId,
        { $set: mongoOptions },
        { upsert: true }
      ).exec();
      return message.channel.send(
        "PC successfully updated. View using `dnd id`."
      );
    } catch (e) {
      console.error(e);
      return message.channel.send(
        "Something went wrong. The character could not be updated."
      );
    }
  }
};

export default class Dnd extends Command {
  constructor() {
    super({
      name: "dnd",
      description: "Dungeons & Dragons related stuff.",
    });
  }

  async execute(message, args) {
    switch (args[0]) {
      case "pc":
      case "PC":
        await handlePC(message, args);
        break;
      default:
        const userId = await getUserFromLink(args[0]);
        if (!userId) return message.channel.send("No user with this id found.");

        let user;
        try {
          user = await message.guild.members.fetch(userId);
        } catch (e) {
          return message.channel.send(
            "Member not found. The bot is designed only for usage within Sea of Decay."
          );
        }

        const pc = await Pc.findById(`${userId}_1`);
        if (!pc) {
          return message.channel.send("No player character for this user.");
        }

        const embed = new MessageEmbed()
          .setAuthor(user.user.tag, user.user.displayAvatarURL())
          //.setImage(user.user.displayAvatarURL())
          .setColor(user.displayColor)
          .setTitle(pc.name ?? "-")
          .setDescription(pc.bio ?? "-")
          .addField("Race", pc.race ?? "-")
          .addField("Class", pc.class ?? "-");
        return message.channel.send(embed);
    }
  }
}
