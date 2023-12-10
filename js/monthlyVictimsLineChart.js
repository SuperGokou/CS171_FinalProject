class MonthlyVictimsLineChart {
    constructor(parentElement, victimData, selectedYear, filters) {
        this.parentElement = parentElement;
        this.data = victimData;
        this.selectedYear = +selectedYear;
        this.filters = filters;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create svg element
        vis.margin = {top: 20, right: 40, bottom: 90, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom - document.getElementById("monthlyVictimsTitle").offsetHeight;

        console.log(document.getElementById("monthlyVictimsTitle").getBoundingClientRect().height)

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom + document.getElementById("monthlyVictimsTitle").offsetHeight)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Create a div for the tooltip and hide it initially
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Define month names
        vis.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
        vis.fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
            "October", "November",  "December"]

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
            .attr("transform", `translate(${vis.width / 2}, ${vis.height + 40 })`) // Adjust positioning
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

        vis.wrangleData()
        vis.drawLegend()
    }

    drawLegend() {
        let vis = this;

        let legend = vis.svg.append("g")
            .attr("class", "legend-linechart")
            .attr("transform", `translate(${vis.width - 100}, 0)`);


        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "#fd3434");

        legend.append("text")
            .attr("x", 30)
            .attr("y", 15)
            .attr("fill", "#ffffff")
            .text(`${vis.selectedYear}`);

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 30)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "rgb(128,40,40)");

        legend.append("text")
            .attr("x", 30)
            .attr("y", 45)
            .attr("fill", "#ffffff")
            .text("2015-2022");

        legend.append("text")
            .attr("x", 30)
            .attr("y", 65)
            .attr("fill", "#ffffff")
            .text("Average");
    }

    wrangleData() {
        let vis = this;

        // Initialize monthly data
        let monthlyData = {};
        [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].forEach(year => {
            monthlyData[year] = Array(12).fill(0); // Initialize each month to 0
        });

        vis.filteredData = vis.data.filter (d => {
            return vis.checkFilters(d);
        });

        vis.filteredData.forEach(victim => {
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

        vis.displayData = {
            'selected': monthlyData[vis.selectedYear],
            'avg': monthlyData['avg']
        };

        vis.updateVis();
    }

    checkFilters(d) {
        let vis = this;

        for (const category in vis.filters) {
            for (const filter in vis.filters[category]) {
                switch (filter) {

                    // Only filter out hispanic black people if both filters are off
                    case "Black":
                    case "Hispanic":
                        if (!vis.filters['race']['Black'] &&
                            !vis.filters['race']['Hispanic'] &&
                            d[category] == "Black,Hispanic") {
                            return false;
                        } else if (!vis.filters[category][filter] && d[category] == filter) {
                            return false;
                        }
                        break;

                    default:
                        if ((!vis.filters[category][filter] && d[category] == filter)) {
                            return false;
                        }
                }

            }
        }
        return true;
    }

    updateVis() {
        let vis = this;

        // Draw line chart
        Object.keys(vis.displayData).forEach(year => {
            let path = vis.svg.selectAll(".line-" + year)
                .data([vis.displayData[year]]);

            path.enter().append("path")
                .attr("class", "line-" + year)
                .merge(path)
                .transition(1000)
                .attr("d", vis.line)
                .attr("fill", "none")
                .attr("stroke", () => year == 'avg' ? 'rgb(128,40,40)' : '#fd3434' )


            let isYearSelected = year == vis.selectedYear || year == 'avg';
            let vertices = vis.svg.selectAll(".vertex-" + year)
                .data(vis.displayData[year]);

            vertices.enter().append("circle")
                .attr("class", "vertex-" + year)
                .attr("fill", () => year == 'avg' ? 'rgb(128,40,40)' : '#fd3434')
                .attr("r", 5)
                .attr("stroke", () => year == 'avg' ? 'rgb(128,40,40)' : '#fd3434')
                .attr("stroke-width", 1.5)
                .attr("opacity", 0)
                .attr("cx", (d, i) => vis.xScale(vis.monthNames[i]) + vis.xScale.bandwidth() / 2)
                .attr("cy", (d) => vis.yScale(d))
                .merge(vertices)
                .transition()
                .duration(1000)
                .attr("cx", (d, i) => vis.xScale(vis.monthNames[i]) + vis.xScale.bandwidth() / 2)
                .attr("cy", (d) => vis.yScale(d))
                .attr("opacity", 1)
                .each(function(d, i) {
                    d3.select(this).on("mouseover", (event) => {
                        console.log('moused over!!!!')

                        let monthName = vis.fullMonthNames[i];

                        d3.select(this)
                            .attr("r", 7)
                            .attr("stroke-width", 2.5)

                        vis.tooltip
                            .style("opacity", .9);
                        vis.tooltip.html(d + " lives lost in " + monthName + (year == 'avg' ? " on average" : " " + vis.selectedYear))
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");

                    }).on("mouseout", (event) => {
                        d3.select(this)
                            .attr("r", 5)
                            .attr("stroke-width", 1.5)

                        vis.tooltip
                            .style("opacity", 0);

                    });
                });

            vertices.exit()
                .transition()
                .duration(200)
                .remove();
        });
    }
}