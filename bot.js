import dotenv from "dotenv";
import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import { readdirSync } from "fs";

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

// This command fetching implementation is subject to change.
// I am not happy with it, however, I don't yet have a better idea.

// Two main issues I have: classes aren't needed, because no command
// has to manage its state, and I'm against arbitrary imports at runtime.
// They would make sense to me only if they could be "hot-swapped".
(async () => {
  const commandFiles = readdirSync("./commands/").filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const { default: CommandConstructor } = await import(`./commands/${file}`);
    const command = new CommandConstructor();
    bot.commands.set(command.name, command);
  }
})();

const prefix = "!";
bot.commands = new Collection();

// const guilds = new Map();
// const xpCooldowns = new Collection();

// Command Handler

bot.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  // if (!guilds.has(message.guild.id)) {
  //   guilds.set(message.guild.id, new Collection());
  // }

  // const now = Date.now();
  // if (!xpCooldowns.has(message.author.id)) {
  //   xpCooldowns.set(message.author.id, now);
  //   setTimeout(() => xpCooldowns.delete(message.author.id), 1000 * 60);
  //
  //   let user = await User.findById(message.author.id);
  //   if (!user) user = await createUser(message.author, message.guild);
  //   console.log("Adding xp");
  //   addGuildXp(user, message.guild).catch(console.error);
  // }

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

// bot.on("guildCreate", async (guild) => {
//   console.log("New server");
//   guild.members.fetch().then(console.log).catch(console.error);
// });

bot.login(process.env.TOKEN).catch(console.error);
