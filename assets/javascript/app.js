const sideBar = document.getElementById('sidebar');
const sideBarLink = document.getElementById('sidebarlink');
const close = document.getElementById('close');
const key = "dnA4PR9uKOU3Ltk0V7Fb8A5t6vHnsguc";
const category = "electric%20vehicle%20station";
const url = "https://api.tomtom.com/search/2/categorySearch/" + category + ".json?key=" + key;
var output;
fetchData(url);

if(sideBarLink) {
    sideBarLink.addEventListener('click', () => {
        sideBar.classList.add('show-sidebar')
    })
}

if(close) {
    close.addEventListener('click', () => {
        sideBar.classList.remove('show-sidebar')
    })
}
function submit(){
    begin = document.getElementById("body");
    einde = document.getElementById("body");
    connector = document.getElementById("body");
    kabel = document.getElementById("body");

    const range100 = document.getElementById("range100").checked;
    const range200 = document.getElementById("range200").checked;
    const range300 = document.getElementById("range300").checked;
    const range400 = document.getElementById("range400").checked;
    const range500 = document.getElementById("range500").checked;
    const range600 = document.getElementById("range600").checked;

    fetchData();
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        output = data;
        console.log(output);
    } catch (error) {
        console.log(error);
    }
}

const topBar = document.getElementById("topbar");
const hamburgerIcon = document.getElementById("hamburgericon");
const closeTopBar = document.getElementById("closeTopBar");

if(hamburgerIcon) {
    hamburgerIcon.addEventListener("click", () => {
        topBar.classList.add('show-topbar');
    })
}

if(closeTopBar) {
    closeTopBar.addEventListener('click', () => {
        topBar.classList.remove('show-topbar');
    })
}