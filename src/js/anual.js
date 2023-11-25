let maxApprovalScale = 250000;
let minApprovalScale = 0;
let approvalData;

const approvalTitle = () => {
    return passMode ? "Aprovados" : "Reprovados";
}
const approvalColor = () => {
    return passMode ? colorAprovados : colorReprovados;
}


function drawApprovalLegend() {
    document.getElementById("approval_legend").innerHTML = ""


    const labels = [
        {label: "Marcados", color: colorMarcados},
        {label: "Realizados", color: colorRealizados},
        {label: approvalTitle(), color: approvalColor()}
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

function drawApprovalChart() {
    document.getElementById("approval_bar").innerHTML = ""

    // append the svg object to the body of the page
    var svg = d3.select("#approval_bar")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
        .domain(d3.extent(approvalData, function(d) { return d.year; }))
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(d3.timeYear).tickFormat(d3.timeFormat('%Y')));

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
        .x(function (d) {
            return x(d.year);
        })
        .y(function (d) {
            return y(d.value);
        });

    // Draw PMT line
    svg.append("path")
        .data([approvalData.map(function (d) {
            return {year: d.year, value: d.PMT};
        })])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke-width", 2.5)
        .style("stroke", colorMarcados)
        .style("fill", "none");

    // Draw PRT line
    svg.append("path")
        .data([approvalData.map(function (d) {
            return {year: d.year, value: d.PRT};
        })])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke-width", 2.5)
        .style("stroke", colorRealizados)
        .style("fill", "none");

    // Draw AT line
    svg.append("path")
        .data([approvalData.map(function (d) {
            var performance = passMode ? d.AT : d.RT;
            return {year: d.year, value: performance};
        })])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke-width", 2.5)
        .style("stroke", () => {
            return passMode ? colorAprovados : colorReprovados;
        })
        .style("fill", "none");


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
        const [mouseX] = d3.pointer(event);
        const xValue = x.invert(mouseX);

        // Find the nearest data point based on the x-axis value
        const bisectDate = d3.bisector(function(entry) { return entry.year; }).left;
        const index = bisectDate(d, xValue, 1);
        const leftData = d[index - 1];
        const rightData = d[index];

        // Determine which data point is closer to the x-axis value
        const hoveredData = (rightData && (rightData.year - xValue < xValue - leftData.year)) ? rightData : leftData;

        if (hoveredData) {
            const xYear = hoveredData.year.getFullYear();
            const yValue = hoveredData.value;

            tooltip
                .html("Year: " + xYear + "<br/># de Provas: " + yValue)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        }
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
        .text(() => {
            return passMode ? "Aprovação Anual - " + currentYear : "Reprovação Anual - " + currentYear ;
        });
}


function approvalVis() {
    // set the dimensions and margins of the graph

    // Parse the Data
    d3.csv("../../IMT_data/parsed_data/approval_parsed_data_all_years.csv").then(function (data) {

        // Convert strings to numbers
        data.forEach(function (d) {
            d.year = new Date(d.year);
            d.hoverYear = +d.year; //this is only here because the tooltip wasnt working otherwise
            d.PMT = +d.PMT;
            d.PRT = +d.PRT;
            d.AT = +d.AT;
            d.APT = +d.APT;
            d.RT = +d.RT;
            d.RPT = +d.RPT;
        });

        approvalData = data;

        drawApprovalChart()


    }).catch(function (error) {
        console.error("Error loading the CSV file:", error);
    });
}
