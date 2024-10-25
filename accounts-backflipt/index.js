import cors from "cors";
// import connection from "./modules/dbConnection.js";
import mail from "./modules/mail.js";
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import requestip from "request-ip";
import { dirname } from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import session from "express-session";
import Users from "./schemas/userSchema.js";
import { hashPassword, comparePassword } from "./modules/encrypt_decrypt.js";
import Admin from "./routes/admin.js";
import Login_Register from "./routes/login_register.js";
import MiddlewareLearning from './routes/MiddlewareLearning.js'
import jwtFile from "./routes/jwt.js";
import appAuth from "./routes/appAuth.js";
import dotenv from "dotenv";
import multer from "multer";
import path from 'path';
dotenv.config();
import conn from "./modules/mongoose.js";
import SessionScheme from "./schemas/sessionSchema.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
let _db = null;
const PORT = 8000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
// app.use(
//   session({ secret: "vishnureddy05011", saveUninitialized: true, resave: true })
// );
// app.use(express.static("static"));

/*
eg: url you searched: localhost:8000/login.html. if the below middleware code is executed then it will redirect to login.html. because we are passing it in url.
    if url is localhost:8000/file_name.html. if file_name exists in the static folder then it will redirected to that file because of middleware.
    static folder has public access. once the middleware hits it will redirect to file comes as params. if no file is there then it will redirect to index.html in static folder
    if index.html is not there then it will redirect to fallback route
*/
app.use(express.static(__dirname + '/static'));
// console.log(process.env.JWT_KEY); // usage of environmental variables



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      // Specify the destination directory
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {

    /*first argument is err. if some error comes up. we can pass that error to the call back function.
      currently no errors present. Hence passing null.
    */
      cb(null, file.originalname);
  }
});

const upload = multer({storage: storage});

const my_function = async (req, res, next) => {};
// app.use(my_function);

app.get("/", function (req, res) {
  // if the person is not logged in and hitting some route. from the backend only you can write some middleware and redirect to login page
  // res.sendFile(__dirname + "/static/login.html");
  res.redirect("http://localhost:8080/");
});

/*
// This code is for MongoDB connection
connection.connectToDb((err) => {
  if (err) return;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
  });
  _db = connection.getDb();
});
*/

const handleErrors = (err) => {
  console.log(err.message);
if(err.message.includes('User validation failed')) {
    let errors = {email: '', password: ''};
    Object.values(err.errors).forEach((item) => {
      errors[item.path] = item.properties.message;
    });
    return errors;
  }
};


const checkSession = async (req, res, next) => {
  try {
    const { username, session_id } = req.params;
    const session = await _db.collection("sessions").findOne({
      username: username,
      session_id: session_id,
      active: "true",
    });

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    // Session is valid, attach relevant session information to the request
    req.username = username;
    req.session_id = session_id;
    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error("Session check failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

app.get("/logout/:user/:session_id/", async (req, res) => {
  let user = req.params["user"];
  let session_id = req.params["session_id"];
  var myquery = { username: user, session_id: session_id };
  var newvalues = {
    $set: { active: "false", endtime: Date() },
  };
  await _db
    .collection("sessions")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });
  res.send({ successful: 100 });
});

app.get(
  "/users/:username/:session_id/",
  async (req, res, next) => {
    req.username = req.params["username"];
    req.session_id = req.params["session_id"];
    req.receivedfrom = "users";
    let result = await _db.collection("users").find({}).toArray();
    result.map((person) => delete person.password);
    req.data = result;
    next();
  },
  checkSession
);

app.post(
  "/change_password/:user/:session_id/",
  async (req, res, next) => {
    var user = req.params["user"];
    req.username = user;
    req.session_id = req.params["session_id"];
    var myquery = { username: user };
    req.body.npassword = await hashPassword(req.body.npassword);
    var newvalues = {
      $set: { username: user, password: req.body.npassword },
    };
    _db.collection("users").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });
    req.data = "updated";
    next();
  },
  checkSession
);

app.post(
  "/create_user/:username/:session_id/",
  async (req, res, next) => {
    req.username = req.params["username"];
    req.session_id = req.params["session_id"];
    var pemail = req.body.pemail;
    var text = `Your email id is: ${req.body.email}\n Your password is : ${req.body.password}`;
    var subject = "User credentials:";
    mail(pemail, text, subject);
    req.body.password = await hashPassword(req.body.password);
    req.body.username = "";
    req.body.deleted = "false";
    req.body.admin = "false";
    let result = _db.collection("users").insertOne(req.body);
    req.data = "successful";
    next();
  },
  checkSession
);

app.post(
  "/update_profile/:username/:session_id/",
  async (req, res, next) => {
    var username = req.params["username"];
    req.username = username;
    req.session_id = req.params["session_id"];
    var temp = req.body;
    var myquery = { username: username };
    var newvalues = {
      $set: temp,
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    req.data = "successful";
    next();
  },
  checkSession
);

app.get(
  "/delete_user/:username/:user/:session_id/",
  async (req, res, next) => {
    let user = req.params["username"];
    let deletedby = req.params["user"];
    req.username = deletedby;
    req.session_id = req.params["session_id"];
    var myquery = { username: user };
    var newvalues = {
      $set: { deleted: "true", deletedby: deletedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    req.data = "successful";
    next();
  },
  checkSession
);

app.get(
  "/add_user/:username/:user/:session_id/",
  async (req, res, next) => {
    let user = req.params["username"]; // req.params.username also works
    let deletedby = req.params["user"];
    req.username = deletedby;
    req.session_id = req.params["session_id"];
    var myquery = { username: user };
    var newvalues = {
      $set: { deleted: "false", deletedby: deletedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    req.data = "successful";
    next();
  },
  checkSession
);

app.get(
  "/display_active_users/:username/:session_id/",
  async (req, res, next) => {
    req.username = req.params["username"];
    req.session_id = req.params["session_id"];
    let result = await _db
      .collection("sessions")
      .find({ active: "true" })
      .toArray();
    var active;
    active = result.map((row) => {
      return row.username;
    });
    var final_res = [...new Set(active)];
    req.data = final_res;
    next();
  },
  checkSession
);

app.get(
  "/display_non_active_users/:username/:session_id/",
  async (req, res, next) => {
    req.username = req.params["username"];
    req.session_id = req.params["session_id"];
    let result = await _db
      .collection("sessions")
      .find({ active: "false" })
      .toArray();
    result.map((person) => delete person.password);
    var non_active;
    non_active = result.map((row) => {
      return row.username;
    });
    var final_res = [...new Set(non_active)];
    req.data = final_res;
    next();
  },
  checkSession
);

app.get(
  "/update_role/:username/:role/:updatedby/:session_id/",
  async (req, res, next) => {
    req.username = req.params["updatedby"];
    req.session_id = req.params["session_id"];
    const username = req.params["username"];
    const role = req.params["role"];
    const updatedby = req.params["updatedby"];
    var myquery = { username: username };
    var newvalues = {
      $set: { role: role, updatedby: updatedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    req.data = "updated";
    next();
  },
  checkSession
);

app.get("/health", (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: "Ok",
    date: new Date(),
  };

  res.status(200).send(data);
});

/*upload.single("file"). you mentioned file. this should match with the type that you are sending from frontend.
  for accepting multiple files you can use upload.multiple("file")
*/ 
app.get("/api/upload", upload.single("file"), (req, res) => {
  // for accessing query params. you have to use req.query.username;
  console.log(req.query);
  console.log(req.params);
  res.status(200).send({"file_data": req.file, msg: "file uploaded successfully"});
});

app.get("/test/", (req, res) => {});


app.use(appAuth);
app.use("/", Admin);
app.use("/", Login_Register);
app.use("/", jwtFile);
app.use("/", MiddlewareLearning);


// fall back route. if the routes not matches. it will fallback to this. keep it at the end of all routes.
app.get("*", (req, res) => {
  res.status(200).send("url not found");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
