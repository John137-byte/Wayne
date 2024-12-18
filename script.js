// Save Note Functionality
function saveNote() {
    const noteArea = document.getElementById('note-area').value;
    if (noteArea) {
        localStorage.setItem('userNote', noteArea);
        document.getElementById('save-message').innerText = "Note saved successfully!";
    } else {
        document.getElementById('save-message').innerText = "Note cannot be empty!";
    }
}

// Load Saved Note on Page Load
window.onload = function() {
    const savedNote = localStorage.getItem('userNote');
    if (savedNote) {
        document.getElementById('note-area').value = savedNote;
        document.getElementById('save-message').innerText = "Loaded saved note!";
    }
}

// File Upload Handling
document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const message = document.getElementById('file-message');

    if (file) {
        message.innerText = `Uploaded: ${file.name}`;
    } else {
        message.innerText = "No file uploaded yet.";
    }
});
