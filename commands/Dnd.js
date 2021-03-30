import Command from "./base/Command";
import PC from "../models/dndPc";
import Location from "../models/dndLocation";
import { getUserFromLink } from "./helpers/guildFunctions";
import { createLocationEmbed, createPCEmbed } from "./helpers/embeds";
import { updateLocation, updatePC } from "./helpers/updateQueries";
import {formatPCUpdateQuery} from "./helpers/formatQueries";

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
  "All options must be followed by a value, " +
  "else the respective fields are cleared.\n" +
  "```";

const fixedResponses = {
  pcCallError: `Wrong command usage.\n${help}`,
  locCallError: `Wrong command usage.\n${help}`,
  pcArgumentParseError: "Could not parse arguments. Please check your syntax.",
  pcUpdateSuccess:
    "PC successfully updated. View using `dnd pc <player_name>`.",
  pcUpdateFailure: "Something went wrong. The PC could not be updated.",
  locUpdateSuccess: "Location successfully updated.",
  locUpdateFailure: "Something went wrong. The location could not be updated.",
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

  const mongoOptions = formatPCUpdateQuery(inputOptions);
  const updateResult = await updatePC(userId, mongoOptions);
  return message.channel.send(
    updateResult
      ? fixedResponses.pcUpdateSuccess
      : fixedResponses.pcUpdateFailure
  );
};

const handleLocationUpdate = async (message, args) => {
  if (args[2] !== "set")
    return message.channel.send(fixedResponses.locCallError);

  const locationName = args[1];

  const locationArgs = args.slice(3);
  const descriptionWords = [];
  locationArgs.forEach((argument) => descriptionWords.push(argument));

  const updateResult = updateLocation(locationName, descriptionWords.join(" "));
  return message.channel.send(
    updateResult
      ? fixedResponses.locUpdateSuccess
      : fixedResponses.locUpdateFailure
  );
};

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

const handleLocationFetch = async (message, args) => {
  const location = await Location.findById(args[1].toLowerCase());
  if (!location) return message.channel.send("Location not found.");
  return message.channel.send(createLocationEmbed(location));
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
        if (args[2]) return handleLocationUpdate(message, args);
        if (args[1]) return handleLocationFetch(message, args);
        return message.channel.send(fixedResponses.locCallError);
      case "help":
        return message.channel.send(help);
      default:
        return message.channel.send(
          "Ambiguous usage. Use `dnd help` to get help."
        );
    }
  }
}
