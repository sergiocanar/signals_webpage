const SENSOR_VALUE_ROUTE = '/sensorValue';
const SENSOR_VALUE_ELEMENT_ID = 'sensor-value';
const MAX_BUFFER_SIZE = 100;
const DATA_COLLECTION_TIME = 50; // ms

let timeCounter = 0;
let ecgSignal = [];
let timeArray = [];
let rrIntervals = [];
let ecgChart;
let tachogramChart;

function initializeECGChart() {
    ecgChart = Highcharts.chart('ecg-container', {
        chart: { type: 'line', animation: false },
        title: { text: 'ECG Signal' },
        xAxis: { title: { text: 'Time (seconds)' }, categories: [] },
        yAxis: { title: { text: 'Amplitude (mV)' } },
        series: [{ name: 'ECG Signal', data: [] }],
        plotOptions: { series: { marker: { enabled: false } } }
    });
}

function initializeTachogramChart() {
    tachogramChart = Highcharts.chart('tachogram-container', {
        chart: { type: 'line', animation: false },
        title: { text: 'Tachogram' },
        xAxis: { title: { text: 'Time (seconds)' }, categories: [] },
        yAxis: { title: { text: 'RR-interval (seconds)' } },
        series: [{ name: 'RR-interval', data: [] }],
        plotOptions: { series: { marker: { enabled: false } } }
    });
}

function updateBuffers(sensorValue) {
    ecgSignal.push(sensorValue);
    timeArray.push(timeCounter);
    timeCounter += DATA_COLLECTION_TIME / 1000;
    if (ecgSignal.length > MAX_BUFFER_SIZE) {
        ecgSignal.shift();
        timeArray.shift();
    }
    setSliderValues(ecgSignal.length);
}

function fetchSensorValue() {
    fetch(SENSOR_VALUE_ROUTE)
        .then(response => response.text())
        .then(sensorValue => {
            sensorValue = parseInt(sensorValue);
            document.getElementById(SENSOR_VALUE_ELEMENT_ID).innerHTML = sensorValue;
            updateBuffers(sensorValue);
            updateView();
        })
        .catch(error => console.error('Error fetching sensor value:', error));
}

function updateView() {
    let freqVal = parseInt(document.getElementById('freq').value);
    let windowSizeVal = parseInt(document.getElementById('window-size').value);
    document.getElementById('freq-display').innerText = freqVal + " Hz";
    document.getElementById('window-size-display').innerText = windowSizeVal;
    updatePlots();
    calculateBPM();
}

function setSliderValues(nData) {
    document.getElementById('window-size').max = nData;
}

function detectPeaksInWindow(start, end) {
    let peaks = [];
    let window = ecgSignal.slice(start, end);

    for (let i = 1; i < window.length - 1; i++) {
        if (window[i] > window[i - 1] && window[i] > window[i + 1]) {
            peaks.push(start + i);
        }
    }
    return peaks;
}


function detectPeaksWithSlidingWindow(windowSize, step) {
    let allPeaks = [];

    for (let start = 0; start < ecgSignal.length - windowSize; start += step) {
        let end = start + windowSize;
        let peaks = detectPeaksInWindow(start, end);
        allPeaks.push(...peaks);
    }

    return { allPeaks, tacoTimeArray: timeArray.slice(allPeaks[1]) };
}

function mean(arr) {
    return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function std(arr, meanVal) {
    let variance = arr.reduce((sum, value) => sum + Math.pow(value - meanVal, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

function calculateRRIntervals(peaks, timeArray) {
    rrIntervals = [];

    if (peaks.length < 2) return;

    for (let i = 1; i < peaks.length; i++) {
        let rr = (timeArray[peaks[i]] - timeArray[peaks[i - 1]]) / 1000;
        if (rr > 0) rrIntervals.push(rr);
    }
}

function updateECGPlot() {
    const newECGPoint = [
        timeArray[timeArray.length - 1],
        ecgSignal[ecgSignal.length - 1]
    ];
    ecgChart.series[0].addPoint(newECGPoint, true, ecgChart.series[0].data.length >= MAX_BUFFER_SIZE);
}

function updateTachogramPlot(tacoTimeArray, rrIntervals) {
    if (rrIntervals.length > 0) {
        const newTachoPoint = [
            tacoTimeArray[tacoTimeArray.length - 1],
            rrIntervals[rrIntervals.length - 1]
        ];
        tachogramChart.series[0].addPoint(newTachoPoint, true, tachogramChart.series[0].data.length >= MAX_BUFFER_SIZE);
    }
}

function updatePlots() {
    updateECGPlot();

    const data = detectPeaksWithSlidingWindow(windowSizeSlider.value, 10);
    calculateRRIntervals(data.allPeaks, data.tacoTimeArray);
    updateTachogramPlot(data.tacoTimeArray, rrIntervals);
}

function calculateBPM() {
    let alertView = document.getElementById('alert');
    let moreInfoButton = document.getElementById('more-info-button');
    
    if (rrIntervals.length === 0) {
        document.getElementById('bpm-result').innerText = "N/A";
        alertView.innerText = "Not enough peaks to calculate BPM.";
        alertView.style.color = "black";
        moreInfoButton.style.display = "none";
        return;
    }

    const avgRRInterval = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
    const bpm = 0.006 / avgRRInterval;

    document.getElementById('bpm-result').innerText = bpm.toFixed(2) + " BPM";
    moreInfoButton.style.display = "block";

    if (bpm < 60) {
        alertView.innerText = "Alert! possible bradycardia.";
        alertView.style.color = "red";
        moreInfoButton.onclick = function () {
            alert(`Bradycardia is a condition where the heart beats slower than normal. It can be serious in some cases and may require treatment.
                
                Mild bradycardia: 50-60 bpm.
                
                Moderate bradycardia: 40-50 bpm.
                
                Severe bradycardia: Less than 40 bpm.`);
        };
    } else if (bpm > 100) {
        alertView.innerText = "Alert! possible tachycardia.";
        alertView.style.color = "red";
        moreInfoButton.onclick = function () {
            alert(`Tachycardia is a condition where the heart beats faster than normal. It is important to monitor it as it can lead to more serious problems.
                
                Mild tachycardia: 100-120 bpm.
                
                Moderate tachycardia: 120-150 bpm.
                
                Severe tachycardia: More than 150 bpm.`);
        };
    } else {
        alertView.innerText = "Within the normal range.";
        alertView.style.color = "green";
        moreInfoButton.onclick = function () {
            alert("Your heart rate is within normal levels. Keep it up!");
        };
    }
}

function showPopup() {
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

window.onclick = function (event) {
    const popup = document.getElementById('popup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initializeECGChart();
    initializeTachogramChart();
    updateView();
});

let freqSlider = document.getElementById("freq");
freqSlider.oninput = () => updateView();

let windowSizeSlider = document.getElementById("window-size");
windowSizeSlider.min = 1;
windowSizeSlider.oninput = () => updateView();

setInterval(fetchSensorValue, DATA_COLLECTION_TIME);
