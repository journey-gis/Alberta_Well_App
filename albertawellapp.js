document.addEventListener("DOMContentLoaded", () => {
    console.log("Page is ready!");
    initializeMap();
});

const map = L.map('wellMap'); //Create the global map object
const markerLayer = L.layerGroup().addTo(map); // Add a grouplayer we can add and remove markers from.

// Set up the initial code to identify and set the year range sliders
// Get the objects and store them as variables
const sliderstart =document.getElementById("yearStart");
const sliderend = document.getElementById("yearEnd");
const yearstart = document.getElementById("selectedYearStart");
const yearend = document.getElementById("selectedYearEnd");

// Set the text on the page to be the starting year values
yearstart.innerHTML=sliderstart.value;
yearend.innerHTML=sliderend.value;

const areadropdown = document.getElementById("areaselect");
var wells=""; //Global variable for holding loaded well data


console.log(sliderend.value);

const wellIcon = L.icon({ 
    iconUrl : 'wellsymbol.png', 
    iconSize:[48,32] 
});


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

    wellsperyear();
    console.log("Map loaded!");

}

function wellsperyear(){
    console.log("Building Charts")
    if (wells.length<1){
        wells=[];
    }

    const layout = {
        title: {
            text: "Wells Drilled Per Year"
        },
        xaxis: {
            title: { text: "Year" },
            dtick: 1,
            automargin: true
        },
        yaxis: {
            title: { text: "Well Count" },
            rangemode: "tozero"
        },
        margin: {
            l: 50,
            r: 10,
            t: 40,
            b: 40
        }
    };

    const layout2 = {
        title: {
            text: "Well Depth"
        },
        xaxis: {
            title: { text: "Depth" },
            dtick: 1000,
            automargin: true,
            type: "linear"
        },
        yaxis: {
            title: { text: "Well Count" },
            rangemode: "tozero"
        },
        margin: {
            l: 50,
            r: 10,
            t: 40,
            b: 40
        }
    };

    const filteredWells = wells.filter(well => // Filter our well array showing only relevant wells.
        well.Year >= sliderstart.value && well.Year <= sliderend.value
    );
    const depths = filteredWells.map(well => Number(well.Final_Total_Depth));

    console.log("Year Chart....")
    console.log(depths)
    Plotly.react('yearhist', [{
        x:filteredWells.map(well => well.Year),
        type:"histogram"
    }],layout,{responsive: true});

    console.log("Depth Chart....")
    Plotly.react('depthhist', [{
        x:depths,
        type:"histogram",
        xbins:{
            size:500
        }
    }],layout2,{responsive: true});
    console.log("Charts completed")
}

function updateMarkers(){;
    markerLayer.clearLayers(); // Clear the current markerlayer

    const filteredWells = wells.filter(well =>  // Filter our well array showing only relevant wells.
        well.Year >= sliderstart.value && well.Year <= sliderend.value
    );
    console.log("Updating markers.")
    for (let i=0; i<filteredWells.length;i++){
            let wellLocation = new L.LatLng(filteredWells[i].LATITUDE, filteredWells[i].LONGITUDE); 
            let marker = new L.Marker(wellLocation,{icon:wellIcon}).addTo(markerLayer)
    }
    console.log("> Updated.")
    wellsperyear();
}


// Update the current slider value (each time you drag the slider handle)
sliderstart.oninput = function () {
    console.log(this.value);
    yearstart.innerHTML = this.value; // Set the text on the webpage to the current value
    end=sliderend.value; // Get the current value of the end slider
    if(end<this.value){ // Check and make sure the start slider is always smaller or equal to the end
        sliderend.value=this.value;
        yearend.innerHTML = this.value;
    }
    updateMarkers(); // Update the markers on the map
}

// Update the current slider value (each time you drag the slider handle)
sliderend.oninput = function () {
    console.log(this.value);
    yearend.innerHTML = this.value; // Set the text on the webpage to the current value
    start=sliderstart.value; // Get the current value of the start slider
    if(start>this.value){ // Check and make sure the end slider is always larger or equal to the start
        sliderstart.value=this.value;
        yearstart.innerHTML = this.value;
    }
    updateMarkers(); // Update the markers on the map
}

areadropdown.addEventListener("change",function(event){
    area=event.target.value // get the area name for easy reference
    console.log("selected: ",area ); // Debugging code
    // The if else statements below control zooming, loading and calling update features.
    if (area=="ELM"){
        map.setView([54.8343, -118.5395], 8);
        wells=elmworthwells();
    }
    else if (area=="PEM"){
        map.setView([53.08919, -114.9765], 8);
        wells=pembinawells();
    }
    else if (area=="PRO"){
        map.setView([52.1925, -111.1416], 8);
        wells=provostwells();
    }
    else {
        map.setView([55.1499, -114.8228], 5);
        wells="";
    }
    wellsperyear();
    updateMarkers(wells);
});