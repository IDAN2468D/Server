const { GoogleGenerativeAI } = require("@google/generative-ai");

// אתחול ה-AI עם בדיקת בטיחות
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// שימוש במודל יציב שתומך ב-JSON Mode בצורה מושלמת
const MODEL_NAME = "gemini-1.5-flash";

/**
 * פונקציית עזר להרצת פרומפט בפורמט JSON
 */
const generateJSONResponse = async (prompt) => {
    if (!genAI) {
        throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        // הגדרה שמכריחה את המודל להחזיר JSON תקין בלבד
        generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
};

/**
 * AI Controller
 */

// 1. יצירת תיאור פריט
const generateDescription = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

        const prompt = `Generate a short, professional description (max 150 chars) for "${itemName}". 
        Return a JSON object with this structure: { "description": "text" }`;

        const data = await generateJSONResponse(prompt);
        res.json(data);
    } catch (error) {
        console.error('Error in generateDescription:', error.message);
        const status = error.message.includes("API_KEY") ? 403 : 500;
        res.status(status).json({ message: error.message || 'Error generating description.' });
    }
};

// 2. הצעה לקטגוריה
const suggestCategory = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

        const prompt = `Suggest a category for "${itemName}" (e.g., Electronics, Clothing, Furniture). 
        Return a JSON object: { "category": "text" }`;

        const data = await generateJSONResponse(prompt);
        res.json(data);
    } catch (error) {
        console.error('Error in suggestCategory:', error);
        res.status(500).json({ message: 'Server error suggesting category.' });
    }
};

// 3. תיקון שגיאות כתיב (תומך בעברית ואנגלית)
const fixText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Text is required.' });

        const prompt = `Fix spelling and grammar for: "${text}". Keep the meaning and language identical. 
        Return a JSON object: { "fixedText": "text" }`;

        const data = await generateJSONResponse(prompt);
        res.json(data);
    } catch (error) {
        console.error('Error in fixText:', error);
        res.status(500).json({ message: 'Server error fixing text.' });
    }
};

// 4. יצירת תגיות לחיפוש
const generateTags = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

        const prompt = `Generate 5 relevant search tags for "${itemName}". 
        Return a JSON object: { "tags": ["tag1", "tag2", ...] }`;

        const data = await generateJSONResponse(prompt);
        res.json(data);
    } catch (error) {
        console.error('Error in generateTags:', error);
        res.status(500).json({ message: 'Server error generating tags.' });
    }
};

// 5. הערכת שווי בשקלים (NIS)
const estimateValue = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

        const prompt = `Estimate the second-hand market value in NIS (Israeli Shekels) for "${itemName}" in Israel. 
        Provide a range and a brief reasoning in Hebrew or English. 
        Return a JSON object: { "range": "min-max", "reason": "text" }`;

        const data = await generateJSONResponse(prompt);
        res.json(data);
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