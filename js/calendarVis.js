class CalendarVis {
    constructor(parentElement, data) {
        console.log('hi!')
        this.parentElement = parentElement;
        this.data = data;
        this.currentDate = new Date(2022, 0, 1);
        this.endDate = new Date(2022, 11, 31);

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create svg element
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Initialize calendar dimensions
        vis.weekWidth = (vis.width) / 6;
        vis.dayWidth = vis.weekWidth / 7;

        // Create color scale
        vis.colorScale = d3.scaleLinear()
            .domain([1, 3])
            .range(['#ff0000', '#2f0000'])
            .clamp(true)

        // Initialize tooltip
        vis.tooltip = d3.select("#" + vis.parentElement).append('g')
            .attr('class', "tooltip")
            .style('opacity', 0);

        // Initialize drawing interval
        d3.interval(
            () => {
                if (vis.currentDate < vis.endDate) {
                    vis.drawDay()
                    vis.currentDate.setDate(vis.currentDate.getDate() + 1)
                } else {
                    this.stop;
                }
            },
        )

        this.drawKey()


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

    drawKey() {
        let vis = this;
        const keyData = [0, 1, 2, 3]

        vis.svg.selectAll(".key-rect")
            .data(keyData)
            .enter()
            .append("rect")
            .attr("class", "key-rect")
            .attr("x", (d) => vis.getMonthXPos(d) + vis.weekWidth / 2)
            .attr("y", vis.height * 0.05)
            .attr("width", vis.dayWidth)
            .attr("height", vis.dayWidth)
            .attr("fill", (d) => ( d == 0 ? 'white' : vis.colorScale(d)))
            .attr("rx", 5)
    }

    drawDay() {
        let vis = this;

        // Get data on today's shootings
        const shootingsToday = vis.data.filter(d => d.date === vis.formatDate(vis.currentDate));

        // Color day based on number of shootings today
        const color = shootingsToday.length == 0 ? 'white' : vis.colorScale(shootingsToday.length);

        // Calculate position for the day's
        const startDay = new Date(vis.currentDate.getYear(), vis.currentDate.getMonth(), 1).getDay();
        const monthXPos = vis.getMonthXPos(vis.currentDate.getMonth());
        const weekDayXPos = (vis.currentDate.getDate() + 1 + startDay) % 7 * vis.dayWidth;
        const xPos = monthXPos + weekDayXPos;

        const monthYPos = vis.getMonthYPos(vis.currentDate.getMonth())
        const yPos = monthYPos +
            Math.floor((vis.currentDate.getDate() + 1 + startDay) / 7) * vis.dayWidth;

        // If first day of month, draw month name
        if (vis.currentDate.getDate() == 1) {
            vis.svg.append("text")
                .attr("class", "month-label")
                .attr("x", monthXPos)
                .attr("y", yPos - vis.dayWidth / 2)
                .attr("fill", 'white')
                .text(vis.currentDate.toLocaleString('default', {month: 'long'}))
        }

        // Draw day
        vis.svg.append("rect")
            .attr("class", "day")
            .attr("x", xPos)
            .attr("y", yPos)
            .attr("width", vis.dayWidth)
            .attr("height", vis.dayWidth)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", color)
            .attr("rx", 5)
            .on('mouseover', function (event, d) {
                vis.tooltip
                    .style('opacity', 1)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px')
                    .html(`${vis.formatDate(vis.currentDate)}<br>${shootingsToday.length} shootings`)
            })
            .on('mouseout', function (event, d) {
                vis.tooltip
                    .style('opacity', 0)
            })
    }

    formatDate() {
        let vis = this;

        const year = vis.currentDate.getFullYear()
        let month = vis.currentDate.getMonth() + 1
        let day = vis.currentDate.getDate()

        // Pad the month and day with a leading zero if they are less than 10
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;

        return `${year}-${month}-${day}`;
    }
}