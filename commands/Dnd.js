import { MessageEmbed } from "discord.js";
import Command from "./base/Command";
import Pc from "../models/dndPc";
import { getUserFromLink } from "./helpers/guildFunctions";

// Suffix to handle multiple PCs for future campaigns.
const suffix = "_1";

const fixedResponses = {
  pcCallError: "???",
  pcArgumentParseError: "Could not parse arguments. Please check your syntax.",
  pcUpdateSuccess: "PC successfully updated. View using `dnd player-nick`.",
  pcUpdateFailure: "Something went wrong. The PC could not be updated.",
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

const formatForMongoQuery = (rawObject) => {
  const options = {};

  for (const [key, value] of Object.entries(rawObject)) {
    // if (key !== "bio") {
    //   value = value.toLowerCase();
    //   value = value.charAt(0).toUpperCase() + value.slice(1);
    // }

    // Invalid options are simply dropped.
    // eslint-disable-next-line default-case
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

const handlePCUpdate = async (message, args) => {
  if (args[2] !== "set")
    return message.channel.send(fixedResponses.pcCallError);

  const playerId = args[1];
  let userId = await getUserFromLink(playerId.toLowerCase());
  if (!userId) return message.channel.send("No user with this id found.");
  userId += suffix;

  const pcArgs = args.slice(3);

  const inputOptions = {};
  let error = false;
  for (let i = 0; i < pcArgs.length; ++i) {
    const arg = pcArgs[i];

    if (arg[0] !== "-" && arg[1] !== "-") {
      error = true;
      break;
    }

    const values = [];

    while (pcArgs[i + 1] && pcArgs[i + 1][0] !== "-") {
      i += 1;
      values.push(pcArgs[i]);
    }

    inputOptions[arg.slice(2)] = values.join(" ");
  }

  if (error) return message.channel.send(fixedResponses.pcArgumentParseError);

  const mongoOptions = formatForMongoQuery(inputOptions);
  const updateResult = await updatePc(userId, mongoOptions);
  return message.channel.send(
    updateResult
      ? fixedResponses.pcUpdateSuccess
      : fixedResponses.pcUpdateFailure
  );
};

const createPCEmbed = (user, pc) =>
  new MessageEmbed()
    .setAuthor(user.user.tag, user.user.displayAvatarURL())
    .setColor(user.displayColor)
    .setTitle(pc.name ?? "-")
    .setDescription(pc.bio ?? "-")
    .addField("Race", pc.race ?? "-")
    .addField("Class", pc.class ?? "-");

const handlePCFetch = async (message, args) => {
  const userId = await getUserFromLink(args[1]);
  if (!userId) return message.channel.send("No user with this id found.");

  let user;
  try {
    user = await message.guild.members.fetch(userId);
  } catch (e) {
    return message.channel.send(
      "Member not found. The bot is designed only for usage within Sea of Decay."
    );
  }

  const pc = await Pc.findById(userId + suffix);
  if (!pc) return message.channel.send("No player character for this user.");

  return message.channel.send(createPCEmbed(user, pc));
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
        if (args[2]) return handlePCUpdate(message, args);
        if (args[1]) return handlePCFetch(message, args);
        return message.channel.send(fixedResponses.pcCallError);
      default:
        return null;
    }
  }
}
