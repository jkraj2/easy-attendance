from flask import Flask, render_template, jsonify, request
import json, os

app = Flask(__name__)

DATA_FILE = "attendance_data/data.json"

# ----------------- LOAD DATA -----------------
def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except:
        return []


# ----------------- SAVE DATA -----------------
def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)


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
    data = load_data()

    # Sort by date (newest first)
    data_sorted = sorted(data, key=lambda x: x["date"], reverse=True)

    return render_template("all_records.html", records=data_sorted)



# ---------- API: GET EVENTS FOR CALENDAR ----------
@app.route("/events")
def events():
    events = []
    data = load_data()

    for rec in data:
        events.append({
            "title": f"{rec['name']} - {rec['status']}",
            "start": rec["date"],
            "extendedProps": {
                "note": rec["note"],
                "comp_off": rec["comp_off"]
            }
        })

    return jsonify(events)

@app.route("/user")
def user_page():
    return render_template("user.html")

# Save User
@app.route("/save-user", methods=["POST"])
def save_user():
    data = request.json

    if os.path.exists(USER_FILE):
        with open(USER_FILE, "r") as f:
            users = json.load(f)
    else:
        users = []

    users.append(data)

    with open(USER_FILE, "w") as f:
        json.dump(users, f, indent=2)

    return jsonify({"message": "User Saved Successfully!"})


# ---------- API: SAVE ATTENDANCE ----------
@app.route("/mark", methods=["POST"])
def mark():
    record = request.json
    data = load_data()
    data.append(record)           # Add new record FOREVER
    save_data(data)

    return jsonify({"message": "Attendance saved successfully!"})


# ----------------- RENDER PORT FIX FOR RENDER.COM -----------------
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
