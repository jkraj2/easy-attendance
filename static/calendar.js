let selectedDate = "";

document.addEventListener('DOMContentLoaded', function () {
    let calendarEl = document.getElementById('calendar');

    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',

        dateClick: function (info) {
            selectedDate = info.dateStr;
            document.getElementById("form-popup").style.display = "block";
        },

        events: "/events"
    });

    calendar.render();
});

// Close popup
function closeForm() {
    document.getElementById("form-popup").style.display = "none";
}

// SUBMIT ATTENDANCE
function submitAttendance() {
    let name = document.getElementById("userName").value;
    let status = document.getElementById("status").value;
    let note = document.getElementById("note").value;
    let comp = document.getElementById("comp_off").value;

    if (name === "") {
        alert("Please select a user.");
        return;
    }

    if (!selectedDate) {
        alert("Date not selected!");
        return;
    }

    let record = {
        name: name,
        status: status,
        note: note,
        comp_off: comp,
        date: selectedDate
    };

    fetch("/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
    })
    .then(res => res.json())
    .then(d => {
        alert(d.message);
        closeForm();
        location.reload(); // Refresh to show new attendance
    });
}
