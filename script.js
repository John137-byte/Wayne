// Azure Blob Storage connection using SAS token
const blobSasUrl = "https://wesbsiteupdatesstorage.blob.core.windows.net/?sv=2022-11-02&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2025-12-20T01:18:33Z&st=2024-12-19T17:18:33Z&spr=https,http&sig=PxQVxO26iCepXQOhVONFs%2Bc9edxKdLqNDVgUqs6p38Y%3D"; // Use your SAS URL here
const blobServiceClient = new BlobServiceClient(blobSasUrl);

// Containers
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

            // Add a button to view the content of the note
            const viewButton = document.createElement("button");
            viewButton.textContent = "View";
            viewButton.onclick = async () => {
                const blockBlobClient = notesContainer.getBlockBlobClient(blob.name);
                const downloadResponse = await blockBlobClient.download();
                const downloadedContent = await streamToText(downloadResponse.readableStreamBody);
                alert(`Note Content:\n\n${downloadedContent}`);
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
            downloadLink.href = filesContainer.getBlockBlobClient(blob.name).url;
            downloadLink.target = "_blank";
            downloadLink.style.marginLeft = "10px";

            fileItem.appendChild(downloadLink);
            filesList.appendChild(fileItem);
        }
    }
}

// Utility to convert a readable stream to text
async function streamToText(readableStream) {
    const reader = readableStream.getReader();
    let result = "";
    let done = false;
    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
            result += new TextDecoder().decode(value);
        }
    }
    return result;
}

// Attach Event Listeners
document.getElementById("uploadNoteButton").addEventListener("click", saveNote);
document.getElementById("uploadFileButton").addEventListener("click", uploadFile);
document.getElementById("viewAllNotesButton").addEventListener("click", viewAllNotes);
document.getElementById("viewAllFilesButton").addEventListener("click", viewAllFiles);

// Load notes and files for today on page load
loadNotes();
loadFiles();
