from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)

# DATA FOLDER AND FILE
DATA_FOLDER = "attendance_data"
FILE_PATH = os.path.join(DATA_FOLDER, "data.json")

# Ensure folder exists
os.makedirs(DATA_FOLDER, exist_ok=True)

# Ensure file exists
if not os.path.exists(FILE_PATH):
    with open(FILE_PATH, "w") as f:
        f.write("[]")  # empty list

# SAFE LOAD JSON
def load_data():
    try:
        with open(FILE_PATH, "r") as f:
            return json.load(f)
    except:
        with open(FILE_PATH, "w") as f:
            json.dump([], f)
        return []

# ROUTES
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

# RUN
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 1000))
    app.run(host="0.0.0.0", port=port)
