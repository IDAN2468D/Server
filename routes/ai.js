const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// All AI routes require authentication
router.use(auth);

// POST /api/ai/generate-description - Generate a description for an item
router.post('/generate-description', aiController.generateDescription);

// POST /api/ai/suggest-category - Suggest a category for an item
router.post('/suggest-category', aiController.suggestCategory);

// POST /api/ai/fix-text - Fix spelling and grammar
router.post('/fix-text', aiController.fixText);

// POST /api/ai/generate-tags - Suggest search tags
router.post('/generate-tags', aiController.generateTags);

// POST /api/ai/estimate-value - Estimate item value
router.post('/estimate-value', aiController.estimateValue);

module.exports = router;
