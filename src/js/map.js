let mapData;

let approvalValue = 2; //0: teoricos, 1: praticos, 2: total
let sortingMethod = 2; //0: asc, 1: desc, 2: a-z
const sortingMethods = [
    (a,b) => {return a.TA - b.TA},
    (a,b) => {return b.TA - a.TA},
    (a,b) => {return a.examcenter.localeCompare(b.center)}
]
const titles = [
    "Taxa de Aprovação dos Exames Teóricos por Centro de Exame",
    "Taxa de Aprovação dos Exames Práticos  por Centro de Exame",
    "Taxa de Aprovação Total  por Centro de Exame",
]

const subtitles = [
    "Ordenado de forma ascendente da Taxa de Aprovação",
    "Ordenado de forma descendente da Taxa de Aprovação",
    "Ordenado Alfabeticamente"
]

const mapSubtitles = [
    "Exames Teóricos",
    "Exames Práticos",
    "Total"
]

function drawCenterTable(){
    var root = document.getElementById("center_vis");
    root.innerHTML = ""

    document.getElementById("center_title").innerText = titles[approvalValue] + " - " + currentYear
    document.getElementById("center_subtitle").innerText = subtitles[sortingMethod];

    d3.csv("../../IMT_data/parsed_data/exam_center_parsed_data_all_years.csv", function (data) {

            data.forEach(function (d) {
                d.year = +d.year;
                d.examcenter = d.examcenter;

                //ESTA IMPLEMENTAÇÃO É MESMO ESTÚPIDA
                if(approvalValue === 0){
                    d.TA = +d.TA; // Aprovação Exames teóricos
                }
                else if(approvalValue === 1){
                    d.TA = +d.PA; // Aprovação Exames Práticos
                }
                else{
                    d.TA = +d.SA; // Aprovação Total
                }
            });

            data = data.filter(function (d){
                return d.year === parseInt(currentYear);
            })

            data = data.sort(sortingMethods[sortingMethod])

            let htmlTable = '<div style="max-height: 850px"  class="table-responsive overflow-y-auto"><table class="table table-striped table-hover"><thead><tr><th>#</th><th>Centro de Exames</th><th>Taxa de Aprovação Total</th></tr></thead><tbody>';

            // Iterate through the data array
            for (let i = 0; i < data.length; i++) {
                const center = data[i].examcenter;
                const approval = roundToTwoDecimalPlaces(data[i].TA * 100) + "%";

                htmlTable += `<tr><td>${i+1}</td><td>${center}</td><td>${approval}</td></tr>`;
            }

            htmlTable += '</tbody></table></div>';
            root.innerHTML = htmlTable;
        });
}

function readValuesForMap(districts, filteredData){

    console.log(filteredData)

    districts.forEach(element => {
        let index = filteredData.findIndex(obj => obj.district === element.name);
        let approval; //valor de aprovação escolhido

        if(approvalValue === 0){
            approval = filteredData[index].TA // Aprovação Exames teóricos
        }
        else if(approvalValue === 1){
            approval = filteredData[index].PA // Aprovação Exames Práticos
        }
        else{
            approval = filteredData[index].SA // Aprovação Total
        }


        element.value = approval * 100
        element.radius = approval * 20
    })

    return districts
}

function drawMap(){
    document.getElementById("map_vis").innerHTML = ""
    document.getElementById("map_title").innerText = "Taxa de Aprovação por Distrito -" + currentYear
    document.getElementById("map_subtitle").innerText = mapSubtitles[approvalValue];


    let data = mapData.filter(function (d){
        return d.year === parseInt(currentYear);
    })

    var bubbleData = [
        { name: 'Lisboa', radius: 20, latitude: 38.7253, longitude:  -9.1500, fillKey: 'district' },
        { name: 'Porto', radius: 15, latitude: 41.1621 , longitude: -8.6220, fillKey: 'district' },
        { name: 'Setúbal', radius: 15, latitude: 38.5243 , longitude: -8.8926, fillKey: 'district' },
        { name: 'Santarém', radius: 15, latitude: 39.2339 , longitude: -8.6861, fillKey: 'district' },
        { name: 'Viana do Castelo', radius: 15, latitude: 41.7000 , longitude: -8.8333, fillKey: 'district' },
        { name: 'Bragança', radius: 15, latitude: 41.8067 , longitude: -6.7589, fillKey: 'district' },
        { name: 'Braga', radius: 15, latitude: 41.5503 , longitude: -8.4200, fillKey: 'district' },
        { name: 'Vila Real', radius: 15, latitude: 41.2958 , longitude: -7.7461, fillKey: 'district' },
        { name: 'Castelo Branco', radius: 15, latitude: 39.8167 , longitude: -7.5000, fillKey: 'district' },
        { name: 'Coimbra', radius: 15, latitude: 40.2111 , longitude: -8.4292, fillKey: 'district' },
        { name: 'Leiria', radius: 15, latitude: 39.7500 , longitude: -8.8000, fillKey: 'district' },
        { name: 'Guarda', radius: 15, latitude: 40.5333 , longitude: -7.3333, fillKey: 'district' },
        { name: 'Viseu', radius: 15, latitude: 40.6667 , longitude: -7.9167, fillKey: 'district' },
        { name: 'Aveiro', radius: 15, latitude: 40.6333 , longitude: -8.6500, fillKey: 'district' },
        { name: 'Évora', radius: 15, latitude: 38.5667 , longitude: -7.9000, fillKey: 'district' },
        { name: 'Portalegre', radius: 15, latitude: 39.3167, longitude: -7.4167, fillKey: 'district' },
        { name: 'Beja', radius: 15, latitude: 38.0333, longitude: -7.8833, fillKey: 'district' },
        { name: 'Faro', radius: 15, latitude: 37.0161, longitude: -7.9350, fillKey: 'district' },
    ];

    bubbleData = readValuesForMap(bubbleData, data);

    var map = new Datamap({
        element: document.getElementById('map_vis'),
        geographyConfig: {
            dataJson: 'https://rawgit.com/markmarkoh/datamaps/master/src/js/data/prt.json'
        },
        scope: 'prt',
        setProjection: function(element, options) {
            var projection, path;
            projection = d3.geo.mercator()
                .center([-8.80, 38.45])
                .scale(5000)
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
            path = d3.geo.path().projection(projection);
            return { path: path, projection: projection };
        },
        fills: {
            defaultFill: colorMarcados,
            district: colorAprovados,
            // Add more fill colors for each district
        },
        data: {}, // Initialize an empty data object for bubbles
        geographyConfig: {
            highlightBorderColor: '#bada55',
            popupTemplate: function (geo, data) {
                return ['<div class="hoverinfo"><strong>',
                    'District: ' + data.name,
                    '</strong></div>'].join('');
            }
        }
    });

    // Add bubbles to the map
    map.bubbles(bubbleData, {
        popupTemplate: function (geo, data) {
            return '<div class="hoverinfo"><strong>Distrito: ' + data.name + '<br>Aprovação: ' + roundToTwoDecimalPlaces(data.value)+'%</strong></div>';
        }
    });
}
function createMap(){
    d3.csv("../../IMT_data/parsed_data/district_parsed_data_all_years.csv", function (data){

        data.forEach(function(d) {
            d.year = +d.year;
            d.district = d.district;
            d.TA = +d.TA;
            d.PA = +d.PA;
            d.SA = +d.SA;
        });


        mapData = data;

        drawMap()
    });
}