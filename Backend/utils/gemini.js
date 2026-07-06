import "dotenv/config";

const getGeminiAPIResponse = async (message, locationContext = "") => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    let fullPrompt = message;
    if (locationContext && locationContext !== "Unknown" && locationContext !== "Unknown Location") {
        fullPrompt = `[System Instruction: The user is physically located in or near "${locationContext}". Use this geographical context to answer local queries (e.g., weather, places, food, internships, directories) accurately. If the query is general and does not need location context, answer normally without referencing it.]\n\nUser Query: ${message}`;
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: fullPrompt }]
            }]
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error.message);
            return "Sorry, I encountered an error with the AI provider.";
        }

        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error("Fetch Error:", err);
        return "Sorry, something went wrong while communicating with the AI.";
    }
}

export default getGeminiAPIResponse;
