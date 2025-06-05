// General JavaScript for the application
console.log("app.js loaded");

// Example: Add a simple interactive element
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (header) {
        header.addEventListener('click', () => {
            alert('Header clicked!');
        });
    }
});
