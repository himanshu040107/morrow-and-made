import mongoose from "mongoose";
const blaskListSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});
const Blacklist = mongoose.model("Blacklist", blaskListSchema);
export default Blacklist;
