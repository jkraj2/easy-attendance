let records = [];

// Load data from API
async function loadData() {
  try {
    const res = await fetch("/events");
    const data = await res.json();

    // Convert data to full table format
    records = data.map(rec => ({
      date: rec.start,
      name: rec.title.split(" - ")[0],
      status: rec.title.split(" - ")[1],
      shift: rec.extendedProps.shift || "",
      moreOptions: rec.extendedProps.moreOptions || "",
      leave: rec.extendedProps.leave || "",
      note: rec.extendedProps.note || ""
    }));

    populateNameFilter();
    renderTable(records);
  } catch (err) {
    console.error("Error loading events:", err);
    document.getElementById("tableBody").innerHTML = "<tr><td colspan='7'>Error loading data.</td></tr>";
  }
}

// Populate name filter dropdown
function populateNameFilter() {
  const nameFilter = document.getElementById("nameFilter");
  const names = [...new Set(records.map(r => r.name))];
  names.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n; opt.textContent = n;
    nameFilter.appendChild(opt);
  });
}

// Render table
function renderTable(data) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.name}</td>
      <td><span class="status-pill ${r.status}">${r.status}</span></td>
      <td>${r.shift}</td>
      <td>${r.moreOptions}</td>
      <td>${r.leave}</td>
      <td>${r.note}</td>
    `;
    tbody.appendChild(tr);
  });
  updateSummary(data);
}

// Summary counts
function updateSummary(data) {
  document.getElementById("totalCount").textContent = data.length;
  document.getElementById("countPresent").textContent = data.filter(r => r.status === "Present").length;
  document.getElementById("countAbsent").textContent = data.filter(r => r.status === "Absent").length;
  document.getElementById("countHalf").textContent = data.filter(r => r.status === "Half-Day").length;
  document.getElementById("countOther").textContent = data.filter(r => ["PL","SL","Comp-Off"].includes(r.status)).length;
}

// Filters
document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("statusFilter").addEventListener("change", applyFilters);
document.getElementById("nameFilter").addEventListener("change", applyFilters);
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "ALL";
  document.getElementById("nameFilter").value = "ALL";
  applyFilters();
});

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const name = document.getElementById("nameFilter").value;

  const filtered = records.filter(r => {
    return (status === "ALL" || r.status === status) &&
           (name === "ALL" || r.name === name) &&
           (r.name.toLowerCase().includes(search) || r.note.toLowerCase().includes(search) || r.status.toLowerCase().includes(search));
  });

  renderTable(filtered);
}

// Load on DOM
document.addEventListener("DOMContentLoaded", loadData);
