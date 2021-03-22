const { Schema, model, Types } = require("mongoose");

const blog = new Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  owner: { type: Types.ObjectId, ref: "User", required: true },
  posts: [{ type: Types.ObjectId, ref: "Post" }],
});

module.exports = model("Blog", blog);
