var ageData;
var pieData;
var currentYear = "2015";

function drawAgeLegend(){
    var svg = d3.select("#age_legend")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", margin.top)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + ", 10)");

    // Add a legend
    const legend = svg.selectAll(".legend")
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", "legend");

    legend.selectAll("rect")
        .data(pieData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 180)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => d.color);

    legend.selectAll("text")
        .data(pieData)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 180 + 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle")
        .text(d => d.label);
}

function drawAgeChart(data) {
    document.getElementById("age_bar").innerHTML = ""
    // Data for the pie chart
    pieData = [
        {label: 'Taxa de\n Aprovação', value: data.AT, color: '#66c2a5'},
        {label: 'Taxa de\n Reprovação', value: data.RT, color: '#fc8d62'}
    ];

    // Set up dimensions for the pie chart
    const radius = Math.min(width, height) / 2;

    // Set up color scale
    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.label))
        .range(['#66c2a5', '#fc8d62']);

    // Set up the pie chart layout
    const pie = d3.pie()
        .value(d => d.value);

    // Create an arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Create the SVG container for the pie chart
    const svg = d3.select("#age_bar")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Build the pie chart
    svg.selectAll('path')
        .data(pie(pieData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.label))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('opacity', 0.7);

    const tooltip = d3.select("#age_bar")
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
            .html("Percentagem:" + d)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px")
    }
    const mouseleave = function (d) {
        tooltip.style("opacity", 0)
    }

    svg.selectAll("path")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // Add a title based on the age parameter
    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Pie Chart for Age " + data.age);

}

function ageVis() {
    d3.csv("../../IMT_data/parsed_data/age_parsed_data_all_years.csv")
        .then(function (data) {

            // Convert strings to numbers
            data.forEach(function (d) {
                d.year = +d.year;
                d.age = +d.age;
                d.AT = +d.AT;
                d.RT = +d.RT;
            });


            ageData = data;

            var filteredData = data.filter(function(d) {
                return d.year === parseInt(currentYear);
            });

            console.log(filteredData)

            drawAgeChart(filteredData[0]);
            drawAgeLegend();

        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });
}