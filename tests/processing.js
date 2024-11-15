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

function plotDiffAndSquare(signal) {
    Highcharts.chart('diff-container', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Differentiated and Squared ECG Signal'
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
                data: signal,
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

function diff_and_square(signal) {
    const diffSignal = [];

    for (let i = 0; i < signal.length - 1; i++) {
        diffSignal.push(Math.pow(signal[i + 1] - signal[i], 2));
    }

    return diffSignal;
}

async function main() {
    try {
        const rawSignal = await fetchECGSignal();
        console.log(rawSignal);
        const filteredSignal = applyMovingAverage(rawSignal);
        const diffSignal = diff_and_square(filteredSignal);
        
        plotECG(rawSignal);
        plotFilteredSignal(filteredSignal);
        plotDiffAndSquare(diffSignal);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load or process ECG signal data. Check the console for details.');
    }
}

main();