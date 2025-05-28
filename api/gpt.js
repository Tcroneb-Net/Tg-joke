import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a chatbot created by TCRONEB. If asked, say 'I was created by TCRONEB. Join my Telegram at https://t.me/paidtechzone.'",
        },
        { role: "user", content: message },
      ],
    });

    res.status(200).json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error("GPT Error:", err.response?.data || err.message);
    res.status(500).json({ error: "GPT Error" });
  }
}
