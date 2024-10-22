let ecgSignal = [];
let timeArray = [];
let rrIntervals = [];

function updateECG() {
    let freqVal = parseInt(document.getElementById('freq').value);
    let nDataVal = parseInt(document.getElementById('exploreECG').value);
    let windowSizeVal = parseInt(document.getElementById('windowSize').value);
    document.getElementById('freqDisplay').innerText = freqVal + " Hz";
    document.getElementById('nDataDisplay').innerText = nDataVal;
    document.getElementById('windowSizeDisplay').innerText = windowSizeVal;
    updateECGPlot(freqVal, nDataVal, windowSizeVal);  // Actualiza el gráfico cuando se mueve cualquier slider
}

function setMaxSliderValues(nData) {
    document.getElementById('exploreECG').max = nData;
    document.getElementById('windowSize').max = nData;
}

function createECG(sampleRate) {
    ecgSignal = [];
    timeArray = [];

    const nData = 2000;
    const height = 200;
    const amplitude = height / 2;
    const start = 0
    const timePerSample = 1 / sampleRate;

    const maxAmplitude = amplitude * (0.5 + 0.5 * 0.5);
    // const waveFrequency = 5;  // Por ejemplo, establecer la frecuencia de la señal a 5 Hz
    setMaxSliderValues(nData);
    for (let i = 0; i < nData; i++) {
        // let t = i * timePerSample;
        let y = start + maxAmplitude * Math.sin((i / nData) * sampleRate * 2 * Math.PI);
        ecgSignal.push(y);
    }

    timeArray = Array.from({ length: ecgSignal.length }, (_, i) => parseFloat((i * timePerSample).toFixed(2)));
    console.log(timeArray);
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
function detectPeaksWithSlidingWindow(signal, timeArray, windowSize, step) {
    let allPeaks = [];

    for (let start = 0; start < signal.length - windowSize; start += step) {
        let end = start + windowSize;
        let peaks = detectPeaksInWindow(signal, start, end);
        allPeaks.push(...peaks);
    }

    return { allPeaks, tacoTimeArray: timeArray.slice(allPeaks[1]) };
}

// Funciones auxiliares para calcular media y desviación estándar
function mean(arr) {
    return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function std(arr, meanVal) {
    let variance = arr.reduce((sum, value) => sum + Math.pow(value - meanVal, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

// Calcular los RR-intervalos
function calculateRRIntervals(peaks, timeArray) {
    rrIntervals = [];

    for (let i = 1; i < peaks.length; i++) {
        let rr = timeArray[peaks[i]] - timeArray[peaks[i - 1]];

        // Asegúrate de que el intervalo RR no sea negativo
        if (rr > 0) {
            rrIntervals.push(rr);
        }
    }

    return rrIntervals;
}

// Función para graficar el tachograma
function plotTachogram(rrIntervals, timeArray) {
    Highcharts.chart('tachogram-container', {
        chart: { type: 'line' },
        title: { text: 'Tachogram' },
        xAxis: { title: { text: 'Time (seconds)' }, categories: timeArray },
        yAxis: { title: { text: 'RR-interval (seconds)' } },
        series: [{ name: 'RR-interval', data: rrIntervals }]
    });
}

function updateECGPlot(freq, nData, windowSize) {
    createECG(freq);
    const signalWindow = ecgSignal.slice(nData, nData + windowSize);
    const timeWindow = timeArray.slice(nData, nData + windowSize);

    Highcharts.chart('ecg-container', {
        chart: { type: 'line' },
        title: { text: 'ECG Signal' },
        xAxis: { title: { text: 'Time (seconds)' }, categories: timeWindow },
        yAxis: { title: { text: 'Amplitude' } },
        series: [{ name: 'ECG Signal', data: signalWindow }]
    });
    const data = detectPeaksWithSlidingWindow(ecgSignal, timeArray, windowSize, 10); // Usar ventanas de tamaño 463 y paso 10
    rrIntervals = calculateRRIntervals(data.allPeaks, data.tacoTimeArray);
    plotTachogram(rrIntervals, data.tacoTimeArray);
}

function calculateBPM() {
    console.log("click");

    if (rrIntervals.length > 0) {
        const avgRRIntervals = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
        const bpm = 60 / avgRRIntervals;

        document.getElementById('bpm-result').innerText = "Tus latidos por minuto son: " + bpm.toFixed(2);
        console.log(bpm);
        if (bpm < 60) {
            document.getElementById('alert').innerText = "Cuidado, posible bradicardia.";
        } else if (bpm > 100) {
            document.getElementById('alert').innerText = "Cuidado, posible taquicardia.";
        } else {
            document.getElementById('alert').innerText = "Estás dentro del rango normal.";
        }
    } else {
        document.getElementById('alert').innerText = "No se encontraron suficientes picos para calcular los BPM.";
    }
}

// Llama a plotECG al cargar la página
document.addEventListener('DOMContentLoaded', updateECG);

let btnCalculateBPM = document.getElementById("calculateBPM");
btnCalculateBPM.onclick = () => calculateBPM();