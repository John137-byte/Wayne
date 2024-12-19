// Azure Blob Storage connection
const connectionString = "your_connection_string_here"; // Replace with your actual connection string
const { BlobServiceClient } = window.AzureStorageBlob;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Containers
const notesContainer = blobServiceClient.getContainerClient("notesupdates");
const filesContainer = blobServiceClient.getContainerClient("filesupdates");

// Current Date Helper
const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Save Note
async function saveNote() {
    const noteContent = document.getElementById("noteInput").value;
    if (!noteContent) {
        alert("Please write a note first!");
        return;
    }
    const date = getCurrentDate();
    const blobName = `${date}/note_${new Date().toISOString()}.txt`;
    const blockBlobClient = notesContainer.getBlockBlobClient(blobName);

    try {
        await blockBlobClient.upload(noteContent, noteContent.length);
        alert("Note saved successfully!");
        document.getElementById("noteInput").value = "";
        loadNotes(); // Refresh notes for today
    } catch (error) {
        console.error("Error saving note:", error);
    }
}

// Upload File
async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file first!");
        return;
    }
    const date = getCurrentDate();
    const blobName = `${date}/${file.name}`;
    const blockBlobClient = filesContainer.getBlockBlobClient(blobName);

    try {
        const data = await file.arrayBuffer();
        await blockBlobClient.upload(data, data.byteLength);
        alert("File uploaded successfully!");
        fileInput.value = "";
        loadFiles(); // Refresh files for today
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

// Load Notes for Today
async function loadNotes() {
    const notesList = document.getElementById("notesList");
    notesList.innerHTML = "";
    const date = getCurrentDate();

    for await (const blob of notesContainer.listBlobsFlat()) {
        if (blob.name.startsWith(date)) {
            const noteItem = document.createElement("li");
            noteItem.textContent = blob.name.split("/")[1];
            notesList.appendChild(noteItem);
        }
    }
}

// Load Files for Today
async function loadFiles() {
    const filesList = document.getElementById("filesList");
    filesList.innerHTML = "";
    const date = getCurrentDate();

    for await (const blob of filesContainer.listBlobsFlat()) {
        if (blob.name.startsWith(date)) {
            const fileItem = document.createElement("li");
            fileItem.textContent = blob.name.split("/")[1];
            filesList.appendChild(fileItem);
        }
    }
}

// View All Notes
async function viewAllNotes() {
    const notesList = document.getElementById("notesList");
    notesList.innerHTML = "";

    for await (const blob of notesContainer.listBlobsFlat()) {
        const noteItem = document.createElement("li");
        noteItem.textContent = blob.name;
        notesList.appendChild(noteItem);
    }
}

// View All Files
async function viewAllFiles() {
    const filesList = document.getElementById("filesList");
    filesList.innerHTML = "";

    for await (const blob of filesContainer.listBlobsFlat()) {
        const fileItem = document.createElement("li");
        fileItem.textContent = blob.name;
        filesList.appendChild(fileItem);
    }
}

// Attach Event Listeners
document.getElementById("uploadNoteButton").addEventListener("click", saveNote);
document.getElementById("uploadFileButton").addEventListener("click", uploadFile);
document.getElementById("viewAllNotesButton").addEventListener("click", viewAllNotes);
document.getElementById("viewAllFilesButton").addEventListener("click", viewAllFiles);

// Load notes and files for today on page load
loadNotes();
loadFiles();
