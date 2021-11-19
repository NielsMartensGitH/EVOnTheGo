/* ============ API VARIABLES ===================*/

const key = "MKB8TegqvUZ7OxWFWLC5zRepju2cstNK";  // dnA4PR9uKOU3Ltk0V7Fb8A5t6vHnsguc 2nd key when limit fetches has reached
const category = "electric%20vehicle%20station";
const url = "https://api.tomtom.com/search/2/categorySearch/" + category + ".json?key=" + key;
const initialPlace = [5.305940, 50.842289]; // place map displays first when opening app
const departurePoint = "5.305940,50.842289"; // Ulbeek EXAMPLE ONLY!
const arrivalPoint = "2.913830,51.225159"; // Oostende EXAMPLE ONLY!
var beginlat,beginlon,eindelat,eindelon,distance;
var markers = [];

/* ========== TOPBAR TOGGLE================*/

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

/* ========== SIDEBAR TOGGLE================*/

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
    removePreviousLayer();
    begin = document.getElementById("begin").value;
    einde = document.getElementById("einde").value;
    connector = document.getElementById("connector").value;
    kabel = document.getElementById("kabel").checked;
/*
    console.log("Begin: "+begin);
    console.log("Einde: "+einde);
    console.log("Connector: "+connector);
    console.log("Beschikt over kabel: "+kabel);
*/
    const range100 = document.getElementById("range100").checked;
    const range200 = document.getElementById("range200").checked;
    const range300 = document.getElementById("range300").checked;
    const range400 = document.getElementById("range400").checked;
    const range500 = document.getElementById("range500").checked;
    const range600 = document.getElementById("range600").checked;

    updateMap();
}

async function updateMap(){
    try {
        await fetchBegin(begin);
        await fetchEinde(einde); 
        createRoute(beginlon+","+beginlat, eindelon+","+eindelat);

        /*DISABLE IF NEEDED (debugging)*//*
        targeturl = "https://api.tomtom.com/routing/1/calculateRoute/"+beginlat+","+beginlon+":"+eindelat+","+eindelon+"/json?key=dnA4PR9uKOU3Ltk0V7Fb8A5t6vHnsguc&instructionsType=text";
        window.open(targeturl, '_blank').focus();*/
    } catch (error) {
        console.log(error);
    }
    fetchRoute();
}

async function fetchBegin(begin) {
    try {
        const response = await fetch( "https://api.tomtom.com/search/2/search/"+ begin +".json?key=" + key);
        const data = await response.json();
        beginlat = data.results[0].position.lat;
        beginlon = data.results[0].position.lon;
    } catch (error) {
        console.log(error);
    }
}

async function fetchEinde(einde) {
    try {
        const response = await fetch("https://api.tomtom.com/search/2/search/"+ einde +".json?key=" + key);
        const data = await response.json();
        eindelat = data.results[0].position.lat;
        eindelon = data.results[0].position.lon;
    } catch (error) {
        console.log(error);
    }
}

async function fetchRoute() {
    try {
        const response = await fetch("https://api.tomtom.com/routing/1/calculateRoute/"+beginlat+","+beginlon+":"+eindelat+","+eindelon+"/json?key=" + key + "&instructionsType=text");
        const data = await response.json();
        distance = data.routes[0].summary.lengthInMeters/1000;
        points = data.routes[0].legs[0].points;

        test = [];
        for(let i=0;i<points.length;i+=48){
            let lon = points[i].longitude;
            let lat = points[i].latitude;
            let loc = [lon,lat];
            test.push(lon+"|"+lat);
        }

        var i = 0;
        function myLoop() {         
          setTimeout(function() {   
            let values = test[i].split("|");
            fetchStations(values[0],values[1]) 
            i++;      
            if (i < test.length) {           
              myLoop();             
            }                       
          }, 250)
        }
        
        myLoop();                   

    } catch (error) {
        console.log(error);
    }
}


async function fetchStations(lon,lat) {
    try {
        const response = await fetch(url+ "&lat="+lat+"&lon="+lon+"&radius=2500&limit=2");
        const data = await response.json();
        stations = data.results;
        stations.forEach(element => {
            console.log(element.address.freeformAddress,element.poi.name);
            let lon = element.position.lon;
            let lat = element.position.lat;
            loc = [lon,lat];

            function createMarker(markerCoordinates, popup) {
                let markerElement = document.createElement("div");
                markerElement.innerHTML = '<i style="color: #0D1E50;" class="fas fa-charging-station"></i>'; 
                let marker  = new tt.Marker({
                    "element": markerElement
            })
            .setLngLat(markerCoordinates)
            .setPopup(popup)
            .addTo(map);
            markers.push(marker)
            }
            console.log(element)
            let poi = element.poi.name;
            let address = element.address.freeformAddress;
            let chargingAvailabilityId = element.dataSources.chargingAvailability.id; 

            // CREATE POPUP WITH TEXT

            let markerFunc = createMarker(loc,
            new tt.Popup({
                offset: 35
            }).setHTML(`
            <div style="color: black;">
            <h5>${poi}</h5>
            <p>${address}</p>
            <a href="#" onClick="showChargingInfo(${chargingAvailabilityId})">Charging Station Info</a>
            </div>
            `))
            
            marker.togglePopup()

            
        });

        
        
        
    } catch (error) {
        console.log(error);
    }
    console.log(markers);
}

/* =============== function to show charging info in sidebar when clicking on link in marker popup=======================*/

async function showChargingInfo(id) {
    try {
        document.getElementById("info").innerHTML = ""; 
        const fullId = "0" + id; 
        const response = await fetch("https://api.tomtom.com/search/2/chargingAvailability.json?chargingAvailability=" + fullId + "&key=" + key);
        const data = await response.json();
        const connectors = data.connectors;
        connectors.forEach(connector => {
            document.getElementById("info").innerHTML += `
            <b>Type:</b> ${connector.type} <br>
            <b>Total Charging points:</b> ${connector.total}<br>`;
            let powerLevel = connector.availability.perPowerLevel;
            console.log(powerLevel);    
            document.getElementById("info").innerHTML += `
            <b>PowerKW:</b> ${powerLevel[0].powerKW} <br>
            <b>Available:</b> ${powerLevel[0].available} <br>
            <b>Occupied:</b> ${powerLevel[0].occupied} <br>
            <b>Reserved:</b> ${powerLevel[0].reserved} <br>
            <b>Out Of Service:</b> ${powerLevel[0].outOfService} <br>
            <b>Unknown:</b> ${powerLevel[0].unknown} <br>
            <hr> 
            `

        })
        sideBar.classList.add('show-sidebar')
        document.getElementById("info").innerHTML += `ID: ${fullId}`;
    }
    catch(error) {
        console.log(error);
    }
}

/* ============================== map integration ===============================*/

let map = tt.map({
    key: key,
    container: "mymap",
    center: initialPlace,
    zoom: 10,
    style: "https://api.tomtom.com/style/1/style/21.1.0-*?map=basic_main&traffic_incidents=incidents_day&traffic_flow=flow_relative0",
    
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

function removePreviousLayer() {
    for (marker of markers) {
        marker.remove();
    }

    try {
        map.removeLayer("route");
        map.removeSource("route");
    }
    catch(error) {
        console.log(error)
    }
    
}
