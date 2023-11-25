class MonthlyVictimsLineChart {
    constructor(parentElement, victimData, selectedYear) {
        this.parentElement = parentElement;
        this.victimData = victimData;
        this.selectedYear = +selectedYear;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create svg element
        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Define month names
        vis.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Nov", "Dec"]

        // Scales and axes
        vis.xScale = d3.scaleBand()
            .domain(vis.monthNames)
            .range([vis.margin.left, vis.width])
            .padding(0.1);

        vis.yScale = d3.scaleLinear()
            .domain([0, 120])
            .range([vis.height, vis.margin.top]);

        // X Axis
        vis.xAxis = d3.axisBottom(vis.xScale)

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`)
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("fill", "#ffffff")


        // X axis Title
        vis.svg.append("text")
            .attr("class", "x-axis-title")
            .attr("transform", `translate(${vis.width / 2}, ${vis.height + 35})`) // Adjust positioning
            .style("text-anchor", "middle")
            .text("Month");

        // Y Axis
        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(10);

        vis.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${vis.margin.left}, 0)`)
            .call(vis.yAxis)
            .selectAll("text")
            .style("fill", "#ffffff");

        // Y axis title
        vis.svg.append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)") // Adjust positioning
            .attr("y", 0)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Victims");

        vis.line = d3.line()
            .x(function(d, i) { return vis.xScale(vis.monthNames[i]) + vis.xScale.bandwidth() / 2; })
            .y(function(d) { return vis.yScale(d); });

        this.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // Initialize monthly data
        let monthlyData = {};
        [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].forEach(year => {
            monthlyData[year] = Array(12).fill(0); // Initialize each month to 0
        });

        vis.victimData.forEach(victim => {
            let date = new Date(victim.date);
            let year = date.getFullYear();
            let month = date.getMonth();

            if (monthlyData[year]) {
                monthlyData[year][month] += 1;
            }
        });

        let monthlyTotals = Array(12).fill(0);
        Object.keys(monthlyData).forEach(year => {
            monthlyData[year].forEach((count, month) => {
                monthlyTotals[month] += count;
            });
        });

        let numberOfYears = Object.keys(monthlyData).length;
        let monthlyAverages = monthlyTotals.map(total => total / numberOfYears);

        monthlyData['avg'] = monthlyAverages;

        vis.displayData = monthlyData;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Draw line chart
        Object.keys(vis.displayData).forEach(year => {
            vis.svg.append("path")
                .datum(vis.displayData[year])
                .attr("fill", "none")
                .attr("stroke", () => vis.selectedYear == year ? '#fd3434' :
                    year == 'avg' ? 'rgb(128,40,40)' : '#5e5c5c') // Use different colors for different years if needed
                .attr("stroke-width", 1.5)
                .attr("d", vis.line);
        });
    }
}