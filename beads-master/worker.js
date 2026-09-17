(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  "object" == typeof document ? document.currentScript : void 0,
  18055,
  (t) => {
    "use strict";
    class e {
      r;
      g;
      b;
      constructor(t) {
        t && Object.assign(this, t);
      }
      toCssString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
      }
      toCssRgbaString(t) {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${t})`;
      }
    }
    t.s([
      "BeadColor",
      0,
      class extends e {
        id;
        name;
        hex;
        type;
        brand;
        sourcePaletteId;
        sourceColorId;
        constructor(t) {
          super(), t && Object.assign(this, t);
        }
        get isDark() {
          return (
            (299 * (this.r ?? 0) + 587 * (this.g ?? 0) + 114 * (this.b ?? 0)) /
              1000 <
            128
          );
        }
        get contrastTextColor() {
          return this.isDark ? "#FFFFFF" : "#000000";
        }
      },
      "RGB",
      0,
      e,
    ]);
  },
  75753,
  (t) => {
    "use strict";
    t.s([
      "deltaE2000",
      0,
      function (t, e, weights = { kL: 1, kC: 1, kH: 1 }) {
        let a = (t) => (t * Math.PI) / 180,
          r = (t) => (180 * t) / Math.PI,
          s = t.l,
          o = t.a,
          h = t.b,
          l = e.l,
          i = e.a,
          n = e.b,
          M = (s + l) / 2,
          c = (Math.sqrt(o * o + h * h) + Math.sqrt(i * i + n * n)) / 2,
          b =
            0.5 *
            (1 - Math.sqrt(Math.pow(c, 7) / (Math.pow(c, 7) + 6103515625))),
          f = o * (1 + b),
          p = i * (1 + b),
          u = Math.sqrt(f * f + h * h),
          g = Math.sqrt(p * p + n * n),
          w = (u + g) / 2,
          d =
            1e-7 > Math.abs(h) && 1e-7 > Math.abs(f)
              ? 0
              : r(Math.atan2(h, f)) % 360,
          m =
            1e-7 > Math.abs(n) && 1e-7 > Math.abs(p)
              ? 0
              : r(Math.atan2(n, p)) % 360,
          x = d < 0 ? d + 360 : d,
          y = m < 0 ? m + 360 : m,
          $ = g - u,
          P = 0;
        u * g != 0 &&
          (P =
            180 >= Math.abs(y - x) ? y - x : y > x ? y - x - 360 : y - x + 360);
        let q = 2 * Math.sqrt(u * g) * Math.sin(a(P) / 2),
          T = Math.abs(x - y) > 180 ? (x + y + 360) / 2 : (x + y) / 2,
          C =
            1 -
            0.17 * Math.cos(a(T - 30)) +
            0.24 * Math.cos(a(2 * T)) +
            0.32 * Math.cos(a(3 * T + 6)) -
            0.2 * Math.cos(a(4 * T - 63)),
          F = 1 + 0.045 * w,
          A = 1 + 0.015 * w * C;

        // 1. Add your custom weights here!
        // Higher number = matters LESS.
        // Setting Lightness and Chroma to 2 cuts their penalty in half, prioritizing Hue.
        let { kL, kC, kH } = weights;

        return Math.sqrt(
          // 2. Lightness term: Multiply the denominator by kL
          Math.pow(
            (l - s) /
              (kL *
                (1 +
                  (0.015 * Math.pow(M - 50, 2)) /
                    Math.sqrt(20 + Math.pow(M - 50, 2)))),
            2
          ) +
            // 3. Chroma term: Multiply F by kC
            Math.pow($ / (kC * F), 2) +
            // 4. Hue term: Multiply A by kH
            Math.pow(q / (kH * A), 2) +
            // 5. Rotation term: Make sure to update the denominators here as well!
            ($ / (kC * F)) *
              (-2 *
                Math.sqrt(Math.pow(w, 7) / (Math.pow(w, 7) + 6103515625)) *
                Math.sin(a(60 * Math.exp(-Math.pow((T - 275) / 25, 2))))) *
              (q / (kH * A))
        );
      },
      "rgbToLab",
      0,
      function (t) {
        var e, a, r;
        let s,
          { r: o, g: h, b: l } = t;
        (o /= 255), (h /= 255), (l /= 255);
        return (
          (e =
            0.4124 *
              (o =
                (o > 0.04045 ? Math.pow((o + 0.055) / 1.055, 2.4) : o / 12.92) *
                100) +
            0.3576 *
              (h =
                (h > 0.04045 ? Math.pow((h + 0.055) / 1.055, 2.4) : h / 12.92) *
                100) +
            0.1805 *
              (l =
                (l > 0.04045 ? Math.pow((l + 0.055) / 1.055, 2.4) : l / 12.92) *
                100)),
          (a = 0.2126 * o + 0.7152 * h + 0.0722 * l),
          (r = 0.0193 * o + 0.1192 * h + 0.9505 * l),
          {
            l:
              116 *
                (s =
                  a / 100 > 0.008856
                    ? Math.pow(a / 100, 1 / 3)
                    : (a / 100) * 7.787 + 16 / 116) -
              16,
            a:
              500 *
              ((e / 95.047 > 0.008856
                ? Math.pow(e / 95.047, 1 / 3)
                : (e / 95.047) * 7.787 + 16 / 116) -
                s),
            b:
              200 *
              (s -
                (r / 108.883 > 0.008856
                  ? Math.pow(r / 108.883, 1 / 3)
                  : (r / 108.883) * 7.787 + 16 / 116)),
          }
        );
      },
    ]);
  },
  73197,
  (t) => {
    "use strict";
    var e = t.i(18055),
      a = t.i(75753);
    t.s([
      "PixelProcessor",
      0,
      class {
        static findBestMatch(t, e, colorWeights) {
          let r = 1 / 0,
            s = e[0];
          for (let o of e) {
            let e = (0, a.deltaE2000)(t, o.lab, colorWeights);
            if (e < r && ((r = e), (s = o), e < 0.2)) break;
          }
          return {
            bestColor: s,
            diff: r,
          };
        }
        static process(
          t,
          r,
          s,
          o,
          h = !1,
          l = 0,
          i = "nearest",
          colorWeights = { kL: 1, kC: 1, kH: 1 }
        ) {
          let { data: n, width: M, height: c } = t,
            b = Array(s),
            f = new Map(),
            p = o.map((t) => ({
              ...t,
              lab: (0, a.rgbToLab)({
                r: t.r,
                g: t.g,
                b: t.b,
              }),
            })),
            u = M / r,
            g = c / s,
            w = h ? new Float32Array(r * s * 3).fill(0) : null,
            d = [];
          if (l > 0) {
            let t = new Map();
            for (let e = 0; e < s; e += 2)
              for (let a = 0; a < r; a += 2) {
                let r =
                  (Math.floor(e * g + g / 2) * M + Math.floor(a * u + u / 2)) *
                  4;
                if (n[r + 3] < 128) continue;
                let s = `${n[r] >> 3},${n[r + 1] >> 3},${n[r + 2] >> 3}`;
                t.set(s, (t.get(s) || 0) + 1);
              }
            for (let [e] of Array.from(t.entries())
              .sort((t, e) => e[1] - t[1])
              .slice(0, 5)) {
              let [t, r, s] = e.split(",").map((t) => parseInt(t) << 3);
              d.push(
                (0, a.rgbToLab)({
                  r: t,
                  g: r,
                  b: s,
                })
              );
            }
          }
          let m = new Map(),
            x = 0.5 * u,
            y = 0.5 * g;
          for (let t = 0; t < s; t++) {
            let o = Array(r),
              h = ((t * g + y) | 0) * M,
              $ = w ? t * r * 3 : 0;
            for (let b = 0; b < r; b++) {
              let y = 0,
                P = 0,
                q = 0,
                T = 0;
              if ("average" === i) {
                let e = 0,
                  a = 0,
                  r = 0,
                  s = 0,
                  o = 0,
                  h = (b * u) | 0,
                  l = Math.min(M, ((b + 1) * u) | 0),
                  i = (t * g) | 0,
                  f = Math.min(c, ((t + 1) * g) | 0);
                for (let t = i; t < f; t++) {
                  let i = t * M;
                  for (let t = h; t < l; t++) {
                    let h = (i + t) << 2;
                    (e += n[h]),
                      (a += n[h + 1]),
                      (r += n[h + 2]),
                      (s += n[h + 3]),
                      o++;
                  }
                }
                (y = o > 0 ? (e / o) | 0 : 0),
                  (P = o > 0 ? (a / o) | 0 : 0),
                  (q = o > 0 ? (r / o) | 0 : 0),
                  (T = o > 0 ? (s / o) | 0 : 0);
              } else {
                let t = (h + ((b * u + x) | 0)) << 2;
                (y = n[t]), (P = n[t + 1]), (q = n[t + 2]), (T = n[t + 3]);
              }
              if (T < 128) {
                o[b] = null;
                continue;
              }
              let C = y,
                F = P,
                A = q;
              if (w) {
                let t = $ + 3 * b;
                (y += w[t]),
                  (P += w[t + 1]),
                  (q += w[t + 2]),
                  (C = Math.max(0, Math.min(255, Math.round(y)))),
                  (F = Math.max(0, Math.min(255, Math.round(P)))),
                  (A = Math.max(0, Math.min(255, Math.round(q))));
              }
              let B = (C << 16) | (F << 8) | A,
                v = m.get(B);
              if (!v) {
                let t = new e.RGB({
                    r: C,
                    g: F,
                    b: A,
                  }),
                  r = (0, a.rgbToLab)(t);
                if (l > 0 && d.length > 0) {
                  for (let t of d)
                    if ((0, a.deltaE2000)(r, t) < l) {
                      r = t;
                      break;
                    }
                }
                (v = this.findBestMatch(r, p, colorWeights).bestColor),
                  m.set(B, v);
              }
              if (((o[b] = v), f.set(v.id, (f.get(v.id) || 0) + 1), w)) {
                let e = C - v.r,
                  a = F - v.g,
                  o = A - v.b,
                  h = (t, h, l) => {
                    if (t >= 0 && t < r && h >= 0 && h < s) {
                      let s = (h * r + t) * 3;
                      (w[s] += e * l), (w[s + 1] += a * l), (w[s + 2] += o * l);
                    }
                  };
                h(b + 1, t, 7 / 16),
                  h(b - 1, t + 1, 3 / 16),
                  h(b, t + 1, 5 / 16),
                  h(b + 1, t + 1, 1 / 16);
              }
            }
            b[t] = o;
          }
          return {
            pixels: b,
            stats: f,
          };
        }
      },
    ]);
  },
  24240,
  (t) => {
    "use strict";
    var e = t.i(73197);
    let a = self,
      r = new (class {
        filters = [];
        async run(t, e) {
          let a = t;
          for (let t of this.filters)
            try {
              a = await t.process(a, e);
            } catch (e) {
              console.error(`[FilterPipeline] 滤镜 ${t.name} 执行失败:`, e);
            }
          return a;
        }
      })();
    (a.onmessage = async (t) => {
      let {
        imageData: s,
        targetWidth: o,
        targetHeight: h,
        palette: l,
        useDithering: i,
        denoiseThreshold: n,
        options: M,
        requestId: c,
      } = t.data;
      try {
        let t = await r.run(s, {
            ...M,
            requestId: c,
          }),
          { pixels: b, stats: f } = e.PixelProcessor.process(
            t,
            o,
            h,
            l,
            i,
            n,
            M.sampleMode || "nearest",
            M.colorWeights
          ),
          p = Array.from(f.entries());
        a.postMessage({
          success: !0,
          pixels: b,
          statsArray: p,
          requestId: c,
        });
      } catch (t) {
        a.postMessage({
          success: !1,
          error: t.message || String(t),
          requestId: c,
        });
      }
    }),
      t.s([], 24240);
  },
]);
