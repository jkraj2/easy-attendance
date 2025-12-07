document.addEventListener("DOMContentLoaded", function() {
    const calendarEl = document.getElementById("calendar");

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
        },
        events: "/events",
        eventClick: function(info) {
            // Popup Form
            const record = info.event.extendedProps;
            const popup = document.getElementById("form-popup");
            popup.style.display = "block";

            document.getElementById("userName").value = info.event.title.split(" - ")[0];
            document.getElementById("status").value = info.event.title.split(" - ")[1];
            document.getElementById("note").value = record.note || "";
            document.getElementById("comp_off").value = record.comp_off || "";
        }
    });

    calendar.render();
});

// Close popup
function closeForm() {
    document.getElementById("form-popup").style.display = "none";
}

// Submit attendance
function submitAttendance() {
    const data = {
        name: document.getElementById("userName").value,
        status: document.getElementById("status").value,
        note: document.getElementById("note").value,
        comp_off: document.getElementById("comp_off").value,
        date: new Date().toISOString().split("T")[0]
    };

    fetch("/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(d => {
        alert(d.message); // MIT Inventor WebView notification
        closeForm();
        location.reload(); // Refresh calendar to show new entry
    });
}

// Load users in popup dropdown
function loadUsers() {
    fetch("/users-list")
        .then(res => res.json())
        .then(users => {
            const dropdown = document.getElementById("userName");
            if (!dropdown) return;
            dropdown.innerHTML = `<option value="">Select User</option>`;
            users.forEach(u => {
                dropdown.innerHTML += `<option value="${u.name}">${u.name}</option>`;
            });
        });
}

document.addEventListener("DOMContentLoaded", loadUsers);
