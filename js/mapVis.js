class MapVis {
    constructor(parentElement, geoData, usaShootingData) {
        this.parentElement = parentElement;
        this.usaShootingData = usaShootingData;
        this.geoData = geoData;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.selectedYear = 2022;

        vis.margin = {top: 10, right: 60, bottom: 10, left: 60};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .style('opacity', 0);

        vis.path = d3.geoPath();

        vis.viewpoint = {'width': 975, 'height': 610};
        vis.zoom = vis.width / vis.viewpoint.width;

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
            .attr("transform", `translate(${vis.width/2},${vis.height *0.9})`);

        vis.legendScale = d3.scaleLinear()
            .range([0, vis.width/3]) ;
        //.domain([0, 827000]);

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

        vis.wrangleData();
    }

    wrangleData(selectedYear) {
        let vis = this;

        vis.selectedYear = selectedYear ? selectedYear : vis.selectedYear;


        let filteredData = vis.usaShootingData.filter(d => {
            return parseInt(d.date.split('-')[0]) === parseInt(vis.selectedYear);
        });


        // prepare covid data by grouping all rows by state
        let ShootingData = Array.from(d3.group(filteredData, d => d.state), ([key, value]) => ({key, value}))

        // init final data structure in which both data sets will be merged into
        vis.stateInfo = []

        // merge
        ShootingData.forEach(state => {
            // init counters
            let CasesSum = 0;
            let blackSum = 0;
            let whiteSum = 0;
            let asianSum = 0;
            let otherRaceSum = 0;

            // calculate new cases by summing up all the entries for each state
            state.value.forEach(value => {
                CasesSum += 1;
                if(value.race === "Black"){
                    blackSum += 1;
                }else if (value.race === "White"){
                    whiteSum += 1;
                }else if (value.race === "Asian"){
                    asianSum += 1;
                }else {
                    otherRaceSum += 1;
                }
            });

            // populate the final data structure
            vis.stateInfo.push(
                {
                    state: nameConverter.getFullName(state.key),
                    year: vis.selectedYear,
                    CaseSum: CasesSum,
                    blackSum: blackSum,
                    whiteSum: whiteSum,
                    asianSum: asianSum,
                    otherRaceSum: otherRaceSum
                }
            )
        })

        console.log('final data structure for mapVis', vis.stateInfo);

        vis.colorScale.domain([0, d3.max(vis.stateInfo, d => d.year === vis.selectedYear ? d.CaseSum : 0)]);
        vis.legendScale.domain([0, d3.max(vis.stateInfo, d => d.year === vis.selectedYear ? d.CaseSum : 0)]);

        vis.updateVis();
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
                return stateInfo ? vis.colorScale(stateInfo.CaseSum) : "#FFF";
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

                    vis.tooltip
                        .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgray; padding: 10px">
                             <h3>${stateInfo.state}</h3>
                             <p>TotalCase:      ${stateInfo.CaseSum}</p>
                             <p>Black Cases:  ${stateInfo.blackSum}</p>
                             <p>White Cases: ${stateInfo.whiteSum}</p>
                             <p>Asian Cases:  ${stateInfo.asianSum}</p>
                             <p>OtherRace Cases: ${stateInfo.otherRaceSum}</p>
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
                        return stateInfo ? vis.colorScale(stateInfo.CaseSum) : "#FFF";
                    });
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });
    }

}
