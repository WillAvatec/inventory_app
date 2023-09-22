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
