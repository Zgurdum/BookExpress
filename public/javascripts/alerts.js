// alerts.js - SweetAlert2 wrapper functions for consistent UI alerts

// Generic alert function that accepts type
function showAlert(type, message, callback = null) {
    const config = {
        confirmButtonColor: '#4CAF50'
    };

    switch(type) {
        case 'success':
            config.icon = 'success';
            config.title = 'Success!';
            config.timer = 3000;
            config.timerProgressBar = true;
            break;
        case 'error':
            config.icon = 'error';
            config.title = 'Error!';
            config.confirmButtonColor = '#f44336';
            break;
        case 'warning':
            config.icon = 'warning';
            config.title = 'Warning!';
            config.confirmButtonColor = '#ff9800';
            break;
        case 'info':
            config.icon = 'info';
            config.title = 'Info';
            config.confirmButtonColor = '#2196F3';
            break;
        default:
            config.icon = 'info';
            config.title = 'Notification';
    }

    config.text = message;

    Swal.fire(config).then((result) => {
        if (callback && result.isConfirmed) {
            callback();
        }
    });
}

// Success alert
function showSuccessAlert(message, title = 'Success!') {
    Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonColor: '#4CAF50',
        timer: 3000,
        timerProgressBar: true
    });
}

// Error alert
function showErrorAlert(message, title = 'Error!') {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#f44336'
    });
}

// Warning alert
function showWarningAlert(message, title = 'Warning!') {
    Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        confirmButtonColor: '#ff9800'
    });
}

// Info alert
function showInfoAlert(message, title = 'Info') {
    Swal.fire({
        icon: 'info',
        title: title,
        text: message,
        confirmButtonColor: '#2196F3'
    });
}

// Confirmation dialog
function showConfirmAlert(message, title = 'Are you sure?', confirmText = 'Yes', cancelText = 'Cancel') {
    return Swal.fire({
        icon: 'question',
        title: title,
        text: message,
        showCancelButton: true,
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#f44336',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText
    });
}

// Toast notification (smaller, auto-dismiss)
function showToast(message, type = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: type,
        title: message
    });
}