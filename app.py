from flask import Flask, render_template, request, jsonify
import json, os

app = Flask(__name__)

DATA_FILE = "attendance_data/attendance.json"

# Ensure file exists
os.makedirs("attendance_data", exist_ok=True)
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/calendar")
def calendar_page():
    return render_template("calendar.html")


@app.route("/view")
def view_page():
    data = load_data()
    return render_template("view.html", records=data)


@app.route("/events")
def events():
    data = load_data()

    # Convert to FullCalendar event format
    events_list = []
    for entry in data:
        color = "#27ae60" if entry["status"] == "Present" else (
                "#e74c3c" if entry["status"] == "Absent" else "#f1c40f"
        )

        events_list.append({
            "title": f"{entry['name']} - {entry['status']}",
            "start": entry["date"],
            "color": color
        })

    return jsonify(events_list)


@app.route("/mark", methods=["POST"])
def mark_attendance():
    req = request.get_json()
    data = load_data()
    data.append(req)
    save_data(data)
    return jsonify({"message": "Attendance Saved!"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
