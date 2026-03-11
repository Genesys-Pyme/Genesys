export async function handler(event) {

if (!event.body) {
return {
statusCode:200,
body:JSON.stringify({
reply:"Hola! 👋 Soy Gyno, asesor digital de Genesys 🤖"
})
}
}

try{

const { message, history } = JSON.parse(event.body)

const text = message.toLowerCase()


/* RESPUESTA CON IA */

const response = await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
},
body:JSON.stringify({
model:"gpt-4o-mini",
messages:[
{
role:"system",
content:`
Sos Gyno, asesor digital de Genesys.

Genesys crea:

• páginas web
• tiendas online
• landing pages

Tu objetivo es convertir visitantes en clientes.

Flujo de conversación:

1️⃣ Primero preguntá a qué se dedica su negocio.

2️⃣ Luego preguntá si ya tiene página web.

Ejemplo:
"¿Tu negocio ya tiene página web?"

3️⃣ Si NO tiene web:

Explicá brevemente que hoy la mayoría de las personas buscan negocios en Google antes de comprar.

Decí que sin una página web probablemente está perdiendo clientes.

Recomendá el tipo de web ideal según su negocio.

Luego invitá a hablar por WhatsApp.
"

4️⃣ Cuando analices su web:

Mencioná:

• velocidad
• diseño
• claridad del mensaje
• botón WhatsApp
• posicionamiento en Google

Luego sugerí mejorarla con Genesys.

Invitá a continuar por WhatsApp.


WhatsApp:
https://wa.me/2604104160

Reglas importantes:

• nunca repitas una pregunta que el usuario ya respondió
• no vuelvas a preguntar a qué se dedica si ya lo dijo
• avanzá la conversación paso a paso
• respondé corto
• tono humano y profesional
`
},
...(history || []),
{
role:"user",
content:message
}
]
})
})

const data = await response.json()

console.log(data)

const reply = data?.choices?.[0]?.message?.content

const analysis = await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
},
body:JSON.stringify({
model:"gpt-4o-mini",
messages:[
{
role:"system",
content:`
Analiza la conversación de un visitante con un asesor web.

Devuelve SOLO JSON con este formato:

{
"negocio":"tipo de negocio o desconocido",
"tieneWeb":"si / no / no dijo",
"interes":"alto / medio / bajo"
}

alto = quiere hacer web
medio = consulta general
bajo = solo curiosidad
`
},
{
role:"user",
content:conversation
}
]
})
})

let lead = {
negocio:"desconocido",
tieneWeb:"no dijo",
interes:"medio"
}

try{

const analysisData = await analysis.json()

let content = analysisData.choices[0].message.content

// limpiar markdown si viene ```json
content = content.replace(/```json/g,"").replace(/```/g,"").trim()

lead = JSON.parse(content)

}catch(err){

console.log("Error analizando lead:",err)

}

const fullHistory = [
...(history || []),
{ role:"user", content:message },
{ role:"assistant", content:reply }
]

const conversation = fullHistory
.map(m => `${m.role === "user" ? "Usuario" : "Bot"}: ${m.content}`)
.join(" | ")

await fetch("https://script.google.com/macros/s/AKfycbxgZDRJZ3QRqdC6N6TtO15QoDGPCFK8HZvhBQPW6kfmtR-t5prkT9Wt5wWu-eDu-Io/exec",{
method:"POST",
body:JSON.stringify({
negocio:lead.negocio,
tieneWeb:lead.tieneWeb,
interes:lead.interes,
conversation:conversation
})
}) 

return {   
statusCode:200,
body:JSON.stringify({
reply: reply || "No pude generar una respuesta."
})
}

}catch(error){

console.log(error)

return{
statusCode:200,
body:JSON.stringify({
reply:"Hubo un problema en el servidor del chat."
})
}

}

}