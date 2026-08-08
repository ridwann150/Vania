console.log("Vania Anggraini | Portfolio loaded.");

const API_BASE_URL = "https://vania-backend.vercel.app/api";

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

const THEME_KEY = "portfolio_theme";

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = document.getElementById("themeIcon");
    if (icon) {
        icon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
    localStorage.setItem(THEME_KEY, theme);
}

(function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
})();

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const current = document.documentElement.getAttribute("data-theme");
        applyTheme(current === "dark" ? "light" : "dark");
    });
}

// ─── Mouse Spotlight Effect ───────────────────────────────────────────────────

const spotlight = document.getElementById("spotlight");
if (spotlight) {
    document.addEventListener("mousemove", function (e) {
        document.documentElement.style.setProperty("--mouse-x", e.clientX + "px");
        document.documentElement.style.setProperty("--mouse-y", e.clientY + "px");
    });
}

// ─── Hamburger / Mobile Sidebar ───────────────────────────────────────────────

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const mobileOverlay = document.getElementById("mobileOverlay");

function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    if (hamburgerBtn) {
        hamburgerBtn.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
    }
    if (mobileOverlay) mobileOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("open");
    if (hamburgerBtn) {
        hamburgerBtn.classList.add("active");
        hamburgerBtn.setAttribute("aria-expanded", "true");
    }
    if (mobileOverlay) mobileOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", function () {
        if (sidebar && sidebar.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}

if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeSidebar);
}

const sidebarNav = document.getElementById("sidebarNav");
if (sidebarNav) {
    sidebarNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });
}

// ─── Active nav link on scroll ────────────────────────────────────────────────

const navLinks = document.querySelectorAll(".nav-link[data-section]");
const sections = document.querySelectorAll(".section[id]");

function updateActiveNav() {
    if (!navLinks.length || !sections.length) return;
    let current = "";
    const scrollY = window.scrollY || window.pageYOffset;
    sections.forEach(function (section) {
        if (scrollY >= section.offsetTop - 140) {
            current = section.getAttribute("id");
        }
    });
    navLinks.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("data-section") === current);
    });
}

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

// ─── Auth helpers ─────────────────────────────────────────────────────────────

const AUTH_KEY = "isLoggedIn";

function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === "true";
}

function setLoggedIn(value) {
    if (value) {
        localStorage.setItem(AUTH_KEY, "true");
    } else {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem("adminToken");
    }
}

// ─── Admin Floating Badge ─────────────────────────────────────────────────────

(function syncAdminBadge() {
    var badge = document.getElementById("adminBadge");
    if (!badge) return;
    function updateBadge() {
        var loggedIn = localStorage.getItem(AUTH_KEY) === "true" || !!localStorage.getItem("adminToken");
        badge.hidden = !loggedIn;
    }
    updateBadge();
    window.addEventListener("storage", updateBadge);
})();

// ─── localStorage helpers ─────────────────────────────────────────────────────

var LS_KEYS = {
    about: "va_about",
    experiences: "va_experiences",
    projects: "va_projects"
};

function lsGet(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}

function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

// ─── HTML escape helper ───────────────────────────────────────────────────────

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
}

// ─── Build Tech Tags HTML ─────────────────────────────────────────────────────

function buildTagsHtml(technologies) {
    if (!technologies) return "";
    const arr = Array.isArray(technologies)
        ? technologies
        : String(technologies).split(",").map(function (t) { return t.trim(); }).filter(Boolean);
    if (arr.length === 0) return "";
    return '<div class="tech-tags">' +
        arr.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join("") +
        '</div>';
}

// ─── Carousel Lightbox ────────────────────────────────────────────────────────

var _lbImages = [];
var _lbIndex = 0;

function openLightbox(images, startIndex, caption) {
    var lightbox = document.getElementById("imageLightbox");
    if (!lightbox || !images || images.length === 0) return;
    _lbImages = images;
    _lbIndex = startIndex || 0;
    _renderLightboxSlide(caption || "");
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    var prevBtn = document.getElementById("lightboxPrev");
    var nextBtn = document.getElementById("lightboxNext");
    if (prevBtn) prevBtn.style.display = images.length > 1 ? "" : "none";
    if (nextBtn) nextBtn.style.display = images.length > 1 ? "" : "none";
}

function _renderLightboxSlide(caption) {
    var img = document.getElementById("lightboxImage");
    var captionEl = document.getElementById("lightboxCaption");
    if (!img) return;
    img.src = _lbImages[_lbIndex];
    img.alt = caption || "Project image";
    if (captionEl) {
        var count = _lbImages.length > 1 ? " (" + (_lbIndex + 1) + " / " + _lbImages.length + ")" : "";
        captionEl.textContent = (caption || "") + count;
    }
}

function lightboxPrev() {
    if (_lbImages.length <= 1) return;
    _lbIndex = (_lbIndex - 1 + _lbImages.length) % _lbImages.length;
    var captionEl = document.getElementById("lightboxCaption");
    var currentText = captionEl ? captionEl.textContent.replace(/ \(\d+ \/ \d+\)$/, "") : "";
    _renderLightboxSlide(currentText);
}

function lightboxNext() {
    if (_lbImages.length <= 1) return;
    _lbIndex = (_lbIndex + 1) % _lbImages.length;
    var captionEl = document.getElementById("lightboxCaption");
    var currentText = captionEl ? captionEl.textContent.replace(/ \(\d+ \/ \d+\)$/, "") : "";
    _renderLightboxSlide(currentText);
}

function closeLightbox() {
    var lightbox = document.getElementById("imageLightbox");
    var img = document.getElementById("lightboxImage");
    if (!lightbox) return;
    lightbox.hidden = true;
    if (img) img.src = "";
    _lbImages = [];
    _lbIndex = 0;
    document.body.style.overflow = "";
}

function initLightbox() {
    var lightbox = document.getElementById("imageLightbox");
    if (!lightbox) return;
    var closeBtn = document.getElementById("lightboxClose");
    var prevBtn = document.getElementById("lightboxPrev");
    var nextBtn = document.getElementById("lightboxNext");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", lightboxPrev);
    if (nextBtn) nextBtn.addEventListener("click", lightboxNext);
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
        if (lightbox.hidden) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") lightboxPrev();
        if (e.key === "ArrowRight") lightboxNext();
    });
    var touchStartX = 0;
    lightbox.addEventListener("touchstart", function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) {
            if (dx < 0) lightboxNext();
            else lightboxPrev();
        }
    }, { passive: true });
}

initLightbox();

// ─── Public Projects ──────────────────────────────────────────────────────────

var projectsGrid = document.getElementById("projectsGrid");
if (projectsGrid) {
    projectsGrid.innerHTML = '<p class="empty-list">Loading projects...</p>';

    var _localProjects = lsGet(LS_KEYS.projects);

    fetch(API_BASE_URL + "/projects")
        .then(function (response) { return response.json(); })
        .then(function (result) {
            var saved = result.data || [];
            if (saved.length > 0) {
                lsSet(LS_KEYS.projects, saved);
            } else {
                saved = _localProjects || [];
            }
            projectsGrid.innerHTML = "";
            if (saved.length === 0) {
                renderFallbackProjects();
            } else {
                renderProjectCards(saved);
            }
        })
        .catch(function () {
            projectsGrid.innerHTML = "";
            if (_localProjects && _localProjects.length > 0) {
                renderProjectCards(_localProjects);
            } else {
                renderFallbackProjects();
            }
        });
}

function renderProjectCards(saved) {
    if (!projectsGrid) return;
    saved.forEach(function (project, idx) {
        var imgs = project.images || [];
        var card = document.createElement("div");
        card.className = "projects-card" + (imgs.length === 0 ? " card-no-img" : "");

        if (imgs.length > 0) {
            card.setAttribute("data-project-idx", String(idx));
            card.setAttribute("title", "Click to view images");
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
        }

        var imgHtml = "";
        if (imgs.length > 0) {
            imgHtml = '<div class="card-img-wrap">' +
                '<img src="' + imgs[0] + '" alt="' + escapeHtml(project.title) + '" class="clickable-image">' +
                (imgs.length > 1 ? '<span class="img-count-badge"><i class="fa-solid fa-images"></i> ' + imgs.length + '</span>' : "") +
                '</div>';
        }

        var linkHtml = project.link
            ? '<a href="' + escapeHtml(project.link) + '" target="_blank" rel="noopener" class="project-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Project</a>'
            : "";

        var titleArrow = project.link
            ? '<i class="fa-solid fa-arrow-up-right-from-square ext-icon"></i>'
            : "";

        card.innerHTML =
            imgHtml +
            '<div class="card-content">' +
            '<h3>' + escapeHtml(project.title) + titleArrow + '</h3>' +
            '<p>' + escapeHtml(project.description) + '</p>' +
            (project.technologies ? buildTagsHtml(project.technologies) : "") +
            linkHtml +
            '</div>';

        projectsGrid.appendChild(card);
    });

    projectsGrid.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        var cardEl = e.target.closest("[data-project-idx]");
        if (!cardEl) return;
        var idx = parseInt(cardEl.getAttribute("data-project-idx"), 10);
        var project = saved[idx];
        if (project && project.images && project.images.length > 0) {
            openLightbox(project.images, 0, project.title);
        }
    });

    projectsGrid.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var cardEl = e.target.closest("[data-project-idx]");
        if (!cardEl) return;
        e.preventDefault();
        var idx = parseInt(cardEl.getAttribute("data-project-idx"), 10);
        var project = saved[idx];
        if (project && project.images && project.images.length > 0) {
            openLightbox(project.images, 0, project.title);
        }
    });
}

function renderFallbackProjects() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = "";
    var fallbacks = [
        {
            title: "Digital Business Case Study",
            description: "In-depth analysis of traditional retail transformation to omni-channel e-commerce, highlighting operational shifts, technology stack implementation, and ROI.",
            technologies: ["Business Strategy", "Data Analysis", "E-Commerce", "Market Research"]
        },
        {
            title: "E-Commerce Strategy Plan",
            description: "A comprehensive go-to-market strategy for a local brand entering the national market, including competitor analysis, pricing strategy, and digital marketing roadmap.",
            technologies: ["Digital Marketing", "Financial Modeling", "SEO", "Growth Hacking"]
        },
        {
            title: "UX Research for Fintech App",
            description: "Conducted user interviews and usability testing to improve the onboarding flow of a mobile payment application, reducing drop-off rates by 15%.",
            technologies: ["User Research", "Figma", "Usability Testing", "Wireframing"]
        }
    ];
    fallbacks.forEach(function (project) {
        var card = document.createElement("div");
        card.className = "projects-card card-no-img";
        card.innerHTML =
            '<div class="card-content">' +
            '<h3>' + escapeHtml(project.title) + '</h3>' +
            '<p>' + escapeHtml(project.description) + '</p>' +
            buildTagsHtml(project.technologies) +
            '</div>';
        projectsGrid.appendChild(card);
    });
}

// ─── Public Profile (About + Experience) ──────────────────────────────────────

function loadPublicProfile() {
    var sidebarNameEl = document.getElementById("sidebarName");
    var sidebarTitleEl = document.getElementById("sidebarTitle");
    var sidebarTaglineEl = document.getElementById("sidebarTagline");
    var aboutBodyEl = document.getElementById("aboutBody");
    var expListEl = document.getElementById("experienceList");
    var aboutLoaded = false;
    var expLoaded = false;

    // --- Load About from localStorage first ---
    var _localAbout = lsGet(LS_KEYS.about);
    if (_localAbout) {
        if (sidebarNameEl) sidebarNameEl.textContent = _localAbout.full_name || sidebarNameEl.textContent;
        if (sidebarTitleEl) sidebarTitleEl.textContent = _localAbout.title || sidebarTitleEl.textContent;
        if (sidebarTaglineEl) sidebarTaglineEl.textContent = _localAbout.bio || sidebarTaglineEl.textContent;
        if (aboutBodyEl) {
            aboutBodyEl.innerHTML = (_localAbout.about_me || "").split("\n").filter(Boolean).map(function (p) {
                return '<p>' + escapeHtml(p) + '</p>';
            }).join("");
        }
        aboutLoaded = true;
    }

    // --- Fetch About from API ---
    fetch(API_BASE_URL + "/profile")
        .then(function (res) { return res.json(); })
        .then(function (result) {
            var d = result.data || {};
            if (d.full_name) {
                lsSet(LS_KEYS.about, d);
                if (sidebarNameEl) sidebarNameEl.textContent = d.full_name;
                if (sidebarTitleEl) sidebarTitleEl.textContent = d.title || "";
                if (sidebarTaglineEl) sidebarTaglineEl.textContent = d.bio || "";
                if (aboutBodyEl) {
                    aboutBodyEl.innerHTML = (d.about_me || "").split("\n").filter(Boolean).map(function (p) {
                        return '<p>' + escapeHtml(p) + '</p>';
                    }).join("");
                }
                aboutLoaded = true;
            }
        })
        .catch(function () {});

    // --- Load Experience from localStorage first ---
    var _localExps = lsGet(LS_KEYS.experiences);
    if (_localExps && _localExps.length > 0 && expListEl) {
        expListEl.innerHTML = _localExps.map(renderExpCard).join("");
        expLoaded = true;
    }

    // --- Fetch Experience from API ---
    if (expListEl) {
        fetch(API_BASE_URL + "/experiences")
            .then(function (res) { return res.json(); })
            .then(function (result) {
                var exps = (result.data || []).length > 0 ? result.data : [];
                if (exps.length > 0) {
                    lsSet(LS_KEYS.experiences, exps);
                    expListEl.innerHTML = exps.map(renderExpCard).join("");
                    expLoaded = true;
                } else if (!expLoaded) {
                    expListEl.innerHTML = '<p class="empty-list">No experience to display yet.</p>';
                }
            })
            .catch(function () {});
    }
}

function renderExpCard(exp) {
    var period = escapeHtml(exp.period || exp.start_date || "");
    var role = escapeHtml(exp.role_title || exp.role || "");
    var org = escapeHtml(exp.organization || exp.org || "");
    var desc = escapeHtml(exp.description || "");
    return '<div class="exp-card">' +
        '<div class="exp-period">' + period + '</div>' +
        '<div class="exp-body">' +
        '<h3 class="exp-role">' + role + ' <span class="exp-dot">·</span><span class="exp-org">' + org + '</span></h3>' +
        '<p class="exp-desc">' + desc + '</p>' +
        (exp.technologies || exp.tags ? buildTagsHtml(exp.technologies || exp.tags) : "") +
        '</div></div>';
}

// ─── Auto-Generate ATS Resume ─────────────────────────────────────────────────

var downloadCvBtn = document.getElementById("downloadCvBtn");
if (downloadCvBtn) {
    downloadCvBtn.addEventListener("click", function () {
        var btn = this;
        var btnOriginalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
        btn.disabled = true;

        var cvContainer = document.createElement("div");
        cvContainer.style.cssText = "padding:40px;font-family:Arial,Helvetica,sans-serif;color:#000;background:#fff;width:750px;";
        cvContainer.innerHTML = [
            '<div style="text-align:center;margin-bottom:20px;">',
            '<h1 style="margin:0;font-size:24px;font-weight:bold;">Vania Anggraini</h1>',
            '<p style="margin:4px 0 0;font-size:14px;">Student Digital Business</p>',
            '<p style="margin:4px 0 0;font-size:12px;">vaniaangraini55@gmail.com</p>',
            '</div>',
            '<div style="margin-bottom:18px;">',
            '<h2 style="font-size:14px;font-weight:bold;border-bottom:1px solid #000;padding-bottom:3px;margin-bottom:8px;letter-spacing:1px;">PROFESSIONAL SUMMARY</h2>',
            '<p style="font-size:12px;line-height:1.6;margin:0;">Digital Business student passionate about exploring how technology reshapes the way businesses operate and grow. Skilled in business strategy, digital marketing, and emerging technologies with hands-on campus entrepreneurship experience.</p>',
            '</div>',
            '<div style="margin-bottom:18px;">',
            '<h2 style="font-size:14px;font-weight:bold;border-bottom:1px solid #000;padding-bottom:3px;margin-bottom:8px;letter-spacing:1px;">EDUCATION</h2>',
            '<div style="margin-bottom:10px;">',
            '<div style="display:flex;justify-content:space-between;">',
            '<strong style="font-size:13px;">Universitas Satya Terra Bhinneka</strong>',
            '<span style="font-size:12px;">2023 — Present</span>',
            '</div>',
            '<p style="margin:2px 0 5px;font-size:12px;font-style:italic;">S1 Digital Business</p>',
            '<ul style="margin:0;padding-left:18px;font-size:12px;line-height:1.6;">',
            '<li>Studying core business principles alongside digital strategy, e-commerce systems, and technology-driven business models.</li>',
            '<li>Actively involved in campus entrepreneurship programs.</li>',
            '</ul>',
            '</div>',
            '</div>',
            '<div style="margin-bottom:18px;">',
            '<h2 style="font-size:14px;font-weight:bold;border-bottom:1px solid #000;padding-bottom:3px;margin-bottom:8px;letter-spacing:1px;">SKILLS</h2>',
            '<p style="font-size:12px;line-height:1.6;margin:0;">E-Commerce &nbsp;|&nbsp; Digital Marketing &nbsp;|&nbsp; Business Strategy &nbsp;|&nbsp; Data Analytics &nbsp;|&nbsp; Market Research &nbsp;|&nbsp; SEO</p>',
            '</div>',
            '<div style="margin-bottom:18px;">',
            '<h2 style="font-size:14px;font-weight:bold;border-bottom:1px solid #000;padding-bottom:3px;margin-bottom:8px;letter-spacing:1px;">PROJECTS</h2>',
            '<ul style="margin:0;padding-left:18px;font-size:12px;line-height:1.7;">',
            '<li><strong>Digital Business Case Study</strong> — Analysis of retail-to-e-commerce transformation with ROI modeling.</li>',
            '<li><strong>E-Commerce Strategy Plan</strong> — Go-to-market strategy for a local brand entering the national market.</li>',
            '<li><strong>UX Research for Fintech App</strong> — Usability testing that reduced app onboarding drop-off rates by 15%.</li>',
            '</ul>',
            '</div>'
        ].join("");

        var wrapper = document.createElement("div");
        wrapper.style.cssText = "position:absolute;left:-9999px;top:0;";
        wrapper.appendChild(cvContainer);
        document.body.appendChild(wrapper);

        if (typeof html2pdf !== "undefined") {
            html2pdf().set({
                margin: 0.5,
                filename: "Vania_Anggraini_ATS_Resume.pdf",
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
            }).from(cvContainer).save().then(function () {
                document.body.removeChild(wrapper);
                btn.innerHTML = btnOriginalText;
                btn.disabled = false;
            });
        } else {
            document.body.removeChild(wrapper);
            btn.innerHTML = btnOriginalText;
            btn.disabled = false;
            alert("PDF library not loaded. Please refresh the page.");
        }
    });
}

// ─── Login Form ───────────────────────────────────────────────────────────────

var loginForm = document.getElementById("login-form");
if (loginForm) {
    if (isLoggedIn()) {
        window.location.href = "project-form.html";
    }

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var username = document.getElementById("username").value.trim();
        var password = document.getElementById("password").value;
        var loginError = document.getElementById("loginError");
        if (loginError) loginError.textContent = "";

        if (username === "vania" && password === "vaniacantik15") {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("adminToken", "vania-admin-token");
            window.location.href = "project-form.html";
            return;
        }

        fetch(API_BASE_URL + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
        .then(function (result) {
            if (result.ok) {
                localStorage.setItem("isLoggedIn", "true");
                if (result.data.token) localStorage.setItem("adminToken", result.data.token);
                window.location.href = "project-form.html";
            } else {
                if (loginError) loginError.textContent = result.data.message || "Username atau password salah!";
            }
        })
        .catch(function () {
            if (loginError) loginError.textContent = "Username atau password salah!";
        });
    });
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

var adminTabBtns = document.querySelectorAll(".tab-btn");
if (adminTabBtns.length > 0) {

    // Auth guard
    if (!isLoggedIn() && !localStorage.getItem("adminToken")) {
        alert("Akses ditolak. Silakan login terlebih dahulu.");
        window.location.href = "login.html";
    }

    // Tab switching
    var tabContents = document.querySelectorAll(".tab-content");
    adminTabBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            adminTabBtns.forEach(function (t) { t.classList.remove("active"); });
            tabContents.forEach(function (c) { c.classList.remove("active"); });
            btn.classList.add("active");
            document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
        });
    });

    // ── TAB 1: About & Bio ────────────────────────────────────────────────────

    var aboutForm = document.getElementById("aboutForm");
    if (aboutForm) {
        var _localAbout = lsGet(LS_KEYS.about);
        if (_localAbout) {
            document.getElementById("aboutName").value = _localAbout.full_name || "";
            document.getElementById("aboutTagline").value = _localAbout.title || "";
            document.getElementById("aboutShort").value = _localAbout.bio || "";
            document.getElementById("aboutDetail").value = _localAbout.about_me || "";
        }
        fetch(API_BASE_URL + "/profile")
            .then(function (res) { return res.json(); })
            .then(function (result) {
                var d = result.data || {};
                if (d.full_name) {
                    document.getElementById("aboutName").value = d.full_name;
                    document.getElementById("aboutTagline").value = d.title || "";
                    document.getElementById("aboutShort").value = d.bio || "";
                    document.getElementById("aboutDetail").value = d.about_me || "";
                    lsSet(LS_KEYS.about, d);
                }
            })
            .catch(function () {});

        aboutForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var msg = document.getElementById("aboutMessage");
            var payload = {
                full_name: document.getElementById("aboutName").value,
                title: document.getElementById("aboutTagline").value,
                bio: document.getElementById("aboutShort").value,
                about_me: document.getElementById("aboutDetail").value
            };
            lsSet(LS_KEYS.about, payload);
            msg.textContent = "Data Berhasil Disimpan!";
            msg.className = "form-message success";
            setTimeout(function () { msg.textContent = ""; }, 3000);
            fetch(API_BASE_URL + "/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).catch(function () {});
        });
    }

    // ── TAB 2: Experience CRUD ────────────────────────────────────────────────

    var experienceForm = document.getElementById("experienceForm");
    var manageExpList = document.getElementById("manageExpList");

    function loadExperiences() {
        if (!manageExpList) return;
        manageExpList.innerHTML = '<p class="empty-list">Loading...</p>';
        var _localExps = lsGet(LS_KEYS.experiences) || [];
        if (_localExps.length > 0) renderExpList(_localExps);
        fetch(API_BASE_URL + "/experiences")
            .then(function (res) { return res.json(); })
            .then(function (result) {
                var exps = result.data || [];
                if (exps.length > 0) { lsSet(LS_KEYS.experiences, exps); renderExpList(exps); }
                else if (_localExps.length === 0) manageExpList.innerHTML = '<p class="empty-list">No experiences yet. Add one above.</p>';
            })
            .catch(function () {
                if (_localExps.length === 0) manageExpList.innerHTML = '<p class="empty-list">Could not load experiences from server.</p>';
            });
    }

    function renderExpList(exps) {
        if (!manageExpList) return;
        if (exps.length === 0) { manageExpList.innerHTML = '<p class="empty-list">No experiences yet. Add one above.</p>'; return; }
        manageExpList.innerHTML = exps.map(function (exp) {
                    var role = escapeHtml(exp.role_title || exp.role || "");
                    var org = escapeHtml(exp.organization || exp.org || "");
                    var period = escapeHtml(exp.period || exp.start_date || "");
                    var desc = escapeHtml(exp.description || "");
                    var tags = buildTagsHtml(exp.technologies || exp.tags || "");
                    return '<div class="manage-card">' +
                        '<div class="manage-card-body">' +
                        '<h3>' + role + '</h3>' +
                        '<p style="color:var(--accent);font-size:13px;font-weight:600;margin:2px 0 8px;">' + org + ' &nbsp;|&nbsp; ' + period + '</p>' +
                        '<p>' + desc + '</p>' +
                        tags +
                        '<div class="manage-actions">' +
                        '<button type="button" class="btn-edit" data-exp-edit="' + exp.id + '"><i class="fa-solid fa-pen"></i> Edit</button>' +
                        '<button type="button" class="btn-delete" data-exp-delete="' + exp.id + '"><i class="fa-solid fa-trash"></i> Delete</button>' +
                        '</div></div></div>';
                }).join("");
    }

    if (experienceForm) {
        loadExperiences();

        experienceForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var msg = document.getElementById("expMessage");
            var editId = document.getElementById("expId").value;
            var payload = {
                role: document.getElementById("expRole").value.trim(),
                org: document.getElementById("expOrg").value.trim(),
                period: document.getElementById("expPeriod").value.trim(),
                description: document.getElementById("expDesc").value.trim(),
                tags: document.getElementById("expTags").value.trim()
            };
            var method = editId ? "PUT" : "POST";
            var url = editId ? API_BASE_URL + "/experiences/" + editId : API_BASE_URL + "/experiences";

            fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(function () {
                var exps = lsGet(LS_KEYS.experiences) || [];
                if (editId) {
                    var idx = exps.findIndex(function (x) { return String(x.id) === String(editId); });
                    if (idx > -1) { payload.id = editId; exps[idx] = payload; }
                } else {
                    payload.id = Date.now();
                    exps.push(payload);
                }
                lsSet(LS_KEYS.experiences, exps);
                msg.textContent = "Data Berhasil Disimpan!";
                msg.className = "form-message success";
                setTimeout(function () { msg.textContent = ""; }, 3000);
                experienceForm.reset();
                document.getElementById("expId").value = "";
                document.getElementById("expFormHeading").textContent = "ADD EXPERIENCE";
                document.getElementById("expCancelBtn").hidden = true;
                document.getElementById("expResetBtn").hidden = false;
                loadExperiences();
            })
            .catch(function () {
                var exps = lsGet(LS_KEYS.experiences) || [];
                payload.id = Date.now();
                exps.push(payload);
                lsSet(LS_KEYS.experiences, exps);
                msg.textContent = "Data Berhasil Disimpan!";
                msg.className = "form-message success";
                setTimeout(function () { msg.textContent = ""; }, 3000);
                experienceForm.reset();
                document.getElementById("expId").value = "";
                loadExperiences();
            });
        });

        document.getElementById("expCancelBtn").addEventListener("click", function () {
            experienceForm.reset();
            document.getElementById("expId").value = "";
            document.getElementById("expFormHeading").textContent = "ADD EXPERIENCE";
            document.getElementById("expFormSubtitle").textContent = "Add a new educational or professional experience";
            document.getElementById("expSubmitBtn").textContent = "Save Experience";
            this.hidden = true;
            document.getElementById("expResetBtn").hidden = false;
        });

        if (manageExpList) {
            manageExpList.addEventListener("click", function (e) {
                var editBtn = e.target.closest("[data-exp-edit]");
                var delBtn = e.target.closest("[data-exp-delete]");

                if (editBtn) {
                    var id = editBtn.getAttribute("data-exp-edit");
                    fetch(API_BASE_URL + "/experiences")
                        .then(function (res) { return res.json(); })
                        .then(function (result) {
                            var exp = (result.data || []).find(function (x) { return String(x.id) === String(id); });
                            if (!exp) return;
                            document.getElementById("expId").value = exp.id;
                            document.getElementById("expRole").value = exp.role_title || exp.role || "";
                            document.getElementById("expOrg").value = exp.organization || exp.org || "";
                            document.getElementById("expPeriod").value = exp.period || exp.start_date || "";
                            document.getElementById("expDesc").value = exp.description || "";
                            document.getElementById("expTags").value = Array.isArray(exp.technologies) ? exp.technologies.join(", ") : (exp.tags || "");
                            document.getElementById("expFormHeading").textContent = "EDIT EXPERIENCE";
                            document.getElementById("expFormSubtitle").textContent = "Update the selected experience";
                            document.getElementById("expSubmitBtn").textContent = "Update Experience";
                            document.getElementById("expCancelBtn").hidden = false;
                            document.getElementById("expResetBtn").hidden = true;
                            experienceForm.scrollIntoView({ behavior: "smooth", block: "start" });
                        });
                }

                if (delBtn) {
                    if (!confirm("Delete this experience?")) return;
                    var delId = delBtn.getAttribute("data-exp-delete");
                    fetch(API_BASE_URL + "/experiences/" + delId, { method: "DELETE" })
                        .then(function () { loadExperiences(); })
                        .catch(function () { loadExperiences(); });
                }
            });
        }
    }

    // ── TAB 3: Projects CRUD ──────────────────────────────────────────────────

    var projectForm = document.getElementById("projectForm");
    if (projectForm) {
        var imageInput = document.getElementById("projectImage");
        var imagePreview = document.getElementById("imagePreview");
        var projectIdInput = document.getElementById("projectId");
        var formHeading = document.getElementById("formHeading");
        var formSubtitle = document.getElementById("formSubtitle");
        var submitBtn = document.getElementById("submitBtn");
        var cancelEditBtn = document.getElementById("cancelEditBtn");
        var resetBtn = document.getElementById("resetBtn");
        var imageHint = document.getElementById("imageHint");
        var messageEl = document.getElementById("formMessage");

        var imageDataArray = [];
        var keepExistingImages = [];
        var selectedFiles = [];

        function renderPreviewGrid() {
            var all = keepExistingImages.concat(imageDataArray);
            if (all.length === 0) { imagePreview.innerHTML = ""; return; }
            imagePreview.innerHTML = all.map(function (src, i) {
                return '<div class="preview-thumb">' +
                    '<img src="' + src + '" alt="Preview ' + (i + 1) + '">' +
                    '<button type="button" class="preview-remove" data-index="' + i + '" aria-label="Remove">&times;</button>' +
                    '</div>';
            }).join("");
        }

        imagePreview.addEventListener("click", function (e) {
            var btn = e.target.closest(".preview-remove");
            if (!btn) return;
            var idx = parseInt(btn.getAttribute("data-index"), 10);
            if (idx < keepExistingImages.length) {
                keepExistingImages.splice(idx, 1);
            } else {
                var fi = idx - keepExistingImages.length;
                imageDataArray.splice(fi, 1);
                selectedFiles.splice(fi, 1);
            }
            renderPreviewGrid();
        });

        function resetProjectForm() {
            projectIdInput.value = "";
            imageDataArray = [];
            keepExistingImages = [];
            selectedFiles = [];
            imageInput.value = "";
            if (imageHint) imageHint.textContent = "Required when adding a new project.";
            if (formHeading) formHeading.textContent = "ADD PROJECT";
            if (formSubtitle) formSubtitle.textContent = "Fill in the details for a new portfolio project";
            if (submitBtn) submitBtn.textContent = "Save Project";
            if (cancelEditBtn) cancelEditBtn.hidden = true;
            if (resetBtn) resetBtn.hidden = false;
            if (messageEl) { messageEl.textContent = ""; messageEl.className = "form-message"; }
            projectForm.reset();
            renderPreviewGrid();
        }

        function fillFormForEdit(project) {
            projectIdInput.value = project.id;
            document.getElementById("projectTitle").value = project.title || "";
            document.getElementById("projectDescription").value = project.description || "";
            document.getElementById("projectLink").value = project.link || "";
            var tagsInput = document.getElementById("projectTags");
            if (tagsInput) tagsInput.value = Array.isArray(project.technologies) ? project.technologies.join(", ") : (project.technologies || "");
            keepExistingImages = (project.images || []).slice();
            imageDataArray = [];
            selectedFiles = [];
            imageInput.value = "";
            if (imageHint) imageHint.textContent = "Leave empty to keep existing images, or add new ones.";
            renderPreviewGrid();
            if (formHeading) formHeading.textContent = "EDIT PROJECT";
            if (formSubtitle) formSubtitle.textContent = "Update the selected project details";
            if (submitBtn) submitBtn.textContent = "Update Project";
            if (cancelEditBtn) cancelEditBtn.hidden = false;
            if (resetBtn) resetBtn.hidden = true;
            if (messageEl) { messageEl.textContent = ""; messageEl.className = "form-message"; }
            projectForm.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        function renderManageList() {
            var listEl = document.getElementById("manageProjectsList");
            if (!listEl) return;
            var dummyProjects = [
                { id: "dummy-1", title: "Digital Business Case Study", description: "In-depth analysis of traditional retail transformation to omni-channel e-commerce.", technologies: ["Business Strategy", "Data Analysis", "E-Commerce"], link: "" },
                { id: "dummy-2", title: "E-Commerce Strategy Plan", description: "Comprehensive go-to-market strategy for a local brand entering the national market.", technologies: ["Digital Marketing", "SEO", "Growth Hacking"], link: "" },
                { id: "dummy-3", title: "UX Research for Fintech App", description: "User interviews and usability testing to improve mobile payment app onboarding.", technologies: ["User Research", "Figma", "Usability Testing"], link: "" }
            ];
            listEl.innerHTML = '<p class="empty-list">Loading...</p>';
            var _localPrj = lsGet(LS_KEYS.projects);
            if (_localPrj && _localPrj.length > 0) {
                updateProjectCount(_localPrj);
                _renderProjectManageList(_localPrj);
                return;
            }
            renderDummyProjects(listEl, dummyProjects, "No projects yet. Add one using the form above.");
            fetch(API_BASE_URL + "/projects")
                .then(function (res) { return res.json(); })
                .then(function (result) {
                    var projects = result.data || [];
                    if (projects.length > 0) {
                        lsSet(LS_KEYS.projects, projects);
                        updateProjectCount(projects);
                        _renderProjectManageList(projects);
                    }
                })
                .catch(function () {
                    renderDummyProjects(listEl, dummyProjects, "No projects yet. Add one using the form above.");
                });
        }

        function renderDummyProjects(listEl, dummies, emptyMsg) {
            var countEl = document.getElementById("projectCount");
            if (countEl) countEl.textContent = "Showing dummy projects";
            listEl.innerHTML = dummies.map(function (p) {
                var linkHtml = '<span class="no-link">No link</span>';
                return '<div class="manage-card" data-id="' + p.id + '">' +
                    '<div class="manage-card-body">' +
                    '<h3>' + escapeHtml(p.title) + '</h3>' +
                    '<p>' + escapeHtml(p.description) + '</p>' +
                    buildTagsHtml(p.technologies) +
                    linkHtml +
                    '<div class="manage-actions">' +
                    '<button type="button" class="btn-edit" data-edit="' + p.id + '"><i class="fa-solid fa-pen"></i> Edit</button>' +
                    '<button type="button" class="btn-delete" data-delete="' + p.id + '"><i class="fa-solid fa-trash"></i> Delete</button>' +
                    '</div></div></div>';
            }).join("");
        }

        function updateProjectCount(projects) {
            var countEl = document.getElementById("projectCount");
            if (countEl) countEl.textContent = projects.length === 0 ? "No projects yet" : "Showing " + projects.length + " project" + (projects.length === 1 ? "" : "s");
        }

        function _renderProjectManageList(projects) {
            var listEl = document.getElementById("manageProjectsList");
            if (!listEl) return;
            var sorted = projects.slice().sort(function (a, b) { return Number(b.id) - Number(a.id); });
            updateProjectCount(sorted);
            if (sorted.length === 0) { listEl.innerHTML = '<p class="empty-list">No projects yet. Add one using the form above.</p>'; return; }
            listEl.innerHTML = sorted.map(function (project) {
                    var imgs = project.images || [];
                    var linkHtml = project.link
                        ? '<a href="' + escapeHtml(project.link) + '" target="_blank" rel="noopener" class="manage-link">Open Link</a>'
                        : '<span class="no-link">No link</span>';
                    var thumbsHtml = imgs.length > 0
                        ? '<div class="manage-thumbs">' +
                          imgs.map(function (src, i) {
                              return '<img src="' + src + '" alt="' + escapeHtml(project.title) + '" class="manage-thumb clickable-image" data-project-id="' + project.id + '" data-img-index="' + i + '">';
                          }).join("") + '</div>'
                        : "";
                    return '<div class="manage-card" data-id="' + project.id + '">' +
                        thumbsHtml +
                        '<div class="manage-card-body">' +
                        '<h3>' + escapeHtml(project.title) + '</h3>' +
                        '<p>' + escapeHtml(project.description) + '</p>' +
                        buildTagsHtml(project.technologies) +
                        linkHtml +
                        '<div class="manage-actions">' +
                        '<button type="button" class="btn-edit" data-edit="' + project.id + '"><i class="fa-solid fa-pen"></i> Edit</button>' +
                        '<button type="button" class="btn-delete" data-delete="' + project.id + '"><i class="fa-solid fa-trash"></i> Delete</button>' +
                        '</div></div></div>';
                }).join("");
        }

        // ── Persist project save to localStorage (for live-server + offline) ──

        function syncLocalProjects() {
            var _local = lsGet(LS_KEYS.projects) || [];
            lsSet(LS_KEYS.projects, _local);
        }

        function addLocalProject(project) {
            var _local = lsGet(LS_KEYS.projects) || [];
            project.id = "local_" + Date.now();
            _local.push(project);
            lsSet(LS_KEYS.projects, _local);
        }

        function removeLocalProject(id) {
            var _local = lsGet(LS_KEYS.projects) || [];
            _local = _local.filter(function (p) { return String(p.id) !== String(id); });
            lsSet(LS_KEYS.projects, _local);
        }

        imageInput.addEventListener("change", function () {
            var files = Array.from(this.files);
            if (!files.length) return;
            selectedFiles = selectedFiles.concat(files);
            var loaded = 0;
            files.forEach(function (file) {
                var reader = new FileReader();
                reader.onload = function (ev) {
                    imageDataArray.push(ev.target.result);
                    if (++loaded === files.length) renderPreviewGrid();
                };
                reader.readAsDataURL(file);
            });
            imageInput.value = "";
        });

        projectForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var title = document.getElementById("projectTitle").value.trim();
            var description = document.getElementById("projectDescription").value.trim();
            var link = document.getElementById("projectLink").value.trim();
            var tagsInput = document.getElementById("projectTags");
            var tags = tagsInput ? tagsInput.value.trim() : "";
            var editId = projectIdInput.value;

            if (!title || !description) {
                messageEl.textContent = "Title and description are required.";
                messageEl.className = "form-message error";
                return;
            }

            var localProject = {
                title: title,
                description: description,
                link: link || "",
                technologies: tags ? tags.split(",").map(function (t) { return t.trim(); }).filter(Boolean) : [],
                images: keepExistingImages.concat(imageDataArray)
            };

            if (editId) {
                var _localEdit = lsGet(LS_KEYS.projects) || [];
                _localEdit = _localEdit.map(function (p) {
                    return String(p.id) === String(editId) ? Object.assign({}, p, localProject, { id: p.id }) : p;
                });
                lsSet(LS_KEYS.projects, _localEdit);
            } else {
                addLocalProject(localProject);
            }

            messageEl.textContent = "Data Berhasil Disimpan!";
            messageEl.className = "form-message success";
            setTimeout(function () { messageEl.textContent = ""; }, 3000);

            var formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("link", link || "");
            formData.append("technologies", tags);
            selectedFiles.forEach(function (file) { formData.append("image", file); });
            var isEdit = !!editId;
            var url = isEdit ? API_BASE_URL + "/projects/" + editId : API_BASE_URL + "/projects";
            fetch(url, { method: isEdit ? "PUT" : "POST", body: formData })
                .then(function (res) { return res.json(); })
                .then(function (resData) {
                    renderManageList();
                    if (!resData.success) { messageEl.textContent = "Data Berhasil Disimpan! (Server sync pending)"; setTimeout(function () { messageEl.textContent = ""; }, 3000); }
                })
                .catch(function () { renderManageList(); });
        });

        projectForm.addEventListener("reset", function () {
            if (projectIdInput.value) return;
            setTimeout(function () {
                imageDataArray = [];
                keepExistingImages = [];
                selectedFiles = [];
                renderPreviewGrid();
                if (messageEl) { messageEl.textContent = ""; messageEl.className = "form-message"; }
            }, 0);
        });

        cancelEditBtn.addEventListener("click", resetProjectForm);

        var manageProjectsList = document.getElementById("manageProjectsList");
        if (manageProjectsList) {
            manageProjectsList.addEventListener("click", function (e) {
                var thumb = e.target.closest("[data-project-id][data-img-index]");
                if (thumb) {
                    var pid = thumb.getAttribute("data-project-id");
                    var startIdx = parseInt(thumb.getAttribute("data-img-index"), 10);
                    var proj = (lsGet(LS_KEYS.projects) || []).find(function (p) { return String(p.id) === String(pid); });
                    if (proj && proj.images && proj.images.length > 0) { openLightbox(proj.images, startIdx, proj.title); return; }
                    fetch(API_BASE_URL + "/projects")
                        .then(function (res) { return res.json(); })
                        .then(function (result) {
                            proj = (result.data || []).find(function (p) { return String(p.id) === String(pid); });
                            if (proj && proj.images && proj.images.length > 0) openLightbox(proj.images, startIdx, proj.title);
                        });
                    return;
                }

                var editBtn = e.target.closest("[data-edit]");
                if (editBtn) {
                    var id = editBtn.getAttribute("data-edit");
                    var projEdit = (lsGet(LS_KEYS.projects) || []).find(function (p) { return String(p.id) === String(id); });
                    if (projEdit) { fillFormForEdit(projEdit); return; }
                    fetch(API_BASE_URL + "/projects")
                        .then(function (res) { return res.json(); })
                        .then(function (result) {
                            projEdit = (result.data || []).find(function (p) { return String(p.id) === String(id); });
                            if (projEdit) fillFormForEdit(projEdit);
                        });
                    return;
                }

                var delBtn = e.target.closest("[data-delete]");
                if (delBtn) {
                    if (!confirm("Are you sure you want to delete this project?")) return;
                    var delId = delBtn.getAttribute("data-delete");
                    removeLocalProject(delId);
                    messageEl.textContent = "Data Berhasil Disimpan!";
                    messageEl.className = "form-message success";
                    setTimeout(function () { messageEl.textContent = ""; }, 3000);
                    if (String(projectIdInput.value) === String(delId)) resetProjectForm();
                    renderManageList();
                    fetch(API_BASE_URL + "/projects/" + delId, { method: "DELETE" }).catch(function () {});
                }
            });
        }

        renderManageList();
    }
}

// ─── Public Profile (About + Experience) ──────────────────────────────────────

loadPublicProfile();

// ─── Logout ───────────────────────────────────────────────────────────────────

var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setLoggedIn(false);
        window.location.href = "login.html";
    });
}
var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setLoggedIn(false);
        window.location.href = "login.html";
    });
}
