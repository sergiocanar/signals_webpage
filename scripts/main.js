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
let integralSignal = [];
let peaks = [];
let tachogramTimeArray = [];
let newData = [];

let ecgChart;
let tachogramChart;
let peaksChart;

function fetchBuffer() {
    fetch(BUFFER_ROUTE)
        .then(response => response.json())
        .then(buffer => {
            updateBuffers(buffer);
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
    // TODO: update ECG chart with new data that comes in buffer
    const newECGPoint = [
        timeArray[timeArray.length - 1],
        ECGsignal[ECGsignal.length - 1]
    ];
    ecgChart.series[0].addPoint(newECGPoint, true, ecgChart.series[0].data.length >= bufferSize);
}

function updateTachogramChart() {
    // TODO: update with new data that comes in buffer
    if (rrIntervals.length > 0) {
        const newTachoPoint = [
            tachogramTimeArray[tachogramTimeArray.length - 1],
            rrIntervals[rrIntervals.length - 1]
        ];
        tachogramChart.series[0].addPoint(newTachoPoint, true, tachogramChart.series[0].data.length >= bufferSize);
    }
}

function updatePeaksChart() {
    // TODO: update peaks chart correctly
    peaksChart.series[0].setData(integralSignal, true);
    peaksChart.series[1].setData(peaks.map(peak => [timeArray[peak], integralSignal[peak]]), true);
}

function updateBuffers(buffer) {
    newData = [];
    for (let i = 0; i < buffer.length; i++) {
        let sensorValue = parseFloat(buffer[i]);
        newData.push(sensorValue);
        timeCounter += samplePeriodMs / 1000;
        timeArray.push(timeCounter);
        if (ECGsignal.length > bufferSize) {
            timeArray.shift();
        }
    }
}

function reducedPamTompkins(newData) {

    const filteredECG = applyMovingAverage(newData, 5);
    ECGsignal = ECGsignal.concat(filteredECG);

    const diffSignal = diffAndSquare(filteredECG);

    // TODO: seleccionar automatica y matematicamente el tamaño de la ventana
    const newIntegralSignal = slidingWindowIntegration(diffSignal, samplePeriodMs, 0.055);
    
    integralSignal = integralSignal.concat(newIntegralSignal);
    if (integralSignal.length > bufferSize) {
        integralSignal = integralSignal.slice(integralSignal.length - bufferSize);
    }

    // TODO: seleccionar automatica y matematicamente el tamaño de la ventana y el umbral
    const newPeaks = findPeaks(newIntegralSignal, 120, 600);
    
    ECGsignal = ECGsignal.concat(newData);
    peaks = peaks.concat(newPeaks);
    if (ECGsignal.length > bufferSize) {
        for (let i = 0; i < peaks.length; i++) {
            let newIdx = peaks[i] - bufferSize;
            if (newIdx >= 0) {
                peaks[i] = newIdx;
            }
            else {
                peaks.shift();
            }
        }
        ECGsignal = ECGsignal.slice(ECGsignal.length - bufferSize);
    }

    const newTachogram = calculateTachogram(newPeaks, sampleRateHz);
    rrIntervals = rrIntervals.concat(newTachogram);
    if (rrIntervals.length > bufferSize) {
        rrIntervals = rrIntervals.slice(rrIntervals.length - bufferSize);
    }

}

function applyMovingAverage(signal, windowSize = 5) {
    const filtered = [];
    for (let i = 0; i < signal.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = i - Math.floor(windowSize / 2); j <= i + Math.floor(windowSize / 2); j++) {
            if (j >= 0 && j < signal.length) {
                sum += signal[j];
                count++;
            }
        }
        filtered.push(sum / count);
    }
    return filtered;
}

function diffAndSquare(signal) {
    const diffSignal = [];

    for (let i = 0; i < signal.length - 1; i++) {
        diffSignal.push(Math.pow(signal[i + 1] - signal[i], 2));
    }

    return diffSignal;
}

function slidingWindowIntegration(signal, samplePeriod, windowSize) {

    const newIntegralSignal = [];
    const halfWindow = windowSize / 2;
    const nSamplesInHalfWindow = Math.floor(halfWindow / samplePeriod);
    for (let i = 0; i < signal.length; i++) {
        let startIdx = i - nSamplesInHalfWindow;
        let endIdx = i + nSamplesInHalfWindow;

        if (startIdx < 0) {
            startIdx = 0;
        }
        if (endIdx >= signal.length) {
            endIdx = signal.length - 1;
        }

        const window = signal.slice(startIdx, endIdx);
        newIntegralSignal.push(mean(window));
    }

    return newIntegralSignal;

}

function mean(arr) {
    return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function max(signal) {
    let maxVal = signal[0];
    for (let i = 1; i < signal.length; i++) {
        if (signal[i] > maxVal) {
            maxVal = signal[i];
        }
    }
    return maxVal;
}

function calculateTachogram(peaks, sampleRate) {
    const newTachogram = [];

    if (peaks.length < 2) return [];

    for (let i = 1; i < peaks.length; i++) {
        const RR = (peaks[i] - peaks[i - 1]) / sampleRate;
        newTachogram.push(RR);
    }
    return newTachogram;
}

function updateView(newData) {
    reducedPamTompkins(newData);
    updateECGChart();
    updateTachogramChart();
    updatePeaksChart();
    calculateBPM()
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
});

fetchSampleInterval();
fetchSamplePeriod();
setInterval(fetchBuffer, requestIntervalMs);