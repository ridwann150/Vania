// cv-generator.js - Generator PDF resume ATS (text-based, bukan raster).
// Menggunakan pdf-lib agar seluruh teks tersimpan sebagai teks asli (bisa di-scan
// mesin ATS), dengan format halaman A4 dan font serif Times-Roman.

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Konstanta layout (satuan pt; 1mm ≈ 2.8346pt)
const PAGE_W = 595.28;                       // A4 lebar (210mm)
const PAGE_H = 841.89;                       // A4 tinggi (297mm)
const MARGIN_TOP = 20 * 2.8346;              // 20mm
const MARGIN_BOTTOM = 20 * 2.8346;
const MARGIN_LEFT = 20 * 2.8346;
const MARGIN_RIGHT = 20 * 2.8346;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;
const LINE_HEIGHT = 1.25;                    // line-height agar teks tidak menimpa
const SECTION_GAP = 12;                      // jarak antar section (10-14pt)

const FONT_SIZE_NAME = 22;
const FONT_SIZE_SUB = 10;
const FONT_SIZE_HEADING = 12;
const FONT_SIZE_BODY = 10;

const BLACK = rgb(0, 0, 0);

// Ambil array skills unik dari experience (skills) dan project (techStack).
function collectSkills(experiences, projects) {
    const set = new Set();
    const push = (v) => {
        if (Array.isArray(v)) v.forEach((x) => x && set.add(String(x).trim()));
        else if (typeof v === 'string') v.split(',').forEach((x) => { const t = x.trim(); if (t) set.add(t); });
    };
    (experiences || []).forEach((e) => push(e.skills || e.technologies || e.tags));
    (projects || []).forEach((p) => push(p.techStack || p.technologies));
    return Array.from(set);
}

// Bungkus teks menjadi beberapa baris sesuai lebar maksimum.
function wrapText(text, font, size, maxWidth) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    const words = clean.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
        const candidate = line ? line + ' ' + word : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
            line = candidate;
        } else {
            if (line) lines.push(line);
            line = word;
        }
    }
    if (line) lines.push(line);
    return lines;
}

// Buat seluruh dokumen PDF dan kembalikan sebagai Buffer.
export async function buildCvPdf({ profile = {}, experiences = [], projects = [] }) {
    const doc = await PDFDocument.create();
    doc.setTitle('ATS Resume');

    const fontReg = await doc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);
    const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

    const name = String(profile.name || profile.full_name || 'Vania Anggraini').trim();
    const title = String(profile.tagline || profile.title || '').trim();
    const email = String(profile.email || 'vaniaangraini55@gmail.com').trim();
    const location = String(profile.location || profile.phone || profile.city || '').trim();
    const portfolio = String(profile.portfolio || profile.linkedin || profile.link || '').trim();
    const summary = String(profile.about || profile.about_me || profile.bio || profile.short_bio || '').trim();

    const exp = Array.isArray(experiences) ? experiences : [];
    const proj = Array.isArray(projects) ? projects : [];
    const skills = collectSkills(exp, proj);

    const contactParts = [email, location, portfolio].filter(Boolean);

    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN_TOP;

    function ensureSpace(needed) {
        if (y - needed < MARGIN_BOTTOM) {
            page = doc.addPage([PAGE_W, PAGE_H]);
            y = PAGE_H - MARGIN_TOP;
        }
    }

    function drawCentered(text, font, size, offset = 0) {
        const w = font.widthOfTextAtSize(text, size);
        page.drawText(text, { x: MARGIN_LEFT + (CONTENT_W - w) / 2, y: y + offset, size, font, color: BLACK });
        return size;
    }

    // ── Header: Nama 22pt Bold Centered ──
    ensureSpace(FONT_SIZE_NAME + 4);
    drawCentered(name, fontBold, FONT_SIZE_NAME);
    y -= FONT_SIZE_NAME * 1.15;

    // Subtitle / Title
    if (title) {
        ensureSpace(FONT_SIZE_SUB + 3);
        drawCentered(title, fontItalic, FONT_SIZE_SUB);
        y -= FONT_SIZE_SUB * LINE_HEIGHT;
    }

    // Contact info 10pt Centered
    if (contactParts.length) {
        ensureSpace(FONT_SIZE_SUB + 3);
        drawCentered(contactParts.join('  |  '), fontReg, FONT_SIZE_SUB);
        y -= FONT_SIZE_SUB * LINE_HEIGHT;
    }

    // ── Section heading dengan garis bawah ──
    function drawHeading(text) {
        ensureSpace(FONT_SIZE_HEADING + 14);
        y -= 6;
        const upper = String(text).toUpperCase();
        page.drawText(upper, { x: MARGIN_LEFT, y, size: FONT_SIZE_HEADING, font: fontBold, color: BLACK });
        const hw = fontBold.widthOfTextAtSize(upper, FONT_SIZE_HEADING);
        page.drawLine({
            start: { x: MARGIN_LEFT, y: y - 3 },
            end: { x: MARGIN_LEFT + Math.max(hw, 120), y: y - 3 },
            thickness: 0.8,
            color: BLACK
        });
        y -= FONT_SIZE_HEADING * LINE_HEIGHT + 5;
    }

    function drawParagraphLines(text, font = fontReg, size = FONT_SIZE_BODY, bullet = '') {
        const lines = wrapText(text, font, size, CONTENT_W);
        for (const ln of lines) {
            ensureSpace(size * LINE_HEIGHT);
            const prefix = bullet ? bullet + '  ' : '';
            page.drawText(prefix, { x: MARGIN_LEFT, y, size, font: fontBold, color: BLACK });
            if (bullet) {
                page.drawText(ln, { x: MARGIN_LEFT + 14, y, size, font, color: BLACK });
            } else {
                page.drawText(ln, { x: MARGIN_LEFT, y, size, font, color: BLACK });
            }
            y -= size * LINE_HEIGHT;
        }
        return lines.length;
    }

    // ── PROFESSIONAL SUMMARY ──
    if (summary) {
        drawHeading('PROFESSIONAL SUMMARY');
        drawParagraphLines(summary);
        y -= SECTION_GAP;
    }

    // ── EXPERIENCE ──
    if (exp.length) {
        drawHeading('EXPERIENCE');
        for (const e of exp) {
            const period = String(e.period || e.start_date || '').trim();
            const role = String(e.roleTitle || e.role_title || e.role || '').trim();
            const org = String(e.company || e.organization || e.org || '').trim();
            const desc = String(e.description || '').trim();
            const tags = (e.skills || e.technologies || e.tags || []);

            const titleText = [role, org].filter(Boolean).join(' - ');
            const titleLines = wrapText(titleText, fontBold, FONT_SIZE_BODY + 1, CONTENT_W - (period ? 100 : 0));

            for (const [i, tl] of titleLines.entries()) {
                ensureSpace((FONT_SIZE_BODY + 1) * LINE_HEIGHT);
                if (i === 0 && period) {
                    const pw = fontReg.widthOfTextAtSize(period, FONT_SIZE_BODY);
                    page.drawText(period, { x: PAGE_W - MARGIN_RIGHT - pw, y, size: FONT_SIZE_BODY, font: fontItalic, color: BLACK });
                }
                page.drawText(tl, { x: MARGIN_LEFT, y, size: FONT_SIZE_BODY + 1, font: fontBold, color: BLACK });
                y -= (FONT_SIZE_BODY + 1) * LINE_HEIGHT;
            }

            if (desc) {
                drawParagraphLines(desc, fontReg, FONT_SIZE_BODY);
            }
            if (Array.isArray(tags) && tags.length) {
                drawParagraphLines(tags.join(', '), fontItalic, FONT_SIZE_BODY);
            }
            y -= 4;
        }
        y -= SECTION_GAP;
    }

    // ── PROJECTS ──
    if (proj.length) {
        drawHeading('PROJECTS');
        for (const p of proj) {
            const pTitle = String(p.title || '').trim();
            const pDesc = String(p.description || '').trim();
            const pLink = String(p.projectUrl || p.link || '').trim();
            const pTags = (p.techStack || p.technologies || []);

            if (pTitle) {
                ensureSpace((FONT_SIZE_BODY + 1) * LINE_HEIGHT);
                page.drawText(pTitle, { x: MARGIN_LEFT, y, size: FONT_SIZE_BODY + 1, font: fontBold, color: BLACK });
                y -= (FONT_SIZE_BODY + 1) * LINE_HEIGHT;
            }
            if (pDesc) {
                drawParagraphLines(pDesc, fontReg, FONT_SIZE_BODY, '\u2022');
            }
            if (Array.isArray(pTags) && pTags.length) {
                drawParagraphLines(pTags.join(', '), fontItalic, FONT_SIZE_BODY);
            }
            if (pLink) {
                drawParagraphLines(pLink, fontItalic, FONT_SIZE_BODY);
            }
            y -= 4;
        }
        y -= SECTION_GAP;
    }

    // ── SKILLS ──
    if (skills.length) {
        drawHeading('SKILLS');
        drawParagraphLines(skills.join('  |  '), fontReg, FONT_SIZE_BODY);
        y -= SECTION_GAP;
    }

    const bytes = await doc.save();
    return Buffer.from(bytes);
}
