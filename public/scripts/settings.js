export async function load(){
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