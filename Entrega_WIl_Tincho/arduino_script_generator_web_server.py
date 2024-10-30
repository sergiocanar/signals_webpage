import os
import re


def embed_files(html_file, css_file, js_file, output_file):
    with open(html_file, "r", encoding="utf8") as file:
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
    js_file_path = "/".join(js_file.split(os.sep))
    html_content = html_content.replace(
        f"<script src='./{js_file_path}'></script>",
        f"<script>\n{js_content}\n</script>",
    )

    with open(output_file, "w", encoding="utf8") as file:
        file.write(html_content)

    print(f"HTML file '{output_file}' has been generated with embedded CSS and JS.")


def generate_header_file(html_file, output_file):
    with open(html_file, "r", encoding="utf8") as file:
        html_content = file.read()

    html_content = html_content.replace('"', "'")

    arduino_code = f"""// Generated header file with HTML content for NodeMCU to serve an HTML page

#ifndef INDEX_HTML_H
#define INDEX_HTML_H

#include <pgmspace.h> // Required to use PROGMEM on ESP8266/ESP32

const char index_html[] PROGMEM = R"rawliteral(
"""

    arduino_code += html_content

    arduino_code += """
)rawliteral";

#endif // INDEX_HTML_H
"""

    with open(output_file, "w", encoding="utf8") as file:
        file.write(arduino_code)

    print(f"Arduino code has been generated and saved to {output_file}.")


if __name__ == "__main__":
    HTML_FILE = "index.html"
    CSS_FILE = "styles.css"
    JS_FILE = os.path.join("scripts", "main2.js")
    print(JS_FILE)
    os.makedirs("embedded", exist_ok=True)
    EMBEDDED_HTML_PATH = os.path.join("embedded", "index.html")
    embed_files(HTML_FILE, CSS_FILE, JS_FILE, EMBEDDED_HTML_PATH)

    HEADER_FILE = "index_html.h"
    ARDUINO_DIR = "web_server"
    os.makedirs(ARDUINO_DIR, exist_ok=True)
    ARDUINO_PATH = os.path.join(ARDUINO_DIR, HEADER_FILE)

    generate_header_file(EMBEDDED_HTML_PATH, ARDUINO_PATH)
