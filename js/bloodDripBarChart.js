class BloodDripBarChart {
    constructor(parentElement, victimData, populationData, metric, selectedYear, filters) {
        this.parentElement = parentElement;
        this.victimData = victimData;
        this.metric = metric;
        this.selectedYear = +selectedYear;
        this.filters = filters;
        this.states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
            'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE',
            'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
            'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
        ]

        this.shootings_by_state = {}
        this.states.forEach(state => {
            this.shootings_by_state[state] = 0;
        })

        this.currentDate = new Date(this.selectedYear, 0, 1);
        this.endDate = new Date(this.selectedYear, 11, 31);

        this.populationData = populationData;
        this.maxValue = 100;

        this.initVis();
    }


    initVis() {
        let vis= this;

        // Create svg element
        vis.margin = {top: 30, right: 20, bottom: 90, left: 55};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom -document.getElementById("dripVisVictimsTitle").offsetHeight;

        // Check if SVG already exists. If yes, remove it
        if(d3.select("#" + vis.parentElement).select("svg").empty() === false) {
            d3.select("#" + vis.parentElement).select("svg").remove();
        }

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Create scales
        vis.xScale = d3.scaleBand()
            .domain(vis.states)
            .range([vis.margin.left, vis.width])
            .padding(0.1)

        vis.yScale = d3.scaleLinear()
            .domain((vis.metric === 'rate' ? [100, 0] : [1200, 0]))
            .range([vis.height, vis.margin.top]);

        // Create axes
        vis.xAxis = d3.axisTop(vis.xScale)

        vis.svg.append("g")
            .attr("class", "x-axis states")
            .attr("transform", `translate(0, ${vis.margin.top})`)
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "start")
            .attr("transform", "rotate(-45)")
            .attr("dx", ".5em") // Adjusts the position along the x-axis
            .attr("dy", "0.5em") // Adjusts the position along the y-axis
            .style("fill", "#ffffff")

        vis.yAxis = d3.axisLeft(vis.yScale)

        vis.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${vis.margin.left}, 0)`)
            .call(vis.yAxis)
            .selectAll("text")
            .style("fill", "#ffffff");

        vis.svg.append("text")
            .attr("class", "y-axis-title")
            .attr("transform", `translate(${vis.margin.left - 40}, ${vis.height / 2}) rotate(-90)`) // Adjust positioning
            .style("text-anchor", "middle")
            .text(`Victims ${vis.metric === 'rate' ? "(per million)" : "(total)"}`);


        // Initialize drawing interval
        let interval = d3.interval(
            () => {
                if (vis.currentDate < vis.endDate) {
                    vis.wrangleData()
                    vis.currentDate.setDate(vis.currentDate.getDate() + 1)
                } else {
                    interval.stop();
                }
            },
        )
    }

    wrangleData() {
        let vis = this;

        // Get data for current date's shootings
        const shootingsToday = vis.victimData.filter(d => d.date === vis.formatDate(vis.currentDate) && vis.checkFilters(d));

        let statesToUpdate = []
        shootingsToday.forEach(shooting => {
            vis.shootings_by_state[shooting.state] += 1;
            statesToUpdate.push(shooting.state);
        })

        vis.display_data = {}
        if (vis.metric === 'rate') {
            // Get populations we need to divide by per state
            vis.relevantPopulationsByState = vis.getRelevantPopulations()

            // console.log(vis.relevantPopulationsByState)

            vis.states.forEach(state => {
                vis.display_data[state] = vis.shootings_by_state[state] / vis.relevantPopulationsByState[state] * 10**6;
            })
        } else {
            vis.display_data = vis.shootings_by_state;
        }

        statesToUpdate.forEach(state => {
            vis.drawBloodSpilt(state);
        })
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

    getRelevantPopulations() {
        let vis = this;

        let displayedRaces = [];
        // We can only divide per capita by filtered races if unknown filter is off
        let divisible = true;
        for (const filter in vis.filters['race']) {
            if (vis.filters['race'][filter]) {
                if (filter === "Unknown") {
                    divisible = false;
                } else {
                    displayedRaces.push(filter);
                }
            }
        }

        let relevantPopulations = {}
        if (divisible) {
            vis.states.forEach(state => {
                relevantPopulations[state] = 0;
                displayedRaces.forEach(race => {
                    if (!vis.populationData[state][race]) {
                        console.log(state, race)
                    }
                    relevantPopulations[state] += vis.populationData[state][race]
                });
            })
        } else {
            vis.states.forEach(state => {
                relevantPopulations[state] = vis.populationData[state]['Total'];
            })
        }

        return relevantPopulations;
    }

    drawBloodSpilt(state) {
        let vis = this;

        // If we're graphing per capita, we may need to update yScale
        if (vis.metric === 'rate') {
            let prevMaxValue = vis.maxValue;
            vis.maxValue = d3.max([d3.max(Object.values(vis.display_data)) + 15, vis.maxValue]);

            if (vis.maxValue != prevMaxValue) {
                vis.yScale.domain([this.maxValue, 0]);

                d3.select("#" + vis.parentElement).select(".y-axis")
                    .transition()
                    .duration(500)
                    .call(vis.yAxis)

                d3.select("#" + vis.parentElement).selectAll(".line")
                    .transition()
                    .duration(500)
                    .attr("y2", d => {
                        return vis.yScale(vis.display_data[d])
                    })
            }
        }

        let posX = vis.xScale(state) + vis.xScale.bandwidth() / 2;
        let posY = vis.yScale(vis.display_data[state])


        let barWidth = d3.randomUniform(1, 6)();
        d3.range(barWidth).forEach(i => {
            let inter = i /barWidth;
            let c = d3.interpolateRgb("rgba(255, 0, 0, 0.8)", "rgb(100, 0, 0)")(inter); // Gradient from bright red to dark red

            vis.svg.append("line")
                .datum(state)
                .attr("class", "line")
                .attr("x1", posX - barWidth/2 + i)
                .attr("y1", vis.margin.top)
                .attr("x2", posX - barWidth/2 + i)
                .attr("y2", posY)
                .attr("stroke", c)
                .attr("stroke-width", 1);
        });

    }

    formatDate(date) {
        let vis = this;

        const year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()

        // Pad the month and day with a leading zero if they are less than 10
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;

        return `${year}-${month}-${day}`;
    }

    redrawdripbarchart(selectedYear, filters, metric){
        let vis = this;
        vis.selectedYear = selectedYear;
        vis.filters = filters;
        vis.metric = metric;

        vis.svg.selectAll("*")
            .remove()

        // Reset the currentDate and endDate based on the selected year
        if (vis.selectedYear === 0) {
            vis.currentDate = new Date(2015, 0, 1);
            vis.endDate = new Date(2022, 11, 31);
        }else{
            vis.currentDate = new Date(vis.selectedYear, 0, 1);
            vis.endDate = new Date(vis.selectedYear, 11, 31);
        }
        // Reset the shootings data for the new year
        vis.states.forEach(state => {
            vis.shootings_by_state[state] = 0;
        });

        vis.initVis();
    }

}