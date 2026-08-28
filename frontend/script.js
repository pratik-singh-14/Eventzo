
// =====================================================
// EVENTZO - COMPLETE FRONTEND JAVASCRIPT
// Events + Search + Register + Email Verification
// Login + JWT + /ME + Logout
// =====================================================

// =====================================================
// API CONFIGURATION
// =====================================================

// LOCAL DEVELOPMENT:
// const API_URL = "http://localhost:5000/api";

// LIVE PRODUCTION BACKEND:
const API_URL = "https://eventzo-backend.onrender.com/api";

let allEvents = [];


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
    checkLogin();
});


// =====================================================
// LOAD EVENTS
// =====================================================

async function loadEvents() {

    const loading = document.getElementById("loading");
    const container = document.getElementById("eventsContainer");
    const noEvents = document.getElementById("noEvents");

    if (!loading || !container) return;

    loading.style.display = "block";

    if (noEvents) {
        noEvents.style.display = "none";
    }

    container.innerHTML = "";

    try {

        const response = await fetch(`${API_URL}/events`);

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Failed to load events"
            );
        }

        allEvents = data.events || [];

        loading.style.display = "none";

        displayEvents(allEvents);

    } catch (error) {

        console.error("Load events error:", error);

        loading.style.display = "none";

        container.innerHTML = `
            <div class="no-events"
                 style="display:block; grid-column:1/-1;">

                <div>⚠️</div>

                <h3>Unable to load events</h3>

                <p>
                    Unable to connect to the EVENTZO server.
                </p>

                <button
                    class="primary-btn"
                    onclick="loadEvents()">
                    Try Again
                </button>

            </div>
        `;
    }
}


// =====================================================
// DISPLAY EVENTS
// =====================================================

function displayEvents(events) {

    const container =
        document.getElementById("eventsContainer");

    const noEvents =
        document.getElementById("noEvents");

    if (!container) return;

    container.innerHTML = "";

    if (!events || events.length === 0) {

        if (noEvents) {
            noEvents.style.display = "block";
        }

        return;
    }

    if (noEvents) {
        noEvents.style.display = "none";
    }

    events.forEach(event => {

        const card =
            document.createElement("div");

        card.className = "event-card";

        const imageHTML = event.image
            ? `
                <img
                    src="${escapeHTML(event.image)}"
                    alt="${escapeHTML(event.title || "Event")}"
                    onerror="this.style.display='none';"
                >
              `
            : getEventIcon(event.category);

        card.innerHTML = `

            <div class="event-image">
                ${imageHTML}
            </div>

            <div class="event-content">

                <div class="event-category">
                    ${escapeHTML(event.category || "Event")}
                </div>

                <h3 class="event-title">
                    ${escapeHTML(event.title || "Untitled Event")}
                </h3>

                <p class="event-description">
                    ${escapeHTML(
                        event.description ||
                        "Join this amazing event."
                    )}
                </p>

                <div class="event-info">

                    <div>
                        📅
                        ${formatDate(event.date)}
                    </div>

                    <div>
                        🕐
                        ${escapeHTML(
                            event.time ||
                            "Time not specified"
                        )}
                    </div>

                    <div>
                        📍
                        ${escapeHTML(
                            event.location ||
                            "Location not specified"
                        )}
                    </div>

                    <div>
                        🎟️
                        ${event.availableSeats ?? 0}
                        seats available
                    </div>

                </div>

                <div class="event-bottom">

                    <div class="event-price">

                        ${
                            Number(event.price) > 0
                                ? "₹" + Number(event.price)
                                : "FREE"
                        }

                        <small>/ person</small>

                    </div>

                    <button
                        class="event-button"
                        onclick="viewEvent('${escapeHTML(event._id)}')">

                        View Event

                    </button>

                </div>

            </div>
        `;

        container.appendChild(card);
    });
}


// =====================================================
// EVENT ICON
// =====================================================

function getEventIcon(category) {

    const icons = {

        Technology: "💻",
        Music: "🎵",
        Sports: "⚽",
        Workshop: "🧠",
        Business: "💼",
        Education: "📚",
        Entertainment: "🎬"

    };

    return icons[category] || "🎫";
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {

    if (!date) {
        return "Date not specified";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return "Invalid date";
    }

    return d.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// =====================================================
// SEARCH EVENTS
// =====================================================

function searchEvents() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    if (!searchInput || !categoryFilter) return;

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const category =
        categoryFilter.value;

    const filtered =
        allEvents.filter(event => {

            const title =
                (event.title || "")
                    .toLowerCase();

            const description =
                (event.description || "")
                    .toLowerCase();

            const location =
                (event.location || "")
                    .toLowerCase();

            const eventCategory =
                (event.category || "")
                    .toLowerCase();

            const matchesSearch =
                !search ||
                title.includes(search) ||
                description.includes(search) ||
                location.includes(search) ||
                eventCategory.includes(search);

            const matchesCategory =
                category === "all" ||
                event.category === category;

            return matchesSearch && matchesCategory;
        });

    displayEvents(filtered);
}


// =====================================================
// FILTER EVENTS
// =====================================================

function filterEvents() {
    searchEvents();
}


// =====================================================
// SELECT CATEGORY
// =====================================================

function selectCategory(category) {

    const select =
        document.getElementById("categoryFilter");

    if (!select) return;

    select.value = category;

    searchEvents();

    scrollToEvents();
}


// =====================================================
// SCROLL TO EVENTS
// =====================================================

function scrollToEvents() {

    const events =
        document.getElementById("events");

    if (events) {

        events.scrollIntoView({
            behavior: "smooth"
        });

    }
}


// =====================================================
// VIEW EVENT
// =====================================================

function viewEvent(id) {

    const event =
        allEvents.find(
            item => item._id === id
        );

    if (!event) {

        alert("Event not found.");

        return;
    }

    const price =
        Number(event.price) > 0
            ? `₹${event.price}`
            : "FREE";

    alert(`
EVENTZO EVENT

${event.title}

Category: ${event.category || "N/A"}

Date: ${formatDate(event.date)}

Time: ${event.time || "N/A"}

Location: ${event.location || "N/A"}

Price: ${price}

Available Seats: ${event.availableSeats ?? 0}

${event.description || ""}
    `);
}


// =====================================================
// REGISTER USER
// =====================================================

async function registerUser(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("registerPassword")
            .value;

    const message =
        document.getElementById(
            "registerMessage"
        );

    if (!name || !email || !password) {

        showMessage(
            message,
            "Please fill all fields.",
            "error"
        );

        return;
    }

    if (password.length < 6) {

        showMessage(
            message,
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }

    showMessage(
        message,
        "Creating account...",
        "normal"
    );

    try {

        const response =
            await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

        const data =
            await getJSON(response);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Registration failed"
            );
        }

        showMessage(
            message,
            "Verification email sent! 📧 Check your Gmail and click the verification link.",
            "success"
        );

        const form =
            document.querySelector(
                "#registerModal form"
            );

        if (form) {
            form.reset();
        }

        setTimeout(() => {

            switchToLogin();

            const loginMessage =
                document.getElementById(
                    "loginMessage"
                );

            if (loginMessage) {

                showMessage(
                    loginMessage,
                    "Please verify your email before logging in.",
                    "normal"
                );

            }

        }, 2500);

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        showMessage(
            message,
            error.message ||
            "Registration failed.",
            "error"
        );
    }
}


// =====================================================
// LOGIN USER
// =====================================================

async function loginUser(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const message =
        document.getElementById(
            "loginMessage"
        );

    if (!email || !password) {

        showMessage(
            message,
            "Email and password are required.",
            "error"
        );

        return;
    }

    showMessage(
        message,
        "Logging in...",
        "normal"
    );

    try {

        const response =
            await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        const data =
            await getJSON(response);

        if (
            response.status === 403 &&
            data.message
        ) {

            showMessage(
                message,
                "📧 " + data.message,
                "error"
            );

            return;
        }

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Login failed"
            );
        }

        if (!data.token) {

            throw new Error(
                "Login succeeded but server did not return a token."
            );
        }

        localStorage.setItem(
            "eventzoToken",
            data.token
        );

        if (data.user) {

            localStorage.setItem(
                "eventzoUser",
                JSON.stringify(data.user)
            );

        }

        showMessage(
            message,
            "Login successful! 🎉",
            "success"
        );

        const currentUser =
            await getCurrentUser();

        if (!currentUser) {

            clearAuth();

            throw new Error(
                "Login verification failed. Please try again."
            );
        }

        const form =
            document.querySelector(
                "#loginModal form"
            );

        if (form) {
            form.reset();
        }

        checkLogin();

        setTimeout(() => {

            closeModals();

        }, 800);

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showMessage(
            message,
            error.message ||
            "Login failed.",
            "error"
        );
    }
}


// =====================================================
// CHECK LOGIN
// =====================================================

async function checkLogin() {

    const navButtons =
        document.querySelector(
            ".nav-buttons"
        );

    if (!navButtons) return;

    const token =
        localStorage.getItem(
            "eventzoToken"
        );

    if (!token) {

        showLoggedOutNavbar();

        return;
    }

    try {

        navButtons.innerHTML = `
            <span
                style="
                    color:#aab4c6;
                    font-size:13px;
                    padding:10px;
                ">
                Checking account...
            </span>
        `;

        const user =
            await getCurrentUser();

        if (!user) {

            clearAuth();

            showLoggedOutNavbar();

            return;
        }

        localStorage.setItem(
            "eventzoUser",
            JSON.stringify(user)
        );

        showLoggedInNavbar(user);

    } catch (error) {

        console.error(
            "Check login error:",
            error
        );

        clearAuth();

        showLoggedOutNavbar();
    }
}


// =====================================================
// GET CURRENT USER - /ME
// =====================================================

async function getCurrentUser() {

    const token =
        localStorage.getItem(
            "eventzoToken"
        );

    if (!token) {
        return null;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/auth/me`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );

        const data =
            await getJSON(response);

        if (
            response.status === 401
        ) {

            console.warn(
                "JWT expired or invalid."
            );

            clearAuth();

            return null;
        }

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to get current user"
            );
        }

        return data.user || null;

    } catch (error) {

        console.error(
            "/me error:",
            error
        );

        throw error;
    }
}


// =====================================================
// SHOW LOGGED-IN NAVBAR
// =====================================================

function showLoggedInNavbar(user) {

    const navButtons =
        document.querySelector(
            ".nav-buttons"
        );

    if (!navButtons) return;

    const name =
        escapeHTML(
            user.name || "User"
        );

    navButtons.innerHTML = `

        <span
            style="
                color:#aab4c6;
                font-size:13px;
                padding:10px;
            "
        >

            Hi, ${name} 👋

        </span>

        <button
            class="register-btn"
            onclick="logoutUser()">

            Logout

        </button>

    `;
}


// =====================================================
// SHOW LOGGED-OUT NAVBAR
// =====================================================

function showLoggedOutNavbar() {

    const navButtons =
        document.querySelector(
            ".nav-buttons"
        );

    if (!navButtons) return;

    navButtons.innerHTML = `

        <button
            class="login-btn"
            onclick="openLogin()">

            Login

        </button>

        <button
            class="register-btn"
            onclick="openRegister()">

            Register

        </button>

    `;
}


// =====================================================
// LOGOUT
// =====================================================

function logoutUser() {

    clearAuth();

    showLoggedOutNavbar();

    alert(
        "You have been logged out."
    );
}


// =====================================================
// CLEAR AUTH DATA
// =====================================================

function clearAuth() {

    localStorage.removeItem(
        "eventzoToken"
    );

    localStorage.removeItem(
        "eventzoUser"
    );
}


// =====================================================
// OPEN LOGIN
// =====================================================

function openLogin() {

    closeModals();

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (modal) {

        modal.classList.add(
            "active"
        );

    }
}


// =====================================================
// OPEN REGISTER
// =====================================================

function openRegister() {

    closeModals();

    const modal =
        document.getElementById(
            "registerModal"
        );

    if (modal) {

        modal.classList.add(
            "active"
        );

    }
}


// =====================================================
// CLOSE MODALS
// =====================================================

function closeModals() {

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.classList.remove(
                "active"
            );

        });
}


// =====================================================
// SWITCH TO LOGIN
// =====================================================

function switchToLogin() {

    closeModals();

    setTimeout(() => {

        openLogin();

    }, 100);
}


// =====================================================
// SWITCH TO REGISTER
// =====================================================

function switchToRegister() {

    closeModals();

    setTimeout(() => {

        openRegister();

    }, 100);
}


// =====================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList &&
            event.target.classList.contains("modal")
        ) {

            closeModals();

        }

    }
);


// =====================================================
// ESC KEY
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeModals();

        }

    }
);


// =====================================================
// GET JSON SAFELY
// =====================================================

async function getJSON(response) {

    const text =
        await response.text();

    if (!text) {

        return {};
    }

    try {

        return JSON.parse(text);

    } catch {

        console.error(
            "Server returned non-JSON response:",
            text
        );

        return {
            success: false,
            message:
                "Server returned an invalid response."
        };
    }
}


// =====================================================
// FORM MESSAGE
// =====================================================

function showMessage(
    element,
    text,
    type = "normal"
) {

    if (!element) return;

    element.textContent = text;

    if (type === "success") {

        element.style.color =
            "#00f5a0";

    } else if (type === "error") {

        element.style.color =
            "#ff6b6b";

    } else {

        element.style.color =
            "#aab4c6";

    }
}


// =====================================================
// HTML ESCAPE / SECURITY
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}
