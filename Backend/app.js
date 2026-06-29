const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const helmet = require("helmet");
const db = require("./DB/db");
require("dotenv").config();
db();
   
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
  
const authRoutes = require("./Routes/authRoutes");
const reportRoutes = require("./Routes/reportRoutes");
const govPostRoutes = require("./Routes/govPostRoutes");
const govReportRoutes = require("./Routes/govReportRoutes");
const govRoutes = require("./Routes/govRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const translateRoutes = require("./Routes/translateRoutes");
const userRoutes = require("./Routes/userRoutes");
  
app.use("/api/auth", authRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/gov/post", govPostRoutes);
app.use("/api/gov/report", govReportRoutes);
app.use("/api/gov/", govRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/translate", translateRoutes);
// // --- Keep Alive Function ---
const makeActive = async () => {
  try {

    const resp = await fetch(process.env.BACKEND);
    // console.log(resp)
    if (resp.ok)
      console.log("Server reloaded:", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("Keep-alive failed:", err.message);
  } 
}; 
setInterval(makeActive, 300_000); // every 5 minutes
 app.get("/", (req, res) => {
      res.json(`Welcome to Propatyc.`);
    });
app.listen(3000, (req,res) => {
  // console.log("Shrey") 
});
