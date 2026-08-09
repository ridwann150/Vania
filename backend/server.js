// server.js - Berkas utama untuk menjalankan server Express.js (ES Module)
// Express digunakan untuk membuat web server dan menangani request HTTP.

// dotenv memuat variabel dari file .env (contoh: DATABASE_URL)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'node:crypto';

// Prisma Client adalah ORM untuk mengakses PostgreSQL.
// Prisma 7 membutuhkan driver adapter (PrismaPg) untuk koneksi ke database.
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Supabase client untuk upload gambar ke Storage Bucket
import { createClient } from '@supabase/supabase-js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: izinkan akses dari frontend Vercel production.
// Auth menggunakan localStorage (bukan cookie), jadi credentials tidak perlu.
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
}));

// Dukung preflight (OPTIONS) secara eksplisit untuk semua route.
// (Express 5 / path-to-regexp v8: gunakan '*splat' sebagai wildcard root.)
app.options('*splat', cors());

// Express middleware untuk membaca request body berformat JSON
app.use(express.json());

// Multer: parsing multipart/form-data untuk upload gambar (disimpan di memori).
// limits.files = batas berapa banyak field file yang diterima (di sini 20 agar
// tetap aman melebihi kebutuhan 5-10 gambar sekaligus).
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 20 }
});

// Mapping MIME type ke ekstensi (untuk penamaan file di bucket).
const MIME_TO_EXT = {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg'
};

// Inisialisasi client Supabase (untuk upload ke Storage).
// SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus disediakan via environment.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = process.env.STORAGE_BUCKET || 'project-images';

let supabase = null;
if (process.env.SUPABASE_MOCK === '1') {
    // In-memory fake Supabase Storage for local testing (no real credentials needed).
    const store = new Map();
    let counter = 0;
    supabase = {
        storage: {
            from: () => ({
                upload: async (path, buffer) => {
                    counter++;
                    store.set(path, buffer);
                    return { data: { path }, error: null };
                },
                getPublicUrl: (path) => ({
                    data: { publicUrl: `https://mock.example/${encodeURIComponent(path)}` }
                })
            })
        }
    };
} else if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

// Upload satu file Buffer ke Supabase Storage, kembalikan URL publiknya.
async function uploadImageToSupabase(file) {
    if (!supabase) {
        throw new Error('Supabase client not initialized (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)');
    }
    const ext = MIME_TO_EXT[file.mimetype] || 'bin';
    // Nama file unik agar tidak menimpa file lain di bucket yang sama
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        throw error;
    }

    const { data: publicData } = supabase.storage
        .from(storageBucket)
        .getPublicUrl(data.path);

    return publicData?.publicUrl || null;
}

// Upload banyak file ke Supabase Storage dan kembalikan array URL publik.
// Setiap file di-upload secara paralel; hanya file yang berhasil masuk array hasil.
async function uploadFilesToSupabase(files) {
    const list = Array.isArray(files) ? files : (files ? [files] : []);
    if (list.length === 0) return [];

    const results = await Promise.allSettled(list.map((file) => uploadImageToSupabase(file)));

    const urls = [];
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
            urls.push(result.value);
        }
    }
    return urls;
}

// Regex untuk memvalidasi format UUID (karena id Project/Experience adalah UUID)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Middleware untuk mengecek apakah :id adalah UUID yang valid
// Berguna agar id tidak valid (misal "abc") langsung dijawab 404, bukan error 500
app.use('/api/projects/:id', (req, res, next) => {
    if (!UUID_PATTERN.test(req.params.id)) {
        return res.status(404).json({
            success: false,
            message: "Project not found."
        });
    }
    next();
});

app.use('/api/experiences/:id', (req, res, next) => {
    if (!UUID_PATTERN.test(req.params.id)) {
        return res.status(404).json({
            success: false,
            message: "Experience not found."
        });
    }
    next();
});

// Route dasar agar URL root tidak memicu error di Vercel
app.get('/', (req, res) => {
    res.send('Backend OK');
});

// Endpoint sederhana untuk pengetesan awal
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: "Backend server is running successfully!"
    });
});

// POST /api/login - Memverifikasi kredensial admin ke backend
// Frontend akan mengirim username & password, lalu kita cek di server.
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Ambil kredensial yang didefinisikan di file .env
        const validUsername = process.env.ADMIN_USERNAME;
        const validPassword = process.env.ADMIN_PASSWORD;

        if (username === validUsername && password === validPassword) {
            res.json({
                success: true,
                token: "authenticated",
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Incorrect username or password."
            });
        }
    } catch (error) {
        console.error(error);
        res.status(200).json({
            success: false,
            message: "Login failed."
        });
    }
});

// ─── Profile CRUD (About) ──────────────────────────────────────────────────────

// Serializer: selaraskan nama field API dengan yang diharapkan frontend
// (full_name/title/about_me) padahal kolom DB adalah name/tagline/bio.
function serializeProfile(p) {
    if (!p) return null;
    return {
        id: p.id,
        name: p.name || "",
        full_name: p.name || "",
        tagline: p.tagline || "",
        title: p.tagline || "",
        bio: p.bio || "",
        about_me: "",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
    };
}

// Semua muatan payload yang sama untuk /api/profile, /api/about, dan /api/user.
function profilePayload(body) {
    function str(v) { return typeof v === 'string' ? v.trim() : ''; }
    return {
        name: str(body.name ?? body.full_name),
        tagline: str(body.tagline ?? body.title),
        bio: str(body.bio ?? body.short_bio)
    };
}

// Ambil (atau buat bila belum ada) data profil tunggal.
async function getOrCreateProfile() {
    const PROFILE_ID = 'vania-profile';
    let profile = await prisma.profile.findUnique({ where: { id: PROFILE_ID } });
    if (!profile) {
        try {
            const existing = await prisma.profile.findFirst();
            if (existing) return existing;
        } catch (e) {}
        profile = await prisma.profile.create({
            data: {
                id: PROFILE_ID,
                name: "Vania Anggraini",
                tagline: "Student Digital Business",
                bio: "Passionate about digital transformation, business strategy, and the intersection of technology and commerce."
            }
        });
    }
    return profile;
}

// GET /api/profile (alias /api/about, /api/user) - Mengambil data profil/about.
async function handleGetProfile(req, res) {
    try {
        const profile = await getOrCreateProfile();
        res.json({ success: true, data: serializeProfile(profile) });
    } catch (error) {
        console.error(error);
        // Tetap kembalikan JSON aman (objek kosong) dengan HTTP 200 agar UI tidak crash.
        res.status(200).json({ success: false, data: {}, message: "Failed to fetch profile." });
    }
}

app.get('/api/profile', handleGetProfile);
app.get('/api/about', handleGetProfile);
app.get('/api/user', handleGetProfile);

// PUT /api/profile (alias /api/about, /api/user) - Memperbarui data profil
//
async function handlePutProfile(req, res) {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ success: false, message: "Invalid profile payload." });
        }
        const data = profilePayload(req.body);
        const existing = await getOrCreateProfile();
        const profile = await prisma.profile.update({ where: { id: existing.id }, data });
        res.json({ success: true, data: serializeProfile(profile) });
    } catch (error) {
        console.error(error);
        // Jangan tutup data jika DB gagal — kembalikan 200 + payload kosong.
        res.status(200).json({ success: false, data: {}, message: "Failed to update profile." });
    }
}

app.put('/api/profile', handlePutProfile);
app.put('/api/about', handlePutProfile);
app.put('/api/user', handlePutProfile);

// Serializer project: DB menyimpan imageUrl/projectUrl/techStack, sedangkan
// frontend membaca images/link/technologies. Selaraskan keduanya.
function serializeProject(p) {
    if (!p) return null;
    return {
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl || "",
        images: (p.imageUrl ? [p.imageUrl] : []),
        projectUrl: p.projectUrl || p.link || "",
        link: p.projectUrl || p.link || "",
        techStack: p.techStack || [],
        technologies: p.techStack || [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
    };
}

function toArray(val) {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(t => t.trim()).filter(Boolean);
    return [];
}

// GET /api/projects - Mengambil semua project dari database
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: projects.map(serializeProject)
        });
    } catch (error) {
        console.error(error);
        // Tetap kembalikan JSON aman (array kosong) dengan HTTP 200 agar UI tidak crash.
        res.status(200).json({
            success: false,
            data: [],
            message: "Failed to fetch projects."
        });
    }
});

// GET /api/projects/:id - Mengambil satu project berdasarkan id
app.get('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        res.json({
            success: true,
            data: serializeProject(project)
        });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            success: false,
            data: null,
            message: "Failed to fetch project."
        });
    }
});

// POST /api/projects - Menambah project baru (multipart/form-data)
app.post('/api/projects', upload.array('image', 20), async (req, res) => {
    try {
        const { title, description, link, technologies } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            });
        }

        // Gambar dikirim sebagai file multipart -> di-upload ke Supabase Storage,
        // lalu URL publiknya disimpan ke kolom imageUrl.
        const images = await uploadFilesToSupabase(req.files);

        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                projectUrl: link || "",
                imageUrl: images[0] || "",
                techStack: toArray(technologies)
            }
        });

        res.status(201).json({
            success: true,
            data: serializeProject(newProject)
        });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            success: false,
            data: null,
            message: "Failed to create project."
        });
    }
});

// PUT /api/projects/:id - Memperbarui project yang sudah ada (multipart/form-data)
app.put('/api/projects/:id', upload.array('image', 20), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, link, technologies } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            });
        }

        // Cek apakah project ada
        const existing = await prisma.project.findUnique({
            where: { id }
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // Gambar baru dikirim sebagai file -> di-upload ke Supabase Storage.
        // Jika ada gambar baru gunakan URL hasil upload; jika tidak, pertahankan.
        const images = await uploadFilesToSupabase(req.files);
        const imageUrl = images.length > 0 ? images[0] : (existing.imageUrl || "");

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                title,
                description,
                projectUrl: link || existing.projectUrl || "",
                imageUrl,
                techStack: technologies !== undefined ? toArray(technologies) : (existing.techStack || [])
            }
        });

        res.json({
            success: true,
            data: serializeProject(updatedProject)
        });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            success: false,
            data: null,
            message: "Failed to update project."
        });
    }
});

// DELETE /api/projects/:id - Menghapus project berdasarkan id
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.project.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        await prisma.project.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: "Project deleted successfully."
        });
    } catch (error) {
        console.error(error);
        // Hindari HTTP 500 polos; beri JSON aman agar UI tidak crash.
        res.status(200).json({
            success: false,
            message: "Failed to delete project."
        });
    }
});

// ─── Experience CRUD ──────────────────────────────────────────────────────────

// Serializer experience: DB menyimpan roleTitle/company/skills, sedangkan
// frontend membaca role_title|role, organization|org, technologies|tags.
function serializeExperience(e) {
    if (!e) return null;
    return {
        id: e.id,
        type: e.type || 'work',
        period: e.period || "",
        role_title: e.roleTitle || "",
        role: e.roleTitle || "",
        roleTitle: e.roleTitle || "",
        organization: e.company || "",
        org: e.company || "",
        company: e.company || "",
        description: e.description || "",
        technologies: e.skills || [],
        tags: e.skills || [],
        skills: e.skills || [],
        is_current: e.is_current === undefined ? false : !!e.is_current,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
    };
}

// Normalisasi payload experience dari frontend (mendukung dua bentuk kolom:
// role/organization/period/tags yang dikirim project-form.js, dan bentuk PRD
// role_title/organization/start_date/end_date/is_current).
function normalizeExperience(body) {
    return {
        period: body.period || body.start_date || '',
        roleTitle: body.roleTitle || body.role_title || body.role || '',
        company: body.company || body.organization || body.org || '',
        description: body.description || '',
        skills: toArray(body.skills || body.technologies || body.tags)
    };
}

// GET /api/experiences - Mengambil semua experience dari database
app.get('/api/experiences', async (req, res) => {
    try {
        const experiences = await prisma.experience.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: experiences.map(serializeExperience)
        });
    } catch (error) {
        console.error(error);
        // Tetap kembalikan JSON aman (array kosong) dengan HTTP 200 agar UI tidak crash.
        res.status(200).json({
            success: false,
            data: [],
            message: "Failed to fetch experiences."
        });
    }
});

// GET /api/experiences/:id - Mengambil satu experience berdasarkan id
app.get('/api/experiences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const experience = await prisma.experience.findUnique({
            where: { id }
        });

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience not found."
            });
        }

        res.json({
            success: true,
            data: serializeExperience(experience)
        });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            success: false,
            data: null,
            message: "Failed to fetch experience."
        });
    }
});

// POST /api/experiences - Menambah experience baru
app.post('/api/experiences', async (req, res) => {
    try {
        const data = normalizeExperience(req.body);

        if (!data.roleTitle || !data.company) {
            return res.status(400).json({
                success: false,
                message: "Role and organization are required."
            });
        }

        const newExperience = await prisma.experience.create({ data });

        res.status(201).json({
            success: true,
            data: serializeExperience(newExperience)
        });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            success: false,
            data: null,
            message: "Failed to create experience."
        });
    }
});

// PUT /api/experiences/:id - Memperbarui experience yang sudah ada
app.put('/api/experiences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = normalizeExperience(req.body);

        const existing = await prisma.experience.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Experience not found."
            });
        }

        const updatedExperience = await prisma.experience.update({
            where: { id },
            data
        });

        res.json({
            success: true,
            data: serializeExperience(updatedExperience)
        });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            success: false,
            data: null,
            message: "Failed to update experience."
        });
    }
});

// DELETE /api/experiences/:id - Menghapus experience berdasarkan id
app.delete('/api/experiences/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.experience.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Experience not found."
            });
        }

        await prisma.experience.delete({ where: { id } });

        res.json({
            success: true,
            message: "Experience deleted successfully."
        });
    } catch (error) {
        console.error(error);
        // Hindari HTTP 500 polos; beri JSON aman agar UI tidak crash.
        res.status(200).json({
            success: false,
            message: "Failed to delete experience."
        });
    }
});

// Di Vercel (production), app diekspor sebagai serverless function — jangan panggil listen
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;