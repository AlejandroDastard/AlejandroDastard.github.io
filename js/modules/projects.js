const emptyStateTranslations = {
    es: {
        badge: "En Proceso de Desarrollo",
        desc: "Actualmente aún no hay ningún proyecto publicado.",
    },
    en: {
        badge: "Under Active Development",
        desc: "Actualmente aún no hay ningún proyecto publicado.",
    }
};

export function renderProjects(projectsData, currentLang) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    if (!projectsData || projectsData.length === 0) {
        const t = emptyStateTranslations[currentLang] || emptyStateTranslations.es;
        container.innerHTML = `
            <div class="project-empty-state">
                <div class="empty-icon-wrap">
                    <i class="fas fa-hammer"></i>
                </div>
                <span class="empty-badge">
                    <i class="fas fa-hourglass-half"></i> ${t.badge}
                </span>
                <p class="card-description">${t.desc}</p>
            </div>
        `;
        return;
    }

    let cardsHtml = '<div class="cards-grid target-grid">';

    projectsData.forEach(proj => {
        const desc = typeof proj.description === 'object' 
            ? (proj.description[currentLang] || proj.description.es) 
            : proj.description;
            
        const status = typeof proj.status === 'object' 
            ? (proj.status[currentLang] || proj.status.es) 
            : (proj.status || '');

        let mediaHtml = '';
        if (proj.img && proj.img.trim() !== '') {
            mediaHtml = `
                <div class="project-card-media">
                    <img src="${proj.img}" alt="${proj.name}" class="project-card-img" data-fallback="placeholder">
                </div>
            `;
        } else {
            mediaHtml = `
                <div class="media-placeholder">
                    <i class="fas fa-code-branch"></i>
                    <span class="media-placeholder-tag">${proj.category || 'Software'}</span>
                </div>
            `;
        }

        const tagsHtml = (proj.languages || []).map(lang => 
            `<span class="tag">${lang}</span>`
        ).join('');

        const linksHtml = (proj.links || []).map(link => `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                <i class="${link.icon || 'fas fa-external-link-alt'}"></i> ${link.label}
            </a>
        `).join('');

        cardsHtml += `
            <article class="grid-item card project-card interactive-card">
                ${mediaHtml}
                <div class="project-card-body">
                    <div class="card-meta">
                        <h3 class="card-title">${proj.name}</h3>
                        ${status ? `<span class="pill-badge">${status}</span>` : ''}
                    </div>
                    <p class="card-description">${desc}</p>
                    <div class="tag-list mb-4">${tagsHtml}</div>
                    <div class="card-footer">${linksHtml}</div>
                </div>
            </article>
        `;
    });

    cardsHtml += '</div><div class="toggle-btn-wrapper"></div>';
    container.innerHTML = cardsHtml;
}