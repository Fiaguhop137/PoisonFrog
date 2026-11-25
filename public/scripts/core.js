//use import {encode} from "https://esm.sh/@jsquash/avif@2.1.1"; later but make sure it works on school chromebooks
import * as firebase from "./firebase.js";
firebase.load();
const body=document.getElementById("body");
body.innerHTML=`
    <h1>PoisonFrog</h1>
    <p>Welcome to the PoisonFrog!</p>
    <p>This is still in very early beta, please report bugs to the issue tracker.</p>
    <textarea placeholder="Enter your message here..." id="message"></textarea>
    <button id="send">Send</button>
`
const sendButton=document.getElementById("send");
const messageText=document.getElementById("message");
sendButton.addEventListener("click",()=>{sendMessage(messageText.value);});
function sendMessage(messsage){
    try{
        firebase.write("messages",{messsage:messsage,timestamp:firebase.getTimestamp()});
        console.log("Message sent successfully: ",messsage);
    }
    catch(error){console.error("Error sending message: ",error);}
    messageText.value="";
}
