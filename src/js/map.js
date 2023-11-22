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

function createCenterTable(){
    var root = document.getElementById("center_vis");
    root.innerHTML = ""

    document.getElementById("center_title").innerText = titles[approvalValue]
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


            let htmlTable = '<table><tr><th>#</th><th>Centro de Exames</th><th>Taxa de Aprovação Total</th></tr>';

            // Iterate through the data array
            for (let i = 0; i < data.length; i++) {
                // Extract values from the data object
                const center = data[i].examcenter;
                const approval = data[i].TA;

                // Add a new row to the HTML table
                htmlTable += `<tr><td>${i+1}</td><td>${center}</td><td>${approval}</td></tr>`;
            }

            // Close the HTML table tag
            htmlTable += '</table>';


            root.innerHTML = htmlTable;
        });
}

function createMap(){
    var map = new Datamap({
        element: document.getElementById('map_container'),
        geographyConfig: {
            dataJson: 'https://rawgit.com/markmarkoh/datamaps/master/src/js/data/prt.json'
        },
        scope: 'prt',
        setProjection: function(element, options) {
            var projection, path;
            projection = d3.geo.mercator()
                .center([-8.80, 38.45])
                .scale(3000)
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
            path = d3.geo.path().projection( projection );
            return {path: path, projection: projection};
        }

    });
}