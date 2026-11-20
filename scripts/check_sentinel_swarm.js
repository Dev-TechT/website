#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const page = path.join(__dirname, "../labs/sentinel-swarm");
const read = (file) => fs.readFileSync(path.join(page, file), "utf8");
const source = "https://www.cisa.gov/known-exploited-vulnerabilities-catalog";
const firstEpss = "https://www.first.org/epss/";
const canonical = "https://it-expert.io/labs/sentinel-swarm/";
const sourceReleasedAt = "2026-11-18T19:17:41+00:00";
const entry = (index) => ({
    id: `CVE-2025-${1000 + index}`, added: "2025-01-02",
    vendor: index < 35 ? "Atlas" : "Meridian",
    product: index < 35 ? "Red Relay" : "Blue Relay", action: "Apply update.",
});
const snapshot = (entries = Array.from({ length: 65 }, (_, index) => entry(index))) => ({
    version: 2, source, sourceReleasedAt, catalogTotal: entries.length, entries,
});

// A small DOM stand-in keeps the checks offline and runs the actual page script.
class Element {
    constructor(document, tagName = "div") {
        this.document = document;
        this.tagName = tagName;
        this.attributes = new Map();
        this.style = {};
        this.children = [];
        this.listeners = new Map();
        this.value = "";
        this.text = "";
    }

    set innerHTML(_value) {
        assert.fail("The page must insert snapshot content as text");
    }

    get textContent() {
        return this.text + this.children.map((child) => child.textContent).join("");
    }

    set textContent(value) {
        this.text = String(value);
        this.children = [];
    }

    append(...children) {
        this.children.push(...children);
    }

    replaceChildren(...children) {
        this.text = "";
        this.children = children;
    }

    getAttribute(name) {
        return this.attributes.get(name) ?? null;
    }

    setAttribute(name, value) {
        this.attributes.set(name, value);
    }

    addEventListener(name, listener) {
        const listeners = this.listeners.get(name) ?? [];
        listeners.push(listener);
        this.listeners.set(name, listeners);
    }

    emit(name, properties = {}) {
        const event = { ...properties, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
        for (const listener of this.listeners.get(name) ?? []) {
            listener(event);
        }
        return event;
    }

    getBoundingClientRect() {
        return { left: 10, top: 20, width: 540, height: 270 };
    }

    setPointerCapture(id) {
        this.capturedPointer = id;
    }

    hasPointerCapture(id) {
        return this.capturedPointer === id;
    }

    releasePointerCapture(id) {
        assert.equal(this.capturedPointer, id);
        this.capturedPointer = undefined;
    }

    focus() {
        this.document.activeElement = this;
    }

    click() {
        this.emit("click");
    }
}

function start({ data = snapshot(), httpOK = true, fetchError, jsonError, mapWidth = 0, mapComplete = true } = {}) {
    const html = read("index.html");
    const elements = new Map();
    const document = { activeElement: null };
    for (const [, tagName, attributes, id] of html.matchAll(/<(\w+)\b([^>]*\bid="([\w-]+)"[^>]*)>/g)) {
        const element = new Element(document, tagName);
        element.disabled = /\sdisabled\b/.test(attributes);
        element.hidden = /\shidden\b/.test(attributes);
        if (tagName === "select") {
            const options = html.slice(html.indexOf(attributes) + attributes.length);
            element.value = options.match(/<option value="([^"]*)">/)?.[1] ?? "";
        }
        elements.set(id, element);
    }
    const element = (id) => {
        assert.ok(elements.has(id), `Missing #${id} in index.html`);
        return elements.get(id);
    };
    Object.assign(document, { getElementById: element, createElement: (tagName) => new Element(document, tagName) });
    Object.assign(element("world-map"), { complete: mapComplete, naturalWidth: mapWidth });
    const requests = [];
    const context = {
        AbortSignal,
        document,
        async fetch(url, options) {
            requests.push([url, options.mode, options.redirect]);
            if (fetchError) throw new Error("Network unavailable");
            return {
                ok: httpOK,
                async json() {
                    if (jsonError) throw new SyntaxError("Malformed JSON");
                    return data;
                },
            };
        },
    };
    const ready = vm.runInNewContext(read("sentinel.js"), context, { filename: "sentinel.js" });
    return { ready, element, requests, document };
}

test("static baseline has accessible controls, local resources and explicit map framing", () => {
    const html = read("index.html");
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>Sentinel Swarm/);
    assert.match(html, /name="viewport"/);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
    assert.doesNotMatch(html, /\b(?:preview|demo|noindex|nofollow)\b/i);
    assert.match(html, /Content-Security-Policy[^>]*connect-src 'self'/);
    assert.match(html, /name="referrer" content="no-referrer"/);
    assert.match(html, /href="#main-content"/);
    assert.match(html, /<main[^>]*id="main-content"/);
    assert.match(html, /<h1\b[^>]*>Sentinel\s+Swarm<\/h1>/);
    assert.match(html, /for="search"/);
    assert.match(html, /for="vendor"/);
    assert.match(html, /for="sort"/);
    assert.match(html, /id="search"[^>]*disabled/);
    assert.match(html, /id="vendor"[^>]*disabled/);
    assert.match(html, /id="sort"[^>]*disabled/);
    assert.match(html, /<option value="epss">EPSS \(highest first\)<\/option>/);
    assert.match(html, /role="status"/);
    assert.match(html, /<p id="startup-fallback">[^<]+<a href="https:\/\/www\.cisa\.gov\//);
    assert.match(html, /id="world-map"[^>]*src="\.\/assets\/world\.svg"[^>]*alt="[^"]+"/);
    for (const id of ["previous-page", "next-page"]) {
        assert.match(html, new RegExp(`<button id="${id}" type="button">[^<]+</button>`));
    }
    for (const [id, label] of Object.entries({
        "zoom-in": "Zoom in", "zoom-out": "Zoom out", reset: "Reset map",
        "pan-up": "Pan up", "pan-down": "Pan down", "pan-left": "Pan left", "pan-right": "Pan right",
    })) {
        assert.match(html, new RegExp(`<button id="map-${id}" type="button" aria-label="${label}"[^>]*><span aria-hidden="true">[^<]+</span></button>`));
    }
    assert.match(html, /<figcaption>Made with Natural Earth<\/figcaption>/);
    assert.match(html, /<span class="map-notice">No live observations<\/span>/);
    assert.match(html, /aria-labelledby="map-regions-label" hidden>/);
    assert.match(html, /id="map-regions-label">Geographic navigation<\/span>/);
    for (const name of ["Europe", "Americas", "Asia"]) {
        assert.ok(html.includes(`<button id="map-region-${name.toLowerCase()}" type="button" aria-pressed="false">${name}</button>`));
    }
    assert.ok(html.indexOf('id="world-map"') < html.indexOf('id="filters"'));
    assert.match(html, /<p class="hero-intro">Advisory explorer · No agent telemetry<\/p>/);
    assert.match(read("sentinel.css"), /touch-action:\s*pan-y/);
    assert.match(read("sentinel.css"), /prefers-reduced-motion:\s*no-preference/);
    assert.match(html, /<a href="\.\.\/\.\.\/impressum\.html">Legal notice<\/a>/);
    assert.match(html, /<a href="\.\.\/\.\.\/privacy\.html">Privacy<\/a>/);
    assert.match(html, /30-day exploitation probability/);
    assert.ok(html.includes(`<a href="${firstEpss}">EPSS by FIRST</a>`));
    assert.match(html, /href="\.\/sentinel\.css"/);
    assert.match(html, /<script src="\.\/sentinel\.js" defer><\/script>/);
    const externalTags = [...html.matchAll(/<(\w+)\b[^>]*\s(?:src|href)="((?:https?:)?\/\/[^" ]+)"[^>]*>/g)];
    assert.deepEqual([...new Set(externalTags.map(([, tag, url]) => `${tag} ${url}`))], [
        `link ${canonical}`, `a ${source}`, `a ${firstEpss}`,
    ]);
    assert.doesNotMatch(read("sentinel.css"), /@import|url\(/i);
});

test("the full snapshot loads with release, count, and latest additions first", async () => {
    const data = snapshot();
    const { ready, element, requests } = start({ data });
    assert.equal(element("search").disabled, true);
    await ready;
    assert.deepEqual(requests, [["./data/kev.json", "same-origin", "error"]]);
    assert.equal(element("snapshot-status").textContent, "Snapshot loaded");
    assert.equal(element("release-date").dateTime, data.sourceReleasedAt);
    assert.equal(element("release-date").textContent, new Intl.DateTimeFormat("en-US", {
        year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
    }).format(new Date(data.sourceReleasedAt)));
    assert.equal(element("catalog-total").textContent, data.catalogTotal.toLocaleString("en-US"));
    assert.equal(element("search").disabled, false);
    assert.equal(element("sort").disabled, false);
    assert.equal(element("results").children.length, 30);
    assert.match(element("results").children[0].textContent, /CVE-2025-1064/);
    assert.equal(element("results").children[0].children[2].children[1].textContent, "Unavailable");
    assert.equal(element("results-status").textContent, "Showing 1–30 of 65 advisories.");
    assert.equal(element("world-map").hidden, true);
    assert.equal(element("map-fallback").hidden, false);
    assert.equal(element("map-controls").hidden, true);
    assert.equal(element("map-regions").hidden, true);
    assert.equal(element("map-stage").tabIndex, -1);
});

test("EPSS preserves CISA dates and shows probabilities with their own UTC date", async () => {
    const entries = [{ ...entry(0), epss: 0 }, { ...entry(1), epss: 1 }, { ...entry(2), epss: 0.12345 }, entry(3)];
    const epssDate = "2026-11-20";
    const { ready, element } = start({ data: { ...snapshot(entries), epssDate } });
    await ready;
    const rows = element("results").children;
    assert.equal(element("release-date").dateTime, sourceReleasedAt);
    assert.equal(element("epss-date").children[0].dateTime, epssDate);
    assert.equal(element("epss-date").textContent, "Nov 20, 2026");
    assert.deepEqual(rows.map((row) => row.children[2].children[1].textContent), ["Unavailable", "12.345%", "100%", "0%"]);
    for (const row of rows.slice(1)) {
        assert.equal(row.children[2].children[2].dateTime, epssDate);
        assert.equal(row.children[0].children[1].children[0].dateTime, "2025-01-02");
    }
    const nvd = rows[0].children[1].children[2].children[2];
    assert.equal(nvd.tagName, "a");
    assert.equal(nvd.href, "https://nvd.nist.gov/vuln/detail/CVE-2025-1003");
    const cve = rows[0].children[0].children[0];
    assert.equal(cve.tagName, "a");
    assert.equal(cve.textContent, "CVE-2025-1003");
    assert.equal(cve.href, nvd.href);
});

test("EPSS date and scores may be omitted independently", async () => {
    const { ready, element } = start({ data: snapshot([{ ...entry(0), epss: 0.25 }]) });
    await ready;
    const probability = element("results").children[0].children[2];
    assert.deepEqual(probability.children.map((child) => child.textContent), ["EPSS probability", "25%", "Date unavailable"]);
    assert.equal(element("epss-date").children.length, 0);
});

test("EPSS ranks the entire filtered catalog with stable ties and missing scores last", async () => {
    const data = snapshot();
    Object.assign(data.entries[0], { epss: 0.725 });
    Object.assign(data.entries[20], { epss: 0.725, added: "2025-02-01" });
    Object.assign(data.entries[1], { epss: 0 });
    Object.assign(data.entries[40], { epss: 0.992 });
    const { ready, element, document } = start({ data });
    await ready;
    const sort = element("sort");
    const status = element("results-status");
    const ids = () => element("results").children.map((row) => row.children[0].children[0].textContent);
    element("next-page").emit("click");
    sort.focus();
    sort.value = "epss";
    sort.emit("change");
    assert.equal(status.textContent, "Showing 1–30 of 65 advisories.");
    assert.equal(document.activeElement, sort);
    assert.deepEqual(ids().slice(0, 5), [40, 20, 0, 1, 64].map((index) => data.entries[index].id));

    element("next-page-end").emit("click");
    assert.equal(status.textContent, "Showing 31–60 of 65 advisories.");
    assert.equal(document.activeElement, element("next-page"));
    const vendor = element("vendor");
    vendor.value = "Atlas";
    vendor.emit("change");
    assert.equal(status.textContent, "Showing 1–30 of 35 matching advisories.");
    assert.deepEqual(ids().slice(0, 4), [20, 0, 1, 34].map((index) => data.entries[index].id));

    const search = element("search");
    search.value = "red 1002";
    search.emit("input");
    assert.deepEqual(ids(), [data.entries[2].id]);
    element("clear-filters").emit("click");
    assert.equal(sort.value, "epss");
    sort.value = "date";
    sort.emit("change");
    assert.deepEqual(ids().slice(0, 2), [20, 64].map((index) => data.entries[index].id));
});

test("search combines case-insensitive terms with a vendor and can be cleared", async () => {
    const data = snapshot();
    const first = data.entries[0];
    const { ready, element, document } = start({ data });
    await ready;
    const search = element("search");
    const vendor = element("vendor");
    const results = element("results");
    const clear = element("clear-filters");
    assert.equal(vendor.children.filter((option) => option.value === first.vendor).length, 1);

    search.focus();
    search.value = `  ${first.id.toLowerCase()}   rED `;
    search.emit("input");
    assert.equal(results.children.length, 1);
    assert.equal(element("results-status").textContent, "Showing 1 of 1 matching advisory.");
    assert.equal(element("pagination").hidden, true);
    assert.equal(document.activeElement, search);

    vendor.focus();
    vendor.value = "Meridian";
    vendor.emit("change");
    assert.equal(results.children.length, 0);
    assert.match(element("results-status").textContent, /No advisories match/);
    assert.equal(document.activeElement, vendor);

    clear.emit("click");
    assert.equal(search.value, "");
    assert.equal(vendor.value, "");
    assert.equal(document.activeElement, search);
    assert.equal(element("results-status").textContent, "Showing 1–30 of 65 advisories.");

    vendor.value = "Atlas";
    vendor.emit("change");
    assert.equal(element("results-status").textContent, "Showing 1–30 of 35 matching advisories.");
    element("next-page").emit("click");
    assert.equal(results.children.length, 5);
    assert.match(results.children.at(-1).textContent, /CVE-2025-1000/);
    assert.equal(element("results-status").textContent, "Showing 31–35 of 35 matching advisories.");
});

test("pagination has no gaps, preserves focus at boundaries, and resets on filter changes", async () => {
    const { ready, element, document } = start();
    await ready;
    const previous = element("previous-page");
    const next = element("next-page");
    const status = element("results-status");
    const visibleIds = () => element("results").children.map((row) => row.children[0].children[0].textContent);
    assert.equal(element("pagination").hidden, false);
    assert.equal(previous.getAttribute("aria-disabled"), "true");
    assert.equal(next.getAttribute("aria-disabled"), "false");
    previous.emit("click");
    const firstPage = visibleIds();

    next.focus();
    next.emit("click");
    assert.equal(status.textContent, "Showing 31–60 of 65 advisories.");
    const secondPage = visibleIds();
    next.emit("click");
    assert.equal(status.textContent, "Showing 61–65 of 65 advisories.");
    assert.equal(next.getAttribute("aria-disabled"), "true");
    next.emit("click");
    assert.equal(document.activeElement, next);
    assert.deepEqual([...firstPage, ...secondPage, ...visibleIds()], snapshot().entries.reverse().map(({ id }) => id));

    previous.focus();
    previous.emit("click");
    assert.deepEqual(visibleIds(), secondPage);
    previous.emit("click");
    assert.deepEqual(visibleIds(), firstPage);
    assert.equal(document.activeElement, previous);
    next.emit("click");

    const search = element("search");
    search.focus();
    search.value = "red relay";
    search.emit("input");
    assert.equal(status.textContent, "Showing 1–30 of 35 matching advisories.");
    assert.equal(document.activeElement, search);
    next.emit("click");
    const vendor = element("vendor");
    vendor.value = "Atlas";
    vendor.emit("change");
    assert.equal(status.textContent, "Showing 1–30 of 35 matching advisories.");
    next.emit("click");
    element("clear-filters").emit("click");
    assert.deepEqual(visibleIds(), firstPage);
});

test("basemap controls load independently, clamp zoom and pan, and reset", async () => {
    const { ready, element, document } = start({ mapComplete: false, fetchError: true });
    await ready;
    const map = element("world-map");
    const controls = element("map-controls");
    const regions = element("map-regions");
    const zoomIn = element("map-zoom-in");
    const zoomOut = element("map-zoom-out");
    const reset = element("map-reset");
    const click = (name, count = 1) => {
        for (let index = 0; index < count; index += 1) element(`map-${name}`).emit("click");
    };
    assert.equal(controls.hidden, true);
    assert.equal(regions.hidden, true);
    map.naturalWidth = 540;
    map.emit("load");
    assert.equal(map.hidden, false);
    assert.equal(element("map-fallback").hidden, true);
    assert.equal(controls.hidden, false);
    assert.equal(regions.hidden, false);
    assert.equal(element("map-stage").tabIndex, 0);
    assert.equal(zoomOut.getAttribute("aria-disabled"), "true");
    const panButtons = ["up", "down", "left", "right"].map((direction) => element(`map-pan-${direction}`));
    assert.ok(panButtons.every((button) => button.hidden));
    click("pan-left");
    assert.equal(map.style.transform, "translate(0%, 0%) scale(1)");

    zoomIn.focus();
    click("zoom-in", 4);
    assert.equal(document.activeElement, zoomIn);
    assert.equal(zoomIn.getAttribute("aria-disabled"), "true");
    assert.equal(element("map-zoom-status").textContent, "4× zoom");
    assert.ok(panButtons.every((button) => !button.hidden && button.getAttribute("aria-disabled") === "false"));
    click("pan-up");
    click("pan-left");
    assert.equal(map.style.transform, "translate(20%, 20%) scale(4)");
    click("pan-right", 10);
    click("pan-down", 10);
    assert.equal(map.style.transform, "translate(-150%, -150%) scale(4)");
    assert.equal(element("map-pan-right").getAttribute("aria-disabled"), "true");
    assert.equal(element("map-pan-down").getAttribute("aria-disabled"), "true");
    click("zoom-out");
    assert.equal(map.style.transform, "translate(-100%, -100%) scale(3)");

    reset.focus();
    click("reset");
    assert.equal(document.activeElement, reset);
    assert.equal(map.style.transform, "translate(0%, 0%) scale(1)");
    assert.equal(element("map-zoom-status").textContent, "1× zoom");
    assert.equal(reset.getAttribute("aria-disabled"), "true");
    assert.ok(panButtons.every((button) => button.hidden));
    map.naturalWidth = 0;
    map.emit("error");
    assert.equal(map.hidden, true);
    assert.equal(element("map-fallback").hidden, false);
    assert.equal(controls.hidden, true);
    assert.equal(regions.hidden, true);
});

test("each region centers its projected coordinates from the world view and reset restores the 2:1 map", async () => {
    const { ready, element, document } = start({ mapWidth: 540 });
    await ready;
    const map = element("world-map");
    const reset = element("map-reset");
    const { width, height } = element("map-stage").getBoundingClientRect();
    assert.equal(width, 2 * height);
    assert.match(read("assets/world.svg"), /viewBox="0 0 540 270"/);
    // Projected centers in the asset's 540 × 270 coordinate space.
    const regions = [
        { button: element("map-region-europe"), point: [292.5, 60], zoom: 3 },
        { button: element("map-region-americas"), point: [142.5, 117], zoom: 2 },
        { button: element("map-region-asia"), point: [412.5, 82.5], zoom: 3 },
    ];

    function assertRegion(region) {
        const transform = map.style.transform.match(/^translate\(([-\d.]+)%, ([-\d.]+)%\) scale\((\d+)\)$/);
        assert.ok(transform, map.style.transform);
        const [x, y, scale] = transform.slice(1).map(Number);
        const [mapX, mapY] = region.point;
        assert.equal(scale, region.zoom);
        assert.ok(Math.abs((mapX - width / 2) * scale + x / 100 * width) < 1e-9, "Longitude is centered");
        assert.ok(Math.abs((mapY - height / 2) * scale + y / 100 * height) < 1e-9, "Latitude is centered");
        assert.equal(reset.getAttribute("aria-disabled"), "false");
        for (const choice of regions) {
            assert.equal(choice.button.getAttribute("aria-pressed"), String(choice === region));
        }
    }

    for (const region of regions) {
        assert.equal(map.style.transform, "translate(0%, 0%) scale(1)");
        region.button.focus();
        region.button.emit("click");
        assertRegion(region);
        assert.equal(document.activeElement, region.button);
        reset.emit("click");
        assert.equal(map.style.transform, "translate(0%, 0%) scale(1)");
        assert.equal(reset.getAttribute("aria-disabled"), "true");
        assert.ok(regions.every(({ button }) => button.getAttribute("aria-pressed") === "false"));
    }

    for (const region of regions) {
        region.button.emit("click");
        assertRegion(region);
    }
    element("map-pan-left").emit("click");
    assert.ok(regions.every(({ button }) => button.getAttribute("aria-pressed") === "false"));
});

test("focused keyboard controls, anchored double-click and captured drag share map bounds", async () => {
    const { ready, element, document } = start({ mapWidth: 540 });
    await ready;
    const stage = element("map-stage");
    const map = element("world-map");
    const key = (value, properties) => stage.emit("keydown", { key: value, ...properties }).defaultPrevented;
    const pointer = (type, clientX, clientY, pointerId = 7) =>
        stage.emit(type, { clientX, clientY, pointerId, isPrimary: true, button: 0 });
    assert.equal(key("+"), false);
    pointer("pointerdown", 280, 155);
    assert.equal(stage.capturedPointer, undefined);
    stage.focus();
    assert.equal(key("ArrowLeft"), false);
    assert.equal(key("+", { ctrlKey: true }), false);
    assert.equal(key("+"), true);
    assert.equal(key("ArrowRight"), true);
    assert.equal(map.style.transform, "translate(-20%, 0%) scale(2)");
    assert.equal(key("Home"), true);
    stage.emit("dblclick", { clientX: 415, clientY: 155 });
    assert.equal(map.style.transform, "translate(-25%, 0%) scale(2)");
    pointer("pointerdown", 280, 155);
    assert.equal(document.activeElement, stage);
    assert.equal(stage.capturedPointer, 7);
    assert.equal(stage.getAttribute("data-map-state"), "dragging");
    pointer("pointermove", 415, 290, 8);
    assert.equal(map.style.transform, "translate(-25%, 0%) scale(2)");
    pointer("pointermove", 415, 290);
    assert.equal(map.style.transform, "translate(0%, 50%) scale(2)");
    pointer("pointermove", 955, -250);
    assert.equal(map.style.transform, "translate(50%, -50%) scale(2)");
    pointer("pointermove", 901, -223);
    assert.equal(map.style.transform, "translate(40%, -40%) scale(2)");
    pointer("pointercancel", 901, -223);
    assert.equal(stage.capturedPointer, undefined);
    assert.equal(stage.getAttribute("data-map-state"), "zoomed");
    pointer("pointermove", 0, 0);
    assert.equal(map.style.transform, "translate(40%, -40%) scale(2)");
    assert.equal(key("−"), true);
    assert.equal(map.style.transform, "translate(0%, 0%) scale(1)");
    for (let i = 0; i < 5; i += 1) stage.emit("dblclick", { clientX: 280, clientY: 155 });
    assert.equal(element("map-zoom-status").textContent, "4× zoom");
    stage.emit("dblclick", { clientX: 280, clientY: 155, shiftKey: true });
    assert.equal(element("map-zoom-status").textContent, "3× zoom");
    assert.equal(key("0"), true);
    assert.equal(element("map-zoom-status").textContent, "1× zoom");
});

test("a valid empty snapshot has its own status and keeps the filters disabled", async () => {
    const { ready, element } = start({ data: snapshot([]) });
    await ready;
    assert.equal(element("snapshot-status").textContent, "Snapshot loaded");
    assert.match(element("results-status").textContent, /snapshot contains no advisories/);
    assert.equal(element("catalog-total").textContent, "0");
    assert.equal(element("search").disabled, true);
    assert.equal(element("results").children.length, 0);
});

test("bad responses and untrusted snapshot structure fail closed", async (t) => {
    const data = snapshot();
    const first = data.entries[0];
    const cases = {
        "network error": { fetchError: true },
        "HTTP failure": { httpOK: false },
        "invalid JSON": { jsonError: true },
        "missing snapshot object": { data: null },
        "unknown version": { data: { ...data, version: 3 } },
        "legacy excerpt": { data: { version: 1, source, sourceReleasedAt, catalogTotal: 65, recent: [first] } },
        "untrusted source": { data: { ...data, source: "https://example.invalid/catalog" } },
        "invalid release date": { data: { ...data, sourceReleasedAt: "2026-02-30T23:00:00Z" } },
        "release without timezone": { data: { ...data, sourceReleasedAt: "2026-11-18T23:00:00" } },
        "inconsistent total": { data: { ...data, catalogTotal: 0 } },
        "duplicate entry": { data: snapshot([first, first]) },
        "invalid entry date": { data: snapshot([{ ...first, added: "2026-10-32" }]) },
        "invalid EPSS date": { data: { ...data, epssDate: "2026-02-29" } },
        "EPSS date with a time": { data: { ...data, epssDate: "2026-11-20T00:00:00Z" } },
        "null EPSS date": { data: { ...data, epssDate: null } },
        "EPSS below range": { data: snapshot([{ ...first, epss: -0.001 }]) },
        "EPSS above range": { data: snapshot([{ ...first, epss: 1.001 }]) },
        "EPSS string": { data: snapshot([{ ...first, epss: "0.5" }]) },
        "non-finite EPSS": { data: snapshot([{ ...first, epss: Infinity }]) },
        "null EPSS": { data: snapshot([{ ...first, epss: null }]) },
        "entry after release": { data: snapshot([{ ...first, added: "2026-11-19" }]) },
        "invalid CVE identifier": { data: snapshot([{ ...first, id: "<strong>CVE</strong>" }]) },
        "CVE identifier with URL suffix": { data: snapshot([{ ...first, id: `${first.id}/../other` }]) },
        "invalid action field": { data: snapshot([{ ...first, action: {} }]) },
    };
    for (const [name, inputs] of Object.entries(cases)) {
        await t.test(name, async () => {
            const { ready, element } = start(inputs);
            await ready;
            assert.equal(element("snapshot-status").textContent, "Snapshot unavailable");
            assert.match(element("results-status").textContent, /could not be loaded or validated/);
            assert.equal(element("snapshot-metadata").hidden, true);
            assert.equal(element("startup-fallback").hidden, false);
            assert.equal(element("pagination").hidden, true);
            assert.equal(element("search").disabled, true);
            assert.equal(element("vendor").disabled, true);
            assert.equal(element("sort").disabled, true);
            assert.equal(element("results").children.length, 0);
        });
    }
});

test("markup-looking vendor, product, and action values stay literal", async () => {
    const vendor = "<strong>Vendor & Co.</strong>";
    const product = "<span>Product</span>";
    const action = '<em data-note="literal">Review & patch</em>';
    const { ready, element } = start({ data: snapshot([{ ...entry(0), vendor, product, action }]) });
    await ready;
    const card = element("results").children[0];
    assert.ok(card.textContent.includes(vendor));
    assert.ok(card.textContent.includes(product));
    assert.ok(card.textContent.includes(action));
    assert.ok(element("vendor").children.some((option) => option.textContent === vendor && option.value === vendor));
});
