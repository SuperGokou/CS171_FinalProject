class MapVis {
    constructor(parentElement, geoData, usaShootingData, populationData, metric, selectedYear, filters) {
        this.parentElement = parentElement;
        this.usaShootingData = usaShootingData;
        this.populationData = populationData;
        this.selectedYear = selectedYear;
        this.geoData = geoData;
        this.filters = filters;
        this.metric = metric;

        this.stateAbbreviations = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
            'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE',
            'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
            'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
        ]

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 60, right: 20, bottom: 100, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom - document.getElementById("dripVisVictimsTitle").offsetHeight;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom + document.getElementById("dripVisVictimsTitle").offsetHeight)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .style('opacity', 0);

        vis.path = d3.geoPath();

        vis.viewpoint = {'width': 975, 'height': 610};
        vis.zoom = 0.55//vis.width / vis.viewpoint.width;

        vis.map = vis.svg.append("g")
            .attr("class", "states")
            .attr('transform', `scale(${vis.zoom} ${vis.zoom})`);

        vis.colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateReds);

        vis.states = vis.map.selectAll(".state")
            .data(topojson.feature(vis.geoData, vis.geoData.objects.states).features)
            .enter().append("path")
            .attr("class", "state")
            .attr("fill", "transparent")
            .attr("d", vis.path);

        vis.legend = vis.svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", `translate(${vis.width * 0.6},${vis.height})`);

        vis.legendScale = d3.scaleLinear()
            .range([0, vis.width/3]) ;

        // Define the color for the legend's gradient
        vis.legendColor = d3.scaleSequential()
            .interpolator(d3.interpolateReds)
            .domain(vis.legendScale.domain());

        // Add the gradient to the legend
        vis.legend.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .selectAll("stop")
            .data(vis.legendColor.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: vis.legendColor(t) })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        vis.legend
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', vis.width/6)
            .attr('y', +50)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text(`Victims (${vis.metric == 'count' ? 'Count' : 'Per Million'})`);

        console.log(vis.metric)

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        this.filteredData = vis.usaShootingData.filter(d => {
            if (vis.selectedYear === 0) {
                return vis.usaShootingData && vis.checkFilters(d);
            }else{
                return parseInt(d.date.split('-')[0]) === parseInt(vis.selectedYear) && vis.checkFilters(d);
            }
        });

        // prepare covid data by grouping all rows by state
        this.ShootingData = Array.from(d3.group(vis.filteredData, d => d.state), ([key, value]) => ({key, value}))

        // init final data structure in which both data sets will be merged into
        vis.stateInfo = []

        // merge
        vis.ShootingData.forEach(state => {
            // init counters
            let TotalSum = 0;
            let blackSum = 0;
            let whiteSum = 0;
            let asianSum = 0;
            let hispanicSum = 0;
            let nativeAmericanSum = 0;
            let otherRaceSum = 0;

            // calculate new cases by summing up all the entries for each state
            state.value.forEach(value => {
                TotalSum += 1;
                if (value.race === "Black"){
                    blackSum += 1;
                } else if (value.race === "White"){
                    whiteSum += 1;
                } else if (value.race === "Asian"){
                    asianSum += 1;
                } else if (value.race === "Hispanic") {
                    hispanicSum += 1;
                } else if (value.race === "Native American") {
                    nativeAmericanSum += 1;
                } else {
                    otherRaceSum += 1;
                }
            });

            // Needed for metric display
            vis.relevantPopulationsByState = vis.getRelevantPopulations();

            // populate the final data structure
            vis.stateInfo.push(
                {
                    state: nameConverter.getFullName(state.key),
                    year: vis.selectedYear,
                    TotalSum: TotalSum,
                    blackSum: blackSum,
                    whiteSum: whiteSum,
                    asianSum: asianSum,
                    hispanicSum: hispanicSum,
                    nativeAmericanSum: nativeAmericanSum,
                    otherRaceSum: otherRaceSum,
                    RateSum: TotalSum / vis.relevantPopulationsByState[state.key] * 10**6,
                    TotalRate: TotalSum / this.populationData[state.key].Total * 10**6,
                    blackRate: blackSum / this.populationData[state.key].Black * 10**6,
                    whiteRate: whiteSum / this.populationData[state.key].White * 10**6,
                    asianRate: asianSum / this.populationData[state.key].Asian * 10**6,
                    hispanicRate: hispanicSum / this.populationData[state.key].Hispanic * 10**6,
                    nativeAmericanRate: nativeAmericanSum / this.populationData[state.key]["Native American"] * 10**6,
                    otherRaceRate: otherRaceSum / this.populationData[state.key].Other * 10**6
                }
            )
        })

        if (vis.metric == 'count') {
            vis.colorScale.domain([0, d3.max(vis.stateInfo, d => d.year === vis.selectedYear ? d.TotalSum : 0)]);
            vis.legendScale.domain([0, d3.max(vis.stateInfo, d => d.year === vis.selectedYear ? d.TotalSum : 0)]);
        } else {
            vis.colorScale.domain([0, d3.max(vis.stateInfo, d => d.year === vis.selectedYear ? d.RateSum : 0)]);
            vis.legendScale.domain([0, d3.max(vis.stateInfo, d => d.year === vis.selectedYear ? d.RateSum : 0)]);
        }

        vis.updateVis();
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
            vis.stateAbbreviations.forEach(state => {
                relevantPopulations[state] = 0;
                displayedRaces.forEach(race => {
                    if (!vis.populationData[state][race]) {
                        console.log(state, race)
                    }
                    relevantPopulations[state] += vis.populationData[state][race]
                });
            })
        } else {
            vis.stateAbbreviations.forEach(state => {
                relevantPopulations[state] = vis.populationData[state]['Total'];
            })
        }

        return relevantPopulations;
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

        let stateColorMap = new Map(vis.stateInfo.map(d => [d.state, d]));

        // Draw the legend rectangle
        vis.legend.append("rect")
            .attr("width", vis.width/3)
            .attr("height", vis.height/25)
            .style("fill", "url(#legend-gradient)");

        // Create the legend axis
        vis.legendAxis = d3.axisBottom(vis.legendScale)
            .tickSize(6)
            .ticks(3);

        vis.svg.selectAll(".legend-Axis").remove();

        // Draw the legend axis
        vis.legend.append("g")
            .attr("class", "legend-Axis")
            .attr("transform", `translate(0, ${vis.height/25})`)
            .call(vis.legendAxis)
            .selectAll("text")
            .style("fill", "white");

        vis.legend.selectAll(".tick line")
            .style('stroke-width', '1.5px')
            .style("stroke", "white");

        vis.states
            .attr("fill", d => {
                let stateInfo = stateColorMap.get(d.properties.name);
                // console.log("=======>", d);
                return stateInfo ? vis.colorScale(vis.metric == 'count' ? stateInfo.TotalSum : stateInfo.RateSum) : "#FFF";
            })
            .attr('stroke-width', '1.5px')
            .attr('stroke', 'black');

        vis.states
            .on('mouseover', function(event, d){
                // console.log(d)
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', '#c95151')

                let stateInfo = stateColorMap.get(d.properties.name);

                if (stateInfo) {
                    let tooltipWidth = vis.tooltip.node().getBoundingClientRect().width;
                    let tooltipHeight = vis.tooltip.node().getBoundingClientRect().height;
                    let pageX = event.pageX;
                    let pageY = event.pageY;
                    let margin = 10; // Margin from the cursor

                    // Calculate x position
                    let x = pageX + margin + tooltipWidth > window.innerWidth
                        ? pageX - margin - tooltipWidth
                        : pageX + margin;

                    // Calculate y position
                    let y = pageY + margin + tooltipHeight > window.innerHeight
                        ? pageY - margin - tooltipHeight
                        : pageY + margin;

                    console.log(stateInfo)
                    vis.tooltip
                        .html(`
                         <div class="tooltip-content">
                            <h3>${stateInfo.state} Victims</h3>
                            <table class="tooltip-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Count</th>
                                        <th>Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>Total</th>
                                        <td>${stateInfo.TotalSum}</td>
                                        <td>${vis.formatRate(stateInfo.TotalRate)}</td>
                                    </tr>
                                    <tr>
                                        <th>Black</th>
                                        <td>${stateInfo.blackSum}</td>
                                        <td>${vis.formatRate(stateInfo.blackSum/stateInfo.TotalSum)}</td>
                                    </tr>
                                    <tr>
                                        <th>Hispanic</th>
                                        <td>${stateInfo.hispanicSum}</td>
                                        <td>${vis.formatRate(stateInfo.hispanicSum/stateInfo.TotalSum)}</td>
                                    </tr>
                                    <tr>
                                        <th>White</th>
                                        <td>${stateInfo.whiteSum}</td>
                                        <td>${vis.formatRate(stateInfo.whiteSum/stateInfo.TotalSum)}</td>
                                    </tr>
                                    <tr>
                                        <th>Asian</th>
                                        <td>${stateInfo.asianSum}</td>
                                        <td>${vis.formatRate(stateInfo.asianSum/stateInfo.TotalSum)}</td>
                                    </tr>
                                    <tr>
                                        <th>Indigenous</th>
                                        <td>${stateInfo.nativeAmericanSum}</td>
                                        <td>${vis.formatRate(stateInfo.nativeAmericanSum/stateInfo.TotalSum)}</td>
                                    </tr>
                                    <tr>
                                        <th>Other</th>
                                        <td>${stateInfo.otherRaceSum}</td>
                                        <td>${vis.formatRate(stateInfo.otherRaceSum/stateInfo.TotalSum)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>`)
                        .style("left", x + "px")
                        .style("top", y + "px")
                        .style("opacity", 1);
                }
            })
            // Mouseout event listener to remove tooltip and revert fill
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', 0.5)
                    .attr("fill", d => {
                        let stateInfo = stateColorMap.get(d.properties.name);
                        return stateInfo ? vis.colorScale(vis.metric == 'count' ? stateInfo.TotalSum : stateInfo.RateSum) : "#FFF";
                    });
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });
    }

    formatRate(rate) {
        return rate ? rate.toFixed(2) + " per Million" : "N/A";
    }
    redrawMapVis(selectedYear, filters, metric) {
        let vis = this;
        vis.selectedYear = selectedYear;
        vis.filters = filters;
        let oldMetric = vis.metric;
        vis.metric = metric;

        if (oldMetric != vis.metric) {
            vis.legend.select('.legend-text')
                .transition()
                .duration(500)
                .style("opacity", 0)
                .on('end', function() {
                    d3.select(this)
                        .text(`Victims (${vis.metric == 'count' ? 'Count' : 'Per Million'})`)
                        .transition()
                        .duration(500)
                        .style("opacity", 1)
                })
        }


        vis.wrangleData();
    }

}