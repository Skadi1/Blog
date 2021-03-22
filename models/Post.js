const { Schema, model, Types } = require("mongoose");
//
const imageSchema = new Schema({
  data:{type: Buffer},
  contentType: {type: String},
  mId: {type: String}
});
//
const post = new Schema({
  title: { type: String, required: true },
  createDate: { type: Date, default: Date.now },
  html: { type: String, default: "" },
  owner: { type: Types.ObjectId, ref: "Blog", required: true },
  images: [imageSchema],
});

module.exports = model("Post", post);
