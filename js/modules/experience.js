export function renderExperience(data, currentLang) {
    const container = document.getElementById('experience-timeline-container');
    if (!container || !data || !Array.isArray(data)) return;

    container.innerHTML = data.map(item => {
        const role = typeof item.role === 'object' ? (item.role[currentLang] || item.role.es) : item.role;
        const dates = typeof item.dates === 'object' ? (item.dates[currentLang] || item.dates.es) : item.dates;
        const badge = typeof item.badge === 'object' ? (item.badge[currentLang] || item.badge.es) : item.badge;
        const desc = typeof item.description === 'object' ? (item.description[currentLang] || item.description.es) : item.description;

        const tagsHtml = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

        const bannerHtml = item.bgImage ? `
            <div class="card-banner-wrap">
                <img src="${item.bgImage}" alt="${item.company}" class="card-banner-img" data-fallback="hide">
            </div>
        ` : '';

        const logoHtml = item.logoImage ? `
            <div class="card-entity-logo">
                <img src="${item.logoImage}" alt="${item.company}" data-fallback="hide">
            </div>
        ` : '';

        return `
            <div class="timeline-item">
                <div class="timeline-dot">
                    <i class="${item.icon || 'fas fa-laptop-code'}"></i>
                </div>
                <article class="timeline-card card-with-banner">
                    ${bannerHtml}
                    <div class="card-body-content">
                        <div class="card-meta">
                            <span class="meta-date">${dates}</span>
                            ${badge ? `<span class="pill-badge">${badge}</span>` : ''}
                        </div>
                        <div class="card-header-with-logo">
                            <div>
                                <h3 class="card-title">${role}</h3>
                                <p class="card-subtitle">
                                    <i class="far fa-building"></i> ${item.company}
                                </p>
                            </div>
                            ${logoHtml}
                        </div>
                        <p class="card-description">${desc}</p>
                        <div class="tag-list">${tagsHtml}</div>
                    </div>
                </article>
            </div>
        `;
    }).join('');
}