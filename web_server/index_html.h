// Generated header file with HTML content for NodeMCU to serve an HTML page

#ifndef INDEX_HTML_H
#define INDEX_HTML_H

#include <pgmspace.h>

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML>
<html lang='en'>

<head>
    <link rel='icon' href='data:,'>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width'>
    <meta http-equiv='X-UA-Compatible' content='ie=edge'>
    <title>CardioHub</title>
    <link rel='icon' href='https://drive.google.com/thumbnail?id=1tpmabnom3LA5a4O6Cv9xD30kTTo5dgG0'>
    <style>
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #ffffff;
    font-family: Arial, sans-serif;
    text-align: center;
    display: flex;
    flex-direction: column;
    font-size: 20px;
}

.container {
    flex: 1;
    padding-bottom: 60px;
}

header {
    background-color: #28262C;
    color: #F9F5FF;
    padding: 20px 0;
}

section {
    padding: 20px;
    margin: 20px;
    background-color: #F9F5FF;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
    margin: 50px;
    font-size: 4em;
    color: #28262C;
}

h2 {
    margin: 0;
    font-size: 1.5em;
    color: #28262C;
}

h3 {
    font-size: 15px;
}

h4 {
    text-align: left;
    font-size: 10px;
}

p {
    text-align: justify;
    font-size: 25px;
}


ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin: 10px 0;
    font-size: 16px;
}

ol {
    list-style-type: decimal;
    padding-left: 20px;
    text-align: left;
    margin: 0;    
}

ol li {
    margin-bottom: 10px;
    text-decoration: underline;
    font-size: 25px; 
}

li p {
    margin: 0;
}

#footer {
    position: relative;
    width: 100%;
    background-color: #28262C;
    color: white;
    text-align: center;
    font-size: 5px;
}

a {
    color: #d7db1c;
    font-size: 10px;
}

a:link, a:visited {
    color: #d4c2fc;
    text-decoration: none;
}

#ecg-container {
    width: 100%; 
    height: 400px;
    margin-bottom: 5%;
}

#tachogran-container {
    width: 100%;
    height: 500px;
    margin-bottom: 100%;    
    padding: 100px;
}

#freq {
    width: 10%;
    margin: auto;
}

.popup {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
}

.popup-content {
    background-color: #ffffff;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3 !important;
    border-color: #0056b3 !important;
}

.btn-primary {
    background-color: #14248A !important;
    border-color: #14248A !important;
    margin-top: 20px;
    font-size: 10px;
}
</style>
    <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' rel='stylesheet'
        integrity='sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH' crossorigin='anonymous'>
    <script src='https://code.highcharts.com/highcharts.js'></script>
</head>

<body>
    <div class='container-fluid'>
        <div class='row'>
            <div class='col-4'>
                <figure style='position: absolute; top: 60px; right:70%'>
                    <img class='img-fluid' src='https://drive.google.com/thumbnail?id=1vUv7XzNJbRoR5laaYr--X_C4wTVjqs_K'
                        alt='Universidad de los Andes' style='width: 400px;'>
                </figure>
            </div>
            <div class='col-4'>
                <figure
                    style='position: relative; top: 20px; display: flex; flex-direction: column; align-items: center; margin: 0 auto;'>
                    <img class='img-fluid' src='https://drive.google.com/thumbnail?id=1R8gDDiJrOu39KTVjqC5HQDitdLBYhqvo'
                        style='width: 50%; margin-bottom: 3%;'>
                </figure>
            </div>
            <div class='col-4'>
                <button class='btn btn-primary' onclick='showPopup()'>
                    Discover more about CardioHub!<br>
                    <span style='display: block; text-indent: 20px;'>Intelligent monitoring for evolving
                        athletes.</span>
                </button>
            </div>
            <div id='popup' class='popup'>
                <div class='popup-content'>
                    <span class='close' onclick='closePopup()'>&times;</span>
                    <h2>CardioHub: Intelligent Monitoring for Evolving Athletes.</h2>
                    <figure style='position: relative; align-items: center; margin: 0 auto;'>
                        <img class='img-fluid'
                            src='https://drive.google.com/thumbnail?id=1R8gDDiJrOu39KTVjqC5HQDitdLBYhqvo'
                            style='width: 10%; '>
                    </figure>
                    <h4>About arrhythmias and the current issue: </h4>
                    <p>High-performance sports practice has been associated in recent years with cardiomyopathies,
                        ventricular arrhythmias, and coronary diseases, highlighting the importance of constant
                        monitoring both during exercise and in the recovery phase [1]. Factors such as dehydration,
                        electrolyte imbalances, physiological stress, and muscle fatigue increase athletes'
                        susceptibility
                        to heart problems, raising the risk of sudden cardiac death (SCD), particularly in those with
                        undiagnosed underlying conditions, such as hypertrophic cardiomyopathy [2]. Additionally,
                        the incidence of SCD is higher during or immediately after exercise, reinforcing the need for
                        technological solutions to monitor real-time cardiac activity, alerting athletes and coaches
                        about potential life-threatening abnormalities [3]. Among the existing options for continuous
                        monitoring, the use of electrocardiograms (ECG) is essential, as it allows measuring the heart's
                        electrical activity and detecting arrhythmias and conduction abnormalities [4].
                        The project has been driven by several notable incidents in the sports field that have
                        highlighted
                        the urgent need to improve cardiac monitoring tools for athletes. One of the most recent and
                        recognized cases is that of footballer Sergio Agüero, who suffered an arrhythmia during a match
                        in 2021, forcing him to retire from professional football. This case not only demonstrated the
                        possible consequences of an undiagnosed arrhythmia in time but also revealed the need for more
                        rigorous monitoring during sports activity. Another example is the Uruguayan football player
                        Juan Izquierdo, who died due to a cardiorespiratory arrest related to an arrhythmia while
                        training [5]. The circumstances and issues of cardiac monitoring extend to other sports
                        disciplines, such as the case of South African triathlete Richard Murray, who was diagnosed
                        with atrial fibrillation in 2021, limiting his performance in this discipline. Since then, he
                        has had to adapt his training and lifestyle to manage the condition [6].
                    </p>
                    <figure style='position: relative; align-items: center; margin: 0 auto;'>
                        <img class='img-fluid' src='https://i.ibb.co/FqC88ZV/Imagen-inv.png' style='width: 70%; '>
                    </figure>
                    <h4>Statistical data on arrhythmias, a common problem in high-performance athletes: </h4>
                    <p>Regarding statistical data, cardiac arrhythmia has a global prevalence of 1.5% to 5%,
                        with atrial fibrillation (AF) being its most common form [7]. In Colombia, it is estimated that
                        between 2013 and 2017, 87 out of every 100,000 inhabitants suffered from AF, with this value
                        increasing to 150 in central regions of the country [8]. Concerning athletes, it is estimated
                        that 1 in every 59,452 athletes suffers a cardiac arrest associated with a cardiac arrhythmia,
                        representing 1.7 cases per 100,000 athletes [9]. Epidemiological statistics have also revealed
                        the extent of the problem. Recent research has shown that 12.9% of marathon runners experienced
                        ventricular arrhythmias during the race [10]. These scenarios highlight the health and life
                        risks
                        athletes may face, raising questions about the current capability of monitoring devices to
                        detect arrhythmias promptly during intense exercise.
                    </p>
                    <h4>Main causes contributing to the development of pathophysiology: </h4>
                    <ol>
                        <li>Sports supplements</li>
                        <p>The use of sports supplements, especially anabolic steroids, is associated with a higher
                            risk of AF in young athletes. These products can alter normal cardiac mechanisms,
                            predisposing to the development of arrhythmias [11] </p>
                        <li>Atrial ectopy</li>
                        <p>AF in athletes can also be triggered by focal ectopic discharges in the pulmonary veins.
                            These discharges result from increased sympathetic activity due to intense exercise,
                            which can alter the normal heart rhythm [11]</p>
                        <li>Inflammation and fibrosis</li>
                        <p>Excessive exercise and intense training can cause chronic systemic inflammation,
                            manifested in elevated levels of C-reactive protein. This inflammatory process, along with
                            the development of fibrosis in cardiac tissue, creates a conducive environment for the
                            occurrence of AF, as it alters the heart's normal structure and function [11]</p>
                        <li>Electrolyte imbalance</li>
                        <p>High-intensity training can cause significant changes in the body's fluid dynamics,
                            leading to electrolyte imbalances. These imbalances, such as extreme dehydration, can
                            alter cardiac function and favor the development of AF in athletes [11].</p>
                    </ol>
                    <h4>CardioHub as a wearable, its relevance for monitoring arrhythmias in athletes: </h4>
                    <p>The use of a wearable device like CardioHub to monitor real-time electrical activity of the heart
                        is crucial to prevent serious complications in athletes. These devices allow early detection
                        of arrhythmias and provide accurate information about cardiac status during intense exercise
                        and recovery, helping to prevent sudden cardiac death (SCD). By providing real-time alerts
                        about cardiac irregularities, these wearables enable coaches and doctors to make quick decisions
                        and prevent undiagnosed conditions from progressing to critical situations [12]. Additionally,
                        continuous monitoring helps adjust athletes' training routines to optimize their health and
                        performance without compromising their cardiac well-being [13].
                    </p>
                    <p
                        style='font-size: 20px; text-align: center; font-style: italic; font-weight: 550; color: #316bd6;'>
                        CardioHub provides an innovative solution to safeguard athletes' health while they strive to
                        reach their peak performance. The key lies in prevention, and continuous monitoring is the tool
                        that ensures athletes' hearts keep beating safely and strongly.</p>

                    <figure style='position: relative; align-items: center; margin: 0 auto;'>
                        <img class='img-fluid'
                            src='https://drive.google.com/thumbnail?id=1ezARWMQk74BPl_LAeOS_xsfKKdh7ba7C'
                            style='width: 30%; '>
                    </figure>

                    <h4>References</h4>
                    <ol>[1] S. Fyyaz y M. Papadakis, “Arrhythmogenesis of Sports: Myth or Reality?” Arrhythm
                        Electrophysiol Rev,
                        vol. 11, e05, abr. de 2022. DOI: 10.15420/aer.2021.68.</ol>
                    <ol>[2] P. Rao, D. R. Seshadri y J. J. Hsu, “Current and potential applications of wearables in
                        sports
                        cardiology,” Curr. Treat. Options Cardiovasc. Med., vol. 23, n.o 10, oct. de 2021, Accessed Sep.
                        10,
                        2024. direccion: https://doi. ´ org/10.1007/s11936-021-00942-1.</ol>
                    <ol>[3] R. Gajda, J. Gajda, M. Czuba, B. Knechtle y W. Drygas, “Sports heart monitors as reliable
                        diagnostic
                        tools for training control and detecting arrhythmias in professional and leisure-time endurance
                        athletes: An expert consensus statement,” Sports Med., oct. de 2023, Accessed Sep. 10, 2024.
                        direccion:
                        https://doi.org/10. ´ 1007/s40279-023-01948-4.</ol>
                    <ol>[4] D. G. Grazioli, Arritmia ventricular y fibrosis miocardi- ´ ca en atletas, https : / /
                        secardiologia
                        . es / blog / 8298 - arritmia- ventricular- y- fibrosis- miocardica- en- atletas, Accessed: Aug.
                        31,
                        2024.</ol>
                    <ol>[5] H. Y. Izquierdo, La arritmia cardiaca sacude al futbol: ´ el enemigo silencioso de los
                        jugadores
                        tras los casos del ‘Kun’ Aguero y Juan Izquierdo ¨ , https://www.eltiempo.
                        com/deportes/futbol-internacional/la-arritmia-cardiacasacude - al - futbol - el - enemigo -
                        silencioso -
                        de - los - jugadores - tras - los - casos - del - kun - aguero - y - juan - izquierdo-3375588,
                        Accessed:
                        Aug. 31, 2024.</ol>
                    <ol>[6] H. Heidbuchel, “The athlete’s heart is a proarrhythmic heart, and what that means for
                        clinical
                        decision making,” EP Eur., vol. 20, n.o 9, pags. 1401-1411, dic. de ´ 2017, Accessed Sep. 10,
                        2024.
                        direccion: https://doi. ´ org/10.1093/europace/eux294.</ol>
                    <ol>[7] D. S. Desai y S. Hajouli, “Arrhythmias,” en StatPearls, Consultado: el 10 de septiembre de
                        2024,
                        Treasure Island (FL): StatPearls Publishing, 2024. direccion: http: ´
                        //www.ncbi.nlm.nih.gov/books/NBK558923/.</ol>
                    <ol>[8] A. A. Garc ´ ´ıa-Pena et al., “Prevalencia de fibrilaci ˜ on´ auricular en Colombia segun
                        informaci
                        ´ on del Sistema ´ Integral de Informacion de la Protecci ´ on Social (SIS- ´ PRO),” Revista
                        Colombiana
                        de Cardiolog´ıa, vol. 29, n.o 2, pags. 170-176, abr. de 2022. ´ DOI: 10.24875/rccar. m22000139.
                    </ol>
                    <ol>[9] M. Rage et al., “Cardiomyopathy and Sudden Cardiac Death Among the Athletes in Developing
                        Countries:
                        Incidence and Their Prevention Strategies,” Cureus, vol. 15, n.o 2, e35612, 2023. DOI: 10 . 7759
                        /
                        cureus . 35612. </ol>
                    <ol>[10] A. E. V. Toaquiza y D. A. A. T. Aguilar, “Arritmias ventriculares y su relacion con la
                        muerte s ´
                        ubita car- ´ diaca en deportistas,” Ciencia Latina Revista Cient´ıfica Multidisciplinar, vol. 6,
                        n.o 5,
                        nov. de 2022. DOI: 10. 37811/cl rcm.v6i5.3313.</ol>
                    <ol>[11] M. K. Turagam, G. C. Flaker, P. Velagapudi, S. Vadali y M. A. Alpert, “Atrial Fibrillation
                        In
                        Athletes: Pathophysiology, Clinical Presentation, Evaluation and Management,” J Atr
                        Fibrillation, vol.
                        8, n.o 4, pag. 1309, dic. de 2015. ´ DOI: 10.4022/jafib.1309. </ol>
                    <ol>[12] A. Pingitore, M. Peruzzi, S. C. Clarich, Z. Palama,` L. Sciarra y E. Cavarretta, “An
                        overview of
                        the electrocardiographic monitoring devices in sports cardiology: Between present and future,”
                        Clin.
                        Cardiol., jun. de 2023, Accessed Sep. 10, 2024. direccion: https://doi. ´ org/10.1002/clc.24073.
                    </ol>
                    <ol>[13] F. Halabchi, T. Seif-Barghi y R. Mazaheri, “Sudden cardiac death in young athletes; a
                        literature
                        review and special considerations in asia,” Asian J. Sports Medicine, vol. 2, n.o 1, mar. de
                        2011,
                        Accessed Sep. 10, 2024. direccion: https://doi.org/10.5812/asjsm.34818</ol>
                </div>
            </div>
            <hr>
            <div class='row'>
                <div class='col-6'>
                    <div id='bpm-container'>
                        <h3 id='bpm-result'></h3>
                        <h3 id='alert'></h3>
                    </div>
                </div>
                <div class='col-6'>
                    <div class='d-flex justify-content-center'>
                        <button id='more-info-button' class='btn btn-primary'>Get more information about my state</button>
                    </div>
                    <div style='height: 50px; text-align: center;'></div>
                </div>
            </div>
            <div class='row'>
                <div id='ecg-container'></div>
            </div>
            <div class='row'>
                <div id='peaks-container'></div>
            </div>
            <div class='row'>
                <div id='tachogram-container'></div>
            </div>
        </div>
    </div>
    <footer id='footer' style='text-align: center;'>
        <p style='font-size: 18px; text-align: center; margin-top: 15px;'>
            Authors:
            <a href='https://github.com/sergiocanar' style='font-size: 18px;'>Sergio Andres Canar Lozano</a>
            (202020383),
            <a href='https://github.com/DavidTobonIBIO' style='font-size: 18px;'>David Tobon Molina</a> (202123804),
            <a href='https://github.com/msalcedog' style='font-size: 18px;'>Martin Salcedo</a> (202123644),
            and
            <a href='https://github.com/wilmansh' style='font-size: 18px;'>Wilman Sanchez</a> (202116779)
        </p>
        <p style='font-size: 18px;text-align: center;'>
            Source code:
            <a href='https://github.com/sergiocanar/signals_webpage' style='font-size: 18px;'>
                https://github.com/sergiocanar/signals_webpage
            </a>
        </p>
    </footer>
    <script>
const BUFFER_ROUTE = '/buffer';
const SAMPLE_PERIOD_ROUTE = '/sample_period';
const REQUEST_INTERVAL_MS_ROUTE = '/request_interval_ms';
const SECONDS_TO_STORE = 10;

let samplePeriodMs = 0;
let sampleRateHz = 0;
let bufferSize = 0;
let requestIntervalMs = 0;
let rrIntervalsMean = 0;

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
            { name: 'ECG Signal', data: [] }, 
            { 
                name: 'Arrhythmias', 
                data: [], 
                color: 'red', 
                type: 'scatter', 
                marker: { 
                    radius: 4, 
                    enabled: true 
                } 
            }
        ],
        plotOptions: {
            line: { marker: { enabled: false } }, 
            scatter: { marker: { enabled: true } } 
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
    peaksChart = Highcharts.chart('peaks-container', { 
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
            tachogramTimeArray[i], 
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

    arrhythmias.forEach(arrhythmia => {
        const { data, time } = arrhythmia;

        data.forEach((value, index) => {
            const timePoint = time[index];
            
            if (timePoint >= timeArray[0] && timePoint <= timeArray[timeArray.length - 1]) {
                arrhythmiaPoints.push([timePoint, value]);
            }
        });
    });

    
    ecgChart.series[1].setData(arrhythmiaPoints, true);
}

function reducedPamTompkins() {

    const filteredECG = applyMovingAverage(newData, 5);
    ECGsignal = ECGsignal.concat(filteredECG);

    const diffSignal = diffAndSquare(filteredECG);

    
    const newIntegralSignal = slidingWindowIntegration(diffSignal, samplePeriodMs, 0.055);
    
    integralSignal = integralSignal.concat(newIntegralSignal);
    if (integralSignal.length > bufferSize) {
        integralSignal = integralSignal.slice(integralSignal.length - bufferSize);
    }

    
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
    console.log(`Arrhythmias found: ${arrhythmias.length}`);
    return arrhythmias;
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
    if (arr.length === 0) return 0; 
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
        newTachogramTimeArray.push(timeArray[peaks[i - 1]]); 
    }

    tachogramTimeArray = newTachogramTimeArray; 
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
        document.getElementById('bpm-result').innerText = 'N/A';
        alertView.innerText = 'Not enough peaks to calculate BPM.';
        alertView.style.color = 'black';
        moreInfoButton.style.display = 'none';
        return;
    }

    const avgRRInterval = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
    const bpm = 60 / avgRRInterval;

    document.getElementById('bpm-result').innerText = bpm.toFixed(2) + ' BPM';
    moreInfoButton.style.display = 'block';

    if (bpm < 60) {
        alertView.innerText = 'Alert! possible bradycardia.';
        alertView.style.color = 'red';
        moreInfoButton.onclick = function () {
            alert(`Bradycardia is a condition where the heart beats slower than normal. It can be serious in some cases and may require treatment.
                
                Mild bradycardia: 50-60 bpm.
                
                Moderate bradycardia: 40-50 bpm.
                
                Severe bradycardia: Less than 40 bpm.`);
        };
    } else if (bpm > 100) {
        alertView.innerText = 'Alert! possible tachycardia.';
        alertView.style.color = 'red';
        moreInfoButton.onclick = function () {
            alert(`Tachycardia is a condition where the heart beats faster than normal. It is important to monitor it as it can lead to more serious problems.
                
                Mild tachycardia: 100-120 bpm.
                
                Moderate tachycardia: 120-150 bpm.
                
                Severe tachycardia: More than 150 bpm.`);
        };
    } else {
        alertView.innerText = 'Within the normal range.';
        alertView.style.color = 'green';
        moreInfoButton.onclick = function () {
            alert('Your heart rate is within normal levels. Keep it up!');
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

</script>
</body>

</html>
)rawliteral";

#endif // INDEX_HTML_H
