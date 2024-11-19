#include <ESP8266WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ESPAsyncTCP.h>
#include "index_html.h"

const char *SSID = "ColdPalmer";
const char *PASSWORD = "david4567";

const unsigned long SAMPLE_PERIOD_MS = 5;
const unsigned int REQUEST_INTERVAL_MS = 200;
const unsigned int BUFFER_SIZE = REQUEST_INTERVAL_MS / SAMPLE_PERIOD_MS;

float dataBuffer[BUFFER_SIZE];
unsigned long lastReadingTime = 0;

AsyncWebServer server(80);

void readSensorValue();

void setup() {
  Serial.begin(9600);
  Serial.println();

  Serial.print("Connecting to ");
  Serial.println(SSID);
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected");

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/html", index_html);
  });

  server.on("/request_interval_ms", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/plain", String(REQUEST_INTERVAL_MS).c_str());
  });
  
  server.on("/sample_period", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/plain", String(SAMPLE_PERIOD_MS).c_str());
  });

  server.on("/buffer", HTTP_GET, [](AsyncWebServerRequest *request) {
    String bufferStr = "";
    for (int i = 0; i < BUFFER_SIZE; i++) {
      bufferStr += String(dataBuffer[i]);
      if (i < BUFFER_SIZE - 1) {
        bufferStr += ",";
      }
    }
    request->send(200, "text/plain", bufferStr.c_str());
  });

  server.begin();

  Serial.println("Server started");
  Serial.print("Use this URL to connect: http://");
  Serial.println(WiFi.localIP());
}

void loop() {
  readSensorValue();
}

void readSensorValue() {
  if ((millis() - lastReadingTime) > SAMPLE_PERIOD_MS) {
    float sensorValue = 1000 * (float)analogRead(A0) * (3.3 / 1024);  // en mV
    for (int i = 0; i < BUFFER_SIZE - 1; i++) {
      dataBuffer[i] = dataBuffer[i + 1];
    }
    dataBuffer[BUFFER_SIZE - 1] = sensorValue;
    lastReadingTime = millis();
  }
}
