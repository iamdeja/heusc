import mongoose from "mongoose";

const { Schema } = mongoose;

mongoose.set("useFindAndModify", false);

const dndPcSchema = new Schema(
  {
    _id: String,
    name: String,
    race: String,
    class: String,
    pictureURL: String,
    features: { type: Map, of: String },
    bio: String,
  },
  { collection: "pcs" }
);

export default mongoose.model("PC", dndPcSchema);
