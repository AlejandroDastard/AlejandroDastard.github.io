export function renderSkills(data, currentLang) {
    const container = document.getElementById('skills-accordion-container');
    if (!container || !data) return;

    container.innerHTML = data.map(category => {
        const catName = typeof category.name === 'object' ? category.name[currentLang] : category.name;
        
        const badgesHtml = category.badges.map(b => `
            <img src="${b.badgeUrl}" class="skill-badge" alt="${b.label}">
        `).join('');

        return `
            <div class="accordion-item">
                <button type="button" class="accordion-header">
                    <div class="accordion-header-left">
                        <span class="category-icon ${category.colorClass || 'cat-blue'}">
                            <i class="${category.icon}"></i>
                        </span>
                        <span class="category-name">${catName}</span>
                    </div>
                    <i class="fas fa-chevron-down accordion-icon"></i>
                </button>
                <div class="accordion-content">
                    <div class="badge-wrap">
                        ${badgesHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}