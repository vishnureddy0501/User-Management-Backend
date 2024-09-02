import express, { Router } from "express";
import connection from "../modules/dbConnection.js";

let _db = null;
const router = express.Router();

connection.connectToDb((err) => {
  if (err) return;
  _db = connection.getDb();
});

router.get("/users_data", async (req, res) => {
  let result = await _db.collection("users").find({}).toArray();
  const filteredusers = result.map((person) => ({
    username: person.username,
    email: person.email,
    team: person.team,
    role: person.role,
    admin: person.admin,
  }));
  res.send(filteredusers);
});

router.get("/users_data/:user/", async (req, res) => {
  var user = req.params["user"];
  let result = await _db.collection("users").find({ username: user }).toArray();
  const filteredusers = result.map((person) => ({
    username: person.username,
    email: person.email,
    team: person.team,
    role: person.role,
    admin: person.admin,
  }));
  res.send(filteredusers);
});

router.get("/change_team/:username/:team", async (req, res) => {
  var username = req.params["username"];
  var myquery = { username: username };
  var newvalues = {
    $set: { team: req.params["team"] },
  };
  await _db
    .collection("users")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });
  res.send({ successful: 100 });
});

router.get("/change_admin/:username/:admin/", async (req, res) => {
  var username = req.params["username"];
  var myquery = { username: username };
  var newvalues = {
    $set: { admin: req.params["admin"] },
  };
  await _db
    .collection("users")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });
  res.send({ successful: 100 });
});

router.get("/display_deleted_users", async (req, res) => {
  let result = await _db
    .collection("users")
    .find({ deleted: "true" })
    .toArray();
  res.send(result);
});

export default router;
