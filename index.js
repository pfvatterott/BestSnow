var queryURL = "stations.json";
var map;

// checks if local storage is present and generates list if it is
var savedPinList = JSON.parse(localStorage.getItem("clickedPins"));
if (savedPinList =! null) {
    generatePinList(savedPinList)
}

// generates list from local storage
function generatePinList() {
    savedPinList = JSON.parse(localStorage.getItem("clickedPins"))

    $(".samplebutton").text(savedPinList[0].pin)
    // add code here to generate list based on local storage
}

$.ajax({
    url: queryURL,
    method: "GET"
}).then(function (response) {
    powderResponse = response;
}).then(function GetMap() {
    var navigationBarMode = Microsoft.Maps.NavigationBarMode;
    map = new Microsoft.Maps.Map('#myMap', {
        showSearchBar: true,
        navigationBarMode: navigationBarMode.square,
        supportedMapTypes: [Microsoft.Maps.MapTypeId.road, Microsoft.Maps.MapTypeId.aerial]
    });
    // sets to false as default
    var isAboveAverage = false;
    var isBelowAverage = false;
    var isAverage = false;

    // creates URL to pull from saved json files
    for (let i = 0; i < powderResponse.length; i++) {
        var pinURL = "data/input" + powderResponse[i].name + ".json";
        $.ajax({
            url: pinURL,
            method: "GET"
        }).then(function (averageSnow) {
            var totalSnow = 0;
            var numberOfInstances = 0;
            // iterates through each station json file
            for (let k = 0; k < averageSnow.data.length; k++) {
                // if date from json file equals date from yesterday (no year)
                if (averageSnow.data[k].Date.slice(5) == averageSnow.data[averageSnow.data.length - 1].Date.slice(5)) {
                    totalSnow = totalSnow + parseInt(averageSnow.data[k]["Snow Depth (in)"]);
                    numberOfInstances = numberOfInstances + 1;
                };
            }

            // snow depth from yesterday
            var todaySnow = 0;
            if (averageSnow.data[averageSnow.data.length - 1]["Snow Depth (in)"] === null) {
                todaySnow = 0;
            } else {
                todaySnow = averageSnow.data[averageSnow.data.length - 1]["Snow Depth (in)"];
            }
            // compares yesterday snow to historical snow averages then calls setPin function to set color
            var average = totalSnow / numberOfInstances;
            var aboveAverage = average * 1.1;
            var belowAverage = average * .9;
            if (todaySnow > aboveAverage) {
                isAboveAverage = true;
                isBelowAverage = false;
                isAverage = false;
                setPin(isAboveAverage, isBelowAverage, isAverage); 

            } else if (todaySnow < belowAverage) {
                isBelowAverage = true;
                isAboveAverage = false;
                isAverage = false;
                setPin(isAboveAverage, isBelowAverage, isAverage); 
            } else {
                isBelowAverage = false;
                isAboveAverage = false;
                isAverage = true;
                setPin(isAboveAverage, isBelowAverage, isAverage);
            }
        })

        // sets pin color
        function setPin(isAboveAverage, isBelowAverage, isAverage) {
            if (isAboveAverage === true) { 
                var pin = new Microsoft.Maps.Pushpin({
                    latitude: powderResponse[i].location.lat,
                    longitude: powderResponse[i].location.lng,
                },
                    {
                        color: '#084593'
                    });
                // meta data stored in each pin
                pin.metadata = {
                    title: powderResponse[i].name,
                    elevation: powderResponse[i].elevation,
                    id: powderResponse[i].triplet,
                    lat: powderResponse[i].location.lat,
                    lng: powderResponse[i].location.lng
                }
                // adds event handler function to each pin
                Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
                // pushes pin to map
                map.entities.push(pin);
            }
            else if (isBelowAverage === true) { 
                var pin = new Microsoft.Maps.Pushpin({
                    latitude: powderResponse[i].location.lat,
                    longitude: powderResponse[i].location.lng,
                },
                    {
                        color: '#C6DBEF'
                    });
                // meta data stored in each pin
                pin.metadata = {
                    title: powderResponse[i].name,
                    elevation: powderResponse[i].elevation,
                    id: powderResponse[i].triplet,
                    lat: powderResponse[i].location.lat,
                    lng: powderResponse[i].location.lng
                }
                // adds event handler function to each pin
                Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
                // pushes pin to map
                map.entities.push(pin);
            }
            else if (isAverage === true) { 
                var pin = new Microsoft.Maps.Pushpin({
                    latitude: powderResponse[i].location.lat,
                    longitude: powderResponse[i].location.lng,
                },
                    {
                        color: '#6BAED6'
                    });
                // meta data stored in each pin
                pin.metadata = {
                    title: powderResponse[i].name,
                    elevation: powderResponse[i].elevation,
                    id: powderResponse[i].triplet,
                    lat: powderResponse[i].location.lat,
                    lng: powderResponse[i].location.lng
                }
                // adds event handler function to each pin
                Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
                // pushes pin to map
                map.entities.push(pin);
            }
        }
    }

})

// Sample of clicking button of saved pin and the map reacting to it
$(".samplebutton").on("click", function(){
    var savedCoordinates = JSON.parse(localStorage.getItem("clickedPins"));
    var lat = savedCoordinates[0].lat;
    var lng = savedCoordinates[0].lng;
    map.setView({
        center: new Microsoft.Maps.Location(lat, lng),
        zoom: 15
    })
})


// Event Listener
function pushpinClicked(e) {
    console.log(e.target.metadata.lat)

    // Save to local storage then generate list
    savedPinList = JSON.parse(localStorage.getItem("clickedPins"));
    if (savedPinList != null) {
        savedPinList.push({ pin: e.target.metadata.title, lat: e.target.metadata.lat, lng: e.target.metadata.lng});
        localStorage.setItem("clickedPins", JSON.stringify(savedPinList));
        console.log(savedPinList[0].pin)
        generatePinList(savedPinList);
    }
    else {
        savedPinList = ([{ pin: e.target.metadata.title, lat: e.target.metadata.lat, lng: e.target.metadata.lng}]);
        localStorage.setItem("clickedPins", JSON.stringify(savedPinList));
        generatePinList(savedPinList);
    }
    

    // Displaying text in DOM
    $(".name").text("name: " + e.target.metadata.title)
    $(".elevation").text("elevation: " + e.target.metadata.elevation)
    $(".id").text("ID: " + e.target.id)

    // API call for station pin that was clicked
    var snowURL = "data/input" + e.target.metadata.title + ".json"
    $.ajax({
        url: snowURL,
        method: "GET"
    }).then(function (stationResponse) {
        $(".date").text("Date: " + moment().format("YYYY-MM-DD"));
        $(".snow-depth").text("Snow Depth: " + stationResponse.data[stationResponse.data.length - 1]["Snow Depth (in)"] + " inches");


        // Creates data arrays for charts
        var dataArray2013 = [];
        var dataArray2014 = [];
        var dataArray2020 = [];
        var dataArray2019 = [];

        for (let i = 0; i < stationResponse.data.length; i++) {
            if (moment(stationResponse.data[i].Date).isBetween('2013-10-01', '2014-06-30')) {
                if (moment(stationResponse.data[i].Date).isBetween('2013-10-01', '2014-01-01')) {
                    dataArray2013.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) }) //removed year then added 2001 or 2002 so all data aligns on graph.
                }
                else {
                    dataArray2013.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                }
            }
            else if (moment(stationResponse.data[i].Date).isBetween('2014-10-01', '2015-06-30')) {
                if (moment(stationResponse.data[i].Date).isBetween('2014-10-01', '2015-01-01')) {
                    dataArray2014.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) })
                }
                else {
                    dataArray2014.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                }
            }
            else if (moment(stationResponse.data[i].Date).isBetween('2020-10-01', '2021-06-30')) {
                if (moment(stationResponse.data[i].Date).isBetween('2020-10-01', '2021-01-01')) {
                    dataArray2020.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) })
                }
                else {
                    dataArray2020.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                }
            }
            else if (moment(stationResponse.data[i].Date).isBetween('2019-10-01', '2020-06-30')) {
                if (moment(stationResponse.data[i].Date).isBetween('2019-10-01', '2020-01-01')) {
                    dataArray2019.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) })
                }
                else {
                    dataArray2019.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                }
            };
        }

        //Create Chart
        var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            theme: "light2",
            title: {
                text: stationResponse.station_information.name
            },
            axisY: {
                title: "Current Snow Depth",
                suffix: " inches"
            },
            axisX: {
                labelFormatter: function (e) {
                    return CanvasJS.formatDate(e.value, "DD MMM");
                },
                intervalType: "month"
            },
            data: [{
                type: "spline",
                indexLabelFontSize: 16,
                name: "2013-2014",
                showInLegend: true,
                dataPoints: dataArray2013,
                xValueFormatString: "DD-MMM"

            },
            {
                type: "spline",
                indexLabelFontSize: 16,
                name: "2014-2015",
                showInLegend: true,
                dataPoints: dataArray2014,
                xValueFormatString: "DD-MMM",
            },
            {
                type: "spline",
                indexLabelFontSize: 16,
                name: "2020-2021",
                showInLegend: true,
                dataPoints: dataArray2020,
                xValueFormatString: "DD-MMM",
            },
            {
                type: "spline",
                indexLabelFontSize: 16,
                name: "2019-2020",
                showInLegend: true,
                dataPoints: dataArray2019,
                xValueFormatString: "DD-MMM",
            }
            ]
        });
        chart.render();
    })
}

