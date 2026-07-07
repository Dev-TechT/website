(() => {
    "use strict";

    const STORAGE_KEY = "itExpertLanguage";

    const mailbox = "ac@it-expert.io";
    const auditMail = {
        en: {
            subject: "AI automation audit inquiry",
            body: "Hi Antonios,\n\nI’d like to ask about an AI/dev automation audit.\n\nWorkflow I want to improve:\nTeam/company type:\nCurrent tools:\nData sensitivity: public / internal / sensitive / unsure\nWhat would count as useful after two weeks:\n\nI will not include secrets, credentials, customer data, private repo contents or vulnerability details in this first message."
        },
        de: {
            subject: "Anfrage AI-/Dev-Automation-Audit",
            body: "Hallo Antonios,\n\nich möchte wegen eines AI-/Dev-Automation-Audits anfragen.\n\nWorkflow, den ich verbessern möchte:\nTeam-/Unternehmensart:\nAktuelle Tools:\nDatensensibilität: öffentlich / intern / sensibel / unsicher\nWas nach zwei Wochen nützlich wäre:\n\nIch sende in dieser ersten Nachricht keine Secrets, Zugangsdaten, Kundendaten, privaten Repository-Inhalte oder vertraulichen Schwachstellendetails."
        }
    };

    const content = [
        { selector: ".skip-link", en: "Skip to main content", de: "Zum Hauptinhalt springen" },
        { selector: ".main-navigation", attr: "aria-label", en: "Main navigation", de: "Hauptnavigation" },
        { selector: ".language-switcher", attr: "aria-label", en: "Language selection", de: "Sprachauswahl" },
        { selector: ".main-navigation a[href='#services']", en: "Expertise", de: "Expertise" },
        { selector: ".main-navigation a[href='#about']", en: "About", de: "Über mich" },
        { selector: ".main-navigation a[href='#project']", en: "Current Project", de: "Aktuelles Projekt" },
        { selector: ".main-navigation a[href='#ai-automation-audit']", en: "AI Audit", de: "AI-Audit" },
        { selector: ".main-navigation a[href='#work']", en: "Proof", de: "Nachweise" },
        { selector: ".main-navigation a[href='ai-language-check.html']", en: "Language check", de: "Sprachcheck" },
        { selector: ".main-navigation a[href='#contact']", en: "Contact", de: "Kontakt" },

        { selector: ".site-brand", en: "IT-Expert", de: "IT-Expert" },
        { selector: "#home .hero-kicker", en: "For IT and software teams", de: "Für IT- und Softwareteams" },
        { selector: "#home h1", en: "Automate IT work with AI without losing control.", de: "IT-Arbeit mit KI automatisieren, ohne die Kontrolle zu verlieren." },
        { selector: "#home .hero-lede", en: "I review one real workflow, map the data, tools, and approval risks, and show what can be automated safely, what needs human review, and the clearest practical next step.", de: "Ich prüfe einen konkreten Workflow, ordne Daten-, Tool- und Freigaberisiken ein und zeige, was sicher automatisiert werden kann, was menschliche Prüfung braucht und welcher nächste Schritt praktisch sinnvoll ist." },
        { selector: "#home .hero-actions .secondary-button", en: "View sample audit", de: "Beispiel-Audit ansehen" },
        { selector: "#home .trust-strip li:nth-child(1)", en: "15+ years IT experience", de: "15+ Jahre IT-Erfahrung" },
        { selector: "#home .trust-strip li:nth-child(2)", en: "Security / ITSM / Microsoft 365 / Azure", de: "Security / ITSM / Microsoft 365 / Azure" },
        { selector: "#home .trust-strip li:nth-child(3)", en: "Germany / EU / remote", de: "Deutschland / EU / Remote" },
        { selector: "#home .hero-card-label", en: "What you get", de: "Was Sie bekommen" },
        { selector: "#home .hero-card li:nth-child(1)", html: true, en: "<strong>Clear risk map</strong><span>Which data, tools, repos, tickets, and docs the workflow touches.</span>", de: "<strong>Klare Risikoübersicht</strong><span>Welche Daten, Tools, Repos, Tickets und Dokumentationen der Workflow berührt.</span>" },
        { selector: "#home .hero-card li:nth-child(2)", html: true, en: "<strong>Safe automation boundary</strong><span>What can run automatically, what needs human review, and what should wait.</span>", de: "<strong>Klare Automatisierungsgrenzen</strong><span>Was automatisch laufen kann, was menschliche Prüfung braucht und was zunächst warten sollte.</span>" },
        { selector: "#home .hero-card li:nth-child(3)", html: true, en: "<strong>Practical next step</strong><span>A short report and, when low risk, one validated quick win your team can use.</span>", de: "<strong>Praktischer nächster Schritt</strong><span>Ein kurzer Bericht und, wenn mit geringem Risiko möglich, eine validierte Verbesserung für Ihr Team.</span>" },
        { selector: "[data-audit-mail]", en: "Request a workflow review", de: "Workflow prüfen lassen" },

        { selector: "#services > .container > .section-kicker", en: "Experience areas", de: "Erfahrungsbereiche" },
        { selector: "#services h2", en: "IT work that stays practical and reviewable", de: "IT-Arbeit, die praktisch und prüfbar bleibt" },
        { selector: "#services > .container > .section-intro", en: "The lists below preserve the full background, but the common thread is simple: clearer scope, safer access, better handoffs, tested changes and fewer surprises.", de: "Die Listen unten bewahren den vollständigen Hintergrund. Der rote Faden ist einfach: klarerer Scope, sicherere Zugänge, bessere Übergaben, getestete Änderungen und weniger Überraschungen." },
        { selector: "#services .service-item:nth-of-type(1) img", attr: "alt", en: "Abstract network security concept image", de: "Abstraktes Bild zum Thema Netzwerksicherheit" },
        { selector: "#services .service-item:nth-of-type(1) h3", en: "Security", de: "Security" },
        { selector: "#services .service-item:nth-of-type(1) p", en: "Topics I work with and continue to study in day-to-day IT security.", de: "Themen, mit denen ich in der IT-Sicherheit arbeite und die ich laufend vertiefe." },
        { selector: "#services .service-item:nth-of-type(1) li:nth-child(1)", en: "Comprehensive Mobile Device Management Solutions", de: "Mobile-Device-Management-Lösungen" },
        { selector: "#services .service-item:nth-of-type(1) li:nth-child(2)", en: "Robust Privileged Access Security Implementation", de: "Absicherung privilegierter Zugänge" },
        { selector: "#services .service-item:nth-of-type(1) li:nth-child(3)", en: "Advanced Network Security Configuration (incl. Private DNS)", de: "Netzwerksicherheits-Konfiguration, inkl. Private DNS" },
        { selector: "#services .service-item:nth-of-type(1) li:nth-child(4)", en: "Tailored Workshops for IT Privacy & Security Awareness", de: "Workshops zu IT-Privatsphäre und Security Awareness" },
        { selector: "#services .service-item:nth-of-type(1) li:nth-child(5)", en: "Custom Monitoring System Implementation (e.g., Nagios-based)", de: "Aufbau passender Monitoring-Systeme, z. B. Nagios-basiert" },
        { selector: "#services .service-item:nth-of-type(1) li:nth-child(6)", en: "Thorough IT Auditing and Compliance Checks", de: "IT-Audits und Compliance-nahe Prüfungen" },
        { selector: "#services .service-item:nth-of-type(1) li:nth-child(7)", en: "Integrated Identity and Access Management (IAM)", de: "Identity and Access Management (IAM)" },
        { selector: "#services .service-item:nth-of-type(1) li:nth-child(8)", en: "Streamlined Single Sign-On (SSO) Solutions", de: "Single-Sign-On-Lösungen (SSO)" },

        { selector: "#services .service-item:nth-of-type(2) img", attr: "alt", en: "Business meeting discussing management topics", de: "Besprechung zu Management-Themen" },
        { selector: "#services .service-item:nth-of-type(2) h3", en: "Management", de: "Management" },
        { selector: "#services .service-item:nth-of-type(2) p", en: "Topics I have worked on in IT operations, governance and team processes.", de: "Themen aus IT-Betrieb, Governance und Teamprozessen, an denen ich gearbeitet habe." },
        { selector: "#services .service-item:nth-of-type(2) li:nth-child(1)", en: "ITIL Best Practice Implementation", de: "ITIL-Best-Practice-Umsetzung" },
        { selector: "#services .service-item:nth-of-type(2) li:nth-child(2)", en: "Incident Management Process Optimization", de: "Optimierung von Incident-Management-Prozessen" },
        { selector: "#services .service-item:nth-of-type(2) li:nth-child(3)", en: "Proactive Problem Management Strategies", de: "Proaktive Problem-Management-Ansätze" },
        { selector: "#services .service-item:nth-of-type(2) li:nth-child(4)", en: "Effective Escalation Management Frameworks", de: "Praktische Eskalationsprozesse" },
        { selector: "#services .service-item:nth-of-type(2) li:nth-child(5)", en: "Strategic Provider and Vendor Management", de: "Provider- und Vendor-Management" },
        { selector: "#services .service-item:nth-of-type(2) li:nth-child(6)", en: "End-to-End IT Service Management (ITSM)", de: "End-to-End IT Service Management (ITSM)" },
        { selector: "#services .service-item:nth-of-type(2) li:nth-child(7)", en: "Agile DevOps Team Leadership and Management", de: "Führung und Steuerung agiler DevOps-Teams" },

        { selector: "#services .service-item:nth-of-type(3) img", attr: "alt", en: "Abstract image representing digital transformation", de: "Abstraktes Bild für digitale Transformation" },
        { selector: "#services .service-item:nth-of-type(3) h3", en: "Digital Transformation", de: "Digitale Transformation" },
        { selector: "#services .service-item:nth-of-type(3) p", en: "Topics related to modernization, migration and practical automation.", de: "Themen rund um Modernisierung, Migration und praktische Automatisierung." },
        { selector: "#services .service-item:nth-of-type(3) li:nth-child(1)", en: "Hybrid Cloud and On-Premise Infrastructure Management", de: "Hybrid-Cloud- und On-Premise-Infrastruktur" },
        { selector: "#services .service-item:nth-of-type(3) li:nth-child(2)", en: "Microsoft 365 & Azure Cloud Administration (incl. Power Platform, SharePoint, Teams, Intune)", de: "Microsoft 365 und Azure Administration, inkl. Power Platform, SharePoint, Teams und Intune" },
        { selector: "#services .service-item:nth-of-type(3) li:nth-child(3)", en: "Process Automation via PowerShell Scripting", de: "Prozessautomatisierung mit PowerShell" },
        { selector: "#services .service-item:nth-of-type(3) li:nth-child(4)", en: "Microsoft Exchange Server Management and Migration", de: "Microsoft Exchange Server Management und Migration" },
        { selector: "#services .service-item:nth-of-type(3) li:nth-child(5)", en: "Modern Cloud-Based HelpDesk Solutions", de: "Moderne cloudbasierte Helpdesk-Lösungen" },
        { selector: "#services .service-item:nth-of-type(3) li:nth-child(6)", en: "Professional Website and E-commerce Platform Development", de: "Website- und E-Commerce-Entwicklung" },
        { selector: "#services .service-item:nth-of-type(3) li:nth-child(7)", en: "GDPR and ISO 27001 compliance support", de: "Unterstützung bei DSGVO- und ISO-27001-nahen Kontrollen" },

        { selector: "#services .service-item:nth-of-type(4) img", attr: "alt", en: "Person working on a laptop in a creative setting", de: "Person arbeitet an einem Laptop" },
        { selector: "#services .service-item:nth-of-type(4) h3", en: "Community & Learning", de: "Community & Lernen" },
        { selector: "#services .service-item:nth-of-type(4) p:nth-of-type(1)", html: true, en: "<strong>I also share knowledge with non-profit organizations through practical workshops:</strong>", de: "<strong>Ich gebe Wissen auch in praktischen Workshops für gemeinnützige Organisationen weiter:</strong>" },
        { selector: "#services .service-item:nth-of-type(4) li:nth-child(1)", en: "Introduction to practical Open Source AI tools", de: "Einführung in praktische Open-Source-AI-Tools" },
        { selector: "#services .service-item:nth-of-type(4) li:nth-child(2)", en: "Leveraging AI for task automation and efficiency", de: "AI für Aufgabenautomatisierung und effizientere Abläufe nutzen" },
        { selector: "#services .service-item:nth-of-type(4) li:nth-child(3)", en: "Using AI for creative content generation (text, images)", de: "AI für kreative Inhalte nutzen, z. B. Text und Bilder" },
        { selector: "#services .service-item:nth-of-type(4) li:nth-child(4)", en: "Understanding ethical considerations and security in AI", de: "Ethik und Sicherheit bei AI praktisch einordnen" },
        { selector: "#services .service-item:nth-of-type(4) p:nth-of-type(2)", en: "Open source projects I follow and support:", de: "Open-Source-Projekte, die ich verfolge und unterstütze:" },

        { selector: "#about img", attr: "alt", en: "Portrait of Antonios Chatzigiagkos", de: "Porträt von Antonios Chatzigiagkos" },
        { selector: "#about .section-kicker", en: "About", de: "Über mich" },
        { selector: "#about h2", en: "About Me", de: "Über mich" },
        { selector: "#about .about-content p:nth-of-type(2)", en: "My name is Antonios Chatzigiagkos. I have 15+ years of experience in IT and build practical solutions for real-world technical challenges.", de: "Mein Name ist Antonios Chatzigiagkos. Ich habe 15+ Jahre Erfahrung in der IT und baue praktische Lösungen für echte technische Probleme." },
        { selector: "#about .about-content p:nth-of-type(3)", en: "My work covers IT operations, security, Microsoft 365 and Azure administration, automation, service management and modern AI tooling. I like useful systems: clear scope, good handoffs, tests, logs and rollback paths.", de: "Meine Arbeit umfasst IT-Betrieb, Security, Microsoft 365 und Azure Administration, Automatisierung, Service Management und moderne AI-Tools. Ich mag Systeme, die funktionieren: klare Grenzen, saubere Übergaben, Tests, Logs und Rollback-Wege." },
        { selector: "#about .about-content p:nth-of-type(4)", en: "I actively explore open-source and local-first AI across web development, programming, security analysis and content workflows, then turn the useful parts into working methods.", de: "Ich beschäftige mich aktiv mit Open Source und Local-First-AI für Webentwicklung, Programmierung, Security-Analyse und Content-Workflows und überführe die nützlichen Teile in belastbare Arbeitsweisen." },
        { selector: "#about .about-content p:nth-of-type(5)", en: "This website is a personal profile and portfolio page for employers, clients and technical reviewers. Freelance or project inquiries are handled individually by direct contact.", de: "Diese Website ist mein persönliches Profil und Portfolio für Arbeitgeber, Kunden und technische Prüfer. Freelance- oder Projektanfragen kläre ich direkt und individuell." },
        { selector: "#about .about-content p:nth-of-type(6)", html: true, en: "To learn more about me, check out my <a href=\"https://www.linkedin.com/in/antonios-chatzigiagkos/\" target=\"_blank\" rel=\"noopener noreferrer\">LinkedIn</a> &amp; <a href=\"https://www.xing.com/profile/Antonios_Chatzigiagkos/cv\" target=\"_blank\" rel=\"noopener noreferrer\">Xing</a> accounts. For exchange and networking, contact me via email: <a href=\"mailto:ac@it-expert.io\">ac@it-expert.io</a>.", de: "Mehr über mich finden Sie auf <a href=\"https://www.linkedin.com/in/antonios-chatzigiagkos/\" target=\"_blank\" rel=\"noopener noreferrer\">LinkedIn</a> und <a href=\"https://www.xing.com/profile/Antonios_Chatzigiagkos/cv\" target=\"_blank\" rel=\"noopener noreferrer\">Xing</a>. Für Austausch und Networking erreichen Sie mich per E-Mail: <a href=\"mailto:ac@it-expert.io\">ac@it-expert.io</a>." },

        { selector: "#project .section-kicker", en: "Current product experiment", de: "Aktuelles Produktexperiment" },
        { selector: "#project h2", en: "TraceTrust", de: "TraceTrust" },
        { selector: "#project .project-tagline", html: true, en: "<strong>A trust layer for AI agent tasks.</strong>", de: "<strong>Eine Vertrauensebene für AI-Agent-Aufgaben.</strong>" },
        { selector: "#project .project-description", en: "Scope is defined first, execution is logged, and review happens before payout. This product effort is separate from this personal profile page. The public demo is read-only and uses sample data.", de: "Erst wird der Scope geklärt, dann wird die Ausführung protokolliert, und vor einer Auszahlung gibt es Review. Dieses Produktprojekt ist von dieser persönlichen Profilseite getrennt. Die öffentliche Demo ist read-only und nutzt Beispieldaten." },

        { selector: "#project .project-link", en: "Open public demo", de: "Öffentliche Demo öffnen" },

        { selector: "#ai-automation-audit .section-kicker", en: "AI and dev automation audit", de: "AI- und Dev-Automation-Audit" },
        { selector: "#ai-automation-audit h2", en: "No-drama AI and dev automation", de: "AI- und Dev-Automation ohne Drama" },
        { selector: "#ai-automation-audit .audit-lede", en: "For IT and software teams that want to clean up repeated PR, documentation, QA or support work without handing sensitive workflows to an unchecked bot.", de: "Für IT- und Softwareteams, die wiederkehrende PR-, Doku-, QA- oder Supportarbeit aufräumen wollen, ohne sensible Abläufe einem ungeprüften Bot zu überlassen." },
        { selector: "#ai-automation-audit .audit-panel-main > div:nth-child(1) h3", en: "What I check", de: "Was ich prüfe" },
        { selector: "#ai-automation-audit .audit-panel-main > div:nth-child(1) p", en: "I review one concrete workflow, map the data and approval boundaries, and produce a short report with practical next steps. If the scope is safe enough, I can also prepare one focused, human-reviewed quick win.", de: "Ich prüfe einen konkreten Workflow, ordne Daten- und Freigabegrenzen ein und liefere einen kurzen Bericht mit praktischen nächsten Schritten. Wenn der Scope sicher genug ist, kann ich auch eine fokussierte, menschlich geprüfte Verbesserung vorbereiten." },
        { selector: "#ai-automation-audit .audit-panel-main > div:nth-child(2) h3", en: "Typical outputs", de: "Typische Ergebnisse" },
        { selector: "#ai-automation-audit .audit-panel-main > div:nth-child(2) li:nth-child(1)", en: "Private repo or documentation review report", de: "Privater Repo- oder Dokumentations-Review-Bericht" },
        { selector: "#ai-automation-audit .audit-panel-main > div:nth-child(2) li:nth-child(2)", en: "Docs-gap or QA checklist", de: "Docs-Gap- oder QA-Checkliste" },
        { selector: "#ai-automation-audit .audit-panel-main > div:nth-child(2) li:nth-child(3)", en: "Risk notes for data, tools and approvals", de: "Risikohinweise zu Daten, Tools und Freigaben" },
        { selector: "#ai-automation-audit .audit-panel-main > div:nth-child(2) li:nth-child(4)", en: "One focused patch, script or draft workflow if it is low risk", de: "Ein fokussierter Patch, ein Skript oder ein Workflow-Entwurf, wenn das risikoarm möglich ist" },
        { selector: "#ai-automation-audit .audit-grid", attr: "aria-label", en: "Audit packages", de: "Audit-Pakete" },
        { selector: "#ai-automation-audit .audit-card:nth-child(1) h3", en: "Quick audit", de: "Quick Audit" },
        { selector: "#ai-automation-audit .audit-card:nth-child(1) p:nth-of-type(1)", en: "Best when you want a clear yes/no on whether one workflow is worth automating.", de: "Sinnvoll, wenn Sie eine klare Einschätzung brauchen, ob sich ein Workflow überhaupt zur Automatisierung eignet." },
        { selector: "#ai-automation-audit .audit-card:nth-child(1) .audit-tags", en: "workflow map · risk notes · recommendation", de: "Workflow-Map · Risikohinweise · Empfehlung" },
        { selector: "#ai-automation-audit .audit-card:nth-child(2) h3", en: "Audit + quick win", de: "Audit + Quick Win" },
        { selector: "#ai-automation-audit .audit-card:nth-child(2) p:nth-of-type(1)", en: "Best when the scope is already narrow and a safe first implementation can be tested privately.", de: "Sinnvoll, wenn der Scope bereits eng ist und eine sichere erste Umsetzung privat getestet werden kann." },
        { selector: "#ai-automation-audit .audit-card:nth-child(2) .audit-tags", en: "private report · checked output · handover notes", de: "privater Bericht · geprüfter Output · Übergabenotizen" },
        { selector: "#ai-automation-audit .audit-card:nth-child(3) h3", en: "Tool selection", de: "Tool-Auswahl" },
        { selector: "#ai-automation-audit .audit-card:nth-child(3) p:nth-of-type(1)", en: "Best when the hard part is choosing between local, EU-hosted and vendor tools without guessing on data risk.", de: "Sinnvoll, wenn die schwierige Frage die Auswahl zwischen lokalen, EU-gehosteten und Vendor-Tools ist, ohne beim Datenrisiko zu raten." },
        { selector: "#ai-automation-audit .audit-card:nth-child(3) .audit-tags", en: "tool fit · data boundaries · approval flow", de: "Tool-Fit · Datengrenzen · Freigabefluss" },
        { selector: "#ai-automation-audit .audit-flow", attr: "aria-label", en: "How the audit works", de: "So läuft das Audit ab" },
        { selector: "#ai-automation-audit .audit-flow h3", en: "How it works", de: "Ablauf" },
        { selector: "#ai-automation-audit .audit-flow li:nth-child(1)", html: true, en: "<strong>Pick one workflow.</strong> A repo review, documentation process, QA checklist or support task is enough.", de: "<strong>Einen Workflow auswählen.</strong> Ein Repo-Review, ein Dokumentationsprozess, eine QA-Checkliste oder eine Supportaufgabe reicht." },
        { selector: "#ai-automation-audit .audit-flow li:nth-child(2)", html: true, en: "<strong>Map the boundaries.</strong> I check data, tools, accounts, approvals and where automation must stop.", de: "<strong>Grenzen klären.</strong> Ich prüfe Daten, Tools, Accounts, Freigaben und wo Automatisierung stoppen muss." },
        { selector: "#ai-automation-audit .audit-flow li:nth-child(3)", html: true, en: "<strong>Return a short report.</strong> You get a practical recommendation, risk notes and one safe next step.", de: "<strong>Kurzen Bericht liefern.</strong> Sie bekommen eine praktische Empfehlung, Risikohinweise und einen sicheren nächsten Schritt." },
        { selector: "#ai-automation-audit .audit-fit-card:nth-child(1) h3", en: "Good fit", de: "Passt gut" },
        { selector: "#ai-automation-audit .audit-fit-card:nth-child(1) li:nth-child(1)", en: "Repeated documentation or PR preparation work", de: "Wiederkehrende Dokumentations- oder PR-Vorbereitung" },
        { selector: "#ai-automation-audit .audit-fit-card:nth-child(1) li:nth-child(2)", en: "Private QA checks before a public release", de: "Private QA-Checks vor einem öffentlichen Release" },
        { selector: "#ai-automation-audit .audit-fit-card:nth-child(1) li:nth-child(3)", en: "Tool choice between local, EU-hosted and vendor AI", de: "Tool-Auswahl zwischen lokaler, EU-gehosteter und Vendor-AI" },
        { selector: "#ai-automation-audit .audit-fit-card:nth-child(2) h3", en: "Not a fit", de: "Passt nicht" },
        { selector: "#ai-automation-audit .audit-fit-card:nth-child(2) li:nth-child(1)", en: "Unreviewed bots acting on customer data", de: "Ungeprüfte Bots auf Kundendaten" },
        { selector: "#ai-automation-audit .audit-fit-card:nth-child(2) li:nth-child(2)", en: "Public security details or vulnerability comments", de: "Öffentliche Security-Details oder Schwachstellenkommentare" },
        { selector: "#ai-automation-audit .audit-fit-card:nth-child(2) li:nth-child(3)", en: "Promises of legal compliance or guaranteed ROI", de: "Versprechen zu Rechtskonformität oder garantiertem ROI" },
        { selector: "#ai-automation-audit .audit-boundaries h3", en: "Boundaries", de: "Grenzen" },
        { selector: "#ai-automation-audit .audit-boundaries li:nth-child(1)", en: "No automatic external emails, PR comments or production changes.", de: "Keine automatischen externen E-Mails, PR-Kommentare oder Produktionsänderungen." },
        { selector: "#ai-automation-audit .audit-boundaries li:nth-child(2)", en: "No sensitive customer data in a first sprint unless the scope is separately approved.", de: "Keine sensiblen Kundendaten im ersten Sprint, außer der Scope wurde separat freigegeben." },
        { selector: "#ai-automation-audit .audit-boundaries li:nth-child(3)", en: "No legal or GDPR guarantee. The work identifies risks and practical controls.", de: "Keine Rechts- oder DSGVO-Garantie. Die Arbeit identifiziert Risiken und praktische Kontrollen." },
        { selector: "#ai-automation-audit .audit-boundaries li:nth-child(4)", en: "No fake case studies or invented ROI claims.", de: "Keine erfundenen Case Studies oder ROI-Behauptungen." },
        { selector: "#ai-automation-audit .audit-proof h3", en: "Want to see the output first?", de: "Erst den Output sehen?" },
        { selector: "#ai-automation-audit .audit-proof p:nth-of-type(1)", en: "Read a fictional, client-safe sample audit before sending private details.", de: "Lesen Sie ein fiktives, kundensicheres Beispiel-Audit, bevor Sie private Details senden." },
        { selector: "#ai-automation-audit .audit-proof a:nth-of-type(1)", en: "Open sample audit", de: "Beispiel-Audit öffnen" },
        { selector: "#ai-automation-audit .audit-proof a:nth-of-type(2)", en: "Open one-page handout", de: "Einseiter öffnen" },
        { selector: "[data-audit-mail]", en: "Request a workflow review", de: "Workflow prüfen lassen" },

        { selector: "#work > .container > .section-kicker", en: "Public-safe proof", de: "Öffentlich sichere Nachweise" },
        { selector: "#work h2", en: "What I can help with", de: "Wobei ich helfen kann" },
        { selector: "#work .work-intro", en: "I keep this section ranked by client value, not by chronology. The four cards below are the strongest public examples right now; the expandable list keeps smaller tested methods visible without turning the page into a changelog.", de: "Ich sortiere diesen Bereich nach Kundennutzen, nicht nach Chronologie. Die vier Karten unten sind aktuell die stärksten öffentlichen Beispiele; die aufklappbare Liste zeigt kleinere getestete Methoden, ohne die Seite in ein Changelog zu verwandeln." },

        { selector: "#work .work-card:nth-child(1) h3", en: "Local-first business automation", de: "Local-first Business-Automatisierung" },
        { selector: "#work .work-card:nth-child(1) p:nth-of-type(1)", en: "Built a browser and CLI workflow for preparing XRechnung and EN16931 invoice XML candidates. Invoice handling stays local, fields are checked in a structured way, and KoSIT validation remains the reference for real submission claims.", de: "Browser- und CLI-Workflow zum Vorbereiten von XRechnung- und EN16931-Rechnungs-XML-Kandidaten gebaut. Rechnungsdaten bleiben lokal, Felder werden strukturiert geprüft, und KoSIT-Validierung bleibt die Referenz für echte Einreichungsclaims." },
        { selector: "#work .work-card:nth-child(1) .work-tags", en: "E-Rechnung · XRechnung · local-first · validation", de: "E-Rechnung · XRechnung · local-first · Validierung" },
        { selector: "#work .work-card:nth-child(2) h3", en: "AI language consistency checks", de: "KI-Sprachkonsistenz prüfen" },
        { selector: "#work .work-card:nth-child(2) p:nth-of-type(1)", html: true, en: "Built a <a href=\"ai-language-check.html\">public demo</a> and repeatable check for spotting when the same AI task answers differently in another language. It uses fictional sample data, plain caveats and no model rankings.", de: "Eine <a href=\"ai-language-check.html\">öffentliche Demo</a> und einen wiederholbaren Check gebaut, um zu erkennen, wenn dieselbe KI-Aufgabe in einer anderen Sprache anders antwortet. Die Demo nutzt fiktive Beispieldaten, klare Hinweise und keine Modell-Rankings." },
        { selector: "#work .work-card:nth-child(2) .work-tags", en: "multilingual AI · QA · sample data · review gates", de: "mehrsprachige KI · QA · Beispieldaten · Review-Gates" },
        { selector: "#work .work-card:nth-child(3) h3", en: "Mission Control operator dashboard", de: "Mission-Control-Operator-Dashboard" },
        { selector: "#work .work-card:nth-child(3) p:nth-of-type(1)", en: "Built a local operator dashboard for automation work: task state, service health, evidence links and approval points in one client-safe snapshot. Raw infrastructure details stay out of the public view.", de: "Lokales Operator-Dashboard für Automatisierungsarbeit gebaut: Aufgabenstatus, Service-Health, Evidence-Links und Freigabepunkte in einem kundensicheren Snapshot. Rohe Infrastrukturdetails bleiben aus der öffentlichen Ansicht heraus." },
        { selector: "#work .work-card:nth-child(3) .work-tags", en: "operations · evidence · approvals · client-safe view", de: "Betrieb · Evidence · Freigaben · kundensichere Ansicht" },
        { selector: "#work .work-card:nth-child(4) h3", en: "Security evidence and audit prep", de: "Security Evidence und Audit-Vorbereitung" },
        { selector: "#work .work-card:nth-child(4) p:nth-of-type(1)", en: "Built local proof packages for security questionnaires, DORA ICT evidence prompts, finance exception reports, accessibility snapshots and technical data rooms. They use synthetic data and approval gates by default.", de: "Lokale Proof-Pakete für Security Questionnaires, DORA-ICT-Evidence-Prompts, Finance-Exception-Reports, Accessibility-Snapshots und technische Datenräume gebaut. Standardmäßig nutzen sie synthetische Daten und Freigabe-Gates." },
        { selector: "#work .work-card:nth-child(4) .work-tags", en: "security evidence · DORA · finance ops · synthetic data", de: "Security Evidence · DORA · Finance Ops · synthetische Daten" },
        { selector: "#work .work-more summary", en: "More project notes and tested methods", de: "Weitere Projektnotizen und getestete Methoden" },

        { selector: "#work .work-list article:nth-child(1) h3", en: "Browser QA automation", de: "Browser-QA-Automatisierung" },
        { selector: "#work .work-list article:nth-child(1) p", en: "Built repeatable browser checks for demo flows, logout behavior, task detail pages, theme switching, invoice forms and trust UI.", de: "Wiederholbare Browser-Checks für Demo-Flows, Logout-Verhalten, Task-Detailseiten, Theme-Wechsel, Rechnungsformulare und Trust-UI gebaut." },
        { selector: "#work .work-list article:nth-child(2) h3", en: "Website file-change and security triage", de: "Website-Dateiänderungs- und Security-Triage" },
        { selector: "#work .work-list article:nth-child(2) p", en: "Triaged WordPress file-change alerts by separating normal updater noise from compromise signals, then checked public pages, plugin state and security headers before recommending baseline or cleanup steps.", de: "WordPress-Dateiänderungsalarme triagiert, indem normales Updater-Rauschen von Kompromittierungssignalen getrennt wurde. Danach wurden öffentliche Seiten, Plugin-Status und Security Header geprüft, bevor Baseline- oder Cleanup-Schritte empfohlen wurden." },
        { selector: "#work .work-list article:nth-child(3) h3", en: "Dependency security remediation", de: "Dependency-Security-Remediation" },
        { selector: "#work .work-list article:nth-child(3) p", en: "Reduced a web app npm audit from reported issues to zero, then checked lint, tests and production build instead of treating the audit output as the finish line.", de: "Ein npm audit einer Web-App von gemeldeten Findings auf null reduziert und danach Lint, Tests und Production-Build geprüft, statt das Audit-Ergebnis als Ziellinie zu behandeln." },
        { selector: "#work .work-list article:nth-child(4) h3", en: "Security Questionnaire / Trust Evidence Pack", de: "Security Questionnaire / Trust Evidence Pack" },
        { selector: "#work .work-list article:nth-child(4) p", en: "Built a private, synthetic package that organizes questionnaire answers, evidence owners, freshness status and approval gates before any real customer security data is touched.", de: "Privates, synthetisches Paket gebaut, das Questionnaire-Antworten, Evidence Owner, Freshness-Status und Freigabe-Gates organisiert, bevor echte Kundensicherheitsdaten berührt werden." },
        { selector: "#work .work-list article:nth-child(5) h3", en: "DORA ICT Register Preflight", de: "DORA-ICT-Register-Preflight" },
        { selector: "#work .work-list article:nth-child(5) p", en: "Built a local spreadsheet-first preflight for ICT providers answering DORA-driven customer due-diligence requests. It is evidence organization, not legal or compliance certification.", de: "Lokalen Spreadsheet-first-Preflight für ICT-Anbieter gebaut, die DORA-getriebene Due-Diligence-Anfragen beantworten. Das ist Evidence-Organisation, keine Rechts- oder Compliance-Zertifizierung." },
        { selector: "#work .work-list article:nth-child(6) h3", en: "Acquire-ready Technical Data Room Kit", de: "Acquire-ready Technical Data Room Kit" },
        { selector: "#work .work-list article:nth-child(6) p", en: "Built a private kit for micro-SaaS technical diligence: architecture notes, repository inventory, dependency evidence, runbooks, access prompts and buyer FAQ material using demo data.", de: "Privates Kit für technische Micro-SaaS-Diligence gebaut: Architekturnotizen, Repository-Inventar, Dependency Evidence, Runbooks, Access-Prompts und Käufer-FAQ mit Demodaten." },
        { selector: "#work .work-list article:nth-child(7) h3", en: "Finance Exception Radar", de: "Finance Exception Radar" },
        { selector: "#work .work-list article:nth-child(7) p", en: "Built a local CSV report for invoice and receivable/payable anomalies using synthetic sample data, summary JSON and validator checks. It stays local and read-only by design.", de: "Lokalen CSV-Report für Rechnungs-, Forderungs- und Verbindlichkeiten-Anomalien mit synthetischen Beispieldaten, Summary-JSON und Validator-Checks gebaut. Das Design ist lokal und read-only." },
        { selector: "#work .work-list article:nth-child(8) h3", en: "TenderOps proof package", de: "TenderOps Proof-Paket" },
        { selector: "#work .work-list article:nth-child(8) p", en: "Built a private bid-pack prototype that turns public tender notices into a bid/no-bid memo, source notes and a short buyer-safe sample. It is a proof package, not a procurement promise.", de: "Privaten Bid-Pack-Prototyp gebaut, der öffentliche Ausschreibungen in ein Bid/No-Bid-Memo, Source Notes und ein kurzes buyer-safe Sample übersetzt. Das ist ein Proof-Paket, kein Beschaffungsversprechen." },
        { selector: "#work .work-list article:nth-child(9) h3", en: "Accessibility Snapshot", de: "Accessibility Snapshot" },
        { selector: "#work .work-list article:nth-child(9) p", en: "Built a page triage check that flags common accessibility issues with selectors and plain notes for developers. Useful before a real WCAG audit, not a replacement for one.", de: "Page-Triage-Check gebaut, der typische Accessibility-Probleme mit Selektoren und klaren Developer-Notizen markiert. Nützlich vor einem echten WCAG-Audit, aber kein Ersatz dafür." },
        { selector: "#work .work-list article:nth-child(10) h3", en: "CAD workflow hardening", de: "CAD-Workflow-Härtung" },
        { selector: "#work .work-list article:nth-child(10) p", en: "Contributed tested production-readiness slices to a browser CAD sketcher: DXF import safety, STL reference-mesh validation, project-file guards, delete-shortcut behavior and rotated push/pull correctness.", de: "Getestete Production-Readiness-Slices für einen Browser-CAD-Sketcher beigesteuert: sichere DXF-Imports, STL-Referenzmesh-Validierung, Projektdatei-Guards, Delete-Shortcut-Verhalten und korrekte rotierte Push/Pull-Operationen." },
        { selector: "#work .work-list article:nth-child(11) h3", en: "Local and private AI stack", de: "Lokaler und privater AI-Stack" },
        { selector: "#work .work-list article:nth-child(11) p", en: "Set up local AI tools for private search, drafting and experimentation without sending every task to a hosted service.", de: "Lokale AI-Tools für private Suche, Drafting und Experimente eingerichtet, ohne jede Aufgabe an einen gehosteten Dienst zu senden." },
        { selector: "#work .work-list article:nth-child(12) h3", en: "Responsible security testing", de: "Verantwortungsvolle Security-Tests" },
        { selector: "#work .work-list article:nth-child(12) p", en: "Tested apps in a responsible, private-first way: scoped targets, safe reproduction steps and clear reports for teams to fix.", de: "Apps verantwortungsvoll und private-first getestet: abgegrenzte Targets, sichere Reproduktionsschritte und klare Reports für die zuständigen Teams." },
        { selector: "#work .work-list article:nth-child(13) h3", en: "Operational monitoring and task systems", de: "Operatives Monitoring und Task-Systeme" },
        { selector: "#work .work-list article:nth-child(13) p", en: "Kept health checks, task state, watchdogs and summaries tied together so automation work has a visible owner, status and next action.", de: "Health Checks, Aufgabenstatus, Watchdogs und Zusammenfassungen zusammengeführt, damit Automatisierungsarbeit einen sichtbaren Owner, Status und nächsten Schritt hat." },
        { selector: "#work .work-list article:nth-child(14) h3", en: "Repo watchlist and safe cherrypick method", de: "Repo-Watchlist und sichere Cherrypick-Methode" },
        { selector: "#work .work-list article:nth-child(14) p", en: "Built a review flow for tracking useful open-source changes, selecting only relevant patterns and turning them into small local improvements after review.", de: "Review-Flow gebaut, um nützliche Open-Source-Änderungen zu verfolgen, nur relevante Muster auszuwählen und sie nach Review in kleine lokale Verbesserungen zu überführen." },
        { selector: "#work .work-list article:nth-child(15) h3", en: "Anonymized AI workflow briefing kit", de: "Anonymisiertes AI-Workflow-Briefing-Kit" },
        { selector: "#work .work-list article:nth-child(15) p", en: "Prepared a managed-agent platform briefing pattern with scope, risks, architecture options and phased MVP notes, without publishing client names or private proposal details.", de: "Briefing-Muster für eine Managed-Agent-Plattform vorbereitet, mit Scope, Risiken, Architekturoptionen und phasenweisen MVP-Notizen, ohne Kundennamen oder private Angebotsdetails zu veröffentlichen." },
        { selector: "#work .work-list article:nth-child(16) h3", en: "Agent runtime and repo reliability", de: "Agent-Runtime- und Repo-Zuverlässigkeit" },
        { selector: "#work .work-list article:nth-child(16) p", en: "Hardened agent-assisted repository work with scoped fixes, local and CI checks, passive repo watchlists, fallback checks and quiet no-news monitoring before calling work complete.", de: "Agent-gestützte Repository-Arbeit mit abgegrenzten Fixes, lokalen und CI-Checks, passiven Repo-Watchlists, Fallback-Checks und stillem No-News-Monitoring gehärtet, bevor Arbeit als abgeschlossen gilt." },

        { selector: "#contact .section-kicker", en: "Contact", de: "Kontakt" },
        { selector: "#contact h2", en: "Want one workflow reviewed?", de: "Soll ein Workflow geprüft werden?" },
        { selector: "#contact .contact-note", en: "Send a short description only. Please do not include secrets, customer data, private repository contents or confidential vulnerability details in the first message.", de: "Bitte nur eine kurze Beschreibung senden. Keine Secrets, Kundendaten, privaten Repository-Inhalte oder vertraulichen Schwachstellendetails in der ersten Nachricht." },
        { selector: "#contact .contact-details img", attr: "alt", en: "", de: "" },
        { selector: "#contact .contact-details p:nth-of-type(1)", html: true, en: "<strong>Antonios Chatzigiagkos</strong><br>IT Expert / Freelancer<br>Germany / Bavaria<br>Phone: <a href=\"tel:+4915115572841\">+49 1511 5572841</a><br>Email: <a href=\"mailto:ac@it-expert.io\">ac@it-expert.io</a><br><a href=\"impressum.html\">Impressum / Legal Notice</a>", de: "<strong>Antonios Chatzigiagkos</strong><br>IT-Experte / Freelancer<br>Deutschland / Bayern<br>Telefon: <a href=\"tel:+4915115572841\">+49 1511 5572841</a><br>E-Mail: <a href=\"mailto:ac@it-expert.io\">ac@it-expert.io</a><br><a href=\"impressum.html\">Impressum</a>" },
        { selector: "#contact .social-links a[href*='xing.com']", attr: "aria-label", en: "Xing Profile", de: "Xing-Profil" },
        { selector: "#contact .social-links a[href*='linkedin.com']", attr: "aria-label", en: "LinkedIn Profile", de: "LinkedIn-Profil" },
        { selector: "#contact .social-links a[href*='xing.com'] img", attr: "alt", en: "Xing Logo", de: "Xing-Logo" },
        { selector: "#contact .social-links a[href*='linkedin.com'] img", attr: "alt", en: "LinkedIn Logo", de: "LinkedIn-Logo" },

        { selector: ".site-footer .footer-navigation", attr: "aria-label", en: "Footer navigation", de: "Footer-Navigation" },
        { selector: ".site-footer a[href='#project']", en: "TraceTrust", de: "TraceTrust" },
        { selector: ".site-footer a[href='#ai-automation-audit']", en: "AI Audit", de: "AI-Audit" },
        { selector: ".site-footer a[href='#work']", en: "Proof", de: "Nachweise" },
        { selector: ".site-footer a[href='ai-language-check.html']", en: "Language check", de: "Sprachcheck" },
        { selector: ".site-footer a[href='#contact']", en: "Contact", de: "Kontakt" },
        { selector: ".site-footer a[href='privacy.html']", en: "Privacy", de: "Datenschutz" },
        { selector: ".site-footer a[href='sample-audit.html']", en: "Sample audit", de: "Beispiel-Audit" },
        { selector: ".site-footer a[href='llms.txt']", en: "Agent guide", de: "Agent Guide" }
    ];

    const pageMeta = {
        en: {
            title: "Antonios Chatzigiagkos - Safe AI automation for IT teams",
            description: "Antonios Chatzigiagkos helps IT and software teams use AI automation safely by reviewing data access, tool behavior, approvals and practical next steps."
        },
        de: {
            title: "Antonios Chatzigiagkos - Sichere KI-Automatisierung für IT-Teams",
            description: "Antonios Chatzigiagkos hilft IT- und Softwareteams, KI-Automatisierung sicher zu nutzen, mit Prüfung von Datenzugriff, Tool-Verhalten, Freigaben und praktischen nächsten Schritten."
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
            // The language switch still works for the current page view if storage is blocked.
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

        if (document.documentElement.lang === "de") {
            return "de";
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

    function updateAuditMail(language) {
        const links = document.querySelectorAll("[data-audit-mail]");
        if (!links.length) {
            return;
        }
        const mail = auditMail[language];
        links.forEach((link) => {
            link.href = `mailto:${mailbox}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;
        });
    }

    function applyLanguage(language, persist = true) {
        const safeLanguage = language === "de" ? "de" : "en";
        document.documentElement.lang = safeLanguage;

        const meta = pageMeta[safeLanguage];
        document.title = meta.title;
        const description = document.querySelector("meta[name='description']");
        if (description) {
            description.setAttribute("content", meta.description);
        }

        content.forEach((entry) => updateText(entry, safeLanguage));
        updateAuditMail(safeLanguage);

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

    window.ITExpertLanguage = {
        setLanguage: applyLanguage,
        detectInitialLanguage
    };
})();
