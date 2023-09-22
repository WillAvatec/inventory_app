const asyncHand = require("express-async-handler");
const Category = require("../models/category");
const Item = require("../models/item");

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

/* DELETE EXISTING CATEGORY */

// GET: Display confirmation page to remove category
exports.category_delete_get = asyncHand(async (req, res, next) => {
  // Recover all data from category
  const [category, allRelatedItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ author: req.params.id }, "name").exec(),
  ]);

  if (category === null) {
    const err = new Error("Category not found.");
    err.status = 404;
    next(err);
    return;
  }

  res.render("category_delete", {
    categoryItems: allRelatedItems,
    title: `Delete category ${category.name}`,
    category,
  });
});

// POST:_Handle remove category request
exports.category_delete_post = asyncHand(async (req, res, next) => {
  // Recover all data from category
  const [category, allRelatedItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ author: req.params.id }, "name").exec(),
  ]);

  //Check if there are items using that category
  if (allRelatedItems.length > 0) {
    res.render("category_delete", {
      categoryItems: allRelatedItems,
      title: `Delete category ${category.name}`,
      category,
    });
    return;
  } else {
    // Category has no items using it, delete it
    await Category.findByIdAndRemove(req.body.id);
    res.redirect("/catalog/category");
  }
});

/* UPDATE EXISTING CATEGORY */

// GET: Display form with actual data from the category
exports.category_update_get = asyncHand(async (req, res, next) => {
  // Recover category data from db to display on form
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // There is no category with that ID in db
    const err = new Error("Category not found");
    err.status = 404;
    next(err);
  }

  res.render("category_form", {
    title: `Update category ${category.name}`,
    category,
  });
});

// POST: Handle category update
exports.category_update_post = [
  // Validate and sanitize fields
  body("name", "Name field must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Description must not be empty.")
    .isLength({ max: 500 })
    .withMessage("Description can only be up to 500 characters."),

  // Process update request
  asyncHandler(async (req, res, next) => {
    // Extracts errors from request if any
    const errors = validationResult(req);

    // Destructure properties from request body
    const { name, description } = req.body;

    // Create a new category with sanitized data
    const category = new Category({
      name,
      description,
      _id: req.params.id, // Assign old id
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: `Update category: ${name}`,
        category,
        errors: errors.array(),
      });
      return;
    } else {
      //Data is valid, update the document
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        {} // No options required
      );

      //Redirect to updated cateogry detail
      res.redirect(updatedCategory.url);
    }
  }),
];
