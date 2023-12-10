class BloodDripBarChart {
    constructor(parentElement, victimData, perCapita, selectedYear, filters) {
        this.parentElement = parentElement;
        this.victimData = victimData;
        this.perCapita = perCapita;
        this.selectedYear = +selectedYear;
        this.filters = filters;
        this.states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
            'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE',
            'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
            'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
        ]

        this.state_populations = {
            "AL": 5074296, "AK": 733583, "AZ": 7359197, "AR": 3045637, "CA":39029342, "CO": 5839926, "CT": 3626205, "DE": 1018396, "DC": 671803,
            "FL": 22244823, "GA": 10912876, "HI": 1440196 , "ID": 1939033, "IL": 12582032, "IN": 6833037, "IA": 3200517, "KS": 2937150,
            "KY": 4512310, "LA": 4590241, "ME": 1385340, "MD": 6164660, "MA": 6981974, "MI": 10034113, "MN": 5717184, "MS": 2940057,
            "MO": 6177957, "MT": 1122867, "NE": 1967923, "NV": 3177772, "NH": 1395231, "NJ": 9261699, "NM": 2113344, "NY": 19677151, "NC": 10698973,
            "ND": 779261, "OH": 11756058, "OK": 4019800, "OR": 4240137, "PA": 12972008, "RI": 1093734, "SC": 5282634, "SD": 909824, "TN": 7051339,
            "TX": 30029572, "UT": 3380800, "VT": 647064, "VA": 8683619, "WA": 7785786, "WV": 1775156, "WI": 5892539, "WY": 581381
        }

        this.shootings_by_state = {}
        this.states.forEach(state => {
            this.shootings_by_state[state] = 0;
        })

        this.currentDate = new Date(this.selectedYear, 0, 1);
        this.endDate = new Date(this.selectedYear, 11, 31);

        this.initVis();
    }

    initVis() {
        let vis= this;

        // Create svg element
        vis.margin = {top: 30, right: 20, bottom: 90, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

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
            .domain((vis.perCapita ? [100, 0] : [1200, 0]))
            .range([vis.height, vis.margin.top]);

        // Create axes
        vis.xAxis = d3.axisTop(vis.xScale)

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.margin.top})`)
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "start")
            .attr("transform", "rotate(-45)")
            .attr("dx", "1em") // Adjusts the position along the x-axis
            .attr("dy", "0.5em") // Adjusts the position along the y-axis
            .style("fill", "#ffffff")

        vis.yAxis = d3.axisLeft(vis.yScale)

        vis.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${vis.margin.left}, 0)`)
            .call(vis.yAxis)
            .selectAll("text")
            .style("fill", "#ffffff");

        // Axis titles
        // vis.svg.append("text")
        //     .attr("class", "x-axis-title")
        //     .attr("transform", `translate(${vis.width / 2}, ${vis.margin.top - 60})`) // Adjust positioning
        //     .style("text-anchor", "middle")
        //     .style("font-size", "18px")
        //     .text("Drip Bar Chart for State");

        vis.svg.append("text")
            .attr("class", "y-axis-title")
            .attr("transform", `translate(${vis.margin.left - 30}, ${vis.height / 2}) rotate(-90)`) // Adjust positioning
            .style("text-anchor", "middle")
            .text(`Victims ${vis.perCapita ? "(per million)" : "(total)"}`);


        // Initialize drawing interval
        d3.interval(
            () => {
                if (vis.currentDate < vis.endDate) {
                    vis.wrangleData()
                    vis.currentDate.setDate(vis.currentDate.getDate() + 1)
                } else {
                    this.stop;
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
        if (vis.perCapita) {
            vis.states.forEach(state => {
                vis.display_data[state] = vis.shootings_by_state[state] / vis.state_populations[state] * 10**6;
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

    drawBloodSpilt(state) {
        let vis = this;

        let posX = vis.xScale(state) + vis.xScale.bandwidth() / 2;
        let posY = vis.yScale(vis.display_data[state])

        // console.log(vis.display_data[state])


        let barWidth = d3.randomUniform(1, 6)();
        d3.range(barWidth).forEach(i => {
            let inter = i /barWidth;
            let c = d3.interpolateRgb("rgba(255, 0, 0, 0.8)", "rgb(100, 0, 0)")(inter); // Gradient from bright red to dark red

            vis.svg.append("line")
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

    redrawdripbarchart(selectedYear, filters){
        let vis = this;
        vis.selectedYear = selectedYear;
        vis.filters = filters;

        vis.svg.selectAll("*").remove();

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