const Item = require('../models/Item');

// Controller functions for items
const getItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving items.' });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving item.' });
  }
};

const createItem = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const newItem = new Item({
      name,
      description,
      user: req.user.userId
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating item.' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { name, description } = req.body;

    let item = await Item.findOne({ _id: req.params.id, user: req.user.userId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    item.name = name || item.name;
    item.description = description || item.description;

    await item.save();
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating item.' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, user: req.user.userId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting item.' });
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem };
