const sideBar = document.getElementById('sidebar');
const sideBarLink = document.getElementById('sidebarlink');
const close = document.getElementById('close');

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