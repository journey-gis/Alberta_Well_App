document.addEventListener("DOMContentLoaded", () => {
    console.log("Page is ready!");
    initializeMap();
});

function initializeMap(){
    //Create the map object and set the centre point and zoom level
    let map = L.map('wellMap');
    map.setView([52.568, -115.593], 5);
    //Load tiles from OpenStreetMap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_43h0_1_711e31b181a9ac70ace470cb', {
   			maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy;<a href="https://carto.com/attributions">CARTO</a>' //put this attribution on one continuous line
		}).addTo(map);//add the base tiles to the map object
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
