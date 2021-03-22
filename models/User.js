const { Schema, model, Types } = require("mongoose");

const user = new Schema({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  ProfileImage: {
    data: { type: Buffer, default: "" },
    contentType: { type: String, default: "" },
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  blogs: [{ type: Types.ObjectId, ref: "Blog" }],
});

module.exports = model("User", user);
