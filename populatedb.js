#! /usr/bin/env node

console.log(`
This script is going to populate the database, just requires a connection string
Pass it as an argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/cool_collection?retryWrites=true&w=majority"
`);

// Get arguments passed in command line
const userArgs = process.argv.slice(2, 3);

if (userArgs === undefined) {
  console.log("Please provide a mongoDB URI to start a connection");
  return;
}

const Category = require("./models/category");
const Item = require("./models/item");

const items = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

// Run main function that starts all the async tasks

main()
  .then(() => (process.exitCode = 1))
  .catch((err) => console.log(err));
async function main() {
  console.log("DEBUG: About to attempt a conenction");
  await mongoose.connect(mongoDB);
  console.log("DEBUG: Should be connected already");
  await createSampleCategories();
  await createSampleItems();
  console.log("DEBUG: Closing mongoose");
  mongoose.connection.close();
}

// Categories functions
async function createSampleCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(
      0,
      "Coffee Beans and Mixtures",
      "Explore the world through your cup with our exotic coffee bean selections. From the lush Ethiopian Yirgacheffe to the bold French Roast, embark on a sensory adventure"
    ),
    categoryCreate(
      1,
      "Equipment and Accesories",
      "Elevate your coffee game with our collection of precision coffee equipment. Craft the perfect cup with the best espresso machines, grinders, and more."
    ),
    categoryCreate(
      2,
      "Flavors and Syrups",
      "Transform your brews into delightful creations with our exquisite syrups and flavorings. Explore a world of taste with vanilla, caramel, hazelnut, and more."
    ),
  ]);
}

async function categoryCreate(index, name, description) {
  const category = new Category({
    name,
    description,
  });
  await category.save();
  categories[index] = category;
  console.log(`Added category ${name}`);
}

//Items functions
async function createSampleItems() {
  console.log("Adding items");
  await Promise.all([
    itemCreate(
      0,
      "Colombian Supremo Coffee Beans 250gr",
      "Indulge in the finest coffee nature has to offer with our Colombian Supremo coffee beans. Handpicked from the picturesque coffee farms of Colombia, these beans embody the essence of premium coffee. Grown at high altitudes in the rich soil and under the gentle embrace of equatorial sunlight, Colombian Supremo beans deliver a cup of perfection.",
      25,
      [categories[0]],
      10,
      "https://m.media-amazon.com/images/I/71mQTYreueL._SL1500_.jpg"
    ),
    itemCreate(
      1,
      "French Roast Coffee Beans",
      "Our French Roast beans are roasted to perfection, taking them to the very brink of darkness. The result is a cup of coffee that's as bold as it is irresistible. You'll be greeted by an intoxicating aroma of deep, smoky richness as you brew your first cup.",
      55,
      [categories[0]],
      32,
      "https://m.media-amazon.com/images/I/71Spw1d4zgL.jpg"
    ),
    itemCreate(
      2,
      "Espresso Roast Coffee Beans",
      "Elevate your coffee experience to the pinnacle of sophistication with our Espresso Roast coffee beans. Specially crafted for those who appreciate the finer nuances of coffee, these beans are a testament to the art of espresso-making.",
      18,
      [categories[0]],
      100,
      "https://m.media-amazon.com/images/I/61wEGclsX8L.jpg"
    ),
    itemCreate(
      3,
      "Ootea Lingzhi Coffee Mix 3 in 1",
      "Indulge in the perfect harmony of flavor and wellness with Ootea's Lingzhi Coffee Mix 3 in 1. This remarkable blend marries the rich, comforting taste of coffee with the ancient healing power of Lingzhi mushrooms, resulting in a coffee experience unlike any other. Whether you're a coffee lover seeking a new dimension of flavor or someone mindful of their well-being, Ootea's Lingzhi Coffee Mix 3 in 1 offers the best of both worlds. Sip, savor, and revitalize with each cup.",
      31.5,
      [categories[0]],
      20,
      "https://negociodxn.com/wp-content/uploads/2023/03/FB369_DXN_Ootea_Lingzhi_Coffee_Mix_3in1.jpg"
    ),
    itemCreate(
      4,
      "Drip Coffee Maker",
      "Whether you're a coffee connoisseur or simply seeking a reliable companion for your caffeine cravings, our Drip Coffee Maker is your gateway to a consistently exceptional brew. Elevate your mornings, one cup at a time, with the perfect cup of coffee.",
      10.99,
      [categories[1]],
      12,
      "https://sunbeam-s3-production.s3.ap-southeast-2.amazonaws.com/large_PC7800_1340x1340_1_ed8b9dca34.jpeg"
    ),
    itemCreate(
      5,
      "French Press Coffee",
      "The French Press is more than just a coffee maker; it's an experience. As you press down the plunger, you'll release an intoxicating aroma that fills the air, setting the stage for that first, soul-warming sip.",
      75.38,
      [categories[1]],
      5,
      "https://www.ikea.com/us/en/images/products/ikea-365-french-press-coffee-maker-clear-glass-stainless-steel__1148738_pe883807_s5.jpg?f=s"
    ),
    itemCreate(
      6,
      "Burr Coffee Grinder",
      "Customization is key. Our grinder offers a range of grind settings, from coarse for French press to fine for espresso, allowing you to tailor each grind to your preferred brewing method. Whether you're a pour-over purist or an espresso aficionado, our Burr Coffee Grinder delivers the grind you need.",
      98.1,
      [categories[1]],
      11,
      "https://m.media-amazon.com/images/I/716W3J1sAsL.jpg"
    ),
    itemCreate(
      7,
      "Reusable Coffee Filter",
      "This eco-friendly alternative to disposable paper filters is your passport to a guilt-free and full-flavored coffee experience. Made from high-quality materials, our filter is designed to last, reducing waste and saving you money in the long run.",
      22.1,
      [categories[1]],
      56,
      "https://m.media-amazon.com/images/I/41nlQdtKQxL._AC_.jpg"
    ),
  ]);
}

async function itemCreate(
  index,
  name,
  description,
  price,
  category,
  stock,
  img
) {
  const itemDetail = {
    image: img,
    name,
    category,
    description,
    price,
    stock,
  };

  const item = new Item(itemDetail);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}
