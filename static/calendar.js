let selectedDate = null;

document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        selectable: true,
        height: "auto",
        events: "/events",

        dateClick: function (info) {
            selectedDate = info.dateStr;
            document.getElementById("form-popup").style.display = "block";
        }
    });

    calendar.render();
});

function closeForm() {
    document.getElementById("form-popup").style.display = "none";
}

function submitAttendance() {
    if (!selectedDate) {
        alert("Please select a date on the calendar first.");
        return;
    }

    const payload = {
        date: selectedDate,
        name: document.getElementById("name").value,
        status: document.getElementById("status").value,
        note: document.getElementById("note").value,
        comp_off: document.getElementById("comp_off").value
    };

    fetch("/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        closeForm();
        location.reload();
    })
    .catch(err => {
        alert("Error saving attendance");
        console.error(err);
    });
}
