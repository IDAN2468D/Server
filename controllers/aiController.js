const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-1.5-flash"; // More stable and higher quota for JSON responses

/**
 * Helper to clean and parse AI JSON responses
 */
const parseAIResponse = (text) => {
    try {
        // 1. Try simple clean first
        const cleanJson = text.replace(/```json|```/g, '').trim();
        try {
            return JSON.parse(cleanJson);
        } catch (simpleError) {
            // 2. If simple clean fails, use regex to find the first '{' and last '}'
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw simpleError;
        }
    } catch (e) {
        console.error('Failed to parse AI response:', text);
        throw new Error('Invalid AI response format');
    }
};

/**
 * AI Controller
 */

// Generate item description
const generateDescription = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Generate a short, professional description (max 150 chars) for "${itemName}". 
    Return ONLY a raw JSON object, no other text.
    JSON structure: { "description": "..." }`;

        const result = await model.generateContent(prompt);
        const parsed = parseAIResponse(result.response.text());
        res.json(parsed);
    } catch (error) {
        console.error('Error in generateDescription:', error);
        res.status(500).json({ message: 'Server error generating description.' });
    }
};

// Suggest item category
const suggestCategory = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Suggest a category for "${itemName}" (e.g., Electronics, Clothing, Furniture). 
    Return ONLY a raw JSON object, no other text.
    JSON structure: { "category": "..." }`;

        const result = await model.generateContent(prompt);
        const parsed = parseAIResponse(result.response.text());
        res.json(parsed);
    } catch (error) {
        console.error('Error in suggestCategory:', error);
        res.status(500).json({ message: 'Server error suggesting category.' });
    }
};

// Fix spelling and grammar
const fixText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Text is required.' });

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Fix spelling and grammar for the following text: "${text}". 
    Keep the meaning and language identical. 
    Return ONLY a raw JSON object, no other text.
    JSON structure: { "fixedText": "..." }`;

        const result = await model.generateContent(prompt);
        const parsed = parseAIResponse(result.response.text());
        res.json(parsed);
    } catch (error) {
        console.error('Error in fixText:', error);
        res.status(500).json({ message: 'Server error fixing text.' });
    }
};

// Generate searchable tags
const generateTags = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Generate 5 relevant search tags for "${itemName}". 
    Return ONLY a raw JSON object, no other text.
    JSON structure: { "tags": ["tag1", "tag2", ...] }`;

        const result = await model.generateContent(prompt);
        const parsed = parseAIResponse(result.response.text());
        res.json(parsed);
    } catch (error) {
        console.error('Error in generateTags:', error);
        res.status(500).json({ message: 'Server error generating tags.' });
    }
};

// Estimate item value in NIS
const estimateValue = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Estimate the second-hand market value in NIS (Israeli Shekels) for "${itemName}". 
    Provide a range and a brief reasoning. 
    Return ONLY a raw JSON object, no other text.
    JSON structure: { "range": "min-max", "reason": "..." }`;

        const result = await model.generateContent(prompt);
        const parsed = parseAIResponse(result.response.text());
        res.json(parsed);
    } catch (error) {
        console.error('Error in estimateValue:', error);
        res.status(500).json({ message: 'Server error estimating value.' });
    }
};

module.exports = {
    generateDescription,
    suggestCategory,
    fixText,
    generateTags,
    estimateValue
};
