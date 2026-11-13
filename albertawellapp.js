// Alberta Well Development Web App
// Web app developed to investigate the freely available well data provided by the AER in Alberta Canada
// 
// Written by Keith Johnson
// November 2026

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

// Get the object IDs for the filters
const symbolization = document.getElementById("symbolization");
const companyDropdown = document.getElementById("companyDropdown")

const areadropdown = document.getElementById("areaselect");
let wells=""; //Global variable for holding loaded well data

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
    // Set the text on the page to be the starting year values
    yearstart.innerHTML=sliderstart.value;
    yearend.innerHTML=sliderend.value;

    wellsperyear(); // Update the histograms
    console.log("Map loaded!"); // debug
}

function wellsperyear(){ // Function to update and render the two histograms (Depth and years)
    console.log("===Building Charts===") // debug
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

    let filtwells=filterWells();
    const depths = filtwells.map(well => Number(well.Final_Total_Depth));
    
    console.log("Year Chart....") // debug
    Plotly.react('yearhist', [{
        x:filtwells.map(well => well.Year),
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

function filterWells(){
    console.log("===Filterwells===")  
    // console.log("Filtering "+sliderstart.value+" to "+sliderend.value) //debug code
    // console.log("Filtering "+ filtcompany) //debug code
    let filtwells="";
    filtwells = wells.filter(well =>  // Filter our well array showing only relevant wells.
        well.Year >= sliderstart.value && well.Year <= sliderend.value);

    if (companyDropdown.value!="Default"){
        filtwells = filtwells.filter(well =>  // Filter our well array showing only relevant wells.
            well.Licensee==companyDropdown.value);
        }
    //console.log(filtwells) //debug code
    console.log("> Filtered")  
    return filtwells;
}

function updateMarkers(){; // Function to update the well symbols as values are updates (Sliders, symbology)
    console.log("===updateMarkers===")
    markerLayer.clearLayers(); // Clear the current markerlayer

    let filtwells=filterWells(); // Get the filtered well set
    //console.log("filtered company ", filteredwells) //debug code
    // console.log("Symbol: "+symbol) // debug
       
    symbolColours="";

    for (let i=0; i<filtwells.length;i++){  // Step through the current wells and add them to the map.
            let wellLocation = new L.LatLng(filtwells[i].LATITUDE, filtwells[i].LONGITUDE); 
            // console.log(filtwells[i].LATITUDE,filtwells[i].LONGITUDE); debug code

            let info = "<div class=infowindow><b><h3>" + filtwells[i].Well_UWI + "</h3></b>"+
                "<b>Company:</b> " + filtwells[i].Licensee +     
                "<br><b>Spud Date:</b> " + filtwells[i].Spud_Date + 
                "<br><b>License Status:</b> " + filtwells[i].Licence_Status + 
                "<br><b>Total Depth:</b> " + filtwells[i].Final_Total_Depth + "m"+
                "</p></div>";
            if(symbolization.value=="COMP"){
                const [symbolColours,legenddata]=assignColours(filtwells,5,"Licensee");
                console.log("symbolization: ",symbolColours);
                let marker = new L.circleMarker(wellLocation,{radius:5,fillColor:symbolColours[filtwells[i].Licensee],color:'#000',weight:1,fillOpacity: 1.0}).addTo(markerLayer).bindPopup(info);
                // console.log(symbolColours[filteredWells[i].Licensee]); // debug code
                legend.addTo(map);
            }
            else if (symbolization.value=="LIC"){
                const [symbolColours,legenddata]=assignColours(filtwells,5,"Licence_Status");
                console.log("symbolization: ",symbolColours);
                let marker = new L.circleMarker(wellLocation,{radius:5,fillColor:symbolColours[filtwells[i].Licence_Status],color:'#000',weight:1,fillOpacity:1.0}).addTo(markerLayer).bindPopup(info);
                // console.log(symbolColours[filteredWells[i].Licensee]);  // debug code 
                legend.addTo(map);
            }
            else
            {
                let marker = new L.circleMarker(wellLocation,{radius:5,fillColor:'#ebb104',color:'#000',weight:1,fillopacity:0.8}).addTo(markerLayer).bindPopup(info);
                legend.remove();
            }
    }
    console.log("> Updated."); // debug
    wellsperyear();
}

function fnv1aHash(str) { // Function to create a unique number based on the company name
  let hash = 0x811c9dc5; // FNV offset basis

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // Multiply by FNV prime (16777619) using 32-bit bitwise operations
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

function assignColours(entity,max,label){ 
    //console.log("Building legend Colours") // debug code
    //Script to generate colors and names for X number of companies with all others listed as other
    //company is the data array to process
    //max is the number of companies to give colours to.
    //Result is two lists, one has a legend name and the other the mapping colour
    const entcolours=['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99']
    const entitycolours={};
    const legendnames={}; // place holder
    const legenddata=[];
    const entitycount = entity.reduce((accumulator,item) => {
        const key=item[label];
        accumulator[key]=(accumulator[key]||0)+1;
        return accumulator;
    },{}); // This line steps through the data array and makes a count of each discrete entry.
    entityarray=Object.entries(entitycount).map(([Licensee,count])=>({[label]:Licensee,count})) //Convert from array to object
    sorted=entityarray.sort((a, b) => b.count - a.count) // sort object based on count
    //console.log("length "+ sorted.length) // debug code

    let otherentry=1 // Set a flag to see if we need an "other" entry on the legend
    if(max>sorted.length){ // if our requested display is more than the number of entries, we do not
        max=sorted.length; // set our requested number to the total number
        otherentry=0 // set the other flag to 0.
    }
    //console.log("entity:", sorted); // debug code
    for (i=0;i<sorted.length;i++){ // Step through the new list and generate a hash and colour for first max entires
    if(i<max){
        entitycolours[sorted[i][label]]=entcolours[i]
        legenddata.push({label:sorted[i][label]+" ("+sorted[i]["count"]+")",colour:entcolours[i]});
    } else { // all remaining entries get other and grey
        entitycolours[sorted[i][label]]='#808080'
    }
    }
    if (otherentry==1){
        legenddata.push({label:"Other",colour:'#808080'});
    }
    //console.log(entitycolours)
    return [entitycolours,legenddata];
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
    updateCompanyDropdown();
    updateMarkers();
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
    updateCompanyDropdown();
    updateMarkers();
}
function getwellCentre(wells){
    console.log("===Getting Well Centre===")
    let latsum=0
    let longsum=0
    if (wells.length>0){
        for (const well of wells){
            latsum+=well.LATITUDE;
            longsum+=well.LONGITUDE;
        }
        let latavg=latsum/wells.length
        let longavg=longsum/wells.length
        map.setView([latavg, longavg], 8);
    } else {
        map.setView([55.1499, -114.8228], 5);
    }
}

// Event listeners
areadropdown.addEventListener("change",function(event){  // Runs when the area drop down changes
    console.log("===Area Dropdown Listener: Change===")
    area=event.target.value // get the area name for easy reference
    filtcompany="Default"
    console.log("selected: ",area ); // Debugging code
    // The if else statements below control zooming, loading and calling update features.
    if (area=="ELM"){
        wells=elmworthwells();
    }
    else if (area=="PEM"){
        wells=pembinawells();
    }
    else if (area=="PRO"){
        wells=provostwells();
    }
    else if (area=="SNC"){
        wells=sinclairwells();
    }
    else if (area=="MED"){
        wells=medhatwells();
    }  
    else if (area=="KAYS"){
        wells=kaybobswells();
    }  
    else if (area=="KIRB"){
        wells=kirbywells();
    }  
    else {
        wells="";
    }
    getwellCentre(wells);
    if (wells==""){ // Checks to see if there is an active area.
        resetCompanyDropdown() // No active wells, reset the company dropdown
        markerLayer.clearLayers(); // Clear the current markerlayer
    } else {
        // Active wells, update the markers to reflect these
        updateCompanyDropdown(); // Update the company dropdown.
        updateMarkers();
    }
});

symbolization.addEventListener("change",function(event){ // Runs when the Symbolization changes.
    console.log("===Symbolization Listener: Change===")
    updateMarkers();

});

companyDropdown.addEventListener("change",function(event){ // Runs when the companydropdown changes.
    console.log("===Company Dropdown Listener: Change===")
    updateMarkers();
});

function resetCompanyDropdown(){ // Resets the company drop down to "Default"
    console.log("===Resetting Company Dropdown===")
    companyDropdown.length=1; // Clear the dropdown
}

function updateCompanyDropdown(){  // Updates the main company drop down to reflect the current filtered wells
    console.log("===Updating Company Dropdown===")
    companyDropdown.length=1; // Clear the dropdown
    let filteredwells=filterWells();
    //console.log(filteredwells) //debug code
    const companies =[...new Set(filteredwells.map(well=>well.Licensee))].filter(Licensee => Licensee != null);
    //console.log("companies: ", companies) //debug code

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

// These functions deal with the legend
const legend=L.control({
    position: 'bottomright'
});

legend.onAdd = function(map) {
    console.log("Adding to map.")
    let html=""
    const div = L.DomUtil.create('div', 'info');
    filtwells=filterWells();
    
    if (symbolization.value=="COMP"){
        // console.log(filteredwells); //debug code
        const [wellcolours,legenddata]=assignColours(filtwells,5,"Licensee");
        // console.log(legenddata); //debug code
        html=generatelegend(legenddata);
        div.innerHTML = '<h4>Companies (Top 5)</h4>' + html;
    } else if (symbolization.value=="LIC"){
        // console.log(filteredwells); //debug code
        const [wellcolours,legenddata]=assignColours(filtwells,5,"Licence_Status");
        // console.log(legenddata); //debug code
        html=generatelegend(legenddata);
        div.innerHTML = '<h4>License Status (Top 5)</h4>' + html;
    } else {
        div.innerHTML = '<h4>Select Colour by</h4>';
    }
  
    return div;
};

function generatelegend(legenddata){
    console.log(legenddata)
    html=""
        legenddata.forEach(x => {
        html+=`
            <div class="legend-item">
            <span class="legend-patch" style ="background-color:${x.colour};"></span>
            <span class="legend-label">${x.label}</span>
            </div>
        `;
        });
    return html;
}