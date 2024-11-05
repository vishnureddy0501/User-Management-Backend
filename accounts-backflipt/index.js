import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import Admin from "./routes/admin.js";
import mongoose from "mongoose";
import Login_Register from "./routes/login_register.js";
import MiddlewareLearning from "./routes/MiddlewareLearning.js";
import jwtFile from "./routes/jwt.js";
import appAuth from "./routes/appAuth.js";
import Users from "./schemas/userSchema.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/all_users", async (req, res, next) => {
  const users = await Users.find({});
  return res.status(200).send({ users: users });
});

app.get("/", async (req, res, next) => {
  return res.redirect("https://vue-frontend-jcz9.onrender.com");
});

app.post("/insert_new_user", async (req, res, next) => {
  const data = req.body;
  const users = await Users.findOneAndUpdate(
    { email: data.email },
    { $set: { ...data } },
    { new: true }
  );
  return res.status(200).send({ users: users });
});

app.get("/delete_user", async (req, res, next) => {
  const data = req.body;
  const result = await Users.findOneAndDelete({ email: data.email });
  if (!result) {
    res.status(400).send({ message: "usernotfound" });
  }
  return res.status(200).send({ users: users });
});

app.use(appAuth);
app.use("/", Admin);
app.use("/", Login_Register);
app.use("/", jwtFile);
app.use("/", MiddlewareLearning);

// fall back route. keep it at the end of all routes.
app.get("*", (req, res) => {
  res.status(200).send("url not found");
});

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    const PORT = 8500;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/`);
    });
  })
  .catch(() => {
    console.log("failed");
  });
