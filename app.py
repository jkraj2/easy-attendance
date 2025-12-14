from flask import Flask, render_template, jsonify, request
import json, os

app = Flask(__name__)

DATA_FILE = "attendance_data/data.json"
USER_FILE = "attendance_data/users.json"

# ----------------- HELPER FUNCTIONS -----------------
def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_data(data):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def load_users():
    if not os.path.exists(USER_FILE):
        return []
    try:
        with open(USER_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_users(users):
    os.makedirs(os.path.dirname(USER_FILE), exist_ok=True)
    with open(USER_FILE, "w") as f:
        json.dump(users, f, indent=4)

# ----------------- ROUTES -----------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/calendar")
def calendar():
    return render_template("calendar.html")

@app.route("/view")
def view():
    records = load_data()
    return render_template("view.html", records=records)

@app.route("/all-records")
def all_records():
    return render_template("all_records.html")

@app.route("/user")
def user_page():
    return render_template("user.html")

@app.route("/view-users")
def view_users():
    if os.path.exists(USER_FILE):
        with open(USER_FILE, "r") as f:
            users = json.load(f)
    else:
        users = []
    return render_template("view_users.html", users=users)


# ----------------- API ENDPOINTS -----------------
@app.route("/save-user", methods=["POST"])
def save_user():
    data = request.json
    users = load_users()
    users.append(data)
    save_users(users)
    return jsonify({"message": "User saved successfully!"})

@app.route("/users-list")
def users_list():
    users = load_users()
    return jsonify(users)

@app.route("/mark", methods=["POST"])
def mark_attendance():
    record = request.json
    data = load_data()
    data.append(record)
    save_data(data)
    return jsonify({"message": "Attendance saved successfully!"})

@app.route("/events")
def events():
    data = load_data()
    events = []
    for rec in data:
        events.append({
            "title": f"{rec['name']} - {rec['status']}",
            "start": rec["date"],
            "extendedProps": {
                "note": rec.get("note", ""),
                "comp_off": rec.get("comp_off", "")
            }
        })
    return jsonify(events)

@app.route("/all-records-json")
def all_records_json():
    data = load_data()
    return jsonify({"records": data})

@app.route("/all-users-json")
def all_users_json():
    users = load_users()
    return jsonify({"users": users})

@app.route("/privacy-policy")
def privacy_policy():
    return render_template("privacy-policy.html")


# ----------------- RUN SERVER -----------------
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
