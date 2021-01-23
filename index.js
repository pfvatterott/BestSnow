var queryURL = "https://cors-proxy-server-pfvatterott.herokuapp.com/?q=http://api.powderlin.es/stations";
var map;
var powderResponse = [];

$.ajax({
    url: queryURL,
    method: "GET"
}).then(function (response) {
    powderResponse = response;
    console.log(powderResponse)

}).then(function GetMap() {
    map = new Microsoft.Maps.Map('#myMap', {
});

    for (let i = 0; i < powderResponse.length; i++) {
        var pin = new Microsoft.Maps.Pushpin({
            latitude: powderResponse[i].location.lat,
            longitude: powderResponse[i].location.lng,
        });

        // meta data stored in each pin
        pin.metadata = {
            title: powderResponse[i].name,
            elevation: powderResponse[i].elevation,
            id: powderResponse[i].triplet
        }

        // adds event handler function to each pin
        Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
        // pushes pin to map
        map.entities.push(pin);
    }


})

// Event Listener
function pushpinClicked(e) {
    console.log(e.target.metadata.id)
    // Displaying text in DOM
    $(".name").text("name: " + e.target.metadata.title)
    $(".elevation").text("elevation: " + e.target.metadata.elevation)
    $(".id").text("ID: " + e.target.id)

    // API call for station pin that was clicked
    var snowURL = "https://cors-proxy-server-pfvatterott.herokuapp.com/?q=http://api.powderlin.es/station/" + e.target.metadata.id + "?start_date=2013-10-01" + "&end_date=" + moment().format("YYYY-MM-DD");
    $.ajax({
        url: snowURL,
        method: "GET"
    }).then(function (stationResponse) {
        console.log(stationResponse)
        $(".date").text("Date: " + moment().format("YYYY-MM-DD"));
        $(".snow-depth").text("Snow Depth: " + stationResponse.data[stationResponse.data.length - 2]["Snow Depth (in)"] + " inches");


        // Creates data arrays for charts
        var dataArray2013 = [];
        var dataArray2014 = [];
        var dataArray2020 = [];
        var dataArray2019 = [];
        // Sets variables for averages
        var totalSnow = 0;
        var numberOfInstances = 0;

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

            // to find average for current day
            if (stationResponse.data[i].Date.slice(5) == moment().format("MM-DD")) {
                totalSnow = totalSnow + parseInt(stationResponse.data[i]["Snow Depth (in)"]);
                numberOfInstances = numberOfInstances + 1;
            }
            
            // for (let j = 0; j < stationResponse.data.length; j++) {
            //     if (moment(stationResponse.data[i].Date.slice(5)).isSame("2020-01-20")) {
            //         var totalSnow = totalSnow + parseInt(stationResponse.data[j]["Snow Depth (in)"]);
            //         var numberOfInstances = numberOfInstances + 1;
            //         var averageSnow = totalSnow / numberOfInstances;
            //         // console.log(stationResponse.data[i].Date + " and " + stationResponse.data[j].Date + "are the same");
            //         averageArray.push({ y: averageSnow, x: "2002-" + stationResponse.data[i].Date.slice(5) });
            //         console.log(averageArray);
            //     }
                
            // }
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

