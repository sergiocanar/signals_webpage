// Variables globales para almacenar la señal ECG, el tiempo y los intervalos RR
let ecgSignal = [];
let timeArray = [];
let rrIntervals = [];

/**
 * Actualiza la visualización del ECG en la página web.
 * 
 * Esta función realiza las siguientes acciones:
 * 1. Obtiene los valores de los sliders de frecuencia, punto de inicio y tamaño de ventana.
 * 2. Actualiza la visualización de los valores de los sliders en la interfaz de usuario.
 * 3. Llama a la función `updatePlots` para actualizar los gráficos con los nuevos valores.
 * 4. Llama a la función `calculateBPM` para calcular los latidos por minuto.
 * 
 * @function
 */
function updateView() {
    // obtener los valores de los sliders
    let freqVal = parseInt(document.getElementById('freq').value);
    let startPointVal = parseInt(document.getElementById('start-point').value);
    let windowSizeVal = parseInt(document.getElementById('window-size').value);
    // Actualizar la vista de los valores de los sliders
    document.getElementById('freq-display').innerText = freqVal + " Hz";
    document.getElementById('start-point-display').innerText = startPointVal;
    document.getElementById('window-size-display').innerText = windowSizeVal;
    // Actualizar los gráficos
    updatePlots(freqVal, startPointVal, windowSizeVal);  
    // Calcula los latidos por minuto
    calculateBPM();
}

/**
 * Establece los valores máximos de los deslizadores 'start-point' y 'window-size'.
 *
 * @param {number} nData - El valor máximo que se establecerá en los deslizadores.
 */
function setMaxSliderValues(nData) {
    document.getElementById('start-point').max = nData;
    document.getElementById('window-size').max = nData;
}

/**
 * Crea una señal ECG simulada.
 *
 * @param {number} sampleRate - La tasa de muestreo de la señal en Hz (frecuecia).
 * @returns {void}
 *
 * @description
 * Esta función genera una señal ECG simulada y la almacena en el arreglo `ecgSignal`.
 * La señal se genera como una onda sinusoidal con una amplitud máxima ajustada.
 * También se crea un arreglo `timeArray` que contiene los tiempos correspondientes
 * a cada muestra de la señal.
 *
 * @example
 * // Crear una señal ECG con una tasa de muestreo de 1000 Hz
 * createECG(1000);
 */
function createECG(sampleRate) {
    ecgSignal = [];
    timeArray = [];

    const nData = 2000;
    setMaxSliderValues(nData); // Establecer los valores máximos de los deslizadores
    let height = 200;
    let amplitude = height / 2;
    let start = 0;
    let timePerSample = 1 / sampleRate;

    let maxAmplitude = amplitude * (0.5 + 0.5 * 0.5);
    for (let i = 0; i < nData; i++) {
        let y = start + maxAmplitude * Math.sin((i / nData) * sampleRate * 2 * Math.PI);
        ecgSignal.push(y);
    }

    timeArray = Array.from({ length: ecgSignal.length }, (_, i) => parseFloat((i * timePerSample).toFixed(2)));
}


/**
 * Detecta picos en una ventana de una señal ECG.
 *
 * @param {number} start - El índice de inicio de la ventana.
 * @param {number} end - El índice de fin de la ventana.
 * @returns {number[]} - Un array con los índices de los picos detectados dentro de la ventana.
 */
function detectPeaksInWindow(start, end) {
    let peaks = [];
    let window = ecgSignal.slice(start, end);
    let peakValues = window.filter((val, i) =>
        i > 0 && i < window.length - 1 && val > window[i - 1] && val > window[i + 1]
    );

    if (peakValues.length > 0) {
        let meanVal = mean(peakValues);
        let stdVal = std(peakValues, meanVal);

        let minThreshold = meanVal + 1 * stdVal;
        let maxThreshold = meanVal + 5 * stdVal;

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

/**
 * Detecta picos en una señal utilizando una ventana deslizante.
 *
 * @param {number} windowSize - El tamaño de la ventana deslizante.
 * @param {number} step - El paso con el que se moverá la ventana deslizante.
 * @returns {Object} Un objeto que contiene:
 *   - {number[]} allPeaks: Un array con todos los picos detectados.
 *   - {number[]} tacoTimeArray: Un array de tiempos correspondiente a los picos detectados.
 */
function detectPeaksWithSlidingWindow(windowSize, step) {
    let allPeaks = [];

    for (let start = 0; start < ecgSignal.length - windowSize; start += step) {
        let end = start + windowSize;
        let peaks = detectPeaksInWindow(start, end);
        allPeaks.push(...peaks);
    }

    return { allPeaks, tacoTimeArray: timeArray.slice(allPeaks[1]) };
}

/**
 * Calcula la media (promedio) de un array de números.
 *
 * @param {number[]} arr - El array de números.
 * @returns {number} La media de los números en el array.
 */
function mean(arr) {
    return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

/**
 * Calcula la desviación estándar de un array de números.
 *
 * @param {number[]} arr - El array de números.
 * @param {number} meanVal - la media del array.
 * @returns {number} La desviación estándar del array.
 */
function std(arr, meanVal) {
    let variance = arr.reduce((sum, value) => sum + Math.pow(value - meanVal, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

/**
 * Calcula los intervalos RR dados los picos y un array de tiempos.
 *
 * @param {number[]} peaks - Array de índices de los picos en la señal.
 * @param {number[]} timeArray - Array de tiempos correspondientes a cada muestra de la señal.
 */
function calculateRRIntervals(peaks, timeArray) {
    rrIntervals = [];

    for (let i = 1; i < peaks.length; i++) {
        let rr = timeArray[peaks[i]] - timeArray[peaks[i - 1]];

        // Asegúrate de que el intervalo RR no sea negativo
        if (rr > 0) {
            rrIntervals.push(rr);
        }
    }
}

/**
 * Genera un gráfico de línea de un taquigrama utilizando Highcharts.
 *
 * @param {number[]} rrIntervals - Array de intervalos RR en segundos.
 * @param {string[]} timeArray - Array de tiempos correspondientes en segundos.
 */
function plotTachogram(timeArray) {
    Highcharts.chart('tachogram-container', {
        chart: { type: 'line' },
        title: { text: 'Tachogram' },
        xAxis: { title: { text: 'Time (seconds)' }, categories: timeArray },
        yAxis: { title: { text: 'RR-interval (seconds)' } },
        series: [{ name: 'RR-interval', data: rrIntervals }]
    });
}

/**
 * Actualiza las gráficas de ECG y el taquograma.
 *
 * @param {number} freq - Frecuencia de muestreo de la señal ECG.
 * @param {number} startPoint - Índice inicial de los datos a mostrar.
 * @param {number} windowSize - Tamaño de la ventana de datos a mostrar.
 *
 * @description
 * Esta función actualiza las gráficas de la señal ECG y el taquograma.
 * Primero, crea la señal ECG y luego extrae una ventana de datos de la señal y del tiempo.
 * Utiliza Highcharts para graficar la señal ECG en un contenedor específico.
 * Luego, detecta los picos en la señal ECG utilizando una ventana deslizante y calcula los intervalos RR.
 * Finalmente, grafica el taquograma utilizando los intervalos RR calculados.
 */
function updatePlots(freq, startPoint, windowSize) {
    createECG(freq);
    let signalWindow = ecgSignal.slice(startPoint, startPoint + windowSize);
    let timeWindow = timeArray.slice(startPoint, startPoint + windowSize);

    Highcharts.chart('ecg-container', {
        chart: { type: 'line' },
        title: { text: 'ECG Signal' },
        xAxis: { title: { text: 'Time (seconds)' }, categories: timeWindow },
        yAxis: { title: { text: 'Amplitude' } },
        series: [{ name: 'ECG Signal', data: signalWindow }]
    });
    let data = detectPeaksWithSlidingWindow(windowSize, 10);
    calculateRRIntervals(data.allPeaks, data.tacoTimeArray);
    plotTachogram(data.tacoTimeArray);
}

/**
 * Calcula los latidos por minuto (BPM) basándose en los intervalos RR.
 * Muestra el resultado en el elemento con id 'bpm-result' y un mensaje de alerta
 * en el elemento con id 'alert' dependiendo del rango de BPM calculado.
 * 
 * - Si el BPM es menor a 60, muestra una alerta de posible bradicardia.
 * - Si el BPM es mayor a 100, muestra una alerta de posible taquicardia.
 * - Si el BPM está entre 60 y 100, indica que está dentro del rango normal.
 * - Si no hay suficientes intervalos RR, muestra un mensaje de error.
 * 
 * @function
 */
function calculateBPM() {
    let alertView = document.getElementById('alert');
    let moreInfoButton = document.getElementById('more-info-button'); // Obtén el botón
    if (rrIntervals.length > 0) {
        const avgRRIntervals = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
        const bpm = 60 / avgRRIntervals;

        document.getElementById('bpm-result').innerText = bpm.toFixed(2) + " BPM";
        
        // Mostrar botón de "Conocer más sobre mi estado"
        moreInfoButton.style.display = "block"; 

        if (bpm < 60) {
            alertView.innerText = "Alert! possible bradycardia.";
            alertView.style.color = "red";
            moreInfoButton.onclick = function() {
                alert("La bradicardia es una condición en la que el corazón late más despacio de lo normal. Puede ser grave en algunos casos y requerir tratamiento.\n" + "\n" + 
                      "Bradicardia leve: 50-60 bpm.\n" +"\n" + 
                      "Bradicardia moderada: 40-50 bpm.\n" +"\n" + 
                      "Bradicardia severa: Menos de 40 bpm.");
            };
        } else if (bpm > 100) {
            alertView.innerText = "Alert! possible tachycardia.";
            alertView.style.color = "red";
            moreInfoButton.onclick = function() {
                alert("La taquicardia es una condición en la que el corazón late más rápido de lo normal. Es importante controlarla, ya que puede derivar en problemas más serios.\n" + "\n" + 
                      "Taquicardia leve: 100-120 bpm.\n" + "\n" + 
                      "Taquicardia moderada: 120-150 bpm.\n" + "\n" + 
                      "Taquicardia grave: Más de 150 bpm.");
            };
        } else {
            alertView.innerText = "Within the normal range.";
            alertView.style.color = "green";
            moreInfoButton.onclick = function() {
                alert("Tu frecuencia cardíaca está dentro de los niveles normales. ¡Sigue así!");
            };
        }
    } else {
        document.getElementById('bpm-result').innerText = "N/A";
        alertView.innerText = "Not enough peaks to calculate BPM.";
        alertView.style.color = "black";
        moreInfoButton.style.display = "none"; // Ocultar botón si no hay BPM calculado
    }
}


// Plotear la señal ECG al cargar la página
document.addEventListener('DOMContentLoaded', updateView);

// Eventos de los sliders
let freqSlider = document.getElementById("freq");
freqSlider.oninput = () => updateView();

let startPointSlider = document.getElementById("start-point");
startPointSlider.oninput = () => updateView();

let windowSizeSlider = document.getElementById("window-size");
windowSizeSlider.oninput = () => updateView();