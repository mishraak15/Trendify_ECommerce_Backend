const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  desc: String,
  oldPrice: Number,
  price: Number,
  newSeason: Boolean,
  mainImg: String,
  additionalImg: [String],
  category: String,
  section: [String],
  keyword: [String],
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
