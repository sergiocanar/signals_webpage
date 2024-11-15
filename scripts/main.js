const BUFFER_ROUTE = '/buffer';
const SAMPLE_PERIOD_ROUTE = '/sample_period';
const REQUEST_INTERVAL_MS_ROUTE = '/request_interval_ms';
const SECONDS_TO_STORE = 10;

let samplePeriodMs = 0;
let sampleRateHz = 0;
let bufferSize = 0;
let requestIntervalMs = 0;

let timeCounter = 0;
let ECGsignal = [];
let timeArray = [];
let rrIntervals = [];

let ecgChart;
let tachogramChart;
let peaksChart;

function fetchBuffer() {
    fetch(BUFFER_ROUTE)
        .then(response => response.json())
        .then(buffer => {
            buffer.map(value => updateBuffers(parseFloat(value)));
            updateView();
        })
        .catch(error => console.error('Error fetching sensor value:', error));
}

function fetchSampleInterval() {
    fetch(REQUEST_INTERVAL_MS_ROUTE)
        .then(response => response.text())
        .then(data => {
            requestIntervalMs = parseInt(data);
        })
        .catch(error => console.error('Error fetching sample interval:', error));
}

function fetchSamplePeriod() {
    fetch(SAMPLE_PERIOD_ROUTE)
        .then(response => response.text())
        .then(data => {
            samplePeriodMs = parseInt(data);
            sampleRateHz = Math.round(1 / (samplePeriodMs / 1000));
            bufferSize = SECONDS_TO_STORE * sampleRateHz;
        })
        .catch(error => console.error('Error fetching sample period:', error));
}

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
        xAxis: { title: { text: 'Beats' } },
        yAxis: { title: { text: 'RR-interval (seconds)' } },
        series: [{ name: 'RR-interval', data: [] }],
        plotOptions: { series: { marker: { enabled: false } } }
    });
}

function initializePeaksChart() {
    tachogramChart = Highcharts.chart('peaks-container', {
        chart: { type: 'line', animation: false },
        title: { text: 'Integrated Signal with Peaks' },
        xAxis: { title: { text: 'Time (seconds)' } },
        yAxis: { title: { text: 'Amplitude' } },
        legend: { enabled: true },
        series: [
            { name: 'Integrated Signal', data: [], lineWidth: 1 },
            {
                type: 'scatter',
                name: 'Peaks',
                data: [],
                color: 'red',
                marker: {
                    radius: 4
                }
            }
        ]
    });
}

function updateECGChart() {
    const newECGPoint = [
        timeArray[timeArray.length - 1],
        ECGsignal[ECGsignal.length - 1]
    ];
    ecgChart.series[0].addPoint(newECGPoint, true, ecgChart.series[0].data.length >= bufferSize);
}

function updateTachogramChart(tacoTimeArray, rrIntervals) {
    if (rrIntervals.length > 0) {
        const newTachoPoint = [
            tacoTimeArray[tacoTimeArray.length - 1],
            rrIntervals[rrIntervals.length - 1]
        ];
        tachogramChart.series[0].addPoint(newTachoPoint, true, tachogramChart.series[0].data.length >= bufferSize);
    }
}

function updatePeaksChart(integralSignal, peaks) {
    peaksChart.series[0].setData(integralSignal, true);
    peaksChart.series[1].setData(peaks.map(peak => [timeArray[peak], integralSignal[peak]]), true);
}

function updateBuffers(sensorValue) {
    ECGsignal.push(sensorValue);
    timeCounter += samplePeriodMs / 1000;
    timeArray.push(timeCounter);
    if (ECGsignal.length > bufferSize) {
        ECGsignal.shift();
        timeArray.shift();
    }
}

function updateView() {
    updatePlots();
    calculateBPM();
}

function reducedPamTompkins(signal) {

    let baseSignal = Array.from(signal);

    let diffSquaredSignal = diffAndSquare(baseSignal);

    let integratedSignal = movingWindowIntegration(diffSquaredSignal);

    let thresholdedSignal = threshold_and_decision(integratedSignal);
    updateOtherPlots(diffSquaredSignal, integratedSignal, thresholdedSignal);
    return thresholdedSignal;

}

function diffAndSquare(signal) {

    for (let i = 0; i < signal.length - 1; i++) {
        signal[i] = (signal[i + 1] - signal[i]) / (samplePeriodMs / 1000);
        signal[i] = signal[i] ** 2;
    }

    return signal.slice(0, signal.length - 1);
}

function movingWindowIntegration(signal) {

    let windowSize = 0.03; // 30  ms (tomado del artículo oficial del algoritmo para un sample rate de 200 Hz)

    let halfWindowSize = Math.floor(windowSize / 2);
    let nSamplesInHalfWindow = Math.round(halfWindowSize / (samplePeriodMs / 1000));
    let outputSignal = Array(signal.length).fill(0);

    for (let i = 0; i < signal.length; i++) {
        start_i = i - nSamplesInHalfWindow;
        end_i = i + nSamplesInHalfWindow;
        if (start_i < 0) {
            start_i = 0;
        }
        if (end_i > signal.length) {
            end_i = signal.length;
        }
        outputSignal = mean(signal.slice(start_i, end_i));
    }

    return outputSignal;
}

function threshold_and_decision(signal) {

    // TODO: umbralizar en Pam-Tompkins
    // TODO: detectar picos

    return signal;

}


// TODO: revise peak detection
function detectPeaksInWindow(start, end) {
    let peaks = [];
    let window = ECGsignal.slice(start, end);

    for (let i = 1; i < window.length - 1; i++) {
        if (window[i] > window[i - 1] && window[i] > window[i + 1]) {
            peaks.push(start + i);
        }
    }
    return peaks;
}


function detectPeaksWithSlidingWindow(signal) {
    let allPeaks = [];

    let windowSize = 10 * sampleRateHz; // 10 segundos

    for (let i = 0; i < signal.length - windowSize; i += windowSize) {
        let end = i + windowSize;
        let peaks = detectPeaksInWindow(i, end);
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

function updatePlots() {
    updateECGChart();
    outputSignal = reducedPamTompkins(ECGsignal);
    const data = detectPeaksWithSlidingWindow(outputSignal);
    calculateRRIntervals(data.allPeaks, data.tacoTimeArray);
    updateTachogramChart(data.tacoTimeArray, rrIntervals);
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
    initializePeaksChart();
    updateView();
});

fetchSampleInterval();
fetchSamplePeriod();
setInterval(fetchBuffer, requestIntervalMs);