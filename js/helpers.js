/* * * * * * * * * * * * * *
*      NameConverter       *
* * * * * * * * * * * * * */

class NameConverter {
    constructor() {
        this.states = [
            ['Alabama', 'AL'],
            ['Alaska', 'AK'],
            ['American Samoa', 'AS'],
            ['Arizona', 'AZ'],
            ['Arkansas', 'AR'],
            ['Armed Forces Americas', 'AA'],
            ['Armed Forces Europe', 'AE'],
            ['Armed Forces Pacific', 'AP'],
            ['California', 'CA'],
            ['Colorado', 'CO'],
            ['Connecticut', 'CT'],
            ['Delaware', 'DE'],
            ['District of Columbia', 'DC'],
            ['Florida', 'FL'],
            ['Georgia', 'GA'],
            ['Guam', 'GU'],
            ['Hawaii', 'HI'],
            ['Idaho', 'ID'],
            ['Illinois', 'IL'],
            ['Indiana', 'IN'],
            ['Iowa', 'IA'],
            ['Kansas', 'KS'],
            ['Kentucky', 'KY'],
            ['Louisiana', 'LA'],
            ['Maine', 'ME'],
            ['Marshall Islands', 'MH'],
            ['Maryland', 'MD'],
            ['Massachusetts', 'MA'],
            ['Michigan', 'MI'],
            ['Minnesota', 'MN'],
            ['Mississippi', 'MS'],
            ['Missouri', 'MO'],
            ['Montana', 'MT'],
            ['Nebraska', 'NE'],
            ['Nevada', 'NV'],
            ['New Hampshire', 'NH'],
            ['New Jersey', 'NJ'],
            ['New Mexico', 'NM'],
            ['New York', 'NY'],
            ['North Carolina', 'NC'],
            ['North Dakota', 'ND'],
            ['Northern Mariana Islands', 'NP'],
            ['Ohio', 'OH'],
            ['Oklahoma', 'OK'],
            ['Oregon', 'OR'],
            ['Pennsylvania', 'PA'],
            ['Puerto Rico', 'PR'],
            ['Rhode Island', 'RI'],
            ['South Carolina', 'SC'],
            ['South Dakota', 'SD'],
            ['Tennessee', 'TN'],
            ['Texas', 'TX'],
            ['US Virgin Islands', 'VI'],
            ['Utah', 'UT'],
            ['Vermont', 'VT'],
            ['Virginia', 'VA'],
            ['Washington', 'WA'],
            ['West Virginia', 'WV'],
            ['Wisconsin', 'WI'],
            ['Wyoming', 'WY']
        ]
    }

    getAbbreviation(input) {
        let that = this
        let output = '';
        that.states.forEach(state => {
            if (state[0] === input) {
                output = state[1]
            }
        })
        return output
    }

    getFullName(input) {
        let that = this
        let output = '';
        that.states.forEach(state => {
            if (state[1] === input) {
                output = state[0]
            }
        })
        return output
    }
}

let nameConverter = new NameConverter()


/* * * * * * * * * * * * * *
*         Carousel         *
* * * * * * * * * * * * * */

// Create bootstrap carousel, disabling rotating
let carousel = new bootstrap.Carousel(document.getElementById('stateCarousel'), {interval: false})


// on button click switch view
function switchView() {
    carousel.next();
    document.getElementById('switchView').innerHTML === 'map view' ? document.getElementById('switchView').innerHTML = 'table view' : document.getElementById('switchView').innerHTML = 'map view';
}

function getAgeGroup(age) {
    // Convert age to number and calculate the group
    let ageNum = parseInt(age);
    let group = Math.floor(ageNum / 5) * 5;
    return `${group}-${group + 4}`;
}

function getStartingAge(ageRange) {
    return parseInt(ageRange.split('-')[0]);
}