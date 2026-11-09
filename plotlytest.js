document.addEventListener("DOMContentLoaded", () => {
    console.log("Page is ready!");
    initializeMap();
});

const map = L.map('wellMap');

function initializeMap(){
    //Create the map object and set the centre point and zoom level

    map.setView([52.568, -115.593], 5);
    //Load tiles from OpenStreetMap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_43h0_1_711e31b181a9ac70ace470cb', {
   			maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy;<a href="https://carto.com/attributions">CARTO</a>' //put this attribution on one continuous line
		}).addTo(map);//add the base tiles to the map object
    console.log("Plotting Wells.")
    for (let i=0;i<wellData.length;i++){
        console.log(wellData[i].Well_UWI);
        let markerlocation = new L.LatLng(wellData[i].BH_Latitude,wellData[i].BH_Longitude);
        let marker = new L.Marker(markerlocation).addTo(map);
    }
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

const slider = document.getElementById("yearRange");
const year = document.getElementById("selectedYear");
const areadropdown = document.getElementById("areaselect");;
year.innerHTML=slider.value;
console.log(slider.value);

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    console.log(this.value);
    year.innerHTML = this.value;
}

areadropdown.addEventListener("change",function(event){
    area=event.target.value
    console.log("selected: ",area );
    if (area=="CAL"){
        map.setView([51.0579, -114.0738], 8);
    } 
    else if (area=="EDM"){
        map.setView([53.5372, -113.4995], 8);
    }
    else if (area=="RMH"){
        map.setView([52.3813, -114.9542], 8);
    }
    else if (area=="GP"){
        map.setView([55.1628, -118.7839], 8);
    }
    else {
        map.setView([52.568, -115.593], 5);
    }
});