// api/clone.js
const fs = require("fs/promises");
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { bot_token, user_id, heard_from } = req.body;

    if (!bot_token || !user_id) {
      return res.status(400).json({ error: "Missing bot_token or user_id" });
    }

    const dataPath = path.join(__dirname, "..", "data", "bots.json");

    // Read file
    let fileData = await fs.readFile(dataPath, "utf8");
    let bots = JSON.parse(fileData || "[]");

    // Add bot
    bots.push({
      bot_token,
      user_id,
      heard_from: heard_from || "Unknown",
      created_at: new Date().toISOString()
    });

    // Write file
    await fs.writeFile(dataPath, JSON.stringify(bots, null, 2));

    return res.json({ success: true, message: "Cloned successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
