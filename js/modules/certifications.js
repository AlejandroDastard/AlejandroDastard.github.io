const certStatusTranslations = {
    es: {
        active: "Activo",
        expired: "Caducado",
        permanent: "Activo"
    },
    en: {
        active: "Active",
        expired: "Expired",
        permanent: "Active"
    }
};

export function renderCerts(data, currentLang) {
    const container = document.getElementById('certs-container');
    if (!container || !data || !Array.isArray(data)) return;

    container.innerHTML = data.map(cert => {
        const certName = typeof cert.name === 'object' ? (cert.name[currentLang] || cert.name.es) : cert.name;
        const imgClass = cert.isSvg ? 'cert-img cert-img-svg' : 'cert-img';
        
        const cardInner = `
            <img src="${cert.image}" alt="${certName}" class="${imgClass}">
            <h3 class="card-title">${certName}</h3>
            <p class="card-issuer">${cert.issuer}</p>
            <div class="card-footer cert-status-container" 
                 data-issue-date="${cert.issueDate || ''}" 
                 data-expiry-date="${cert.expiryDate || ''}">
            </div>
        `;

        if (cert.link) {
            return `
                <a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="grid-item card interactive-card text-center">
                    ${cardInner}
                </a>
            `;
        }
        return `
            <div class="grid-item card interactive-card text-center">
                ${cardInner}
            </div>
        `;
    }).join('');

    processCertDates(currentLang);
}

export function processCertDates(currentLang) {
    const certContainers = document.querySelectorAll('.cert-status-container');
    const currentDate = new Date();
    const t = certStatusTranslations[currentLang] || certStatusTranslations.es;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const locale = currentLang === 'es' ? 'es-ES' : 'en-US';
        return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
    };

    certContainers.forEach(container => {
        const issueDateStr = container.getAttribute('data-issue-date');
        const expiryDateStr = container.getAttribute('data-expiry-date');

        let issueHtml = '';
        let statusHtml = '';

        if (issueDateStr) {
            issueHtml = `<span class="meta-date-muted"><i class="far fa-calendar-check"></i> ${formatDate(issueDateStr)}</span>`;
        }

        if (expiryDateStr) {
            const expiryDate = new Date(expiryDateStr);
            if (currentDate > expiryDate) {
                statusHtml = `<span class="badge badge-red"><i class="fas fa-times-circle"></i> ${t.expired}</span>`;
            } else {
                statusHtml = `<span class="badge badge-green"><i class="fas fa-check-circle"></i> ${t.active}</span>`;
            }
        } else {
            statusHtml = `<span class="badge badge-green"><i class="fas fa-shield-alt"></i> ${t.permanent}</span>`;
        }

        container.innerHTML = `${issueHtml} ${statusHtml}`;
    });
}