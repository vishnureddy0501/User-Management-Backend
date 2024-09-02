import mongoose from "mongoose";
const Schema = mongoose.Schema;

const User = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    admin: {
      type: Boolean,
      default: false,
      required: true,
    },
    role: {
      type: String,
    },
  },
  { collection: "users", timestamps: true }
);

export default new mongoose.model("User", User);
