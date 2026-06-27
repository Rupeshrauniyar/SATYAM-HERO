const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const helmet = require("helmet");
const db = require("./DB/db");
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
  
app.use("/api/auth", authRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/gov/post", govPostRoutes);
app.use("/api/gov/report", govReportRoutes);
app.use("/api/gov/", govRoutes);
app.use("/api/notification", notificationRoutes);

app.listen(3000, (req,res) => {
  // console.log("Shrey") 
});
