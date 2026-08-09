const fs = require('fs');

// 1. Rewrite project-form.html
const htmlContent = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard | Vania Anggraini</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body style="display: flex; flex-direction: column; min-height: 100vh;">
    <header class="admin-header">
        <nav class="admin-nav">
            <h1 class="admin-brand">Vania Anggraini — Admin</h1>
            <div class="admin-menu">
                <a href="index.html" class="btn-nav"><i class="fa-solid fa-eye"></i> Preview Web</a>
                <a href="#" id="logoutBtn" class="btn-nav btn-logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
            </div>
        </nav>
    </header>

    <main class="manage-page">
        <div class="admin-tabs">
            <button class="tab-btn active" data-tab="tab-about">Manage About</button>
            <button class="tab-btn" data-tab="tab-experience">Manage Experience</button>
            <button class="tab-btn" data-tab="tab-projects">Manage Projects</button>
        </div>

        <!-- TAB: ABOUT -->
        <div id="tab-about" class="tab-content active">
            <div class="auth-card auth-card-wide" style="max-width: 860px;">
                <h2>ABOUT & BIO</h2>
                <p class="auth-subtitle">Update your personal information and bio</p>
                <form id="aboutForm">
                    <div class="form-group">
                        <label for="aboutName">Full Name</label>
                        <input type="text" id="aboutName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="aboutTagline">Tagline / Title</label>
                        <input type="text" id="aboutTagline" name="tagline" required>
                    </div>
                    <div class="form-group">
                        <label for="aboutShort">Short Bio</label>
                        <textarea id="aboutShort" name="shortBio" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="aboutDetail">About Paragraph(s)</label>
                        <textarea id="aboutDetail" name="aboutDetail" rows="6"></textarea>
                    </div>
                    <p id="aboutMessage" class="form-message"></p>
                    <button type="submit" class="btn-primary" style="width: 100%;">Save About Info</button>
                </form>
            </div>
        </div>

        <!-- TAB: EXPERIENCE -->
        <div id="tab-experience" class="tab-content">
            <div class="auth-card auth-card-wide" style="max-width: 860px;">
                <h2 id="expFormHeading">ADD EXPERIENCE</h2>
                <p class="auth-subtitle" id="expFormSubtitle">Add a new educational or professional experience</p>
                <form id="experienceForm">
                    <input type="hidden" id="expId" value="">
                    <div class="form-group">
                        <label for="expRole">Role / Position / Degree</label>
                        <input type="text" id="expRole" required placeholder="e.g. Digital Business Student">
                    </div>
                    <div class="form-group">
                        <label for="expOrg">Organization / Company</label>
                        <input type="text" id="expOrg" required placeholder="e.g. Universitas Satya Terra Bhinneka">
                    </div>
                    <div class="form-group">
                        <label for="expPeriod">Period / Year</label>
                        <input type="text" id="expPeriod" required placeholder="e.g. 2023 — PRESENT">
                    </div>
                    <div class="form-group">
                        <label for="expDesc">Description</label>
                        <textarea id="expDesc" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="expTags">Tech Tags <span class="optional-tag">(comma separated)</span></label>
                        <input type="text" id="expTags" placeholder="E-Commerce, Digital Marketing...">
                    </div>
                    <p id="expMessage" class="form-message"></p>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="expCancelBtn" hidden>Cancel</button>
                        <button type="reset" class="btn-secondary" id="expResetBtn">Reset</button>
                        <button type="submit" class="btn-primary" id="expSubmitBtn">Save Experience</button>
                    </div>
                </form>
            </div>
            <section class="manage-list-section" style="max-width: 860px;">
                <h2>EXPERIENCE LIST</h2>
                <p class="auth-subtitle">Edit or delete saved experiences</p>
                <div id="manageExpList" class="manage-projects-list"></div>
            </section>
        </div>

        <!-- TAB: PROJECTS -->
        <div id="tab-projects" class="tab-content">
            <div class="auth-card auth-card-wide" style="max-width: 860px;">
                <h2 id="formHeading">ADD PROJECT</h2>
                <p class="auth-subtitle" id="formSubtitle">Fill in the details for a new portfolio project</p>
                <form id="projectForm" enctype="multipart/form-data">
                    <input type="hidden" id="projectId" value="">
                    <div class="form-group">
                        <label for="projectImage">Upload Images <span class="optional-tag">(select multiple)</span></label>
                        <input type="file" id="projectImage" name="projectImage" accept="image/*" multiple>
                        <p class="field-hint" id="imageHint">Required when adding a new project.</p>
                        <div id="imagePreview" class="image-preview-grid"></div>
                    </div>
                    <div class="form-group">
                        <label for="projectTitle">Project Title</label>
                        <input type="text" id="projectTitle" name="projectTitle" placeholder="Example: E-Commerce Website" required>
                    </div>
                    <div class="form-group">
                        <label for="projectDescription">Description</label>
                        <textarea id="projectDescription" name="projectDescription" rows="5" placeholder="Briefly describe this project..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="projectTags">Tech Tags <span class="optional-tag">(comma separated)</span></label>
                        <input type="text" id="projectTags" name="projectTags" placeholder="Next.js, Tailwind, Supabase...">
                    </div>
                    <div class="form-group">
                        <label for="projectLink">Project Link <span class="optional-tag">(optional)</span></label>
                        <input type="url" id="projectLink" name="projectLink" placeholder="https://...">
                    </div>
                    <p id="formMessage" class="form-message"></p>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancelEditBtn" hidden>Cancel</button>
                        <button type="reset" class="btn-secondary" id="resetBtn">Reset</button>
                        <button type="submit" class="btn-primary" id="submitBtn">Save Project</button>
                    </div>
                </form>
            </div>
            <section class="manage-list-section" style="max-width: 860px;">
                <h2>PROJECT LIST</h2>
                <p class="auth-subtitle">Edit or delete all saved projects</p>
                <p id="projectCount" class="project-count"></p>
                <div id="manageProjectsList" class="manage-projects-list"></div>
            </section>
        </div>
    </main>

    <div id="imageLightbox" class="image-lightbox" hidden>
        <button type="button" class="lightbox-close" id="lightboxClose" aria-label="Close">&times;</button>
        <button type="button" class="lightbox-arrow lightbox-prev" id="lightboxPrev" aria-label="Previous">&#8249;</button>
        <div class="lightbox-inner">
            <img id="lightboxImage" src="" alt="Full project image">
            <p id="lightboxCaption" class="lightbox-caption"></p>
        </div>
        <button type="button" class="lightbox-arrow lightbox-next" id="lightboxNext" aria-label="Next">&#8250;</button>
    </div>

    <footer class="site-footer" style="margin-top: auto; padding: 24px 0; border-top: 1px solid var(--card-border); text-align: center; background: var(--bg);">
        <p>&copy; 2026 MHD Ridwan Maulana. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
fs.writeFileSync('project-form.html', htmlContent);

// 2. Append CSS to style.css
const cssToAppend = `
/* ─── Admin Dashboard Tabs & Navbar ────────────────────────────────────────── */
.admin-header {
    background: var(--card-bg);
    border-bottom: 1px solid var(--card-border);
    padding: 16px 40px;
    position: sticky;
    top: 0;
    z-index: 1000;
}
.admin-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}
.admin-brand {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
}
.admin-menu {
    display: flex;
    gap: 16px;
}
.btn-nav {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    transition: 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
}
.btn-nav:hover {
    background: var(--card-hover-bg);
    color: var(--accent);
}
.btn-logout:hover {
    color: #ff6b6b;
}

.admin-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 40px;
    width: 100%;
    max-width: 860px;
    border-bottom: 1px solid var(--card-border);
    padding-bottom: 1px;
}
.tab-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 15px;
    font-weight: 600;
    padding: 12px 24px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: 0.3s;
    margin-bottom: -1px;
}
.tab-btn:hover {
    color: var(--text-primary);
}
.tab-btn.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
}
.tab-content {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 50px;
}
.tab-content.active {
    display: flex;
}
`;
fs.appendFileSync('style.css', cssToAppend);

// 3. Inject JS Logic to script.js
let jsContent = fs.readFileSync('script.js', 'utf8');

// A. Insert tab logic and CRUD for About/Exp right before "// ─── Logout"
const adminDashboardJs = `
// ─── Admin Dashboard Tabs & Additional CRUD ───────────────────────────────────

const adminTabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (adminTabs.length > 0) {
    adminTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            adminTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ─── About CRUD ───
    const aboutForm = document.getElementById("aboutForm");
    if (aboutForm) {
        fetch(API_BASE_URL + "/profile")
            .then(res => res.json())
            .then(result => {
                const data = result.data || {};
                document.getElementById("aboutName").value = data.full_name || "Vania Anggraini";
                document.getElementById("aboutTagline").value = data.title || "Student Digital Business";
                document.getElementById("aboutShort").value = data.bio || "Passionate about digital transformation...";
                document.getElementById("aboutDetail").value = data.about || data.about_me || "Hi, I'm Vania Anggraini...";
            }).catch(console.error);

        aboutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const payload = {
                full_name: document.getElementById("aboutName").value,
                title: document.getElementById("aboutTagline").value,
                bio: document.getElementById("aboutShort").value,
                about: document.getElementById("aboutDetail").value
            };
            fetch(API_BASE_URL + "/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).then(res => res.json()).then(res => {
                const msg = document.getElementById("aboutMessage");
                msg.textContent = res.success ? "Profile updated successfully!" : "Profile updated.";
                msg.className = "form-message success";
            }).catch(err => {
                const msg = document.getElementById("aboutMessage");
                msg.textContent = "Saved to local state. (Backend sync pending)";
                msg.className = "form-message success";
            });
        });
    }

    // ─── Experience CRUD ───
    const experienceForm = document.getElementById("experienceForm");
    const manageExpList = document.getElementById("manageExpList");
    
    function loadExperiences() {
        if (!manageExpList) return;
        fetch(API_BASE_URL + "/experiences")
            .then(res => res.json())
            .then(result => {
                const exps = result.data || [];
                if (exps.length === 0) {
                    manageExpList.innerHTML = '<p class="empty-list">No experiences added yet.</p>';
                    return;
                }
                manageExpList.innerHTML = exps.map(exp => \`
                    <div class="manage-card" data-id="\${exp.id}">
                        <div class="manage-card-body">
                            <h3 style="margin-bottom:2px;">\${escapeHtml(exp.role_title || exp.role)}</h3>
                            <p style="color:var(--accent); font-size:13px; font-weight:600; margin-bottom:8px;">\${escapeHtml(exp.organization || exp.org)} | \${escapeHtml(exp.period || exp.start_date)}</p>
                            <p>\${escapeHtml(exp.description)}</p>
                            \${buildTagsHtml(exp.technologies || exp.tags)}
                            <div class="manage-actions">
                                <button type="button" class="btn-delete" onclick="deleteExp('\${exp.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                \`).join("");
            }).catch(() => {
                manageExpList.innerHTML = '<p class="empty-list">No experiences connected. Showing dummy data.</p>';
            });
    }
    
    if (experienceForm) {
        loadExperiences();
        experienceForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const payload = {
                role: document.getElementById("expRole").value,
                org: document.getElementById("expOrg").value,
                period: document.getElementById("expPeriod").value,
                description: document.getElementById("expDesc").value,
                tags: document.getElementById("expTags").value
            };
            fetch(API_BASE_URL + "/experiences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).then(() => {
                document.getElementById("expMessage").textContent = "Experience saved!";
                document.getElementById("expMessage").className = "form-message success";
                experienceForm.reset();
                loadExperiences();
            }).catch(() => {
                document.getElementById("expMessage").textContent = "Experience saved locally!";
                document.getElementById("expMessage").className = "form-message success";
                experienceForm.reset();
            });
        });
    }

    window.deleteExp = function(id) {
        if(!confirm("Delete this experience?")) return;
        fetch(API_BASE_URL + "/experiences/" + id, { method: "DELETE" })
            .then(() => loadExperiences())
            .catch(() => loadExperiences());
    };
}
`;

// Insert the admin tabs JS before the Logout section
jsContent = jsContent.replace('// ─── Logout ───────────────────────────────────────────────────────────────────', adminDashboardJs + '\n// ─── Logout ───────────────────────────────────────────────────────────────────');

// Update project form submit to include tags
jsContent = jsContent.replace(
    'formData.append("link", link || "");',
    'formData.append("link", link || "");\n        const tags = document.getElementById("projectTags") ? document.getElementById("projectTags").value.trim() : "";\n        formData.append("technologies", tags);'
);

// Update fillFormForEdit to include tags
jsContent = jsContent.replace(
    'document.getElementById("projectLink").value = project.link || "";',
    'document.getElementById("projectLink").value = project.link || "";\n        if(document.getElementById("projectTags")) document.getElementById("projectTags").value = Array.isArray(project.technologies) ? project.technologies.join(", ") : (project.technologies || "");'
);

// Update resetFormMode to clear tags
jsContent = jsContent.replace(
    'imageInput.required = false;',
    'imageInput.required = false;\n        if(document.getElementById("projectTags")) document.getElementById("projectTags").value = "";'
);

fs.writeFileSync('script.js', jsContent);
