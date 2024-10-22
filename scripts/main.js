function updateECG() {
    let freqVal = parseInt(document.getElementById('freq').value);
    let nDataVal = parseInt(document.getElementById('exploreECG').value);
    let windowSizeVal = parseInt(document.getElementById('windowSize').value);
    document.getElementById('freqDisplay').innerText = freqVal + " Hz";
    document.getElementById('nDataDisplay').innerText = nDataVal;
    document.getElementById('windowSizeDisplay').innerText = windowSizeVal;
    plotECG(freqVal, nDataVal, windowSizeVal);  // Actualiza el gráfico cuando se mueve cualquier slider
}

function setMaxSliderValues(nData) {
    document.getElementById('exploreECG').max = nData;
    document.getElementById('windowSize').max = nData;
}

function createECG() {
    const nData = 2000;
    const height = 200;
    const amplitude = height / 2;
    const start = 0
    const sampleRate = parseInt(document.getElementById('freq').value);
    const timePerSample = 1 / sampleRate;

    const maxAmplitude = amplitude * (0.5 + 0.5 * 0.5);
    // const waveFrequency = 5;  // Por ejemplo, establecer la frecuencia de la señal a 5 Hz

    const signal = [];

    setMaxSliderValues(nData);
    for (let i = 0; i < nData; i++) {
        // let t = i * timePerSample;
        let y = start + maxAmplitude * Math.sin((i / nData) * sampleRate * 2 * Math.PI);
        signal.push(y);
    }

    const timeArray = Array.from({ length: signal.length }, (_, i) => parseFloat((i * timePerSample).toFixed(2)));
    return { timeArray: timeArray, signal };
}

// Función para detectar picos dentro de una ventana específica
function detectPeaksInWindow(signal, start, end) {
    const peaks = [];
    const window = signal.slice(start, end);
    const peakValues = window.filter((val, i) =>
        i > 0 && i < window.length - 1 && val > window[i - 1] && val > window[i + 1]
    );

    if (peakValues.length > 0) {
        const meanVal = mean(peakValues);
        const stdVal = std(peakValues, meanVal);

        const minThreshold = meanVal + 1 * stdVal;
        const maxThreshold = meanVal + 5 * stdVal;

        for (let i = 1; i < window.length - 1; i++) {
            if (
                window[i] >= minThreshold &&
                window[i] <= maxThreshold &&
                window[i] > window[i - 1] &&
                window[i] > window[i + 1]
            ) {
                peaks.push(start + i);
            }
        }
    }
    return peaks;
}

// Detección de picos con ventanas deslizantes
function detectPeaksWithSlidingWindow(signal, windowSize, step) {
    const allPeaks = [];

    for (let start = 0; start < signal.length - windowSize; start += step) {
        const end = start + windowSize;
        const peaks = detectPeaksInWindow(signal, start, end);
        allPeaks.push(...peaks);
    }

    return allPeaks;
}

// Funciones auxiliares para calcular media y desviación estándar
function mean(arr) {
    return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function std(arr, meanVal) {
    const variance = arr.reduce((sum, value) => sum + Math.pow(value - meanVal, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

// Calcular los RR-intervalos
function calculateRRIntervals(peaks, timeArray) {
    const rr_intervals = [];

    for (let i = 1; i < peaks.length; i++) {
        const rr = timeArray[peaks[i]] - timeArray[peaks[i - 1]];

        // Asegúrate de que el intervalo RR no sea negativo
        if (rr > 0) {
            rr_intervals.push(rr);
        }
    }

    return rr_intervals;
}

// Función para graficar el ECG usando Highcharts
function plotECG(freq, nData, windowSize) {
    const data = createECG();
    const peaks = detectPeaksWithSlidingWindow(data.signal, 463, 10); // Usar ventanas de tamaño 463 y paso 10
    const rr_intervals = calculateRRIntervals(peaks, data.timeArray);

    Highcharts.chart('ecg-container', {
        chart: { type: 'line' },
        title: { text: 'ECG Signal Plot' },
        xAxis: { title: { text: 'Time (seconds)' }, min: 0, tickInterval: 0.1, categories: data.timeArray },
        yAxis: { title: { text: 'Amplitude' } },
        series: [{ name: 'ECG Signal', data: data.signal }]
    });

    plotTachogram(rr_intervals);
}

// Función para graficar el tachograma
function plotTachogram(rr_intervals) {
    Highcharts.chart('tachogram-container', {
        chart: { type: 'line' },
        title: { text: 'Tachogram (RR Intervals)' },
        xAxis: {
            title: { text: 'Beat Number' },
            min: 0,
            allowDecimals: false
        },
        yAxis: { title: { text: 'RR Interval (seconds)' } },
        series: [{
            name: 'RR Interval',
            data: rr_intervals.map((interval, index) => [index + 1, interval])
        }]
    });
}

function updateECGPlot() {
    const windowSize = parseInt(document.getElementById('windowSize').value);
    const sliderValue = parseInt(document.getElementById('exploreECG').value);

    const signalWindow = ecgSignal.slice(sliderValue, sliderValue + windowSize);
    const timeWindow = timeArray.slice(sliderValue, sliderValue + windowSize);

    Highcharts.chart('ecg-chart', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'ECG'
        },
        xAxis: {
            categories: timeWindow
        },
        yAxis: {
            title: {
                text: 'Amplitude'
            }
        },
        series: [{
            name: 'ECG Signal',
            data: signalWindow
        }]
    });
}

// Llama a plotECG al cargar la página
document.addEventListener('DOMContentLoaded', plotECG);