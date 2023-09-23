const asyncHand = require("express-async-handler");
const Item = require("../models/item");

const { body, validationResult } = require("express-validator");

/* SHOW ITEMS */

// Display all items
exports.item_list = asyncHand(async (req, res) => {
  const allItems = await Item.find().exec();
  res.render("item_list", {
    title: "Item List",
    items: allItems,
  });
});

// Display detail info for one item
exports.item_detail = asyncHand(async (req, res, next) => {
  //Get item from db
  const item = await Item.findById(req.params.id);

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
  res.render("item_form", {
    title: "Add new Item",
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

    const newItem = new Item({ ...req.body }); // TODO: Check if it works

    if (!errors.isEmpty()) {
      res.render("item_form", {
        title: "Create a new Item",
        item: newItem,
        errors: errors.array(),
      });

      return;
    } else {
      //Check if item already exists first
      const itemExists = Item.findOne({ name: req.body.name })
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
  const item = await Item.findByID(req.params.id).exec();

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
    const err = new Error("Item not found.");
    err.status = 404;
    next(err);
    return;
  }

  await Item.findByIdAndDelete(req.params.id);
  res.redirect("/catalog/item");
});
