export async function handler(event) {

const { message } = JSON.parse(event.body)

const response = await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
},
body:JSON.stringify({
model:"gpt-4.1-mini",
messages:[
{
role:"system",
content: `
Sos el asesor comercial de Genesys.
Tu objetivo es convertir visitantes en clientes.

Servicios:
- páginas web
- tiendas online
- landing pages
- rediseño web

Si detectas intención de compra invita a hablar por WhatsApp:
https://wa.me/2604104160
`
},
{
role:"user",
content:message
}
]
})
})

const data = await response.json()

return {
statusCode:200,
body:JSON.stringify({
reply: data.choices[0].message.content
})
}

}