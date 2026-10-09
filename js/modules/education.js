export function renderEducation(data, currentLang) {
    const container = document.getElementById('education-timeline-container');
    if (!container || !data || !Array.isArray(data)) return;

    container.innerHTML = data.map(item => {
        const degree = typeof item.degree === 'object' ? (item.degree[currentLang] || item.degree.es) : item.degree;
        const dates = typeof item.dates === 'object' ? (item.dates[currentLang] || item.dates.es) : item.dates;
        const desc = item.description 
            ? (typeof item.description === 'object' ? (item.description[currentLang] || item.description.es) : item.description) 
            : null;

        const dotClass = item.isMuted ? 'timeline-dot timeline-dot-muted' : 'timeline-dot';
        const dateClass = item.isMuted ? 'meta-date meta-date-muted' : 'meta-date';

        const bannerHtml = item.bgImage ? `
            <div class="card-banner-wrap">
                <img src="${item.bgImage}" alt="${item.institution}" class="card-banner-img" data-fallback="hide">
            </div>
        ` : '';

        const logoHtml = item.logoImage ? `
            <div class="card-entity-logo">
                <img src="${item.logoImage}" alt="${item.institution}" data-fallback="hide">
            </div>
        ` : '';

        return `
            <div class="timeline-item">
                <div class="${dotClass}">
                    <i class="${item.icon || 'fas fa-graduation-cap'}"></i>
                </div>
                <article class="timeline-card card-with-banner">
                    ${bannerHtml}
                    <div class="card-body-content">
                        <span class="${dateClass}">${dates}</span>
                        <div class="card-header-with-logo">
                            <div>
                                <h3 class="card-title">${degree}</h3>
                                <p class="card-subtitle">
                                    <i class="fas fa-university"></i> ${item.institution}
                                </p>
                            </div>
                            ${logoHtml}
                        </div>
                        ${desc ? `<p class="card-description">${desc}</p>` : ''}
                    </div>
                </article>
            </div>
        `;
    }).join('');
}