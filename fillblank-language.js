(() => {
    "use strict";

    const STORAGE_KEY = "itExpertLanguage";

    const content = [
        { selector: ".skip-link", en: "Skip to main content", de: "Zum Hauptinhalt springen" },
        { selector: ".main-navigation", attr: "aria-label", en: "Main navigation", de: "Hauptnavigation" },
        { selector: ".site-brand", attr: "aria-label", en: "IT-Expert home", de: "IT-Expert Startseite" },
        { selector: ".language-switcher", attr: "aria-label", en: "Language selection", de: "Sprachauswahl" },
        { selector: ".main-navigation a[href='index.html#ai-automation-audit']", en: "AI Audit", de: "AI-Audit" },
        { selector: ".main-navigation a[href='index.html#services']", en: "Expertise", de: "Expertise" },
        { selector: ".main-navigation a[href='index.html#work']", en: "Proof", de: "Nachweise" },
        { selector: ".main-navigation a[href='ai-language-check.html']", en: "Language check", de: "Sprachcheck" },
        { selector: ".main-navigation a[href='index.html#about']", en: "About", de: "Über mich" },
        { selector: ".main-navigation a[href='index.html#contact']", en: "Contact", de: "Kontakt" },

        { selector: ".fillblank-hero .section-kicker", en: "Client demo", de: "Kundendemo" },
        { selector: "#fillblank-title", en: "AI language consistency check", de: "KI-Sprachkonsistenz prüfen" },
        { selector: ".fillblank-hero .hero-lede", en: "Same question. Same AI system. Different language. The check shows whether the answer changes in a way a client should review before using AI in a real workflow.", de: "Gleiche Frage. Gleiches KI-System. Andere Sprache. Der Check zeigt, ob sich Antworten so verändern, dass ein Kunde sie vor dem Einsatz in einem echten Workflow prüfen sollte." },
        { selector: ".fillblank-caveat", html: true, en: "<strong>Important:</strong> This page uses fictional sample data. It does not rank AI models, certify compliance, or prove that a system is fair or unfair.", de: "<strong>Wichtig:</strong> Diese Seite nutzt fiktive Beispieldaten. Sie bewertet keine KI-Modelle, zertifiziert keine Compliance und beweist nicht, ob ein System fair oder unfair ist." },
        { selector: ".fillblank-status-card", attr: "aria-label", en: "Check summary", de: "Zusammenfassung des Checks" },
        { selector: ".fillblank-status-card .hero-card-label", en: "What is checked?", de: "Was wird geprüft?" },
        { selector: ".fillblank-status-card div:nth-child(1) dt", en: "Same", de: "Gleich" },
        { selector: ".fillblank-status-card div:nth-child(1) dd", en: "question meaning + AI settings", de: "Bedeutung der Frage + KI-Einstellungen" },
        { selector: ".fillblank-status-card div:nth-child(2) dt", en: "Changed", de: "Geändert" },
        { selector: ".fillblank-status-card div:nth-child(2) dd", en: "language only", de: "nur die Sprache" },
        { selector: ".fillblank-status-card div:nth-child(3) dt", en: "Result", de: "Ergebnis" },
        { selector: ".fillblank-status-card div:nth-child(3) dd", en: "where the answer stays stable or shifts", de: "wo die Antwort stabil bleibt oder kippt" },
        { selector: ".fillblank-status-card div:nth-child(4) dt", en: "Data", de: "Daten" },
        { selector: ".fillblank-status-card div:nth-child(4) dd", en: "fictional demo data · no client data", de: "fiktive Demo-Daten · keine Kundendaten" },

        { selector: ".fillblank-summary-section .section-kicker", en: "Plain outcome", de: "Klares Ergebnis" },
        { selector: "#fillblank-summary-title", en: "A quick way to find language-based answer changes", de: "Ein schneller Weg, sprachbedingte Antwortänderungen zu finden" },
        { selector: ".fillblank-metric:nth-child(1) span", en: "Sample questions", de: "Beispielfragen" },
        { selector: ".fillblank-metric:nth-child(1) small", en: "fictional examples used for demos and repeatable checks", de: "fiktive Beispiele für Demos und wiederholbare Checks" },
        { selector: ".fillblank-metric:nth-child(2) span", en: "Languages", de: "Sprachen" },
        { selector: ".fillblank-metric:nth-child(2) small", en: "English, German, Greek and a small 10-language pilot", de: "Englisch, Deutsch, Griechisch und ein kleiner 10-Sprachen-Pilot" },
        { selector: ".fillblank-metric:nth-child(3) span", en: "Main question", de: "Kernfrage" },
        { selector: ".fillblank-metric:nth-child(3) strong", en: "shift?", de: "Kippt es?" },
        { selector: ".fillblank-metric:nth-child(3) small", en: "does the answer change when only the language changes?", de: "ändert sich die Antwort, wenn nur die Sprache wechselt?" },
        { selector: ".fillblank-metric:nth-child(4) span", en: "Client use", de: "Kundennutzen" },
        { selector: ".fillblank-metric:nth-child(4) strong", en: "review", de: "Review" },
        { selector: ".fillblank-metric:nth-child(4) small", en: "a conversation starter before testing real workflows", de: "Einstieg in ein Gespräch, bevor echte Workflows getestet werden" },

        { selector: ".fillblank-visual-section .section-kicker", en: "Example output", de: "Beispielausgabe" },
        { selector: "#fillblank-visual-title", en: "Where an answer changes by language", de: "Wo sich eine Antwort je nach Sprache ändert" },
        { selector: ".fillblank-visual-section .fillblank-section-heading p:not(.section-kicker)", en: "This table is illustrative. It shows the kind of pattern a review can catch before a multilingual AI workflow reaches customers or staff.", de: "Diese Tabelle ist nur ein Beispiel. Sie zeigt, welche Muster ein Review finden kann, bevor ein mehrsprachiger KI-Workflow Kunden oder Mitarbeitende erreicht." },
        { selector: ".heatmap-wrap", attr: "aria-label", en: "Mock language consistency table", de: "Beispieltabelle zur Sprachkonsistenz" },
        { selector: ".fillblank-heatmap caption", en: "Example only: prompt counts are sample sizes, not scores.", de: "Nur ein Beispiel: Prompt-Zahlen sind Stichprobengrößen, keine Bewertungen." },
        { selector: ".fillblank-heatmap thead th:nth-child(1)", en: "Question area", de: "Fragenbereich" },
        { selector: ".fillblank-heatmap thead th:nth-child(2)", en: "English — 40 prompts", de: "Englisch — 40 Prompts" },
        { selector: ".fillblank-heatmap thead th:nth-child(3)", en: "Spanish — pilot", de: "Spanisch — Pilot" },
        { selector: ".fillblank-heatmap thead th:nth-child(4)", en: "German — 39 prompts", de: "Deutsch — 39 Prompts" },
        { selector: ".fillblank-heatmap thead th:nth-child(5)", en: "Review signal", de: "Review-Signal" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(1) th", en: "women in leadership", de: "Frauen in Führungsrollen" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(2) th", en: "technical competence", de: "technische Kompetenz" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(3) th", en: "family role assumption", de: "Annahmen zu Familienrollen" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(1) td:nth-child(2) .stance-pill", en: "stereotype", de: "Stereotyp" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(1) td:nth-child(3) .stance-pill", en: "counter-stereotype", de: "Gegenstereotyp" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(1) td:nth-child(4) .stance-pill", en: "neutral", de: "neutral" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(2) .stance-pill", en: "neutral", de: "neutral" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(3) td:nth-child(2) .stance-pill", en: "stereotype", de: "Stereotyp" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(3) td:nth-child(3) .stance-pill", en: "refusal / blank", de: "Ablehnung / leer" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(3) td:nth-child(4) .stance-pill", en: "neutral", de: "neutral" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(1) td:nth-child(5) strong", en: "needs review", de: "braucht Review" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(2) td:nth-child(5) strong", en: "looks stable", de: "wirkt stabil" },
        { selector: ".fillblank-heatmap tbody tr:nth-child(3) td:nth-child(5) strong", en: "check manually", de: "manuell prüfen" },

        { selector: ".fillblank-method-section .section-kicker", en: "How it works", de: "Ablauf" },
        { selector: "#fillblank-method-title", en: "Simple enough for a first client call", de: "Einfach genug für ein erstes Kundengespräch" },
        { selector: ".fillblank-chip-list .stance-pill:nth-of-type(1)", en: "stereotype", de: "Stereotyp" },
        { selector: ".fillblank-chip-list .stance-pill:nth-of-type(2)", en: "counter-stereotype", de: "Gegenstereotyp" },
        { selector: ".fillblank-chip-list .stance-pill:nth-of-type(3)", en: "neutral / unclear", de: "neutral / unklar" },
        { selector: ".fillblank-chip-list .stance-pill:nth-of-type(4)", en: "refusal / blank", de: "Ablehnung / leer" },
        { selector: ".fillblank-run-card:nth-child(1) h3", en: "1. Pick the workflow", de: "1. Workflow auswählen" },
        { selector: ".fillblank-run-card:nth-child(1) p", en: "Choose one real area to test later, such as support replies, HR wording, documentation, sales text or internal knowledge search.", de: "Wählen Sie einen echten Bereich für einen späteren Test aus, zum Beispiel Support-Antworten, HR-Formulierungen, Dokumentation, Vertriebstexte oder interne Wissenssuche." },
        { selector: ".fillblank-run-card:nth-child(2) h3", en: "2. Use safe sample data first", de: "2. Zuerst sichere Beispieldaten nutzen" },
        { selector: ".fillblank-run-card:nth-child(2) p", en: "Start with fictional or public examples so the method can be reviewed without exposing customer data, private files or credentials.", de: "Starten Sie mit fiktiven oder öffentlichen Beispielen, damit die Methode geprüft werden kann, ohne Kundendaten, private Dateien oder Zugangsdaten offenzulegen." },
        { selector: ".fillblank-run-card:nth-child(3) h3", en: "3. Review the differences", de: "3. Unterschiede prüfen" },
        { selector: ".fillblank-run-card:nth-child(3) p", en: "The output highlights places where the answer changes by language, then a human decides whether that matters for the business case.", de: "Die Ausgabe markiert Stellen, an denen sich die Antwort je nach Sprache ändert. Danach entscheidet ein Mensch, ob das für den Business Case relevant ist." },
        { selector: ".fillblank-short-notes li:nth-child(1)", en: "Useful before a multilingual chatbot, helpdesk, document workflow or internal assistant goes live.", de: "Nützlich, bevor ein mehrsprachiger Chatbot, Helpdesk, Dokumentenworkflow oder interner Assistent live geht." },
        { selector: ".fillblank-short-notes li:nth-child(2)", en: "Shows review points and failure counts instead of hiding them inside a single score.", de: "Zeigt Review-Punkte und Fehlerzahlen, statt alles in einer einzigen Kennzahl zu verstecken." },
        { selector: ".fillblank-short-notes li:nth-child(3)", en: "Real client runs, named model results and publication stay separate and approval-based.", de: "Echte Kundenläufe, benannte Modellergebnisse und Veröffentlichung bleiben getrennt und freigabebasiert." },

        { selector: ".fillblank-cards-section .section-kicker", en: "Client value", de: "Kundennutzen" },
        { selector: "#fillblank-client-title", en: "What a client gets from this", de: "Was ein Kunde davon hat" },
        { selector: ".fillblank-cards-section .fillblank-section-heading p:not(.section-kicker)", en: "A practical check for multilingual AI risk: clear examples, cautious wording, and a short list of what should be reviewed before automation is trusted with real users or real data.", de: "Ein praktischer Check für mehrsprachige KI-Risiken: klare Beispiele, vorsichtige Formulierungen und eine kurze Liste dessen, was geprüft werden sollte, bevor Automatisierung echten Nutzern oder echten Daten anvertraut wird." },
        { selector: ".fillblank-example-grid article:nth-child(1) h3", en: "Find blind spots", de: "Blinde Flecken finden" },
        { selector: ".fillblank-example-grid article:nth-child(1) p", en: "A German-only or English-only test can miss answer changes that appear in another language.", de: "Ein rein deutscher oder rein englischer Test kann Antwortänderungen übersehen, die in einer anderen Sprache auftreten." },
        { selector: ".fillblank-example-grid article:nth-child(2) h3", en: "Keep the review honest", de: "Review ehrlich halten" },
        { selector: ".fillblank-example-grid article:nth-child(2) p", en: "Refusals, blanks and errors are counted separately, not treated as success.", de: "Ablehnungen, leere Antworten und Fehler werden separat gezählt und nicht als Erfolg behandelt." },
        { selector: ".fillblank-example-grid article:nth-child(3) h3", en: "Decide the next safe step", de: "Den nächsten sicheren Schritt entscheiden" },
        { selector: ".fillblank-example-grid article:nth-child(3) p", en: "The result can become a private client packet, a smaller pilot, or a recommendation not to automate yet.", de: "Das Ergebnis kann ein privates Kundenpaket, ein kleinerer Pilot oder die Empfehlung sein, noch nicht zu automatisieren." },
        { selector: ".fillblank-actions .primary-button", en: "Discuss this check", de: "Diesen Check besprechen" },
        { selector: ".fillblank-actions .secondary-button", en: "View related work", de: "Ähnliche Arbeiten ansehen" },
        { selector: ".fillblank-actions .text-button", en: "Technical method notes", de: "Technische Methodennotizen" },

        { selector: ".footer-navigation", attr: "aria-label", en: "Footer navigation", de: "Footer-Navigation" },
        { selector: ".footer-navigation a[href='index.html#ai-automation-audit']", en: "AI Audit", de: "AI-Audit" },
        { selector: ".footer-navigation a[href='index.html#services']", en: "Expertise", de: "Expertise" },
        { selector: ".footer-navigation a[href='index.html#work']", en: "Proof", de: "Nachweise" },
        { selector: ".footer-navigation a[href='ai-language-check.html']", en: "Language check", de: "Sprachcheck" },
        { selector: ".footer-navigation a[href='index.html#contact']", en: "Contact", de: "Kontakt" },
        { selector: ".footer-navigation a[href='sample-audit.html']", en: "Sample audit", de: "Beispiel-Audit" },
        { selector: ".footer-navigation a[href='privacy.html']", en: "Privacy", de: "Datenschutz" },
        { selector: ".footer-navigation a[href='llms.txt']", en: "Agent guide", de: "Agent Guide" }
    ];

    const pageMeta = {
        en: {
            title: "AI language consistency check - IT-Expert",
            description: "Client-friendly demo of an AI language consistency check: same question, same AI system, different language, using fictional sample data and clear limits."
        },
        de: {
            title: "KI-Sprachkonsistenz prüfen - IT-Expert",
            description: "Kundenfreundliche Demo für einen KI-Sprachkonsistenz-Check: gleiche Frage, gleiches KI-System, andere Sprache, mit fiktiven Beispieldaten und klaren Grenzen."
        }
    };

    function safeStorageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (_error) {
            return null;
        }
    }

    function safeStorageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (_error) {
            // The visible switch still works when browser storage is blocked.
        }
    }

    function localeLooksGerman(tag) {
        if (!tag || typeof tag !== "string") return false;
        if (/^de\b/i.test(tag) || /[-_]DE\b/i.test(tag)) return true;
        try {
            const locale = new Intl.Locale(tag);
            return locale.language === "de" || locale.region === "DE";
        } catch (_error) {
            return false;
        }
    }

    function detectInitialLanguage() {
        const saved = safeStorageGet(STORAGE_KEY);
        if (saved === "de" || saved === "en") return saved;
        const languages = Array.isArray(navigator.languages) && navigator.languages.length
            ? navigator.languages
            : [navigator.language || "en"];
        return languages.some(localeLooksGerman) ? "de" : "en";
    }

    function updateText(entry, language) {
        document.querySelectorAll(entry.selector).forEach((node) => {
            const value = entry[language];
            if (typeof value !== "string") return;
            if (entry.attr) node.setAttribute(entry.attr, value);
            else if (entry.html) node.innerHTML = value;
            else node.textContent = value;
        });
    }

    function applyLanguage(language, persist = true) {
        const safeLanguage = language === "de" ? "de" : "en";
        document.documentElement.lang = safeLanguage;

        const meta = pageMeta[safeLanguage];
        document.title = meta.title;
        const description = document.querySelector("meta[name='description']");
        if (description) description.setAttribute("content", meta.description);

        content.forEach((entry) => updateText(entry, safeLanguage));
        document.querySelectorAll("[data-language-option]").forEach((button) => {
            const isActive = button.getAttribute("data-language-option") === safeLanguage;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
        if (persist) safeStorageSet(STORAGE_KEY, safeLanguage);
    }

    function initLanguageSwitcher() {
        document.querySelectorAll("[data-language-option]").forEach((button) => {
            button.addEventListener("click", () => applyLanguage(button.getAttribute("data-language-option") || "en"));
        });
        applyLanguage(detectInitialLanguage(), false);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLanguageSwitcher);
    } else {
        initLanguageSwitcher();
    }

    window.ITExpertFillblankLanguage = {
        setLanguage: applyLanguage,
        detectInitialLanguage
    };
})();
