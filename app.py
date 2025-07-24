from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)
DATA_FILE = 'attendance_data/data.json'


# Ensure file exists
os.makedirs('attendance_data', exist_ok=True)
if not os.path.isfile(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump({}, f)

def load_data():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calendar')
def calendar():
    return render_template('calendar.html')

@app.route('/events')
def get_events():
    data = load_data()
    events = []
    for date, records in data.items():
        for name, info in records.items():
            events.append({
                "title": f"{name} - {info['status']}",
                "start": date,
                "color": info.get("color", "gray")
            })
    return jsonify(events)

@app.route('/mark', methods=['POST'])
def mark_attendance():
    req = request.json
    date = req['date']
    name = req['name']
    status = req['status']
    note = req.get('note', '')
    comp_off = req.get('comp_off', '')
    
    # Status → color mapping
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
