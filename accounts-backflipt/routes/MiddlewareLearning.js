import cors from "cors";
import express from "express";
import Users from "../schemas/userSchema.js";
import bodyParser from "body-parser";
import SessionScheme from "../schemas/sessionSchema.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
const commonMiddlewareForThisFile = (req, res, next) => {
    console.log("executing common middleware");
    next();
}

// just need to pass the reference of the function in the middleware. dont call the function.
app.use(commonMiddlewareForThisFile);

const callMiddlewareSeparately = (req, res, next) => {
    console.log("call middleware separately");
    next();
}

const callMiddlewareSeparately2 = (req, res, next) => {
    console.log("call middleware separately");
    next();
}

app.get('/email_signature', callMiddlewareSeparately, (req, res) => {
    console.log("executing route");
    res.send('hello world');
});

app.get('/learning_middleware', callMiddlewareSeparately2, (req, res) => {
    console.log("executing route");
    res.send('learning middleware');
});

app.get("/insert_example_user", async (req, res, next) => {
    let result = await Users.create({username: "sabbu", email: "abc@example.com", password: "mypassword", myownfield: "myownfield" });
    res.status(200).send({msg: "successfully"});
});

export default app;
