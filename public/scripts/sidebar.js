import * as login from "./login.js";
export async function loadSidebar(){
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
export async function loadSettings(){
    const settingsDialog=document.createElement("dialog");
    settingsDialog.innerHTML=`
        <h2>Settings</h2>
        <button id="accessibility">Accessibility</button>
        <button id="closeSettings">Close</button>
    `;
    document.body.appendChild(settingsDialog);
    const accessibilitySettingsButton=settingsDialog.querySelector("#accessibility");
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
            button.addEventListener("click",()=>{themeLink.href=`themes/${theme}.css`;});
            themeContainer.appendChild(button);
        }
        settingsDialog.querySelector("#closeSettings").addEventListener("click",()=>{
            settingsDialog.close();
            settingsDialog.remove();
        });
    });
    addCloseEventListener(settingsDialog);
    settingsDialog.showModal();
};
export function addCloseEventListener(dialog){
    const closeButton=dialog.querySelector("#closeSettings");
    if(closeButton){
        closeButton.addEventListener("click",()=>{
            dialog.close();
            dialog.remove();
        });
    }
};
