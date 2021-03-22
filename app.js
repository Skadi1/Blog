const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const path = require("path");
//*
const PORT = config.get("PORT") || 5000;
const app = express();
//
app.use(express.json({ extended: true, limit: "50mb" }));
//
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/blog", require("./routes/blog.routes"));
//
//
if (process.env.NODE_END === "production") {
  app.use("/", path.join(__dirname, "client", "build"));

  app.get("*",(req, res)=>{
    res.sendFile(path.resolve(__dirname,"client", "build", 'index.html' ))
  })
}
//*
async function start() {
  try {
    await mongoose.connect(config.get("mongoUri"), {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app.listen(PORT, console.log(`Server has been started on ${PORT}...`));
  } catch (error) {
    console.log("Can not opoen server: ", error);
  }
}
//*
start();
