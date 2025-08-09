document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONFIG ---
    let state = {
        language: localStorage.getItem('language') || 'ar', // Default to Arabic
        theme: 'dark', // Force dark mode
        currentPage: 'home', // 'home', 'categories', 'rankedList'
        currentCategory: null,
    };

    // --- DOM ELEMENTS ---
    const app = document.getElementById('app');
    const headerEl = document.getElementById('main-header');
    const footerEl = document.getElementById('main-footer');
    const docElement = document.documentElement;

    // --- TRANSLATIONS ---
    const translations = {
        en: { siteName: "AI Tools Hub", discover: "Discover, Rank & Master AI Tools", heroSubtitle: "Your ultimate ranked guide to the best AI tools.", searchAITools: "Explore AI Tools", chooseCategory: "Choose a Category", backToCategories: "Choose Category", visitSite: "Visit Site", pricing: "Pricing" },
        ar: { siteName: "مركز أدوات الذكاء الاصطناعي", discover: "اكتشف، صنّف، وأتقن أدوات الذكاء الاصطناعي", heroSubtitle: "دليلك النهائي المصنف لأفضل أدوات الذكاء الاصطناعي.", searchAITools: "تصفح الأدوات", chooseCategory: "اختر الفئة", backToCategories: "اختر الفئة", visitSite: "زيارة الموقع", pricing: "التسعير" }
    };
    const t = (key) => translations[state.language][key] || key;
    const formatNumber = (num) => {
        if (num >= 1000) {
            const thousands = (num / 1000).toFixed(1).replace('.0', '');
            return state.language === 'ar' ? `(ألف ${thousands})` : `(${thousands}k)`;
        }
        return `(${num})`;
    };

    // --- PAGE RENDER FUNCTIONS ---
    
    const renderHomePage = () => {
        app.innerHTML = `
            <div class="page hero-background">
                <div class="flex flex-col items-center justify-center min-h-screen text-center text-white p-4 relative z-10 bg-black/50">
                    <div class="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-lg"><i class="fa-solid fa-bolt text-white text-5xl"></i></div>
                    <h1 class="text-5xl md:text-7xl font-extrabold">${t('siteName')}</h1>
                    <h2 class="text-2xl md:text-4xl font-bold text-primary mt-2">${t('discover')}</h2>
                    <p class="max-w-3xl mx-auto mt-6 text-lg text-gray-300">${t('heroSubtitle')}</p>
                    <button id="search-btn" class="mt-12 bg-primary text-white font-bold py-4 px-10 rounded-full text-xl hover:bg-violet-700 transition-all duration-300 shadow-lg transform hover:scale-105">
                        <i class="fas fa-search mr-2"></i> ${t('searchAITools')}
                    </button>
                </div>
            </div>`;
        headerEl.style.display = 'none';
        footerEl.style.display = 'none';
        document.getElementById('search-btn').addEventListener('click', () => navigateTo('categories'));
    };

    const renderCategoriesPage = () => {
        const categoryButtons = categories.map(cat => `
            <button data-category-id="${cat.id}" class="category-btn bg-dark-card p-6 rounded-2xl shadow-md hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center">
                <i class="${cat.icon} text-4xl text-primary"></i>
                <span class="text-lg font-bold text-dark-text">${cat.name[state.language]}</span>
            </button>
        `).join('');
        app.innerHTML = `
            <div class="page container mx-auto px-4 py-12">
                <h1 class="text-4xl font-extrabold text-center mb-10 text-dark-text">${t('chooseCategory')}</h1>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${categoryButtons}
                </div>
            </div>`;
        headerEl.style.display = 'block';
        footerEl.style.display = 'block';
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => navigateTo('rankedList', btn.dataset.categoryId));
        });
    };

    const renderRankedListPage = (categoryId) => {
        const getScore = tool => tool.rating * Math.log10(tool.reviewCount + 1) + (tool.isSponsored ? 5 : 0);
        const toolsInCategory = toolsData.filter(tool => tool.category === categoryId).sort((a, b) => getScore(b) - getScore(a));
        const category = categories.find(c => c.id === categoryId);
        app.innerHTML = `
            <div class="page container mx-auto px-4 py-8 max-w-3xl">
                <button id="back-to-categories-btn" class="mb-6 text-primary font-bold hover:opacity-80 transition-opacity flex items-center gap-2 text-lg">
                    <i class="fas fa-arrow-left"></i> ${t('backToCategories')}
                </button>
                <h1 class="text-5xl font-extrabold text-center mb-12 text-dark-text">${category.name[state.language]}</h1>
                <div class="space-y-12">
                    ${toolsInCategory.map((tool, index) => renderToolCard(tool, index + 1)).join('')}
                </div>
            </div>`;
        headerEl.style.display = 'none';
        footerEl.style.display = 'block';
        document.getElementById('back-to-categories-btn').addEventListener('click', () => navigateTo('categories'));
    };
    
    const renderToolCard = (tool, rank) => {
        const lang = state.language;
        const short_description = (tool.short_description && tool.short_description[lang]) ? tool.short_description[lang] : (categories.find(c => c.id === tool.category)?.name[lang] || 'AI Tool');

        return `
            <div class="text-center">
                <h2 class="text-3xl font-bold text-secondary mb-4">#${rank}</h2>
                <div class="bg-dark-card rounded-2xl shadow-lg p-6 text-center">
                    <div class="flex items-center justify-center gap-4 mb-4">
                        <div class="w-20 h-20 rounded-xl bg-slate-700 flex items-center justify-center p-2 flex-shrink-0">
                            <img loading="lazy" alt="${tool.name[lang]}" src="${tool.logo}" class="max-h-full max-w-full object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png'"/>
                        </div>
                        <h3 class="text-2xl font-bold text-dark-text text-left flex-grow">${tool.name[lang]}</h3>
                    </div>
                    <p class="text-gray-400 text-base leading-relaxed my-4 mx-auto max-w-md">${short_description}</p>
                    <div class="flex items-center justify-center gap-2 text-dark-text text-lg my-4">
                        <i class="fas fa-star text-yellow-400"></i>
                        <span class="font-bold">${tool.rating}</span>
                        <span class="text-gray-400 text-base">${formatNumber(tool.reviewCount)}</span>
                    </div>
                    <div class="text-base text-gray-300 my-4"><strong class="font-bold">${t('pricing')}:</strong> ${tool.pricing[lang]}</div>
                    <a href="${tool.website}" target="_blank" rel="noopener noreferrer" class="mt-4 w-full text-center bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 text-lg">
                        ${t('visitSite')} <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>`;
    };

    // --- NAVIGATION & ROUTING ---
    const navigateTo = (page, categoryId = null) => { state.currentPage = page; state.currentCategory = categoryId; window.scrollTo(0, 0); updateURL(); render(); };
    const render = () => {
        docElement.lang = state.language; docElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
        addGlobalEventListeners();
        if (state.currentPage === 'home') renderHomePage();
        else if (state.currentPage === 'categories') renderCategoriesPage();
        else if (state.currentPage === 'rankedList') renderRankedListPage(state.currentCategory);
        else renderHomePage();
    };
    const updateURL = () => { let hash = `#${state.currentPage}`; if (state.currentPage === 'rankedList' && state.currentCategory) { hash += `/${state.currentCategory}`; } history.pushState(state, '', hash); };
    const handleURLChange = () => { const hash = window.location.hash.substring(1); const [page, categoryId] = hash.split('/'); state.currentPage = page || 'home'; state.currentCategory = categoryId || null; render(); };
    const addGlobalEventListeners = () => { document.getElementById('lang-switcher')?.addEventListener('click', () => { state.language = state.language === 'en' ? 'ar' : 'en'; localStorage.setItem('language', state.language); render(); }); };
    
    // --- INITIALIZATION ---
    window.addEventListener('popstate', (e) => { if (e.state) { state = e.state; render(); } });
    handleURLChange();
});
