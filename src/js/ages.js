let ageData;
let pieData;

function drawAgePieChartLegend(){
    const svg = d3.select("#age_legend")
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

function drawAgePieChart(data) {
    document.getElementById("age_bar").innerHTML = ""
    // Data for the pie chart
    pieData = [
        {label: 'Taxa de\n Aprovação', value: data.AT, color: colorAprovados},
        {label: 'Taxa de\n Reprovação', value: data.RT, color: colorReprovados}
    ];

    // Set up dimensions for the pie chart
    const radius = Math.min(width, height) / 2;

    // Set up color scale
    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.label))
        .range([colorAprovados, colorReprovados]);

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


function drawAgeHistogramLegend(){
    const svg = d3.select("#group_legend")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", margin.top)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + ", 10)");

    // Add a legend
    const legend = svg.append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", 180)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", pieData[0].color);

    legend.append("text")
        .attr("x", 180 + 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle")
        .text(pieData[0].label);
}
function drawAgeHistogram(filteredData){
    document.getElementById("group_bar").innerHTML = ""
    const aggregatedData = calculateGroups(filteredData)

    // Create an SVG container
    const svg = d3.select('#group_bar').append('svg')
        .attr('width', width+100)
        .attr('height', height+100)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);


/*    // Create and append the bars for RT
    svg.selectAll('.barRT')
        .data(aggregatedData)
        .enter().append('rect')
        .attr('class', 'barRT')
        .attr('x', d => xScale(d.group) + xScale.bandwidth() / 2)
        .attr('width', xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.averageRT))
        .attr('height', d => height - yScale(d.averageRT))
        .attr('fill', 'red');*/

    const xScale = d3.scaleBand()
        .domain(aggregatedData.map(d => d.group))
        .range([0, width])
        .padding(0.1);

    // Set up the y scale
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(aggregatedData, d => d.averageAT)])
        .range([height, 0]);

    // Create and append the bars for AT
    svg.selectAll('.barAT')
        .data(aggregatedData)
        .enter().append('rect')
        .attr('class', 'barAT')
        .attr('x', d => xScale(d.group) + xScale.bandwidth() / 4) // Center the bar within each group
        .attr('width', xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.averageAT))
        .attr('height', d => height - yScale(d.averageAT))
        .attr('fill', colorAprovados);

    // Add x-axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append('g')
        .call(d3.axisLeft(yScale)
            .tickFormat(d3.format(".0%")));
}
function calculateGroups(data) {
        // Define age groups
    const ageGroups = [
        { group: '16-24', ages: [16, 17, 18, 19, 20, 21, 22, 23, 24] },
        { group: '25-34', ages: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34] },
        { group: '35-44', ages: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44] },
        { group: '45-54', ages: [45, 46, 47, 48, 49, 50, 51, 52, 53, 54] },
        { group: '55-64', ages: [55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
        { group: '65-74', ages: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74] },
        { group: '75+', ages: [75, 76, 77, 78, 79] },
    ];

    // Function to calculate the average for an array of numbers
    const calculateAverage = arr => arr.reduce((acc, val) => acc + val, 0) / arr.length;

    // Map ages to groups and aggregate values
    const aggregatedData = ageGroups.map(group => {
        const groupAges = group.ages.map(age => parseInt(age));
        const groupData =  data.filter(row => groupAges.includes(parseInt(row.age)));

        const groupATValues = groupData.map(row => parseFloat(row.AT));
        const groupRTValues = groupData.map(row => parseFloat(row.RT));

        const averageAT = calculateAverage(groupATValues);
        const averageRT = calculateAverage(groupRTValues);

        return {
            group: group.group,
            averageAT,
            averageRT,
        };
    });

    console.log(aggregatedData);
    return aggregatedData;
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

            drawAgePieChart(filteredData[0]);
            drawAgePieChartLegend();
            drawAgeHistogram(filteredData)
            drawAgeHistogramLegend()

            document.getElementById("age_title").innerText = "Taxa de Aprovação por Idade - "+currentYear
            document.getElementById("group_title").innerText = "Taxa de Aprovação por Grupos - "+currentYear

        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });
}