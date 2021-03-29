import mongoose from "mongoose";

const { Schema } = mongoose;

const memberLookupSchema = new Schema(
  {
    _id: String,
    discordId: String,
  },
  { collection: "lookup" }
);

export default mongoose.model("Link", memberLookupSchema);
