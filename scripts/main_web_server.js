MAX_BUFFER_SIZE = 10;
buffer = [];

function updateBuffer(sensorValue) {
    buffer.push(sensorValue);
    if (buffer.length > MAX_BUFFER_SIZE) {
        buffer.shift();
    }
    console.log(buffer);
}

function fetchSensorValue() {
    fetch('/sensorValue')
        .then(response => response.text())
        .then(sensorValue => {
            sensorValue = parseInt(sensorValue);
            document.getElementById('sensor-value').innerHTML = sensorValue;
            updateBuffer(sensorValue);
            document.getElementById('buffer-size').innerHTML = buffer.length;
        })
        .catch(error => console.error('Error fetching sensor value:', error));
}

// Fetch sensor value every second
setInterval(fetchSensorValue, 200);