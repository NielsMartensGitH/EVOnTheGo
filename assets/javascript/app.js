/* ============ API VARIABLES ===================*/

const key = "dnA4PR9uKOU3Ltk0V7Fb8A5t6vHnsguc";
const category = "electric%20vehicle%20station";
const url = "https://api.tomtom.com/search/2/categorySearch/" + category + ".json?key=" + key;
const initialPlace = [5.305940, 50.842289]; // place map displays first when opening app
const departurePoint = "5.305940,50.842289"; // Ulbeek EXAMPLE ONLY!
const arrivalPoint = "2.913830,51.225159"; // Oostende EXAMPLE ONLY!
var output;
fetchData(url);

/* ========== SIDEBAR ================*/

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


/* ============================== map integration ===============================*/

let map = tt.map({
    key: key,
    container: "mymap",
    center: initialPlace,
    zoom: 10,
    style: "https://api.tomtom.com/style/1/style/21.1.0-*?map=basic_main&traffic_incidents=incidents_day&traffic_flow=flow_relative0&poi=poi_main",
    
});

/* ============================ calculate route ==============================*/

const createRoute = function(departure, arrival) {
    tt.services.calculateRoute({
        key: key,
        locations: `${departure}:${arrival}` // ATTENTION order is first longitude then latitude !!    
    }).then(function(routeData) {
        let geo = routeData.toGeoJson();
        displayRoute(geo)
    });
}

/* ================= DISPLAY ROUTE WITH LINE  ================== */


var displayRoute = function(geoJSON) {
    routeLayer = map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': geoJSON
        },
        'paint': {
            'line-color': 'red',
            'line-width': 5
        }
    })
}