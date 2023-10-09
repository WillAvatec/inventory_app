const asyncHand = require("express-async-handler");
const Item = require("../models/item");
const Category = require("../models/category");

const { body, validationResult } = require("express-validator");

/* SHOW ITEMS */

// Display all items
exports.item_list = asyncHand(async (req, res) => {
  const [allItems, allCategories] = await Promise.all([
    Item.find().populate("category").sort({ createdAt: -1 }).exec(),
    Category.find().exec(),
  ]);
  res.render("item_list", {
    title: "Item List",
    items: allItems,
    categories: allCategories,
  });
});

// Display detail info for one item
exports.item_detail = asyncHand(async (req, res, next) => {
  //Get item from db
  const item = await Item.findById(req.params.id).populate("category").exec();

  // Raise a 404 if item wasnt found in db
  if (item === null) {
    const err = new Error("Item wasn't found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    title: `Item Detail: ${item.name}`,
    item,
  });
});

/* CREATE NEW ITEM */

// GET: Return item form
exports.item_create_get = asyncHand(async (req, res) => {
  const allCategories = await Category.find().exec();

  res.render("item_form", {
    title: "Add new Item",
    categories: allCategories,
  });
});

//POST: Handle post request
exports.item_create_post = [
  //Convert categories into an array
  function (req, res, next) {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }

    next();
  },

  // Sanitize request data
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name field must not be empty."),
  body("description").optional({ values: "falsy" }).trim().escape(),
  body("price")
    .trim()
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Price must be a number"),
  body("stock").trim().isNumeric().withMessage("Stock must be a number"),
  body("image").optional({ values: "falsy" }).trim().escape(),
  body("category.*").escape(),

  //Process sanitized data
  asyncHand(async (req, res, next) => {
    const errors = validationResult(req);

    const { name, description, price, stock, image, category } = req.body;
    const newItem = new Item({
      name,
      description,
      price,
      stock,
      image,
      category,
    });

    if (!errors.isEmpty()) {
      res.render("item_form", {
        title: "Create a new Item",
        item: newItem,
        errors: errors.array(),
      });

      return;
    } else {
      //Check if item already exists first
      const itemExists = await Item.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (itemExists) {
        // Redirect to the detail page of the item
        res.redirect(itemExists.url);
      } else {
        await newItem.save();
        res.redirect(newItem.url);
      }
    }
  }),
];

/* DELETING EXISTING ITEM */

// GET: Display confirmation page to remove item
exports.item_delete_get = asyncHand(async (req, res, next) => {
  // Recover item from db
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    const err = new Error("Item not found.");
    err.status = 404;
    next(err);
    return;
  }

  res.render("item_delete", {
    title: `Delete item ${item.name}`,
    item,
  });
});

//POST: Handle request to delete
exports.item_delete_post = asyncHand(async (req, res, next) => {
  //Recover item from db
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    res.redirect("/catalog/item");
    return;
  }

  await Item.findByIdAndDelete(req.params.id);
  res.redirect("/catalog");
});

/* UPDATE EXISTING ITEM */

// GET: Display a form with the actual data of the item
exports.item_update_get = asyncHand(async (req, res, next) => {
  //Recover item from db
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    const err = new Error("Item not found.");
    err.status = 404;
    next(err);
    return;
  }

  const allCategories = await Category.find().exec();

  res.render("item_form", {
    title: `Update Item ${item.name}`,
    categories: allCategories,
    item,
  });
});

// POST: Handle update request
exports.item_update_post = [
  //Convert categories into an array
  function (req, res, next) {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }

    next();
  },

  // Sanitize request data
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name field must not be empty."),
  body("description").optional({ values: "falsy" }).trim(),
  body("price")
    .trim()
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Price must be a number"),
  body("stock", "Stock must be a positive number").isInt({ min: 0 }),
  body("image").optional({ values: "falsy" }).trim(),
  body("category.*").escape(),

  //Process sanitized data
  asyncHand(async (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.body);
    const newItem = new Item({
      ...req.body,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const [allCategories, item] = Promise.all([
        Category.find().exec(),
        Item.findById(req.params.id).exec(),
      ]);

      for (const cat of allCategories) {
        if (item.category.indexOf(cat._id) > -1) {
          cat.selected = "true";
        }
      }

      res.render("item_form", {
        title: "Create a new Item",
        categories: allCategories,
        item: newItem,
        errors: errors.array(),
      });

      return;
    } else {
      // There are no errors, data is valid.
      const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        newItem,
        {}
      );

      res.redirect(updatedItem.url);
    }
  }),
];
