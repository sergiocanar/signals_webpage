import os
import re


def embed_files(html_file, css_file, js_file, output_file):
    with open(html_file, "r") as file:
        html_content = file.read()

    with open(css_file, "r", encoding="utf8") as file:
        css_content = file.read()

    with open(js_file, "r", encoding="utf8") as file:
        js_content = file.read()

    html_content = html_content.replace(
        '<link rel="stylesheet" href="styles.css">', f"<style>\n{css_content}\n</style>"
    )

    # Parse JavaScript content to delete docstrings
    js_content = re.sub(r"/\*.*?\*/", "", js_content, flags=re.DOTALL)
    js_content = re.sub(r"//.*", "", js_content)
    html_content = html_content.replace(
        "<script src='./scripts/main.js'></script>",
        f"<script>\n{js_content}\n</script>",
    )

    with open(output_file, "w", encoding="utf8") as file:
        file.write(html_content)

    print(f"HTML file '{output_file}' has been generated with embedded CSS and JS.")


def generate_arduino_from_html(html_file, output_file, wifi_ssid, wifi_password):
    with open(html_file, "r", encoding="utf8") as file:
        html_content = file.read()

    html_content = html_content.replace('"', "'").splitlines()

    arduino_code = f"""// Generated Arduino code for NodeMCU to serve an HTML page

#include <ESP8266WiFi.h> 
#include <Wire.h>

// WiFi config
const char* ssid = "{wifi_ssid}";  // WiFi Name
const char* password = "{wifi_password}";  // WiFi Password
WiFiServer server(80);

void setup() {{
    Serial.begin(9600);
    delay(10);

    // Connecting to WiFi
    Serial.print("Connecting to ");
    Serial.println(ssid); 
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {{
    delay(500);
    Serial.print(".");
    }}
    Serial.println("");
    Serial.println("WiFi connected");
    server.begin();
    Serial.println("Server started");
    Serial.print("Use this URL to connect: http://");
    Serial.println(WiFi.localIP());
}}

void loop() {{
    WiFiClient client = server.available();
    if (!client) {{
    return;
    }}

    Serial.println("New client connected");

    // Send headers
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println("Connection: close");
    client.println();

  // Send HTML content
"""

    # Convert HTML to client.print() statements
    for line in html_content:
        arduino_code += f'  client.print("{line}");\n'

    arduino_code += """
    client.println();
}
"""

    with open(output_file, "w") as file:
        file.write(arduino_code)

    print(f"Arduino code has been generated and saved to {output_file}.")


HTML_FILE = "index.html"
CSS_FILE = "styles.css"
JS_FILE = os.path.join("scripts", "main.js")
os.makedirs("embedded", exist_ok=True)
EMBEDDED_HTML_PATH = os.path.join("embedded", "index.html")
embed_files(HTML_FILE, CSS_FILE, JS_FILE, EMBEDDED_HTML_PATH)

ARDUINO_FILE = "web_server.ino"
ARDUINO_DIR = ARDUINO_FILE.split(".")[0]
os.makedirs(ARDUINO_DIR, exist_ok=True)
ARDUINO_PATH = os.path.join(ARDUINO_DIR, ARDUINO_FILE)

SSID = "ColdPalmer"
PASSWORD = "david4567"
generate_arduino_from_html(EMBEDDED_HTML_PATH, ARDUINO_PATH, SSID, PASSWORD)
