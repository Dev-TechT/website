#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PORT = 9223;
const BASE = "http://127.0.0.1:8087";
const USER_DATA_DIR = "/tmp/it-expert-language-smoke-profile";
const CHROMIUM = process.env.CHROMIUM_PATH || "/snap/bin/chromium";

function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            let body = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => { body += chunk; });
            res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
        });
        req.on("error", reject);
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

function requestJson(url) {
    return request(url).then((response) => JSON.parse(response.body));
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDevTools() {
    for (let i = 0; i < 60; i += 1) {
        try {
            const version = await requestJson(`http://127.0.0.1:${PORT}/json/version`);
            if (version.webSocketDebuggerUrl) {
                return version;
            }
        } catch (_error) {
            // Keep polling until Chromium exposes the endpoint.
        }
        await sleep(250);
    }
    throw new Error("Chromium DevTools endpoint did not become ready");
}

function wsRequest(ws, method, params = {}) {
    const id = ws.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
        ws.pending.set(id, { resolve, reject });
        ws.socket.write(encodeFrame(payload));
    });
}

function encodeFrame(text) {
    const payload = Buffer.from(text);
    const length = payload.length;
    let header;
    if (length < 126) {
        header = Buffer.alloc(2);
        header[1] = 0x80 | length;
    } else if (length < 65536) {
        header = Buffer.alloc(4);
        header[1] = 0x80 | 126;
        header.writeUInt16BE(length, 2);
    } else {
        header = Buffer.alloc(10);
        header[1] = 0x80 | 127;
        header.writeBigUInt64BE(BigInt(length), 2);
    }
    header[0] = 0x81;

    const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]);
    const masked = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i += 1) {
        masked[i] = payload[i] ^ mask[i % 4];
    }
    return Buffer.concat([header, mask, masked]);
}

function decodeFrames(buffer) {
    const messages = [];
    let offset = 0;
    while (offset + 2 <= buffer.length) {
        const first = buffer[offset];
        const second = buffer[offset + 1];
        let length = second & 0x7f;
        let cursor = offset + 2;
        if (length === 126) {
            if (cursor + 2 > buffer.length) break;
            length = buffer.readUInt16BE(cursor);
            cursor += 2;
        } else if (length === 127) {
            if (cursor + 8 > buffer.length) break;
            length = Number(buffer.readBigUInt64BE(cursor));
            cursor += 8;
        }
        const masked = Boolean(second & 0x80);
        let mask;
        if (masked) {
            if (cursor + 4 > buffer.length) break;
            mask = buffer.slice(cursor, cursor + 4);
            cursor += 4;
        }
        if (cursor + length > buffer.length) break;
        const payload = Buffer.from(buffer.slice(cursor, cursor + length));
        if (masked && mask) {
            for (let i = 0; i < payload.length; i += 1) {
                payload[i] ^= mask[i % 4];
            }
        }
        const opcode = first & 0x0f;
        if (opcode === 1) {
            messages.push(payload.toString("utf8"));
        }
        offset = cursor + length;
    }
    return { messages, remaining: buffer.slice(offset) };
}

async function waitForPageTarget(urlPart = BASE) {
    for (let i = 0; i < 60; i += 1) {
        const targets = await requestJson(`http://127.0.0.1:${PORT}/json`);
        const page = targets.find((target) => (
            target.type === "page" &&
            target.webSocketDebuggerUrl &&
            typeof target.url === "string" &&
            target.url.startsWith(urlPart)
        ));
        if (page) {
            return page;
        }
        await sleep(250);
    }
    throw new Error("No debuggable site page target found");
}

async function connectWebSocket(wsUrl) {
    const net = require("net");
    const crypto = require("crypto");
    const parsed = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString("base64");
    const socket = net.createConnection(Number(parsed.port), parsed.hostname);
    await new Promise((resolve, reject) => {
        socket.once("connect", resolve);
        socket.once("error", reject);
    });
    socket.write([
        `GET ${parsed.pathname}${parsed.search} HTTP/1.1`,
        `Host: ${parsed.host}`,
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Key: ${key}`,
        "Sec-WebSocket-Version: 13",
        "",
        ""
    ].join("\r\n"));

    let handshake = Buffer.alloc(0);
    await new Promise((resolve, reject) => {
        const onData = (chunk) => {
            handshake = Buffer.concat([handshake, chunk]);
            const idx = handshake.indexOf("\r\n\r\n");
            if (idx !== -1) {
                socket.off("data", onData);
                const rest = handshake.slice(idx + 4);
                if (rest.length) socket.unshift(rest);
                resolve();
            }
        };
        socket.on("data", onData);
        socket.once("error", reject);
    });

    const ws = { socket, nextId: 1, pending: new Map(), buffer: Buffer.alloc(0), events: [] };
    socket.on("data", (chunk) => {
        ws.buffer = Buffer.concat([ws.buffer, chunk]);
        const decoded = decodeFrames(ws.buffer);
        ws.buffer = decoded.remaining;
        for (const message of decoded.messages) {
            const json = JSON.parse(message);
            if (json.id && ws.pending.has(json.id)) {
                const pending = ws.pending.get(json.id);
                ws.pending.delete(json.id);
                if (json.error) pending.reject(new Error(JSON.stringify(json.error)));
                else pending.resolve(json.result);
            } else {
                ws.events.push(json);
            }
        }
    });
    return ws;
}

async function run() {
    fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });

    const response = await request(`${BASE}/`);
    if (response.status !== 200 || !response.body.includes('data-language-option="de"')) {
        throw new Error(`Local site did not serve the language switcher at ${BASE}/`);
    }

    const pageTarget = await request(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(`${BASE}/`)}`, {
        method: "PUT"
    }).catch(() => null);

    const chromium = pageTarget ? null : spawn(CHROMIUM, [
        "--headless=new",
        "--no-sandbox",
        `--remote-debugging-port=${PORT}`,
        `--user-data-dir=${USER_DATA_DIR}`,
        "--window-size=390,844",
        `${BASE}/`
    ], { stdio: ["ignore", "pipe", "pipe"] });

    let stderr = "";
    if (chromium) {
        chromium.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    }

    try {
        await waitForDevTools();
        const page = await waitForPageTarget();
        const ws = await connectWebSocket(page.webSocketDebuggerUrl);
        await wsRequest(ws, "Runtime.enable");
        await wsRequest(ws, "Page.enable");
        await wsRequest(ws, "Page.navigate", { url: `${BASE}/` });
        await sleep(900);

        const result = await wsRequest(ws, "Runtime.evaluate", {
            returnByValue: true,
            awaitPromise: true,
            expression: `(async () => {
                await new Promise((resolve) => setTimeout(resolve, 350));
                const de = document.querySelector('[data-language-option="de"]');
                const en = document.querySelector('[data-language-option="en"]');
                if (!de || !en) {
                    throw new Error('Language switcher buttons not found');
                }
                de.click();
                const afterDe = {
                    lang: document.documentElement.lang,
                    heading: document.querySelector('#intro-statement h4').textContent,
                    nav: [...document.querySelectorAll('.main-navigation a')].map(a => a.textContent),
                    dePressed: de.getAttribute('aria-pressed'),
                    enPressed: en.getAttribute('aria-pressed'),
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth,
                    switcherTop: Math.round(document.querySelector('.language-switcher').getBoundingClientRect().top)
                };
                en.click();
                const afterEn = {
                    lang: document.documentElement.lang,
                    heading: document.querySelector('#intro-statement h4').textContent,
                    nav: [...document.querySelectorAll('.main-navigation a')].map(a => a.textContent),
                    dePressed: de.getAttribute('aria-pressed'),
                    enPressed: en.getAttribute('aria-pressed'),
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth
                };
                return { afterDe, afterEn };
            })()`
        });

        const value = result.result?.value;
        if (!value || !value.afterDe || !value.afterEn) {
            throw new Error(`Language smoke evaluation failed: ${JSON.stringify(result)}`);
        }
        const failures = [];
        if (value.afterDe.lang !== "de") failures.push("DE click did not set html lang=de");
        if (value.afterDe.heading !== "Ihr professioneller IT-Experte") failures.push("DE heading mismatch");
        if (!value.afterDe.nav.includes("Über mich")) failures.push("DE nav missing Über mich");
        if (value.afterDe.dePressed !== "true" || value.afterDe.enPressed !== "false") failures.push("DE aria-pressed state wrong");
        if (value.afterEn.lang !== "en") failures.push("EN click did not set html lang=en");
        if (value.afterEn.heading !== "Your Professional IT-Expert") failures.push("EN heading mismatch");
        if (!value.afterEn.nav.includes("About Me")) failures.push("EN nav missing About Me");
        if (value.afterEn.dePressed !== "false" || value.afterEn.enPressed !== "true") failures.push("EN aria-pressed state wrong");
        if (value.afterDe.scrollWidth > value.afterDe.clientWidth + 1) failures.push("horizontal overflow after DE switch");
        if (value.afterEn.scrollWidth > value.afterEn.clientWidth + 1) failures.push("horizontal overflow after EN switch");

        console.log(JSON.stringify(value, null, 2));
        if (failures.length) {
            throw new Error(failures.join("; "));
        }
        console.log("PASS: language switcher browser smoke passed");
        ws.socket.end();
    } finally {
        if (chromium) {
            chromium.kill("SIGTERM");
        }
        if (stderr.includes("ERROR")) {
            console.error(stderr.split("\n").filter(Boolean).slice(-5).join("\n"));
        }
    }
}

run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
});
