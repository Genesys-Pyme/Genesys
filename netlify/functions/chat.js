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

const { message } = JSON.parse(event.body)

const text = message.toLowerCase()

/* DETECTAR SI ENVÍA UNA WEB */

const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g

if(urlRegex.test(text)){

return {
statusCode:200,
body:JSON.stringify({
reply:`
Gracias por compartir tu página web 👀

Voy a comentarte algunos puntos clave que influyen en si una web genera clientes o no:

✔ velocidad de carga  
✔ claridad del mensaje  
✔ llamadas a la acción visibles  
✔ botón de contacto o WhatsApp  
✔ optimización para Google  

En muchos negocios detectamos que:

• la web no invita a contactar  
• el botón de WhatsApp no es visible  
• el diseño no transmite confianza  
• no aparece en Google  

Con algunos ajustes se puede aumentar mucho la cantidad de consultas que recibe un negocio.

Si querés puedo mostrarte cómo se vería una versión optimizada para tu negocio 👇

https://wa.me/2604104160
`
})
}

}

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

4️⃣ Si SÍ tiene web:

Pedí el link para analizarla gratis.

Ejemplo:
"Perfecto. Pasame tu web y te hago un análisis gratis."

5️⃣ Cuando analices su web:

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

Reglas:

• respondé corto
• tono humano
• tono profesional
• hacé preguntas para avanzar
• persuadí sin ser agresivo
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

console.log(data)

const reply = data?.choices?.[0]?.message?.content

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