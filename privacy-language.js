(() => {
    "use strict";

    const STORAGE_KEY = "itExpertLanguage";

    const content = [
        { selector: ".skip-link", en: "Skip to main content", de: "Zum Hauptinhalt springen" },
        { selector: ".main-navigation", attr: "aria-label", en: "Main navigation", de: "Hauptnavigation" },
        { selector: ".language-switcher", attr: "aria-label", en: "Language selection", de: "Sprachauswahl" },
        { selector: ".site-brand", en: "IT-Expert", de: "IT-Expert" },
        { selector: ".main-navigation a[href='index.html#services']", en: "Expertise", de: "Expertise" },
        { selector: ".main-navigation a[href='index.html#about']", en: "About", de: "Über mich" },
        { selector: ".main-navigation a[href='index.html#project']", en: "TraceTrust", de: "TraceTrust" },
        { selector: ".main-navigation a[href='index.html#work']", en: "Proof", de: "Nachweise" },
        { selector: ".main-navigation a[href='index.html#contact']", en: "Contact", de: "Kontakt" },
        { selector: "title", en: "Privacy - IT-Expert", de: "Datenschutz - IT-Expert" },
        { selector: "meta[name='description']", attr: "content", en: "Privacy notice for the IT-Expert portfolio website.", de: "Datenschutzhinweis für die IT-Expert-Portfolio-Website." },
        { selector: ".legal-container h1", en: "Privacy Notice", de: "Datenschutzhinweis" },
        { selector: ".legal-container > p:nth-of-type(1)", en: "Last updated: 2026-03-03", de: "Zuletzt aktualisiert: 03.03.2026" },
        { selector: ".legal-container h2:nth-of-type(1)", en: "1. Responsible contact", de: "1. Verantwortlicher Kontakt" },
        { selector: ".legal-container h2:nth-of-type(2)", en: "2. Scope of this website", de: "2. Zweck dieser Website" },
        { selector: ".legal-container > p:nth-of-type(3)", en: "This website is a personal profile and portfolio page. Freelance or project inquiries are handled individually by direct contact. It does not use analytics tools, advertising trackers, external web fonts, JavaScript frameworks, or cookie banners. It uses a small first-party script for the German/English language switcher and may store your manual language choice locally in your browser.", de: "Diese Website ist eine persönliche Profil- und Portfolioseite. Freelance- oder Projektanfragen werden individuell per Direktkontakt bearbeitet. Die Website nutzt keine Analytics-Tools, Werbetracker, externen Webfonts, JavaScript-Frameworks oder Cookie-Banner. Sie nutzt ein kleines First-Party-Skript für den Deutsch/Englisch-Umschalter und kann Ihre manuelle Sprachauswahl lokal in Ihrem Browser speichern." },
        { selector: ".legal-container h2:nth-of-type(3)", en: "3. Hosting and server logs", de: "3. Hosting und Server-Logs" },
        { selector: ".legal-container > p:nth-of-type(4)", en: "The site is hosted via GitHub Pages and delivered through CDN infrastructure. When you access this website, technical log data may be processed by the hosting/CDN provider (for example IP address, date/time, requested resource, user agent, and referrer) to operate and secure the service.", de: "Die Website wird über GitHub Pages gehostet und über CDN-Infrastruktur ausgeliefert. Beim Zugriff auf diese Website können technische Logdaten durch den Hosting-/CDN-Anbieter verarbeitet werden, zum Beispiel IP-Adresse, Datum/Uhrzeit, angeforderte Ressource, User-Agent und Referrer, um den Dienst zu betreiben und abzusichern." },
        { selector: ".legal-container h2:nth-of-type(4)", en: "4. Cookies", de: "4. Cookies" },
        { selector: ".legal-container > p:nth-of-type(5)", en: "This website does not set first-party tracking cookies. Platform-level technical cookies may still be used by your browser or the hosting provider.", de: "Diese Website setzt keine First-Party-Tracking-Cookies. Technische Cookies auf Plattformebene können weiterhin durch Ihren Browser oder den Hosting-Anbieter verwendet werden." },
        { selector: ".legal-container h2:nth-of-type(5)", en: "5. Contact by email", de: "5. Kontakt per E-Mail" },
        { selector: ".legal-container > p:nth-of-type(6)", en: "If you contact me by email, your message and metadata are processed to answer your request. If your inquiry is about an AI or dev automation audit, do not send secrets, customer data, private repository contents, credentials, or confidential vulnerability details in the first message. Data boundaries are clarified before any review work starts. Data is kept only as long as needed for communication or legal obligations.", de: "Wenn Sie mich per E-Mail kontaktieren, werden Ihre Nachricht und Metadaten verarbeitet, um Ihre Anfrage zu beantworten. Wenn es um ein AI- oder Dev-Automation-Audit geht, senden Sie in der ersten Nachricht bitte keine Secrets, Kundendaten, privaten Repository-Inhalte, Zugangsdaten oder vertraulichen Schwachstellendetails. Datengrenzen werden geklärt, bevor Review-Arbeit beginnt. Daten werden nur so lange gespeichert, wie es für Kommunikation oder gesetzliche Pflichten nötig ist." },
        { selector: ".legal-container h2:nth-of-type(6)", en: "6. External links", de: "6. Externe Links" },
        { selector: ".legal-container > p:nth-of-type(7)", en: "This site links to external websites (for example LinkedIn, Xing, and open-source project pages). Their privacy policies apply once you leave this website.", de: "Diese Website verlinkt auf externe Websites, zum Beispiel LinkedIn, Xing und Open-Source-Projektseiten. Sobald Sie diese Website verlassen, gelten deren Datenschutzregeln." },
        { selector: ".legal-container h2:nth-of-type(7)", en: "7. Your rights", de: "7. Ihre Rechte" },
        { selector: ".legal-container > p:nth-of-type(8)", html: true, en: "Under applicable data protection law, you may request information, correction, deletion, and restriction of processing of personal data. For privacy requests, contact <a href=\"mailto:ac@it-expert.io\">ac@it-expert.io</a>.", de: "Nach geltendem Datenschutzrecht können Sie Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung personenbezogener Daten verlangen. Für Datenschutzanfragen kontaktieren Sie <a href=\"mailto:ac@it-expert.io\">ac@it-expert.io</a>." },
        { selector: ".site-footer .footer-navigation", attr: "aria-label", en: "Footer navigation", de: "Footer-Navigation" },
        { selector: ".site-footer a[href='index.html#contact']", en: "Contact", de: "Kontakt" },
        { selector: ".site-footer a[href='privacy.html']", en: "Privacy", de: "Datenschutz" },
        { selector: ".site-footer a[href='llms.txt']", en: "Agent guide", de: "Agent Guide" }
    ];

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
            // Keep the current page language even if storage is blocked.
        }
    }

    function localeLooksGerman(tag) {
        if (!tag || typeof tag !== "string") {
            return false;
        }
        if (/^de\b/i.test(tag) || /[-_]DE\b/i.test(tag)) {
            return true;
        }
        try {
            const locale = new Intl.Locale(tag);
            return locale.language === "de" || locale.region === "DE";
        } catch (_error) {
            return false;
        }
    }

    function detectInitialLanguage() {
        const saved = safeStorageGet(STORAGE_KEY);
        if (saved === "de" || saved === "en") {
            return saved;
        }
        const languages = Array.isArray(navigator.languages) && navigator.languages.length
            ? navigator.languages
            : [navigator.language || "en"];
        return languages.some(localeLooksGerman) ? "de" : "en";
    }

    function updateText(entry, language) {
        const nodes = document.querySelectorAll(entry.selector);
        nodes.forEach((node) => {
            const value = entry[language];
            if (typeof value !== "string") {
                return;
            }
            if (entry.attr) {
                node.setAttribute(entry.attr, value);
            } else if (entry.html) {
                node.innerHTML = value;
            } else {
                node.textContent = value;
            }
        });
    }

    function applyLanguage(language, persist = true) {
        const safeLanguage = language === "de" ? "de" : "en";
        document.documentElement.lang = safeLanguage;
        content.forEach((entry) => updateText(entry, safeLanguage));

        document.querySelectorAll("[data-language-option]").forEach((button) => {
            const isActive = button.getAttribute("data-language-option") === safeLanguage;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        if (persist) {
            safeStorageSet(STORAGE_KEY, safeLanguage);
        }
    }

    function initLanguageSwitcher() {
        document.querySelectorAll("[data-language-option]").forEach((button) => {
            button.addEventListener("click", () => {
                applyLanguage(button.getAttribute("data-language-option") || "en");
            });
        });
        applyLanguage(detectInitialLanguage(), false);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLanguageSwitcher);
    } else {
        initLanguageSwitcher();
    }
})();
