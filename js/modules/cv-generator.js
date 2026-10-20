import { translations } from '../i18n.js';

function resolveLang(val, lang) {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (val[lang]) return val[lang];
        if (val.es) return val.es;
        if (val.en) return val.en;
        for (const k in val) {
            if (typeof val[k] === 'string') return val[k];
        }
    }
    return '';
}

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
}

function getBase64ImageFromUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                const dataURL = canvas.toDataURL('image/jpeg', 0.95);
                resolve(dataURL);
            } catch (e) {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

export async function generateHarvardCV(store, lang) {
    const t = translations[lang] || translations.es;

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        alert(lang === 'es' ? 'Error: No se pudo cargar el motor jsPDF.' : 'Error: jsPDF engine could not be loaded.');
        return;
    }

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 20;
    const marginRight = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 20;

    const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }
    };

    // Profile Picture
    const photoBase64 = await getBase64ImageFromUrl('imgs/user/profile.jpg');
    const photoSize = 24;
    let textStartX = marginLeft;

    if (photoBase64) {
        try {
            doc.addImage(photoBase64, 'JPEG', marginLeft, y, photoSize, photoSize);
            textStartX = marginLeft + photoSize + 8;
        } catch (e) {
            textStartX = marginLeft;
        }
    }

    // Name
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text('ALEJANDRO DASTARD', textStartX, y + 7);

    // Links
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);

    doc.text('alejandrodastard@gmail.com', textStartX, y + 14);
    doc.text('linkedin.com/in/alejandro-dastard-dore   •   github.com/AlejandroDastard', textStartX, y + 20);

    y += Math.max(photoSize, 20) + 9;

    // Titles
    const addSectionTitle = (title) => {
        checkPageBreak(16);
        y += 6;
        doc.setFont('times', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(15, 15, 15);
        doc.text(title.toUpperCase(), marginLeft, y);
        y += 2;
        doc.setLineWidth(0.5);
        doc.setDrawColor(40, 40, 40);
        doc.line(marginLeft, y, pageWidth - marginRight, y);
        y += 5;
    };

    // About me
    const p1 = stripHtml(t.about_p1 || '');
    const p2 = stripHtml(t.about_p2 || '');

    if (p1 || p2) {
        addSectionTitle(t.about_title || (lang === 'es' ? 'Sobre Mí' : 'About Me'));

        doc.setFont('times', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);

        if (p1) {
            const splitP1 = doc.splitTextToSize(p1, contentWidth);
            checkPageBreak(splitP1.length * 4.4);
            doc.text(splitP1, marginLeft, y);
            y += (splitP1.length * 4.4) + 4;
        }

        if (p2) {
            const splitP2 = doc.splitTextToSize(p2, contentWidth);
            checkPageBreak(splitP2.length * 4.4);
            doc.text(splitP2, marginLeft, y);
            y += (splitP2.length * 4.4) + 4;
        }
    }

    // Work Experience
    if ((store.experience || []).length > 0) {
        addSectionTitle(t.cv_experience);

        store.experience.forEach(exp => {
            const company = exp.company || '';
            const role = resolveLang(exp.role, lang);
            const badge = resolveLang(exp.badge, lang);
            const roleDisplay = badge ? `${role} (${badge})` : role;
            const dates = resolveLang(exp.dates, lang);
            const desc = stripHtml(resolveLang(exp.description, lang));

            checkPageBreak(18);

            doc.setFont('times', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(20, 20, 20);
            doc.text(company, marginLeft, y);

            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.text(dates, pageWidth - marginRight, y, { align: 'right' });

            y += 5;
            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.text(roleDisplay, marginLeft, y);

            y += 5;

            if (desc) {
                doc.setFont('times', 'normal');
                doc.setFontSize(9.5);
                doc.setTextColor(50, 50, 50);
                const splitDesc = doc.splitTextToSize(desc, contentWidth);
                checkPageBreak(splitDesc.length * 4.3);
                doc.text(splitDesc, marginLeft, y);
                y += (splitDesc.length * 4.3);
            }

            y += 5;
        });
    }

    // Education
    const activeEdu = (store.education || []).filter(item => !item.isMuted);
    if (activeEdu.length > 0) {
        addSectionTitle(t.cv_education);

        activeEdu.forEach(edu => {
            const inst = edu.institution || edu.school || '';
            const degree = resolveLang(edu.degree, lang) || resolveLang(edu.title, lang);
            const dates = resolveLang(edu.dates, lang);
            const desc = stripHtml(resolveLang(edu.description, lang));

            checkPageBreak(16);

            doc.setFont('times', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(20, 20, 20);
            doc.text(inst, marginLeft, y);

            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.text(dates, pageWidth - marginRight, y, { align: 'right' });

            y += 5;
            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.text(degree, marginLeft, y);

            y += 5;

            if (desc) {
                doc.setFont('times', 'normal');
                doc.setFontSize(9.5);
                doc.setTextColor(50, 50, 50);
                const splitDesc = doc.splitTextToSize(desc, contentWidth);
                checkPageBreak(splitDesc.length * 4.3);
                doc.text(splitDesc, marginLeft, y);
                y += (splitDesc.length * 4.3);
            }

            y += 5;
        });
    }

    // Projects
    if ((store.projects || []).length > 0) {
        addSectionTitle(t.cv_projects);

        store.projects.forEach(prj => {
            const title = resolveLang(prj.title, lang) || resolveLang(prj.name, lang);
            const dates = resolveLang(prj.dates, lang);
            const desc = stripHtml(resolveLang(prj.description, lang));

            checkPageBreak(14);

            doc.setFont('times', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(20, 20, 20);
            doc.text(title, marginLeft, y);

            if (dates) {
                doc.setFont('times', 'normal');
                doc.setFontSize(10);
                doc.text(dates, pageWidth - marginRight, y, { align: 'right' });
            }

            y += 5;

            if (desc) {
                doc.setFont('times', 'normal');
                doc.setFontSize(9.5);
                doc.setTextColor(50, 50, 50);
                const splitDesc = doc.splitTextToSize(desc, contentWidth);
                checkPageBreak(splitDesc.length * 4.3);
                doc.text(splitDesc, marginLeft, y);
                y += (splitDesc.length * 4.3);
            }

            y += 5;
        });
    }

    // Skills
    if ((store.skills || []).length > 0) {
        addSectionTitle(t.cv_skills);

        store.skills.forEach(group => {
            const groupName = resolveLang(group.name, lang);
            const badges = (group.badges || []).map(b => b.label || b.name || '').filter(Boolean).join(', ');
            if (!badges) return;

            checkPageBreak(6);
            doc.setFont('times', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(20, 20, 20);
            const titlePrefix = `${groupName}: `;
            doc.text(titlePrefix, marginLeft, y);

            const prefixWidth = doc.getTextWidth(titlePrefix);
            doc.setFont('times', 'normal');
            doc.setTextColor(50, 50, 50);

            const splitBadges = doc.splitTextToSize(badges, contentWidth - prefixWidth);
            doc.text(splitBadges[0], marginLeft + prefixWidth, y);

            if (splitBadges.length > 1) {
                for (let i = 1; i < splitBadges.length; i++) {
                    y += 4.2;
                    checkPageBreak(5);
                    doc.text(splitBadges[i], marginLeft, y);
                }
            }
            y += 5;
        });
    }

    // Certifications
    if ((store.certs || []).length > 0) {
        addSectionTitle(t.cv_certifications);

        store.certs.forEach(cert => {
            const certName = resolveLang(cert.name, lang);
            const issuer = cert.issuer || '';
            const issueDate = cert.issueDate ? cert.issueDate.substring(0, 7) : '';

            checkPageBreak(6);
            doc.setFont('times', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(20, 20, 20);
            doc.text(certName, marginLeft, y);

            const nameWidth = doc.getTextWidth(certName);
            doc.setFont('times', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(` — ${issuer}`, marginLeft + nameWidth, y);

            if (issueDate) {
                doc.setFont('times', 'normal');
                doc.setFontSize(9.5);
                doc.text(issueDate, pageWidth - marginRight, y, { align: 'right' });
            }
            y += 5;
        });
    }

    // Languages
    if ((store.languages || []).length > 0) {
        addSectionTitle(t.cv_languages);

        checkPageBreak(8);
        const langItems = store.languages.map(l => {
            const name = resolveLang(l.name, lang);
            const badges = (l.badges || []).map(b => resolveLang(b.text, lang)).filter(Boolean).join(' / ');
            return `${name}${badges ? ` (${badges})` : ''}`;
        }).join('     •     ');

        doc.setFont('times', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);
        const splitLangs = doc.splitTextToSize(langItems, contentWidth);
        doc.text(splitLangs, marginLeft, y);
        y += (splitLangs.length * 4.5);
    }

    // Download
    doc.save(`Alejandro_Dastard_CV_${lang.toUpperCase()}.pdf`);
}