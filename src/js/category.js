let data;
let xScale, yScale;
let lineGenerator;
let color;
let svg;

document.addEventListener('DOMContentLoaded', function() {
    // Load data
    d3.csv("../../IMT_data/parsed_data/category_parsed_all_years.csv").then(function(loadedData) {
        // Convert strings to numbers
        data = loadedData.map(function(d) {
            return {
                year: +d.year,
                category: d.category,
                TA: +d.TA,
                PA: +d.PA
            };
        });

        // Initial settings
        var selectedYear = parseInt(document.getElementById('year-toggle').value, 10);
        var filteredData = data.filter(d => d.year === selectedYear);

        // Create the connected scatter plot
        createConnectedScatterPlot(filteredData);
    });

    // Event listener for year selection
    document.getElementById('year-toggle').addEventListener('change', function(event) {
        var selectedYear = parseInt(event.target.value, 10);
        var filteredData = data.filter(d => d.year === selectedYear);
        updateConnectedScatterPlot(filteredData);
    });
});

function createConnectedScatterPlot(filteredData) {
    var margin = {top: 10, right: 30, bottom: 30, left: 60};
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    svg = d3.select("#category_scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    xScale = d3.scaleBand().range([0, width]).padding(0.2);
    yScale = d3.scaleLinear().range([height, 0]);

    // Color scale
    color = d3.scaleOrdinal().domain(["TA", "PA"]).range(["steelblue", "tomato"]);

    createLegend(width, margin);

    // Line generator
    lineGenerator = d3.line().x(d => xScale(d.category)).y(d => yScale(d.value));

    // Initial drawing
    updateConnectedScatterPlot(filteredData);
}

function updateConnectedScatterPlot(filteredData) {
    var margin = {top: 10, right: 30, bottom: 30, left: 60};
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
    
    // Update scales
    xScale.domain(filteredData.map(d => d.category));
    yScale.domain([0, 1]);

    // Update axes
    // For the y-axis, use tickFormat to convert the scale to percentage
    svg.selectAll(".x-axis")
        .data([0])
        .join("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(xScale));

    svg.selectAll(".y-axis")
        .data([0])
        .join("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%"))); // Format ticks as percentages

    // Create a tooltip
    var tooltip = d3.select("#tooltip");

    // Function to call when mouseover event is detected on the points
    var mouseover = function(event, d) {
        tooltip.style("display", "inline");
        d3.select(this).style('stroke-width', '8'); // Highlight the point on mouseover
    };

    // Function to call when mousemove event is detected
    var mousemove = function(event, d) {
        tooltip
            .html(`Year: ${d.year}<br>Category: ${d.category}<br>Series: ${d.series}<br>Value: ${d3.format(".0%")(d.value)}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    };

    // Function to call when mouseout event is detected
    var mouseout = function(event, d) {
        tooltip.style("display", "none");
        d3.select(this).style('stroke-width', '3'); // Reset the point size
    };

    // Prepare line data
    var lineData = ["TA", "PA"].map(function(series) {
        return {
            name: series,
            values: filteredData.map(d => ({
                year: d.year,
                category: d.category,
                series: series,
                value: d[series]
            })).filter(d => !isNaN(d.value))
        };
    });

    // Line generator
    lineGenerator = d3.line()
        .x(d => xScale(d.category) + xScale.bandwidth() / 2) // Align the line to the center of the band
        .y(d => yScale(d.value))


    // Bind line data
    var lines = svg.selectAll(".line")
        .data(lineData, d => d.name);

    // Enter + update
    lines.enter()
        .append("path")
        .attr("class", "line")
        .merge(lines)
        .attr("fill", "none")
        .attr("stroke", d => color(d.name))
        .attr("stroke-width", 1.5)
        .attr("d", d => lineGenerator(d.values));

    lineData.forEach(series => {
        svg.selectAll(`.dot-${series.name}`)
            .data(series.values)
            .join('circle')
            .attr('class', `dot-${series.name}`)
            .attr('cx', d => xScale(d.category) + xScale.bandwidth() / 2) // Center the circle in the band
            .attr('cy', d => yScale(d.value))
            .attr('r', 5) // Radius of the circle, adjust as needed
            .style('fill', color(series.name))
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);
    });

    // Exit
    lines.exit().remove();
}


function createLegend(width, margin) {
    const legendData = [
        { color: "steelblue", label: "Aprovação Teórica" },
        { color: "tomato", label: "Aprovação Prática" }
    ];

    // Create an SVG element for the legend
    const svgLegend = d3.select("#category_legend")
        .append("svg")
        .attr("width", width)
        .attr("height", 50) // Set the height of the legend SVG
        .append("g")
        .attr("transform", `translate(${margin.left}, 10)`); // Position the legend group

    // Add rectangles for each legend item
    svgLegend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 180) // Horizontal position of the legend item
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => d.color);

    // Add text labels for each legend item, with increased offset
    svgLegend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 180 + 30) // Increase the offset to 30 for more space
        .attr("y", 9) // Center text vertically within the rectangle
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .text(d => d.label);
}
