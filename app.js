/* PUK Depression Angehörige — Shared JS */
/* ============================================================
   Version: 5.0 (Fehlerbehandlung-Patch)
   Änderungen:
   - Resiliente Initialisierung (try/catch pro Modul)
   - Font-Controls: ID-Mismatch behoben + stufenweise Anpassung
   - Barometer: NaN-Schutz mit safeRangeVal()
   - Quiz: Doppelklick-Guard
   - Screen-Reader-Feedback via announceToSR()
   - Globaler Error Handler
   ============================================================ */

/* ---- Resiliente Initialisierung ---- */
document.addEventListener('DOMContentLoaded', function () {
    const modules = [
        ['BannerOffset', initBannerOffset],
        ['MobileMenu',   initMobileMenu],
        ['Tabs',         initTabs],
        ['Quiz',         initQuiz],
        ['FassSlider',   initFassSlider],
        ['FontControls', initFontControls],
        ['BackToTop',    initBackToTop],
        ['Barometer',    initBarometer],
        ['NavHighlight',    initNavHighlight],
        ['KriseCta',        initKriseCta],
        ['BarometerReset',  initBarometerReset],
        ['NotfallFab',      initNotfallFab],
        ['QuickChoice',     initQuickChoice],
        ['PrintButtons',    initPrintButtons],
    ];
    modules.forEach(([name, fn]) => {
        try { fn(); }
        catch (err) { console.error(`[PUK] ${name} init failed:`, err); }
    });
});

/* ---- Globaler Error Handler ---- */
window.addEventListener('error', (e) => {
    console.error('[PUK] Unbehandelt:', e.message, e.filename, e.lineno);
});

/* ---- Banner-Offset für Navigation ---- */
function initBannerOffset() {
    const banner = document.querySelector('.notfall-banner');
    if (!banner) return;

    function updateOffset() {
        const h = banner.offsetHeight;
        document.documentElement.style.setProperty('--banner-h', h + 'px');
    }

    // Initial + bei Resize
    updateOffset();
    window.addEventListener('resize', updateOffset, { passive: true });

    // Wenn «Mehr Nummern» auf-/zugeklappt wird
    const details = banner.querySelector('details');
    if (details) {
        details.addEventListener('toggle', updateOffset);
    }
}

/* ---- Screen-Reader-Ankündigung ---- */
function announceToSR(msg, priority = 'polite') {
    let el = document.getElementById('sr-announce');
    if (!el) {
        el = document.createElement('div');
        el.id = 'sr-announce';
        el.setAttribute('aria-atomic', 'true');
        el.className = 'sr-only';
        document.body.appendChild(el);
    }
    el.setAttribute('aria-live', priority);
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 100);
}

/* ---- Krise Bottom-CTA ---- */
function initKriseCta() {
    const closeBtn = document.getElementById('krise-cta-close');
    const cta = document.getElementById('krise-bottom-cta');
    if (!closeBtn || !cta) return;
    closeBtn.addEventListener('click', () => {
        cta.style.display = 'none';
    });
}

function initNotfallFab() {
    document.querySelectorAll('.nf-toggle-btn').forEach((button) => {
        const panelId = button.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        button.addEventListener('click', () => {
            const isOpen = panel.classList.toggle('nf-open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    });
}

function initPrintButtons() {
    document.querySelectorAll('.print-btn').forEach((button) => {
        button.addEventListener('click', () => {
            window.print();
        });
    });
}

function initQuickChoice() {
    document.querySelectorAll('.quick-choice').forEach((nav) => {
        const links = Array.from(nav.querySelectorAll('.quick-choice-link'));
        if (!links.length) return;

        links.forEach((link) => {
            link.addEventListener('click', () => {
                links.forEach((item) => item.classList.remove('is-active'));
                link.classList.add('is-active');

                const targetId = link.getAttribute('href');
                const target = targetId ? document.querySelector(targetId) : null;
                if (!target) return;

                target.classList.remove('section-spotlight');
                // Restart animation reliably on repeated clicks.
                void target.offsetWidth;
                target.classList.add('section-spotlight');
            });
        });
    });
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;
    hamburger.addEventListener('click', () => {
        const open = hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(open));
        mobileMenu.classList.toggle('open', open);
        mobileMenu.setAttribute('aria-hidden', String(!open));
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('open');
            mobileMenu.setAttribute('aria-hidden', 'true');
        });
    });
}

/* ---- Tabs (ARIA-konform, Keyboard-Navigation) ---- */
function initTabs() {
    document.querySelectorAll('[role="tablist"]').forEach(tabList => {
        const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
        const container = tabList.closest('.tabs') || tabList.parentElement;

        tabs.forEach((tab, idx) => {
            tab.addEventListener('click', () => activateTab(tab, tabs, container));
            tab.addEventListener('keydown', e => {
                let newIdx = idx;
                if (e.key === 'ArrowRight') { newIdx = (idx + 1) % tabs.length; }
                else if (e.key === 'ArrowLeft') { newIdx = (idx - 1 + tabs.length) % tabs.length; }
                else if (e.key === 'Home') { newIdx = 0; }
                else if (e.key === 'End') { newIdx = tabs.length - 1; }
                else return;
                e.preventDefault();
                activateTab(tabs[newIdx], tabs, container);
                tabs[newIdx].focus();
            });
        });
    });
}

function activateTab(activeTab, allTabs, container) {
    // Alle Tabs deaktivieren
    allTabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
    });
    // Aktiven Tab setzen
    activeTab.setAttribute('aria-selected', 'true');
    activeTab.setAttribute('tabindex', '0');

    // Panels: alle ausblenden
    const panelParent = container.parentElement || container;
    panelParent.querySelectorAll('[role="tabpanel"]').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
    });
    // Aktives Panel einblenden
    const panelId = activeTab.getAttribute('aria-controls') || activeTab.dataset.panel;
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('active');
        panel.hidden = false;
    }
}

function initFassSlider() {
    const slider = document.getElementById('fass-slider');
    const fill = document.getElementById('fass-fill');
    const text = document.getElementById('fass-text');
    const overflow = document.getElementById('fass-overflow');
    const label = document.getElementById('fass-label');
    if (!slider || !fill || !text || !overflow || !label) return;

    slider.addEventListener('input', function () {
        const v = parseInt(this.value, 10);
        fill.style.height = Math.min(v, 100) + '%';
        overflow.style.opacity = v > 85 ? '1' : '0';

        if (v < 40) {
            text.textContent = 'Das Fass ist noch nicht voll. Ihr Angehöriger kann die Belastungen bewältigen.';
            fill.style.background = 'linear-gradient(to top,#3a8fd4,#7ab8e8)';
            label.textContent = 'Belastung';
        } else if (v < 70) {
            text.textContent = 'Das Fass füllt sich. Risikofaktoren wie Konflikte, Schlafmangel oder Isolation kommen hinzu. Schutzfaktoren — soziale Kontakte, Bewegung, Therapie — können das Fass entlasten.';
            fill.style.background = 'linear-gradient(to top,#d4953a,#e8c87a)';
            label.textContent = 'Belastung steigt';
        } else if (v < 90) {
            text.textContent = 'Das Fass ist fast voll. Frühwarnzeichen zeigen sich: Rückzug, Schlafstörungen, Reizbarkeit. Jetzt ist der Moment, Hilfe zu suchen — bevor es überläuft.';
            fill.style.background = 'linear-gradient(to top,#d4633a,#e89a7a)';
            label.textContent = 'Kritisch';
        } else {
            text.textContent = 'Das Fass läuft über. Depression entsteht. Das ist keine Schwäche — es bedeutet, dass die Belastung die Kapazität überschritten hat. Behandlung kann das Fass wieder entlasten.';
            fill.style.background = 'linear-gradient(to top,#c05050,#e07070)';
            label.textContent = 'Überlauf';
        }
    });
}

/* ---- Quiz (mit Doppelklick-Guard) ---- */
function initQuiz() {
    document.querySelectorAll('.quiz-submit').forEach(btn => {
        btn.addEventListener('click', () => handleQuiz(btn));
    });
}

function handleQuiz(btn) {
    // Doppelklick-Guard
    if (btn.disabled || btn.dataset.submitted) return;
    btn.dataset.submitted = 'true';

    const quizId = btn.dataset.quiz;
    const correct = btn.dataset.correct;
    const successMsg = btn.dataset.success || 'Richtig!';
    const failMsg = btn.dataset.fail || 'Leider falsch. Lesen Sie den Abschnitt nochmals.';

    const container = document.getElementById(quizId);
    if (!container) return;

    const selected = container.querySelector('input[type="radio"]:checked');
    // Feedback-Element: zuerst per aria-describedby, dann per Klasse im quiz-block
    const feedbackId = btn.getAttribute('aria-describedby');
    const feedback = feedbackId
        ? document.getElementById(feedbackId)
        : btn.closest('.quiz-block').querySelector('.quiz-feedback');

    if (!feedback) return;

    // Edge Case: keine Auswahl
    if (!selected) {
        feedback.textContent = 'Bitte wählen Sie eine Antwort aus.';
        feedback.className = 'quiz-feedback';
        feedback.setAttribute('role', 'alert');
        delete btn.dataset.submitted; // Erneuter Versuch erlaubt
        return;
    }

    // Alle Optionen zurücksetzen
    container.querySelectorAll('.quiz-option').forEach(o => {
        o.classList.remove('correct', 'incorrect');
    });

    if (selected.value === correct) {
        selected.closest('.quiz-option').classList.add('correct');
        feedback.textContent = '✓ ' + successMsg;
        feedback.className = 'quiz-feedback correct';
        announceToSR('Richtige Antwort: ' + successMsg);
    } else {
        selected.closest('.quiz-option').classList.add('incorrect');
        const correctOption = container.querySelector('input[value="' + correct + '"]');
        if (correctOption) correctOption.closest('.quiz-option').classList.add('correct');
        feedback.textContent = '✗ ' + failMsg;
        feedback.className = 'quiz-feedback incorrect';
        announceToSR('Falsche Antwort. ' + failMsg);
    }
    feedback.setAttribute('role', 'alert');
    btn.disabled = true;
}

/* ---- Font Controls (gefixt: korrekte IDs + Stufenlogik) ---- */
function initFontControls() {
    const root = document.documentElement;
    const btnSmaller = document.getElementById('font-smaller');
    const btnLarger = document.getElementById('font-larger');
    let currentSize = 100;
    const STEP = 12, MIN = 88, MAX = 136;

    if (btnSmaller) {
        btnSmaller.addEventListener('click', () => {
            currentSize = Math.max(MIN, currentSize - STEP);
            root.style.fontSize = currentSize === 100 ? '' : currentSize + '%';
            announceToSR(`Schriftgrösse: ${currentSize}%`);
        });
    }
    if (btnLarger) {
        btnLarger.addEventListener('click', () => {
            currentSize = Math.min(MAX, currentSize + STEP);
            root.style.fontSize = currentSize + '%';
            announceToSR(`Schriftgrösse: ${currentSize}%`);
        });
    }
}

/* ---- Back to Top ---- */
function initBackToTop() {
    const btt = document.getElementById('back-to-top');
    if (!btt) return;
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                btt.style.display = window.scrollY > 400 ? 'flex' : 'none';
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ---- Belastungs-Barometer (mit NaN-Schutz) ---- */
function initBarometer() {
    const form = document.getElementById('barometer-form');
    if (form) {
        form.addEventListener('submit', function(e) { e.preventDefault(); });
    }
    // Schieberegler: Wert anzeigen
    document.querySelectorAll('.barometer-item input[type="range"]').forEach(r => {
        r.addEventListener('input', () => {
            const display = r.nextElementSibling;
            if (display) display.textContent = r.value;
        });
    });
    // Auswertungs-Button
    const btn = document.getElementById('barometer-submit-btn');
    if (btn) btn.addEventListener('click', evalBarometer);
}

/** Sichere Wertextraktion für Range-Inputs */
function safeRangeVal(id, fallback = 5) {
    const el = document.getElementById(id);
    if (!el) return fallback;
    const v = parseInt(el.value, 10);
    return Number.isFinite(v) ? v : fallback;
}

function getEmpfehlung(erschoepft, sorgen, selbstsorge) {
    var total = erschoepft + sorgen + selbstsorge;
    var empfehlungen = [];
    if (selbstsorge >= 7) {
        empfehlungen.push({
            icon: '🆘', title: 'Sie brauchen jetzt Unterstützung — für sich selbst.',
            text: 'Ihre eigene Belastung ist sehr hoch. Bitte holen Sie sich Hilfe — das ist keine Schwäche, sondern Selbstschutz.',
            links: [{href:'m5.html',label:'Modul: Selbstsorge →'},{href:'tel:+41583842000',label:'📞 PUK Angehörigenberatung: 058 384 20 00'}]
        });
    }
    if (sorgen >= 8) {
        empfehlungen.push({
            icon: '⚠️', title: 'Ihre Sorgen sind gross.',
            text: 'Wenn Sie befürchten, dass Ihr Angehöriger sich etwas antun könnte, lesen Sie, wie Sie das Thema ansprechen können.',
            links: [{href:'m2.html#m2-3',label:'Suizid ansprechen →'},{href:'tel:143',label:'📞 Dargebotene Hand: 143'}]
        });
    }
    if (erschoepft >= 7 && empfehlungen.length === 0) {
        empfehlungen.push({
            icon: '💛', title: 'Die Erschöpfung ist spürbar.',
            text: 'Wenn Sie seit Langem für jemanden da sind, ist es normal, an Grenzen zu kommen. Lesen Sie, was Ihnen helfen kann.',
            links: [{href:'m5.html',label:'Modul: Selbstsorge →'},{href:'m3.html#m3-3',label:'Grenzen setzen →'}]
        });
    }
    if (total <= 12 && empfehlungen.length === 0) {
        empfehlungen.push({
            icon: '📘', title: 'Ein guter Moment, sich zu informieren.',
            text: 'Sie scheinen noch Ressourcen zu haben. Nutzen Sie diese Phase, um sich Wissen aufzubauen — das hilft, wenn es schwieriger wird.',
            links: [{href:'m1.html',label:'Modul: Was ist Depression? →'},{href:'m1b.html',label:'Modul: Behandlung →'}]
        });
    }
    if (empfehlungen.length === 0) {
        empfehlungen.push({
            icon: '🤝', title: 'Sie tragen viel.',
            text: 'Ihre Belastung ist mittel bis hoch. Informieren Sie sich und holen Sie sich Unterstützung, bevor es zu viel wird.',
            links: [{href:'m2.html',label:'Modul: Kommunikation →'},{href:'m6.html',label:'Modul: Hilfe finden →'}]
        });
    }
    return empfehlungen;
}

function evalBarometer() {
    const v1 = safeRangeVal('bar1');
    const v2 = safeRangeVal('bar2');
    const v3 = safeRangeVal('bar3');
    const total = v1 + v2 + v3;
    const result = document.getElementById('barometer-result');
    if (!result) return;

    // NaN-Fallback
    if (!Number.isFinite(total)) {
        result.className = 'barometer-result show';
        result.innerHTML = 'Es ist ein technischer Fehler aufgetreten. Bitte laden Sie die Seite neu.';
        return;
    }

    result.classList.add('show');
    if (total <= 15) {
        result.className = 'barometer-result show low';
        result.innerHTML = '<strong>Ihre Belastung scheint derzeit moderat.</strong> Das ist gut. Nutzen Sie diese Website, um sich weiter zu informieren und vorzubereiten. Denken Sie daran: Auch bei moderater Belastung ist Selbstsorge wichtig.';
    } else if (total <= 22) {
        result.className = 'barometer-result show medium';
        result.innerHTML = '<strong>Ihre Belastung ist erhöht.</strong> Das ist ein Zeichen, dass Sie sich um sich selbst kümmern müssen. Lesen Sie Modul 5 (Selbstsorge) und erwägen Sie, sich professionelle Unterstützung zu holen. <a href="m5.html" style="color:inherit;font-weight:600;">→ Zu Modul 5</a>';
    } else {
        result.className = 'barometer-result show high';
        result.innerHTML = '<strong>Ihre Belastung ist hoch.</strong> Bitte nehmen Sie das ernst. Sie brauchen jetzt Unterstützung — für sich selbst. Rufen Sie die Angehörigenberatung der PUK an: <a href="tel:+41583842000" style="color:inherit;font-weight:700;">058 384 20 00</a>. Oder lesen Sie Modul 5 und 6. <a href="m5.html" style="color:inherit;font-weight:600;">→ Zu Modul 5</a>';
    }

    // Personalisierte Empfehlungen
    var empfehlungen = getEmpfehlung(v1, v2, v3);
    var empfHTML = '';
    empfehlungen.forEach(function(e) {
        empfHTML += '<div style="margin-top:1rem;padding:1rem;background:#fff;border-left:4px solid var(--m1,#D24136);border-radius:0 8px 8px 0;">';
        empfHTML += '<p style="font-size:1.1rem;margin:0 0 .3rem;">' + e.icon + ' <strong>' + e.title + '</strong></p>';
        empfHTML += '<p style="font-size:.9rem;margin:0 0 .5rem;color:#555;">' + e.text + '</p>';
        e.links.forEach(function(l) {
            empfHTML += '<a href="' + l.href + '" style="display:inline-block;margin-right:.75rem;margin-top:.25rem;font-size:.88rem;font-weight:600;color:var(--m1,#D24136);text-decoration:none;">' + l.label + '</a>';
        });
        empfHTML += '</div>';
    });
    result.innerHTML += empfHTML;

    // SR-Feedback
    announceToSR(result.textContent);

    // Reset-Button einblenden, Submit-Button ausblenden
    const resetBtn = document.getElementById('barometer-reset-btn');
    const submitBtn = document.getElementById('barometer-submit-btn');
    if (resetBtn) resetBtn.style.display = '';
    if (submitBtn) submitBtn.style.display = 'none';
}

/* ---- Belastungs-Barometer Reset ---- */
function initBarometerReset() {
    const resetBtn = document.getElementById('barometer-reset-btn');
    const submitBtn = document.getElementById('barometer-submit-btn');
    const result = document.getElementById('barometer-result');
    if (!resetBtn) return;
    resetBtn.addEventListener('click', () => {
        // Slider auf 5 zurücksetzen
        ['bar1','bar2','bar3'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = 5;
                const display = el.nextElementSibling;
                if (display) display.textContent = '5';
            }
        });
        // Ergebnis ausblenden
        if (result) {
            result.className = 'barometer-result';
            result.innerHTML = '';
        }
        // Reset-Button verstecken, Submit-Button zeigen
        resetBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = '';
        announceToSR('Assessment zurückgesetzt. Bitte füllen Sie die Schieberegler erneut aus.');
    });
}

/* ---- Aktive Navigation hervorheben ---- */
function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinks.length) return;
    // Build a map from href → link element for O(1) lookups
    const navMap = new Map();
    navLinks.forEach(l => navMap.set(l.getAttribute('href'), l));
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const link = navMap.get('#' + entry.target.id);
            if (link) link.style.fontWeight = entry.isIntersecting ? '700' : '';
        });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(s => observer.observe(s));
}

/* ---- Abschnitt-Teilen-Links ---- */
(function() {
    var headings = document.querySelectorAll('.module-section h3[id]');
    headings.forEach(function(h) {
        var btn = document.createElement('button');
        btn.innerHTML = '🔗';
        btn.title = 'Link zu diesem Abschnitt kopieren';
        btn.setAttribute('aria-label', 'Link zu diesem Abschnitt kopieren');
        btn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:.85rem;opacity:.3;transition:opacity .15s;margin-left:.4rem;vertical-align:middle;padding:0;';
        btn.onmouseover = function() { this.style.opacity = '1'; };
        btn.onmouseout = function() { this.style.opacity = '.3'; };
        btn.onclick = function(e) {
            e.preventDefault();
            var url = window.location.origin + window.location.pathname + '#' + h.id;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function() {
                    btn.innerHTML = '✓';
                    btn.style.opacity = '1';
                    setTimeout(function() { btn.innerHTML = '🔗'; btn.style.opacity = '.3'; }, 2000);
                });
            } else {
                var t = document.createElement('textarea');
                t.value = url;
                document.body.appendChild(t);
                t.select();
                document.execCommand('copy');
                document.body.removeChild(t);
                btn.innerHTML = '✓';
                btn.style.opacity = '1';
                setTimeout(function() { btn.innerHTML = '🔗'; btn.style.opacity = '.3'; }, 2000);
            }
        };
        h.appendChild(btn);
    });
})();
