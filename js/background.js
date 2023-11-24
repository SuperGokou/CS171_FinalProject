class Background {
    constructor(parentElement, victimData) {
        this.victimData = victimData;
        this.parentElement = parentElement;

        this.extractNames();
        this.writeNames()
    }

    extractNames() {
        let vis = this;
        this.names = [];
        vis.victimData.forEach(victim => {
            if (victim.name !== '') {
                this.names.push(victim.name);
            } else {
                this.names.push("Unknown")
            }
        });
    }

    writeNames() {
        let vis = this;
        vis.names.forEach(name => {
            const nameElement = document.createElement("span")
            nameElement.classList.add("victimName")
            nameElement.textContent = " " + name + " •";
            document.getElementById(vis.parentElement).appendChild(nameElement);
        })
        console.log('hi!')
    }
}