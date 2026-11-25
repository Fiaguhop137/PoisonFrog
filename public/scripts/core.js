import * as firebase from "./firebase.js";
firebase.load();
const body=document.getElementById("body");
body.innerHTML=`
    <h1>PoisonFrog</h1>
    <p>Welcome to the PoisonFrog!</p>
    <p>This is still in very early beta, please report bugs to the issue tracker.</p>
    <textarea placeholder="Enter your message here..." id="message" style="resize:none !important;"></textarea>
    <button id="send">Send</button>
    <button id="loadOlder">Load older messages</button>
    <div id="messages"></div>
`;
const sendButton=document.getElementById("send");
const messageText=document.getElementById("message");
const messagesDiv=document.getElementById("messages");
const loadOlderButton=document.getElementById("loadOlder");
const PAGE_SIZE=20;
let cursor=null;
let loading=false;
let hasMore=true;
function displayMessages(items,prepend=false){
    const fragment=document.createDocumentFragment();
    for(const message of items){
        const div=document.createElement("div");
        div.textContent=message.message;
        fragment.appendChild(div);
    }
    if(prepend) messagesDiv.prepend(fragment);
    else messagesDiv.appendChild(fragment);
}
async function loadMessages(older=false){
    if(loading||(!hasMore&&older)) return;
    loading=true;
    loadOlderButton.disabled=true;
    try{
        const page=await firebase.getReadable("messages",PAGE_SIZE,older?cursor:null);
        if(!older) messagesDiv.replaceChildren();
        displayMessages(page.items.reverse(),older);
        cursor=page.nextCursor;
        hasMore=!!cursor;
        loadOlderButton.hidden=!hasMore;
    }
    catch(error){console.error("Error loading messages:",error);}
    finally{
        loading=false;
        loadOlderButton.disabled=false;
    }
}
async function sendMessage(message){
    if(!message.trim()) return;
    sendButton.disabled=true;
    try{
        await firebase.write("messages",{message:message,timestamp:firebase.getTimestamp()});
        console.log("Message sent successfully:",message);
        messageText.value="";
        const div=document.createElement("div");
        div.textContent=message;
        messagesDiv.appendChild(div);
    }
    catch(error){console.error("Error sending message:",error);}
    finally{sendButton.disabled=false;}
}
sendButton.addEventListener("click",()=>sendMessage(messageText.value));
messageText.addEventListener("keydown",(e)=>{
    if(e.key==="Enter"&&!e.shiftKey){
        e.preventDefault();
        sendMessage(messageText.value);
    }
});
loadOlderButton.addEventListener("click",()=>loadMessages(true));
loadMessages();