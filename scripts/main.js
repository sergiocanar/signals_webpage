const BUFFER_ROUTE = '/buffer';
const SECONDS_TO_STORE = 10;
const DATA_COLLECTION_TIME_MS = 500; // ms
const SAMPLE_PERIOD_MS = 5; // ms
const SAMPLE_RATE_HZ = Math.round(1 / (SAMPLE_PERIOD_MS / 1000)); // Hz
const BUFFER_SIZE = SECONDS_TO_STORE * SAMPLE_RATE_HZ;

let timeCounter = 0;
let ECGsignal = [];
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
    ECGsignal.push(sensorValue);
    timeCounter += SAMPLE_PERIOD_MS / 1000;
    timeArray.push(timeCounter);
    if (ECGsignal.length > MAX_BUFFER_SIZE) {
        ECGsignal.shift();
        timeArray.shift();
    }
    setSliderValues(ECGsignal.length);
}

function fetchBuffer() {
    fetch(BUFFER_ROUTE)
        .then(response => response.json())
        .then(buffer => {
            buffer.map(value => updateBuffers(parseInt(value)));
            updateView();
        })
        .catch(error => console.error('Error fetching sensor value:', error));
}

function updateView() {
    console.log(ECGsignal.length);
    updatePlots();
    calculateBPM();
}

function reducedPamTompkins(signal) {

    let baseSignal = Array.from(signal);

    let diffSquaredSignal = derivative_and_squaring(baseSignal);

    let integratedSignal = moving_window_integration(diffSquaredSignal);

    let thresholdedSignal = threshold_and_decision(integratedSignal);

    return thresholdedSignal;

}

function derivative_and_squaring(signal) {

    for (let i = 0; i < signal.length - 1; i++) {
        signal[i] = (signal[i + 1] - signal[i]) / (SAMPLE_PERIOD_MS / 1000);
        signal[i] = signal[i] ** 2;
    }

    return signal.slice(0, signal.length - 1);
}

function moving_window_integration(signal) {

    let window_size = 0.03; // 30  ms (tomado del artículo oficial del algoritmo para un sample rate de 200 Hz)

    let half_window_size = Math.floor(window_size / 2);
    let n_samples_in_half_window = Math.round(half_window_size / (SAMPLE_PERIOD_MS / 1000));
    let outputSignal = Array(signal.length).fill(0);

    for (let i = 0; i < signal.length; i++) {
        start_i = i - n_samples_in_half_window;
        end_i = i + n_samples_in_half_window;
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

    let windowSize = 10 * SAMPLE_RATE_HZ; // 10 segundos

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

function updateECGPlot() {
    const newECGPoint = [
        timeArray[timeArray.length - 1],
        ECGsignal[ECGsignal.length - 1]
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
    outputSignal = reducedPamTompkins(ECGsignal);
    const data = detectPeaksWithSlidingWindow(outputSignal);
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

setInterval(fetchBuffer, DATA_COLLECTION_TIME_MS);