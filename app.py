from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)

# Folder to store data
DATA_FOLDER = "attendance_data"
FILE_PATH = os.path.join(DATA_FOLDER, "data.json")

os.makedirs(DATA_FOLDER, exist_ok=True)

# Create file if not exists
if not os.path.exists(FILE_PATH):
    with open(FILE_PATH, "w") as f:
        json.dump([], f)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/calendar")
def calendar_page():
    return render_template("calendar.html")


@app.route("/view")
def view_page():
    return render_template("view.html")


@app.route("/events")
def get_events():
    with open(FILE_PATH, "r") as f:
        events = json.load(f)
    return jsonify(events)


@app.route("/mark", methods=["POST"])
def mark_attendance():
    data = request.json

    with open(FILE_PATH, "r") as f:
        events = json.load(f)

    # Create event to display on calendar
    event = {
        "title": f"{data['name']} - {data['status']}",
        "start": data["date"],
        "extendedProps": {
            "note": data.get("note"),
            "comp_off": data.get("comp_off")
        }
    }

    events.append(event)

    with open(FILE_PATH, "w") as f:
        json.dump(events, f, indent=2)

    return jsonify({"message": "Attendance Saved Successfully"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 1000))
    app.run(host="0.0.0.0", port=port)
