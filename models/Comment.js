const { Schema, model, Types } = require("mongoose");

const comment = new Schema({
  createDate: { type: Date, default: Date.now },
  value: { type: String, default: "" },
  owner: { type: Types.ObjectId, ref: "User", required: true },
  post: { type: Types.ObjectId, ref: "Post", required: true },
});

module.exports = model("Comment", comment);
