README for Police Shooting Data Visualization Project
This project visualizes police shooting data in the United States, offering a comprehensive view of these incidents' demographic breakdown, regional distribution, and temporal trends. It leverages D3.js for dynamic and interactive visualizations.

Getting Started
Prerequisites: Ensure you have the latest version of a modern web browser installed (e.g., Chrome, Firefox).
Installation: Clone the repository to your local machine. No additional installations are required as all dependencies are sourced via CDNs.
Structure
index.html: Main HTML file containing the structure of the visualization dashboard.
js/: JavaScript files for different visualizations:
main.js: Initialization and data loading logic.
mapVis.js, calendarVis.js, etc.: Scripts for specific visualizations like maps and calendars.
helpers.js: Utility functions used across different visualizations.
css/: Contains CSS files for styling the dashboard.
Visualizations
Calendar Visualization (calendarVis.js): Shows daily fatal police shootings. Users can select different years to view data.
Monthly Victims Line Chart (monthlyVictimsLineChart.js): Illustrates monthly shooting trends for a selected year compared to an average.
Map Visualization (mapVis.js): Displays shootings geographically. Users can interactively explore data by state and year.
Blood Drip Bar Chart (bloodDripBarChart.js): Represents state-wise data emphasizing the per-capita impact.
Features
Dynamic Data Filtering: Filters allow users to view data by race, gender, and armed status.
Interactive Elements: Tooltips, clickable legends, and year selectors enhance user engagement.
Responsive Design: Adjusts to different screen sizes for a seamless viewing experience.
Usage
Open index.html in a web browser.
Select a year from dropdowns to update the visualizations accordingly.
Use the filter buttons to narrow down the data based on gender, race, and armed status.
Hover over elements for detailed information in tooltips.
Data Source
Data is sourced from a comprehensive police shooting database detailing incidents from 2015 to 2022.

Contribution
Contributions are welcome. Please fork the repository and submit a pull request for review.

License
This project is released under the MIT License. See the LICENSE file for details.

Note: The project is intended for educational purposes and aims to offer insights into the critical issue of police shootings in the U.S.

