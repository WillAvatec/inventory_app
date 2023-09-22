const asyncHand = require("express-async-handler");
const Item = require("../models/item");

const { body, validationResult } = require("express-validator");

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

  res.render("item_detail", {
    title: `Item Detail: ${item.name}`,
    item,
  });
});
