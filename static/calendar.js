function initCalendar(records) {
    const calendar = document.getElementById('calendar');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Group records by date
    const recordsByDate = {};
    records.forEach(record => {
        const date = record.date;
        if (!recordsByDate[date]) {
            recordsByDate[date] = [];
        }
        recordsByDate[date].push(record);
    });

    // Create calendar HTML
    let html = '<div class="calendar-header">';
    html += `<h3>${getMonthName(currentMonth)} ${currentYear}</h3>`;
    html += '</div>';
    html += '<div class="calendar-grid">';
    html += '<div class="calendar-day-header">Sun</div>';
    html += '<div class="calendar-day-header">Mon</div>';
    html += '<div class="calendar-day-header">Tue</div>';
    html += '<div class="calendar-day-header">Wed</div>';
    html += '<div class="calendar-day-header">Thu</div>';
    html += '<div class="calendar-day-header">Fri</div>';
    html += '<div class="calendar-day-header">Sat</div>';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasRecords = recordsByDate[dateStr] && recordsByDate[dateStr].length > 0;
        const isToday = day === currentDate.getDate();
        
        html += `<div class="calendar-day ${hasRecords ? 'has-records' : ''} ${isToday ? 'today' : ''}" onclick="showDayRecords('${dateStr}')">`;
        html += `<div class="day-number">${day}</div>`;
        if (hasRecords) {
            html += `<div class="record-count">${recordsByDate[dateStr].length}</div>`;
        }
        html += '</div>';
    }

    html += '</div>';
    calendar.innerHTML = html;

    // Add calendar styles
    const style = document.createElement('style');
    style.textContent = `
        .calendar-header {
            text-align: center;
            margin-bottom: 1rem;
            padding: 1rem;
            background: var(--bg-color);
            border-radius: 0.375rem;
        }
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0.5rem;
        }
        .calendar-day-header {
            text-align: center;
            font-weight: 600;
            padding: 0.5rem;
            color: var(--text-secondary);
        }
        .calendar-day {
            aspect-ratio: 1;
            border: 1px solid var(--border-color);
            border-radius: 0.375rem;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .calendar-day:hover {
            background: var(--bg-color);
            transform: scale(1.05);
        }
        .calendar-day.empty {
            border: none;
            cursor: default;
        }
        .calendar-day.empty:hover {
            background: transparent;
            transform: none;
        }
        .calendar-day.today {
            border-color: var(--primary-color);
            background: rgba(79, 70, 229, 0.1);
        }
        .calendar-day.has-records {
            background: rgba(16, 185, 129, 0.1);
            border-color: var(--success-color);
        }
        .day-number {
            font-weight: 600;
        }
        .record-count {
            font-size: 0.75rem;
            color: var(--success-color);
            font-weight: 600;
            text-align: right;
        }
    `;
    document.head.appendChild(style);

    // Store records globally for showDayRecords function
    window.calendarRecords = recordsByDate;
}

function showDayRecords(date) {
    const records = window.calendarRecords[date];
    const dayRecordsDiv = document.getElementById('dayRecords');
    const selectedDateSpan = document.getElementById('selectedDate');
    const recordsList = document.getElementById('recordsList');

    if (!records || records.length === 0) {
        return;
    }

    selectedDateSpan.textContent = formatDate(date);
    
    let html = '<div class="table-responsive"><table>';
    html += '<thead><tr><th>Name</th><th>Status</th><th>Time</th></tr></thead>';
    html += '<tbody>';
    
    records.forEach(record => {
        html += '<tr>';
        html += `<td>${record.name}</td>`;
        html += `<td><span class="status-badge status-${record.status}">${capitalize(record.status)}</span></td>`;
        html += `<td>${record.time}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    recordsList.innerHTML = html;
    dayRecordsDiv.style.display = 'block';
}

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
