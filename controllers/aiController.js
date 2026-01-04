const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
// Note: Ensure gemini-2.5-flash is the correct version for your tier. 
// Common versions: "gemini-1.5-flash"
const MODEL_NAME = "gemini-2.5-flash";

const generateJSONResponse = async (prompt) => {
    if (!genAI) {
        console.error("Gemini API Key is missing!");
        throw new Error("Missing GEMINI_API_KEY");
    }

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: "application/json" }
    });

    try {
        const result = await model.generateContent(prompt);
        // Better way to get response text
        const responseText = result.response.text();

        // Cleaning markdown is safer
        const cleanJson = responseText.replace(/```json|```/g, "").trim();

        return JSON.parse(cleanJson);
    } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        throw new Error("AI returned invalid JSON format");
    }
};

const aiController = {
    generateDescription: async (req, res) => {
        try {
            const { itemName } = req.body;
            if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

            const prompt = `Generate a short, professional description (max 150 chars) for "${itemName}". 
            Return a JSON object: { "description": "text" }`;

            const data = await generateJSONResponse(prompt);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    suggestCategory: async (req, res) => {
        try {
            const { itemName } = req.body;
            // ADDED VALIDATION
            if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

            const prompt = `Suggest a category for "${itemName}". Return JSON: { "category": "text" }`;
            const data = await generateJSONResponse(prompt);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    fixText: async (req, res) => {
        try {
            const { text } = req.body;
            // This is where your error was triggered. Ensure you send {"text": "..."} in the body
            if (!text) return res.status(400).json({ message: 'Text is required.' });

            const prompt = `Fix spelling/grammar for: "${text}". Return JSON: { "fixedText": "text" }`;
            const data = await generateJSONResponse(prompt);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    generateTags: async (req, res) => {
        try {
            const { itemName } = req.body;
            if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

            const prompt = `Generate 5 search tags for "${itemName}". Return JSON: { "tags": [] }`;
            const data = await generateJSONResponse(prompt);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    estimateValue: async (req, res) => {
        try {
            const { itemName } = req.body;
            if (!itemName) return res.status(400).json({ message: 'Item name is required.' });

            const prompt = `Estimate second-hand value in NIS for "${itemName}" in Israel. Return JSON: { "range": "min-max", "reason": "text" }`;
            const data = await generateJSONResponse(prompt);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = aiController;