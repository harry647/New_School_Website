// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Pin/Unpin Notification
    const pinIcons = document.querySelectorAll('.pin-icon');
    pinIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            if (this.classList.contains('far')) {
                // Pin the notification
                this.classList.remove('far');
                this.classList.add('fas', 'text-warning');
                this.title = 'Unpin';
            } else {
                // Unpin the notification
                this.classList.remove('fas', 'text-warning');
                this.classList.add('far');
                this.title = 'Pin';
            }
        });
    });
    
    // Bulk Selection
    const selectAllCheckbox = document.getElementById('select-all');
    const selectCheckboxes = document.querySelectorAll('.select-notification');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            selectCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // Mark as Read
    const markReadButton = document.getElementById('mark-read');
    if (markReadButton) {
        markReadButton.addEventListener('click', function() {
            const selectedNotifications = document.querySelectorAll('.select-notification:checked');
            selectedNotifications.forEach(checkbox => {
                const notification = checkbox.closest('.notification');
                notification.style.opacity = '0.7';
            });
            alert('Selected notifications marked as read.');
        });
    }
    
    // Delete Selected
    const deleteSelectedButton = document.getElementById('delete-selected');
    if (deleteSelectedButton) {
        deleteSelectedButton.addEventListener('click', function() {
            const selectedNotifications = document.querySelectorAll('.select-notification:checked');
            selectedNotifications.forEach(checkbox => {
                const notification = checkbox.closest('.notification');
                notification.remove();
            });
            alert('Selected notifications deleted.');
        });
    }
    
    // Pin Selected
    const pinSelectedButton = document.getElementById('pin-selected');
    if (pinSelectedButton) {
        pinSelectedButton.addEventListener('click', function() {
            const selectedNotifications = document.querySelectorAll('.select-notification:checked');
            selectedNotifications.forEach(checkbox => {
                const notification = checkbox.closest('.notification');
                const pinIcon = notification.querySelector('.pin-icon');
                if (pinIcon.classList.contains('far')) {
                    pinIcon.classList.remove('far');
                    pinIcon.classList.add('fas', 'text-warning');
                    pinIcon.title = 'Unpin';
                }
            });
            alert('Selected notifications pinned.');
        });
    }
    
    // Filter Pinned
    const filterPinnedButton = document.getElementById('filter-pinned');
    if (filterPinnedButton) {
        filterPinnedButton.addEventListener('click', function() {
            const notifications = document.querySelectorAll('.notification');
            notifications.forEach(notification => {
                const pinIcon = notification.querySelector('.pin-icon');
                if (pinIcon.classList.contains('fas')) {
                    notification.style.display = 'block';
                } else {
                    notification.style.display = 'none';
                }
            });
        });
    }
    
    // Filter Archive
    const filterArchiveButton = document.getElementById('filter-archive');
    if (filterArchiveButton) {
        filterArchiveButton.addEventListener('click', function() {
            alert('Showing archived notifications.');
        });
    }
    
    // Filter Trash
    const filterTrashButton = document.getElementById('filter-trash');
    if (filterTrashButton) {
        filterTrashButton.addEventListener('click', function() {
            alert('Showing trashed notifications.');
        });
    }
    
    // Quick Actions
    const actionButtons = document.querySelectorAll('.notification-body button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            alert(`Action: ${action}`);
        });
    });
    
    // Acknowledge Button
    const acknowledgeButtons = document.querySelectorAll('.btn-outline-success');
    acknowledgeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const notification = this.closest('.notification');
            const badge = notification.querySelector('.badge');
            badge.textContent = 'Acknowledged';
            badge.classList.remove('bg-danger', 'bg-warning', 'bg-primary');
            badge.classList.add('bg-success');
            alert('Notification acknowledged.');
        });
    });
});