from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)

# Use /tmp folder on Render for safe writing
FILE_PATH = os.path.join("/tmp", "data.json")

# Ensure file exists
if not os.path.exists(FILE_PATH):
    with open(FILE_PATH, "w") as f:
        json.dump([], f)

# SAFE LOAD DATA
def load_data():
    try:
        with open(FILE_PATH, "r") as f:
            return json.load(f)
    except:
        with open(FILE_PATH, "w") as f:
            json.dump([], f)
        return []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/calendar")
def calendar_page():
    return render_template("calendar.html")

@app.route("/view")
def view_page():
    return render_template("view.html")

@app.route("/events")
def get_events():
    return jsonify(load_data())

@app.route("/mark", methods=["POST"])
def mark_attendance():
    try:
        data = request.json
        if not data.get("name") or not data.get("date"):
            return jsonify({"message": "Name and Date are required"}), 400

        events = load_data()

        new_event = {
            "title": f"{data['name']} - {data['status']}",
            "start": data["date"],
            "extendedProps": {
                "note": data.get("note", ""),
                "comp_off": data.get("comp_off", "")
            }
        }

        events.append(new_event)

        with open(FILE_PATH, "w") as f:
            json.dump(events, f, indent=2)

        return jsonify({"message": "Attendance Saved Successfully"})
    except Exception as e:
        print("ERROR:", e)
        return jsonify({"message": "Server Error", "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
