// Azure Blob Storage connection
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "your_connection_string_here";

if (!connectionString) {
    console.error("Connection string is not defined! Please check your environment variables.");
}

// Azure Blob Service setup
const { BlobServiceClient } = window.AzureStorageBlob;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Correct container names
const notesContainer = blobServiceClient.getContainerClient("notesdata");
const filesContainer = blobServiceClient.getContainerClient("filesdata");

// Helper to get the current date
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
        console.log("Uploading note:", noteContent);
        console.log("Blob name:", blobName);
        await blockBlobClient.upload(noteContent, noteContent.length);
        alert("Note saved successfully!");
        document.getElementById("noteInput").value = "";
        loadNotes(); // Refresh notes for today
    } catch (error) {
        console.error("Error saving note:", error.message);
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
        console.log("Uploading file:", file.name);
        console.log("Blob name:", blobName);
        const data = await file.arrayBuffer();
        await blockBlobClient.upload(data, data.byteLength);
        alert("File uploaded successfully!");
        fileInput.value = "";
        loadFiles(); // Refresh files for today
    } catch (error) {
        console.error("Error uploading file:", error.message);
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
// Load Notes for Today
async function loadNotes() {
    const notesList = document.getElementById("notesList");
    notesList.innerHTML = "";
    const date = getCurrentDate();

    for await (const blob of notesContainer.listBlobsFlat()) {
        if (blob.name.startsWith(date)) {
            const noteItem = document.createElement("li");
            noteItem.textContent = blob.name.split("/")[1];

            // Add a button to view the content of the note
            const viewButton = document.createElement("button");
            viewButton.textContent = "View";
            viewButton.onclick = async () => {
                const blockBlobClient = notesContainer.getBlockBlobClient(blob.name);
                const downloadedContent = await blockBlobClient.downloadToBlob();
                const text = await downloadedContent.text();
                alert(`Note Content:\n\n${text}`);
            };

            noteItem.appendChild(viewButton);
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

            // Add a download link to the file
            const downloadLink = document.createElement("a");
            downloadLink.textContent = "Download";
            downloadLink.href = await filesContainer.getBlockBlobClient(blob.name).url;
            downloadLink.target = "_blank";
            downloadLink.style.marginLeft = "10px";

            fileItem.appendChild(downloadLink);
            filesList.appendChild(fileItem);
        }
    }
}

