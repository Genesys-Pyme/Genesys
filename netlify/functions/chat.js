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

const { message, history, conversationId } = JSON.parse(event.body)

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

3️⃣ Si NO tiene web:
Explicá que hoy la mayoría de las personas buscan negocios en Google antes de comprar.

Decí que sin una web probablemente está perdiendo clientes.

Recomendá el tipo de web ideal según su negocio.

Luego invitá a hablar por WhatsApp.

WhatsApp:
https://wa.me/2604104160

Reglas:
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

const reply = data?.choices?.[0]?.message?.content || "No pude generar respuesta."

/* HISTORIAL COMPLETO */

const fullHistory = [
...(history || []),
{ role:"user", content:message },
{ role:"assistant", content:reply }
]

const conversation = fullHistory
.map(m => `${m.role === "user" ? "Usuario" : "Bot"}: ${m.content}`)
.join(" | ")

/* ANALISIS DE LEAD */

let lead = {
negocio:"desconocido",
tieneWeb:"no dijo",
interes:"medio"
}

try{

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
Analiza esta conversación de un visitante que consulta por una página web.

Devuelve SOLO JSON:

{
"negocio":"tipo de negocio o desconocido",
"tieneWeb":"si / no / no dijo",
"interes":"alto / medio / bajo"
}
`
},
{
role:"user",
content:conversation
}
]
})
})

const analysisData = await analysis.json()

let content = analysisData?.choices?.[0]?.message?.content || ""

content = content.replace(/```json/g,"")
content = content.replace(/```/g,"")
content = content.trim()

lead = JSON.parse(content)

}catch(err){
console.log("Error analizando lead:",err)
}

/* GUARDAR EN GOOGLE SHEETS */

const sheetResponse = await fetch("https://script.google.com/macros/s/AKfycbxgZDRJZ3QRqdC6N6TtO15QoDGPCFK8HZvhBQPW6kfmtR-t5prkT9Wt5wWu-eDu-Io/exec",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
  negocio: lead.negocio,
  tieneWeb: lead.tieneWeb,
  interes: lead.interes,
  conversation: conversation,
  conversationId: conversationId

})
})

const sheetData = await sheetResponse.text()
console.log("Sheets response:", sheetData)

return {
statusCode:200,
body:JSON.stringify({
reply: reply
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