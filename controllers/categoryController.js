const asyncHand = require("express-async-handler");
const Category = require("../models/category");

const { body, validationResult } = require("express-validator");

/* SHOW CATEGORIES */

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

/* CREATE NEW CATEGORY */

// GET: Display form to create new category
exports.category_create_get = asyncHand(async (req, res) => {
  res.render("category_form", {
    title: "Create a new category",
  });
});

// POST: Handle submitted data and sanitize
exports.category_create_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("A name must be specified.")
    .isAlpha()
    .withMessage("Name must be alphabetic letters only."),
  body("description")
    .trim()
    .isLength({ max: 500 })
    .escape()
    .withMessage("Description can only be up to 500 characters"),

  // Process request after validation and sanitization.
  asyncHand(async (req, res, next) => {
    // Extract the errors from the information
    const errors = validationResult(req);

    //Destructure variables from request body
    const { name, description } = req.body;

    const newCategory = new Category({
      name,
      description,
    });

    if (!errors.isEmpty()) {
      //Found errors, return form with sanitized values
      res.render("category_form", {
        title: "Create a new category",
        category: newCategory,
        errors: errors.array(),
      });
      // TODO: check if return is necessary or not
      return;
    } else {
      //Check if category already exists first
      const categoryExists = Category.findOne({ name })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (categoryExists) {
        // Redirect to the detail page of the category
        res.redirect(categoryExists.url);
      } else {
        await newCategory.save();
        res.redirect(newCategory.url);
      }
    }
  }),
];
