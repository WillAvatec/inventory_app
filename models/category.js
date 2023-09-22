const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    maxLength: 30,
    required: true,
  },
  description: {
    type: String,
  },
  protected: {
    type: Boolean,
  },
});

// Virtual to get URL
CategorySchema.virtual("url").get(function () {
  return `/catalog/category/${this._id}`;
});

module.exports = mongoose.model("Category", CategorySchema);
