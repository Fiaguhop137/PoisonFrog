import * as firebase from "./firebase.js";
export async function load(){
    const body=document.getElementById("body");
    body.innerHTML=`
        <h1>PoisonFrog</h1>
        <p>Welcome to PoisonFrog!</p>
        <div id="loginBox">
            <input type="text" placeholder="Username" id="loginUsername"/>
            <input type="password" placeholder="Password" id="loginPassword"/>
            <button id="loginButton">Login</button>
        </div>
        <div id="registerBox">
            <input type="text" placeholder="Username" id="registerUsername"/>
            <input type="password" placeholder="Password" id="registerPassword"/>
            <button id="registerButton">Register</button>
        </div>
    `;
    const loginButton=document.getElementById("loginButton");
    const registerButton=document.getElementById("registerButton");
    loginButton.addEventListener("click",async()=>{
        const username=document.getElementById("loginUsername").value;
        const password=document.getElementById("loginPassword").value;
        try{
            await firebase.login(username,password);
        }catch(error){
            console.error("Error logging in:",error);
            alert("Error logging in: "+error.message);
        };
    });
    registerButton.addEventListener("click",async()=>{
        const username=document.getElementById("registerUsername").value;
        const password=document.getElementById("registerPassword").value;
        try{
            const newUserData=await firebase.register(username,password);
            console.log("New frog created:",newUserData);
            await firebase.create('frogs',newUserData.uid,{
                username:newUserData.displayName,
                createdAt:firebase.getTimestamp()
            });
            return newUserData;
        }catch(error){
            if(error.code=="auth/email-already-in-use"){alert("Username already in use. Perhaps you meant to login?");}
            else{alert("Error registering: "+error.message);}
        }
    });
};
export async function logout(){return await firebase.logout();};
export const getCurrentUser=()=>firebase.getCurrentUser();
