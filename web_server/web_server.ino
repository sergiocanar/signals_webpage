#include <ESP8266WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ESPAsyncTCP.h>
#include "index_html.h"

const char *SSID = "Familia Lozano_2.4-Etb";
const char *PASSWORD = "enzo2021";

const unsigned long TIMER_DELAY = 10;
unsigned long lastReadingTime = 0;
String sensorValue = "0";

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

  server.on("/sensorValue", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/plain", sensorValue.c_str());
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
  if ((millis() - lastReadingTime) > TIMER_DELAY) {
    sensorValue = String(analogRead(A0));
    lastReadingTime = millis();
  }
}
