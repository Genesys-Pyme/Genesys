/* INSERTAR CHAT EN LA PAGINA */

document.body.insertAdjacentHTML("beforeend",`

<div id="gyno-container">

<div id="gyno-bubble">
¡Hola! 👋 Soy Gyno,<br>
asesor virtual de Genesys 💙
</div>

<img src="/img/gyno.png" id="gyno-floating">

</div>

<div id="genesys-chat">
<div id="genesys-header">Gyno</div>

<div id="genesys-messages">
<div class="genesys-bot">
<div>
Hola 👋 Soy Gyno! Asesor virtual de Genesys 💙
</div>
</div>
</div>

<div id="genesys-input">
<input id="genesys-text" placeholder="Escribí tu consulta...">
<button onclick="genesysSend()">Enviar</button>
</div>

</div>

`)

/* VARIABLES */

let conversationId = sessionStorage.getItem("genesysConversation")

if(!conversationId){
conversationId = crypto.randomUUID()
sessionStorage.setItem("genesysConversation", conversationId)
}

const toggle = document.getElementById("gyno-floating")
const chat = document.getElementById("genesys-chat")
const messages = document.getElementById("genesys-messages")

toggle.onclick = () => {
chat.style.display = "block"
toggle.style.display = "none"
}

let chatHistory = JSON.parse(sessionStorage.getItem("genesysHistory")) || []

/* ENVIAR MENSAJE */

async function genesysSend(){

let input = document.getElementById("genesys-text")
let text = input.value
if(!text.trim()) return

chatHistory.push({
role:"user",
content:text
})

messages.innerHTML += `
<div class="genesys-user">
<div>${text}</div>
</div>
`

messages.scrollTop = messages.scrollHeight
input.value=""

const res = await fetch("/.netlify/functions/chat",{
method:"POST",
body:JSON.stringify({
message:text,
history:chatHistory,
conversationId:conversationId
})
})

const data = await res.json()

chatHistory.push({
role:"assistant",
content:data.reply
})

sessionStorage.setItem("genesysHistory",JSON.stringify(chatHistory))

let reply = data.reply

const waLink = "https://wa.me/2604104160?text=" + 
encodeURIComponent("Hola! Estuve hablando con Gyno en la web de Genesys. Quiero info para mi negocio.")

reply = reply.replace(/\[.*?\]\(https:\/\/wa\.me\/\d+.*?\)/g, "")

if(reply.toLowerCase().includes("whatsapp")){
reply += `
<br><br>
<a href="${waLink}" target="_blank" class="genesys-wa-btn">
Enviar Whatsapp
</a>
`
}

messages.innerHTML += `
<div class="genesys-bot">
<div>${reply}</div>
</div>
`

messages.scrollTop = messages.scrollHeight
}

/* GUARDAR CONVERSACION */

window.addEventListener("beforeunload", function () {

if(chatHistory.length === 0) return

const data = JSON.stringify({
conversation:chatHistory,
conversationId:conversationId
})

navigator.sendBeacon("/.netlify/functions/chat-save", data)



})

const footer = document.getElementById("footer")
const gyno = document.getElementById("gyno-container")

window.addEventListener("scroll", () => {

const footer = document.querySelector("footer")
const gyno = document.getElementById("gyno-container")

if(!footer || !gyno) return

const footerTop = footer.getBoundingClientRect().top
const windowHeight = window.innerHeight

if(footerTop < windowHeight){

const overlap = windowHeight - footerTop
gyno.style.bottom = (overlap + 25) + "px"

}else{

gyno.style.bottom = "25px"

}

})