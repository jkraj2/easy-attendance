
let selectedDate = null;

document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
        },
        dateClick: function (info) {
            selectedDate = info.dateStr;
            document.getElementById("form-popup").style.display = "block";
        },
        events: "/events"
    });

    calendar.render();
});

function closeForm() {
    document.getElementById("form-popup").style.display = "none";
}

function submitAttendance() {
    const name = document.getElementById("name").value;
    const status = document.getElementById("status").value;
    const note = document.getElementById("note").value;
    const comp_off = document.getElementById("comp_off").value;

    fetch("/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: selectedDate,
            name,
            status,
            note,
            comp_off
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Saved!");
        closeForm();
        location.reload();
    });
}
