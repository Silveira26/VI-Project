const titulos = ["Marcadas", "Realizadas", "%"]

function genderVis(col1, col2, titulo) {
    var parent = document.getElementById("gender_bar")

    if(parent.childElementCount > 0){
        parent.replaceChildren();
    }
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#gender_bar")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv("../../IMT_data/parsed_data/gender_parsed_data_all_years.csv")
        .then(function(data) {

            var subgroups = data.columns.slice(col1,col2+1);
            console.log(subgroups)

            // Convert strings to numbers
            data.forEach(function(d) {
                d.year = +d.year;
                d.PMF = +d.PMF;
                d.PRF = +d.PRF;
                d.AF = +d.AF;
                d.PMM = +d.PMM;
                d.PRM = +d.PRM;
                d.AM = +d.AM;
                d.PMT = +d.PMT;
                d.PRT = +d.PRT;
                d.AT = +d.AT;
                d.RF = +d.RF;
                d.RM = +d.RM;
                d.RT = +d.RT;
            });

            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#cc6df1', '#377eb8']);

            // X axis
            var x = d3.scaleBand()
                .domain(data.map(function(d) { return d.year; }))
                .range([0, width])
                .padding(0.2);

            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");


            var domainMax = d3.max(data, (d) => {
                var fields = Object.values(d)
                return Math.max(fields[col1], fields[col2]);
            });

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, domainMax])
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y));

            // Bars
            svg.selectAll(".barGroup")
                .data(data)
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

            svg.append("text")
                .attr("x", (width / 2))
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .text("Provas Práticas "+titulos[titulo]+" por Género");

        })
        .catch(function(error) {
            console.error("Error loading the CSV file:", error);
        });
}
