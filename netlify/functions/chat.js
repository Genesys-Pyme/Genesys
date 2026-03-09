export async function handler(event) {

if (!event.body) {
return {
statusCode:200,
body:JSON.stringify({
reply:"Hola! Soy el asesor de Genesys. ¿En qué puedo ayudarte?"
})
}
}

try{

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
content:"Sos el asesor comercial de Genesys que vende desarrollo web para pymes."
},
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

return {
statusCode:200,
body:JSON.stringify({
reply: reply || "OpenAI no devolvió respuesta."
})
}

}catch(error){

console.log(error)

return{
statusCode:200,
body:JSON.stringify({
reply:"Error en el servidor del chat."
})
}

}

}