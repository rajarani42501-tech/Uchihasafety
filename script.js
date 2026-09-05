// -----------------------------
// SAFETY LOCKER
// -----------------------------

// Demo password
const correctPassword = "Locker@123";

// Maximum wrong attempts
const MAX_ATTEMPTS = 5;

let wrongAttempts = 0;
let locked = false;


// -----------------------------
// LOGIN
// -----------------------------

function login() {

    if (locked) {
        showMessage(
            "Too many wrong attempts. Locker is locked.",
            true
        );
        return;
    }

    const password =
        document.getElementById("password").value;

    if (password === correctPassword) {

        wrongAttempts = 0;

        document
            .getElementById("loginPage")
            .classList.add("hidden");

        document
            .getElementById("dashboard")
            .classList.remove("hidden");

        updateCounts();

    } else {

        wrongAttempts++;

        const remaining =
            MAX_ATTEMPTS - wrongAttempts;

        document.getElementById("attemptText")
            .textContent =
            "Attempts remaining: " + Math.max(remaining, 0);

        if (wrongAttempts >= MAX_ATTEMPTS) {

            locked = true;

            showMessage(
                "🔒 Locker locked after 5 wrong attempts.",
                true
            );

        } else {

            showMessage(
                "❌ Wrong password!",
                true
            );
        }
    }

    document.getElementById("password").value = "";
}


// -----------------------------
// LOCK
// -----------------------------

function lockLocker() {

    document
        .getElementById("dashboard")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");

    document.getElementById("password").value = "";
}


// -----------------------------
// FILES
// -----------------------------

let files = [];


function addFiles() {

    const input =
        document.getElementById("fileInput");

    const selectedFiles =
        Array.from(input.files);

    if (selectedFiles.length === 0) {
        alert("Please select a file.");
        return;
    }

    selectedFiles.forEach(file => {

        files.push({
            name: file.name,
            size: file.size,
            type: file.type
        });

    });

    input.value = "";

    displayFiles();
    updateCounts();
}


function displayFiles() {

    const list =
        document.getElementById("fileList");

    list.innerHTML = "";

    files.forEach((file, index) => {

        const li = document.createElement("li");

        li.innerHTML = `
            📄 ${escapeHTML(file.name)}
            <br>
            <small>${formatSize(file.size)}</small>
            <button onclick="deleteFile(${index})">
                Delete
            </button>
        `;

        list.appendChild(li);
    });
}


function deleteFile(index) {

    files.splice(index, 1);

    displayFiles();
    updateCounts();
}


// -----------------------------
// PHONE NUMBERS
// -----------------------------

let contacts = [];


function addPhone() {

    const name =
        document.getElementById("contactName")
            .value.trim();

    const phone =
        document.getElementById("phoneNumber")
            .value.trim();

    if (!name || !phone) {
        alert("Enter name and phone number.");
        return;
    }

    // Basic phone validation
    const phonePattern =
        /^[0-9+\-\s()]{7,20}$/;

    if (!phonePattern.test(phone)) {
        alert("Enter a valid phone number.");
        return;
    }

    contacts.push({
        name: name,
        phone: phone
    });

    document.getElementById("contactName").value = "";
    document.getElementById("phoneNumber").value = "";

    displayContacts();
    updateCounts();
}


function displayContacts() {

    const list =
        document.getElementById("phoneList");

    list.innerHTML = "";

    contacts.forEach((contact, index) => {

        const li =
            document.createElement("li");

        li.innerHTML = `
            👤 ${escapeHTML(contact.name)}
            <br>
            📞 ${escapeHTML(contact.phone)}
            <button onclick="deletePhone(${index})">
                Delete
            </button>
        `;

        list.appendChild(li);
    });
}


function deletePhone(index) {

    contacts.splice(index, 1);

    displayContacts();
    updateCounts();
}


// -----------------------------
// COUNTS
// -----------------------------

function updateCounts() {

    document.getElementById("fileCount")
        .textContent = files.length;

    document.getElementById("phoneCount")
        .textContent = contacts.length;
}


// -----------------------------
// HELPERS
// -----------------------------

function formatSize(bytes) {

    if (bytes < 1024)
        return bytes + " B";

    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


function showMessage(message, error = false) {

    const element =
        document.getElementById("loginMessage");

    element.textContent = message;

    element.style.color =
        error ? "red" : "lightgreen";
      }
