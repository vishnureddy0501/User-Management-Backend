import express, { Router } from "express";
import connection from "../modules/dbConnection.js";
import { hashPassword, comparePassword } from "../modules/encrypt_decrypt.js";
import mail from "../modules/mail.js";
let _db = null;
const router = express.Router();

connection.connectToDb((err) => {
  if (err) return;
  _db = connection.getDb();
});

router.post("/registration", async (req, res) => {
  let result = await _db
    .collection("users")
    .find({ email: req.body.email })
    .toArray();
  if (result.length != 0) {
    var match = await comparePassword(req.body.password, result[0].password);
    if (match == true) {
      var temp = req.body;
      delete temp.password;
      req.registeredon = Date();
      var myquery = { email: req.body.email };
      var newvalues = {
        $set: temp,
      };
      await _db
        .collection("users")
        .updateOne(myquery, newvalues, function (err, res) {
          if (err) {
            throw err;
          }
        });
      res.status(200).json({ successful: 100 });
    } else {
      res.send(false);
    }
  } else {
    res.send(false);
  }
});

router.get("/roles", async (req, res) => {
  let result = await _db.collection("roles").find({}).toArray();
  res.send(result[0].roles);
});

router.get("/display_all_emails", async (req, res) => {
  let result = await _db.collection("users").find({}).toArray();
  var active;
  active = result.map((row) => {
    return row.email;
  });
  var final_res = [...new Set(active)];
  res.send(final_res);
});

router.post("/forgot_password", async (req, res) => {
  var myquery = { username: req.body.username, email: req.body.email };
  var password = Math.random().toString(36).substring(2, 7);
  var pass = password;
  var text = ` New password is : ${pass}`;
  var subject = "Updating password for User Management:";
  password = await hashPassword(password);
  const update = {
    password: password,
  };
  var newvalues = {
    $set: update,
  };
  let result = await _db
    .collection("users")
    .find({
      username: req.body.username,
      email: req.body.email,
    })
    .toArray();

  if (result.length == 0) {
    res.send(false);
  } else {
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    mail(req.body.email, text, subject);
    res.send(true);
  }
});

router.get("/update_for_all", async (req, res) => {
  var myquery = {};
  const update = {
    deleted: "false",
    active: "true",
  };
  var newvalues = {
    $set: update,
  };
  _db.collection("users").updateMany(myquery, newvalues, function (err, res) {
    if (err) throw err;
  });
  res.status(200).json({ successful: 100 });
});

router.get("/display_all_users", async (req, res) => {
  let result = await _db.collection("users").find({}).toArray();
  var active;
  active = result.map((row) => {
    return row.username;
  });
  var final_res = [...new Set(active)];
  res.send(final_res);
});

router.get("/users/:username/", async (req, res) => {
  let username = req.params["username"];
  let result = await _db
    .collection("users")
    .find({ username: username })
    .toArray();
  result.map((person) => delete person.password);
  res.status(200).json({ user_data: result });
});

export default router;
