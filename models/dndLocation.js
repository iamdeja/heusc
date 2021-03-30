import mongoose from "mongoose";

const { Schema } = mongoose;

mongoose.set("useFindAndModify", false);

const dndLocationSchema = new Schema(
  {
    _id: String,
    name: { type: String, required: true },
    description: String,
    pictureURL: String,
  },
  { collection: "locations" }
);

export default mongoose.model("Location", dndLocationSchema);
