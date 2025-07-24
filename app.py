from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)
DATA_FOLDER = 'attendance_data'
DATA_FILE = os.path.join(DATA_FOLDER, 'data.json')

# Ensure directory and file exist
os.makedirs(DATA_FOLDER, exist_ok=True)
if not os.path.isfile(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump({}, f)

def load_data():
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print("Error loading data:", e)
        return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def home():
    return render_template('calendar.html')

@app.route('/events')
def get_events():
    try:
        data = load_data()
        events = []
        for date, records in data.items():
            for name, info in records.items():
                events.append({
                    "title": f"{name} - {info.get('status', '')}",
                    "start": date,
                    "color": info.get("color", "gray")
                })
        return jsonify(events)
    except Exception as e:
        print("Error in /events:", e)
        return jsonify([]), 500

@app.route('/mark', methods=['POST'])
def mark_attendance():
    try:
        req = request.get_json(force=True)
        print("Received POST data:", req)

        date = req['date']
        name = req['name']
        status = req['status']
        note = req.get('note', '')
        comp_off = req.get('comp_off', '')

        color_map = {
            "Present": "green",
            "Absent": "red",
            "Half Day": "yellow",
            "PL": "orange",
            "SL": "purple",
            "Comp-Off": "blue"
        }

        data = load_data()
        if date not in data:
            data[date] = {}
        data[date][name] = {
            "status": status,
            "color": color_map.get(status, "gray"),
            "note": note,
            "comp_off_comment": comp_off
        }
        save_data(data)
        return jsonify({"message": "Saved successfully!"})
    except Exception as e:
        print("Error in /mark:", e)
        return jsonify({"error": "Server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
