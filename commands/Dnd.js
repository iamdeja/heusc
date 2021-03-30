import Command from "./base/Command";
import PC from "../models/dndPc";
import Location from "../models/dndLocation";
import { getUserFromLink } from "./helpers/guildFunctions";
import { createLocationEmbed, createPCEmbed } from "./helpers/embeds";
import { updateLocation, updatePC } from "./helpers/updateQueries";
import {
  formatUpdateLocationQuery,
  formatUpdatePCQuery,
} from "./helpers/formatQueries";
import { parseArguments } from "./helpers/io";

// Suffix to handle multiple PCs for future campaigns.
const suffix = "_1";

const info =
  "A tool to get Dungeons & Dragons player and location information.\n" +
  "Submodules: `pc`, `loc`\n\n" +
  "Call `dnd <submodule> help` for more details.";

const cmdCallError = "Wrong command usage. Call `dnd help` for help.";
const cmdParseError = "Could not parse arguments. Please check your syntax.";

const pcHelp = "Use `dnd pc help` for more information.";
const pcOptions = "--name, --race, --class, --bio, --image | --pic";
const pcResponses = {
  generalHelp:
    "```\n" +
    "Usage: dnd pc <player_id>                fetch PC information\n" +
    "   or: dnd pc <player_id> set [options]  update PC information\n" +
    "\n" +
    `Options: ${pcOptions}\n\n` +
    "Options not followed by values are reset.\n" +
    "```",
  updateSyntaxError: `The correct usage is \`dnd pc <player_id> set [options]\`. ${pcHelp}`,
  updateSuccess: "PC successfully updated.",
  updateFailure: "PC could not be updated.",
};

const locHelp = "Use `dnd loc help` for more information.";
const locOptions = "--name, --desc";
const locResponses = {
  generalHelp:
    "```\n" +
    "Usage: dnd loc <loc_id>                fetch information about a location\n" +
    "   or: dnd loc <loc_id> set [options]  update information for a location\n" +
    "   or: dnd loc list                    fetch a list of locations and IDs\n" +
    "\n" +
    `Options: ${locOptions}\n\n` +
    "Options not followed by values are reset. " +
    "Location IDs may not contain spaces.\n" +
    "```",
  updateSyntaxError:
    `The correct usage is \`dnd loc <location_id> set [options]\`. ${locHelp}\n` +
    "Do you have a space in the location ID?",
  updateSuccess: "Location successfully updated.",
  updateFailure: "Location could not be updated.",
};

const handlePCUpdate = async (message, args) => {
  if (args[2] !== "set")
    return message.channel.send(pcResponses.updateSyntaxError);

  const playerId = args[1].toLowerCase();
  let userId = await getUserFromLink(playerId);
  if (!userId) return message.channel.send("No user with this id found.");
  userId += suffix;

  const parameters = parseArguments(args.slice(3));
  if (!parameters) return message.channel.send(cmdParseError);

  const mongoOptions = formatUpdatePCQuery(parameters);
  const updateResult = await updatePC(userId, mongoOptions);
  return message.channel.send(
    updateResult ? pcResponses.updateSuccess : pcResponses.updateFailure
  );
};

const handleLocationUpdate = async (message, args) => {
  if (args[2] !== "set")
    return message.channel.send(locResponses.updateSyntaxError);

  const locationId = args[1].toLowerCase();
  const parameters = parseArguments(args.slice(3));
  if (!parameters) return message.channel.send(cmdParseError);

  // A location's name is required!
  if (!("name" in parameters)) parameters.name = locationId;

  const mongoOptions = formatUpdateLocationQuery(parameters);
  const updateResult = updateLocation(locationId, mongoOptions);
  return message.channel.send(
    updateResult ? locResponses.updateSuccess : locResponses.updateFailure
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

// This method works for a relatively low number of locations.
// Loading all locations into memory as the list grows
// or even displaying them in an embed or single message on Discord
// is not efficient.
const handleAllLocationsFetch = async (message) => {
  const rawLocationsList = await Location.find({}).exec();
  let listMessage = "List of all locations with their IDs:\n";
  listMessage += "```";
  rawLocationsList.forEach((location) => {
    listMessage += `${location.name}: ${location.id}\n`;
  });
  listMessage += "```";
  return message.channel.send(listMessage);
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
        if (args[1]) {
          if (args[1] === "help")
            return message.channel.send(pcResponses.generalHelp);
          return handlePCFetch(message, args);
        }
        return message.channel.send(cmdCallError);
      case "loc":
        if (args[2]) return handleLocationUpdate(message, args);
        if (args[1]) {
          if (args[1] === "list") return handleAllLocationsFetch(message);
          if (args[1] === "help")
            return message.channel.send(locResponses.generalHelp);
          return handleLocationFetch(message, args);
        }
        return message.channel.send(cmdCallError);
      case "info":
      case "help":
        return message.channel.send(info);
      default:
        return message.channel.send(
          "Ambiguous usage. See `dnd help` for proper syntax."
        );
    }
  }
}
