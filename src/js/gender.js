const titulos = [
    "Provas Práticas Marcadas por Género",
    "Provas Práticas Realizadas por Género",
    "% de Aprovação por Género",
    "% de Reprovação por Género"
]

var genderData;
var margin = {top: 50, right: 30, bottom: 50, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

function drawGenderLegend(){

    var labels = [
        {label : "Homens", color : "#377eb8"},
        {label: "Mulheres", color : "#cc6df1"}
    ]

    labels.map(d => console.log(d.color))

    var svg = d3.select("#gender_legend")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", margin.top)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + ", 0)");

    const legend = svg.selectAll(".legend")
        .data(labels)
        .enter()
        .append("g")
        .attr("class", "legend")

    legend.selectAll("rect")
        .data(labels)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 100)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => d.color);

    legend.selectAll("text")
        .data(labels)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 100 + 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle")
        .text(d => d.label)

}

function drawGenderChart(col1, col2, titulo){
    document.getElementById("gender_bar").innerHTML = ""


    // append the svg object to the body of the page
    var svg = d3.select("#gender_bar")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var subgroups = genderData.columns.slice(col1,col2+1);

    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#cc6df1', '#377eb8']);

    // X axis
    var x = d3.scaleBand()
        .domain(genderData.map(function(d) { return d.year; }))
        .range([0, width])
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    var domainMax;
    var y;

    if(titulo === "%"){
        domainMax = 1
        y = d3.scaleLinear()
            .domain([0, domainMax])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y)
                .tickFormat(d3.format(".0%")));
    }
    else{
        domainMax = d3.max(genderData, (d) => {
            var fields = Object.values(d)
            return Math.max(fields[col1], fields[col2]);
        });
        y = d3.scaleLinear()
            .domain([0, domainMax])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));
    }

    // Add Y axis

    // Bars
    svg.selectAll(".barGroup")
        .data(genderData)
        .enter()
        .append("g")
        .attr("class", "barGroup")
        .attr("transform", function(d) {
            return "translate(" + x(d.year) + ",0)";
        })
        .selectAll("rect")
        .data(function(d) { return subgroups.map(function(key) { return { key: key, value: d[key] }; }); })
        .enter()
        .append("rect")
        .attr("x", function(d) { return x.bandwidth() / 2 * (subgroups.indexOf(d.key) - 0.5); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth() / 2)
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return color(d.key); });

    const tooltip = d3.select("#gender_bar")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip btn btn-info")
        .style("padding", "5px")
        .style("position", "absolute")
    const mouseover = function (event, d) {
        tooltip.style("opacity", 1)
    }
    const mousemove = function (event, d) {
        tooltip
            .html("Percentagem:")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px")
    }
    const mouseleave = function (d) {
        tooltip.style("opacity", 0)
    }

    svg.selectAll(".barGroup")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .text(titulos[titulo]);
}

function genderVis(col1, col2, titulo) {

    // Parse the Data
    d3.csv("../../IMT_data/parsed_data/gender_parsed_data_all_years.csv")
        .then(function(data) {

            // Convert strings to numbers
            data.forEach(function(d) {
                d.year = +d.year;
                d.PMF = +d.PMF;
                d.PRF = +d.PRF;
                d.AF = +d.AF;
                d.PMM = +d.PMM;
                d.PRM = +d.PRM;
                d.AM = +d.AM;
                d.RF = +d.RF;
                d.RM = +d.RM;
            });

            genderData = data;

            drawGenderChart(col1, col2, titulo);

        })
        .catch(function(error) {
            console.error("Error loading the CSV file:", error);
        });
}