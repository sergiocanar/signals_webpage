function plotECG(rawSignal) {
    Highcharts.chart('ecg-container', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'ECG Signal'
        },
        xAxis: {
            title: {
                text: 'Time (Samples)'
            }
        },
        yAxis: {
            title: {
                text: 'Amplitude'
            }
        },
        legend: {
            enabled: true
        },
        series: [
            {
                name: 'Raw Signal',
                data: rawSignal,
                color: 'blue',
                lineWidth: 1
            }
        ]
    });
}

function plotFilteredSignal(filteredSignal) {
    Highcharts.chart('fourier-container', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Filtered ECG Signal'
        },
        xAxis: {
            title: {
                text: 'Time (Samples)'
            }
        },
        yAxis: {
            title: {
                text: 'Amplitude'
            }
        },
        legend: {
            enabled: true
        },
        series: [
            {
                name: 'Filtered Signal',
                data: filteredSignal,
                color: 'blue',
                lineWidth: 1
            }
        ]
    });
}

function plotDiffAndSquare(diffSignal) {
    Highcharts.chart('diff-container', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Differentiated and Squared'
        },
        xAxis: {
            title: {
                text: 'Time (Samples)'
            }
        },
        yAxis: {
            title: {
                text: 'Amplitude'
            }
        },
        legend: {
            enabled: true
        },
        series: [
            {
                name: 'Differentiated and Squared Signal',
                data: diffSignal,
                color: 'blue',
                lineWidth: 1
            }
        ]
    });
}


function plotIntegral(integralSignal) {
    Highcharts.chart('integral-container', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Integrated'
        },
        xAxis: {
            title: {
                text: 'Time (Samples)'
            }
        },
        yAxis: {
            title: {
                text: 'Amplitude'
            }
        },
        legend: {
            enabled: true
        },
        series: [
            {
                name: 'Integrated Signal',
                data: integralSignal,
                color: 'blue',
                lineWidth: 1
            }
        ]
    });
}

function plotPeaks(peaks, integralSignal) {
    Highcharts.chart('peaks-container', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Integrated Signal with Peaks'
        },
        xAxis: {
            title: {
                text: 'Time (Samples)'
            }
        },
        yAxis: {
            title: {
                text: 'Amplitude'
            }
        },
        legend: {
            enabled: true
        },
        series: [
            {
                name: 'Integrated Signal',
                data: integralSignal,
                color: 'blue',
                lineWidth: 1
            },
            {
                type: 'scatter',
                name: 'Peaks',
                data: peaks.map(index => [index, integralSignal[index]]),
                color: 'red',
                marker: {
                    radius: 4
                }
            }
        ]
    });
}

function plotTachogram(tachogram) {
    Highcharts.chart('tachogram-container', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Tachogram'
        },
        xAxis: {
            title: {
                text: 'Time (Beats)'
            }
        },
        yAxis: {
            title: {
                text: 'RR Interval (s)'
            }
        },
        legend: {
            enabled: true
        },
        series: [
            {
                name: 'RR Intervals',
                data: tachogram,
                color: 'blue',
                lineWidth: 1
            }
        ]
    });
}

async function fetchECGSignal() {
    const response = await fetch('ECG_signal.json');
    if (!response.ok) {
        throw new Error(`Failed to load ECG_signal.json: ${response.statusText}`);
    }
    return await response.json();
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


function max(signal) {
    let maxVal = signal[0];
    for (let i = 1; i < signal.length; i++) {
        if (signal[i] > maxVal) {
            maxVal = signal[i];
        }
    }
    return maxVal;
}

function findPeaks(signal, windowSize, threshold) {
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

function calculateTachogram(peaks, sample_rate) {
    const tachogram = [];
    for (let i = 1; i < peaks.length; i++) {
        const RR = (peaks[i] - peaks[i - 1]) / sample_rate;
        tachogram.push(RR);
    }
    return tachogram;
}

function mean(signal) {
    return signal.reduce((a, b) => a + b) / signal.length;
}

function slidingWindowIntegration(signal, samplePeriod, windowSize) {

    const integralSignal = [];
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
        integralSignal.push(mean(window));
    }

    return integralSignal;

}

async function main() {
    try {
        const SAMPLE_RATE = 256;
        const SAMPLE_PERIOD = 1 / SAMPLE_RATE;

        const rawSignal = await fetchECGSignal();
        const filteredSignal = applyMovingAverage(rawSignal);
        const diffSignal = diffAndSquare(filteredSignal);
        const integralSignal = slidingWindowIntegration(diffSignal, SAMPLE_PERIOD, 0.055);
        const peaks = findPeaks(integralSignal, 120, 600);
        const tachogram = calculateTachogram(peaks, SAMPLE_RATE);
        plotECG(rawSignal);
        plotFilteredSignal(filteredSignal);
        plotDiffAndSquare(diffSignal);
        plotIntegral(integralSignal);
        plotPeaks(peaks, integralSignal);
        plotTachogram(tachogram.slice(1, tachogram.length));
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load or process ECG signal data. Check the console for details.');
    }
}

main();