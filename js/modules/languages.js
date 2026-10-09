export function renderLanguages(data, currentLang) {
    const container = document.getElementById('languages-container');
    if (!container || !data || !Array.isArray(data)) return;

    container.innerHTML = data.map(lang => {
        const langName = typeof lang.name === 'object' ? (lang.name[currentLang] || lang.name.es) : lang.name;

        const badgesHtml = (lang.badges || []).map(b => {
            const badgeText = typeof b.text === 'object' ? (b.text[currentLang] || b.text.es) : b.text;
            const badgeClass = b.type === 'green' ? 'badge badge-green' : 'badge badge-blue';
            return `
                <span class="${badgeClass}">
                    <i class="${b.icon}"></i>
                    <span>${badgeText}</span>
                </span>
            `;
        }).join('');

        const bannerHtml = lang.banner ? `
            <div class="lang-banner-wrap">
                <img src="${lang.banner}" alt="${langName}" class="lang-banner-img" data-fallback="hide">
            </div>
        ` : '';

        return `
            <div class="grid-item card interactive-card text-center lang-card-structured">
                ${bannerHtml}
                <div class="lang-card-content">
                    <img src="${lang.flag}" alt="${langName}" class="flag-img" data-fallback="flag" data-code="${lang.code}">
                    <h3 class="card-title mb-4">${langName}</h3>
                    <div class="card-footer lang-badges-row">
                        ${badgesHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}