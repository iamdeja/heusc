import mongoose from "mongoose";

const { Schema } = mongoose;

mongoose.set("useFindAndModify", false);

const dndNpcSchema = new Schema(
  {
    _id: String,
    name: String,
    pictureURL: String,
    description: String,
  },
  { collection: "npcs" }
);

export default mongoose.model("NPC", dndNpcSchema);
