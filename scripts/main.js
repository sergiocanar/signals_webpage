const BUFFER_ROUTE = '/buffer';
const SAMPLE_PERIOD_ROUTE = '/sample_period';
const REQUEST_INTERVAL_MS_ROUTE = '/request_interval_ms';
const SECONDS_TO_STORE = 10;

let samplePeriodMs = 0;
let sampleRateHz = 0;
let bufferSize = 0;
let requestIntervalMs = 0;
let rrIntervalsMean = 0;
let lastArrhythmiaCount = 0;
let arrhythmiaCount = 0;

let timeCounter = 0;
let ECGsignal = [];
let timeArray = [];
let rrIntervals = [];
let integralSignal = [];
let peaks = [];
let tachogramTimeArray = [];
let newData = [];
let rrInterestIntervals = [];

let ecgChart;
let tachogramChart;
let peaksChart;

async function fetchBufferAndUpdateView() {
    try {
        const response = await fetch(BUFFER_ROUTE);
        const text = await response.text();
        const buffer = text.split(',');

        updateBuffers(buffer);
        updateView();
    } catch (error) {
        console.error('Error fetching sensor value:', error);
    }
}

async function fetchSampleInterval() {
    try {
        const response = await fetch(REQUEST_INTERVAL_MS_ROUTE);
        const data = await response.text();
        requestIntervalMs = parseInt(data);
    } catch (error) {
        console.error('Error fetching sample interval:', error);
    }
}

async function fetchSamplePeriod() {
    try {
        const response = await fetch(SAMPLE_PERIOD_ROUTE);
        const data = await response.text();
        samplePeriodMs = parseInt(data);
        sampleRateHz = Math.round(1 / (samplePeriodMs / 1000));
        bufferSize = SECONDS_TO_STORE * sampleRateHz;
    } catch (error) {
        console.error('Error fetching sample period:', error);
    }
}

async function initializeData() {
    await fetchSampleInterval();
    await fetchSamplePeriod();

    console.log('Parameter initialization complete');
    console.log({
        requestIntervalMs,
        samplePeriodMs,
        sampleRateHz,
        bufferSize
    });
}

function initializeECGChart() {
    ecgChart = Highcharts.chart('ecg-container', {
        chart: { type: 'line', animation: false },
        title: { text: 'ECG Signal' },
        xAxis: { title: { text: 'Time (seconds)' }, categories: [] },
        yAxis: { title: { text: 'Amplitude (mV)' } },
        series: [
            { name: 'ECG Signal', data: [] }, // ECG signal series
            { 
                name: 'Arrhythmias', 
                data: [], 
                color: 'red', 
                type: 'scatter', 
                marker: { 
                    radius: 4, 
                    enabled: true // Ensure marker is enabled for this series
                } 
            }
        ],
        plotOptions: {
            line: { marker: { enabled: false } }, // Applies only to line series
            scatter: { marker: { enabled: true } } // Explicitly enable markers for scatter series
        }
    });
}


function initializeTachogramChart() {
    tachogramChart = Highcharts.chart('tachogram-container', {
        chart: { type: 'line', animation: false },
        title: { text: 'Tachogram' },
        xAxis: { title: { text: 'Time' } },
        yAxis: { title: { text: 'RR-interval (seconds)' } },
        series: [{ name: 'RR-interval', data: [] }],
        plotOptions: { series: { marker: { enabled: false } } }
    });
}

function initializePeaksChart() {
    peaksChart = Highcharts.chart('peaks-container', { // Correctly assign to peaksChart
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
    for (let i = 0; i < newData.length; i++) {
        const newECGPoint = [
            timeArray[timeArray.length - newData.length + i],
            newData[i]
        ];
        ecgChart.series[0].addPoint(newECGPoint, true, ecgChart.series[0].data.length >= bufferSize);
    }
}

function updateTachogramChart() {
    for (let i = 0; i < rrIntervals.length; i++) {
        const newTachoPoint = [
            tachogramTimeArray[i], // Use updated time array
            rrIntervals[i]
        ];
        tachogramChart.series[0].addPoint(newTachoPoint, true, tachogramChart.series[0].data.length >= bufferSize);
    }
}

function updatePeaksChart(newIntegralSignal) {
    for (let i = 0; i < newIntegralSignal.length; i++) {
        const newIntegralPoint = [
            timeArray[timeArray.length - newIntegralSignal.length + i],
            newIntegralSignal[i]
        ];
        peaksChart.series[0].addPoint(newIntegralPoint, true, peaksChart.series[0].data.length >= bufferSize);
    }

    const peakPoints = peaks.map(peakIndex => [
        timeArray[peakIndex],
        integralSignal[peakIndex]
    ]);
    peaksChart.series[1].setData(peakPoints, true);
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

function plotArrhythmias(arrhythmias) {
    const arrhythmiaPoints = [];

    // Collect arrhythmia points within the current time buffer
    arrhythmias.forEach(arrhythmia => {
        const { data, time } = arrhythmia;

        data.forEach((value, index) => {
            const timePoint = time[index];
            // Only include arrhythmias within the current buffer range
            if (timePoint >= timeArray[0] && timePoint <= timeArray[timeArray.length - 1]) {
                arrhythmiaPoints.push([timePoint, value]);
            }
        });
    });

    // Update the arrhythmia series (series[1])
    ecgChart.series[1].setData(arrhythmiaPoints, true);
}


function reducedPamTompkins() {

    const filteredECG = applyMovingAverage(newData, 5);
    ECGsignal = ECGsignal.concat(filteredECG);

    const diffSignal = diffAndSquare(filteredECG);

    // TODO: seleccionar automatica y matematicamente el tamaño de la ventana
    const newIntegralSignal = slidingWindowIntegration(diffSignal, samplePeriodMs, 0.055);
    //console.log(newIntegralSignal);
    integralSignal = integralSignal.concat(newIntegralSignal);
    if (integralSignal.length > bufferSize) {
        integralSignal = integralSignal.slice(integralSignal.length - bufferSize);
    }

    // TODO: seleccionar automatica y matematicamente el tamaño de la ventana y el umbral
    peaks = findPeaks(integralSignal, 120, 2);

    rrIntervals = calculateTachogram(peaks, sampleRateHz);
    
    return newIntegralSignal;

}

function findArrhythmias() {
    let arrhythmias = [];
    let rrIntervalsMean = mean(rrIntervals);
    let rrIntervalsSD = Math.sqrt(rrIntervals.reduce((acc, curr) => acc + Math.pow(curr - rrIntervalsMean, 2), 0) / rrIntervals.length);

    for (let i = 0; i < rrIntervals.length; i++) {
        if (rrIntervals[i] < rrIntervalsMean - 3 * rrIntervalsSD || rrIntervals[i] > rrIntervalsMean + 3 * rrIntervalsSD) {
            const secondsToStore = 5;
            const timeWindow = secondsToStore * sampleRateHz;
            const halfWindow = Math.floor(timeWindow / 2);
            const nSamplesInHalfWindow = Math.round(halfWindow / samplePeriodMs);

            let startIdx = i - nSamplesInHalfWindow;
            let endIdx = i + nSamplesInHalfWindow;

            startIdx = Math.max(0, startIdx);
            endIdx = Math.min(rrIntervals.length, endIdx);

            const window = ECGsignal.slice(startIdx, endIdx);
            const timeWindowArray = timeArray.slice(startIdx, endIdx);
            arrhythmias.push({data: window, time: timeWindowArray});
        }
    }
    
    if (arrhythmias.length != lastArrhythmiaCount) {
        lastArrhythmiaCount = arrhythmias.length;
        updateArrhythmiaCountView(arrhythmias.length);
        arrhythmiaPopup();
    }
    return arrhythmias;
}

function arrhythmiaPopup() {
    alert(`Arrhythmias detected. Please notify the user to stop it's activity`);
}

function updateArrhythmiaCountView(count) {
    if (count === 0) {
        document.getElementById('arrhythmia-count').innerText = `No arrhythmias detected.`;
    } else {
        document.getElementById('arrhythmia-count').innerText = `${count} arrhythmias detected.`;
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
    const nSamplesInHalfWindow = Math.round(halfWindow / samplePeriod);

    for (let i = 0; i < signal.length; i++) {
        let startIdx = i - nSamplesInHalfWindow;
        let endIdx = i + nSamplesInHalfWindow + 1;

        startIdx = Math.max(0, startIdx);
        endIdx = Math.min(signal.length, endIdx);

        const window = signal.slice(startIdx, endIdx);
        if (window.length > 0) {
            newIntegralSignal.push(mean(window));
        } else {
            newIntegralSignal.push(0);
        }
    }

    return newIntegralSignal;
}

function mean(arr) {
    if (arr.length === 0) return 0; // Return a default value to avoid NaN
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

function findPeaks(signal, windowSize, thresholdMultiplier) {
    
    const meanValue = mean(signal);
    const threshold = meanValue * thresholdMultiplier;
    
    const peakIndices = [];

    let firstPeakFound = false;
    let startIdx = 0;
    let searchIdx = 0;
    while (!firstPeakFound && searchIdx < signal.length) {
        const window = signal.slice(searchIdx, searchIdx + windowSize);
        const windowMax = max(window);
        if (windowMax > threshold) {
            firstPeakFound = true;
            peakIndices.push(searchIdx + window.indexOf(windowMax));
            startIdx = searchIdx + Math.floor(windowSize / 2);
        }
        else {
            searchIdx += windowSize;
        }
    }

    for (let i = startIdx; i < signal.length; i += windowSize) {
        const window = signal.slice(i, i + windowSize);
        const windowMax = max(window);
        if (windowMax > threshold) {
            peakIndices.push(i + window.indexOf(windowMax));
        }
    }

    return peakIndices;
}

function calculateTachogram(peaks, sampleRate) {
    const newTachogram = [];
    const newTachogramTimeArray = [];

    if (peaks.length < 2) return [];

    for (let i = 1; i < peaks.length; i++) {
        const RR = (peaks[i] - peaks[i - 1]) / sampleRate;
        newTachogram.push(RR);
        newTachogramTimeArray.push(timeArray[peaks[i - 1]]); // Use time from timeArray
    }

    tachogramTimeArray = newTachogramTimeArray; // Update the global time array
    return newTachogram;
}


function updateView() {
    const newIntegralSignal = reducedPamTompkins();
    updateECGChart();
    updatePeaksChart(newIntegralSignal);
    updateTachogramChart();
    calculateBPM();
    const arrhythmias = findArrhythmias();
    plotArrhythmias(arrhythmias);
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
    const bpm = 60 / avgRRInterval;

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

initializeData()
    .then(() => {
        console.log('Data initialization complete. All global variables are updated.');

        setInterval(
            async () => {
                await fetchBufferAndUpdateView();
            },
            requestIntervalMs
        );

        console.log(`Fetching buffer every ${requestIntervalMs} ms`);
    })
    .catch(error => {
        console.error('Error during data initialization:', error);
    });
