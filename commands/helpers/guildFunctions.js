import { Link } from "../../models/models";

// eslint-disable-next-line import/prefer-default-export
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
