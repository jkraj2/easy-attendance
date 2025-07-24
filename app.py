from flask import Flask, render_template, request, redirect, send_file
import os
import pandas as pd
from datetime import datetime

app = Flask(__name__)
DATA_FOLDER = 'attendance_data'
os.makedirs(DATA_FOLDER, exist_ok=True)

# Home page - Mark attendance
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name'].strip().title()
        if name:
            date_str = datetime.now().strftime('%Y-%m-%d')
            file_path = os.path.join(DATA_FOLDER, f'{date_str}.csv')
            now_time = datetime.now().strftime('%H:%M:%S')

            # If file exists, append; else, create
            if os.path.exists(file_path):
                df = pd.read_csv(file_path)
                if name not in df['Name'].values:
                    df = pd.concat([df, pd.DataFrame([[name, now_time]], columns=['Name', 'Time'])], ignore_index=True)
                    df.to_csv(file_path, index=False)
            else:
                df = pd.DataFrame([[name, now_time]], columns=['Name', 'Time'])
                df.to_csv(file_path, index=False)

        return redirect('/')

    return render_template('index.html')

# View attendance
@app.route('/view')
def view():
    date = request.args.get('date') or datetime.now().strftime('%Y-%m-%d')
    file_path = os.path.join(DATA_FOLDER, f'{date}.csv')
    data = []
    if os.path.exists(file_path):
        data = pd.read_csv(file_path).to_dict(orient='records')
    return render_template('view.html', data=data, date=date)

# Export CSV
@app.route('/export')
def export():
    date = request.args.get('date') or datetime.now().strftime('%Y-%m-%d')
    file_path = os.path.join(DATA_FOLDER, f'{date}.csv')
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
        if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Render provides PORT env var
    app.run(debug=False, host='0.0.0.0', port=port)
    return 'No data for selected date', 404

if __name__ == '__main__':
    app.run(debug=True)

