import * as login from "./login.js";
import * as firebase from "./firebase.js";
import * as settings from "./settings.js";
export async function loadPonds(container){
    container.innerHTML="";
    const uid=(await login.getCurrentUser()).uid;
    console.log("Loading ponds...");
    let ponds;
    try{
        ponds=await firebase.getMyPonds(uid);
        console.log("Ponds loaded:",ponds);
    }catch(error){
        console.error("Error loading ponds:",error);
    }
    ponds.forEach(pond=>{
        const pondDiv=document.createElement("div");
        pondDiv.classList.add("pond");
        pondDiv.textContent=pond.data().name;
        pondDiv.addEventListener("click",()=>{window.location.href=`/pond.html?id=${pond.id}`;});
        container.appendChild(pondDiv);
    });
    container.insertAdjacentHTML("beforeend",`<button id="createPond">Create Pond</button>`);
    const createPondButton=container.querySelector("#createPond");
    createPondButton.addEventListener("click",async()=>{
        const pondCreationDialog=document.createElement("dialog");
        pondCreationDialog.innerHTML=`
            <h2>Create a new pond</h2>
            <input type="text" placeholder="Pond name" id="pondName"/>
            <button id="create">Create</button>
            <button id="close">Cancel</button>
            <p class="error" id="errorMessage"></p>
            <p class="success" id="successMessage"></p>
        `;
        document.body.appendChild(pondCreationDialog);
        const createButton=pondCreationDialog.querySelector("#create");
        createButton.addEventListener("click",async()=>{
            createButton.disabled=true;
            const pondName=pondCreationDialog.querySelector("#pondName").value.trim();
            if(!pondName){
                const errorMessage=pondCreationDialog.querySelector("#errorMessage");
                errorMessage.textContent="Pond name cannot be empty.";
                return;
            };
            if(pondName.length>64){
                const errorMessage=pondCreationDialog.querySelector("#errorMessage");
                errorMessage.textContent="Pond name cannot exceed 64 characters.";
                return;
            };
            try{
                await firebase.write("ponds",{
                    name:pondName,
                    createdAt:firebase.getTimestamp(),
                    lotus:(await login.getCurrentUser()).uid,
                    waterlilies:[]
                });
                const errorMessage=pondCreationDialog.querySelector("#errorMessage");
                errorMessage.textContent="";
                const successMessage=pondCreationDialog.querySelector("#successMessage");
                successMessage.textContent=`Pond created successfully!`;
                pondCreationDialog.close();
                pondCreationDialog.remove();
                await loadPonds(container);
            }catch(error){
                console.error("Error creating pond:",error);
                createButton.disabled=false;
            };
        });
        addCloseEventListener(pondCreationDialog);
        pondCreationDialog.showModal();
    });
};
export async function load(){
    const sidebar=document.getElementById("sidebar");
    const user=await login.getCurrentUser();
    sidebar.innerHTML=`
        <div id="ponds"></div>
        <div id="userInfo">
            <p id="username">${user?.displayName||"Not logged in"}</p>
            <button id="logout">Logout</button>
            <button id="settings">Settings</button>
        </div>
    `;
    const pondsDiv=document.getElementById("ponds");
    try{
        await loadPonds(pondsDiv);
    }catch(error){
        console.error("Failed to load ponds:",error);
        pondsDiv.textContent="Failed to load ponds.";
        const createButton=document.createElement("button");
        createButton.textContent="Create Pond";
        createButton.addEventListener("click",()=>loadPonds(pondsDiv));
        pondsDiv.appendChild(createButton);
    }
    const logoutButton=document.getElementById("logout");
    logoutButton.addEventListener("click",async()=>await login.logout());
    const settingsButton=document.getElementById("settings");
    settingsButton.addEventListener("click",async()=>await settings.load());
};
export function addCloseEventListener(dialog){
    const closeButton=dialog.querySelector("#close");
    if(closeButton){
        closeButton.addEventListener("click",()=>{
            dialog.close();
            dialog.remove();
        });
    }
};
