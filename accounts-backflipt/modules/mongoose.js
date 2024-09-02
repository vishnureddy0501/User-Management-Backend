import mongoose from "mongoose";

mongoose.set("strictQuery", false);

try {
  mongoose.connect(
    "mongodb+srv://gujjulavishnuvardhanreddy8179:Vishnu123@cluster0.2nbwswo.mongodb.net/user_management",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );
} catch (e) {
  throw e;
}
const conn = mongoose.connection;
conn.on("connected", () => {
  console.log("database is connected successfully");
});
conn.on("error", console.error.bind(console, "connection error:"));
export default conn;
