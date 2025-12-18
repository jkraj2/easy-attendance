from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Data directory setup
DATA_DIR = 'attendance_data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

DATA_FILE = os.path.join(DATA_DIR, 'data.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

# Initialize data files with sample data
def init_data_files():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            json.dump([], f)
    if not os.path.exists(USERS_FILE):
        # Add sample users
        sample_users = [
            {"name": "John Doe", "email": "john@example.com", "created_at": datetime.now().isoformat()},
            {"name": "Jane Smith", "email": "jane@example.com", "created_at": datetime.now().isoformat()}
        ]
        with open(USERS_FILE, 'w') as f:
            json.dump(sample_users, f, indent=2)

init_data_files()

# Helper functions
def load_data():
    try:
        with open(DATA_FILE, 'r') as f:
            content = f.read()
            if not content.strip():
                return []
            return json.loads(content)
    except Exception as e:
        print(f"Error loading data: {e}")
        return []

def save_data(data):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

def load_users():
    try:
        with open(USERS_FILE, 'r') as f:
            content = f.read()
            if not content.strip():
                return []
            return json.loads(content)
    except Exception as e:
        print(f"Error loading users: {e}")
        return []

def save_users(users):
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving users: {e}")
        return False

# Routes
@app.route('/')
def index():
    users = load_users()
    return render_template('index.html', users=users)

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    try:
        data = request.get_json()
        name = data.get('name')
        status = data.get('status', 'present')
        
        if not name:
            return jsonify({'success': False, 'message': 'Name is required'}), 400
        
        attendance_record = {
            'name': name,
            'status': status,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': datetime.now().strftime('%H:%M:%S'),
            'timestamp': datetime.now().isoformat()
        }
        
        records = load_data()
        records.append(attendance_record)
        
        if save_data(records):
            return jsonify({'success': True, 'message': 'Attendance marked successfully'})
        else:
            return jsonify({'success': False, 'message': 'Error saving attendance'}), 500
            
    except Exception as e:
        print(f"Error in mark_attendance: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/all_records')
def all_records():
    records = load_data()
    return render_template('all_records.html', records=records)

@app.route('/calendar')
def calendar():
    records = load_data()
    return render_template('calendar.html', records=records)

@app.route('/user/<username>')
def user(username):
    records = load_data()
    user_records = [r for r in records if r.get('name') == username]
    return render_template('user.html', username=username, records=user_records)

@app.route('/view')
def view():
    records = load_data()
    return render_template('view.html', records=records)

@app.route('/view_users')
def view_users():
    users = load_users()
    return render_template('view_users.html', users=users)

@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        
        if not name:
            return jsonify({'success': False, 'message': 'Name is required'}), 400
        
        users = load_users()
        
        # Check if user already exists
        if any(u.get('name', '').lower() == name.lower() for u in users):
            return jsonify({'success': False, 'message': 'User already exists'}), 400
        
        user = {
            'name': name,
            'email': email,
            'created_at': datetime.now().isoformat()
        }
        
        users.append(user)
        
        if save_users(users):
            return jsonify({'success': True, 'message': 'User added successfully', 'user': user})
        else:
            return jsonify({'success': False, 'message': 'Error saving user'}), 500
            
    except Exception as e:
        print(f"Error in add_user: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/delete_user', methods=['POST'])
def delete_user():
    try:
        data = request.get_json()
        name = data.get('name')
        
        if not name:
            return jsonify({'success': False, 'message': 'Name is required'}), 400
        
        users = load_users()
        original_length = len(users)
        users = [u for u in users if u.get('name') != name]
        
        if len(users) == original_length:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        if save_users(users):
            return jsonify({'success': True, 'message': 'User deleted successfully'})
        else:
            return jsonify({'success': False, 'message': 'Error deleting user'}), 500
            
    except Exception as e:
        print(f"Error in delete_user: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/get_records')
def get_records():
    records = load_data()
    return jsonify(records)

@app.route('/get_users')
def get_users():
    users = load_users()
    return jsonify(users)

@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy-policy.html')

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/delete_record', methods=['POST'])
def delete_record():
    try:
        data = request.get_json()
        timestamp = data.get('timestamp')
        
        if not timestamp:
            return jsonify({'success': False, 'message': 'Timestamp is required'}), 400
        
        records = load_data()
        original_length = len(records)
        records = [r for r in records if r.get('timestamp') != timestamp]
        
        if len(records) == original_length:
            return jsonify({'success': False, 'message': 'Record not found'}), 404
        
        if save_data(records):
            return jsonify({'success': True, 'message': 'Record deleted successfully'})
        else:
            return jsonify({'success': False, 'message': 'Error deleting record'}), 500
            
    except Exception as e:
        print(f"Error in delete_record: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Health check endpoint for Render
@app.route('/health')
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
