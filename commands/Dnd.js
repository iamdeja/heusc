import { MessageEmbed } from "discord.js";
import Command from "./base/Command";
import PC from "../models/dndPc";
import { getUserFromLink } from "./helpers/guildFunctions";

// Suffix to handle multiple PCs for future campaigns.
const suffix = "_1";

const help =
  "```\n" +
  "Dungeons and Dragons.\n" +
  "\n" +
  "Usage:\n" +
  "  dnd pc <player_name> [set] [pc_options]\n" +
  "  dnd loc <location_name> [set] <description>\n" +
  "\n" +
  "Options:\n" +
  "  pc: --name, --race, --class, --bio, [--image | --pic]\n" +
  "\n" +
  "All options must be followed by a value, else the respective fields are cleared.\n" +
  "```";

const fixedResponses = {
  pcCallError: `Wrong command usage.\n${help}`,
  pcArgumentParseError: "Could not parse arguments. Please check your syntax.",
  pcUpdateSuccess: "PC successfully updated. View using `dnd pc <nickname>`.",
  pcUpdateFailure: "Something went wrong. The PC could not be updated.",
};

const updatePC = async (id, options) => {
  try {
    await PC.findByIdAndUpdate(id, { $set: options }, { upsert: true }).exec();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const formatForMongoQuery = (rawObject) => {
  const options = {};

  for (const [option, argument] of Object.entries(rawObject)) {
    const value = argument.charAt(0).toUpperCase() + argument.slice(1);

    // Invalid options are simply dropped.
    // eslint-disable-next-line default-case
    switch (option) {
      case "name":
        options.name = value;
        break;
      case "race":
        options.race = value;
        break;
      case "class":
        options.class = value;
        break;
      case "bio":
        options.bio = value;
        break;
      case "image":
      case "pic":
        options.pictureURL = value;
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
  const updateResult = await updatePC(userId, mongoOptions);
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
    .setThumbnail(pc.pictureURL)
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

  const pc = await PC.findById(userId + suffix);
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
    const subcommand = args[0] ? args[0].toLowerCase() : args[0];
    switch (subcommand) {
      case "pc":
        if (args[2]) return handlePCUpdate(message, args);
        if (args[1]) return handlePCFetch(message, args);
        return message.channel.send(fixedResponses.pcCallError);
      case "loc":
        return message.channel.send("Location command not available yet.");
      case "help":
        return message.channel.send(help);
      default:
        return message.channel.send(
          "Ambiguous usage. Use `dnd help` to get help."
        );
    }
  }
}
