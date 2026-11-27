import * as login from "./login.js";
import * as firebase from "./firebase.js";
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
export async function loadSidebar(){
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
    settingsButton.addEventListener("click",async()=>await loadSettings());
};
export async function loadSettings(){
    const settingsDialog=document.createElement("dialog");
    settingsDialog.innerHTML=`
        <h2>Settings</h2>
        <button id="accessibility">Accessibility</button>
        <button id="close">Close</button>
    `;
    document.body.appendChild(settingsDialog);
    const accessibilitySettingsButton=settingsDialog.querySelector("#accessibility");
    accessibilitySettingsButton.addEventListener("click",async ()=>{
        const themes=await fetch("themes/index.json").then(res=>res.json()).then(data=>data.themes);
        settingsDialog.innerHTML=`
            <h2>Accessibility Settings</h2>
            <label for="theme">Theme:</label>
            <div id="themes"></div>
            <button id="close">Close</button>
        `;
        const themeContainer=settingsDialog.querySelector("#themes");
        for(const theme of themes){
            const button=document.createElement("button");
            button.textContent=theme;
            button.addEventListener("click",()=>{themeLink.href=`themes/${theme}.css`;});
            themeContainer.appendChild(button);
        }
        settingsDialog.querySelector("#close").addEventListener("click",()=>{
            settingsDialog.close();
            settingsDialog.remove();
        });
    });
    addCloseEventListener(settingsDialog);
    settingsDialog.showModal();
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
