// =====================================================
// EVENTZO FRONTEND
// API + LOGIN + REGISTER + EVENTS + SEARCH
// =====================================================

// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL = "http://localhost:5000";

console.log("EVENTZO Frontend Loaded");
console.log("API URL:", API_URL);


// =====================================================
// GLOBAL EVENTS DATA
// =====================================================

let allEvents = [];


// =====================================================
// MODAL FUNCTIONS
// =====================================================

function openLogin() {

    const loginModal =
        document.getElementById("loginModal");

    const registerModal =
        document.getElementById("registerModal");

    if (registerModal) {
        registerModal.style.display = "none";
    }

    if (loginModal) {
        loginModal.style.display = "flex";
    }

}


function openRegister() {

    const loginModal =
        document.getElementById("loginModal");

    const registerModal =
        document.getElementById("registerModal");

    if (loginModal) {
        loginModal.style.display = "none";
    }

    if (registerModal) {
        registerModal.style.display = "flex";
    }

}


function closeModals() {

    const loginModal =
        document.getElementById("loginModal");

    const registerModal =
        document.getElementById("registerModal");

    if (loginModal) {
        loginModal.style.display = "none";
    }

    if (registerModal) {
        registerModal.style.display = "none";
    }

}


function switchToRegister() {

    closeModals();

    openRegister();

}


function switchToLogin() {

    closeModals();

    openLogin();

}


// =====================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================================

window.addEventListener(
    "click",
    function (event) {

        const loginModal =
            document.getElementById("loginModal");

        const registerModal =
            document.getElementById("registerModal");


        if (
            loginModal &&
            event.target === loginModal
        ) {

            closeModals();

        }


        if (
            registerModal &&
            event.target === registerModal
        ) {

            closeModals();

        }

    }
);


// =====================================================
// ESCAPE KEY CLOSE MODAL
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeModals();

        }

    }
);


// =====================================================
// SCROLL TO EVENTS
// =====================================================

function scrollToEvents() {

    const eventsSection =
        document.getElementById("events");

    if (eventsSection) {

        eventsSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// =====================================================
// REGISTER USER
// =====================================================

async function registerUser(event) {

    event.preventDefault();


    const nameInput =
        document.getElementById("registerName");

    const emailInput =
        document.getElementById("registerEmail");

    const passwordInput =
        document.getElementById("registerPassword");

    const message =
        document.getElementById("registerMessage");


    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!name || !email || !password) {

        showMessage(
            message,
            "Please fill all fields.",
            false
        );

        return;

    }


    if (password.length < 6) {

        showMessage(
            message,
            "Password must contain at least 6 characters.",
            false
        );

        return;

    }


    showMessage(
        message,
        "Creating your account...",
        true
    );


    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/register`,
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
            await response.json();


        if (data.success) {

            showMessage(
                message,
                data.message ||
                "Registration successful. Check your email.",
                true
            );


            document.querySelector(
                "#registerModal form"
            ).reset();


        } else {

            showMessage(
                message,
                data.message ||
                "Registration failed.",
                false
            );

        }

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            message,
            "Cannot connect to EVENTZO backend.",
            false
        );

    }

}


// =====================================================
// LOGIN USER
// =====================================================

async function loginUser(event) {

    event.preventDefault();


    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");

    const message =
        document.getElementById("loginMessage");


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        showMessage(
            message,
            "Please enter email and password.",
            false
        );

        return;

    }


    showMessage(
        message,
        "Logging in...",
        true
    );


    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/login`,
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
            await response.json();


        if (data.success) {

            // Save JWT token
            localStorage.setItem(
                "eventzo_token",
                data.token
            );


            // Save user
            localStorage.setItem(
                "eventzo_user",
                JSON.stringify(data.user)
            );


            showMessage(
                message,
                "Login successful! 🎉",
                true
            );


            document.querySelector(
                "#loginModal form"
            ).reset();


            setTimeout(
                function () {

                    closeModals();

                    updateNavbar();

                },
                800
            );


        } else {

            showMessage(
                message,
                data.message ||
                "Login failed.",
                false
            );

        }

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            message,
            "Cannot connect to EVENTZO backend.",
            false
        );

    }

}


// =====================================================
// SHOW FORM MESSAGE
// =====================================================

function showMessage(
    element,
    text,
    success
) {

    if (!element) {
        return;
    }


    element.textContent =
        text;


    if (success) {

        element.style.color =
            "#00f5a0";

    } else {

        element.style.color =
            "#ff5c5c";

    }

}


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    const token =
        localStorage.getItem(
            "eventzo_token"
        );


    if (!token) {

        return null;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/me`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            localStorage.removeItem(
                "eventzo_token"
            );

            localStorage.removeItem(
                "eventzo_user"
            );

            return null;

        }


        return data.user;


    } catch (error) {

        console.error(
            "Get user error:",
            error
        );

        return null;

    }

}


// =====================================================
// LOGOUT
// =====================================================

async function logoutUser() {

    const token =
        localStorage.getItem(
            "eventzo_token"
        );


    try {

        if (token) {

            await fetch(
                `${API_URL}/api/auth/logout`,
                {
                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );

        }

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    localStorage.removeItem(
        "eventzo_token"
    );

    localStorage.removeItem(
        "eventzo_user"
    );


    location.reload();

}


// =====================================================
// UPDATE NAVBAR
// =====================================================

async function updateNavbar() {

    const user =
        await getCurrentUser();


    const navButtons =
        document.querySelector(
            ".nav-buttons"
        );


    if (!navButtons) {
        return;
    }


    if (user) {

        navButtons.innerHTML = `

            <span
                style="
                color:#00f5a0;
                font-weight:600;
                margin-right:10px;
                "
            >
                Hi, ${escapeHTML(user.name)}
            </span>

            <button
                class="login-btn"
                onclick="logoutUser()"
            >
                Logout
            </button>

        `;

    }

}


// =====================================================
// LOAD EVENTS
// =====================================================

async function loadEvents() {

    const loading =
        document.getElementById(
            "loading"
        );

    const container =
        document.getElementById(
            "eventsContainer"
        );

    const noEvents =
        document.getElementById(
            "noEvents"
        );


    if (loading) {

        loading.style.display =
            "block";

    }


    if (container) {

        container.innerHTML =
            "";

    }


    if (noEvents) {

        noEvents.style.display =
            "none";

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/events`
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load events"
            );

        }


        allEvents =
            data.events || [];


        renderEvents(
            allEvents
        );


    } catch (error) {

        console.error(
            "Load events error:",
            error
        );


        allEvents = [];


        if (loading) {

            loading.style.display =
                "none";

        }


        if (noEvents) {

            noEvents.style.display =
                "block";

            noEvents.querySelector(
                "h3"
            ).textContent =
                "Unable to load events";

            noEvents.querySelector(
                "p"
            ).textContent =
                "Make sure EVENTZO backend is running.";

        }

    }

}


// =====================================================
// RENDER EVENTS
// =====================================================

function renderEvents(events) {

    const loading =
        document.getElementById(
            "loading"
        );

    const container =
        document.getElementById(
            "eventsContainer"
        );

    const noEvents =
        document.getElementById(
            "noEvents"
        );


    if (loading) {

        loading.style.display =
            "none";

    }


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (!events || events.length === 0) {

        if (noEvents) {

            noEvents.style.display =
                "block";

        }

        return;

    }


    if (noEvents) {

        noEvents.style.display =
            "none";

    }


    events.forEach(
        function (event) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "event-card";


            const date =
                event.date
                    ? new Date(
                        event.date
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "Date TBA";


            const price =
                Number(event.price || 0);


            card.innerHTML = `

                <div class="event-image">

                    ${
                        event.image
                        ?
                        `<img
                            src="${escapeHTML(event.image)}"
                            alt="${escapeHTML(event.title)}"
                            style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            "
                        >`
                        :
                        `<div
                            style="
                            font-size:60px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            height:100%;
                            "
                        >
                            🎫
                        </div>`
                    }

                </div>


                <div class="event-content">

                    <span class="event-category">

                        ${escapeHTML(
                            event.category ||
                            "Other"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            event.title
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            event.description ||
                            "Join this amazing EVENTZO event."
                        )}

                    </p>


                    <div class="event-details">

                        <span>
                            📅 ${date}
                        </span>

                        <span>
                            🕐 ${escapeHTML(
                                event.time ||
                                "Time TBA"
                            )}
                        </span>

                        <span>
                            📍 ${escapeHTML(
                                event.location ||
                                "Location TBA"
                            )}
                        </span>

                    </div>


                    <div class="event-bottom">

                        <strong>

                            ${
                                price === 0
                                ? "FREE"
                                : "₹" +
                                  price.toLocaleString(
                                      "en-IN"
                                  )
                            }

                        </strong>


                        <span>

                            ${
                                event.availableSeats !== undefined
                                ? event.availableSeats +
                                  " seats left"
                                : ""
                            }

                        </span>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// =====================================================
// SEARCH EVENTS
// =====================================================

function searchEvents() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    const search =
        input.value
            .trim()
            .toLowerCase();


    const filtered =
        allEvents.filter(
            function (event) {

                return (

                    String(
                        event.title || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        event.description || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        event.category || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        event.location || ""
                    )
                    .toLowerCase()
                    .includes(search)

                );

            }
        );


    renderEvents(
        filtered
    );

}


// =====================================================
// FILTER EVENTS
// =====================================================

function filterEvents() {

    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (!filter) {
        return;
    }


    const category =
        filter.value;


    if (category === "all") {

        renderEvents(
            allEvents
        );

        return;

    }


    const filtered =
        allEvents.filter(
            function (event) {

                return String(
                    event.category || ""
                ).toLowerCase()
                ===
                category.toLowerCase();

            }
        );


    renderEvents(
        filtered
    );

}


// =====================================================
// SELECT CATEGORY
// =====================================================

function selectCategory(category) {

    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (filter) {

        filter.value =
            category;

    }


    filterEvents();


    scrollToEvents();

}


// =====================================================
// HTML ESCAPE
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


// =====================================================
// API CONNECTION TEST
// =====================================================

async function testAPI() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/test`
            );


        const data =
            await response.json();


        console.log(
            "API TEST:",
            data
        );


    } catch (error) {

        console.error(
            "API connection failed:",
            error
        );

    }

}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "EVENTZO initialized 🚀"
        );


        await testAPI();


        await loadEvents();


        await updateNavbar();

    }
);