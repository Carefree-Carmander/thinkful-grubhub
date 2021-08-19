const path = require("path");
const { forEach } = require("../data/dishes-data");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//middleware
function hasRequiredFields(req, res, next) {
  const data = req.body.data || {};

  const requiredFields = ["name", "description", "price", "image_url"];
  for (const field of requiredFields) {
    if (!data[field]) {
      return next({
        status: 400,
        message: `Dish must include a ${field}`,
      });
    }
  }
  next();
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (!foundDish) {
    return next({
      status: 404,
      message: `Not found`,
    });
  }
  //all validations passed
  res.locals.dishes = foundDish;
  next();
}

//todo: do everything!
function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (price < 0) {
    return next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0.`,
    });
  }

  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);

  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dishes });
}

function update(req, res, next) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  const { dishId } = req.params;
  const dish = dishes.find((dish) => dish.id === dishId);

  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  if (price < 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  if (dish.name !== name) {
    dish.name = name;
  }

  if (dish.description !== description) {
    dish.description = description;
  }

  if (dish.price !== price) {
    dish.price = price;
  }

  if (dish.image_url !== image_url) {
    dish.image_url = image_url;
  }

  res.json({ data: dish });
}

module.exports = {
  list,
  create: [hasRequiredFields, create],
  read: [dishExists, read],
  update: [dishExists, hasRequiredFields, update],
};
