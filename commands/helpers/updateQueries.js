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

export const updateLocation = async (id, options) => {
  try {
    await Location.findByIdAndUpdate(
      id,
      { $set: options },
      { upsert: true }
    ).exec();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
