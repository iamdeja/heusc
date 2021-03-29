import dotenv from "dotenv";
import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import { readdirSync } from "fs";
import User from "./models/user.js";
import { addGuildXp, createUser } from "./commands/helpers/guildFunctions.js";

dotenv.config();
const mongoDB = process.env.DBURL;

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

// Database stuff.
console.log("Establishing connection to database. . .");
mongoose
  .connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
  })
  .catch(console.error);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Database connection successful."));

// Discord stuff.
const bot = new Client();

bot.once("ready", () => {
  console.log("Starting bot. . .");
  console.log("Ready!");

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

//const guilds = new Map();

const xpCooldowns = new Collection();

bot.on("message", async (message) => {
  if (message.author.bot) return;

  /*if (!guilds.has(message.guild.id)) {
        guilds.set(message.guild.id, new Collection());
    }*/

  const now = Date.now();
  if (!xpCooldowns.has(message.author.id)) {
    xpCooldowns.set(message.author.id, now);
    setTimeout(() => xpCooldowns.delete(message.author.id), 1000 * 60);

    let user = await User.findById(message.author.id);
    if (!user) user = await createUser(message.author, message.guild);

    console.log("Adding xp");
    addGuildXp(user, message.guild).catch(console.error);
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (!cmd) return;

  const command = bot.commands.get(cmd);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    await message.reply("there was an error trying to execute that command!");
  }
});

//bot.on("guildCreate", async guild => {
//    console.log("New server");
//    guild.members.fetch().then(console.log).catch(console.error);
//});

bot.login(process.env.TOKEN).catch(console.error);