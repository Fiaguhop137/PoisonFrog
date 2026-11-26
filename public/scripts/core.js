import * as firebase from "./firebase.js";
import * as login from "./login.js";
const PAGE_SIZE=20;
let cursor=null;
let loading=false;
let hasMore=true;
let sendButton,messageText,messagesDiv,loadOlderButton;
let cachedAuthorNames={};
firebase.load();
let currentUser=null;
firebase.onLogin(user=>{
    currentUser=user;
    if(user){loadChat();}
    else{login.load();}
    console.log(currentUser);
});
const cssLink=document.createElement("link");
cssLink.rel="stylesheet";
cssLink.href="themes/style.css";
document.head.appendChild(cssLink);
const themeLink=document.createElement("link");
themeLink.rel="stylesheet";
themeLink.href="themes/fulgurite.css";
document.head.appendChild(themeLink);
function safeElementAdd(parent,element,classes,text){ // Dont you just have it when javascript doesnt let you name a varible class for no reason 
    const el=document.createElement(element);
    if(classes){el.classList.add(classes);};
    el.textContent=text;
    parent.appendChild(el);
};
async function displayMessages(items,prepend=false){
    const fragment=document.createDocumentFragment();
    let previousMessage=null;
    for(const message of items){
        const div=document.createElement("div");
        const time=message.timestamp?.toDate?.().toLocaleString([],{dateStyle:'short',timeStyle:'short'})??"Unknown time";
        const sameAuthor=previousMessage&&message.author===previousMessage.author;
        const closeTime=previousMessage&&previousMessage.timestamp&&message.timestamp&&message.timestamp.toDate()-previousMessage.timestamp.toDate()<=1*60*1000;
        if(!sameAuthor||!closeTime){
            if(message.author){
                let authorName=message.author;
                if(cachedAuthorNames[authorName]){authorName=cachedAuthorNames[authorName];}
                else{
                    await firebase.read(`users/${authorName}`).then(userData=>{
                        if(userData&&userData.username){authorName=userData.username};
                    }).catch(error=>console.error("Error fetching user data:",error));
                    cachedAuthorNames[message.author]=authorName;
                }
                safeElementAdd(div,"span","authorName",(authorName||"null"));
                safeElementAdd(div,"small","timestamp",time);
                safeElementAdd(div,"br","","");
            };
        };
        safeElementAdd(div,"span","message",message.message);
        fragment.appendChild(div);
        previousMessage=message;
    };
    if(prepend){messagesDiv.prepend(fragment);}
    else{messagesDiv.appendChild(fragment);};
};
async function loadMessages(older=false){
    if(loading||(!hasMore&&older)) return;
    loading=true;
    loadOlderButton.disabled=true;
    try{
        const page=await firebase.getReadable("messages",PAGE_SIZE,older?cursor:null);
        if(!older){messagesDiv.replaceChildren();}
        await displayMessages(page.items.reverse(),older);
        cursor=page.nextCursor;
        hasMore=!!cursor;
        loadOlderButton.hidden=!hasMore;
    }
    catch(error){console.error("Error loading messages:",error);}
    finally{
        loading=false;
        loadOlderButton.disabled=false;
    };
};
async function sendMessage(message){
    if(!message.trim()||!currentUser) return;
    sendButton.disabled=true;
    try{
        await firebase.write("messages",{
            author:currentUser.uid,
            message:message,
            timestamp:firebase.getTimestamp()
        });
        console.log("Message sent successfully:",message);
        messageText.value="";
        await loadMessages();
    }
    catch(error){console.error("Error sending message:",error);}
    finally{sendButton.disabled=false;};
};
async function loadSettings(){
    const settingsDialog=document.createElement("dialog");
    settingsDialog.innerHTML=`
        <h2>Settings</h2>
        <button id="accessibility">Accessibility</button>
        <button id="closeSettings">Close</button>
    `;
    document.body.appendChild(settingsDialog);
    const accessibilitySettingsButton=settingsDialog.querySelector("#accessibility");
    const closeButton=settingsDialog.querySelector("#closeSettings");
    accessibilitySettingsButton.addEventListener("click",async ()=>{
        const themes=await fetch("themes/index.json").then(res=>res.json()).then(data=>data.themes);
        settingsDialog.innerHTML=`
            <h2>Accessibility Settings</h2>
            <label for="theme">Theme:</label>
            <div id="themes"></div>
            <button id="closeSettings">Close</button>
        `;
        const themeContainer=settingsDialog.querySelector("#themes");
        for(const theme of themes){
            const button=document.createElement("button");
            button.textContent=theme;
            button.addEventListener("click",()=>{
                themeLink.href=`themes/${theme}.css`;
            });
            themeContainer.appendChild(button);
        }
        settingsDialog.querySelector("#closeSettings").addEventListener("click",()=>{
            settingsDialog.close();
            settingsDialog.remove();
        });
    });
    closeButton.addEventListener("click",()=>{
        settingsDialog.close();
        settingsDialog.remove();
    });
    settingsDialog.showModal();
};
async function loadSidebar(){
    const sidebar=document.getElementById("sidebar");
    sidebar.innerHTML=`
        <button id="logout">Logout</button>
        <button id="settings">Settings</button>
    `;
    const logoutButton=document.getElementById("logout");
    logoutButton.addEventListener("click",async()=>await login.logout());
    const settingsButton=document.getElementById("settings");
    settingsButton.addEventListener("click",async()=>await loadSettings());
};
async function loadChat(){
    const body=document.getElementById("body");
    body.innerHTML=`
        <h1>PoisonFrog</h1>
        <p>This is still in very early beta testing.</p>
        <div id="sidebar"></div>
        <textarea placeholder="Enter your message here..." id="message" style="resize:none !important;"></textarea>
        <button id="send">Send</button>
        <button id="loadOlder">Load older messages</button>
        <div id="messages"></div>
    `;
    await loadSidebar();
    sendButton=document.getElementById("send");
    messageText=document.getElementById("message");
    messagesDiv=document.getElementById("messages");
    loadOlderButton=document.getElementById("loadOlder");
    sendButton.addEventListener("click",()=>sendMessage(messageText.value));
    messageText.addEventListener("keydown",(e)=>{
        if(e.key==="Enter"&&!e.shiftKey){
            e.preventDefault();
            sendMessage(messageText.value);
        };
    });
    loadOlderButton.addEventListener("click",()=>loadMessages(true));
    await loadMessages();
};
