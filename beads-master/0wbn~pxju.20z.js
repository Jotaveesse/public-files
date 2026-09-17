(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  "object" == typeof document ? document.currentScript : void 0,

  // ---------------------------------------------------------------------
  // Module 18055 — basic color types
  // ---------------------------------------------------------------------
  18055,
  (module) => {
    "use strict";

    // Simple RGB color with CSS string helpers.
    class RGB {
      r;
      g;
      b;
      constructor(props) {
        if (props) Object.assign(this, props);
      }
      toCssString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
      }
      toCssRgbaString(alpha) {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
      }
    }

    // A named/identified color from a bead palette (e.g. Perler/Hama bead color).
    // Extends RGB so it can be used anywhere a plain RGB value is expected.
    class BeadColor extends RGB {
      id;
      name;
      hex;
      type;
      brand;
      sourcePaletteId;
      sourceColorId;
      constructor(props) {
        super();
        if (props) Object.assign(this, props);
      }

      // Perceived-brightness test using the classic 299/587/114 luma weights.
      get isDark() {
        return (
          (299 * (this.r ?? 0) + 587 * (this.g ?? 0) + 114 * (this.b ?? 0)) /
            1000 <
          128
        );
      }

      // Pick black or white text so it stays readable on top of this color.
      get contrastTextColor() {
        return this.isDark ? "#FFFFFF" : "#000000";
      }
    }

    module.s(["BeadColor", 0, BeadColor, "RGB", 0, RGB]);
  },

  // ---------------------------------------------------------------------
  // Module 75753 — color-space math (sRGB -> Lab, CIEDE2000 distance)
  // ---------------------------------------------------------------------
  75753,
  (module) => {
    "use strict";

    module.s([
      "deltaE2000",
      0,
      // Perceptual color difference between two Lab colors (CIEDE2000).
      // `weights` lets callers de-emphasize lightness/chroma/hue if desired.
      function deltaE2000(labA, labB, weights = { kL: 1, kC: 1, kH: 1 }) {
        const toRadians = (deg) => (deg * Math.PI) / 180;
        const toDegrees = (rad) => (180 * rad) / Math.PI;

        const L1 = labA.l,
          a1 = labA.a,
          b1 = labA.b;
        const L2 = labB.l,
          a2 = labB.a,
          b2 = labB.b;

        const avgL = (L1 + L2) / 2;

        const C1 = Math.sqrt(a1 * a1 + b1 * b1);
        const C2 = Math.sqrt(a2 * a2 + b2 * b2);
        const avgC = (C1 + C2) / 2;

        // G factor adjusts 'a' to compensate for chroma non-uniformity.
        const G =
          0.5 *
          (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + 6103515625)));

        const a1p = a1 * (1 + G);
        const a2p = a2 * (1 + G);

        const C1p = Math.sqrt(a1p * a1p + b1 * b1);
        const C2p = Math.sqrt(a2p * a2p + b2 * b2);
        const avgCp = (C1p + C2p) / 2;

        const h1p =
          1e-7 > Math.abs(b1) && 1e-7 > Math.abs(a1p)
            ? 0
            : toDegrees(Math.atan2(b1, a1p)) % 360;
        const h2p =
          1e-7 > Math.abs(b2) && 1e-7 > Math.abs(a2p)
            ? 0
            : toDegrees(Math.atan2(b2, a2p)) % 360;

        const h1pPos = h1p < 0 ? h1p + 360 : h1p;
        const h2pPos = h2p < 0 ? h2p + 360 : h2p;

        const deltaCp = C2p - C1p;

        let deltahp = 0;
        if (C1p * C2p !== 0) {
          deltahp =
            180 >= Math.abs(h2pPos - h1pPos)
              ? h2pPos - h1pPos
              : h2pPos > h1pPos
              ? h2pPos - h1pPos - 360
              : h2pPos - h1pPos + 360;
        }

        const deltaHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(toRadians(deltahp) / 2);

        const avgHp =
          Math.abs(h1pPos - h2pPos) > 180
            ? (h1pPos + h2pPos + 360) / 2
            : (h1pPos + h2pPos) / 2;

        // Weighting function T, used to scale the hue term.
        const T =
          1 -
          0.17 * Math.cos(toRadians(avgHp - 30)) +
          0.24 * Math.cos(toRadians(2 * avgHp)) +
          0.32 * Math.cos(toRadians(3 * avgHp + 6)) -
          0.2 * Math.cos(toRadians(4 * avgHp - 63));

        const SC = 1 + 0.045 * avgCp; // chroma scaling factor
        const SH = 1 + 0.015 * avgCp * T; // hue scaling factor

        // Per-channel weights (higher = that channel matters less).
        const { kL, kC, kH } = weights;

        // Rotation term, corrects for interaction between chroma and hue
        // differences in the blue region.
        const RT =
          -2 *
          Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + 6103515625)) *
          Math.sin(toRadians(60 * Math.exp(-Math.pow((avgHp - 275) / 25, 2))));

        const lightnessTerm =
          (L2 - L1) /
          (kL *
            (1 +
              (0.015 * Math.pow(avgL - 50, 2)) /
                Math.sqrt(20 + Math.pow(avgL - 50, 2))));
        const chromaTerm = deltaCp / (kC * SC);
        const hueTerm = deltaHp / (kH * SH);

        return Math.sqrt(
          Math.pow(lightnessTerm, 2) +
            Math.pow(chromaTerm, 2) +
            Math.pow(hueTerm, 2) +
            chromaTerm * RT * hueTerm
        );
      },

      "rgbToLab",
      0,
      // Convert an 8-bit sRGB color to CIE L*a*b* (D65 white point).
      function rgbToLab(rgb) {
        let { r, g, b } = rgb;
        r /= 255;
        g /= 255;
        b /= 255;

        // sRGB -> linear RGB (gamma expansion).
        const rLin = (r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92) * 100;
        const gLin = (g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92) * 100;
        const bLin = (b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92) * 100;

        // Linear RGB -> XYZ (sRGB/D65 matrix).
        const X = 0.4124 * rLin + 0.3576 * gLin + 0.1805 * bLin;
        const Y = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
        const Z = 0.0193 * rLin + 0.1192 * gLin + 0.9505 * bLin;

        // XYZ -> Lab, normalized against the D65 reference white
        // (95.047, 100, 108.883).
        const fy =
          Y / 100 > 0.008856 ? Math.pow(Y / 100, 1 / 3) : (Y / 100) * 7.787 + 16 / 116;
        const fx =
          X / 95.047 > 0.008856
            ? Math.pow(X / 95.047, 1 / 3)
            : (X / 95.047) * 7.787 + 16 / 116;
        const fz =
          Z / 108.883 > 0.008856
            ? Math.pow(Z / 108.883, 1 / 3)
            : (Z / 108.883) * 7.787 + 16 / 116;

        return {
          l: 116 * fy - 16,
          a: 500 * (fx - fy),
          b: 200 * (fy - fz),
        };
      },
    ]);
  },

  // ---------------------------------------------------------------------
  // Module 73197 — image -> palette pixel processor (quantize + dither)
  // ---------------------------------------------------------------------
  73197,
  (module) => {
    "use strict";
    const colorTypes = module.i(18055);
    const colorMath = module.i(75753);

    module.s([
      "PixelProcessor",
      0,
      class PixelProcessor {
        // Find the closest palette color to `lab` using CIEDE2000 distance.
        // Palette entries are expected to already carry a precomputed `.lab`.
        // Bails out early once a near-perfect match (diff < 0.2) is found.
        static findBestMatch(lab, paletteWithLab, colorWeights) {
          let bestDiff = Infinity;
          let bestColor = paletteWithLab[0];
          for (const candidate of paletteWithLab) {
            const diff = colorMath.deltaE2000(lab, candidate.lab, colorWeights);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestColor = candidate;
              if (diff < 0.2) break;
            }
          }
          return { bestColor, diff: bestDiff };
        }

        // Downsample `sourceImage` to a `targetWidth` x `targetHeight` grid of
        // palette colors.
        //
        // sourceImage:      { data, width, height } — RGBA pixel buffer
        // targetWidth/Height: size of the output pixel grid
        // palette:           array of colors to quantize to (e.g. BeadColor[])
        // useDithering:      apply Floyd–Steinberg error diffusion
        // denoiseThreshold:  if > 0, snap noisy colors to one of the top-5
        //                    dominant colors in the image before matching
        // sampleMode:        "nearest" (pick center pixel) or "average"
        //                    (average every source pixel in the cell)
        // colorWeights:      passed through to deltaE2000
        static process(
          sourceImage,
          targetWidth,
          targetHeight,
          palette,
          useDithering = false,
          denoiseThreshold = 0,
          sampleMode = "nearest",
          colorWeights = { kL: 1, kC: 1, kH: 1 }
        ) {
          const { data, width: sourceWidth, height: sourceHeight } = sourceImage;

          const rows = Array(targetHeight);
          const colorStats = new Map(); // palette color id -> pixel count

          // Precompute Lab values for every palette color once.
          const paletteWithLab = palette.map((color) => ({
            ...color,
            lab: colorMath.rgbToLab({ r: color.r, g: color.g, b: color.b }),
          }));

          const scaleX = sourceWidth / targetWidth;
          const scaleY = sourceHeight / targetHeight;

          // Floyd–Steinberg error-diffusion buffer (3 floats per target pixel).
          const errorBuffer = useDithering
            ? new Float32Array(targetWidth * targetHeight * 3).fill(0)
            : null;

          // Up to 5 dominant colors (as Lab), used for denoising.
          const dominantColors = [];

          if (denoiseThreshold > 0) {
            // Sample every other pixel (coarse pass) and count quantized
            // colors (5 bits per channel) to find the most common ones.
            const freq = new Map();
            for (let ty = 0; ty < targetHeight; ty += 2) {
              for (let tx = 0; tx < targetWidth; tx += 2) {
                const srcIndex =
                  (Math.floor(ty * scaleY + scaleY / 2) * sourceWidth +
                    Math.floor(tx * scaleX + scaleX / 2)) *
                  4;
                if (data[srcIndex + 3] < 128) continue; // skip transparent
                const key = `${data[srcIndex] >> 3},${data[srcIndex + 1] >> 3},${
                  data[srcIndex + 2] >> 3
                }`;
                freq.set(key, (freq.get(key) || 0) + 1);
              }
            }
            for (const [key] of Array.from(freq.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)) {
              const [r, g, b] = key.split(",").map((v) => parseInt(v) << 3);
              dominantColors.push(colorMath.rgbToLab({ r, g, b }));
            }
          }

          const matchCache = new Map(); // packed RGB int -> matched palette color
          const sampleOffsetX = 0.5 * scaleX;
          const sampleOffsetY = 0.5 * scaleY;

          for (let ty = 0; ty < targetHeight; ty++) {
            const row = Array(targetWidth);
            const nearestSourceRowStart = ((ty * scaleY + sampleOffsetY) | 0) * sourceWidth;
            const errorRowOffset = errorBuffer ? ty * targetWidth * 3 : 0;

            for (let tx = 0; tx < targetWidth; tx++) {
              let sampledR = 0,
                sampledG = 0,
                sampledB = 0,
                sampledA = 0;

              if (sampleMode === "average") {
                // Average every source pixel that falls inside this cell.
                let sumR = 0,
                  sumG = 0,
                  sumB = 0,
                  sumA = 0,
                  count = 0;
                const xStart = (tx * scaleX) | 0;
                const xEnd = Math.min(sourceWidth, ((tx + 1) * scaleX) | 0);
                const yStart = (ty * scaleY) | 0;
                const yEnd = Math.min(sourceHeight, ((ty + 1) * scaleY) | 0);

                for (let sy = yStart; sy < yEnd; sy++) {
                  const rowStart = sy * sourceWidth;
                  for (let sx = xStart; sx < xEnd; sx++) {
                    const idx = (rowStart + sx) << 2;
                    sumR += data[idx];
                    sumG += data[idx + 1];
                    sumB += data[idx + 2];
                    sumA += data[idx + 3];
                    count++;
                  }
                }

                sampledR = count > 0 ? (sumR / count) | 0 : 0;
                sampledG = count > 0 ? (sumG / count) | 0 : 0;
                sampledB = count > 0 ? (sumB / count) | 0 : 0;
                sampledA = count > 0 ? (sumA / count) | 0 : 0;
              } else {
                // Nearest-pixel sampling: take the pixel closest to the
                // center of this cell.
                const idx = (nearestSourceRowStart + ((tx * scaleX + sampleOffsetX) | 0)) << 2;
                sampledR = data[idx];
                sampledG = data[idx + 1];
                sampledB = data[idx + 2];
                sampledA = data[idx + 3];
              }

              if (sampledA < 128) {
                // Treat mostly-transparent pixels as empty.
                row[tx] = null;
                continue;
              }

              // Adjusted color = sampled color plus any diffused error,
              // clamped back into the valid 0-255 range.
              let adjR = sampledR;
              let adjG = sampledG;
              let adjB = sampledB;

              if (errorBuffer) {
                const errIdx = errorRowOffset + 3 * tx;
                sampledR += errorBuffer[errIdx];
                sampledG += errorBuffer[errIdx + 1];
                sampledB += errorBuffer[errIdx + 2];
                adjR = Math.max(0, Math.min(255, Math.round(sampledR)));
                adjG = Math.max(0, Math.min(255, Math.round(sampledG)));
                adjB = Math.max(0, Math.min(255, Math.round(sampledB)));
              }

              const cacheKey = (adjR << 16) | (adjG << 8) | adjB;
              let matched = matchCache.get(cacheKey);

              if (!matched) {
                const rgb = new colorTypes.RGB({ r: adjR, g: adjG, b: adjB });
                let lab = colorMath.rgbToLab(rgb);

                // If denoising, snap to the first dominant color close
                // enough to this pixel's Lab value.
                if (denoiseThreshold > 0 && dominantColors.length > 0) {
                  for (const dominantLab of dominantColors) {
                    if (colorMath.deltaE2000(lab, dominantLab) < denoiseThreshold) {
                      lab = dominantLab;
                      break;
                    }
                  }
                }

                matched = PixelProcessor.findBestMatch(lab, paletteWithLab, colorWeights).bestColor;
                matchCache.set(cacheKey, matched);
              }

              row[tx] = matched;
              colorStats.set(matched.id, (colorStats.get(matched.id) || 0) + 1);

              if (errorBuffer) {
                // Floyd–Steinberg error diffusion: spread the quantization
                // error to the not-yet-processed neighboring pixels.
                const errR = adjR - matched.r;
                const errG = adjG - matched.g;
                const errB = adjB - matched.b;

                const diffuse = (nx, ny, weight) => {
                  if (nx >= 0 && nx < targetWidth && ny >= 0 && ny < targetHeight) {
                    const idx = (ny * targetWidth + nx) * 3;
                    errorBuffer[idx] += errR * weight;
                    errorBuffer[idx + 1] += errG * weight;
                    errorBuffer[idx + 2] += errB * weight;
                  }
                };

                diffuse(tx + 1, ty, 7 / 16);
                diffuse(tx - 1, ty + 1, 3 / 16);
                diffuse(tx, ty + 1, 5 / 16);
                diffuse(tx + 1, ty + 1, 1 / 16);
              }
            }

            rows[ty] = row;
          }

          return {
            pixels: rows,
            stats: colorStats,
          };
        }
      },
    ]);
  },

  // ---------------------------------------------------------------------
  // Module 24240 — web worker entry point
  // ---------------------------------------------------------------------
  24240,
  (module) => {
    "use strict";
    const { PixelProcessor } = module.i(73197);

    const workerScope = self;

    // A simple sequential filter pipeline. Currently no filters are
    // registered, so `run` is effectively a passthrough — but any filter
    // pushed onto `.filters` (each with an async `process(image, options)`
    // method) will be applied in order before pixel processing runs.
    const filterPipeline = new (class FilterPipeline {
      filters = [];
      async run(image, options) {
        let result = image;
        for (const filter of this.filters) {
          try {
            result = await filter.process(result, options);
          } catch (err) {
            console.error(`[FilterPipeline] filter "${filter.name}" failed:`, err);
          }
        }
        return result;
      }
    })();

    workerScope.onmessage = async (event) => {
      const {
        imageData,
        targetWidth,
        targetHeight,
        palette,
        useDithering,
        denoiseThreshold,
        options,
        requestId,
      } = event.data;

      try {
        const filteredImage = await filterPipeline.run(imageData, {
          ...options,
          requestId,
        });

        const { pixels, stats } = PixelProcessor.process(
          filteredImage,
          targetWidth,
          targetHeight,
          palette,
          useDithering,
          denoiseThreshold,
          options.sampleMode || "nearest",
          options.colorWeights
        );

        const statsArray = Array.from(stats.entries());

        workerScope.postMessage({
          success: true,
          pixels,
          statsArray,
          requestId,
        });
      } catch (err) {
        workerScope.postMessage({
          success: false,
          error: err.message || String(err),
          requestId,
        });
      }
    };

    module.s([], 24240);
  },
]);