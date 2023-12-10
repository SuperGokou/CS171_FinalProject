class CalendarVis {
    constructor(parentElement, data, selectedYear, filters) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.selectedYear = selectedYear;
        this.currentDate = new Date(selectedYear, 0, 1);
        this.endDate = new Date(selectedYear, 11, 31);
        this.filters = filters;

        console.log(this.data)

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create svg element
        vis.margin = {top: 10, right: 20, bottom: 30, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom - document.getElementById("dailyVictimsTitle").offsetHeight;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom + document.getElementById("dailyVictimsTitle").offsetHeight)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Initialize calendar dimensions
        vis.weekWidth = (vis.width) / 6;
        vis.dayWidth = vis.weekWidth / 7;

        // Create color scale
        vis.colorScale = d3.scaleLinear()
            .domain([1, 3])
            .range(['#ff1616', '#2f0000'])
            .clamp(true)

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .style('opacity', 0);

        this.drawKey()
    }



    drawKey() {
        let vis = this;
        const keyData = [0, 1, 2, 3]

        vis.svg.selectAll(".key-rect")
            .data(keyData)
            .enter()
            .append("rect")
            .attr("class", "key-rect")
            .attr("x", (d) => d * 42 + vis.width / 2 - 75)
            .attr("y", vis.height * 0.04 + 2)
            .attr("width", vis.dayWidth * 1.1)
            .attr("height", vis.dayWidth * 1.1)
            .attr("fill", (d) => ( d == 0 ? 'white' : vis.colorScale(d)))
            .attr("rx", 5)

        vis.svg.selectAll(".key-text")
            .data(keyData)
            .enter()
            .append("text")
            .attr("class", "key-text")
            .attr("x", (d) => d * 42 + vis.dayWidth / 2 + vis.width / 2 - 75)
            .attr("y", vis.height * 0.04 + vis.dayWidth / 1.2 + 2 )
            .attr("text-anchor", "middle")
            .attr("fill", (d) => d == 0 ? 'black' : 'white')
            .text((d) => (d == 3 ? '3+' : d))
            .style("font-size", function(d) {
                return d === 3 ? "12px" : "16px";
            });

        vis.svg.append("text")
            .attr("class", "key-label")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height * 0.05 - vis.dayWidth / 2)
            .attr("fill", 'white')
            .text("Number of Victims")

        let months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November',  'December']
        vis.svg.selectAll(".month-label")
            .data(months)
            .enter()
            .append("text")
            .attr("class", "month-label")
            .attr("x", (d) => vis.getMonthXPos(d))
            .attr("y", (d) => vis.getMonthYPos(d) - vis.dayWidth / 2)
            .attr("fill", 'white')
            .text((d) => monthNames[d])

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        this.filteredData = vis.data.filter (d => {
            return d.date.split("-")[0] == vis.selectedYear &&
                vis.checkFilters(d);
        });

        this.displayData = []
        vis.currentDate = new Date(vis.selectedYear, 0, 1);

        while(vis.currentDate.getFullYear() === vis.selectedYear) {
            const shootingsToday = vis.filteredData.filter(d => d.date === vis.formatDate(vis.currentDate));
            this.displayData.push({
                date: new Date(vis.currentDate),
                victimCount: shootingsToday.length,
                shootingInfo: shootingsToday
            })
            vis.currentDate.setDate(vis.currentDate.getDate() + 1)
        }

        vis.updateCalendarVis();
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

    updateCalendarVis() {
        let vis = this;

        const days = vis.svg.selectAll(".day")
            .data(vis.displayData, d => d.date);

        days.enter()
            .append("rect")
            .on('mouseover', function (event, d) {
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

                let html = `<h4>${vis.formatDate(d.date)}</h4>
                     <div><strong>${d.victimCount} Victim${d.victimCount === 1 ? "" : "s"}</strong></div>`

                let victimList = `<ul>`
                if (d.victimCount > 0) {
                    d.shootingInfo.forEach(victim => {
                        victimList += `<li>${victim.name == "" ? "Name Unknown" : victim.name}, ${victim.age == "" ? "Age Unknown" : victim.age}, ${victim.race}</li>`
                    })
                }
                victimList += `</ul>`
                html += victimList

                console.log(d)

                vis.tooltip
                    .html(html)
                    .style('opacity', 1)
                    .style('left', x + 'px')
                    .style('top', y + 'px')

                d3.select(this).attr('stroke', 'white')
            })
            .on('mouseout', function(event, d) {
                vis.tooltip
                    .style('opacity', 0)

                d3.select(this).attr('stroke', '#5e5c5c')
            })
            .attr("class", "day")
            .attr("x", d => vis.calculateXPos(d.date))
            .attr("y", d => vis.calculateYPos(d.date))
            .attr("width", vis.dayWidth)
            .attr("height", vis.dayWidth)
            .attr("stroke", "#5e5c5c")
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .merge(days)
            .transition()
            .duration(500)
            .attr("fill", d => d.victimCount == 0 ? 'white' : vis.colorScale(d.victimCount))
            .attr("opacity", d => d.date.getFullYear() == vis.selectedYear ? 1 : 0)


        days.exit()
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();
    }

    calculateXPos(date) {
        let vis = this;

        const startDay = new Date(vis.selectedYear, date.getMonth(), 1).getDay();
        const monthXPos = vis.getMonthXPos(date.getMonth());
        const weekDayXPos = (date.getDate() - 1 + startDay) % 7 * vis.dayWidth;
        const xPos = monthXPos + weekDayXPos;

        return xPos;
    }

    calculateYPos(date) {
        let vis = this;

        const startDay = new Date(vis.selectedYear, date.getMonth(), 1).getDay();
        const monthYPos = vis.getMonthYPos(date.getMonth())
        const yPos = monthYPos +
            Math.floor((date.getDate() - 1 + startDay) / 7) * vis.dayWidth;

        return yPos;
    }

    // Returns month column pos based on month number
    getMonthXPos(month) {
        let vis = this;
        let colIndex = (month) % 4

        const monthXPos = d3.scaleLinear()
            .domain([0, 3])
            .range([0, vis.width - vis.weekWidth])

        return monthXPos(colIndex)
    }

    // Returns month row pos based on month number
    getMonthYPos(month) {
        let vis = this;
        let rowIndex = Math.floor((month) / 4)

        const monthYPos = d3.scaleLinear()
            .domain([0, 2])
            .range([vis.height * 0.15, vis.height - vis.weekWidth])

        return monthYPos(rowIndex)

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

    redrawCalendar(selectedYear, filters) {
        let vis = this;

        vis.selectedYear = selectedYear;
        vis.currentDate = new Date(selectedYear, 0, 1);
        vis.endDate = new Date(selectedYear, 11, 31);
        vis.filters = filters;

        vis.wrangleData();
    }
}