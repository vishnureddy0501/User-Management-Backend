import cors from "cors";
import connection from "../modules/dbConnection.js";
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
// import conn from "../modules/mongoose.js";
const saltRounds = 10;
import cookieParser from "cookie-parser";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import Users from "../schemas/userSchema.js";
import SessionScheme from "../schemas/sessionSchema.js";

const app = express();
let _db = null;

connection.connectToDb((err) => {
  if (err) return;
  _db = connection.getDb();
});
const PORT = 8000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// app.use(cookieParser());
// const oneDay = 1000 * 60 * 60 * 24;
// app.use(
//   session({
//     secret: "DE5LF3NtIZbO1ggne4naKWtKPsS",
//     saveUninitialized: true,
//     cookie: { httpOnly: true },
//     resave: true,
//   })
// );

app.post("/user_login", async (req, res) => {
  try {
    Users.findOne({ username: req.body.username }, async (err, doc) => {
      if (err) {
        res.send(false);
      } else {
        if (doc === null) {
          res.send(false);
          return;
        }
        if (req.body.password === "") {
          res.send(false);
        } else {
          if (await bcrypt.compare(req.body.password, doc.password)) {
            let temp = {
              session_id: req.sessionID,
              username: req.body.username,
              role: doc.role,
              admin: doc.admin,
              active: "true",
              starttime: Date(),
            };
            const newSession = new SessionScheme(temp);
            newSession.save((err, newSes) => {
              if (!err)
                res.status(200).send({
                  ...temp,
                  from: req.body.from ? req.body.from : "accounts",
                  host: req.body.host,
                  protocol: req.body.protocol,
                });
              else res.status(500).send(false);
            });
          } else {
            res.send(false);
          }
        }
      }
    });
  } catch (err) {
    request.send(false);
  }
});

app.post("/checkAuth", (req, res) => {
  SessionScheme.findOneAndUpdate(
    { session_id: req.body.session_id },
    { updatedAt: new Date() },
    { new: true },
    (err, doc) => {
      if (doc) {
        res.send([true, doc.admin]);
      } else {
        res.send(false);
      }
    }
  );
});
app.get("/users", async (req, res) => {
  let users = await Users.find({}).select(
    "username email role team admin -_id"
  );
  res.send(users);
});

app.post("/clearSession", (req, res) => {
  SessionScheme.findOneAndDelete(
    { session_id: req.body.session_id },
    (err, session) => {
      err ? res.send(false) : res.send(true);
    }
  );
});

app.get("/userName/:session_id", (req, res) => {
  SessionScheme.findOne({ session_id: req.params.session_id }, (err, doc) => {
    if (!err) res.send(doc.username);
    else res.send(null);
  });
});

export default app;
