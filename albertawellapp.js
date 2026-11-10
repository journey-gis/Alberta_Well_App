document.addEventListener("DOMContentLoaded", () => {
    console.log("Page is ready!");
    initializeMap();
});

const map = L.map('wellMap'); //Create the global map object
const markerLayer = L.layerGroup().addTo(map); // Add a grouplayer we can add and remove markers from.

const slider = document.getElementById("yearRange");
const year = document.getElementById("selectedYear");
const areadropdown = document.getElementById("areaselect");
var wells=""; //Global variable for holding loaded well data
year.innerHTML=slider.value;
console.log(slider.value);

function initializeMap(){
    //Create the map object and set the centre point and zoom level

    map.setView([55.1499, -114.8228], 5);
    //Load tiles from OpenStreetMap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_43h0_1_711e31b181a9ac70ace470cb', {
   			maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy;<a href="https://carto.com/attributions">CARTO</a>' //put this attribution on one continuous line
		}).addTo(map);//add the base tiles to the map object
    const albertaboundary = L.geoJSON(alberta,{
        style:{
            color:"black",
            weight:1,
            fillOpacity:0
        }
    }).addTo(map);
    console.log("Map loaded!");
}

function initializePlotly(){
    var data = [
    {
        x: ['giraffes', 'orangutans', 'monkeys'],
        y: [20, 14, 23],
        type: 'bar'
    }
    ];

    Plotly.newPlot('myDiv', data);
}

function updateMarkers(){;
    markerLayer.clearLayers(); // Clear the current markerlayer
    for (let i=0; i<wells.length;i++){
        if(wells[i].Year<=slider.value){
            let wellLocation = new L.LatLng(wells[i].BH_Latitude, wells[i].BH_Longitude); 
            let marker = new L.Marker(wellLocation).addTo(markerLayer)
        }
    }
}

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
    console.log(this.value);
    year.innerHTML = this.value;
    updateMarkers();
}

areadropdown.addEventListener("change",function(event){
    area=event.target.value // get the area name for easy reference
    console.log("selected: ",area ); // Debugging code
    // The if else statements below control zooming, loading and calling update features.
    if (area=="CAL"){
        map.setView([51.0579, -114.0738], 8);
    } 
    else if (area=="EDM"){
        map.setView([53.5372, -113.4995], 8);
        wells=EdmontonWells();
    }
    else if (area=="RMH"){
        map.setView([52.3813, -114.9542], 8);
    }
    else if (area=="GP"){
        map.setView([55.1628, -118.7839], 8);
    }
    else {
        map.setView([55.1499, -114.8228], 5);
        wells="";
    }
    updateMarkers(wells);
});