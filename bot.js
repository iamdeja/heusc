import dotenv from "dotenv";
import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import commands from "./commands/commands";

// XP MODULES ARE ON AN IMPLEMENTATION BREAK.
// import User from "./models/user";
// import { addGuildXp, createUser } from "./commands/helpers/guildFunctions";

dotenv.config();

// Fancy art.
console.log(" __  __     ______     __  __     ______     ______");
console.log(
  "/\\ \\_\\ \\   /\\  ___\\   /\\ \\/\\ \\   /\\  ___\\   /\\  ___\\"
);
console.log(
  "\\ \\  __ \\  \\ \\  __\\   \\ \\ \\_\\ \\  \\ \\___  \\  \\ \\ \\____"
);
console.log(
  " \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_____\\  \\/\\_____\\  \\ \\_____\\"
);
console.log("  \\/_/\\/_/   \\/_____/   \\/_____/   \\/_____/   \\/_____/");
console.log("                                        version: alpha");
console.log();

// MongoDB
// Might tweak this to be more elegant later on.
// https://mongoosejs.com/docs/connections.html

// Initial connection.
(async () => {
  const mongoDB = process.env.DBURL;
  console.log("Establishing connection to MongoDB...");
  try {
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
    });
  } catch (e) {
    console.error(e);
    // process.exit(1);
  }
  console.log("Established connection to MongoDB.");
})();

// Post initial connection errors.
mongoose.connection.on("error", (e) => {
  console.error(e);
  // process.exit(1);
});

// Discord
console.log("Starting bot...");
const bot = new Client();

bot.once("ready", () => {
  console.log("HEUSC is online!");

  const presenceFn = () => {
    bot.user
      .setPresence({
        status: "online",
        activity: {
          name: "over you",
          type: "WATCHING",
        },
      })
      .catch((error) => console.error(`Error setting presence:\n${error}`));
  };

  setInterval(presenceFn, 1000 * 60 * 60);
  presenceFn();
});

// Commands

const prefix = "!";
bot.commands = new Collection();
commands.forEach((command) => {
  bot.commands.set(command.name, command);
});

// Command Handler

bot.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  // This approach of slicing arguments has downsides.
  // For example, one cannot have spaces in arguments even if they surround
  // them with quotes. Might rethink this later.
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (!cmd) return;

  const command = bot.commands.get(cmd);
  if (!command) return;

  // This is a last resort try-catch block for Discord errors,
  // such as message channel send permissions.
  // All implementation errors should be handled within commands.
  try {
    await command.execute(message, args);
  } catch (e) {
    console.error(e);
    await message.reply("there was an error trying to execute that command!");
  }
});

bot.login(process.env.TOKEN).catch(console.error);
