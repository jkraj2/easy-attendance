// all_records.js - client-side only (Option A)
// Works with your /events endpoint that returns an array of events
// Each event expected format:
// {
//   "title": "Name - Status",
//   "start": "YYYY-MM-DD",
//   "extendedProps": { "note": "...", "comp_off": "..." }
// }

let rawRecords = [];        // original fetched records
let filtered = [];          // after search & filters
let currentPage = 1;
const pageSize = 25;
let currentSort = { key: 'start', dir: 'desc' };

const el = {
  body: document.getElementById('tableBody'),
  search: document.getElementById('searchInput'),
  status: document.getElementById('statusFilter'),
  name: document.getElementById('nameFilter'),
  from: document.getElementById('fromDate'),
  to: document.getElementById('toDate'),
  clear: document.getElementById('clearFilters'),
  pagination: document.getElementById('pagination'),
  totalCount: document.getElementById('totalCount'),
  countPresent: document.getElementById('countPresent'),
  countAbsent: document.getElementById('countAbsent'),
  countHalf: document.getElementById('countHalf'),
  countOther: document.getElementById('countOther'),
  exportCsv: document.getElementById('exportCsv'),
  exportExcel: document.getElementById('exportExcel'),
  exportPdf: document.getElementById('exportPdf'),
  tableHeaders: document.querySelectorAll('#recordsTable thead th')
};

function parseRecords(events) {
  // convert your /events item to normalized rows
  return events.map(ev => {
    // title assumed as "Name - Status" but we must be robust
    let name = '';
    let status = '';
    if (ev.title && ev.title.includes(' - ')) {
      const idx = ev.title.lastIndexOf(' - ');
      name = ev.title.slice(0, idx).trim();
      status = ev.title.slice(idx + 3).trim();
    } else {
      name = (ev.extendedProps && ev.extendedProps.name) || (ev.name || '');
      status = ev.status || '';
    }

    return {
      date: ev.start || ev.date || '',
      start: ev.start || ev.date || '',
      name: name || '—',
      status: status || (ev.title || '—'),
      note: (ev.extendedProps && ev.extendedProps.note) || '',
      comp_off: (ev.extendedProps && ev.extendedProps.comp_off) || ''
    };
  });
}

async function loadData() {
  try {
    const res = await fetch('/events');
    const events = await res.json();
    rawRecords = parseRecords(events);
    initFilters();
    applyAll();
  } catch (err) {
    console.error('Error loading events:', err);
    el.body.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
  }
}

function initFilters() {
  // populate nameFilter with unique names
  const names = [...new Set(rawRecords.map(r => r.name).filter(n => n && n !== '—'))].sort();
  el.name.innerHTML = `<option value="ALL">All Employees</option>` + names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
}

function applyAll() {
  // read filter values
  const q = el.search.value.trim().toLowerCase();
  const s = el.status.value;
  const n = el.name.value;
  const from = el.from.value;
  const to = el.to.value;

  filtered = rawRecords.filter(r => {
    // search across name, note, status, date
    const hay = `${r.name} ${r.note} ${r.status} ${r.date}`.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (s !== 'ALL' && r.status !== s) return false;
    if (n !== 'ALL' && r.name !== n) return false;
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });

  // sorting
  sortData(currentSort.key, currentSort.dir);
  renderSummary();
  renderPage(1);
}

function sortData(key, dir) {
  filtered.sort((a, b) => {
    const t = (k, v) => {
      if (k === 'start' || k === 'date') return v || '';
      return (v || '').toString().toLowerCase();
    };
    const av = t(key, a[key]);
    const bv = t(key, b[key]);
    if (av === bv) return 0;
    if (currentSort.key === 'start') {
      // compare dates
      const da = new Date(av);
      const db = new Date(bv);
      return dir === 'asc' ? da - db : db - da;
    }
    return dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });
}

function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const pageSlice = filtered.slice(start, start + pageSize);

  el.body.innerHTML = pageSlice.map(r => rowHtml(r)).join('') || '<tr><td colspan="5" style="padding:14px">No records.</td></tr>';

  renderPagination();
}

function rowHtml(r) {
  // make status class safe (replace space with -)
  const cls = r.status.replace(/\s+/g, '-');
  return `<tr>
    <td>${escapeHtml(r.date)}</td>
    <td>${escapeHtml(r.name)}</td>
    <td><span class="status-pill ${escapeHtml(cls)}">${escapeHtml(r.status)}</span></td>
    <td>${escapeHtml(r.note)}</td>
    <td>${escapeHtml(r.comp_off)}</td>
  </tr>`;
}

function renderPagination() {
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const fragment = [];

  const createBtn = (txt, p, disabled) => `<button ${disabled ? 'disabled' : ''} data-page="${p}">${escapeHtml(txt)}</button>`;

  fragment.push(createBtn('« Prev', Math.max(1, currentPage - 1), currentPage === 1));

  // show up to 7 pages around current
  const range = 3;
  let startPage = Math.max(1, currentPage - range);
  let endPage = Math.min(totalPages, currentPage + range);

  if (currentPage <= range) endPage = Math.min(totalPages, 1 + range * 2);
  if (currentPage + range >= totalPages) startPage = Math.max(1, totalPages - range * 2);

  for (let p = startPage; p <= endPage; p++) {
    fragment.push(`<button data-page="${p}" ${p === currentPage ? 'style="background:#007bff;color:white;"' : ''}>${p}</button>`);
  }

  fragment.push(createBtn('Next »', Math.min(totalPages, currentPage + 1), currentPage === totalPages));

  el.pagination.innerHTML = fragment.join('');
  // delegate clicks
  el.pagination.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      const p = Number(btn.getAttribute('data-page'));
      renderPage(p);
    };
  });
}

function renderSummary() {
  el.totalCount.textContent = filtered.length;
  el.countPresent.textContent = filtered.filter(r => r.status === 'Present').length;
  el.countAbsent.textContent = filtered.filter(r => r.status === 'Absent').length;
  el.countHalf.textContent = filtered.filter(r => r.status === 'Half Day' || r.status === 'Half-Day' || r.status === 'Halfday').length;
  const others = filtered.filter(r => !['Present','Absent','Half Day','Half-Day','Halfday'].includes(r.status)).length;
  el.countOther.textContent = others;
}

// Utilities
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Event listeners
el.search.oninput = () => { applyAll(); };
el.status.onchange = () => { applyAll(); };
el.name.onchange = () => { applyAll(); };
el.from.onchange = () => { applyAll(); };
el.to.onchange = () => { applyAll(); };
el.clear.onclick = () => {
  el.search.value = '';
  el.status.value = 'ALL';
  el.name.value = 'ALL';
  el.from.value = '';
  el.to.value = '';
  applyAll();
};

// column sorting
el.tableHeaders.forEach(th => {
  th.onclick = () => {
    const key = th.getAttribute('data-key');
    const type = th.getAttribute('data-type');
    // toggle sort
    if (currentSort.key === key) currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
    else { currentSort.key = key; currentSort.dir = 'asc'; }
    applyAll();
  };
});

// exports
el.exportCsv.onclick = () => exportCSV(filtered);
el.exportExcel.onclick = () => exportXLSX(filtered);
el.exportPdf.onclick = () => exportPDF(filtered);

// Export implementations
function exportCSV(rows) {
  if (!rows || !rows.length) return alert('No data to export.');
  const header = ['Date','Name','Status','Note','Comp-Off'];
  const lines = [header.join(',')];
  rows.forEach(r => {
    const cells = [r.date, r.name, r.status, r.note, r.comp_off].map(c => `"${(c||'').replaceAll('"','""')}"`);
    lines.push(cells.join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportXLSX(rows) {
  if (!rows || !rows.length) return alert('No data to export.');
  const ws_data = [
    ['Date','Name','Status','Note','Comp-Off'],
    ...rows.map(r => [r.date, r.name, r.status, r.note, r.comp_off])
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, `attendance_${new Date().toISOString().slice(0,10)}.xlsx`);
}

async function exportPDF(rows) {
  if (!rows || !rows.length) return alert('No data to export.');
  // using jsPDF + autotable
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');
  const head = [['Date','Name','Status','Note','Comp-Off']];
  const body = rows.map(r => [r.date, r.name, r.status, r.note, r.comp_off]);
  doc.autoTable({
    head: head,
    body: body,
    startY: 40,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0,123,255] }
  });
  doc.save(`attendance_${new Date().toISOString().slice(0,10)}.pdf`);
}

// initial load
loadData();
