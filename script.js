// -----------------------------
// FILES
// -----------------------------

let files = [];

function addFiles() {
    const input = document.getElementById("fileInput");
    const selectedFiles = Array.from(input.files);

    if (selectedFiles.length === 0) {
        alert("Please select a file.");
        return;
    }

    selectedFiles.forEach(file => {
        files.push(file);
    });

    input.value = "";

    displayFiles();
    updateCounts();
}

function displayFiles() {
    const list = document.getElementById("fileList");
    list.innerHTML = "";

    files.forEach((file, index) => {

        const li = document.createElement("li");

        const link = document.createElement("a");

        link.textContent = "📄 " + file.name;
        link.href = URL.createObjectURL(file);
        link.target = "_blank";

        link.style.color = "white";
        link.style.cursor = "pointer";
        link.style.textDecoration = "underline";

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.onclick = function(event) {
            event.preventDefault();
            deleteFile(index);
        };

        li.appendChild(link);
        li.appendChild(document.createElement("br"));
        li.appendChild(deleteButton);

        list.appendChild(li);
    });
}

function deleteFile(index) {
    files.splice(index, 1);

    displayFiles();
    updateCounts();
}
