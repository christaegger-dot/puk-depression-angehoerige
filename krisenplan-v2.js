const STORAGE_KEY = "puk-krisenplan-v2";

const warningGroups = [
    {
        id: "verhalten",
        title: "Verhalten und Alltag",
        items: [
            "zieht sich stärker zurück als sonst",
            "vernachlässigt Termine, Haushalt oder Körperpflege",
            "wirkt im Alltag deutlich verlangsamt oder blockiert",
            "antwortet nur noch knapp oder gar nicht mehr",
            "bricht gewohnte Kontakte oder Routinen plötzlich ab",
        ],
    },
    {
        id: "stimmung",
        title: "Stimmung und Denken",
        items: [
            "wirkt hoffnungsloser oder wertet sich stark ab",
            "spricht davon, eine Last zu sein",
            "äussert Sinnlosigkeit oder Todeswünsche",
            "reagiert gereizter, abweisender oder kälter als sonst",
            "sagt, dass alles sinnlos sei",
        ],
    },
    {
        id: "koerper",
        title: "Körper, Schlaf und Rhythmus",
        items: [
            "schläft deutlich mehr oder deutlich weniger",
            "ist nachts wach und tagsüber kaum ansprechbar",
            "isst deutlich weniger oder mehr als sonst",
            "wirkt körperlich erschöpft oder klagt über diffuse Schmerzen",
            "gerät deutlich aus dem gewohnten Tagesrhythmus",
        ],
    },
];

const copingItems = [
    "ruhig Kontakt halten, ohne zu drängen",
    "konkrete kleine Hilfe anbieten",
    "einen kurzen Spaziergang oder einen festen Tagesanker anbieten",
    "mit dem Behandlungsteam oder Hausarzt Kontakt aufnehmen",
    "eine weitere Bezugsperson informieren und einbeziehen",
    "Reize reduzieren und Gespräche kurz halten",
    "bei kippenden Gesprächen bewusst Abstand nehmen",
    "eigene Unterstützung für mich selbst holen",
    "eigene Entlastung organisieren, bevor ich selbst kippe",
];

const contactRoles = [
    "Behandlungsteam",
    "Hausarzt/Hausärztin",
    "Eigene Bezugsperson",
    "Weitere wichtige Person",
];

const stageDefinitions = [
    {
        label: "Stufe 1: Erste Warnzeichen",
        note: "Was tue ich, wenn ich die ersten Veränderungen bemerke?",
    },
    {
        label: "Stufe 2: Deutliche Verschlechterung",
        note: "Was ist der nächste konkrete Schritt, wenn die Belastung sichtbar zunimmt?",
    },
    {
        label: "Stufe 3: Eskalation",
        note: "Wen kontaktiere ich, wenn die Situation instabil wird und ich nicht mehr nur beobachten will?",
    },
    {
        label: "Stufe 4: Akute Krise",
        note: "Was tue ich sofort bei akuter Gefährdung oder massiver Zuspitzung?",
    },
];

const defaultData = {
    warningChecked: {},
    customWarnings: "",
    copingChecked: {},
    customCoping: "",
    contacts: contactRoles.map((role) => ({ role, name: "", phone: "", note: "" })),
    stufenplan: stageDefinitions.map(() => ""),
    notes: "",
};

let state = loadPlan();

document.addEventListener("DOMContentLoaded", () => {
    renderWarningGroups();
    renderCopingList();
    renderContacts();
    renderStages();
    bindTextareas();
    bindButtons();
    updateSaveStatus("Lokal gespeichert. Änderungen werden automatisch auf diesem Gerät aktualisiert.");
});

function loadPlan() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(defaultData);
        const parsed = JSON.parse(raw);
        return {
            ...structuredClone(defaultData),
            ...parsed,
            warningChecked: { ...defaultData.warningChecked, ...(parsed.warningChecked || {}) },
            copingChecked: { ...defaultData.copingChecked, ...(parsed.copingChecked || {}) },
            contacts: Array.isArray(parsed.contacts) && parsed.contacts.length
                ? parsed.contacts.map((contact, index) => ({
                    role: contact.role || contactRoles[index] || "Kontakt",
                    name: contact.name || "",
                    phone: contact.phone || "",
                    note: contact.note || "",
                }))
                : structuredClone(defaultData.contacts),
            stufenplan: Array.isArray(parsed.stufenplan) && parsed.stufenplan.length
                ? stageDefinitions.map((_, index) => parsed.stufenplan[index] || "")
                : structuredClone(defaultData.stufenplan),
        };
    } catch (error) {
        console.error("[Krisenplan V2] Laden fehlgeschlagen:", error);
        return structuredClone(defaultData);
    }
}

function savePlan(message = "Aenderungen lokal gespeichert.") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSaveStatus(message);
}

function updateSaveStatus(message) {
    const el = document.getElementById("save-status");
    if (el) el.textContent = message;
}

function bindTextareas() {
    bindInputValue("customWarnings", "customWarnings");
    bindInputValue("customCoping", "customCoping");
    bindInputValue("notes", "notes");
}

function bindInputValue(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = state[key] || "";
    el.addEventListener("input", (event) => {
        state[key] = event.target.value;
        savePlan();
    });
}

function renderWarningGroups() {
    const root = document.getElementById("warning-groups");
    if (!root) return;
    root.innerHTML = "";

    warningGroups.forEach((group) => {
        const section = document.createElement("section");
        section.className = "krisenplan-v2-group";

        const title = document.createElement("h3");
        title.textContent = group.title;
        section.appendChild(title);

        const list = document.createElement("div");
        list.className = "krisenplan-v2-checklist";

        group.items.forEach((item, index) => {
            const key = `${group.id}-${index}`;
            list.appendChild(createCheckboxItem(key, item, state.warningChecked, (checked) => {
                state.warningChecked[key] = checked;
                savePlan();
            }));
        });

        section.appendChild(list);
        root.appendChild(section);
    });
}

function renderCopingList() {
    const root = document.getElementById("coping-list");
    if (!root) return;
    root.innerHTML = "";

    copingItems.forEach((item, index) => {
        const key = `coping-${index}`;
        root.appendChild(createCheckboxItem(key, item, state.copingChecked, (checked) => {
            state.copingChecked[key] = checked;
            savePlan();
        }));
    });
}

function createCheckboxItem(key, text, bucket, onChange) {
    const label = document.createElement("label");
    label.className = "krisenplan-v2-check-item";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!bucket[key];
    input.addEventListener("change", () => onChange(input.checked));

    const span = document.createElement("span");
    span.textContent = text;

    label.append(input, span);
    return label;
}

function renderContacts() {
    const root = document.getElementById("contacts-list");
    if (!root) return;
    root.innerHTML = "";

    state.contacts.forEach((contact, index) => {
        const card = document.createElement("section");
        card.className = "krisenplan-v2-contact";

        const role = document.createElement("p");
        role.className = "krisenplan-v2-contact-role";
        role.textContent = contact.role;
        card.appendChild(role);

        const grid = document.createElement("div");
        grid.className = "krisenplan-v2-contact-grid";

        grid.appendChild(createContactField("Name", contact.name, (value) => {
            state.contacts[index].name = value;
            savePlan();
        }));

        grid.appendChild(createContactField("Telefonnummer", contact.phone, (value) => {
            state.contacts[index].phone = value;
            savePlan();
        }, "tel"));

        grid.appendChild(createContactField("Bemerkung", contact.note, (value) => {
            state.contacts[index].note = value;
            savePlan();
        }, "textarea", "krisenplan-v2-contact-note"));

        card.appendChild(grid);
        root.appendChild(card);
    });
}

function createContactField(labelText, value, onInput, type = "text", extraClass = "") {
    const wrap = document.createElement("div");
    if (extraClass) wrap.className = extraClass;

    const label = document.createElement("label");
    label.textContent = labelText;

    let input;
    if (type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 3;
    } else {
        input = document.createElement("input");
        input.type = type;
    }

    input.value = value || "";
    input.addEventListener("input", (event) => onInput(event.target.value));

    wrap.append(label, input);
    return wrap;
}

function renderStages() {
    const root = document.getElementById("stufenplan-list");
    if (!root) return;
    root.innerHTML = "";

    stageDefinitions.forEach((stage, index) => {
        const card = document.createElement("section");
        card.className = "krisenplan-v2-stage";

        const heading = document.createElement("h3");
        heading.textContent = stage.label;

        const note = document.createElement("p");
        note.className = "krisenplan-v2-stage-note";
        note.textContent = stage.note;

        const textarea = document.createElement("textarea");
        textarea.rows = 4;
        textarea.value = state.stufenplan[index] || "";
        textarea.placeholder = "Konkreter Schritt fuer diese Stufe";
        textarea.addEventListener("input", (event) => {
            state.stufenplan[index] = event.target.value;
            savePlan();
        });

        card.append(heading, note, textarea);
        root.appendChild(card);
    });
}

function bindButtons() {
    const printBtn = document.getElementById("print-plan");
    const resetBtn = document.getElementById("reset-plan");

    if (printBtn) {
        printBtn.addEventListener("click", () => window.print());
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            const confirmed = window.confirm("Alle Eingaben in diesem Krisenplan wirklich loeschen?");
            if (!confirmed) return;
            localStorage.removeItem(STORAGE_KEY);
            state = structuredClone(defaultData);
            renderWarningGroups();
            renderCopingList();
            renderContacts();
            renderStages();
            bindTextareas();
            updateSaveStatus("Lokale Eingaben wurden geloescht.");
        });
    }
}
