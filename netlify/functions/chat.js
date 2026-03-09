export async function handler(event) {

const { message } = JSON.parse(event.body)

const response = await fetch("https://api.openai.com/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
},
body: JSON.stringify({
model: "gpt-4.1-mini",
messages: [
{
role: "system",
content: "Sos el asesor comercial de Genesys. Ayudás a pymes a crear páginas web, tiendas online y landing pages."
},
{
role: "user",
content: message
}
]
})
})

const data = await response.json()

const reply = data.choices?.[0]?.message?.content || "Hubo un problema al responder."

return {
statusCode: 200,
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
reply: reply
})
}

}