"use strict";

//definieren van de globale variabelen
let xValues = [];
let yValues = [];
let juisterecords = [];
const ctx = "myChart";
const provSelect = document.getElementById("provincie");

leesJson();

//declaratie van een object van de klasse Chart
let chart = getChart();

function getChart() {
    return new Chart(ctx, {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues
            }]
        },
        options: {
            responsive: true,
            legend: {display: false},
            scales: {
                x: {
                    display: true
                },
                y: {
                    display: true
                }
            }
        }
    });
}

// JSON file lezen en resultaten verwerken:
async function leesJson() {
    let response = await fetch("COVID19BE_tests.json");
    // let response = await fetch("test.json");

    if (response.ok) {
        const alleTesten = await response.json().then(testen => {
            console.log("Alle testen ingeladen (" + testen.length + ")");
            let juist = 0;
            let fout = 0;
            for (let test of testen) {
                // Alleen records toevoegen die provincie bevatten:
                if (test.PROVINCE !== undefined) {
                    juist++;
                    juisterecords.push(test);
                } else {
                    fout++;
                }
            }

            console.log("Aantal volledige records: " + juist);
            console.log("Aantal onvolledige records: " + fout);

            provSelect.addEventListener("change", () => {
                // Bestaande data verwijderen
                removeData();

                let recordsPerProvincie = [];
                const gekozenProvincie = provSelect.value;
                console.log("Provincie: " + gekozenProvincie);
                for (let record of juisterecords) {
                    if (record.PROVINCE === gekozenProvincie) {
                        recordsPerProvincie.push(record);
                    }
                }
                verwerkJuisteTesten(recordsPerProvincie);
            });
        });

    }
}

// Op basis van de aangeduide provincie, de gegevens verwerken:
function verwerkJuisteTesten(records) {
    console.log("Verwerk testen");
    console.log("Aantal records: " + records.length);
    let posratio = 0;

    for (let i = 0; i < records.length; i++) {
        xValues.push(records[i].DATE);
        posratio = 0;
        if (records[i].TESTS_ALL > 0) {
            posratio = (100 * records[i].TESTS_ALL_POS) / records[i].TESTS_ALL;
        }
        yValues.push(posratio);
    }

    // Data toevoegen en updaten:
    addData(yValues);

    clearArrays();
}

function clearArrays() {
    xValues = [];
    yValues = [];
}

function addData(data) {
    chart.destroy();
    chart = getChart();
    chart.data.datasets.data = data;
    chart.reset();
    chart.update('active');
}

function removeData() {
    chart.destroy();
    chart = getChart();
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.reset();
    chart.update('active');
}



