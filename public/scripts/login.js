import * as firebase from "./firebase.js";
export async function load(){
    const body=document.getElementById("body");
    body.innerHTML=`
        <h1>PoisonFrog</h1>
        <p>Welcome to PoisonFrog!</p>
        <div id="registerBox">
            <input type="text" placeholder="Username" id="registerUsername"/>
            <input type="password" placeholder="Password" id="registerPassword"/>
            <button id="registerButton">Register</button>
        </div>
        <div id="loginBox">
            <input type="text" placeholder="Username" id="loginUsername"/>
            <input type="password" placeholder="Password" id="loginPassword"/>
            <button id="loginButton">Login</button>
        </div>
    `;
    const registerButton=document.getElementById("registerButton");
    const loginButton=document.getElementById("loginButton");
    registerButton.addEventListener("click",async()=>{
        const username=document.getElementById("registerUsername").value;
        const password=document.getElementById("registerPassword").value;
        return await firebase.register(username,password);
    });
    loginButton.addEventListener("click",async()=>{
        const username=document.getElementById("loginUsername").value;
        const password=document.getElementById("loginPassword").value;
        return await firebase.login(username,password);
    });
}
export function logout(){
    load();
    return firebase.logout();
}
