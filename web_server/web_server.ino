#include <ESP8266WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ESPAsyncTCP.h>
#include "index_html.h"

const char *SSID = "sergi";
const char *PASSWORD = "sergio17";

const unsigned long TIMER_DELAY_MS = 5;
const unsigned int REQUEST_INTERVAL_MS = 500;
const unsigned int BUFFER_SIZE = REQUEST_INTERVAL_MS / TIMER_DELAY_MS;

float buffer[BUFFER_SIZE];
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

  server.on("/buffer", HTTP_GET, [](AsyncWebServerRequest *request) {
    String json = "[";
    for (int i = 0; i < 250; i++) {
      json += String(buffer[i]);
      if (i < 249) {
        json += ",";
      }
    }
    json += "]";
    request->send(200, "application/json", json);
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
  if ((millis() - lastReadingTime) > TIMER_DELAY_MS) {
    float sensorValue = (float) analogRead(A0) * (3.3 / 1024) ;
    for (int i = 0; i < BUFFER_SIZE - 1; i++) {
      buffer[i] = buffer[i+1];
    }
    buffer[BUFFER_SIZE - 1] = sensorValue;
    lastReadingTime = millis();
  }
}
