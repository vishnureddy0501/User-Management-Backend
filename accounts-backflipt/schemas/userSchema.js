import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail.js";
const Schema = mongoose.Schema;


const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "please enter a email"],
      validate: [isEmail, "please enter valid email"]
    },
    password: {
      type: String,
      required: [true, "please enter a password"],
      minLength: [6, "minimum password length is 6"],
    }
  },
  { collection: "users", strict: false }
);

// these are called mongoose hooks

userSchema.pre('save', function (next) {
  console.log("after document saving to DB", this);
  next();
});

userSchema.post('save', function (doc, next) {
  // arrow functions don't have access to this keyword. Normal functions has access to this keyword
  console.log("just before document saving to DB", doc);
  next();
});

export default new mongoose.model("User", userSchema);
