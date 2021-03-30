import { MessageEmbed } from "discord.js";

export const createPCEmbed = (user, pc) =>
  new MessageEmbed()
    .setAuthor(user.user.tag, user.user.displayAvatarURL())
    .setColor(user.displayColor)
    .setThumbnail(pc.pictureURL)
    .setTitle(pc.name ?? "-")
    .setDescription(pc.bio ?? "-")
    .addField("Race", pc.race ?? "-")
    .addField("Class", pc.class ?? "-");

export const createLocationEmbed = (location) =>
  new MessageEmbed()
    .setTitle(location.name)
    .setDescription(location.description ?? "-")
    .setImage(location.pictureURL);
