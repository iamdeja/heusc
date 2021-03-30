import PC from "../../models/dndPc";
import Location from "../../models/dndLocation";

export const updatePC = async (id, options) => {
  try {
    await PC.findByIdAndUpdate(id, { $set: options }, { upsert: true }).exec();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const updateLocation = async (name, description) => {
  try {
    await Location.findByIdAndUpdate(
      name.toLowerCase(),
      { $set: { name, description } },
      { upsert: true }
    ).exec();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
