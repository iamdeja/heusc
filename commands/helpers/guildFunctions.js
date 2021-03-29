import User from "../../models/user.js";
import Link from "../../models/memberLookup.js";

export const getUserFromLink = async (id) => {
  const link = await Link.findById(id).exec();
  let discordId;
  try {
    discordId = link.discordId;
  } catch (e) {
    return null;
  }
  return discordId;
};

export const getGuildUser = (user, guild) => {
  const guildId = guild.id;
  let guildIndex = -1;

  for (let i = 0; i < user.servers.length; ++i) {
    // eslint-disable-next-line no-underscore-dangle
    if (user.servers[i]._id === guildId) guildIndex = i;
  }

  if (guildIndex === -1) {
    guildIndex = user.servers.length;
    user.servers.push({
      _id: guildId,
      balance: 0,
      xp: 0,
    });
  }

  return user.servers[guildIndex];
};

export const addGuildXp = async (user, guild) => {
  const guildUser = getGuildUser(user, guild);
  guildUser.xp += 1;
  user.save();
};

export const createUser = async (dcUser, guild) =>
  User.create({
    _id: dcUser.id,
    servers: [
      {
        _id: guild.id,
      },
    ],
  });
