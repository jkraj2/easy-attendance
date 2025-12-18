document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const table = document.getElementById('recordsTable');

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }

    // Filter functionality
    if (filterStatus) {
        filterStatus.addEventListener('change', filterTable);
    }

    function filterTable() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusFilter = filterStatus ? filterStatus.value.toLowerCase() : '';
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        for (let row of rows) {
            const name = row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
            const status = row.getAttribute('data-status') ? row.getAttribute('data-status').toLowerCase() : '';

            const matchesSearch = name.includes(searchTerm);
            const matchesStatus = !statusFilter || status === statusFilter;

            if (matchesSearch && matchesStatus) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }
});

async function deleteRecord(timestamp) {
    if (!confirm('Are you sure you want to delete this record?')) {
        return;
    }

    try {
        const response = await fetch('/delete_record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timestamp })
        });

        const data = await response.json();

        if (data.success) {
            location.reload();
        } else {
            alert('Error deleting record');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting record');
    }
}
