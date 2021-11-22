/* ============ API VARIABLES ===================*/

const key = "dnA4PR9uKOU3Ltk0V7Fb8A5t6vHnsguc";  //MKB8TegqvUZ7OxWFWLC5zRepju2cstNK   2nd key when limit fetches has reached
const category = "electric%20vehicle%20station";
const url = "https://api.tomtom.com/search/2/categorySearch/" + category + ".json?key=" + key;
const initialPlace = [5.305940, 50.842289]; // place map displays first when opening app
const departurePoint = "5.305940,50.842289"; // Ulbeek EXAMPLE ONLY!
const arrivalPoint = "2.913830,51.225159"; // Oostende EXAMPLE ONLY!
var beginlat,beginlon,eindelat,eindelon,distance;
var markers = [];
var params = "";

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

/*=========== MULTI-SELECTOR DROPDOWN LIST ===================*/

document.querySelector('.select-field').addEventListener('click',()=>{
console.log("clicked");
document.querySelector('.list').classList.toggle('show-dropdown');
});

/* ======================================================== */

function submit(){
    removePreviousLayer();
    begin = document.getElementById("begin").value;
    einde = document.getElementById("einde").value;
    //connectorType = document.getElementById("connector").value;
    // kabel = document.getElementById("kabel").checked;
/*
    console.log("Begin: "+begin);
    console.log("Einde: "+einde);
    console.log("Connector: "+connector);
    console.log("Beschikt over kabel: "+kabel);
*/
    let connectors = document.getElementById("connector").children;//[0].checked;

    let i=0;
    params = "&connectorSet=";
    connectors = Array.prototype.slice.call(connectors);
    connectors.forEach(connector => {
        if(i % 3 == 0 && connector.checked){
            params += connector.value + ",";
        }
        i++;
    });
    params = params.substring(0, params.length - 1);

const minRange = document.getElementById("range1").innerHTML;
const maxRange = document.getElementById("range2").innerHTML;

    params += "&minPowerKW=" + minRange +"&maxPowerKW=" +maxRange;

    updateMap();
}

async function updateMap(){
    try {
        await fetchBegin(begin);
        await fetchEinde(einde); 
        createRoute(beginlon+","+beginlat, eindelon+","+eindelat);
    } catch (error) {
        console.log(error);
    }
    fetchRoute();
}

// GET LAT/LON FROM STARTING POINT

async function fetchBegin(begin) {
    try {
        const response = await fetch( "https://api.tomtom.com/search/2/search/"+ begin +".json?key=" + key);
        const data = await response.json();
        beginlat = data.results[0].position.lat;
        beginlon = data.results[0].position.lon;
        moveMap(data.results[0].position)
    } catch (error) {
        console.log(error);
    }
}

/* MAKE MAP MOVE TO STARTING LOCATION WHEN SUBMITTING ROUTE DETAILS*/

function moveMap(lnglat) {
    map.flyTo({
        center: lnglat,
        zoom: 10
    })
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

/* FETCHING ROUTE BASED ON LAT/LON FROM STARTING POINT AND DESTINATION*/

async function fetchRoute() {
    try {
        const response = await fetch("https://api.tomtom.com/routing/1/calculateRoute/"+beginlat+","+beginlon+":"+eindelat+","+eindelon+"/json?key=" + key + "&instructionsType=text");
        const data = await response.json();
        distance = data.routes[0].summary.lengthInMeters/1000;
        points = data.routes[0].legs[0].points;

        test = [];
        //console.log(points.length + "pointLength")
        for(let i=0;i<points.length;i+=48){
            let lon = points[i].longitude;
            let lat = points[i].latitude;
            let loc = [lon,lat];
            test.push(lon+"|"+lat);
        }
        
        //console.log(test + "TEST")
        //console.log(test.length + "testLENGTH")
        var i = 0;
        function myLoop() {         
          setTimeout(function() {
            let values = test[i].split("|");
            fetchStations(values[0],values[1])
            point = i;
            percentage = Math.ceil((point / test.length) * 100);
            document.getElementById("progressbar").innerHTML = `${percentage}%`;
            document.getElementById("progressbar").setAttribute("style", `width: ${percentage}%`)
            document.getElementById("prog-container").classList.add("show-progress"); 
            i++;      
            if (i < test.length) {           
              myLoop();             
            } else {
                document.getElementById("progressbar").innerHTML = "100%"
                document.getElementById("progressbar").setAttribute("style", "width: 100%")

                setTimeout(() => {
                    document.getElementById("prog-container").classList.remove("show-progress");
                    document.getElementById("progressbar").innerHTML = "0%"
                    document.getElementById("progressbar").setAttribute("style", "width: 0%")

                }, 1000);
            }                       
          }, 300)
        }
        myLoop();

    } catch (error) {
        console.log(error);
    }
}

/* FETCH ALL STATIONS ON ROUTE WITHIN RADIUS */

async function fetchStations(lon,lat) {
    try {
        const response = await fetch(url+ "&lat="+lat+"&lon="+lon+"&radius=2500&limit=2" + params);
        const data = await response.json();
        //console.log(data)
        stations = data.results;
        stations.forEach(element => {
            //console.log(element.address.freeformAddress,element.poi.name);
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
            markers.push(marker) // store markers in array to remove all markers later when calculting new route!
            }
            //console.log(element)
            let poi = element.poi.name;
            let address = element.address.freeformAddress;
            let chargingAvailabilityId = element.dataSources.chargingAvailability.id; 
           
            /* CREATE POPUP WITH TEXT WHEN CLICKING ON CHARGING STATION SYMBOL ON MAP */

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
}

/* =============== function to show charging info in sidebar when clicking on link in marker popup=======================*/

async function showChargingInfo(id) {
    try {
        let fullId
        if (id.toString().length == 14) {
            fullId = "0" + id;
        }
        else {
            fullId = id;
        } 
        document.getElementById("info").innerHTML = ""; 
 
        const response = await fetch("https://api.tomtom.com/search/2/chargingAvailability.json?chargingAvailability=" + fullId + "&key=" + key);
        const data = await response.json();
        const connectors = data.connectors;
        connectors.forEach(connector => {
            document.getElementById("info").innerHTML += `
            <b>Type:</b> ${connector.type} <br>
            <b>Total Charging points:</b> ${connector.total}<br>`;
            let powerLevel = connector.availability.perPowerLevel;
            //console.log(powerLevel);  
            powerLevel.forEach(level => {
                document.getElementById("info").innerHTML += `
                <b>PowerKW:</b> ${level.powerKW} <br>
                <b>Available:</b> ${level.available} <br>
                <b>Occupied:</b> ${level.occupied} <br>
                <b>Reserved:</b> ${level.reserved} <br>
                <b>Out Of Service:</b> ${level.outOfService} <br>
                <b>Unknown:</b> ${level.unknown} <br>
                <br> 
                `
            })  
                document.getElementById("info").innerHTML += `<hr>`
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
    interactive: true,
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
    }).flyTo()
}


/* REMOVING ROUTE LINE AND MARKERS ON MAP WHEN SEARCHING FOR NEW ROUTE*/

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
