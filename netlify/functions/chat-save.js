export async function handler(event){

const { conversation, conversationId } = JSON.parse(event.body)

const textConversation = conversation
.map(m => `${m.role === "user" ? "Usuario" : "Bot"}: ${m.content}`)
.join(" | ")

await fetch("https://script.google.com/macros/s/AKfycbxgZDRJZ3QRqdC6N6TtO15QoDGPCFK8HZvhBQPW6kfmtR-t5prkT9Wt5wWu-eDu-Io/exec",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
conversation:textConversation,
conversationId:conversationId
})
})

return {
statusCode:200,
body:"ok"
}

}