import { translations } from './i18n.js';
import { renderProjects } from './modules/projects.js';
import { renderExperience } from './modules/experience.js';
import { renderEducation } from './modules/education.js';
import { renderSkills } from './modules/skills.js';
import { renderCerts, processCertDates } from './modules/certifications.js';
import { renderLanguages } from './modules/languages.js';
import { generateHarvardCV } from './modules/cv-generator.js';

let currentLang = 'es';
const store = {
    experience: [],
    education: [],
    skills: [],
    certs: [],
    languages: [],
    projects: []
};

async function fetchSafe(url) {
    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            console.error(`Error HTTP ${response.status} al cargar ${url}`);
            return [];
        }
        return await response.json();
    } catch (err) {
        console.error(`Error de parseo JSON o red en ${url}:`, err);
        return [];
    }
}

async function loadAllData() {
    const [exp, edu, skl, crt, lng, prj] = await Promise.all([
        fetchSafe('data/experience.json'),
        fetchSafe('data/education.json'),
        fetchSafe('data/skills.json'),
        fetchSafe('data/certifications.json'),
        fetchSafe('data/languages.json'),
        fetchSafe('data/projects.json')
    ]);

    store.experience = exp;
    store.education = edu;
    store.skills = skl;
    store.certs = crt;
    store.languages = lng;
    store.projects = prj;

    renderAll();
}

function renderAll() {
    renderExperience(store.experience, currentLang);
    renderEducation(store.education, currentLang);
    renderSkills(store.skills, currentLang);
    renderCerts(store.certs, currentLang);
    renderLanguages(store.languages, currentLang);
    renderProjects(store.projects, currentLang);

    processCertDates(currentLang);
    initAccordions();
    initImageFallbacks();
    evaluateGrids();
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    const isEs = lang === 'es';
    const btnEs = document.getElementById('lang-btn-es');
    const btnEn = document.getElementById('lang-btn-en');
    const btnEsMob = document.getElementById('lang-btn-es-mob');
    const btnEnMob = document.getElementById('lang-btn-en-mob');

    const updateClasses = (activeEl, inactiveEl) => {
        if (activeEl && inactiveEl) {
            activeEl.className = isEs ? 'active-lang' : 'inactive-lang';
            inactiveEl.className = isEs ? 'inactive-lang' : 'active-lang';
        }
    };

    updateClasses(btnEs, btnEn);
    updateClasses(btnEsMob, btnEnMob);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('title', translations[lang][key]);
        }
    });

    renderAll();

    try {
        localStorage.setItem('portfolio_lang', lang);
    } catch (e) {}
}

function toggleLanguage() {
    setLanguage(currentLang === 'es' ? 'en' : 'es');
}

function initCollapsibles() {
    document.querySelectorAll('[data-collapse-target]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const sectionId = trigger.getAttribute('data-collapse-target');
            const section = document.getElementById(sectionId);
            if (!section) return;

            const isCollapsed = section.classList.toggle('section-collapsed');
            if (!isCollapsed) {
                setTimeout(evaluateGrids, 150);
            }
        });
    });
}

function ensureSectionOpen(sectionId) {
    const section = document.getElementById(sectionId);
    if (section && section.classList.contains('section-collapsed')) {
        section.classList.remove('section-collapsed');
        setTimeout(evaluateGrids, 150);
    }
}

function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = () => {
            const parent = header.parentElement;
            if (parent) {
                parent.classList.toggle('active');
            }
        };
    });
}

function evaluateGrids() {
    const sections = document.querySelectorAll('.dynamic-grid-section');
    const t = translations[currentLang] || translations.es;

    sections.forEach(section => {
        const grid = section.querySelector('.target-grid');
        if (!grid) return;

        const items = Array.from(grid.querySelectorAll('.grid-item'));
        const wrapper = section.querySelector('.toggle-btn-wrapper');
        if (!wrapper) return;

        const gridColsStr = window.getComputedStyle(grid).getPropertyValue('grid-template-columns');
        const columns = gridColsStr ? gridColsStr.split(' ').length : 1;
        const maxItems = columns * 3;
        const isExpanded = section.classList.contains('is-expanded');

        if (items.length > maxItems) {
            let btn = wrapper.querySelector('.toggle-grid-btn');
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'toggle-grid-btn';
                btn.addEventListener('click', () => {
                    const expanded = section.classList.toggle('is-expanded');
                    btn.innerHTML = expanded 
                        ? `${translations[currentLang].btn_see_less} <i class="fas fa-chevron-up"></i>` 
                        : `${translations[currentLang].btn_see_more} <i class="fas fa-chevron-down"></i>`;
                    evaluateGrids();
                });
                wrapper.appendChild(btn);
            }

            btn.innerHTML = isExpanded 
                ? `${t.btn_see_less} <i class="fas fa-chevron-up"></i>` 
                : `${t.btn_see_more} <i class="fas fa-chevron-down"></i>`;

            items.forEach((item, index) => {
                if (index >= maxItems) {
                    item.classList.toggle('hidden', !isExpanded);
                } else {
                    item.classList.remove('hidden');
                }
            });
            wrapper.style.display = 'block';
        } else {
            items.forEach(item => item.classList.remove('hidden'));
            wrapper.style.display = 'none';
        }
    });
}

function initSideDots() {
    const sideNav = document.getElementById('side-dots-nav');
    if (!sideNav) return;

    const links = sideNav.querySelectorAll('a[data-target]');
    const sectionIds = ['home', 'experience', 'projects', 'education', 'skills', 'certs', 'languages'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    links.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.getAttribute('data-target');
            if (targetId && targetId !== 'home') {
                ensureSectionOpen(targetId);
            }
        });
    });

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 200;
        let activeId = 'home';

        sections.forEach(section => {
            if (section.offsetTop <= scrollPos) activeId = section.id;
        });

        links.forEach(link => {
            const dot = link.querySelector('.side-dot');
            if (link.getAttribute('data-target') === activeId) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }, { passive: true });
}

function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback]').forEach(img => {
        img.onerror = () => {
            const mode = img.getAttribute('data-fallback');
            if (mode === 'hide') {
                img.style.display = 'none';
            } else if (mode === 'flag') {
                const code = img.getAttribute('data-code');
                const flagMap = {
                    ES: 'https://flagcdn.com/w80/es.png',
                    EN: 'https://flagcdn.com/w80/gb.png',
                    JP: 'https://flagcdn.com/w80/jp.png',
                    FR: 'https://flagcdn.com/w80/fr.png'
                };
                img.src = flagMap[code] || 'https://flagcdn.com/w80/un.png';
            }
        };
    });
}

function initMobileMenu() {
    const trigger = document.getElementById('mobile-menu-trigger');
    const menu = document.getElementById('mobile-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', () => menu.classList.toggle('hidden'));
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => menu.classList.add('hidden'));
    });
}

function init() {
    let savedLang = 'es';
    try {
        savedLang = localStorage.getItem('portfolio_lang') || 'es';
    } catch (e) {}

    const yearElem = document.getElementById('copyright-year');
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }

    const langToggleDesk = document.getElementById('lang-toggle-desktop');
    const langToggleMob = document.getElementById('lang-toggle-mobile');

    if (langToggleDesk) langToggleDesk.addEventListener('click', toggleLanguage);
    if (langToggleMob) langToggleMob.addEventListener('click', toggleLanguage);

    const cvBtn = document.getElementById('btn-download-cv');
    if (cvBtn) {
        cvBtn.addEventListener('click', () => {
            generateHarvardCV(store, currentLang);
        });
    }

    initCollapsibles();
    initSideDots();
    initMobileMenu();

    currentLang = savedLang;
    loadAllData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.addEventListener('resize', evaluateGrids);