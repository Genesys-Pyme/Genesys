export async function handler(event){

try{

const { conversation, conversationId } = JSON.parse(event.body)

const textConversation = conversation
.map(m => `${m.role === "user" ? "Usuario" : "Bot"}: ${m.content}`)
.join(" | ")

let lead = {
negocio:"desconocido",
tieneWeb:"no dijo",
interes:"medio"
}

/* ANALISIS DE LEAD */

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
content:textConversation
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

await fetch("https://script.google.com/macros/s/AKfycbxgZDRJZ3QRqdC6N6TtO15QoDGPCFK8HZvhBQPW6kfmtR-t5prkT9Wt5wWu-eDu-Io/exec",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
negocio:lead.negocio,
tieneWeb:lead.tieneWeb,
interes:lead.interes,
conversation:textConversation,
conversationId:conversationId
})
})

return {
statusCode:200,
body:"ok"
}

}catch(error){

console.log("Error guardando conversación:",error)

return{
statusCode:500,
body:"error"
}

}

}