import "dotenv/config";

const getGeminiAPIResponse = async (message) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: message }]
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
