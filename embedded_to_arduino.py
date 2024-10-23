import os
from arduino_script_generator import generate_arduino_from_html

os.makedirs("embedded", exist_ok=True)
EMBEDDED_HTML_PATH = os.path.join("embedded", "index.html")

ARDUINO_FILE = "web_server.ino"
ARDUINO_DIR = ARDUINO_FILE.split(".")[0]
os.makedirs(ARDUINO_DIR, exist_ok=True)
ARDUINO_PATH = os.path.join(ARDUINO_DIR, ARDUINO_FILE)

SSID = "ColdPalmer"
PASSWORD = "david4567"
generate_arduino_from_html(EMBEDDED_HTML_PATH, ARDUINO_PATH, SSID, PASSWORD)


