const asyncHand = require("express-async-handler");
const Category = require("../models/category");
const Item = require("../models/item");

const { body, validationResult } = require("express-validator");

// Display all categories
exports.category_list = asyncHand(async (req, res) => {
  const allCategories = await Category.find().exec();
  res.render("category_list", {
    title: "Category List",
    categories: allCategories,
  });
});

// Display detailed page for single category
exports.category_detail = asyncHand(async (req, res, next) => {
  // Get full info of category
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: `Category Detail: ${category.name}`,
    category,
  });
});
