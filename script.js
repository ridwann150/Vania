console.log("Vania Anggraini | Portfolio loaded.");

const API_BASE_URL = "https://vania-backend.vercel.app/api";

function getAuthHeaders() {
    const headers = { "Pragma": "no-cache", "Cache-Control": "no-cache, no-store" };
    const token = localStorage.getItem("adminToken");
    if (token) headers["Authorization"] = "Bearer " + token;
    return headers;
}

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

// ─── Verbal cache cleanup ──────────────────────────────────────────────────────

function clearPublicCacheOnly() {
    ['va_about', 'va_experiences', 'va_projects', 'va_profile_cache'].forEach(function (key) {
        localStorage.removeItem(key);
    });
}

// ─── Admin Floating Badge ─────────────────────────────────────────────────────

(function syncAdminBadge() {
    var badge = document.getElementById("adminBadge");
    var drawerAdmin = document.getElementById("adminNavLink");
    var drawerAdminLabel = document.getElementById("adminNavLabel");
    if (!badge && !drawerAdmin) return;
    function updateBadge() {
        var loggedIn = localStorage.getItem(AUTH_KEY) === "true" || !!localStorage.getItem("adminToken");
        if (badge) badge.hidden = !loggedIn;
        if (drawerAdmin) {
            drawerAdmin.href = loggedIn ? "project-form.html" : "login.html";
            if (drawerAdminLabel) drawerAdminLabel.textContent = loggedIn ? "⚙️ Admin Dashboard" : "🔒 Admin Login";
        }
    }
    updateBadge();
    window.addEventListener("storage", updateBadge);
})();

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

function loadPublicProjects() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '<p class="empty-list">Loading projects...</p>';

    fetch(API_BASE_URL + "/projects", { cache: "no-store", headers: { "Pragma": "no-cache", "Cache-Control": "no-cache, no-store" } })
        .then(function (response) {
            if (!response.ok) throw new Error("projects fetch failed");
            return response.json();
        })
        .then(function (result) {
            var saved = result.data || [];
            projectsGrid.innerHTML = "";
            if (saved.length === 0) {
                renderEmptyProjects();
            } else {
                renderProjectCards(saved);
            }
        })
        .catch(function () {
            projectsGrid.innerHTML = "";
            renderEmptyProjects();
        });
}

if (projectsGrid) loadPublicProjects();

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

function renderEmptyProjects() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '<p class="empty-list">No projects to display yet.</p>';
}

// ─── Public Profile (About + Experience) ──────────────────────────────────────

function loadPublicProfile() {
    var aboutBodyEl = document.getElementById("aboutBody");

    function renderProfileData(data) {
        var name = data.full_name || "";
        var tagline = data.title || "";
        var bio = data.bio || "";

        // Isi elemen Mobile DAN Desktop secara bersamaan.
        document.querySelectorAll("#profile-name, #mobile-name, .profile-name").forEach(function (el) {
            if (name) el.textContent = name;
        });
        document.querySelectorAll("#profile-tagline, #mobile-tagline, .profile-tagline").forEach(function (el) {
            el.textContent = tagline;
        });
        document.querySelectorAll("#profile-bio, #mobile-bio, .profile-bio").forEach(function (el) {
            el.textContent = bio;
        });

        if (aboutBodyEl && data.about_me) {
            aboutBodyEl.innerHTML = (data.about_me || "").split("\n").filter(Boolean).map(function (p) {
                return '<p>' + escapeHtml(p) + '</p>';
            }).join("");
        }
    }

    // ── Fetch fresh About/Profile from API (single source of truth, no cache) ─
    fetch(API_BASE_URL + "/profile", { cache: "no-store", headers: { "Pragma": "no-cache", "Cache-Control": "no-cache, no-store" } })
        .then(function (res) {
            if (!res.ok) throw new Error("profile fetch failed");
            return res.json();
        })
        .then(function (result) {
            renderProfileData(result.data || {});
        })
        .catch(function () {
            if (aboutBodyEl) {
                aboutBodyEl.innerHTML = '<p class="empty-list">No about content to display yet.</p>';
            }
        });
}

function loadPublicExperiences() {
    var expListEl = document.getElementById("experienceList");
    if (!expListEl) return;

    function renderExperienceList(exps) {
        if (exps && exps.length > 0) {
            expListEl.innerHTML = exps.map(renderExpCard).join("");
        } else {
            expListEl.innerHTML = '<p class="empty-list">No experience to display yet.</p>';
        }
    }

    // ── Fetch fresh Experience from API (single source of truth, no cache) ──
    fetch(API_BASE_URL + "/experiences", { cache: "no-store", headers: { "Pragma": "no-cache", "Cache-Control": "no-cache, no-store" } })
        .then(function (res) {
            if (!res.ok) throw new Error("experiences fetch failed");
            return res.json();
        })
        .then(function (result) {
            renderExperienceList(result.data || []);
        })
        .catch(function () {
            renderExperienceList([]);
        });
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


// ─── Public Profile (About + Experience) ──────────────────────────────────────

loadPublicProfile();
loadPublicExperiences();

// Muat ulang data segar saat kembali ke halaman (mis. dari bfcache mobile),
// agar hasil edit admin langsung terlihat di mobile maupun desktop.
window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
        loadPublicProfile();
        loadPublicExperiences();
        loadPublicProjects();
    }
});

// ─── Logout ───────────────────────────────────────────────────────────────────

var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setLoggedIn(false);
        window.location.href = "login.html";
    });
}
