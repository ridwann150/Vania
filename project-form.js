// ─── Admin Dashboard (project-form.html) ──────────────────────────────────────
// Berisi CRUD About, Experience, dan Projects yang dulu berada di script.js.
// Depend pada helper global dari script.js: lsGet, lsSet, LS_KEYS, escapeHtml,
// buildTagsHtml, openLightbox, API_BASE_URL, isLoggedIn, setLoggedIn.

(function () {
    if (typeof document === "undefined") return;

    var adminTabBtns = document.querySelectorAll(".tab-btn");
    if (adminTabBtns.length === 0) return;

    // Auth guard
    if (!isLoggedIn() && !localStorage.getItem("adminToken")) {
        alert("Akses ditolak. Silakan login terlebih dahulu.");
        window.location.href = "login.html";
    }

    // ─── Tab switching ────────────────────────────────────────────────────────

    var tabContents = document.querySelectorAll(".tab-content");
    adminTabBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            adminTabBtns.forEach(function (t) { t.classList.remove("active"); });
            tabContents.forEach(function (c) { c.classList.remove("active"); });
            btn.classList.add("active");
            var target = document.getElementById(btn.getAttribute("data-tab"));
            if (target) target.classList.add("active");
        });
    });

    // ─── TAB 1: About & Bio ────────────────────────────────────────────────────

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

    // ─── TAB 2: Experience CRUD ────────────────────────────────────────────────

    var experienceForm = document.getElementById("experienceForm");
    var manageExpList = document.getElementById("manageExpList");

    function loadExperiences() {
        if (!manageExpList) return;
        manageExpList.innerHTML = '<p class="empty-list">Loading...</p>';
        var _localExps = lsGet(LS_KEYS.experiences) || [];
        if (_localExps.length > 0) {
            renderExpList(_localExps);
            fetch(API_BASE_URL + "/experiences")
                .then(function (res) { return res.json(); })
                .then(function (result) {
                    var exps = result.data || [];
                    if (exps.length > 0) { lsSet(LS_KEYS.experiences, exps); renderExpList(exps); }
                })
                .catch(function () {});
        } else {
            fetch(API_BASE_URL + "/experiences")
                .then(function (res) { return res.json(); })
                .then(function (result) {
                    var exps = result.data || [];
                    if (exps.length > 0) { lsSet(LS_KEYS.experiences, exps); renderExpList(exps); }
                    else manageExpList.innerHTML = '<p class="empty-list">No experiences yet. Add one above.</p>';
                })
                .catch(function () {
                    manageExpList.innerHTML = '<p class="empty-list">Could not load experiences from server.</p>';
                });
        }
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
                document.getElementById("expFormSubtitle").textContent = "Add a new educational or professional experience";
                document.getElementById("expSubmitBtn").textContent = "Save Experience";
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
                document.getElementById("expFormHeading").textContent = "ADD EXPERIENCE";
                document.getElementById("expCancelBtn").hidden = true;
                document.getElementById("expResetBtn").hidden = false;
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
                    var matchExp = (lsGet(LS_KEYS.experiences) || []).find(function (x) { return String(x.id) === String(id); });
                    if (matchExp) { fillExpForm(matchExp); return; }
                    fetch(API_BASE_URL + "/experiences")
                        .then(function (res) { return res.json(); })
                        .then(function (result) {
                            var exp = (result.data || []).find(function (x) { return String(x.id) === String(id); });
                            if (exp) fillExpForm(exp);
                        });
                }

                if (delBtn) {
                    if (!confirm("Delete this experience?")) return;
                    var delId = delBtn.getAttribute("data-exp-delete");
                    deleteExperience(delId);
                }
            });
        }
    }

    function fillExpForm(exp) {
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
    }

    // ─── Delete Experience (full sync: API → localStorage → re-render) ─────────

    function deleteExperience(id) {
        // 1. Kirim HTTP DELETE ke backend terlebih dahulu.
        fetch(API_BASE_URL + "/experiences/" + id, { method: "DELETE" })
            .then(function () {
                removeLocalExperience(id);
                renderExpList(lsGet(LS_KEYS.experiences) || []);
            })
            .catch(function () {
                // 2. Jika API gagal/offline, tetap hapus dari localStorage agar
                //    data tidak kembali tampil lewat fallback dummy.
                removeLocalExperience(id);
                renderExpList(lsGet(LS_KEYS.experiences) || []);
            });
    }

    function removeLocalExperience(id) {
        var exps = lsGet(LS_KEYS.experiences) || [];
        exps = exps.filter(function (x) { return String(x.id) !== String(id); });
        lsSet(LS_KEYS.experiences, exps);
    }

    // ─── TAB 3: Projects CRUD ──────────────────────────────────────────────────

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

        if (imagePreview) {
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
        }

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

        // Tampilkan project dari localStorage dulu, lalu sinkronkan dari API.
        function renderManageList() {
            var listEl = document.getElementById("manageProjectsList");
            if (!listEl) return;
            listEl.innerHTML = '<p class="empty-list">Loading...</p>';
            var _localPrj = lsGet(LS_KEYS.projects);
            if (_localPrj && _localPrj.length > 0) {
                updateProjectCount(_localPrj);
                _renderProjectManageList(_localPrj);
            }
            fetch(API_BASE_URL + "/projects")
                .then(function (res) { return res.json(); })
                .then(function (result) {
                    var projects = result.data || [];
                    if (projects.length > 0) {
                        lsSet(LS_KEYS.projects, projects);
                        updateProjectCount(projects);
                        _renderProjectManageList(projects);
                    } else if (!_localPrj || _localPrj.length === 0) {
                        updateProjectCount([]);
                        listEl.innerHTML = '<p class="empty-list">No projects yet. Add one using the form above.</p>';
                    }
                })
                .catch(function () {
                    if (!_localPrj || _localPrj.length === 0) {
                        updateProjectCount([]);
                        listEl.innerHTML = '<p class="empty-list">No projects yet. Add one using the form above.</p>';
                    }
                });
        }

        function updateProjectCount(projects) {
            var countEl = document.getElementById("projectCount");
            if (countEl) countEl.textContent = projects.length === 0 ? "No projects yet" : "Showing " + projects.length + " project" + (projects.length === 1 ? "" : "s");
        }

        function _renderProjectManageList(projects) {
            var listEl = document.getElementById("manageProjectsList");
            if (!listEl) return;
            var sorted = projects.slice().sort(function (a, b) { return String(b.id).localeCompare(String(a.id)); });
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

        // ── Persist project ke localStorage (untuk live-server + offline) ──

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

        if (imageInput) {
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
        }

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
                .then(function (res) { return res.json().catch(function () { return {}; }); })
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
                    deleteProject(delId);
                }
            });
        }

        renderManageList();
    }

    // ─── Delete Project (full sync: API → localStorage → re-render) ───────────

    function deleteProject(id) {
        // 1. Kirim HTTP DELETE ke API Backend Vercel → hapus dari Supabase.
        fetch(API_BASE_URL + "/projects/" + encodeURIComponent(id), { method: "DELETE" })
            .then(function () {
                removeLocalProject(id);
                clearDeletedProjectMemory(id);
                if (String(projectIdInput.value) === String(id)) resetProjectFormEx();
                renderManageList();
            })
            .catch(function () {
                // 2. Jika API gagal (offline/id lokal), tetap hapus dari localStorage.
                removeLocalProject(id);
                clearDeletedProjectMemory(id);
                if (String(projectIdInput.value) === String(id)) resetProjectFormEx();
                renderManageList();
            });
    }

    // Bersihkan objek project yg dihapus dari memori frontend + localStorage keys.
    function clearDeletedProjectMemory(id) {
        var keys = ["va_projects", "portfolio_projects", "projects"];
        keys.forEach(function (k) {
            try {
                var arr = JSON.parse(localStorage.getItem(k)) || [];
                if (Array.isArray(arr)) {
                    arr = arr.filter(function (p) { return p && String(p.id) !== String(id); });
                    localStorage.setItem(k, JSON.stringify(arr));
                } else if (arr && typeof arr === "object") {
                    var newObj = {};
                    Object.keys(arr).forEach(function (key) {
                        if (key !== id) newObj[key] = arr[key];
                    });
                    localStorage.setItem(k, JSON.stringify(newObj));
                }
            } catch (e) {}
        });
    }

    function resetProjectFormEx() {
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
})();