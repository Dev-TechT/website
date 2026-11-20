"use strict";

(async () => {
    const catalogSource = "https://www.cisa.gov/known-exploited-vulnerabilities-catalog";
    const byId = (id) => document.getElementById(id);
    const snapshotStatus = byId("snapshot-status");
    const resultsStatus = byId("results-status");
    const results = byId("results");
    const search = byId("search");
    const vendor = byId("vendor");
    const sort = byId("sort");
    const clear = byId("clear-filters");
    const pagination = byId("pagination");
    const paginationEnd = byId("pagination-end");
    const previousPage = byId("previous-page");
    const nextPage = byId("next-page");
    const previousPageEnd = byId("previous-page-end");
    const nextPageEnd = byId("next-page-end");
    const pageSize = 30;
    const dateFormat = new Intl.DateTimeFormat("en-US", {
        year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
    });
    const numberFormat = new Intl.NumberFormat("en-US");
    const probabilityFormat = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 3 });

    function isDate(value) {
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = new Date(`${value}T00:00:00Z`);
        return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }

    function isRelease(value) {
        return typeof value === "string"
            && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)
            && isDate(value.slice(0, 10))
            && Number.isFinite(Date.parse(value));
    }

    function isText(value, limit) {
        return typeof value === "string" && value.trim() !== "" && [...value].length <= limit;
    }

    function isSnapshot(data) {
        if (!data || data.version !== 2 || data.source !== catalogSource || !isRelease(data.sourceReleasedAt)
            || ("epssDate" in data && !isDate(data.epssDate))
            || !Array.isArray(data.entries) || data.catalogTotal !== data.entries.length) {
            return false;
        }

        const releaseDay = data.sourceReleasedAt.slice(0, 10);
        const ids = new Set();
        for (const entry of data.entries) {
            if (!entry || typeof entry.id !== "string" || !/^CVE-\d{4}-\d{4,}$/.test(entry.id) || ids.has(entry.id)
                || !isDate(entry.added) || entry.added > releaseDay
                || ("epss" in entry && (!Number.isFinite(entry.epss) || entry.epss < 0 || entry.epss > 1))
                || !isText(entry.vendor, 160) || !isText(entry.product, 1000) || !isText(entry.action, 2000)) {
                return false;
            }
            ids.add(entry.id);
        }
        return true;
    }

    function textElement(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;
        if (className) element.className = className;
        return element;
    }

    function dateElement(value) {
        const time = textElement("time", dateFormat.format(new Date(value)));
        time.dateTime = value;
        return time;
    }

    function renderEntry(entry, epssDate) {
        const item = document.createElement("li");
        const metadata = document.createElement("div");
        metadata.className = "entry-meta";
        const added = textElement("span", "Added ");
        added.append(dateElement(entry.added));
        const nvdUrl = `https://nvd.nist.gov/vuln/detail/${entry.id}`;
        const cve = textElement("a", entry.id, "cve");
        cve.href = nvdUrl;
        metadata.append(cve, added);

        const content = document.createElement("div");
        content.className = "entry-content";
        const action = document.createElement("details");
        const nvd = textElement("a", "View CVE record in NVD");
        nvd.href = nvdUrl;
        action.append(textElement("summary", "CISA required action"), textElement("p", entry.action), nvd);
        content.append(textElement("h3", entry.product), textElement("p", entry.vendor, "entry-vendor"), action);

        const probability = document.createElement("div");
        probability.className = "entry-epss";
        probability.append(textElement("span", "EPSS probability"));
        if (entry.epss === undefined) {
            probability.append(textElement("span", "Unavailable"));
        } else {
            const score = probabilityFormat.format(entry.epss);
            probability.append(textElement("span", score, "epss-score"),
                epssDate ? dateElement(epssDate) : textElement("span", "Date unavailable"));
        }
        item.append(metadata, content, probability);
        return item;
    }

    const map = byId("world-map");
    const mapStage = byId("map-stage");
    const mapFallback = byId("map-fallback");
    const mapControls = byId("map-controls");
    const mapRegions = byId("map-regions");
    const zoomStatus = byId("map-zoom-status");
    const maxZoom = 4;
    const panStep = 20;
    let zoom = 1;
    let x = 0;
    let y = 0;
    let drag = null;

    function bindControl(id, action) {
        const button = byId(id);
        button.addEventListener("click", () => {
            if (button.getAttribute("aria-disabled") !== "true") action();
        });
        return button;
    }

    function setMapView(nextZoom, nextX = x, nextY = y) {
        zoom = Math.max(1, Math.min(maxZoom, nextZoom));
        const edge = (zoom - 1) * 50;
        x = Math.max(-edge, Math.min(edge, nextX));
        y = Math.max(-edge, Math.min(edge, nextY));
        map.style.transform = `translate(${x}%, ${y}%) scale(${zoom})`;
        mapStage.setAttribute("data-map-state", drag ? "dragging" : zoom > 1 ? "zoomed" : "resting");
        const zoomText = `${zoom}× zoom`;
        if (zoomStatus.textContent !== zoomText) zoomStatus.textContent = zoomText;
        zoomIn.setAttribute("aria-disabled", String(zoom === maxZoom));
        zoomOut.setAttribute("aria-disabled", String(zoom === 1));
        panUp.setAttribute("aria-disabled", String(y === edge));
        panDown.setAttribute("aria-disabled", String(y === -edge));
        panLeft.setAttribute("aria-disabled", String(x === edge));
        panRight.setAttribute("aria-disabled", String(x === -edge));
        for (const button of panButtons) button.hidden = zoom === 1;
        resetMap.setAttribute("aria-disabled", String(zoom === 1));
        for (const region of regions) {
            region.button.setAttribute("aria-pressed", String(zoom === region.zoom && x === region.x && y === region.y));
        }
    }

    const zoomIn = bindControl("map-zoom-in", () => setMapView(zoom + 1));
    const zoomOut = bindControl("map-zoom-out", () => setMapView(zoom - 1));
    const panUp = bindControl("map-pan-up", () => setMapView(zoom, x, y + panStep));
    const panDown = bindControl("map-pan-down", () => setMapView(zoom, x, y - panStep));
    const panLeft = bindControl("map-pan-left", () => setMapView(zoom, x + panStep));
    const panRight = bindControl("map-pan-right", () => setMapView(zoom, x - panStep));
    const resetMap = bindControl("map-reset", () => setMapView(1, 0, 0));
    const panButtons = [panUp, panDown, panLeft, panRight];
    const regions = [
        { id: "europe", longitude: 15, latitude: 50, zoom: 3 },
        { id: "americas", longitude: -85, latitude: 12, zoom: 2 },
        { id: "asia", longitude: 95, latitude: 35, zoom: 3 },
    ].map(({ id, longitude, latitude, zoom }) => {
        // The plate carrée basemap spans 360° horizontally and 180° vertically.
        const x = -longitude / 360 * 100 * zoom;
        const y = latitude / 180 * 100 * zoom;
        const button = bindControl(`map-region-${id}`, () => setMapView(zoom, x, y));
        return { button, zoom, x, y };
    });

    const mapKeys = new Map([
        ["+", zoomIn], ["=", zoomIn], ["-", zoomOut], ["−", zoomOut],
        ["ArrowUp", panUp], ["ArrowDown", panDown], ["ArrowLeft", panLeft], ["ArrowRight", panRight],
        ["Home", resetMap], ["0", resetMap],
    ]);
    mapStage.addEventListener("keydown", (event) => {
        if (map.hidden || document.activeElement !== mapStage || event.altKey || event.ctrlKey || event.metaKey) return;
        const control = mapKeys.get(event.key);
        if (!control || control.getAttribute("aria-disabled") === "true") return;
        event.preventDefault();
        control.click();
    });

    mapStage.addEventListener("dblclick", (event) => {
        if (map.hidden) return;
        const nextZoom = zoom + (event.shiftKey ? -1 : 1);
        if (nextZoom < 1 || nextZoom > maxZoom) return;
        const { left, top, width, height } = mapStage.getBoundingClientRect();
        const anchorX = (event.clientX - left) / width * 100 - 50;
        const anchorY = (event.clientY - top) / height * 100 - 50;
        const scale = nextZoom / zoom;
        setMapView(nextZoom, anchorX + (x - anchorX) * scale, anchorY + (y - anchorY) * scale);
    });

    mapStage.addEventListener("pointerdown", (event) => {
        if (map.hidden || !event.isPrimary || event.button !== 0 || drag) return;
        if (event.pointerType !== "touch") mapStage.focus({ preventScroll: true });
        if (zoom === 1) return;
        mapStage.setPointerCapture(event.pointerId);
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
        mapStage.setAttribute("data-map-state", "dragging");
    });

    mapStage.addEventListener("pointermove", (event) => {
        if (drag?.id !== event.pointerId) return;
        const { width, height } = mapStage.getBoundingClientRect();
        const dx = (event.clientX - drag.x) / width * 100;
        const dy = (event.clientY - drag.y) / height * 100;
        drag.x = event.clientX;
        drag.y = event.clientY;
        setMapView(zoom, x + dx, y + dy);
    });

    function endDrag(event) {
        if (drag?.id !== event.pointerId) return;
        drag = null;
        mapStage.setAttribute("data-map-state", zoom > 1 ? "zoomed" : "resting");
        if (mapStage.hasPointerCapture(event.pointerId)) mapStage.releasePointerCapture(event.pointerId);
    }

    for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) {
        mapStage.addEventListener(event, endDrag);
    }

    const updateMap = () => {
        const hasMap = map.naturalWidth > 0;
        map.hidden = !hasMap;
        mapFallback.hidden = hasMap;
        mapControls.hidden = !hasMap;
        mapRegions.hidden = !hasMap;
        mapStage.tabIndex = hasMap ? 0 : -1;
        if (!hasMap && drag) endDrag({ pointerId: drag.id });
        if (hasMap) setMapView(zoom);
    };
    map.addEventListener("load", updateMap);
    map.addEventListener("error", updateMap);
    if (map.complete) updateMap();

    resultsStatus.textContent = "Loading the local CISA snapshot…";
    let data;
    try {
        const signal = AbortSignal.timeout(6000);
        const response = await fetch("./data/kev.json", { mode: "same-origin", redirect: "error", signal });
        if (!response.ok) throw new Error("Snapshot request failed");
        data = await response.json();
        if (!isSnapshot(data)) throw new Error("Snapshot validation failed");
    } catch {
        snapshotStatus.textContent = "Snapshot unavailable";
        resultsStatus.textContent = "The local snapshot could not be loaded or validated.";
        return;
    }
    byId("startup-fallback").hidden = true;

    const release = byId("release-date");
    release.dateTime = data.sourceReleasedAt;
    release.textContent = dateFormat.format(new Date(data.sourceReleasedAt));
    byId("catalog-total").textContent = numberFormat.format(data.catalogTotal);
    if (data.epssDate) byId("epss-date").replaceChildren(dateElement(data.epssDate));
    byId("snapshot-metadata").hidden = false;
    snapshotStatus.className = "visually-hidden";
    snapshotStatus.textContent = "Snapshot loaded";

    if (!data.entries.length) {
        resultsStatus.textContent = "This snapshot contains no advisories.";
        return;
    }

    const entries = [...data.entries].sort((a, b) => b.added.localeCompare(a.added, "en") || b.id.localeCompare(a.id, "en"));
    const epssEntries = [...entries].sort((a, b) => (b.epss ?? -1) - (a.epss ?? -1));
    const vendors = [...new Set(entries.map((entry) => entry.vendor))].sort((a, b) => a.localeCompare(b, "en"));
    for (const name of vendors) {
        const option = textElement("option", name);
        option.value = name;
        vendor.append(option);
    }

    let page = 0;
    let matching = entries;
    let filtersActive = false;

    function renderPage() {
        const start = page * pageSize;
        const end = Math.min(start + pageSize, matching.length);
        results.replaceChildren(...matching.slice(start, end).map((entry) => renderEntry(entry, data.epssDate)));
        pagination.hidden = matching.length <= pageSize;
        paginationEnd.hidden = pagination.hidden;
        for (const button of [previousPage, previousPageEnd]) button.setAttribute("aria-disabled", String(page === 0));
        for (const button of [nextPage, nextPageEnd]) button.setAttribute("aria-disabled", String(end === matching.length));
        if (!matching.length) {
            resultsStatus.textContent = "No advisories match these filters.";
            return;
        }
        const first = numberFormat.format(start + 1);
        const range = start + 1 === end ? first : `${first}–${numberFormat.format(end)}`;
        const count = numberFormat.format(matching.length);
        const noun = matching.length === 1 ? "advisory" : "advisories";
        resultsStatus.textContent = `Showing ${range} of ${count} ${filtersActive ? "matching " : ""}${noun}.`;
    }

    function filterResults() {
        const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        filtersActive = Boolean(terms.length || vendor.value);
        const ordered = sort.value === "epss" ? epssEntries : entries;
        matching = ordered.filter((entry) => {
            const searchable = [entry.id, entry.vendor, entry.product].join(" ").toLowerCase();
            return (!vendor.value || entry.vendor === vendor.value) && terms.every((term) => searchable.includes(term));
        });
        page = 0;
        renderPage();
    }

    function changePage(offset) {
        page += offset;
        renderPage();
    }

    bindControl("previous-page", () => changePage(-1));
    bindControl("next-page", () => changePage(1));
    bindControl("previous-page-end", () => {
        changePage(-1);
        previousPage.focus();
    });
    bindControl("next-page-end", () => {
        changePage(1);
        nextPage.focus();
    });
    byId("filters").addEventListener("submit", (event) => event.preventDefault());
    search.addEventListener("input", filterResults);
    vendor.addEventListener("change", filterResults);
    sort.addEventListener("change", filterResults);
    clear.addEventListener("click", () => {
        search.value = "";
        vendor.value = "";
        filterResults();
        search.focus();
    });
    search.disabled = false;
    vendor.disabled = false;
    sort.disabled = false;
    clear.disabled = false;
    renderPage();
})();
