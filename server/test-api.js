require("dotenv").config();
const Groq = require("groq-sdk");

async function test() {

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: "Reply with Active." }]
  });

  console.log(res.choices[0].message.content);
}

test();