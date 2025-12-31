import axios from 'axios';

const geminiResponse = async(command, AssistantName, userName)=>{
    try {
        const apiUrl = process.env.GEMINI_API_URL;
        const prompt = `You are a virtual assistant named ${AssistantName} created by ${userName}.
        You are not Google. You will now behave like a voice-enabled assistant.

        You MUST always return ONLY a JSON object. No extra text.
        {
        "type": "general" | "google_search" | "youtube_search" | "youtube_play" |
        "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" |
        "instagram_open" | "facebook_open" | "twitter_open" | "github_open" |
        "weather_show",
        
        "userInput":"<original user input>" {only remove your name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye,
        
        "response":"<a short spoken response to read out loud to the user>"
        }

        Instructions:
        - "type": determine the intent of the user.
        -"userinput": A short voice-friendly reply e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.
        
        Type meanings:
        - "general": if it's a factual or informational question. aur agr koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho bas short answer dena
        - "google_search": if user wants to search something on Google.
        - "youtube_search":if user wants to search something on YouTube.
        - "youtube_play": if user wants to directly play a video or song.
        - "calculator_open": if user wants to open calculator.
        - "instagram_open": if user wants to open Instagram.
        - "facebook_open": if user wants to open Facebook.
        - "twitter_open": if user wants to open Twitter.
        - "github_open": if user wants to open GitHub.
        - "weather_show": if user wants to see weather information.
        - "get_time": if user asks for current time.
        - "get_date": if user asks for today's date.
        - "get_day": if user asks what day it is.
        - "get_month": if user asks for the current month.

        Important:
        - Use ${userName} agar koi puche tume kisne banaya
        - Only respond with the JSON object, nothing else.

        now your userInput- ${command}
        `;

        const result = await axios.post(apiUrl, {
        "contents": [{
        "parts": [{"text": prompt}]
        }]
        })
        const aiText = result.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const jsonMatch = aiText.match(/{[\s\S]*}/);
        if (!jsonMatch) {
        return JSON.stringify({
            type: "general",
            userInput: command,
            response: "I'm sorry, I didn't understand. Can you repeat?"
        });
        }

        return jsonMatch[0];

    } catch (error) {
        if (error.response) {
        console.log("Gemini API error response:", error.response.data);
    } else {
        console.log("Gemini error:", error.message);
    }
    throw error;
    }
}

export default geminiResponse;