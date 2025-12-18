document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('attendanceForm');
    const messageDiv = document.getElementById('message');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const userName = document.getElementById('userName').value;
            const status = document.getElementById('status').value;

            if (!userName) {
                showMessage('Please select a name', 'error');
                return;
            }

            try {
                const response = await fetch('/mark_attendance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: userName,
                        status: status
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showMessage('Attendance marked successfully!', 'success');
                    form.reset();
                } else {
                    showMessage('Error marking attendance', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error marking attendance', 'error');
            }
        });
    }

    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.classList.remove('hidden');

            setTimeout(() => {
                messageDiv.classList.add('hidden');
            }, 3000);
        }
    }
});
