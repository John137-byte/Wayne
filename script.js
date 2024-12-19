// Connection string securely provided by your Azure environment
const AZURE_STORAGE_CONNECTION_STRING = "your_connection_string_here"; // Replace with your actual connection string

// Azure Blob Service setup
const { BlobServiceClient } = window.AzureStorageBlob;

// Initialize BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Function to upload a note to the "notesupdates" container
async function uploadNote() {
    const noteContent = document.getElementById("noteInput").value;
    if (!noteContent) {
        alert("Please write a note first!");
        return;
    }

    const containerClient = blobServiceClient.getContainerClient("notesupdates");
    const blobName = `note_${new Date().toISOString()}.txt`; // Save with a timestamp
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        await blockBlobClient.upload(noteContent, noteContent.length);
        document.getElementById("statusMessage").innerText = `Note "${blobName}" uploaded successfully!`;
    } catch (error) {
        console.error("Error uploading note:", error);
    }
}

// Function to upload a file to the "filesupdates" container
async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file first!");
        return;
    }

    const containerClient = blobServiceClient.getContainerClient("filesupdates");
    const blockBlobClient = containerClient.getBlockBlobClient(file.name);

    try {
        const data = await file.arrayBuffer();
        await blockBlobClient.upload(data, data.byteLength);
        document.getElementById("statusMessage").innerText = `File "${file.name}" uploaded successfully!`;
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

// Attach event listeners to buttons
document.getElementById("uploadNoteButton").addEventListener("click", uploadNote);
document.getElementById("uploadFileButton").addEventListener("click", uploadFile);
