const express = require('express');
const router = express.Router();
const { getItems, getItemById, createItem, updateItem, deleteItem } = require('../controllers/itemsController');
const auth = require('../middleware/auth');

// All item routes require authentication
router.use(auth);

// GET /api/items - Retrieve all items for the authenticated user
router.get('/', getItems);

// GET /api/items/:id - Retrieve a single item
router.get('/:id', getItemById);

// POST /api/items - Create a new item
router.post('/', createItem);

// PUT /api/items/:id - Update an item
router.put('/:id', updateItem);

// DELETE /api/items/:id - Delete an item
router.delete('/:id', deleteItem);

module.exports = router;