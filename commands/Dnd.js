import Command from "./base/Command.js";
import Pc from "../models/dndPc.js";
import { getUserFromLink } from "./helpers/guildFunctions.js";
import { MessageEmbed } from "discord.js";

const fixedResponses = {
  pcCallError:
    "Wrong command usage. Correct usage is `dnd pc set --id player-nick [arguments]`.",
  pcArgumentParseError: "Could not parse arguments. Please check your syntax.",
  pcUpdateSuccess: "PC successfully updated. View using `dnd player-nick`.",
  pcUpdateFailure: "Something went wrong. The PC could not be updated.",
};

const handlePCUpdate = async (message, args) => {
  if (!args[1] || args[1] !== "set")
    return message.channel.send(fixedResponses.pcCallError);
  args = args.slice(2);

  const inputOptions = {};
  let error = false;
  for (let i = 0; i < args.length; i += 2) {
    const arg = args[i];
    if (arg[0] !== "-" && arg[1] !== "-") {
      error = true;
      break;
    }
    inputOptions[arg.slice(2)] = args[i + 1].replace(/_/g, " ");
  }

  if (error) return message.channel.send(fixedResponses.pcArgumentParseError);

  let userId;
  if (inputOptions.hasOwnProperty("id")) {
    userId = await getUserFromLink(inputOptions.id.toLowerCase());
    if (!userId) return message.channel.send("No user with this id found.");
  } else return message.channel.send("You must specify a user id.");

  // Suffix to handle multiple PCs for future campaigns.
  userId += "_1";

  const mongoOptions = formatForMongoQuery(inputOptions);
  const updateResult = await updatePc(userId, mongoOptions);
  message.channel.send(
    updateResult
      ? fixedResponses.pcUpdateSuccess
      : fixedResponses.pcUpdateFailure
  );
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
        await handlePCUpdate(message, args);
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
        if (!pc)
          return message.channel.send("No player character for this user.");

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

const formatForMongoQuery = (rawObject) => {
  const options = {};

  for (let [key, value] of Object.entries(rawObject)) {
    // if (key !== "bio") {
    //   value = value.toLowerCase();
    //   value = value.charAt(0).toUpperCase() + value.slice(1);
    // }

    // Invalid options are simply dropped.
    switch (key) {
      case "name":
        options.name = value;
        break;
      case "race":
        options.race = value;
        break;
      case "class":
        options.class = value;
        break;
      case "pictureURL":
        options.pictureURL = value;
        break;
      case "bio":
        options.bio = value;
        break;
    }
  }

  return options;
};

const updatePc = async (id, options) => {
  try {
    await Pc.findByIdAndUpdate(id, { $set: options }, { upsert: true }).exec();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
