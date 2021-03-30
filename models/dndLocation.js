import mongoose from "mongoose";

const { Schema } = mongoose;

mongoose.set("useFindAndModify", false);

const dndLocationSchema = new Schema(
  {
    _id: String,
    name: String,
    description: String,
  },
  { collection: "locations" }
);

export default mongoose.model("Location", dndLocationSchema);
