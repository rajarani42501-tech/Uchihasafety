// ==========================================
// 🔐 SAFETY LOCKER - SUPABASE SCRIPT
// ==========================================

// 1️⃣ SUPABASE CONNECTION
const SUPABASE_URL = "https://mgfjzkhppluzhymqarpp.supabase.co";
const SUPABASE_KEY = "sb_publishable_BNF_f0GNKxpxUo0Z5sRj-g_Nr9iWiIQ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// 🔑 LOGIN
// ==========================================

async function login() {

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    if (!email || !password) {
        showMessage("Enter email and password", true);
        return;
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        showMessage("❌ Wrong email or password", true);
        return;
    }

    showMessage("✅ Locker unlocked");

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("dashboard")
        .classList.remove("hidden");

    await loadFiles();
    await loadContacts();
}


// ==========================================
// 🚪 LOGOUT / LOCK
// ==========================================

async function lockLocker() {

    await supabaseClient.auth.signOut();

    document
        .getElementById("dashboard")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");
}


// ==========================================
// 📁 UPLOAD FILE
// ==========================================

async function addFiles() {

    const input =
        document.getElementById("fileInput");

    const selectedFiles =
        Array.from(input.files);

    if (selectedFiles.length === 0) {
        alert("Select a file first.");
        return;
    }

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Please login.");
        return;
    }

    for (const file of selectedFiles) {

        // File size limit: 10 MB
        if (file.size > 10 * 1024 * 1024) {
            alert(file.name + " is larger than 10 MB.");
            continue;
        }

        // Allow images + common documents
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(file.name + " is not an allowed file type.");
            continue;
        }

        const safeName =
            file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const filePath =
            `${user.id}/${crypto.randomUUID()}-${safeName}`;

        const { error } =
            await supabaseClient.storage
                .from("locker-files")
                .upload(filePath, file);

        if (error) {
            console.error(error);
            alert("Upload failed: " + file.name);
        }
    }

    input.value = "";

    await loadFiles();
}


// ==========================================
// 📂 LOAD FILES
// ==========================================

async function loadFiles() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { data, error } =
        await supabaseClient.storage
            .from("locker-files")
            .list(user.id, {
                limit: 100
            });

    if (error) {
        console.error(error);
        return;
    }

    const list =
        document.getElementById("fileList");

    list.innerHTML = "";

    let count = 0;

    data.forEach(file => {

        // Ignore folders
        if (!file.name) return;

        count++;

        const li =
            document.createElement("li");

        const fileName =
            document.createElement("span");

        fileName.textContent =
            "📄 " + file.name;

        fileName.style.cursor = "pointer";
        fileName.style.textDecoration = "underline";

        fileName.onclick = function () {
            openFile(file.name);
        };

        const deleteButton =
            document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.onclick = function () {
            deleteFile(file.name);
        };

        li.appendChild(fileName);
        li.appendChild(deleteButton);

        list.appendChild(li);
    });

    document.getElementById("fileCount")
        .textContent = count;
}


// ==========================================
// 👆 OPEN FILE
// ==========================================

async function openFile(fileName) {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Please login.");
        return;
    }

    const filePath =
        `${user.id}/${fileName}`;

    const { data, error } =
        await supabaseClient.storage
            .from("locker-files")
            .createSignedUrl(filePath, 60);

    if (error) {
        console.error(error);
        alert("Cannot open file.");
        return;
    }

    window.open(data.signedUrl, "_blank");
}


// ==========================================
// 🗑️ DELETE FILE
// ==========================================

async function deleteFile(fileName) {

    const confirmDelete =
        confirm("Delete this file?");

    if (!confirmDelete) return;

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const filePath =
        `${user.id}/${fileName}`;

    const { error } =
        await supabaseClient.storage
            .from("locker-files")
            .remove([filePath]);

    if (error) {
        console.error(error);
        alert("Delete failed.");
        return;
    }

    await loadFiles();
}


// ==========================================
// 📞 ADD PHONE NUMBER
// ==========================================

async function addPhone() {

    const name =
        document
            .getElementById("contactName")
            .value
            .trim();

    const phone =
        document
            .getElementById("phoneNumber")
            .value
            .trim();

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

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Please login.");
        return;
    }

    const { error } =
        await supabaseClient
            .from("contacts")
            .insert({
                user_id: user.id,
                name: name,
                phone: phone
            });

    if (error) {
        console.error(error);
        alert("Could not save phone number.");
        return;
    }

    document
        .getElementById("contactName")
        .value = "";

    document
        .getElementById("phoneNumber")
        .value = "";

    await loadContacts();
}


// ==========================================
// 📞 LOAD PHONE NUMBERS
// ==========================================

async function loadContacts() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { data, error } =
        await supabaseClient
            .from("contacts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {
        console.error(error);
        return;
    }

    const list =
        document.getElementById("phoneList");

    list.innerHTML = "";

    data.forEach(contact => {

        const li =
            document.createElement("li");

        li.textContent =
            `👤 ${contact.name} - 📞 ${contact.phone}`;

        const deleteButton =
            document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.onclick = function () {
            deletePhone(contact.id);
        };

        li.appendChild(deleteButton);

        list.appendChild(li);
    });

    document.getElementById("phoneCount")
        .textContent = data.length;
}


// ==========================================
// 🗑️ DELETE PHONE NUMBER
// ==========================================

async function deletePhone(id) {

    const confirmDelete =
        confirm("Delete this phone number?");

    if (!confirmDelete) return;

    const { error } =
        await supabaseClient
            .from("contacts")
            .delete()
            .eq("id", id);

    if (error) {
        console.error(error);
        alert("Delete failed.");
        return;
    }

    await loadContacts();
}


// ==========================================
// 🔄 AUTO CHECK LOGIN
// ==========================================

async function checkSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        document
            .getElementById("loginPage")
            .classList.add("hidden");

        document
            .getElementById("dashboard")
            .classList.remove("hidden");

        await loadFiles();
        await loadContacts();
    }
}


// ==========================================
// 💬 MESSAGE
// ==========================================

function showMessage(message, error = false) {

    const element =
        document.getElementById("loginMessage");

    if (!element) return;

    element.textContent = message;

    element.style.color =
        error ? "red" : "lightgreen";
}


// ==========================================
// 🚀 START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    checkSession
);
