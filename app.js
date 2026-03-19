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
        ['FontControls', initFontControls],
        ['BackToTop',    initBackToTop],
        ['Barometer',    initBarometer],
        ['NavHighlight',    initNavHighlight],
        ['KriseCta',        initKriseCta],
        ['BarometerReset',  initBarometerReset],
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
        result.innerHTML = '<strong>Ihre Belastung ist hoch.</strong> Bitte nehmen Sie das ernst. Sie brauchen jetzt Unterstützung — für sich selbst. Rufen Sie die Angehörigenberatung der PUK an: <a href="tel:0583846500" style="color:inherit;font-weight:700;">058 384 65 00</a>. Oder lesen Sie Modul 5 und 6. <a href="m5.html" style="color:inherit;font-weight:600;">→ Zu Modul 5</a>';
    }

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
