// ==UserScript==
// @name         PixelBead Master Addons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @updateURL    https://raw.githubusercontent.com/Jotaveesse/public-files/refs/heads/main/beads-master/tamper-monkey.user.js
// @downloadURL  https://raw.githubusercontent.com/Jotaveesse/public-files/refs/heads/main/beads-master/tamper-monkey.user.js
// @match        https://pixel-bead.pixarmaster.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    // =================================================================
    // 1. Turbopack context capture
    // =================================================================
    const ctxs = [];
    window.__ctxs = ctxs;

    function patchChunk(chunk) {
        if (!Array.isArray(chunk)) return;
        for (let i = 0; i < chunk.length; i++) {
            const f = chunk[i];
            if (typeof f !== "function" || f.__w) continue;
            const wrapped = function (ctx) {
                if (
                    ctx &&
                    typeof ctx.r === "function" &&
                    ctxs.indexOf(ctx) === -1
                )
                    ctxs.push(ctx);
                return f.apply(this, arguments);
            };
            wrapped.__w = true;
            chunk[i] = wrapped;
        }
    }

    function hookTarget(t) {
        if (!t || (typeof t !== "object" && typeof t !== "function")) return;
        if (t.__hooked) return;
        try {
            Object.defineProperty(t, "__hooked", {
                value: true,
                enumerable: false,
            });
        } catch (e) {
            return;
        }

        if (typeof t.length === "number") {
            for (let i = 0; i < t.length; i++) patchChunk(t[i]);
        }

        let real = t.push;
        try {
            Object.defineProperty(t, "push", {
                configurable: true,
                enumerable: false,
                get() {
                    const fn = real;
                    return function (...chunks) {
                        chunks.forEach(patchChunk);
                        return typeof fn === "function"
                            ? fn.apply(this, chunks)
                            : undefined;
                    };
                },
                set(v) {
                    real = v;
                },
            });
        } catch (e) {
            console.warn("[pb] push hook failed", e);
        }
    }

    let _tp = globalThis.TURBOPACK;
    try {
        Object.defineProperty(globalThis, "TURBOPACK", {
            configurable: true,
            get: () => _tp,
            set(v) {
                _tp = v;
                try {
                    hookTarget(v);
                } catch (e) {
                    console.warn("[pb]", e);
                }
            },
        });
    } catch (e) {}
    if (_tp) hookTarget(_tp);

    window.mod = function (id) {
        for (const c of ctxs) {
            try {
                const m = c.r(id);
                if (m) return m;
            } catch (e) {}
        }
        return null;
    };

    Object.defineProperty(window, "beadStore", {
        configurable: true,
        get: () => window.mod(66962)?.useBeadStore || null,
    });

    console.log("[pb] hook installed");

    function waitForStore(cb) {
        const iv = setInterval(() => {
            if (window.beadStore) {
                clearInterval(iv);
                cb(window.beadStore);
            }
        }, 200);
    }

    // =================================================================
    // 2. colorWeights store helpers
    // =================================================================
    let cwTimer = null;

    function setColorWeight(store, key, value) {
        const s = store.getState();
        s.updateOptions({
            colorWeights: { ...(s.options.colorWeights || {}), [key]: value },
        });
        clearTimeout(cwTimer);
        cwTimer = setTimeout(() => store.getState().processImage(), 150);
    }

    function ensureDefaults(store) {
        const s = store.getState();
        if (!s.options.colorWeights) {
            store.setState({
                options: {
                    ...s.options,
                    colorWeights: { kC: 1, kL: 1, kH: 1 },
                },
            });
        }
    }

    // Reciprocal mapping: the slider shows a "normal" number, the store
    // holds its inverse. 1/x is its own inverse, so one function covers
    // both directions.
    function invert(v) {
        return Math.round((1 / v) * 100) / 100;
    }

    // =================================================================
    // 3. Sliders panel
    // =================================================================
    function buildPanel(store, afterElement) {
        if (document.getElementById("pb-color-weights") || !afterElement)
            return;

        const sliders = [
            {
                key: "kC",
                label: "Saturation",
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-droplet" aria-hidden="true"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>`,
            },
            {
                key: "kL",
                label: "Brightness",
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`,
            },
            {
                key: "kH",
                label: "Hue",
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.26-.296-.436-.696-.436-1.125a1.64 1.64 0 0 1 1.648-1.688h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`,
            },
        ];

        const panel = document.createElement("div");
        panel.id = "pb-color-weights";
        panel.className = "Sidebar-module__WZVnLW__section";
        panel.innerHTML = `
            <div class="Sidebar-module__WZVnLW__sectionHeader">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
                <div class="Sidebar-module__WZVnLW__titleRow"><h3>HSB Weights</h3></div>
            </div>
            <div class="Sidebar-module__WZVnLW__expandContent">
                ${sliders
                    .map(
                        (s) => `
                    <div class="Sidebar-module__WZVnLW__controlGroup">
                        <div>
                            ${s.icon}
                            <label>${s.label}</label>
                        </div>
                        <div class="Sidebar-module__WZVnLW__inputWrapper">
                            <input min="0.5" max="2" step="0.1" class="Sidebar-module__WZVnLW__rangeInput"
                                   type="range" value="1" data-ch="${s.key}">
                            <span>1.0</span>
                        </div>
                    </div>
                `,
                    )
                    .join("")}
            </div>
        `;

        afterElement.after(panel);

        const cw = store.getState().options.colorWeights || {
            kC: 1,
            kL: 1,
            kH: 1,
        };
        panel.querySelectorAll("input[type=range]").forEach((input) => {
            const ch = input.dataset.ch;
            const span = input.nextElementSibling;

            if (cw[ch] !== undefined) {
                const displayVal = invert(cw[ch]);
                input.value = displayVal;
                if (span) span.textContent = displayVal.toFixed(1);
            }

            input.addEventListener("input", (e) => {
                const displayVal = parseFloat(e.target.value);
                if (span) span.textContent = displayVal.toFixed(1);
                setColorWeight(store, ch, invert(displayVal));
            });
        });

        // keep panel in sync if options change elsewhere (e.g. loading a drawing)
        store.subscribe((state) => {
            const cw = state.options.colorWeights;
            if (!cw) return;
            panel.querySelectorAll("input[type=range]").forEach((input) => {
                const stored = cw[input.dataset.ch];
                if (stored === undefined) return;
                const displayVal = invert(stored);
                const span = input.nextElementSibling;
                if (parseFloat(input.value) !== displayVal) {
                    input.value = displayVal;
                    if (span) span.textContent = displayVal.toFixed(1);
                }
            });
        });
    }

    // =================================================================
    // 4. Auto-crop button
    // =================================================================
    function buildAutoCropButton(store, afterElement) {
        if (document.getElementById("pb-autocrop-section") || !afterElement)
            return;

        const section = document.createElement("div");
        section.id = "pb-autocrop-section";
        section.className = "Sidebar-module__WZVnLW__section";
        section.innerHTML = `
            <div class="Sidebar-module__WZVnLW__expandContent">
                <div style="display: flex; gap: 8px;">
                    <button id="pb-autocrop-btn" class="Sidebar-module__WZVnLW__addStickerBtn"
                            title="Detect pixel size and crop/resize automatically"
                            style="flex: 1 1 0%;">
                        <span>Detect Optimal Canvas Size</span>
                    </button>
                </div>
            </div>
        `;

        afterElement.after(section);

        const btn = section.querySelector("#pb-autocrop-btn");
        const label = btn.querySelector("span");
        const originalLabel = label.textContent;

        btn.addEventListener("click", async () => {
            btn.disabled = true;
            label.textContent = "Cropping…";
            try {
                await autoCropToPixelGrid(store);
            } catch (e) {
                console.error("[pb] auto-crop failed:", e);
            } finally {
                btn.disabled = false;
                label.textContent = originalLabel;
            }
        });
    }

    // =================================================================
    // 5. Pixel-grid detection
    // =================================================================
    const MIN_NATIVE_SCALE_SAMPLE = 5;

    /**
     * Detects the "art pixel" size (in source-image pixels) from a map of
     * {position: hitCount} transition points along one axis. Returns:
     *   - a float pixel size if a consistent grid is found
     *   - 1 if the image already appears to be at native resolution
     *     (enough transitions to be confident, all adjacent)
     *   - null if no reliable grid could be detected
     */
    function detectPixelSize(gapPos) {
        const positions = Object.keys(gapPos)
            .map(Number)
            .sort((a, b) => a - b);
        if (positions.length < 2) return null;

        const diffs = [];
        for (let i = 1; i < positions.length; i++) {
            diffs.push(positions[i] - positions[i - 1]);
        }

        // Ignore 1-2px gaps as noise when looking for the base scale —
        // but if EVERY gap is that small, that's evidence of a native-
        // resolution image, not lack of a grid. Guard with a minimum
        // sample size so a couple of coincidental adjacent transitions
        // (low-confidence, sparse data) aren't mistaken for a genuine
        // dense 1px grid.
        const validDiffs = diffs.filter((d) => d > 2);
        if (validDiffs.length === 0) {
            return diffs.length >= MIN_NATIVE_SCALE_SAMPLE ? 1 : null;
        }

        const minDiff = Math.min(...validDiffs);
        const baseCluster = validDiffs.filter((d) => d <= minDiff + 1.5);
        const roughBaseScale =
            baseCluster.reduce((sum, v) => sum + v, 0) / baseCluster.length;

        let totalGridSteps = 0;
        for (const d of diffs) {
            totalGridSteps += Math.round(d / roughBaseScale);
        }
        if (totalGridSteps === 0) return null; // avoid divide-by-zero below

        const totalDistance = positions[positions.length - 1] - positions[0];
        return totalDistance / totalGridSteps;
    }

    function scanTransitions(imageData, axis) {
        const { width, height, data } = imageData;
        const primaryLen = axis === "x" ? width : height;
        const secondaryLen = axis === "x" ? height : width;

        const gapCounts = {};
        const gapPositions = {};
        let totalTransitions = 0;

        for (let j = 0; j < secondaryLen; j++) {
            let prevR = null,
                prevG = null,
                prevB = null,
                prevA = null;
            let lastPos = 0;
            let transitionsInLine = 0;

            for (let i = 0; i < primaryLen; i++) {
                const idx =
                    axis === "x" ? (j * width + i) * 4 : (i * width + j) * 4;
                const r = data[idx],
                    g = data[idx + 1],
                    b = data[idx + 2],
                    a = data[idx + 3];

                if (r !== prevR || g !== prevG || b !== prevB || a !== prevA) {
                    transitionsInLine++;
                    totalTransitions++;

                    // Skip each line's first transition: its distance is
                    // measured from position 0 (arbitrary), not a real edge.
                    if (transitionsInLine >= 2) {
                        const gap = i - lastPos;
                        gapCounts[gap] = (gapCounts[gap] || 0) + 1;
                        gapPositions[i] = (gapPositions[i] || 0) + 1;
                    }

                    prevR = r;
                    prevG = g;
                    prevB = b;
                    prevA = a;
                    lastPos = i;
                }
            }
        }

        if (totalTransitions === 0) return null;
        return [gapPositions, gapCounts];
    }

    // =================================================================
    // 6. Cropping (with edge-clamp fill for expanded regions)
    // =================================================================
    async function cropOriginalImage(store, x, y, w, h) {
        const { imageData } = store.getState();
        if (!imageData) return null;

        w = Math.round(w);
        h = Math.round(h);
        if (w <= 0 || h <= 0) {
            console.warn("[pb] invalid crop size", w, h);
            return null;
        }

        const src = imageData;
        const out = new ImageData(w, h);
        const sData = src.data;
        const oData = out.data;

        for (let oy = 0; oy < h; oy++) {
            const sy = Math.min(src.height - 1, Math.max(0, oy + y));
            for (let ox = 0; ox < w; ox++) {
                const sx = Math.min(src.width - 1, Math.max(0, ox + x));

                const sIdx = (sy * src.width + sx) * 4;
                const oIdx = (oy * w + ox) * 4;

                oData[oIdx] = sData[sIdx];
                oData[oIdx + 1] = sData[sIdx + 1];
                oData[oIdx + 2] = sData[sIdx + 2];
                oData[oIdx + 3] = sData[sIdx + 3];
            }
        }

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = w;
        cropCanvas.height = h;
        const cropCtx = cropCanvas.getContext("2d");
        cropCtx.imageSmoothingEnabled = false;
        cropCtx.putImageData(out, 0, 0);

        const croppedDataUrl = cropCanvas.toDataURL("image/png");

        await store.getState().setImage(croppedDataUrl, out);
        return out;
    }

    // =================================================================
    // 7. Orchestration
    // =================================================================
    async function autoCropToPixelGrid(store) {
        const { imageData } = store.getState();
        if (!imageData) {
            console.warn("[pb] no image loaded");
            return;
        }

        const { width, height } = imageData;

        const horizontal = scanTransitions(imageData, "x");
        const vertical = scanTransitions(imageData, "y");
        if (!horizontal || !vertical) {
            console.warn("[pb] no color transitions found in image");
            return;
        }
        const [horizontalGapPos] = horizontal;
        const [verticalGapPos] = vertical;

        // NOTE: pixel size is only measured horizontally and reused for
        // both axes. Fine for square-cell pixel art; will misalign the
        // crop padding if the source has non-square cells.
        const pixelSize = detectPixelSize(horizontalGapPos);
        if (!pixelSize) {
            console.warn(
                "[pb] could not detect a pixel grid size for this image",
            );
            return;
        }

        const hPositions = Object.keys(horizontalGapPos)
            .map(Number)
            .sort((a, b) => a - b);
        const vPositions = Object.keys(verticalGapPos)
            .map(Number)
            .sort((a, b) => a - b);

        const pad = Math.floor(pixelSize);
        const cropX = hPositions[0] - pad;
        const cropY = vPositions[0] - pad;
        const cropW = hPositions[hPositions.length - 1] + pad - cropX;
        const cropH = vPositions[vPositions.length - 1] + pad - cropY;

        const cropped = await cropOriginalImage(
            store,
            cropX,
            cropY,
            cropW,
            cropH,
        );
        if (!cropped) return;

        // If setImage's internal optimizeImageDensity rescaled the result
        // (only happens on very large images), correct pixelSize
        // proportionally so the grid count stays right.
        const scale = cropped.width / cropW;
        const effectivePixelSize = pixelSize * scale;

        const gridWidth = Math.round(cropped.width / effectivePixelSize);
        const gridHeight = Math.round(cropped.height / effectivePixelSize);

        store
            .getState()
            .updateOptions({ width: gridWidth, height: gridHeight });

        console.log(
            "[pb] pixel size:",
            pixelSize,
            "| grid:",
            gridWidth,
            "x",
            gridHeight,
        );
        console.log(
            "[pb] crop offset:",
            cropX,
            cropY,
            "| original:",
            width,
            height,
            "| cropped:",
            cropped.width,
            cropped.height,
        );
    }

    // =================================================================
    // 8. Bootstrap
    // =================================================================
    waitForStore((store) => {
        ensureDefaults(store);

        const obs = new MutationObserver(() => {
            const section = document.querySelectorAll(
                ".Sidebar-module__WZVnLW__section",
            )[2];
            if (!section) return;

            const controlGroups = section.querySelectorAll(
                ".Sidebar-module__WZVnLW__controlGroup",
            );
            buildPanel(store, controlGroups[2]);
            buildAutoCropButton(store, controlGroups[0]);

            if (
                document.getElementById("pb-color-weights") &&
                document.getElementById("pb-autocrop-section")
            ) {
                obs.disconnect();
            }
        });

        obs.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
        obs.takeRecords(); // trigger an immediate check in case elements already exist
        obs.disconnect();
        const section = document.querySelectorAll(
            ".Sidebar-module__WZVnLW__section",
        )[2];
        if (section) {
            const controlGroups = section.querySelectorAll(
                ".Sidebar-module__WZVnLW__controlGroup",
            );
            buildPanel(store, controlGroups[2]);
            buildAutoCropButton(store, controlGroups[0]);
        } else {
            obs.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        }
    });
})();
