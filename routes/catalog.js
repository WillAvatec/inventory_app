const categoryController = require("../controllers/categoryController");
const itemController = require("../controllers/itemController");
const express = require("express");

// Create a router middleware
const router = express.Router();

/* Index route */
// Display all the items
router.get("/", itemController.item_list);

/* Item Routes */

// Create a new item
router.get("/item/create", itemController.item_create_get);
router.post("/item/create", itemController.item_create_post);

// Display an item
router.get("/item/:id", itemController.item_detail);

// Update an item
router.get("/item/:id/update", itemController.item_update_get);
router.post("/item/:id/update", itemController.item_update_post);

// Delete an item
router.get("/item/:id/delete", itemController.item_delete_get);
router.post("/item/:id/delete", itemController.item_delete_post);

/* Category Routes */

// Create a new category
router.get("/category/create", categoryController.category_create_get);
router.post("/category/create", categoryController.category_create_post);

// Display a category
router.get("/category/:id", categoryController.category_detail);
// Display list of categories
router.get("/category/list", categoryController.category_list);

// Update a category
router.get("/category/:id/update", categoryController.category_update_get);
router.post("/category/:id/update", categoryController.category_update_post);

// Delete a category
router.get("/category/:id/delete", categoryController.category_delete_get);
router.get("/category/:id/delete", categoryController.category_delete_post);

module.exports = router;
