
var maxApprovalScale = 250000;
var minApprovalScale = 0;
var approvalData;
var passMode = true;
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


function zoomInApproval(){
    minApprovalScale += 10000;
    drawApprovalChart()
}

function zoomOutApproval(){
    if(minApprovalScale > 0){
        minApprovalScale -= 10000;
        drawApprovalChart()
    }
}

function drawApprovalLegend(){

    var labels = [
        {label : "Marcados", color : "#377eb8"},
        {label: "Realizados", color : "#cc6df1"},
        {label: "Aprovados", color : "#68f26f"}
    ]


    var svg = d3.select("#approval_legend")
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
        .attr("x", (d, i) => i * 110)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => d.color);

    legend.selectAll("text")
        .data(labels)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 110 + 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle")
        .text(d => d.label)

}

function drawApprovalChart(){
    document.getElementById("approval_bar").innerHTML = ""

    // append the svg object to the body of the page
    var svg = d3.select("#approval_bar")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .domain(approvalData.map(function(d) { return d.year; }))
        .range([0, width])
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Y axis
    var y = d3.scaleLinear()
        .domain([minApprovalScale, maxApprovalScale])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Line function
    var line = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.value); });

    // Draw PMT line
    svg.append("path")
        .data([approvalData.map(function(d) { return { year: d.year, value: d.PMT }; })])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke-width", 2)
        .style("stroke", "red")
        .style("fill","none");

    // Draw PRT line
    svg.append("path")
        .data([approvalData.map(function(d) { return { year: d.year, value: d.PRT }; })])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke-width", 2)
        .style("stroke", "green")
        .style("fill","none");

    // Draw AT line
    svg.append("path")
        .data([approvalData.map(function(d) {
            var performance = passMode? d.AT : d.RT;
            return { year: d.year, value: performance };
        })])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke-width", 2)
        .style("stroke", "blue")
        .style("fill","none");

    // Tooltip
    const tooltip = d3.select("#approval_bar")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip btn btn-info")
        .style("padding", "5px")
        .style("position", "absolute")

    // Three function that change the tooltip when user hover / move / leave a cell
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

    svg.selectAll(".line")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .text("Aprovação Anual");
}



function approvalVis() {
    // set the dimensions and margins of the graph

    // Parse the Data
    d3.csv("../../IMT_data/parsed_data/approval_parsed_data_all_years.csv").then(function(data) {

        // Convert strings to numbers
        data.forEach(function(d) {
            d.year = +d.year;
            d.PMT = +d.PMT;
            d.PRT = +d.PRT;
            d.AT = +d.AT;
            d.APT = +d.APT;
            d.RT = +d.RT;
            d.RPT = +d.RPT;
        });

        approvalData = data;

        drawApprovalChart()


    }).catch(function(error) {
        console.error("Error loading the CSV file:", error);
    });
}
