document.addEventListener("DOMContentLoaded", () => {
    console.log("Page is ready!"); // debug
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
const symbolization = document.getElementById("symbolization");
const controlpanel = document.getElementById("controlpanel");
const legendpanel = document.getElementById("legend");
const companyDropdown = document.getElementById("companyDropdown")

// Set the text on the page to be the starting year values
yearstart.innerHTML=sliderstart.value;
yearend.innerHTML=sliderend.value;

const areadropdown = document.getElementById("areaselect");
var wells=""; //Global variable for holding loaded well data
var symbol="default"; //Global variable for holding selected symbology
var filtcompany="Default";

console.log(sliderend.value); // debug
console.log(symbol)
 
const wellIcon = L.icon({ // Well Icon
    iconUrl : 'wellsymbol.png', 
    iconSize:[48,32] 
});

function initializeMap(){     //Create the map object and set the centre point and zoom level
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

    wellsperyear(); // Update the histograms
    console.log("Map loaded!"); // debug
}

function wellsperyear(){ // Function to update and render the two histograms (Depth and years)
    console.log("Building Charts") // debug
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
            rangemode: "tozero",
            automargin: true
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
    console.log(filtcompany)
    if (filtcompany=="Default"){
        filteredWells = wells.filter(well =>  // Filter our well array showing only relevant wells.
            well.Year >= sliderstart.value && well.Year <= sliderend.value
        );
    }
    else{
        filteredWells = wells.filter(well =>  // Filter our well array showing only relevant wells.
            well.Year >= sliderstart.value && well.Year <= sliderend.value && well.Licensee==filtcompany
        );
    }
    const depths = filteredWells.map(well => Number(well.Final_Total_Depth));

    console.log("Year Chart....") // debug
    Plotly.react('yearhist', [{
        x:filteredWells.map(well => well.Year),
        type:"histogram"
    }],layout,{responsive: true});

    console.log("Depth Chart....") // debug
    Plotly.react('depthhist', [{
        x:depths,
        type:"histogram",
        xbins:{
            size:500
        }
    }],layout2,{responsive: true});
    console.log("Charts completed") // debug
}

function updateMarkers(){; // Function to update the well symbols as values are updates (Sliders, symbology)
    markerLayer.clearLayers(); // Clear the current markerlayer

    var filteredWells = wells.filter(well =>  // Filter our well array showing only relevant wells.
        well.Year >= sliderstart.value && well.Year <= sliderend.value);
    
    if (filtcompany!="Default"){
        filteredWells = filteredWells.filter(well =>  // Filter our well array showing only relevant wells.
            well.Licensee==filtcompany);
    }

    console.log("Updating markers.") // debug
    console.log(symbol) // debug
       
    symbolColours="";


    for (let i=0; i<filteredWells.length;i++){  // Step through the current wells and add them to the map.
            let wellLocation = new L.LatLng(filteredWells[i].LATITUDE, filteredWells[i].LONGITUDE); 
            //let marker = new L.Marker(wellLocation,{icon:wellIcon}).addTo(markerLayer)
            if(symbol=="COMP"){
                symbolColours=companyColour(); 
                let marker = new L.circleMarker(wellLocation,{radius:5,fillColor:symbolColours[filteredWells[i].Licensee],color:'#000',weight:1,fillopacity:0.9}).addTo(markerLayer);
                console.log(symbolColours[filteredWells[i].Licensee]);
            }
            else if (symbol=="LIC"){
                symbolColours=licenseColour();
                let marker = new L.circleMarker(wellLocation,{radius:5,fillColor:symbolColours[filteredWells[i].Licence_Status],color:'#000',weight:1,fillopacity:0.9}).addTo(markerLayer);
                console.log(symbolColours[filteredWells[i].Licensee]);   
            }
            else
            {
                let marker = new L.circleMarker(wellLocation,{radius:5,fillColor:'#ebb104',color:'#000',weight:1,fillopacity:0.8}).addTo(markerLayer);
            }
    }
    console.log("> Updated.") // debug
    wellsperyear(); // Update wells histograms
    return filteredWells;
}

function companyColour() {
    const companies = [...new Set(
        wells.map(well => well.Licensee)
    )].filter(Licensee => Licensee != null);  // Build a unqique list of companies within the area

    const colours = {}; // Set up an empty dictionary to store the generated colours
    console.log(companies) // debug
    companies.sort().forEach((Licensee, index) => {
        const hue = (index * 137.508) % 360;
        colours[Licensee] = `hsl(${hue}, 65%, 45%)`;
    });
    console.log(colours)
    return colours;
}

function licenseColour() {
    const licenses = [...new Set(
        wells.map(well => well.Licence_Status)
    )].filter(Licence_Status => Licence_Status != null);  // Build a unqique list of companies within the area

    const colours = {}; // Set up an empty dictionary to store the generated colours
    console.log(licenses) // debug
    licenses.sort().forEach((Licence_Status, index) => {
        const hue = (index * 137.508) % 360;
        colours[Licence_Status] = `hsl(${hue}, 65%, 45%)`;
    });
    console.log(colours)
    return colours;
}

// Update the current slider value (each time you drag the slider handle)
sliderstart.oninput = function () {
    console.log(this.value); // debug
    yearstart.innerHTML = this.value; // Set the text on the webpage to the current value
    end=sliderend.value; // Get the current value of the end slider
    if(end<this.value){ // Check and make sure the start slider is always smaller or equal to the end
        sliderend.value=this.value;
        yearend.innerHTML = this.value;
    }
    filteredwells=updateMarkers(); // Update the markers on the map
    updateCompanyDropdown(filteredwells);
}

// Update the current slider value (each time you drag the slider handle)
sliderend.oninput = function () {
    console.log(this.value); // debug
    yearend.innerHTML = this.value; // Set the text on the webpage to the current value
    start=sliderstart.value; // Get the current value of the start slider
    if(start>this.value){ // Check and make sure the end slider is always larger or equal to the start
        sliderstart.value=this.value;
        yearstart.innerHTML = this.value;
    }
    filteredwells=updateMarkers(); // Update the markers on the map
    updateCompanyDropdown(filteredwells);
}


// Event listeners
areadropdown.addEventListener("change",function(event){
    area=event.target.value // get the area name for easy reference
    console.log("selected: ",area ); // Debugging code
    // The if else statements below control zooming, loading and calling update features.
    if (area=="ELM"){
        map.setView([55.0088, -119.2125], 9);
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
    else if (area=="SNC"){
        map.setView([55.3374, -119.8364], 8);
        wells=sinclairwells();
    }
    else if (area=="MED"){
        map.setView([50.1029, -110.4215], 8);
        wells=medhatwells();
    }  
    else if (area=="KAYS"){
        map.setView([54.2234, -116.8973], 9);
        wells=kaybobswells();
    }  
    else {
        map.setView([55.1499, -114.8228], 5);
        wells="";
    }

    if (wells==""){ // Checks to see if there is an active area.
        resetCompanyDropdown() // No active wells, reset the company dropdown
        markerLayer.clearLayers(); // Clear the current markerlayer
    } else {
        filteredwells=updateMarkers(); // Active wells, update the markers to reflect these
        updateCompanyDropdown(filteredwells); // Update the company dropdown.
    }
});

symbolization.addEventListener("change",function(event){
    symbol=event.target.value;
    updateMarkers();  
});

companyDropdown.addEventListener("change",function(event){
    filtcompany=event.target.value;
    updateMarkers(); 
});

function resetCompanyDropdown(){
    console.log("Resetting Company Dropdown")
    companyDropdown.length=1; // Clear the dropdown
}

function updateCompanyDropdown(filteredwells){
    companyDropdown.length=1; // Clear the dropdown
    const companies = [...new Set(
        filteredWells.map(well => well.Licensee)
    )].filter(Licensee => Licensee != null);  // Build a unqique list of companies within the area

    console.log("Companies")
    console.log(companies)

    companies.forEach(company => {
        console.log("Adding: " + company)
        const option = document.createElement('option');
        option.value=company;
        option.textContent=company;
        companyDropdown.appendChild(option);
    });

};


// These handle the hide/show controls for the sidebar

document.getElementById("btnHideControls").addEventListener("click", () => {
    controlpanel.hidden = !controlpanel.hidden;
});
document.getElementById("btnHideLegend").addEventListener("click", () => {
    legendpanel.hidden = !legendpanel.hidden;
});

