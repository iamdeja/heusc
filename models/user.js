import mongoose from "mongoose";

const { Schema } = mongoose;

const userGuildSchema = new Schema({
  _id: String,
  balance: { type: Number, default: 0, required: true },
  xp: { type: Number, default: 0, required: true },
});

const userGlobalSchema = new Schema(
  {
    _id: String,
    name: String,
    balance: { type: Number, default: 0, required: true },
    servers: [userGuildSchema],
  },
  { collection: "users" }
);

export default mongoose.model("User", userGlobalSchema);
