import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import Users from "../schemas/userSchema.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;


const createToken = (id) => {
  // expiresIn need to be in seconds. so dividing oneDay by 1000
  const oneDayInSeconds = oneDay / 1000;
 return jwt.sign({id}, 'this is my secret key', { expiresIn: 2*oneDayInSeconds });
}

// create new user route
app.post(
  "/new_user/:email/:password/",
  async (req, res, next) => {
    try {
      const email = req.params.email;
      const password = req.params.password;
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ error: "Email id already registered" });
      } else {
          let result = await Users.create({email, password});
          res.status(200).send({msg: "successfully"});
      }
    } catch (err){
     const errors =  handleErrors(err);
     res.status(400).send({errors});
    }
  }
);

// user login page
app.get(
  "/new_user_login/:email/:password/",
  async (req, res, next) => {
    // return res.redirect('http://localhost:8080');
    try {
      const email = req.params.email;
      const password = req.params.password;
      const existingUser = await Users.findOne({ email, password });
      if (existingUser) {
        const token = createToken(existingUser._id);
        res.cookie('jwt', token, {maxAge: oneDay *2, httpOnly: true});
        return res.status(200).send({ id: existingUser._id });
      } else {
        res.status(200).send({error: "email or password invalid"});
      }
    } catch (err){
     res.status(400).send({error: "unknown error occured"});
    }
  }
);

const validateToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if(token) {
    jwt.verify(token, 'this is my secret key', async (err, decodedToken) => {
      if (err) {
        return res.status(200).send({authentication: false});
        // if authentication is false in response then redirect to login page in UI
      }
      let user = await Users.findById(decodedToken.id);
      req.userData = user; // you can update req like this and this can be accessed in next middlewares and routes that are being called
      next();
    });
  } else {
    return res.status(200).send({authentication: false});
  }
}

app.get("/read-cookies", validateToken, async (req, res) => {
  let result = await Users.find({}); // returns all users from DB.
  // console.log(result);

  const id = "6406ca2ef93e1f55fc954348";
  const userData = await Users.findById(id);
  userData.email = "vis@aviso.com";

  if(!userData) {
    return res.status(200).send({message: "user not found"});
  }
  const findUserById = await Users.findByIdAndUpdate(id, userData);

  const updatedData = await Users.findById(id);
  console.log(updatedData);


  const cookies = req.cookies;
  return res.json(cookies);
});


app.get(
  "/new_logout/",
  async (req, res, next) => {
    // this code is nothing but deleting the cookie. we are giving empty string to jwt and the expiry time is also 1sec. which is very very less.
    res.cookie('jwt', '', {maxAge: 1});

    res.redirect("/some_route"); // redirect to some_route. some_route contains logic for redirecting to login page.
  }
);

// with jwt authentication

app.get("/set-cookie", (req, res) => {
  // res.setHeader("Set-Cookie", "newUser=true"); this also works for setting cookie

  res.cookie('newUser', 'yes'); // this works with cookie-parse package

  /*
      cookie with expiry time
      httpOnly keeps the cookie secure. Setting the httpOnly attribute on a cookie makes it accessible only through HTTP(S) requests and not via client-side JavaScript. 
      console.log(document.cookie); "isEmployee" cookie will not be displayed
  */
  res.cookie('isEmployee', true, {maxAge: oneDay, httpOnly: true});
  res.status(200).send("you goot cookies");
});

export default app;