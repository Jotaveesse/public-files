(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(
  ['object' == typeof document ? document.currentScript : void 0,
  95017,
  e => {
    'use strict';
    e.s(
      ['findStrayBeads',
      () => i,
      'fixInteriorTransparency',
      () => l,
      'idbStore',
      () => t]
    ),
    e.i(30932);
    let t = new class {
      dbName = 'pixel-bead-db';
      storeName = 'key-value-store';
      dbPromise = null;
      getDB() {
        return this.dbPromise ||
        (
          this.dbPromise = new Promise(
            (e, t) => {
              if ('u' < typeof indexedDB) return void t(Error('IndexedDB is not supported in this environment.'));
              let l = indexedDB.open(this.dbName, 1);
              l.onupgradeneeded = () => {
                let e = l.result;
                e.objectStoreNames.contains(this.storeName) ||
                e.createObjectStore(this.storeName)
              },
              l.onsuccess = () => e(l.result),
              l.onerror = () => t(l.error)
            }
          )
        ),
        this.dbPromise
      }
      async get(t) {
        try {
          let e = await this.getDB();
          return new Promise(
            (l, i) => {
              let r = e.transaction(this.storeName, 'readonly').objectStore(this.storeName).get(t);
              r.onsuccess = () => l(r.result || null),
              r.onerror = () => i(r.error)
            }
          )
        } catch (t) {
          console.warn('[IndexedDBStore] 读取失败，将使用降级策略:', t);
          {
            let l = t instanceof Error ? t.message : String(t);
            e.r(66962).useBeadStore.getState().showAlert({
              title: '数据库读取失败',
              content: '本地数据库读取失败！可能由于无痕模式或存储空间不足。这会导致您的历史设计无法自动恢复。',
              details: l,
              type: 'warning',
              showCancel: !1
            })
          }
          return null
        }
      }
      async set(t, l) {
        try {
          let e = await this.getDB();
          return new Promise(
            (i, r) => {
              let a = e.transaction(this.storeName, 'readwrite').objectStore(this.storeName).put(l, t);
              a.onsuccess = () => i(),
              a.onerror = () => r(a.error)
            }
          )
        } catch (t) {
          console.warn('[IndexedDBStore] 写入失败，将使用降级策略:', t);
          {
            let l = t instanceof Error ? t.message : String(t);
            e.r(66962).useBeadStore.getState().showAlert({
              title: '设计保存失败',
              content: '本地数据库写入失败！您的拼豆设计可能无法自动保存，请检查浏览器存储空间或退出隐私模式。',
              details: l,
              type: 'warning',
              showCancel: !1
            })
          }
          throw t
        }
      }
      async remove(e) {
        try {
          let t = await this.getDB();
          return new Promise(
            (l, i) => {
              let r = t.transaction(this.storeName, 'readwrite').objectStore(this.storeName).delete(e);
              r.onsuccess = () => l(),
              r.onerror = () => i(r.error)
            }
          )
        } catch (e) {
          throw console.warn('[IndexedDBStore] 删除失败，将使用降级策略:', e),
          e
        }
      }
    };
    function l(e, t) {
      let {
        data: l,
        width: i,
        height: r
      }
      = e,
      {
        data: a,
        width: s,
        height: o
      }
      = t,
      n = new Uint8ClampedArray(l),
      d = i * r,
      c = e => l[4 * e + 3] < 128,
      u = new Uint8Array(d),
      p = [],
      h = e => {
        e >= 0 &&
        e < d &&
        !u[e] &&
        c(e) &&
        (u[e] = 1, p.push(e))
      };
      for (let e = 0; e < i; e++) h(e),
      h((r - 1) * i + e);
      for (let e = 1; e < r - 1; e++) h(e * i),
      h(e * i + i - 1);
      let g = 0;
      for (; g < p.length; ) {
        let e = p[g++],
        t = Math.floor(e / i),
        l = e % i;
        t > 0 &&
        h(e - i),
        t < r - 1 &&
        h(e + i),
        l > 0 &&
        h(e - 1),
        l < i - 1 &&
        h(e + 1)
      }
      for (let e = 0; e < d; e++) if (c(e) && !u[e]) {
        let t = Math.floor(e / i),
        l = Math.floor(e % i / i * s),
        d = (Math.floor(t / r * o) * s + l) * 4,
        c = 4 * e;
        n[c] = a[d],
        n[c + 1] = a[d + 1],
        n[c + 2] = a[d + 2],
        n[c + 3] = a[d + 3]
      }
      return new ImageData(n, i, r)
    }
    function i(e) {
      let t = e.length;
      if (0 === t) return [];
      let l = e[0].length,
      i = new Uint8Array(t * l),
      r = [];
      for (let a = 0; a < t; a++) for (let s = 0; s < l; s++) {
        if (null === e[a][s]) continue;
        let o = a * l + s;
        if (i[o]) continue;
        let n = [],
        d = [
          [s,
          a]
        ];
        i[o] = 1;
        let c = 0;
        for (; c < d.length; ) {
          let[r,
          a] = d[c++];
          n.push({
            x: r,
            y: a
          });
          for (let s = - 1; s <= 1; s++) for (let o = - 1; o <= 1; o++) {
            if (0 === o && 0 === s) continue;
            let n = r + o,
            c = a + s;
            if (n >= 0 && n < l && c >= 0 && c < t && null !== e[c][n]) {
              let e = c * l + n;
              0 === i[e] &&
              (i[e] = 1, d.push([n,
              c]))
            }
          }
        }
        r.push(n)
      }
      if (r.length <= 1) return [];
      let a = 0,
      s = 0;
      for (let e = 0; e < r.length; e++) r[e].length > s &&
      (s = r[e].length, a = e);
      let o = [];
      for (let e = 0; e < r.length; e++) e !== a &&
      o.push(...r[e]);
      return o
    }
  },
  1872,
  72954,
  87344,
  e => {
    'use strict';
    var t = e.i(18055);
    class l {
      id;
      name;
      category;
      isCustom;
      createdAt;
      x = 0;
      y = 0;
      scale = 1;
      rotation = 0;
      opacity = 1;
      zIndex = 0;
      gridSnap = !1;
      constructor(e) {
        e &&
        Object.assign(this, e)
      }
      blendOntoGrid(e, t, l, i) {
        let r = this.rasterize(t, l, i);
        for (let t = 0; t < i; t++) for (let i = 0; i < l; i++) {
          let l = r[t]?.[i];
          l &&
          (e[t][i] = l)
        }
      }
    }
    var i = e.i(75753);
    class r extends l {
      text = '';
      color = '#FFFFFF';
      fontFamily = 'Inter';
      bold = !1;
      italic = !1;
      constructor(e) {
        super (e),
        e &&
        Object.assign(this, e)
      }
      type = 'text';
      draw(e, t, l) {
        e.save(),
        e.translate(this.x, this.y),
        e.rotate(this.rotation * Math.PI / 180),
        e.font = `${ this.italic ? 'italic' : '' } ${ this.bold ? 'bold' : '' } ${ 12 * this.scale }px ${ this.fontFamily }`,
        e.textAlign = 'center',
        e.textBaseline = 'middle',
        e.fillStyle = this.color,
        e.fillText(this.text, 0, 0),
        e.restore()
      }
      rasterize(e, l, r) {
        let a = Array.from({
          length: r
        }, () => Array(l).fill(null));
        if ('u' < typeof document) return a;
        let s = document.createElement('canvas');
        s.width = l,
        s.height = r;
        let o = s.getContext('2d');
        if (!o) return a;
        this.draw(o, l, r);
        let n = o.getImageData(0, 0, l, r).data,
        d = e.colors.map(e => ({
          color: e,
          lab: (0, i.rgbToLab) ({
            r: e.r,
            g: e.g,
            b: e.b
          })
        }));
        for (let s = 0; s < r; s++) for (let r = 0; r < l; r++) {
          let o = (s * l + r) * 4;
          if (n[o + 3] > 128) {
            let l = n[o],
            c = n[o + 1],
            u = n[o + 2],
            p = (0, i.rgbToLab) ({
              r: l,
              g: c,
              b: u
            }),
            h = 1 / 0,
            g = e.colors[0];
            for (let e of d) {
              let t = (0, i.deltaE2000) (p, e.lab);
              t < h &&
              (h = t, g = e.color)
            }
            a[s][r] = new t.BeadColor(g)
          }
        }
        return a
      }
    }
    e.s(['TextSticker',
    0,
    r], 72954);
    class a extends l {
      gridData = [];
      paletteId;
      assetId;
      constructor(e) {
        if (
          super (e),
          this.gridSnap = !0,
          e &&
          (Object.assign(this, e), e.gridData)
        ) if (Array.isArray(e.gridData)) this.gridData = e.gridData.map(
          e => Array.isArray(e) ? e.map(e => e ? e instanceof t.BeadColor ? e : new t.BeadColor(e) : null) : []
        );
         else if ('string' == typeof e.gridData) try {
          const l = JSON.parse(e.gridData);
          Array.isArray(l) ? this.gridData = l.map(
            e => Array.isArray(e) ? e.map(e => e ? e instanceof t.BeadColor ? e : new t.BeadColor(e) : null) : []
          ) : this.gridData = []
        } catch {
          this.gridData = []
        } else this.gridData = []
      }
      type = 'pixel_stamp';
      static trimGrid(e) {
        if (!e || 0 === e.length) return [];
        let t = e.length,
        l = - 1,
        i = e[0]?.length ||
        0,
        r = - 1;
        for (let a = 0; a < e.length; a++) {
          let s = e[a];
          if (s) for (let e = 0; e < s.length; e++) null !== s[e] &&
          void 0 !== s[e] &&
          (a < t && (t = a), a > l && (l = a), e < i && (i = e), e > r && (r = e))
        }
        if ( - 1 === l || - 1 === r) return [];
        let a = [];
        for (let s = t; s <= l; s++) {
          let t = [];
          for (let l = i; l <= r; l++) t.push(e[s]?.[l] ?? null);
          a.push(t)
        }
        return a
      }
      draw(e, t, l) {
        if (!this.gridData || 0 === this.gridData.length) return;
        e.save(),
        e.translate(this.x, this.y),
        e.rotate(this.rotation * Math.PI / 180);
        let i = this.gridData.length,
        r = this.gridData[0].length,
        a = this.scale,
        s = r / 2,
        o = i / 2;
        for (let t = 0; t < i; t++) for (let l = 0; l < r; l++) {
          let i = this.gridData[t][l];
          i &&
          (e.fillStyle = i.hex, e.fillRect((l - s) * a, (t - o) * a, a, a))
        }
        e.restore()
      }
      blendOntoGrid(e, l, r, a) {
        if (!this.gridData || 0 === this.gridData.length) return;
        let s = this.gridData.length,
        o = this.gridData[0]?.length ||
        0;
        if (0 === o) return;
        let n = this.scale ||
        1,
        d = (this.rotation % 360 + 360) % 360,
        c = e => {
          if (!l || !l.colors || 0 === l.colors.length) return e;
          if (e.id) {
            let i = l.colors.find(t => t.id === e.id);
            if (i) return new t.BeadColor(i)
          }
          if (e.hex) {
            let i = e.hex.toLowerCase(),
            r = l.colors.find(e => e.hex.toLowerCase() === i);
            if (r) return new t.BeadColor(r)
          }
          let r = (0, i.rgbToLab) ({
            r: e.r,
            g: e.g,
            b: e.b
          }),
          a = 1 / 0,
          s = l.colors[0];
          for (let e of l.colors) {
            let t = (0, i.rgbToLab) ({
              r: e.r,
              g: e.g,
              b: e.b
            }),
            l = (0, i.deltaE2000) (r, t);
            l < a &&
            (a = l, s = e)
          }
          return new t.BeadColor(s)
        };
        if (0.0001 > Math.abs(d)) {
          let t = o * n / 2,
          l = s * n / 2,
          i = Math.round(this.x - t),
          d = Math.round(this.y - l),
          u = Math.round(this.x + t),
          p = Math.round(this.y + l),
          h = Math.max(0, i),
          g = Math.min(r, u),
          f = Math.max(0, d),
          m = Math.min(a, p);
          for (let t = f; t < m; t++) {
            let l = Math.floor((t - d) / n);
            if (!(l < 0) && !(l >= s)) for (let r = h; r < g; r++) {
              let a = Math.floor((r - i) / n);
              if (a < 0 || a >= o) continue;
              let s = this.gridData[l][a];
              s &&
              (e[t][r] = c(s))
            }
          }
          return
        }
        let u = d * Math.PI / 180,
        p = Math.cos(u),
        h = Math.sin(u);
        for (let t = 0; t < a; t++) for (let l = 0; l < r; l++) {
          let i = l - this.x,
          r = t - this.y,
          a = Math.floor((i * p + r * h) / n + o / 2),
          d = Math.floor(( - i * h + r * p) / n + s / 2);
          if (a >= 0 && a < o && d >= 0 && d < s) {
            let i = this.gridData[d][a];
            i &&
            (e[t][l] = c(i))
          }
        }
      }
      rasterize(e, t, l) {
        let i = Array.from({
          length: l
        }, () => Array(t).fill(null));
        return this.blendOntoGrid(i, e, t, l),
        i
      }
    }
    e.s(['PixelStampSticker',
    0,
    a], 87344),
    e.s(
      ['Drawing',
      0,
      class {
        id;
        title;
        paletteId;
        width;
        height;
        pixelCount;
        gridData;
        stickers = [];
        options;
        createdBy;
        createdAt;
        isCloud;
        isDirty;
        lastUpdateDate;
        published;
        publishedDrawingId;
        publishState = 'UNPUBLISHED';
        rejectCode;
        rejectReason;
        likesCount;
        favoritesCount;
        constructor(e) {
          if (e) {
            if (Object.assign(this, e), e.gridData) if (Array.isArray(e.gridData)) this.gridData = e.gridData.map(
              e => Array.isArray(e) ? e.map(e => e ? e instanceof t.BeadColor ? e : new t.BeadColor(e) : null) : []
            );
             else if ('string' == typeof e.gridData) try {
              const l = JSON.parse(e.gridData);
              Array.isArray(l) ? this.gridData = l.map(
                e => Array.isArray(e) ? e.map(e => e ? e instanceof t.BeadColor ? e : new t.BeadColor(e) : null) : []
              ) : this.gridData = []
            } catch {
              this.gridData = []
            } else this.gridData = [];
            e.stickers &&
            (
              this.stickers = e.stickers.map(
                e => {
                  if (!e) return e;
                  let t = e.type ||
                  (void 0 !== e.text ? 'text' : e.gridData ? 'pixel_stamp' : 'text');
                  return 'text' === t ? new r({
                    ...e,
                    type: 'text'
                  }) : 'pixel_stamp' === t ? new a({
                    ...e,
                    type: 'pixel_stamp'
                  }) : e
                }
              )
            )
          }
        }
        get totalBeads() {
          return this.width * this.height
        }
        get activeBeadsCount() {
          let e = 0,
          t = this.gridData;
          if (!t) return 0;
          for (let l = 0; l < this.height; l++) {
            let i = t[l];
            if (i) for (let t = 0; t < this.width; t++) null !== i[t] &&
            e++
          }
          return e
        }
        get beadUsageStats() {
          let e = {},
          t = this.gridData;
          if (!t) return e;
          for (let l = 0; l < this.height; l++) {
            let i = t[l];
            if (i) for (let t = 0; t < this.width; t++) {
              let l = i[t];
              l &&
              (e[l.id] = (e[l.id] || 0) + 1)
            }
          }
          return e
        }
        flattenSticker(e, t) {
          let l = this.stickers.findIndex(t => t.id === e);
          if ( - 1 === l) return;
          let i = this.stickers[l].rasterize(t, this.width, this.height);
          for (let e = 0; e < this.height; e++) for (let t = 0; t < this.width; t++) {
            let l = i[e]?.[t];
            l &&
            (this.gridData[e][t] = l)
          }
          this.stickers.splice(l, 1),
          this.isDirty = !0,
          this.pixelCount = this.activeBeadsCount
        }
      }
      ],
      1872
    )
  },
  43653,
  e => {
    e.q('/_next/static/media/pixel.worker.0ikncpw-gj67-.ts')
  },
  9559,
  e => {
    e.v(
      function (t, l) {
        return e.b(
          t,
          'static/chunks/turbopack-worker-0sjn--fhq~1cg.js',
          [
            'static/chunks/0wbn~pxju.20z.js',
            'static/chunks/turbopack-0x5c.4u-g.vsq.js'
          ],
          l
        )
      }
    )
  },
  15353,
  e => {
    'use strict';
    let t = (0, e.i(71414).create) () (
      e => ({
        appActiveTab: 'discover',
        setAppActiveTab: t => e({
          appActiveTab: t
        }),
        isCreateDrawerOpen: !1,
        setCreateDrawerOpen: t => e({
          isCreateDrawerOpen: t
        }),
        isToolboxDrawerOpen: !1,
        setToolboxDrawerOpen: t => e({
          isToolboxDrawerOpen: t
        }),
        isCustomSizeModalOpen: !1,
        setCustomSizeModalOpen: t => e({
          isCustomSizeModalOpen: t
        }),
        publishedDetailDrawing: null,
        isPublishedDetailOpen: !1,
        openPublishedDetail: t => e({
          publishedDetailDrawing: t,
          isPublishedDetailOpen: !0
        }),
        closePublishedDetail: () => e({
          isPublishedDetailOpen: !1
        }),
        isMediaExtractModalOpen: !1,
        mediaExtractInitialText: '',
        mediaExtractPlatform: 'xiaohongshu',
        openMediaExtractor: (t = '', l = 'xiaohongshu') => e({
          isMediaExtractModalOpen: !0,
          mediaExtractInitialText: t,
          mediaExtractPlatform: l
        }),
        closeMediaExtractor: () => e({
          isMediaExtractModalOpen: !1,
          mediaExtractInitialText: ''
        }),
        recognizeImageSrc: null,
        isV3RecognizerOpen: !1,
        openV3Recognizer: t => e({
          recognizeImageSrc: t,
          isV3RecognizerOpen: !0
        }),
        closeV3Recognizer: () => e({
          recognizeImageSrc: null,
          isV3RecognizerOpen: !1
        })
      })
    );
    e.s(['useAppTabStore',
    0,
    t])
  },
  66962,
  88813,
  37491,
  7587,
  22243,
  57917,
  39944,
  43669,
  76826,
  89881,
  e => {
    'use strict';
    e.s(['useBeadStore',
    () => K], 66962);
    var t = e.i(71414),
    l = e.i(38209),
    i = e.i(95017);
    e.i(30932);
    var r = e.i(16698),
    a = e.i(7744);
    function s(e, t = 100) {
      'requestIdleCallback' in window ? window.requestIdleCallback(e, {
        timeout: t
      }) : 'u' > typeof requestAnimationFrame ? requestAnimationFrame(() => {
        setTimeout(e, 16)
      }) : setTimeout(e, 16)
    }
    e.s(
      ['runOnIdle',
      0,
      s,
      'useConcurrentState',
      0,
      function (e) {
        let[t,
        l] = (0, a.useState) (e),
        [
          i,
          r
        ] = (0, a.useTransition) ();
        return [t,
        (0, a.useCallback) (e => {
          r(() => {
            l(e)
          })
        }, []),
        i]
      }
      ],
      88813
    );
    var o = e.i(1872),
    n = e.i(73283),
    d = e.i(41697),
    c = e.i(28176),
    u = e.i(32966);
    function p(e) {
      let t = new Map;
      if (!e) return t;
      for (let l = 0; l < e.length; l++) {
        let i = e[l];
        if (i) for (let e = 0; e < i.length; e++) {
          let l = i[e];
          l?.id &&
          t.set(l.id, (t.get(l.id) || 0) + 1)
        }
      }
      return t
    }
    e.s(
      ['calculatePixelStats',
      0,
      p,
      'calculateStats',
      0,
      p,
      'findClosestBeadColor',
      0,
      function (e, t) {
        if (!t || 0 === t.length) return null;
        let l = 1 / 0,
        i = t[0];
        for (let r of t) {
          let t = r.r ?? 0,
          a = r.g ?? 0,
          s = r.b ?? 0,
          o = Math.pow(t - e.r, 2) + Math.pow(a - e.g, 2) + Math.pow(s - e.b, 2);
          o < l &&
          (l = o, i = r)
        }
        return i
      },
      'isLightColor',
      0,
      function (e) {
        if (!e) return !1;
        let t = e.replace('#', ''),
        l = 0,
        i = 0,
        r = 0;
        return 3 === t.length ? (
          l = parseInt(t.substring(0, 1) + t.substring(0, 1), 16),
          i = parseInt(t.substring(1, 2) + t.substring(1, 2), 16),
          r = parseInt(t.substring(2, 3) + t.substring(2, 3), 16)
        ) : 6 === t.length &&
        (
          l = parseInt(t.substring(0, 2), 16),
          i = parseInt(t.substring(2, 4), 16),
          r = parseInt(t.substring(4, 6), 16)
        ),
        (299 * l + 587 * i + 114 * r) / 1000 > 160
      }
      ],
      37491
    );
    let h = null,
    g = null,
    f = 0;
    function m(e, t, l) {
      let i = Array.from({
        length: l
      }, () => Array(t).fill(null));
      if (!e || 0 === e.length) return i;
      for (let r of e) {
        if (!r.visible || r.opacity <= 0) continue;
        let e = r.pixels;
        for (let r = 0; r < l; r++) for (let l = 0; l < t; l++) {
          let t = e[r]?.[l];
          t &&
          (i[r][l] = t)
        }
      }
      return i
    }
    var y = e.i(72954),
    x = e.i(87344),
    w = e.i(75753),
    S = e.i(18055);
    function b(e) {
      return (0, w.rgbToLab) (new S.RGB({
        r: e.r,
        g: e.g,
        b: e.b
      }))
    }
    function A(e) {
      let {
        paletteColors: t,
        colorUsageStats: l,
        targetCount: i
      }
      = e,
      r = [],
      a = new Map;
      for (let e of t) {
        a.set(e.id, e);
        let t = l.get(e.id) ||
        0;
        if (t > 0) {
          let l = b(e),
          i = Math.sqrt(l.a * l.a + l.b * l.b);
          r.push({
            id: e.id,
            color: e,
            lab: l,
            count: t,
            chroma: i
          })
        }
      }
      let s = r.length;
      if (s <= i || s <= 1) {
        let e = new Map;
        return r.forEach(t => {
          e.set(t.id, t.color)
        }),
        {
          simplifiedPalette: r.map(e => e.color),
          colorMapping: e,
          mergedCount: 0,
          averageDeltaE: 0
        }
      }
      let o = Math.max(1, Math.min(i, s)),
      n = r.map(
        e => {
          let t = 1 / 0;
          for (let l of r) {
            if (l.id === e.id) continue;
            let i = (0, w.deltaE2000) (e.lab, l.lab);
            i < t &&
            (t = i)
          }
          let l = t === 1 / 0 ? 0 : t,
          i = Math.log10(e.count + 9),
          a = 1 + e.chroma / 25;
          return {
            ...e,
            isolation: l,
            saliency: i * a * (1 + l / 15)
          }
        }
      ),
      d = new Map;
      n.forEach(e => d.set(e.id, e.id));
      let c = n.map(e => ({
        ...e
      }));
      for (; c.length > o; ) {
        let e = 1 / 0,
        t = [
          - 1,
          - 1
        ];
        for (let l = 0; l < c.length; l++) for (let i = l + 1; i < c.length; i++) {
          let r = function (e, t) {
            let l = (0, w.deltaE2000) (e.lab, t.lab),
            i = e.saliency * t.saliency / (e.saliency + t.saliency),
            r = Math.pow(l, 3.2),
            a = Math.max(e.chroma, t.chroma);
            return i * r * (a > 30 ? 1 + a / 30 : 1)
          }(c[l], c[i]);
          r < e &&
          (e = r, t = [
            l,
            i
          ])
        }
        if ( - 1 === t[0] || - 1 === t[1]) break;
        let[l,
        i] = t,
        r = c[l],
        a = c[i],
        s = r.saliency >= a.saliency,
        o = s ? r : a,
        n = s ? a : r,
        u = s ? i : l;
        for (let[e,
        t]of d.entries()) t === n.id &&
        d.set(e, o.id);
        o.count += n.count,
        o.saliency = Math.max(o.saliency, n.saliency) + 0.3 * Math.min(o.saliency, n.saliency),
        c.splice(u, 1)
      }
      let u = c.map(e => e.color),
      p = u.map(e => ({
        color: e,
        lab: b(e)
      })),
      h = new Map,
      g = 0,
      f = 0;
      for (let e of n) {
        let t = d.get(e.id),
        l = null,
        i = 1 / 0;
        if (t) {
          let r = u.find(e => e.id === t);
          r &&
          (l = r, i = (0, w.deltaE2000) (e.lab, b(r)))
        }
        if (!l) for (let t of p) {
          let r = (0, w.deltaE2000) (e.lab, t.lab);
          r < i &&
          (i = r, l = t.color)
        }
        l &&
        (h.set(e.id, l), g += i * e.count, f += e.count)
      }
      let m = f > 0 ? g / f : 0;
      return {
        simplifiedPalette: u,
        colorMapping: h,
        mergedCount: s - u.length,
        averageDeltaE: Number(m.toFixed(2))
      }
    }
    e.s(['reducePaletteByPerceptualLoss',
    0,
    A], 7587);
    class P {
      worker = null;
      pendingCallbacks = new Map;
      taskIdCounter = 0;
      constructor() {
        if ('u' > typeof Worker) try {
          const e = `
          self.onmessage = async (e) => {
            const { id, type, payload } = e.data;
            try {
              let result = null;
              
              if (type === 'PARSE_GRID_DATA') {
                result = typeof payload.rawGrid === 'string' ? JSON.parse(payload.rawGrid) : payload.rawGrid;
              } 
              else if (type === 'EXTRACT_UNIQUE_COLORS') {
                const { gridData, paletteColorMap } = payload;
                const parsedGrid = typeof gridData === 'string' ? JSON.parse(gridData) : gridData;
                const colorIdSet = new Set();
                if (Array.isArray(parsedGrid)) {
                  parsedGrid.forEach(row => {
                    if (Array.isArray(row)) {
                      row.forEach(cell => {
                        if (cell && cell !== 'transparent') {
                          colorIdSet.add(cell);
                        }
                      });
                    }
                  });
                }
                const mapObj = paletteColorMap || {};
                result = Array.from(colorIdSet).map(colorId => ({
                  id: String(colorId),
                  hex: mapObj[colorId] || '#ffffff'
                }));
              }
              else if (type === 'FLATTEN_AND_STATS') {
                const { layers, cols, rows } = payload;
                const flattened = Array.from({ length: rows }, () => Array(cols).fill(null));
                const statsObj = {};

                if (layers && layers.length > 0) {
                  for (const layer of layers) {
                    if (!layer.visible || layer.opacity <= 0) continue;
                    const pixels = layer.pixels;
                    for (let y = 0; y < rows; y++) {
                      for (let x = 0; x < cols; x++) {
                        const color = pixels[y]?.[x];
                        if (color) {
                          flattened[y][x] = color;
                        }
                      }
                    }
                  }
                }

                // 计算色卡数量统计
                for (let y = 0; y < rows; y++) {
                  for (let x = 0; x < cols; x++) {
                    const pixel = flattened[y][x];
                    if (pixel && pixel.id) {
                      statsObj[pixel.id] = (statsObj[pixel.id] || 0) + 1;
                    }
                  }
                }

                result = { flattened, statsObj };
              }
              else if (type === 'FIND_STRAY_BEADS') {
                const { pixels } = payload;
                const rows = pixels.length;
                if (rows === 0) {
                  result = [];
                } else {
                  const cols = pixels[0].length;
                  const visited = new Uint8Array(rows * cols);
                  const components = [];

                  for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                      if (pixels[y][x] === null) continue;
                      const idx = y * cols + x;
                      if (visited[idx]) continue;

                      const component = [];
                      const queue = [[x, y]];
                      visited[idx] = 1;

                      let head = 0;
                      while (head < queue.length) {
                        const [cx, cy] = queue[head++];
                        component.push({ x: cx, y: cy });

                        for (let dy = -1; dy <= 1; dy++) {
                          for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = cx + dx;
                            const ny = cy + dy;

                            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                              if (pixels[ny][nx] !== null) {
                                const nidx = ny * cols + nx;
                                if (visited[nidx] === 0) {
                                  visited[nidx] = 1;
                                  queue.push([nx, ny]);
                                }
                              }
                            }
                          }
                        }
                      }
                      components.push(component);
                    }
                  }

                  if (components.length <= 1) {
                    result = [];
                  } else {
                    let maxIdx = 0;
                    let maxLen = 0;
                    for (let i = 0; i < components.length; i++) {
                      if (components[i].length > maxLen) {
                        maxLen = components[i].length;
                        maxIdx = i;
                      }
                    }

                    const strayCoords = [];
                    for (let i = 0; i < components.length; i++) {
                      if (i !== maxIdx) {
                        strayCoords.push(...components[i]);
                      }
                    }
                    result = strayCoords;
                  }
                }
              }
              else if (type === 'MERGE_COLORS') {
                const { layers, sourceColorIds, targetColor, cols, rows } = payload;
                const sourceSet = new Set(sourceColorIds);
                const nextLayers = layers.map(layer => {
                  const newPixels = layer.pixels.map(row =>
                    row.map(pixel => {
                      if (pixel && sourceSet.has(pixel.id)) {
                        return targetColor ? { ...targetColor } : null;
                      }
                      return pixel;
                    })
                  );
                  return { ...layer, pixels: newPixels };
                });
                result = { nextLayers };
              }
              else {
                result = payload;
              }

              self.postMessage({ id, type, success: true, result });
            } catch (err) {
              self.postMessage({ id, type, success: false, error: err.message || String(err) });
            }
          };
        
          `,
          t = new Blob([e], {
            type: 'application/javascript'
          });
          this.worker = new Worker(URL.createObjectURL(t)),
          this.worker.onmessage = this.handleWorkerMessage.bind(this)
        } catch (e) {
          console.warn('[WorkerComputeBus] 动态创建 Web Worker 降级主线程:', e)
        }
      }
      handleWorkerMessage(e) {
        let {
          id: t,
          success: l,
          result: i,
          error: r
        }
        = e.data,
        a = this.pendingCallbacks.get(t);
        a &&
        (
          this.pendingCallbacks.delete(t),
          l ? a.resolve(i) : a.reject(Error(r || 'Worker 执行失败'))
        )
      }
      execute(e, t, l) {
        return this.worker ? new Promise(
          (i, r) => {
            let a = `task_${ Date.now() }_${ ++this.taskIdCounter }`;
            this.pendingCallbacks.set(a, {
              resolve: i,
              reject: r
            });
            let s = {
              id: a,
              type: e,
              payload: t
            };
            l &&
            l.length > 0 ? this.worker.postMessage(s, l) : this.worker.postMessage(s)
          }
        ) : Promise.resolve(t)
      }
    }
    let I = new P;
    function M(e) {
      return e.gridData.map(
        e => e.map(
          e => {
            let t;
            if (!e) return null;
            let {
              r: l,
              g: i,
              b: r
            }
            = {
              r: (t = parseInt(e.replace('#', ''), 16)) >> 16 & 255,
              g: t >> 8 & 255,
              b: 255 & t
            };
            return {
              id: e,
              name: 'Asset Color',
              hex: e,
              r: l,
              g: i,
              b: r,
              brand: 'Asset'
            }
          }
        )
      )
    }
    e.s(['workerBus',
    0,
    I], 22243),
    e.s(
      ['createStickerSlice',
      () => R,
      'ensureStickerInstance',
      () => L],
      39944
    );
    let v = '#FF4D4F',
    C = '#FFD666',
    D = '#1F1F1F',
    k = '#FFFFFF',
    T = '#73D13D',
    B = [
      {
        id: 'classic-heart',
        name: '像素红心',
        category: 'classic',
        width: 9,
        height: 8,
        gridData: [
          [null,
          v,
          v,
          null,
          null,
          null,
          v,
          v,
          null],
          [
            v,
            v,
            v,
            v,
            null,
            v,
            v,
            v,
            v
          ],
          [
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            v
          ],
          [
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            v
          ],
          [
            null,
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            null
          ],
          [
            null,
            null,
            v,
            v,
            v,
            v,
            v,
            null,
            null
          ],
          [
            null,
            null,
            null,
            v,
            v,
            v,
            null,
            null,
            null
          ],
          [
            null,
            null,
            null,
            null,
            v,
            null,
            null,
            null,
            null
          ]
        ]
      },
      {
        id: 'classic-star',
        name: '像素星星',
        category: 'classic',
        width: 9,
        height: 9,
        gridData: [
          [null,
          null,
          null,
          null,
          C,
          null,
          null,
          null,
          null],
          [
            null,
            null,
            null,
            C,
            C,
            C,
            null,
            null,
            null
          ],
          [
            C,
            null,
            C,
            C,
            C,
            C,
            C,
            null,
            C
          ],
          [
            null,
            C,
            C,
            C,
            C,
            C,
            C,
            C,
            null
          ],
          [
            null,
            null,
            C,
            C,
            C,
            C,
            C,
            null,
            null
          ],
          [
            null,
            null,
            C,
            C,
            C,
            C,
            C,
            null,
            null
          ],
          [
            null,
            C,
            C,
            C,
            null,
            C,
            C,
            C,
            null
          ],
          [
            C,
            C,
            C,
            null,
            null,
            null,
            C,
            C,
            C
          ],
          [
            C,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            C
          ]
        ]
      },
      {
        id: 'classic-mushroom',
        name: '经典小红菇',
        category: 'classic',
        width: 12,
        height: 12,
        gridData: [
          [null,
          null,
          null,
          null,
          D,
          D,
          D,
          D,
          null,
          null,
          null,
          null],
          [
            null,
            null,
            null,
            D,
            v,
            v,
            v,
            v,
            D,
            null,
            null,
            null
          ],
          [
            null,
            null,
            D,
            v,
            v,
            k,
            k,
            v,
            v,
            D,
            null,
            null
          ],
          [
            null,
            D,
            v,
            k,
            k,
            k,
            k,
            k,
            k,
            v,
            D,
            null
          ],
          [
            null,
            D,
            v,
            k,
            k,
            v,
            v,
            k,
            k,
            v,
            D,
            null
          ],
          [
            D,
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            v,
            D
          ],
          [
            D,
            v,
            v,
            D,
            D,
            D,
            D,
            D,
            D,
            v,
            v,
            D
          ],
          [
            null,
            D,
            D,
            k,
            k,
            D,
            D,
            k,
            k,
            D,
            D,
            null
          ],
          [
            null,
            null,
            D,
            k,
            k,
            k,
            k,
            k,
            k,
            D,
            null,
            null
          ],
          [
            null,
            null,
            D,
            k,
            D,
            k,
            k,
            D,
            k,
            D,
            null,
            null
          ],
          [
            null,
            null,
            D,
            k,
            k,
            k,
            k,
            k,
            k,
            D,
            null,
            null
          ],
          [
            null,
            null,
            null,
            D,
            D,
            D,
            D,
            D,
            D,
            null,
            null,
            null
          ]
        ]
      },
      {
        id: 'emoji-smile',
        name: '开心笑脸',
        category: 'emoji',
        width: 10,
        height: 10,
        gridData: [
          [null,
          null,
          C,
          C,
          C,
          C,
          C,
          C,
          null,
          null],
          [
            null,
            C,
            C,
            C,
            C,
            C,
            C,
            C,
            C,
            null
          ],
          [
            C,
            C,
            D,
            C,
            C,
            C,
            C,
            D,
            C,
            C
          ],
          [
            C,
            C,
            D,
            C,
            C,
            C,
            C,
            D,
            C,
            C
          ],
          [
            C,
            C,
            C,
            C,
            C,
            C,
            C,
            C,
            C,
            C
          ],
          [
            C,
            C,
            D,
            C,
            C,
            C,
            C,
            D,
            C,
            C
          ],
          [
            C,
            C,
            null,
            D,
            D,
            D,
            D,
            null,
            C,
            C
          ],
          [
            null,
            C,
            C,
            null,
            null,
            null,
            null,
            C,
            C,
            null
          ],
          [
            null,
            null,
            C,
            C,
            C,
            C,
            C,
            C,
            null,
            null
          ],
          [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]
        ]
      },
      {
        id: 'festival-clover',
        name: '四叶草',
        category: 'classic',
        width: 9,
        height: 9,
        gridData: [
          [null,
          null,
          T,
          T,
          null,
          T,
          T,
          null,
          null],
          [
            null,
            T,
            T,
            T,
            T,
            T,
            T,
            T,
            null
          ],
          [
            T,
            T,
            T,
            T,
            T,
            T,
            T,
            T,
            T
          ],
          [
            T,
            T,
            T,
            T,
            T,
            T,
            T,
            T,
            T
          ],
          [
            null,
            T,
            T,
            T,
            D,
            T,
            T,
            T,
            null
          ],
          [
            T,
            T,
            T,
            T,
            D,
            T,
            T,
            T,
            T
          ],
          [
            T,
            T,
            T,
            T,
            D,
            T,
            T,
            T,
            T
          ],
          [
            null,
            T,
            T,
            T,
            D,
            T,
            T,
            T,
            null
          ],
          [
            null,
            null,
            T,
            T,
            D,
            T,
            T,
            null,
            null
          ]
        ]
      }
    ];
    function L(e) {
      if (!e) return e;
      let t = e.type ||
      (void 0 !== e.text ? 'text' : e.gridData ? 'pixel_stamp' : 'text');
      return 'text' === t ? new y.TextSticker({
        ...e,
        type: 'text'
      }) : 'pixel_stamp' === t ? new x.PixelStampSticker({
        ...e,
        type: 'pixel_stamp'
      }) : e
    }
    e.s(['BUILTIN_ASSETS',
    0,
    B,
    'getTemplatePixelGrid',
    0,
    M], 57917);
    let E = null,
    O = null,
    _ = !1,
    N = '',
    F = {
      pixels: null,
      stats: null,
      stickerPixels: null
    },
    R = (e, t) => ({
      stickers: [],
      selectedStickerId: null,
      customStamps: [],
      isSaveAssetModalOpen: !1,
      pendingAssetGrid: null,
      openSaveAssetModal: l => {
        let i = l;
        if (!i) {
          let {
            selectionFloating: e,
            selectionBox: l,
            selectionMask: r,
            processedPixels: a
          }
          = t();
          if (e && e.pixels) i = e.pixels;
           else if (l && a && r) {
            let e = l.x,
            t = l.y;
            i = Array.from({
              length: l.h
            }, (i, s) => Array.from({
              length: l.w
            }, (l, i) => {
              let o = e + i,
              n = t + s;
              return r.has(`${ o },${ n }`) &&
              a[n]?.[o] ||
              null
            }))
          }
        }
        if (!i || 0 === i.length) return;
        let r = x.PixelStampSticker.trimGrid(i);
        0 !== r.length &&
        e({
          isSaveAssetModalOpen: !0,
          pendingAssetGrid: r
        })
      },
      closeSaveAssetModal: () => {
        e({
          isSaveAssetModalOpen: !1,
          pendingAssetGrid: null
        })
      },
      saveCustomStamp: async(l, i = 'custom') => {
        let {
          pendingAssetGrid: r,
          customStamps: a
        }
        = t();
        if (!r || 0 === r.length) return null;
        let s = x.PixelStampSticker.trimGrid(r);
        if (0 === s.length) return null;
        let o = s.map(e => e ? e.map(e => e ? new S.BeadColor(e) : null) : []),
        n = new x.PixelStampSticker({
          id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: l.trim() ||
          '自定义素材',
          category: i ||
          'custom',
          isCustom: !0,
          createdAt: Date.now(),
          gridData: o
        });
        return e({
          customStamps: [
            n,
            ...a
          ],
          isSaveAssetModalOpen: !1,
          pendingAssetGrid: null
        }),
        n
      },
      deleteCustomStamp: async l => {
        let {
          customStamps: i
        }
        = t();
        e({
          customStamps: i.filter(e => e.id !== l)
        })
      },
      addPixelStampInstance: l => {
        t().pushHistory();
        let {
          processedPixels: i,
          stickers: r
        }
        = t(),
        a = 25,
        s = 25;
        i &&
        i.length > 0 &&
        (s = Math.floor(i.length / 2), a = Math.floor((i[0]?.length || 0) / 2));
        let o = new x.PixelStampSticker({
          id: Math.random().toString(36).substring(2, 9),
          name: l.name,
          category: l.category,
          isCustom: l.isCustom,
          x: a,
          y: s,
          scale: 1,
          rotation: 0,
          gridData: l.gridData,
          paletteId: l.paletteId ||
          'Asset',
          assetId: l.id
        });
        e({
          stickers: [
            ...r,
            o
          ],
          selectedStickerId: o.id,
          activeTool: 'hand'
        })
      },
      addTextSticker: (l = '双击编辑') => {
        t().pushHistory();
        let {
          processedPixels: i,
          stickers: r
        }
        = t(),
        a = 25,
        s = 25;
        i &&
        i.length > 0 &&
        (s = Math.floor(i.length / 2), a = Math.floor((i[0]?.length || 0) / 2));
        let o = new y.TextSticker({
          id: Math.random().toString(36).substring(2, 9),
          text: l,
          x: a,
          y: s,
          scale: 1,
          rotation: 0,
          color: '#8C52FF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          bold: !0,
          italic: !1
        });
        e({
          stickers: [
            ...r,
            o
          ],
          selectedStickerId: o.id,
          activeTool: 'hand'
        })
      },
      addPixelStampSticker: l => {
        let i = t().customStamps.find(e => e.id === l);
        if (i) return void t().addPixelStampInstance(i);
        let r = B.find(e => e.id === l);
        if (!r) return;
        t().pushHistory();
        let {
          processedPixels: a,
          stickers: s
        }
        = t(),
        o = 25,
        n = 25;
        a &&
        a.length > 0 &&
        (n = Math.floor(a.length / 2), o = Math.floor((a[0]?.length || 0) / 2));
        let d = M(r),
        c = new x.PixelStampSticker({
          id: Math.random().toString(36).substring(2, 9),
          name: r.name,
          category: r.category,
          isCustom: !1,
          x: o,
          y: n,
          scale: 1,
          rotation: 0,
          gridData: d,
          paletteId: 'Asset',
          assetId: l
        });
        e({
          stickers: [
            ...s,
            c
          ],
          selectedStickerId: c.id,
          activeTool: 'hand'
        })
      },
      updateSticker: (l, i) => {
        let {
          stickers: r
        }
        = t();
        e({
          stickers: r.map(
            e => {
              if (e.id === l) {
                let t = e.type;
                if ('text' === t) return new y.TextSticker({
                  ...e,
                  ...i
                });
                if ('pixel_stamp' === t) return new x.PixelStampSticker({
                  ...e,
                  ...i
                })
              }
              return e
            }
          )
        })
      },
      deleteSticker: l => {
        t().pushHistory();
        let {
          stickers: i,
          selectedStickerId: r
        }
        = t();
        e({
          stickers: i.filter(e => e.id !== l),
          selectedStickerId: r === l ? null : r
        })
      },
      bakeAllStickers: () => {
        let {
          pixels: l,
          stats: i,
          stickerPixels: r
        }
        = t().getBlendedCanvas();
        if (!l || !r) return;
        t().pushHistory();
        let {
          layers: a,
          activeLayerId: s
        }
        = t(),
        o = l.length,
        n = l[0]?.length ||
        0;
        if (a && a.length > 0) {
          let t = s ||
          a[0].id,
          l = a.map(
            e => {
              if (e.id === t) {
                let t = e.pixels.map(
                  (e, t) => e.map((e, l) => {
                    let i = r[t]?.[l];
                    return i ? {
                      ...i
                    }
                     : e ? {
                      ...e
                    }
                     : null
                  })
                );
                return {
                  ...e,
                  pixels: t
                }
              }
              return e
            }
          ),
          i = m(l, n, o),
          d = p(i);
          e({
            layers: l,
            processedPixels: i,
            stats: d,
            stickers: [],
            selectedStickerId: null
          })
        } else e({
          processedPixels: l,
          stats: i,
          stickers: [],
          selectedStickerId: null
        })
      },
      flattenSticker: l => {
        let {
          stickers: i,
          processedPixels: r,
          options: a,
          getPalette: s,
          layers: o,
          activeLayerId: n
        }
        = t(),
        d = i.find(e => e.id === l);
        if (!d || !r) return;
        let c = L(d);
        if (!c) return;
        t().pushHistory();
        let u = s(a.paletteId || 'mard'),
        h = r.length,
        g = r[0]?.length ||
        0,
        f = Array.from({
          length: h
        }, () => Array(g).fill(null));
        if ('function' == typeof c.blendOntoGrid) c.blendOntoGrid(f, u, g, h);
         else if ('function' == typeof c.rasterize) {
          let e = c.rasterize(u, g, h);
          for (let t = 0; t < h; t++) for (let l = 0; l < g; l++) f[t][l] = e[t]?.[l] ||
          null
        }
        let y = o,
        x = r;
        if (o && o.length > 0) {
          let e = n ||
          o[0].id;
          x = m(
            y = o.map(
              t => {
                if (t.id === e) {
                  let e = t.pixels.map(
                    (e, t) => e.map(
                      (e, l) => {
                        let i = f[t]?.[l];
                        return i ? {
                          id: i.id,
                          name: i.name,
                          hex: i.hex,
                          r: i.r,
                          g: i.g,
                          b: i.b,
                          brand: i.brand
                        }
                         : e ? {
                          ...e
                        }
                         : null
                      }
                    )
                  );
                  return {
                    ...t,
                    pixels: e
                  }
                }
                return t
              }
            ),
            g,
            h
          )
        } else x = r.map(
          (e, t) => e.map(
            (e, l) => {
              let i = f[t]?.[l];
              return i ? {
                id: i.id,
                name: i.name,
                hex: i.hex,
                r: i.r,
                g: i.g,
                b: i.b,
                brand: i.brand
              }
               : e
            }
          )
        );
        let w = p(x);
        e({
          layers: y,
          processedPixels: x,
          stats: w,
          stickers: i.filter(e => e.id !== l),
          selectedStickerId: null
        })
      },
      clearStickers: () => {
        e({
          stickers: [],
          selectedStickerId: null
        })
      },
      getBlendedCanvas: () => {
        let {
          processedPixels: e,
          templatePixels: l,
          isComparing: i,
          templateStats: a,
          stickers: s,
          options: o
        }
        = t(),
        n = i &&
        l ? l : e,
        d = i &&
        a ? a : t().stats;
        if (!n) return {
          pixels: null,
          stats: null,
          stickerPixels: null
        };
        if (
          n === E &&
          i === _ &&
          o.paletteId === N &&
          (
            (e, t) => {
              if (e === t) return !0;
              if (!e || !t || e.length !== t.length) return !1;
              for (let l = 0; l < e.length; l++) {
                let i = e[l],
                r = t[l];
                if (
                  i.id !== r.id ||
                  i.x !== r.x ||
                  i.y !== r.y ||
                  i.scale !== r.scale ||
                  i.rotation !== r.rotation ||
                  i.type !== r.type
                ) return !1;
                if ('text' === i.type && 'text' === r.type) {
                  if (
                    i.text !== r.text ||
                    i.color !== r.color ||
                    i.fontFamily !== r.fontFamily ||
                    i.bold !== r.bold ||
                    i.italic !== r.italic
                  ) return !1
                } else if (
                  'pixel_stamp' === i.type &&
                  'pixel_stamp' === r.type &&
                  (i.assetId !== r.assetId || i.paletteId !== r.paletteId)
                ) return !1
              }
              return !0
            }
          ) (s, O) &&
          null !== F.pixels
        ) return F;
        let c = n.length,
        u = n[0]?.length ||
        0;
        if (0 === c || 0 === u) {
          let e = {
            pixels: n,
            stats: d,
            stickerPixels: null
          };
          return E = n,
          _ = i,
          N = o.paletteId,
          O = s.map(L),
          F = e,
          e
        }
        let p = n.map(e => [...e]),
        h = Array.from({
          length: c
        }, () => Array(u).fill(null));
        if (!i && s.length > 0) {
          let e = s.map(L),
          l = o.paletteId &&
          r.ALL_PALETTES[o.paletteId] ? o.paletteId : 'mard',
          i = t().getPalette(l);
          e.forEach(
            e => {
              if (e && 'function' == typeof e.blendOntoGrid) {
                let t = Array.from({
                  length: c
                }, () => Array(u).fill(null));
                e.blendOntoGrid(t, i, u, c);
                for (let e = 0; e < c; e++) for (let l = 0; l < u; l++) {
                  let i = t[e][l];
                  i &&
                  (p[e][l] = i, h[e][l] = i)
                }
              }
            }
          )
        }
        let g = new Map;
        for (let e = 0; e < c; e++) for (let t = 0; t < u; t++) {
          let l = p[e][t];
          l &&
          g.set(l.id, (g.get(l.id) || 0) + 1)
        }
        let f = {
          pixels: p,
          stats: g,
          stickerPixels: h
        };
        return E = n,
        _ = i,
        N = o.paletteId,
        O = s.map(L),
        F = f,
        f
      }
    });
    var G = e.i(57733);
    let V = null;
    class z {
      static instance = null;
      steamNoiseNode = null;
      steamGainNode = null;
      steamFilterNode = null;
      steamBuffer = null;
      static getInstance() {
        return z.instance ||
        (z.instance = new z),
        z.instance
      }
      getCtx() {
        if (!G.useAppSettingsStore.getState().soundEnabled) return null;
        if (!V || 'closed' === V.state) {
          let e = window.AudioContext ||
          window.webkitAudioContext;
          e &&
          (V = new e)
        }
        return V &&
        'suspended' === V.state &&
        V.resume().catch(() => {
        }),
        V
      }
      playClick(e = 0) {
        if (!G.useAppSettingsStore.getState().soundEnabled) return;
        let t = this.getCtx();
        if (t) try {
          let l = t.currentTime,
          i = t.createOscillator(),
          r = t.createGain();
          i.type = 'sine';
          let a = Math.min(12, e),
          s = 380 * Math.pow(1.059463, a);
          i.frequency.setValueAtTime(s, l),
          i.frequency.exponentialRampToValueAtTime(80, l + 0.045),
          r.gain.setValueAtTime(0.25, l),
          r.gain.exponentialRampToValueAtTime(0.001, l + 0.045),
          i.connect(r),
          r.connect(t.destination);
          let o = t.createOscillator(),
          n = t.createGain();
          o.type = 'triangle',
          o.frequency.setValueAtTime(1800, l),
          n.gain.setValueAtTime(0.12, l),
          n.gain.exponentialRampToValueAtTime(0.001, l + 0.01),
          o.connect(n),
          n.connect(t.destination),
          i.start(l),
          i.stop(l + 0.05),
          o.start(l),
          o.stop(l + 0.012)
        } catch (e) {
        }
      }
      playEraser() {
        let e = this.getCtx();
        if (e) try {
          let t = e.currentTime,
          l = Math.floor(0.08 * e.sampleRate),
          i = e.createBuffer(1, l, e.sampleRate),
          r = i.getChannelData(0);
          for (let e = 0; e < l; e++) r[e] = 2 * Math.random() - 1;
          let a = e.createBufferSource();
          a.buffer = i;
          let s = e.createBiquadFilter();
          s.type = 'bandpass',
          s.frequency.setValueAtTime(900, t),
          s.frequency.exponentialRampToValueAtTime(320, t + 0.08),
          s.Q.setValueAtTime(2.5, t);
          let o = e.createGain();
          o.gain.setValueAtTime(0.06, t),
          o.gain.exponentialRampToValueAtTime(0.001, t + 0.08),
          a.connect(s),
          s.connect(o),
          o.connect(e.destination),
          a.start(t),
          a.stop(t + 0.09)
        } catch (e) {
        }
      }
      getSteamBuffer() {
        if (this.steamBuffer) return this.steamBuffer;
        let e = this.getCtx();
        if (!e) return null;
        let t = e.sampleRate ||
        44100,
        l = 2 * t,
        i = e.createBuffer(1, l, t),
        r = i.getChannelData(0);
        for (let e = 0; e < l; e++) r[e] = 2 * Math.random() - 1;
        return this.steamBuffer = i,
        i
      }
      startSteam() {
        let e = this.getCtx();
        if (e && !this.steamNoiseNode) try {
          let t = e.currentTime,
          l = this.getSteamBuffer();
          if (!l) return;
          this.steamNoiseNode = e.createBufferSource(),
          this.steamNoiseNode.buffer = l,
          this.steamNoiseNode.loop = !0,
          this.steamFilterNode = e.createBiquadFilter(),
          this.steamFilterNode.type = 'bandpass',
          this.steamFilterNode.frequency.setValueAtTime(1400, t),
          this.steamFilterNode.Q.setValueAtTime(1.5, t),
          this.steamGainNode = e.createGain(),
          this.steamGainNode.gain.setValueAtTime(0.001, t),
          this.steamGainNode.gain.linearRampToValueAtTime(0.12, t + 0.3),
          this.steamNoiseNode.connect(this.steamFilterNode),
          this.steamFilterNode.connect(this.steamGainNode),
          this.steamGainNode.connect(e.destination),
          this.steamNoiseNode.start(t)
        } catch (e) {
        }
      }
      updateSteam(e) {
        let t = this.getCtx();
        if (t && this.steamFilterNode && this.steamGainNode) try {
          let l = t.currentTime,
          i = 1000 + 1200 * Math.min(1, e);
          this.steamFilterNode.frequency.setTargetAtTime(i, l, 0.1);
          let r = 0.08 + 0.08 * Math.min(1, e);
          this.steamGainNode.gain.setTargetAtTime(r, l, 0.05)
        } catch (e) {
        }
      }
      stopSteam() {
        let e = this.getCtx();
        if (e && this.steamNoiseNode && this.steamGainNode) try {
          let t = e.currentTime;
          this.steamGainNode.gain.cancelScheduledValues(t),
          this.steamGainNode.gain.setValueAtTime(this.steamGainNode.gain.value, t),
          this.steamGainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          let l = this.steamNoiseNode;
          setTimeout(() => {
            try {
              l.stop(),
              l.disconnect()
            } catch (e) {
            }
          }, 350),
          this.steamNoiseNode = null,
          this.steamGainNode = null,
          this.steamFilterNode = null
        } catch (e) {
        }
      }
      playSuccess() {
        let e = this.getCtx();
        if (e) try {
          let t = e.currentTime;
          [
            261.63,
            329.63,
            392,
            523.25
          ].forEach(
            (l, i) => {
              let r = e.createOscillator(),
              a = e.createGain();
              r.type = 'triangle',
              r.frequency.setValueAtTime(l, t + 0.08 * i);
              let s = t + 0.08 * i;
              a.gain.setValueAtTime(0.001, s),
              a.gain.linearRampToValueAtTime(0.1, s + 0.05),
              a.gain.exponentialRampToValueAtTime(0.001, s + 0.6),
              r.connect(a),
              a.connect(e.destination),
              r.start(s),
              r.stop(s + 0.7)
            }
          )
        } catch (e) {
        }
      }
    }
    let H = z.getInstance();
    e.s(['AudioEngine',
    0,
    z,
    'audioEngine',
    0,
    H], 43669);
    let j = 'hand';
    function U(e, t, l, i) {
      let r = e.length,
      a = e[0]?.length ||
      0,
      s = e;
      return 90 === t ? s = Array.from({
        length: a
      }, (t, l) => Array.from({
        length: r
      }, (t, i) => e[r - 1 - i][l])) : 180 === t ? s = Array.from({
        length: r
      }, (t, l) => Array.from({
        length: a
      }, (t, i) => e[r - 1 - l][a - 1 - i])) : 270 === t &&
      (
        s = Array.from({
          length: a
        }, (t, l) => Array.from({
          length: r
        }, (t, i) => e[i][a - 1 - l]))
      ),
      l &&
      (s = s.map(e => [...e].reverse())),
      i &&
      (s = [
        ...s
      ].reverse()),
      s
    }
    function W(e, t, l) {
      let i = e.x,
      r = e.y,
      a = e.w;
      return {
        pixels: Array.from({
          length: e.h
        }, (e, s) => Array.from({
          length: a
        }, (e, a) => {
          let o = i + a,
          n = r + s;
          return l.has(`${ o },${ n }`) &&
          t[n]?.[o] ||
          null
        })),
        startX: i,
        startY: r,
        offsetX: 0,
        offsetY: 0,
        isClone: !1,
        rotation: 0,
        flipX: !1,
        flipY: !1
      }
    }
    let $ = {
      enabled: !1,
      boardWidth: 26,
      boardHeight: 26,
      activeSliceIndex: null,
      showLabels: !0
    };
    e.s(
      ['DEFAULT_PEGBOARD_CONFIG',
      0,
      $,
      'PEGBOARD_PRESETS',
      0,
      [
        {
          id: 'square-26',
          name: '标准小方板 (26×26)',
          width: 26,
          height: 26,
          description: '国内最通用的带卡扣小拼板'
        },
        {
          id: 'square-52',
          name: '经典大方板 (52×52)',
          width: 52,
          height: 52,
          description: '大型标准大拼板'
        },
        {
          id: 'custom',
          name: '自定义规格',
          width: 26,
          height: 26,
          description: '自由输入行列孔数'
        }
      ]],
      76826
    );
    class q {
      static slice(e, t = 28, l = 28) {
        let i = Math.max(4, Math.floor(t)),
        r = Math.max(4, Math.floor(l)),
        a = Array.isArray(e) ? e.length : 0,
        s = a > 0 &&
        Array.isArray(e[0]) ? e[0].length : 0;
        if (0 === a || 0 === s) return {
          totalRows: 0,
          totalCols: 0,
          boardRows: 0,
          boardCols: 0,
          totalBoards: 0,
          boardWidth: i,
          boardHeight: r,
          slices: []
        };
        let o = Math.ceil(s / i),
        n = Math.ceil(a / r),
        d = [],
        c = 0;
        for (let t = 0; t < n; t++) {
          let l = t * r,
          n = Math.min(l + r, a),
          u = n - l;
          for (let r = 0; r < o; r++) {
            let a = r * i,
            o = Math.min(a + i, s),
            p = o - a,
            h = [],
            g = 0,
            f = {};
            for (let t = l; t < n; t++) {
              let l = [],
              i = e[t] ||
              [];
              for (let e = a; e < o; e++) {
                let t = i[e] ||
                null;
                l.push(t),
                t &&
                (g++, f[t] = (f[t] || 0) + 1)
              }
              h.push(l)
            }
            let m = this.getSliceLabel(t, r);
            d.push({
              index: c,
              label: m,
              rowIdx: t,
              colIdx: r,
              rowStart: l,
              rowEnd: n,
              colStart: a,
              colEnd: o,
              actualWidth: p,
              actualHeight: u,
              pixels: h,
              beadCount: g,
              colorStats: f
            }),
            c++
          }
        }
        return {
          totalRows: a,
          totalCols: s,
          boardRows: n,
          boardCols: o,
          totalBoards: n * o,
          boardWidth: i,
          boardHeight: r,
          slices: d
        }
      }
      static getSliceLabel(e, t) {
        let l = String.fromCharCode(65 + e % 26),
        i = e >= 26 ? Math.floor(e / 26).toString() : '';
        return `${ i }${ l }${ t + 1 }`
      }
      static getSliceIndexAtCoord(e, t, l, i, r) {
        if (e < 0 || t < 0) return - 1;
        let a = Math.floor(e / l);
        return Math.floor(t / i) * Math.ceil(r / l) + a
      }
    }
    e.s(['PegboardSlicer',
    0,
    q], 89881);
    let Y = null,
    X = null,
    Q = async(e, t) => {
      Y = t;
      try {
        let l = JSON.stringify(
          t,
          (e, t) => t instanceof Map ? {
            __isMap: !0,
            entries: Array.from(t.entries())
          }
           : ('processedPixels' === e || 'templatePixels' === e) &&
          Array.isArray(t) ? t.map(e => Array.isArray(e) ? e.map(e => e && 'object' == typeof e ? e.id : e) : e) : t
        );
        try {
          await i.idbStore.set(e, l),
          localStorage.removeItem(e)
        } catch (t) {
          console.warn('[PixelBead Store] 写入 IndexedDB 失败，降级写入 localStorage:', t),
          localStorage.setItem(e, l)
        }
      } catch (e) {
        console.warn('[PixelBead Store] 持久化写入失败，可能存储空间不足:', e)
      }
    },
    K = (0, t.create) () (
      (0, l.persist) (
        (t, l, a) => {
          let s = [
            e => {
              t(
                t => {
                  let l = 'function' == typeof e ? e(t) : e;
                  if (
                    'processedPixels' in l ||
                    'stickers' in l ||
                    'options' in l ||
                    'drawingId' in l ||
                    'statsPaletteId' in l
                  ) if ('currentDrawing' in l);
                   else {
                    let e = 'processedPixels' in l ? l.processedPixels : t.processedPixels,
                    i = 'stickers' in l ? l.stickers : t.stickers,
                    r = 'options' in l ? l.options : t.options,
                    a = 'drawingId' in l ? l.drawingId : t.drawingId,
                    s = 'statsPaletteId' in l ? l.statsPaletteId : r?.paletteId ||
                    t.statsPaletteId,
                    o = 'stats' in l ? l.stats : t.stats;
                    if (e) {
                      let n = 0;
                      if (o instanceof Map) for (let e of o.values()) n += e ||
                      0;
                      l.currentDrawing = {
                        ...t.currentDrawing ||
                        {
                        },
                        id: a ? String(a) : t.currentDrawing?.id ||
                        void 0,
                        title: r?.projectName ||
                        t.currentDrawing?.title ||
                        '未命名拼豆作品',
                        paletteId: s ||
                        t.currentDrawing?.paletteId ||
                        'mard',
                        width: r?.width ||
                        t.currentDrawing?.width ||
                        52,
                        height: r?.height ||
                        t.currentDrawing?.height ||
                        52,
                        pixelCount: n,
                        gridData: e,
                        stickers: i ||
                        t.currentDrawing?.stickers ||
                        [],
                        options: r ||
                        t.currentDrawing?.options ||
                        t.options
                      }
                    } else l.currentDrawing = null
                  }
                  return l
                }
              )
            },
            l,
            a
          ];
          return {
            ...(
              (t, l) => ({
                currentDrawing: null,
                drawingId: null,
                imageSource: null,
                imageData: null,
                processedPixels: null,
                templatePixels: null,
                layers: [],
                activeLayerId: null,
                stats: null,
                templateStats: null,
                statsPaletteId: null,
                customPalettes: [],
                shareModal: null,
                customPaletteModal: null,
                appActiveTab: 'discover',
                referenceImage: null,
                referenceOpacity: 0.45,
                overlayBeadOpacity: 1,
                overlayTextOpacity: 1,
                referenceMode: 'none',
                referenceFitMode: 'contain',
                referenceOffset: {
                  x: 0,
                  y: 0
                },
                referenceScale: 1,
                options: {
                  pixelSize: 1,
                  width: 52,
                  height: 52,
                  paletteId: 'mard',
                  useDithering: !1,
                  denoiseThreshold: 0,
                  abstractionLevel: 0,
                  edgeWeight: 0,
                  projectName: 'My Masterpiece',
                  authorName: 'Pixel Beads Master',
                  sampleMode: 'nearest'
                },
                isProcessing: !1,
                processingText: null,
                isComparing: !1,
                isRemovingBackground: !1,
                removalProgress: 0,
                zoom: 1,
                offset: {
                  x: 0,
                  y: 0
                },
                canvasSize: null,
                showGrid: !0,
                gridColor: '',
                gridThickness: 0.5,
                gridColorBold: '',
                gridThicknessBold: 1,
                showSymbols: !0,
                showViewportHud: !1,
                toolbarPosition: null,
                isSidebarOpen: !1,
                isLightboardMode: !1,
                physicalBeadSize: 5,
                calibrationPpi: 96,
                isLightboardLocked: !1,
                isViewportLocked: !1,
                setImage: async(i, r) => {
                  (0, c.trackEvent) ('entry_select_image');
                  let a = i,
                  s = r;
                  try {
                    let {
                      optimizeImageDensity: t
                    }
                    = await e.A(4412),
                    l = await t(r || i, 1000000);
                    l.optimizedSrc &&
                    (a = l.optimizedSrc),
                    l.imageData &&
                    (s = l.imageData)
                  } catch (e) {
                    console.warn('[PixelBead] 像素密度控制降级使用原图:', e)
                  }
                  let o = 52,
                  n = 52;
                  s.width > s.height ? n = Math.max(1, Math.round(52 * (s.height / s.width))) : o = Math.max(1, Math.round(52 * (s.width / s.height))),
                  t(
                    e => ({
                      imageSource: a,
                      imageData: s,
                      processedPixels: null,
                      templatePixels: null,
                      stats: null,
                      templateStats: null,
                      statsPaletteId: null,
                      options: {
                        ...e.options,
                        width: o,
                        height: n
                      },
                      history: [],
                      future: []
                    })
                  ),
                  l().processImage()
                },
                resetImage: () => t({
                  drawingId: null,
                  imageSource: null,
                  imageData: null,
                  processedPixels: null,
                  templatePixels: null,
                  stats: null,
                  templateStats: null,
                  statsPaletteId: null,
                  stickers: [],
                  selectedStickerId: null,
                  referenceOffset: {
                    x: 0,
                    y: 0
                  },
                  referenceScale: 1,
                  pegboardConfig: {
                    enabled: !1,
                    boardWidth: 26,
                    boardHeight: 26,
                    activeSliceIndex: null,
                    showLabels: !0
                  },
                  isPegboardOverviewOpen: !1
                }),
                rehydrateImageData: () => new Promise(
                  e => {
                    let {
                      imageSource: i
                    }
                    = l();
                    if (
                      !i ||
                      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' === i
                    ) return void e();
                    t({
                      isProcessing: !0
                    });
                    let r = new Image;
                    r.onload = () => {
                      let i = document.createElement('canvas');
                      i.width = r.width,
                      i.height = r.height;
                      let a = i.getContext('2d');
                      a &&
                      (
                        a.drawImage(r, 0, 0),
                        t({
                          imageData: a.getImageData(0, 0, r.width, r.height)
                        }),
                        l().processedPixels &&
                        !l().templatePixels &&
                        t({
                          templatePixels: l().processedPixels?.map(e => [...e]),
                          templateStats: l().stats ? new Map(l().stats) : null
                        }),
                        l().processedPixels ||
                        l().processImage()
                      ),
                      t({
                        isProcessing: !1
                      }),
                      e()
                    },
                    r.onerror = () => {
                      console.warn('[PixelBead] 恢复图像失败，已清空历史数据'),
                      t({
                        imageSource: null,
                        processedPixels: null,
                        templatePixels: null,
                        stats: null,
                        templateStats: null,
                        statsPaletteId: null,
                        isProcessing: !1
                      }),
                      e()
                    },
                    r.src = i
                  }
                ),
                processImage: async() => {
                  let {
                    imageData: i,
                    options: r
                  }
                  = l();
                  if (i) {
                    t({
                      isProcessing: !0
                    }),
                    await new Promise(e => setTimeout(e, 60));
                    try {
                      let a = l().getPalette(r.paletteId).colors,
                      s = i;
                      if (r.abstractionLevel > 0 || r.edgeWeight > 0) try {
                        let {
                          ImageStylizer: t
                        }
                        = await e.A(179);
                        s = t.stylize(i, r.abstractionLevel, r.edgeWeight)
                      } catch (e) {
                        console.error('[PixelBead] 抽象化处理失败:', e)
                      }
                      try {
                        if (!g) {
                          let i = e.r(9559) (Worker);
                          g = i,
                          i.onerror = e => {
                            console.error('[PixelBead AI Engine Critical Error]:', e),
                            t({
                              isProcessing: !1
                            });
                            let i = e?.message ||
                            String(e);
                            l().showAlert({
                              title: '像素引擎崩溃',
                              content: '图像像素化处理引擎在运行时崩溃，建议您更换现代浏览器 (如 Chrome, Safari) 后重试。',
                              details: i,
                              type: 'error',
                              showCancel: !1
                            }),
                            g &&
                            (g.terminate(), g = null)
                          }
                        }
                        let i = ++f;
                        g.onmessage = e => {
                          let {
                            success: i,
                            pixels: a,
                            statsArray: s,
                            error: o,
                            requestId: n
                          }
                          = e.data;
                          if (n === f) if (i) {
                            let e = new Map(s),
                            l = {
                              id: 'layer_bg',
                              name: '背景图层',
                              pixels: a.map(e => [...e]),
                              visible: !0,
                              opacity: 1
                            };
                            t({
                              processedPixels: a,
                              templatePixels: a.map(e => [...e]),
                              stats: e,
                              templateStats: new Map(e),
                              statsPaletteId: r.paletteId,
                              layers: [
                                l
                              ],
                              activeLayerId: 'layer_bg',
                              isProcessing: !1
                            })
                          } else console.error('[PixelBead AI Engine Error]:', o),
                          t({
                            isProcessing: !1
                          }),
                          l().showAlert({
                            title: '像素引擎处理报错',
                            content: '图像像素化处理引擎发生内部错误：' + o,
                            type: 'error',
                            showCancel: !1
                          })
                        },
                        g.postMessage({
                          imageData: s,
                          targetWidth: r.width,
                          targetHeight: r.height,
                          palette: a,
                          useDithering: r.useDithering,
                          denoiseThreshold: r.denoiseThreshold,
                          options: r,
                          requestId: i
                        })
                      } catch (i) {
                        console.error('[PixelBead] 无法创建 Web Worker:', i),
                        t({
                          isProcessing: !1
                        });
                        let e = i instanceof Error ? i.message : String(i);
                        l().showAlert({
                          title: '像素引擎启动失败',
                          content: '图像像素化处理引擎启动失败！您的浏览器环境可能受限或不支持 Web Worker。建议您更换现代浏览器 (如 Chrome, Safari) 或关闭无痕/隐私模式后重试。',
                          details: e,
                          type: 'error',
                          showCancel: !1
                        })
                      }
                    } catch (e) {
                      console.error('[PixelBead Performance Engine] 转换异常:', e),
                      t({
                        isProcessing: !1
                      })
                    }
                  }
                },
                updateOptions: e => {
                  let i = {
                    projectName: 'My Masterpiece',
                    authorName: 'Pixel Beads Master',
                    ...l().options
                  },
                  r = e.paletteId &&
                  e.paletteId !== i.paletteId ||
                  e.width &&
                  e.width !== i.width ||
                  e.height &&
                  e.height !== i.height ||
                  void 0 !== e.useDithering &&
                  e.useDithering !== i.useDithering ||
                  void 0 !== e.denoiseThreshold &&
                  e.denoiseThreshold !== i.denoiseThreshold ||
                  void 0 !== e.abstractionLevel &&
                  e.abstractionLevel !== i.abstractionLevel ||
                  void 0 !== e.edgeWeight &&
                  e.edgeWeight !== i.edgeWeight ||
                  void 0 !== e.sampleMode &&
                  e.sampleMode !== i.sampleMode;
                  t({
                    options: {
                      ...i,
                      ...e
                    }
                  }),
                  r &&
                  l().imageData &&
                  (
                    h ? clearTimeout(h) : l().pushHistory(),
                    h = setTimeout(() => {
                      l().processImage(),
                      h = null
                    }, 150)
                  )
                },
                setProcessedData: (e, l) => t(
                  t => {
                    let i = t.layers ||
                    [],
                    r = t.activeLayerId ||
                    i[0]?.id;
                    if (i.length > 0 && r) {
                      let l = i.map(t => t.id === r ? {
                        ...t,
                        pixels: e.map(e => [...e])
                      }
                       : t),
                      a = m(l, t.options.width, t.options.height),
                      s = p(a);
                      return {
                        layers: l,
                        processedPixels: a,
                        stats: s,
                        isProcessing: !1
                      }
                    }
                    let a = {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: e.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    };
                    return {
                      processedPixels: e,
                      templatePixels: t.templatePixels ||
                      e.map(e => [...e]),
                      stats: l,
                      templateStats: t.templateStats ||
                      new Map(l),
                      statsPaletteId: t.options.paletteId,
                      layers: [
                        a
                      ],
                      activeLayerId: 'layer_bg',
                      isProcessing: !1
                    }
                  }
                ),
                setZoom: e => t({
                  zoom: e
                }),
                setOffset: e => t(t => ({
                  offset: 'function' == typeof e ? e(t.offset) : e
                })),
                setCanvasSize: e => t({
                  canvasSize: e
                }),
                fitToScreen: (e, i) => {
                  let {
                    processedPixels: r,
                    canvasSize: a
                  }
                  = l();
                  if (!r) return;
                  let s = e ?? a?.width,
                  o = i ?? a?.height;
                  if (!s || !o) return;
                  let n = r.length,
                  d = r[0]?.length ||
                  0;
                  if (0 === n || 0 === d) return;
                  let c = 0,
                  u = 0;
                  if (window.innerWidth <= 1024) {
                    let e = window.innerWidth >= 768;
                    c = e ? 90 : 80,
                    u = e ? 196 : 170
                  }
                  let p = o - c - u,
                  h = window.innerWidth <= 768 ? 0.86 : 0.9,
                  g = Math.min(s * h / (20 * d), p * h / (20 * n), 1),
                  f = {
                    x: (s - 20 * d * g) / 2,
                    y: c + (p - 20 * n * g) / 2
                  },
                  m = l().zoom,
                  y = {
                    ...l().offset
                  };
                  t({
                    zoom: g,
                    offset: f
                  });
                  {
                    let e = new CustomEvent(
                      'pixel-bead-viewport-transition',
                      {
                        detail: {
                          startZoom: m,
                          startOffset: y,
                          targetZoom: g,
                          targetOffset: f
                        }
                      }
                    );
                    window.dispatchEvent(e)
                  }
                },
                toggleGrid: () => t(e => ({
                  showGrid: !e.showGrid
                })),
                setGridColor: e => t({
                  gridColor: e
                }),
                setGridThickness: e => t({
                  gridThickness: e
                }),
                setGridColorBold: e => t({
                  gridColorBold: e
                }),
                setGridThicknessBold: e => t({
                  gridThicknessBold: e
                }),
                toggleSymbols: () => t(e => ({
                  showSymbols: !e.showSymbols
                })),
                setShowViewportHud: e => t({
                  showViewportHud: e
                }),
                toggleViewportHud: () => t(e => ({
                  showViewportHud: !e.showViewportHud
                })),
                setProcessing: (e, l) => t({
                  isProcessing: e,
                  processingText: l ||
                  null
                }),
                cancelProcessing: () => {
                  g &&
                  (g.terminate(), g = null),
                  f++,
                  h &&
                  (clearTimeout(h), h = null);
                  let e = l(),
                  i = e.processedPixels;
                  if (i && i.length > 0 && i[0]?.length > 0) {
                    let l = i[0].length,
                    r = i.length;
                    t({
                      isProcessing: !1,
                      processingText: null,
                      options: {
                        ...e.options,
                        width: l,
                        height: r
                      }
                    })
                  } else t({
                    isProcessing: !1,
                    processingText: null
                  })
                },
                removeBackground: async() => {
                  let {
                    imageSource: r,
                    imageData: a
                  }
                  = l();
                  if (r && a) {
                    t({
                      isRemovingBackground: !0,
                      removalProgress: 0
                    });
                    try {
                      let {
                        removeBackground: s
                      }
                      = await e.A(90497),
                      o = await s(
                        r,
                        {
                          progress: (e, l, i) => {
                            let r = Math.round(l / i * 100);
                            t({
                              removalProgress: r
                            })
                          },
                          device: 'gpu',
                          model: 'isnet_fp16'
                        }
                      ),
                      n = new FileReader;
                      n.onload = () => {
                        let e = n.result,
                        r = new Image;
                        r.onload = () => {
                          let e = document.createElement('canvas');
                          e.width = r.width,
                          e.height = r.height;
                          let s = e.getContext('2d');
                          if (s) {
                            s.drawImage(r, 0, 0);
                            let o = s.getImageData(0, 0, r.width, r.height),
                            n = (0, i.fixInteriorTransparency) (o, a);
                            s.putImageData(n, 0, 0);
                            let d = e.toDataURL();
                            l().pushHistory(),
                            t({
                              imageSource: d,
                              imageData: n,
                              isRemovingBackground: !1,
                              removalProgress: 0
                            }),
                            l().processImage()
                          }
                        },
                        r.src = e
                      },
                      n.readAsDataURL(o)
                    } catch (e) {
                      console.error('[PixelBead AI] 抠图过程发生错误:', e),
                      t({
                        isRemovingBackground: !1,
                        removalProgress: 0
                      })
                    }
                  }
                },
                setToolbarPosition: e => {
                  e &&
                  (isNaN(e.x) || isNaN(e.y) || Math.abs(e.x) > 10000 || Math.abs(e.y) > 10000) ? console.warn('[PixelBead Store] 检测到异常坐标，已忽略:', e) : t({
                    toolbarPosition: e
                  })
                },
                setSidebarOpen: t => {
                  let {
                    useEditorUiStore: l
                  }
                  = e.r(97260);
                  l.getState().setSidebarOpen(t)
                },
                toggleSidebar: () => {
                  let {
                    useEditorUiStore: t
                  }
                  = e.r(97260);
                  t.getState().toggleSidebar()
                },
                setLightboardMode: e => t({
                  isLightboardMode: e
                }),
                setPhysicalBeadSize: e => t({
                  physicalBeadSize: e
                }),
                setCalibrationPpi: e => t({
                  calibrationPpi: e
                }),
                setLightboardLocked: e => t({
                  isLightboardLocked: e
                }),
                setViewportLocked: e => t({
                  isViewportLocked: e
                }),
                openShareModal: (t, l) => {
                  let {
                    useEditorUiStore: i
                  }
                  = e.r(97260);
                  i.getState().openShareModal(t, l)
                },
                closeShareModal: () => {
                  let {
                    useEditorUiStore: t
                  }
                  = e.r(97260);
                  t.getState().closeShareModal()
                },
                loadShareData: e => {
                  let {
                    id: l,
                    pixels: i,
                    width: a,
                    height: s,
                    paletteId: n,
                    stickers: d,
                    projectName: c,
                    authorName: p
                  }
                  = e,
                  h = n ||
                  'mard',
                  g = r.ALL_PALETTES[h] ||
                  r.ALL_PALETTES.mard,
                  f = new Map;
                  g.colors.forEach(e => {
                    f.set(e.id, e)
                  });
                  let m = i.map(e => e.map(e => e && f.get(e) || null)),
                  y = new Map;
                  m.forEach(e => {
                    e.forEach(e => {
                      e &&
                      y.set(e.id, (y.get(e.id) || 0) + 1)
                    })
                  });
                  let x = '',
                  w = null;
                  if ('u' > typeof document) {
                    let e = document.createElement('canvas');
                    e.width = a,
                    e.height = s;
                    let t = e.getContext('2d');
                    if (t) {
                      t.clearRect(0, 0, a, s);
                      for (let e = 0; e < s; e++) for (let l = 0; l < a; l++) {
                        let i = m[e]?.[l];
                        i &&
                        (t.fillStyle = i.hex, t.fillRect(l, e, 1, 1))
                      }
                      x = e.toDataURL('image/png'),
                      w = t.getImageData(0, 0, a, s)
                    }
                  }
                  t(
                    e => {
                      let t = new o.Drawing({
                        id: l ? String(l) : void 0,
                        title: c ||
                        (0, u.t) ('library.untitledDrawing'),
                        paletteId: n,
                        width: a,
                        height: s,
                        pixelCount: Array.from(y.values()).reduce((e, t) => e + t, 0),
                        gridData: m,
                        stickers: d ||
                        [],
                        options: {
                          ...e.options,
                          width: a,
                          height: s,
                          paletteId: n,
                          projectName: c ||
                          (0, u.t) ('library.untitledDrawing'),
                          authorName: p ||
                          (0, u.t) ('appMine.defaultUsername')
                        }
                      });
                      return {
                        currentDrawing: t,
                        drawingId: l ||
                        null,
                        imageSource: x ||
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                        imageData: w,
                        processedPixels: m,
                        templatePixels: m.map(e => [...e]),
                        stats: y,
                        templateStats: new Map(y),
                        statsPaletteId: n,
                        options: t.options,
                        layers: [
                          {
                            id: 'layer_bg',
                            name: (0, u.t) ('layersPanel.background'),
                            pixels: m.map(e => [...e]),
                            visible: !0,
                            opacity: 1
                          }
                        ],
                        activeLayerId: 'layer_bg',
                        stickers: d ||
                        [],
                        selectedStickerId: null,
                        history: [],
                        future: []
                      }
                    }
                  )
                },
                setCurrentDrawing: e => {
                  if (!e) return void t({
                    currentDrawing: null,
                    drawingId: null,
                    processedPixels: null,
                    templatePixels: null,
                    stats: null,
                    templateStats: null,
                    statsPaletteId: null,
                    stickers: [],
                    options: {
                      ...l().options,
                      projectName: '',
                      width: 52,
                      height: 52,
                      paletteId: 'mard'
                    },
                    imageSource: null,
                    imageData: null,
                    history: [],
                    future: []
                  });
                  let i = new Map;
                  e.gridData.forEach(e => {
                    e.forEach(e => {
                      e &&
                      i.set(e.id, (i.get(e.id) || 0) + 1)
                    })
                  });
                  let r = '',
                  a = null,
                  s = e.width,
                  o = e.height;
                  if ('u' > typeof document) {
                    let t = document.createElement('canvas');
                    t.width = s,
                    t.height = o;
                    let l = t.getContext('2d');
                    if (l) {
                      l.clearRect(0, 0, s, o);
                      for (let t = 0; t < o; t++) for (let i = 0; i < s; i++) {
                        let r = e.gridData[t]?.[i];
                        r &&
                        (l.fillStyle = r.hex, l.fillRect(i, t, 1, 1))
                      }
                      r ||
                      (r = t.toDataURL('image/png')),
                      a = l.getImageData(0, 0, s, o)
                    }
                  }
                  t({
                    currentDrawing: e,
                    drawingId: e.id ? isNaN(Number(e.id)) ? null : Number(e.id) : null,
                    imageSource: r ||
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                    imageData: a,
                    processedPixels: e.gridData,
                    templatePixels: e.gridData.map(e => [...e]),
                    stats: i,
                    templateStats: new Map(i),
                    statsPaletteId: e.paletteId,
                    layers: [
                      {
                        id: 'layer_bg',
                        name: (0, u.t) ('layersPanel.background'),
                        pixels: e.gridData.map(e => [...e]),
                        visible: !0,
                        opacity: 1
                      }
                    ],
                    activeLayerId: 'layer_bg',
                    options: e.options ||
                    {
                      ...l().options,
                      width: s,
                      height: o,
                      paletteId: e.paletteId,
                      projectName: e.title,
                      authorName: d.useAuthStore.getState().user &&
                      e.createdBy === d.useAuthStore.getState().user?.id ? d.useAuthStore.getState().user?.username ||
                      'Designer' : (0, u.t) ('appMine.defaultUsername')
                    },
                    stickers: e.stickers ||
                    [],
                    selectedStickerId: null,
                    history: [],
                    future: []
                  })
                },
                setAppActiveTab: t => {
                  let {
                    useAppTabStore: l
                  }
                  = e.r(15353);
                  l.getState().setAppActiveTab(t)
                },
                setReferenceImage: e => {
                  t({
                    referenceImage: e,
                    referenceOffset: {
                      x: 0,
                      y: 0
                    },
                    referenceScale: 1
                  }),
                  e ? i.idbStore.set('pixel-bead-reference-image-raw', e).catch(e => {
                    console.warn('[PixelBead Store] 保存参考图失败:', e)
                  }) : i.idbStore.remove('pixel-bead-reference-image-raw').catch(e => {
                    console.warn('[PixelBead Store] 删除参考图失败:', e)
                  })
                },
                setReferenceOpacity: e => t({
                  referenceOpacity: e
                }),
                setOverlayBeadOpacity: e => t({
                  overlayBeadOpacity: e
                }),
                setOverlayTextOpacity: e => t({
                  overlayTextOpacity: e
                }),
                setReferenceMode: e => t({
                  referenceMode: e
                }),
                setReferenceFitMode: e => t({
                  referenceFitMode: e,
                  referenceOffset: {
                    x: 0,
                    y: 0
                  },
                  referenceScale: 1
                }),
                setReferenceOffset: e => t({
                  referenceOffset: e
                }),
                setReferenceScale: e => t({
                  referenceScale: e
                }),
                resetReferenceTransform: () => t({
                  referenceOffset: {
                    x: 0,
                    y: 0
                  },
                  referenceScale: 1
                }),
                hydrateCustomPalettes: async() => {
                  try {
                    let e = await i.idbStore.get('pixel-bead-custom-palettes');
                    if (e) {
                      t({
                        customPalettes: e
                      });
                      let i = l().options.paletteId;
                      if (i && i.startsWith('custom_')) {
                        let r = e.find(e => e.id === i);
                        if (r) {
                          let e = new Map;
                          r.colors.forEach(t => e.set(t.id, t));
                          let i = l().processedPixels;
                          if (i) {
                            let l = i.map(t => t.map(t => t ? e.get(t.id) ||
                            t : null));
                            t({
                              processedPixels: l
                            })
                          }
                          let a = l().templatePixels;
                          if (a) {
                            let l = a.map(t => t.map(t => t ? e.get(t.id) ||
                            t : null));
                            t({
                              templatePixels: l
                            })
                          }
                          let s = l().layers;
                          if (s) {
                            let l = s.map(
                              t => {
                                let l = t.pixels.map(t => t.map(t => t ? e.get(t.id) ||
                                t : null));
                                return {
                                  ...t,
                                  pixels: l
                                }
                              }
                            );
                            t({
                              layers: l
                            })
                          }
                        }
                        l().processImage()
                      }
                    }
                  } catch (e) {
                    console.warn('[PixelBead Store] 初始化自定义色卡失败:', e)
                  }
                },
                addCustomPalette: (e, r) => {
                  let a = 'custom_' + Date.now(),
                  s = new n.Palette({
                    id: a,
                    name: e,
                    colors: r,
                    brand: 'Custom',
                    type: 'Mixed Subset',
                    region: 'custom'
                  }),
                  o = [
                    ...l().customPalettes,
                    s
                  ];
                  return t({
                    customPalettes: o
                  }),
                  i.idbStore.set('pixel-bead-custom-palettes', o).catch(e => {
                    console.warn('[PixelBead Store] 保存自定义色卡失败:', e)
                  }),
                  a
                },
                deleteCustomPalette: e => {
                  let r = l().customPalettes.filter(t => t.id !== e);
                  t({
                    customPalettes: r
                  }),
                  i.idbStore.set('pixel-bead-custom-palettes', r).catch(e => {
                    console.warn('[PixelBead Store] 删除自定义色卡失败:', e)
                  }),
                  l().options.paletteId === e &&
                  l().updateOptions({
                    paletteId: 'mard'
                  })
                },
                updateCustomPalette: (e, r, a) => {
                  let s = l().customPalettes.map(t => t.id === e ? new n.Palette({
                    ...t,
                    name: r,
                    colors: a
                  }) : t);
                  t({
                    customPalettes: s
                  }),
                  i.idbStore.set('pixel-bead-custom-palettes', s).catch(e => {
                    console.warn('[PixelBead Store] 更新自定义色卡失败:', e)
                  }),
                  l().options.paletteId === e &&
                  l().processImage()
                },
                getPalette: e => {
                  let {
                    customPalettes: t
                  }
                  = l();
                  if (e && e.startsWith('custom_')) {
                    let l = t.find(t => t.id === e);
                    if (l) return l
                  }
                  return r.ALL_PALETTES[e] ||
                  r.ALL_PALETTES.mard
                },
                resizeCanvasGrid: (e, i, r = 'center') => {
                  let {
                    processedPixels: a,
                    templatePixels: s,
                    options: o,
                    pushHistory: n,
                    zoom: d,
                    offset: c
                  }
                  = l();
                  if (!a) return;
                  let u = a.length,
                  p = a[0]?.length ||
                  0;
                  if (e <= 0 || i <= 0) return;
                  n();
                  let h = 0,
                  g = 0;
                  'top-left' === r ? (h = 0, g = 0) : 'top-center' === r ? (h = Math.floor((e - p) / 2), g = 0) : 'top-right' === r ? (h = e - p, g = 0) : 'middle-left' === r ? (h = 0, g = Math.floor((i - u) / 2)) : 'center' === r ? (h = Math.floor((e - p) / 2), g = Math.floor((i - u) / 2)) : 'middle-right' === r ? (h = e - p, g = Math.floor((i - u) / 2)) : 'bottom-left' === r ? (h = 0, g = i - u) : 'bottom-center' === r ? (h = Math.floor((e - p) / 2), g = i - u) : 'bottom-right' === r &&
                  (h = e - p, g = i - u);
                  let f = Array.from({
                    length: i
                  }, () => Array(e).fill(null)),
                  m = Array.from({
                    length: i
                  }, () => Array(e).fill(null));
                  for (let t = 0; t < u; t++) for (let l = 0; l < p; l++) {
                    let r = l + h,
                    o = t + g;
                    r >= 0 &&
                    r < e &&
                    o >= 0 &&
                    o < i &&
                    (
                      a[t]?.[l] &&
                      (f[o][r] = {
                        ...a[t][l]
                      }),
                      s &&
                      s[t]?.[l] &&
                      (m[o][r] = {
                        ...s[t][l]
                      })
                    )
                  }
                  let {
                    layers: y
                  }
                  = l(),
                  x = (y || []).map(
                    t => {
                      let l = Array.from({
                        length: i
                      }, () => Array(e).fill(null));
                      for (let r = 0; r < u; r++) for (let a = 0; a < p; a++) {
                        let s = a + h,
                        o = r + g;
                        s >= 0 &&
                        s < e &&
                        o >= 0 &&
                        o < i &&
                        t.pixels[r]?.[a] &&
                        (l[o][s] = {
                          ...t.pixels[r][a]
                        })
                      }
                      return {
                        ...t,
                        pixels: l
                      }
                    }
                  ),
                  w = new Map;
                  f.forEach(e => {
                    e.forEach(e => {
                      e &&
                      w.set(e.id, (w.get(e.id) || 0) + 1)
                    })
                  });
                  let S = new Map;
                  m &&
                  m.forEach(e => {
                    e.forEach(e => {
                      e &&
                      S.set(e.id, (S.get(e.id) || 0) + 1)
                    })
                  });
                  let b = 20 * d,
                  A = h * b,
                  P = g * b;
                  t({
                    processedPixels: f,
                    templatePixels: m,
                    stats: w,
                    templateStats: S,
                    offset: {
                      x: c.x - A,
                      y: c.y - P
                    },
                    layers: x,
                    options: {
                      ...o,
                      width: e,
                      height: i
                    }
                  })
                },
                openCustomPaletteModal: (t, l) => {
                  let {
                    useEditorUiStore: i
                  }
                  = e.r(97260);
                  i.getState().openCustomPaletteModal(t, l)
                },
                closeCustomPaletteModal: () => {
                  let {
                    useEditorUiStore: t
                  }
                  = e.r(97260);
                  t.getState().closeCustomPaletteModal()
                },
                addLayer: () => {
                  let {
                    layers: e,
                    options: i,
                    pushHistory: r
                  }
                  = l(),
                  a = e &&
                  e.length > 0 ? e : l().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: (0, u.t) ('layersPanel.background'),
                      pixels: l().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [];
                  r();
                  let s = 'layer_' + Date.now(),
                  o = {
                    id: s,
                    name: `${ (0, u.t) ('layersPanel.addLayer') } ${ a.length + 1 }`,
                    pixels: Array.from({
                      length: i.height
                    }, () => Array(i.width).fill(null)),
                    visible: !0,
                    opacity: 1
                  };
                  t({
                    layers: [
                      ...a,
                      o
                    ],
                    activeLayerId: s
                  })
                },
                deleteLayer: e => {
                  let {
                    layers: i,
                    activeLayerId: r,
                    pushHistory: a,
                    options: s
                  }
                  = l(),
                  o = i &&
                  i.length > 0 ? i : [];
                  if (o.length <= 1) return;
                  a();
                  let n = o.filter(t => t.id !== e),
                  d = r;
                  if (r === e) {
                    let t = Math.max(0, o.findIndex(t => t.id === e) - 1);
                    d = n[t]?.id ||
                    n[0].id
                  }
                  let c = m(n, s.width, s.height),
                  u = p(c);
                  t({
                    layers: n,
                    activeLayerId: d,
                    processedPixels: c,
                    stats: u
                  })
                },
                duplicateLayer: e => {
                  let {
                    layers: i,
                    pushHistory: r,
                    options: a
                  }
                  = l(),
                  s = i &&
                  i.length > 0 ? i : [],
                  o = s.find(t => t.id === e);
                  if (!o) return;
                  r();
                  let n = 'layer_' + Date.now(),
                  d = {
                    id: n,
                    name: `${ o.name } 拷贝`,
                    pixels: o.pixels.map(e => e.map(e => e ? {
                      ...e
                    }
                     : null)),
                    visible: o.visible,
                    opacity: o.opacity
                  },
                  c = s.findIndex(t => t.id === e),
                  u = [
                    ...s
                  ];
                  u.splice(c + 1, 0, d);
                  let h = m(u, a.width, a.height),
                  g = p(h);
                  t({
                    layers: u,
                    activeLayerId: n,
                    processedPixels: h,
                    stats: g
                  })
                },
                setActiveLayerId: e => t({
                  activeLayerId: e
                }),
                toggleLayerVisibility: e => {
                  let {
                    layers: i,
                    options: r
                  }
                  = l(),
                  a = (
                    i &&
                    i.length > 0 ? i : l().processedPixels ? [
                      {
                        id: 'layer_bg',
                        name: '背景图层',
                        pixels: l().processedPixels.map(e => [...e]),
                        visible: !0,
                        opacity: 1
                      }
                    ] : []
                  ).map(t => t.id === e ? {
                    ...t,
                    visible: !t.visible
                  }
                   : t),
                  s = m(a, r.width, r.height),
                  o = p(s);
                  t({
                    layers: a,
                    processedPixels: s,
                    stats: o
                  })
                },
                setLayerOpacity: (e, i) => {
                  let {
                    layers: r,
                    options: a
                  }
                  = l(),
                  s = (
                    r &&
                    r.length > 0 ? r : l().processedPixels ? [
                      {
                        id: 'layer_bg',
                        name: '背景图层',
                        pixels: l().processedPixels.map(e => [...e]),
                        visible: !0,
                        opacity: 1
                      }
                    ] : []
                  ).map(t => t.id === e ? {
                    ...t,
                    opacity: Math.max(0, Math.min(1, i))
                  }
                   : t),
                  o = m(s, a.width, a.height),
                  n = p(o);
                  t({
                    layers: s,
                    processedPixels: o,
                    stats: n
                  })
                },
                setLayerName: (e, i) => {
                  let {
                    layers: r
                  }
                  = l();
                  t({
                    layers: (r && r.length > 0 ? r : []).map(t => t.id === e ? {
                      ...t,
                      name: i
                    }
                     : t)
                  })
                },
                reorderLayer: (e, i) => {
                  let {
                    layers: r,
                    pushHistory: a,
                    options: s
                  }
                  = l(),
                  o = r &&
                  r.length > 0 ? r : [];
                  if (o.length <= 1) return;
                  let n = o.findIndex(t => t.id === e);
                  if ( - 1 === n || 'up' === i && n === o.length - 1 || 'down' === i && 0 === n) return;
                  a();
                  let d = [
                    ...o
                  ],
                  [
                    c
                  ] = d.splice(n, 1);
                  d.splice('up' === i ? n + 1 : n - 1, 0, c);
                  let u = m(d, s.width, s.height),
                  h = p(u);
                  t({
                    layers: d,
                    processedPixels: u,
                    stats: h
                  })
                },
                mergeLayerDown: e => {
                  let {
                    layers: i,
                    pushHistory: r,
                    options: a
                  }
                  = l(),
                  s = i &&
                  i.length > 0 ? i : [];
                  if (s.length <= 1) return;
                  let o = s.findIndex(t => t.id === e);
                  if (o <= 0) return;
                  r();
                  let n = s[o],
                  d = s[o - 1],
                  c = d.pixels.map(
                    (e, t) => e.map((e, l) => {
                      let i = n.pixels[t]?.[l];
                      return i ? {
                        ...i
                      }
                       : e ? {
                        ...e
                      }
                       : null
                    })
                  ),
                  u = {
                    ...d,
                    name: `${ d.name } + 合并`,
                    pixels: c
                  },
                  h = [
                    ...s
                  ];
                  h.splice(o - 1, 2, u);
                  let g = m(h, a.width, a.height),
                  f = p(g);
                  t({
                    layers: h,
                    activeLayerId: u.id,
                    processedPixels: g,
                    stats: f
                  })
                }
              })
            ) (...s),
            ...(
              (t, l) => ({
                activeTool: 'hand',
                brushColor: null,
                highlightColorId: null,
                dimmedBeadOpacity: 0.3,
                mobileAppMode: 'none',
                eyedropperTarget: 'brush',
                setActiveTool: e => t({
                  activeTool: e
                }),
                setBrushColor: e => t({
                  brushColor: e
                }),
                setHighlightColor: e => t({
                  highlightColorId: e
                }),
                setDimmedBeadOpacity: e => t({
                  dimmedBeadOpacity: e
                }),
                setComparing: l => {
                  let {
                    useEditorUiStore: i
                  }
                  = e.r(97260);
                  i.getState().setComparing(l),
                  t({
                    isComparing: l
                  })
                },
                setMobileAppMode: t => {
                  let {
                    useEditorUiStore: l
                  }
                  = e.r(97260);
                  l.getState().setMobileAppMode(t)
                },
                setEyedropperTarget: e => t({
                  eyedropperTarget: e
                }),
                editPixel: (e, i, r) => {
                  let {
                    layers: a,
                    activeLayerId: s,
                    selectionMask: o,
                    options: n
                  }
                  = l(),
                  d = a &&
                  a.length > 0 ? a : l().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: l().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [],
                  c = s ||
                  d[0]?.id,
                  u = d.find(e => e.id === c);
                  if (!u || o && !o.has(`${ e },${ i }`)) return;
                  let h = u.pixels,
                  g = h.length,
                  f = h[0]?.length ||
                  0;
                  if (e < 0 || e >= f || i < 0 || i >= g) return;
                  let y = h[i][e];
                  if (y?.id === r?.id) return;
                  let x = h.map(e => [...e]);
                  x[i][e] = r ? {
                    ...r
                  }
                   : null;
                  let w = d.map(e => e.id === c ? {
                    ...e,
                    pixels: x
                  }
                   : e),
                  S = m(w, n.width, n.height),
                  b = p(S);
                  t({
                    layers: w,
                    activeLayerId: c,
                    processedPixels: S,
                    stats: b
                  })
                },
                fillPixel: (e, i, r, a = !1) => {
                  let {
                    layers: s,
                    activeLayerId: o,
                    selectionMask: n,
                    options: d
                  }
                  = l(),
                  c = s &&
                  s.length > 0 ? s : l().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: l().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [],
                  u = o ||
                  c[0]?.id,
                  h = c.find(e => e.id === u);
                  if (!h || n && !n.has(`${ e },${ i }`)) return;
                  let g = h.pixels,
                  f = g.length,
                  y = g[0]?.length ||
                  0;
                  if (e < 0 || e >= y || i < 0 || i >= f) return;
                  let x = g[i][e],
                  w = x?.id ?? null;
                  if (w === (r?.id ?? null)) return;
                  a ||
                  l().pushHistory();
                  let S = g.map(e => [...e]),
                  b = [
                    [e,
                    i]
                  ],
                  A = new Uint8Array(f * y);
                  for (A[i * y + e] = 1; b.length > 0; ) {
                    let[e,
                    t] = b.shift();
                    for (
                      let[l,
                      i]of (S[t][e] = r ? {
                        ...r
                      }
                       : null, [
                        [0,
                        1],
                        [
                          0,
                          - 1
                        ],
                        [
                          1,
                          0
                        ],
                        [
                          - 1,
                          0
                        ]
                      ])
                    ) {
                      let r = e + l,
                      a = t + i;
                      if (r >= 0 && r < y && a >= 0 && a < f) {
                        let e = a * y + r;
                        if (0 === A[e]) {
                          let t = S[a][r];
                          if ((t?.id ?? null) === w) {
                            if (n && !n.has(`${ r },${ a }`)) continue;
                            A[e] = 1,
                            b.push([r,
                            a])
                          }
                        }
                      }
                    }
                  }
                  let P = c.map(e => e.id === u ? {
                    ...e,
                    pixels: S
                  }
                   : e),
                  I = m(P, d.width, d.height),
                  M = p(I);
                  t({
                    layers: P,
                    activeLayerId: u,
                    processedPixels: I,
                    stats: M
                  })
                },
                replaceColor: (e, i, r, a = !1) => {
                  let {
                    layers: s,
                    activeLayerId: o,
                    selectionMask: n,
                    options: d
                  }
                  = l(),
                  c = s &&
                  s.length > 0 ? s : l().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: l().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [],
                  u = o ||
                  c[0]?.id,
                  h = c.find(e => e.id === u);
                  if (!h) return;
                  let g = h.pixels,
                  f = g.length,
                  y = g[0]?.length ||
                  0;
                  if (e < 0 || e >= y || i < 0 || i >= f) return;
                  let x = g[i][e],
                  w = x?.id ?? null;
                  if (w === (r?.id ?? null)) return;
                  a ||
                  l().pushHistory();
                  let S = g.map(e => [...e]);
                  for (let e = 0; e < f; e++) for (let t = 0; t < y; t++) {
                    if (n && !n.has(`${ t },${ e }`)) continue;
                    let l = S[e][t];
                    (l?.id ?? null) === w &&
                    (S[e][t] = r ? {
                      ...r
                    }
                     : null)
                  }
                  let b = c.map(e => e.id === u ? {
                    ...e,
                    pixels: S
                  }
                   : e),
                  A = m(b, d.width, d.height),
                  P = p(A);
                  t({
                    layers: b,
                    activeLayerId: u,
                    processedPixels: A,
                    stats: P
                  })
                },
                mergeColors: async(e, i) => {
                  let {
                    layers: r,
                    stats: a,
                    options: s
                  }
                  = l(),
                  o = r &&
                  r.length > 0 ? r : [];
                  if (0 === o.length || !a || 0 === e.length) return;
                  let n = i?.id ?? null;
                  if (e.some(e => e !== n)) {
                    l().pushHistory();
                    try {
                      let {
                        nextLayers: l
                      }
                      = await I.execute(
                        'MERGE_COLORS',
                        {
                          layers: o,
                          sourceColorIds: e,
                          targetColor: i,
                          cols: s.width,
                          rows: s.height
                        }
                      ),
                      r = m(l, s.width, s.height),
                      a = p(r);
                      t({
                        layers: l,
                        processedPixels: r,
                        stats: a
                      })
                    } catch {
                      let l = o.map(
                        t => {
                          let l = t.pixels.map(
                            t => t.map(
                              t => {
                                let l = t?.id ?? null;
                                return l &&
                                e.includes(l) &&
                                l !== n ? i ? {
                                  ...i
                                }
                                 : null : t
                              }
                            )
                          );
                          return {
                            ...t,
                            pixels: l
                          }
                        }
                      ),
                      r = m(l, s.width, s.height),
                      a = p(r);
                      t({
                        layers: l,
                        processedPixels: r,
                        stats: a
                      })
                    }
                  }
                },
                snapToDominantColor: e => {
                  let {
                    layers: i,
                    stats: a,
                    options: s
                  }
                  = l(),
                  o = i &&
                  i.length > 0 ? i : [];
                  if (0 === o.length || !a || 0 === a.size) return;
                  let n = Array.from(a.entries()),
                  d = n.filter(([t,
                  l]) => l > e),
                  c = n.filter(([t,
                  l]) => l <= e);
                  if (0 === d.length && n.length > 0) {
                    let e = n.reduce((e, t) => t[1] > e[1] ? t : e, n[0]);
                    if (e) {
                      d.push(e);
                      let t = c.findIndex(([t]) => t === e[0]);
                      - 1 !== t &&
                      c.splice(t, 1)
                    }
                  }
                  if (0 === d.length || 0 === c.length) return;
                  l().pushHistory();
                  let u = l().statsPaletteId ||
                  l().options.paletteId ||
                  'mard',
                  h = r.ALL_PALETTES[u] ||
                  r.ALL_PALETTES.mard,
                  g = new Map;
                  h.colors.forEach(e => {
                    g.set(e.id, e)
                  });
                  let f = e => (0, w.rgbToLab) ({
                    r: e.r,
                    g: e.g,
                    b: e.b
                  }),
                  y = d.map(([e]) => {
                    let t = g.get(e);
                    return {
                      id: e,
                      color: t,
                      lab: t ? f(t) : null
                    }
                  }).filter(e => e.color && e.lab);
                  if (0 === y.length) return;
                  let x = new Map;
                  for (let[e]of c) {
                    let t = g.get(e);
                    if (!t) continue;
                    let l = f(t),
                    i = 1 / 0,
                    r = null;
                    for (let e of y) {
                      if (!e.lab || !e.color) continue;
                      let t = (0, w.deltaE2000) (l, e.lab);
                      t < i &&
                      (i = t, r = e.color)
                    }
                    r &&
                    x.set(e, r)
                  }
                  if (0 === x.size) return;
                  let S = o.map(
                    e => {
                      let t = e.pixels.map(
                        e => e.map(
                          e => {
                            if (e && x.has(e.id)) {
                              let t = x.get(e.id);
                              return t ? {
                                ...t
                              }
                               : null
                            }
                            return e
                          }
                        )
                      );
                      return {
                        ...e,
                        pixels: t
                      }
                    }
                  ),
                  b = m(S, s.width, s.height),
                  A = p(b);
                  t({
                    layers: S,
                    processedPixels: b,
                    stats: A
                  })
                },
                reducePaletteColors: e => {
                  let {
                    stats: i,
                    layers: a,
                    options: s,
                    statsPaletteId: o
                  }
                  = l(),
                  n = a &&
                  a.length > 0 ? a : [];
                  if (!i || 0 === i.size || 0 === n.length) return;
                  let d = o ||
                  s.paletteId ||
                  'mard',
                  {
                    colorMapping: c,
                    mergedCount: u
                  }
                  = A({
                    paletteColors: (r.ALL_PALETTES[d] || r.ALL_PALETTES.mard).colors ||
                    [],
                    colorUsageStats: i,
                    targetCount: e
                  });
                  if (u <= 0 || 0 === c.size) return;
                  l().pushHistory();
                  let h = n.map(
                    e => {
                      let t = e.pixels.map(
                        e => e.map(
                          e => {
                            if (e && c.has(e.id)) {
                              let t = c.get(e.id);
                              return t ? {
                                ...t
                              }
                               : null
                            }
                            return e
                          }
                        )
                      );
                      return {
                        ...e,
                        pixels: t
                      }
                    }
                  ),
                  g = m(h, s.width, s.height),
                  f = p(g);
                  t({
                    layers: h,
                    processedPixels: g,
                    stats: f
                  })
                },
                removeStrayBeads: async() => {
                  let {
                    layers: e,
                    activeLayerId: r,
                    options: a
                  }
                  = l(),
                  s = e &&
                  e.length > 0 ? e : [],
                  o = r ||
                  s[0]?.id,
                  n = s.find(e => e.id === o);
                  if (!n) return;
                  let d = [];
                  try {
                    d = await I.execute('FIND_STRAY_BEADS', {
                      pixels: n.pixels
                    })
                  } catch {
                    d = (0, i.findStrayBeads) (n.pixels)
                  }
                  if (!d || 0 === d.length) return;
                  l().pushHistory();
                  let c = n.pixels.map(e => [...e]);
                  for (let {
                    x: e,
                    y: t
                  }
                  of d) c[t][e] = null;
                  let u = s.map(e => e.id === o ? {
                    ...e,
                    pixels: c
                  }
                   : e),
                  h = m(u, a.width, a.height),
                  g = p(h);
                  t({
                    layers: u,
                    activeLayerId: o,
                    processedPixels: h,
                    stats: g
                  })
                },
                flipHorizontal: () => {
                  let {
                    processedPixels: e,
                    templatePixels: i,
                    stickers: r,
                    layers: a,
                    options: s
                  }
                  = l();
                  if (!e) return;
                  l().pushHistory();
                  let o = e[0]?.length ||
                  0,
                  n = (a && a.length > 0 ? a : []).map(
                    e => {
                      let t = e.pixels.map(e => [...e].reverse());
                      return {
                        ...e,
                        pixels: t
                      }
                    }
                  ),
                  d = m(n, s.width, s.height),
                  c = p(d);
                  t({
                    layers: n,
                    processedPixels: d,
                    stats: c,
                    templatePixels: i ? i.map(e => [...e].reverse()) : null,
                    stickers: r.map(
                      e => {
                        let t = {
                          x: o - e.x,
                          rotation: 0 === e.rotation ? 0 : (360 - e.rotation) % 360
                        },
                        l = e.type;
                        return 'text' === l ? new y.TextSticker({
                          ...e,
                          ...t
                        }) : 'pixel_stamp' === l ? new x.PixelStampSticker({
                          ...e,
                          ...t
                        }) : e
                      }
                    )
                  })
                },
                flipVertical: () => {
                  let {
                    processedPixels: e,
                    templatePixels: i,
                    stickers: r,
                    layers: a,
                    options: s
                  }
                  = l();
                  if (!e) return;
                  l().pushHistory();
                  let o = e.length,
                  n = (a && a.length > 0 ? a : []).map(e => {
                    let t = [
                      ...e.pixels
                    ].reverse();
                    return {
                      ...e,
                      pixels: t
                    }
                  }),
                  d = m(n, s.width, s.height),
                  c = p(d);
                  t({
                    layers: n,
                    processedPixels: d,
                    stats: c,
                    templatePixels: i ? [
                      ...i
                    ].reverse() : null,
                    stickers: r.map(
                      e => {
                        let t = {
                          y: o - e.y,
                          rotation: 0 === e.rotation ? 0 : (360 - e.rotation) % 360
                        },
                        l = e.type;
                        return 'text' === l ? new y.TextSticker({
                          ...e,
                          ...t
                        }) : 'pixel_stamp' === l ? new x.PixelStampSticker({
                          ...e,
                          ...t
                        }) : e
                      }
                    )
                  })
                }
              })
            ) (...s),
            ...R(...s),
            ...(
              (e, t) => ({
                history: [],
                future: [],
                pushHistory: () => {
                  let {
                    processedPixels: l,
                    stats: i,
                    options: r,
                    statsPaletteId: a,
                    history: s,
                    stickers: o,
                    selectedStickerId: n,
                    layers: d,
                    activeLayerId: c
                  }
                  = t();
                  if (!l || !i) return;
                  let u = [
                    ...s,
                    {
                      processedPixels: l.map(e => [...e]),
                      stats: new Map(i),
                      options: {
                        ...r
                      },
                      statsPaletteId: a,
                      stickers: o.map(e => ({
                        ...e
                      })),
                      selectedStickerId: n,
                      layers: d ? d.map(e => ({
                        ...e,
                        pixels: e.pixels.map(e => [...e])
                      })) : [],
                      activeLayerId: c
                    }
                  ].slice( - 50);
                  e({
                    history: u,
                    future: []
                  })
                },
                undo: () => {
                  let {
                    history: l,
                    future: i,
                    processedPixels: r,
                    stats: a,
                    options: s,
                    statsPaletteId: o,
                    stickers: n,
                    selectedStickerId: d,
                    layers: c,
                    activeLayerId: u
                  }
                  = t();
                  if (0 === l.length) return;
                  let p = {
                    processedPixels: r?.map(e => [...e]),
                    stats: a ? new Map(a) : null,
                    options: {
                      ...s
                    },
                    statsPaletteId: o,
                    stickers: n.map(e => ({
                      ...e
                    })),
                    selectedStickerId: d,
                    layers: c ? c.map(e => ({
                      ...e,
                      pixels: e.pixels.map(e => [...e])
                    })) : [],
                    activeLayerId: u
                  },
                  h = l[l.length - 1],
                  g = l.slice(0, - 1);
                  e({
                    ...h,
                    history: g,
                    future: [
                      p,
                      ...i
                    ].slice(0, 50)
                  })
                },
                redo: () => {
                  let {
                    history: l,
                    future: i,
                    processedPixels: r,
                    stats: a,
                    options: s,
                    statsPaletteId: o,
                    stickers: n,
                    selectedStickerId: d,
                    layers: c,
                    activeLayerId: u
                  }
                  = t();
                  if (0 === i.length) return;
                  let p = {
                    processedPixels: r?.map(e => [...e]),
                    stats: a ? new Map(a) : null,
                    options: {
                      ...s
                    },
                    statsPaletteId: o,
                    stickers: n.map(e => ({
                      ...e
                    })),
                    selectedStickerId: d,
                    layers: c ? c.map(e => ({
                      ...e,
                      pixels: e.pixels.map(e => [...e])
                    })) : [],
                    activeLayerId: u
                  },
                  h = i[0],
                  g = i.slice(1);
                  e({
                    ...h,
                    future: g,
                    history: [
                      ...l,
                      p
                    ].slice( - 50)
                  })
                }
              })
            ) (...s),
            ...(
              t => ({
                alertModal: null,
                activeView: 'editor',
                showAlert: t => {
                  let {
                    useEditorUiStore: l
                  }
                  = e.r(97260);
                  l.getState().showAlert(t)
                },
                hideAlert: () => {
                  let {
                    useEditorUiStore: t
                  }
                  = e.r(97260);
                  t.getState().hideAlert()
                },
                setActiveView: e => t({
                  activeView: e
                })
              })
            ) (...s),
            ...(
              (e, t) => ({
                isFocusMode: !1,
                focusColorId: null,
                completedBeads: {
                },
                showFocusCrosshair: !0,
                isLocatorMode: !1,
                focusRulerDirection: (
                  () => {
                    try {
                      if ('u' > typeof localStorage) {
                        let e = localStorage.getItem('pixel_focus_ruler_direction');
                        if ('horizontal' === e || 'vertical' === e) return e
                      }
                    } catch {
                    }
                    return 'horizontal'
                  }
                ) (),
                focusDimmedOpacity: (
                  () => {
                    try {
                      if ('u' > typeof localStorage) {
                        let e = localStorage.getItem('pixel_focus_dimmed_opacity');
                        if (null !== e) {
                          let t = parseFloat(e);
                          if (!isNaN(t) && t >= 0 && t <= 1) return t
                        }
                      }
                    } catch {
                    }
                    return 0.08
                  }
                ) (),
                showUnfocusedSymbols: (
                  () => {
                    try {
                      if ('u' > typeof localStorage) {
                        let e = localStorage.getItem('pixel_focus_show_unfocused_symbols');
                        if (null !== e) return 'true' === e
                      }
                    } catch {
                    }
                    return !1
                  }
                ) (),
                isIroning: !1,
                meltProgress: 0,
                setFocusDimmedOpacity: t => {
                  let l = Math.max(0, Math.min(1, t));
                  try {
                    'u' > typeof localStorage &&
                    localStorage.setItem('pixel_focus_dimmed_opacity', l.toString())
                  } catch {
                  }
                  e({
                    focusDimmedOpacity: l
                  })
                },
                setShowUnfocusedSymbols: t => {
                  try {
                    'u' > typeof localStorage &&
                    localStorage.setItem('pixel_focus_show_unfocused_symbols', String(t))
                  } catch {
                  }
                  e({
                    showUnfocusedSymbols: t
                  })
                },
                toggleShowUnfocusedSymbols: () => {
                  let l = !t().showUnfocusedSymbols;
                  try {
                    'u' > typeof localStorage &&
                    localStorage.setItem('pixel_focus_show_unfocused_symbols', String(l))
                  } catch {
                  }
                  e({
                    showUnfocusedSymbols: l
                  })
                },
                enterFocusMode: () => {
                  j = t().activeTool;
                  let l = t().focusColorId;
                  if (!l) {
                    let e = t().stats;
                    if (e && e.size > 0) {
                      let t = Array.from(e.entries()).sort((e, t) => t[1] - e[1]);
                      l = t[0]?.[0] ||
                      null
                    }
                  }
                  let i = t().currentDrawing;
                  e({
                    isFocusMode: !0,
                    activeTool: 'hand',
                    selectedStickerId: null,
                    focusColorId: l,
                    isIroning: !1,
                    meltProgress: + (i?.options?.status === 'completed')
                  }),
                  setTimeout(() => {
                    t().fitToScreen()
                  }, 100),
                  (0, c.trackEvent) ('enter_focus_mode')
                },
                exitFocusMode: () => {
                  e(
                    e => ({
                      isFocusMode: !1,
                      activeTool: j ||
                      'hand',
                      focusColorId: null,
                      isLocatorMode: !1,
                      focusRulerDirection: 'horizontal',
                      isIroning: !1,
                      meltProgress: 0,
                      pegboardConfig: {
                        ...e.pegboardConfig,
                        enabled: !1,
                        activeSliceIndex: null
                      },
                      isPegboardOverviewOpen: !1
                    })
                  ),
                  setTimeout(() => {
                    t().fitToScreen()
                  }, 100),
                  (0, c.trackEvent) ('exit_focus_mode')
                },
                setFocusColor: t => {
                  e({
                    focusColorId: t
                  })
                },
                toggleBeadComplete: (l, i) => {
                  let r = `${ l },${ i }`,
                  a = {
                    ...t().completedBeads
                  };
                  a[r] ? delete a[r] : a[r] = !0,
                  H.playClick(),
                  e({
                    completedBeads: a
                  })
                },
                batchSetBeadsComplete: (l, i) => {
                  let {
                    processedPixels: r,
                    completedBeads: a,
                    pegboardConfig: s
                  }
                  = t();
                  if (!r) return;
                  let o = {
                    ...a
                  },
                  n = r.length,
                  d = r[0]?.length ||
                  0,
                  c = 0,
                  u = n,
                  p = 0,
                  h = d;
                  if (s?.enabled && null !== s.activeSliceIndex && s.activeSliceIndex >= 0) {
                    let e = s.boardWidth ||
                    26,
                    t = s.boardHeight ||
                    26,
                    l = Math.ceil(d / e),
                    i = Math.floor(s.activeSliceIndex / l),
                    r = s.activeSliceIndex % l;
                    u = Math.min((c = i * t) + t, n),
                    h = Math.min((p = r * e) + e, d)
                  }
                  for (let e = c; e < u; e++) for (let t = p; t < h; t++) {
                    let a = r[e][t];
                    if (a && a.id === l) {
                      let l = `${ t },${ e }`;
                      i ? o[l] = !0 : delete o[l]
                    }
                  }
                  i ? H.playSuccess() : H.playClick(),
                  e({
                    completedBeads: o
                  })
                },
                resetFocusProgress: () => {
                  e({
                    completedBeads: {
                    }
                  })
                },
                toggleFocusCrosshair: () => {
                  e(e => ({
                    showFocusCrosshair: !e.showFocusCrosshair
                  }))
                },
                toggleLocatorMode: () => {
                  e(e => ({
                    isLocatorMode: !e.isLocatorMode
                  }))
                },
                setFocusRulerDirection: t => {
                  try {
                    'u' > typeof localStorage &&
                    localStorage.setItem('pixel_focus_ruler_direction', t)
                  } catch {
                  }
                  e({
                    focusRulerDirection: t
                  })
                },
                startIroning: () => {
                  e({
                    isIroning: !0,
                    meltProgress: 0
                  })
                }
              })
            ) (...s),
            ...(
              (e, t) => ({
                selectionMask: null,
                selectionBox: null,
                selectionFloating: null,
                setSelectionMask: t => e({
                  selectionMask: t
                }),
                setSelectionBox: t => e({
                  selectionBox: t
                }),
                setSelectionFloating: t => e({
                  selectionFloating: t
                }),
                clearSelection: () => {
                  e({
                    selectionMask: null,
                    selectionBox: null,
                    selectionFloating: null
                  })
                },
                deleteSelection: () => {
                  let {
                    selectionMask: l,
                    selectionFloating: i,
                    layers: r,
                    activeLayerId: a,
                    options: s
                  }
                  = t(),
                  o = r &&
                  r.length > 0 ? r : t().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: t().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [],
                  n = a ||
                  o[0]?.id,
                  d = o.find(e => e.id === n);
                  if (!d) return;
                  t().pushHistory();
                  let c = d.pixels.map(e => [...e]),
                  u = c.length,
                  h = c[0]?.length ||
                  0;
                  if (i) {
                    let {
                      pixels: t,
                      startX: l,
                      startY: r,
                      isClone: a
                    }
                    = i;
                    if (!a) {
                      for (let e = 0; e < t.length; e++) for (let i = 0; i < t[e].length; i++) if (t[e][i]) {
                        let t = l + i,
                        a = r + e;
                        t >= 0 &&
                        t < h &&
                        a >= 0 &&
                        a < u &&
                        (c[a][t] = null)
                      }
                    }
                    let d = o.map(e => e.id === n ? {
                      ...e,
                      pixels: c
                    }
                     : e),
                    g = m(d, s.width, s.height),
                    f = p(g);
                    e({
                      layers: d,
                      activeLayerId: n,
                      processedPixels: g,
                      stats: f,
                      selectionMask: null,
                      selectionBox: null,
                      selectionFloating: null
                    });
                    return
                  }
                  if (l && l.size > 0) {
                    for (let e of l) {
                      let[t,
                      l] = e.split(','),
                      i = parseInt(t, 10),
                      r = parseInt(l, 10);
                      c[r] &&
                      void 0 !== c[r][i] &&
                      (c[r][i] = null)
                    }
                    let t = o.map(e => e.id === n ? {
                      ...e,
                      pixels: c
                    }
                     : e),
                    i = m(t, s.width, s.height),
                    r = p(i);
                    e({
                      layers: t,
                      activeLayerId: n,
                      processedPixels: i,
                      stats: r,
                      selectionMask: null,
                      selectionBox: null
                    })
                  }
                },
                rotateSelection: l => {
                  let {
                    selectionFloating: i,
                    selectionBox: r,
                    selectionMask: a,
                    layers: s,
                    activeLayerId: o
                  }
                  = t();
                  if (!r || !a) return;
                  let n = s &&
                  s.length > 0 ? s : t().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: t().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [],
                  d = o ||
                  n[0]?.id,
                  c = n.find(e => e.id === d);
                  if (!c) return;
                  let u = i ||
                  W(r, c.pixels, a),
                  p = (u.rotation + l) % 360,
                  h = r.w,
                  g = r.h;
                  (90 === l || 270 === l) &&
                  (h = r.h, g = r.w);
                  let f = r.x + r.w / 2,
                  m = r.y + r.h / 2,
                  y = Math.round(f - h / 2),
                  x = Math.round(m - g / 2),
                  w = {
                    x: y,
                    y: x,
                    w: h,
                    h: g
                  },
                  S = new Set;
                  for (let e = x; e < x + g; e++) for (let t = y; t < y + h; t++) S.add(`${ t },${ e }`);
                  e({
                    selectionFloating: {
                      ...u,
                      rotation: p
                    },
                    selectionBox: w,
                    selectionMask: S
                  })
                },
                flipSelection: l => {
                  let {
                    selectionFloating: i,
                    selectionBox: r,
                    selectionMask: a,
                    layers: s,
                    activeLayerId: o
                  }
                  = t();
                  if (!r || !a) return;
                  let n = s &&
                  s.length > 0 ? s : t().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: t().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [],
                  d = o ||
                  n[0]?.id,
                  c = n.find(e => e.id === d);
                  if (!c) return;
                  let u = i ||
                  W(r, c.pixels, a),
                  p = 'horizontal' === l ? !u.flipX : u.flipX,
                  h = 'vertical' === l ? !u.flipY : u.flipY;
                  e({
                    selectionFloating: {
                      ...u,
                      flipX: p,
                      flipY: h
                    }
                  })
                },
                commitSelectionFloating: () => {
                  let {
                    selectionFloating: l,
                    selectionBox: i,
                    layers: r,
                    activeLayerId: a,
                    options: s
                  }
                  = t();
                  if (!l || !i) return void e({
                    selectionMask: null,
                    selectionBox: null,
                    selectionFloating: null
                  });
                  t().pushHistory();
                  let o = r &&
                  r.length > 0 ? r : t().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: t().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [],
                  n = a ||
                  o[0]?.id,
                  d = o.find(e => e.id === n);
                  if (!d) return;
                  let {
                    pixels: c,
                    startX: u,
                    startY: h,
                    isClone: g,
                    rotation: f,
                    flipX: y,
                    flipY: x
                  }
                  = l,
                  w = d.pixels.map(e => [...e]),
                  S = w.length,
                  b = w[0]?.length ||
                  0;
                  if (!g) {
                    for (let e = 0; e < c.length; e++) for (let t = 0; t < c[e].length; t++) if (c[e][t]) {
                      let l = u + t,
                      i = h + e;
                      l >= 0 &&
                      l < b &&
                      i >= 0 &&
                      i < S &&
                      (w[i][l] = null)
                    }
                  }
                  let A = U(c, f, y, x),
                  P = i.x,
                  I = i.y;
                  for (let e = 0; e < A.length; e++) for (let t = 0; t < A[e].length; t++) {
                    let l = A[e][t],
                    i = P + t,
                    r = I + e;
                    i >= 0 &&
                    i < b &&
                    r >= 0 &&
                    r < S &&
                    (w[r][i] = l)
                  }
                  let M = o.map(e => e.id === n ? {
                    ...e,
                    pixels: w
                  }
                   : e),
                  v = m(M, s.width, s.height),
                  C = p(v);
                  e({
                    layers: M,
                    activeLayerId: n,
                    processedPixels: v,
                    stats: C,
                    selectionMask: null,
                    selectionBox: null,
                    selectionFloating: null
                  })
                },
                copySelection: () => {
                  let l,
                  {
                    selectionBox: i,
                    selectionFloating: r,
                    selectionMask: a,
                    layers: s,
                    activeLayerId: o,
                    options: n
                  }
                  = t();
                  if (!i || !a) return;
                  let d = s &&
                  s.length > 0 ? s : t().processedPixels ? [
                    {
                      id: 'layer_bg',
                      name: '背景图层',
                      pixels: t().processedPixels.map(e => [...e]),
                      visible: !0,
                      opacity: 1
                    }
                  ] : [],
                  c = o ||
                  d[0]?.id,
                  u = d.find(e => e.id === c);
                  if (!u) return;
                  let h = i.x,
                  g = i.y,
                  f = 0,
                  y = !1,
                  x = !1;
                  t().pushHistory();
                  let w = d;
                  if (r) {
                    l = r.pixels,
                    h = r.startX + r.offsetX,
                    g = r.startY + r.offsetY,
                    f = r.rotation,
                    y = r.flipX,
                    x = r.flipY;
                    let e = u.pixels.map(e => [...e]),
                    t = e[0]?.length ||
                    0,
                    a = e.length,
                    s = U(l, f, y, x);
                    for (let l = 0; l < s.length; l++) for (let r = 0; r < s[l].length; r++) {
                      let o = s[l][r],
                      n = i.x + r,
                      d = i.y + l;
                      n >= 0 &&
                      n < t &&
                      d >= 0 &&
                      d < a &&
                      (e[d][n] = o)
                    }
                    w = d.map(t => t.id === c ? {
                      ...t,
                      pixels: e
                    }
                     : t)
                  } else l = W(i, u.pixels, a).pixels;
                  let S = {
                    x: h + 2,
                    y: g + 2,
                    w: i.w,
                    h: i.h
                  },
                  b = new Set;
                  for (let e = S.y; e < S.y + S.h; e++) for (let t = S.x; t < S.x + S.w; t++) b.add(`${ t },${ e }`);
                  let A = m(w, n.width, n.height),
                  P = p(A);
                  e({
                    layers: w,
                    activeLayerId: c,
                    processedPixels: A,
                    stats: P,
                    selectionFloating: {
                      pixels: l,
                      startX: h + 2,
                      startY: g + 2,
                      offsetX: 0,
                      offsetY: 0,
                      isClone: !0,
                      rotation: f,
                      flipX: y,
                      flipY: x
                    },
                    selectionBox: S,
                    selectionMask: b
                  })
                },
                cropToSelection: () => {
                  let {
                    selectionBox: l,
                    processedPixels: i,
                    templatePixels: r,
                    options: a,
                    pushHistory: s,
                    zoom: o,
                    offset: n,
                    layers: d
                  }
                  = t();
                  if (!l || !i) return;
                  let c = l.w,
                  u = l.h,
                  p = - l.x,
                  h = - l.y;
                  if (c <= 0 || u <= 0) return;
                  s();
                  let g = i.length,
                  f = i[0]?.length ||
                  0,
                  m = Array.from({
                    length: u
                  }, () => Array(c).fill(null)),
                  y = Array.from({
                    length: u
                  }, () => Array(c).fill(null));
                  for (let e = 0; e < g; e++) for (let t = 0; t < f; t++) {
                    let l = t + p,
                    a = e + h;
                    l >= 0 &&
                    l < c &&
                    a >= 0 &&
                    a < u &&
                    (
                      i[e]?.[t] &&
                      (m[a][l] = {
                        ...i[e][t]
                      }),
                      r &&
                      r[e]?.[t] &&
                      (y[a][l] = {
                        ...r[e][t]
                      })
                    )
                  }
                  let x = (d || []).map(
                    e => {
                      let t = Array.from({
                        length: u
                      }, () => Array(c).fill(null));
                      for (let l = 0; l < g; l++) for (let i = 0; i < f; i++) {
                        let r = i + p,
                        a = l + h;
                        r >= 0 &&
                        r < c &&
                        a >= 0 &&
                        a < u &&
                        e.pixels[l]?.[i] &&
                        (t[a][r] = {
                          ...e.pixels[l][i]
                        })
                      }
                      return {
                        ...e,
                        pixels: t
                      }
                    }
                  ),
                  w = new Map;
                  m.forEach(e => {
                    e.forEach(e => {
                      e &&
                      w.set(e.id, (w.get(e.id) || 0) + 1)
                    })
                  });
                  let S = new Map;
                  y &&
                  y.forEach(e => {
                    e.forEach(e => {
                      e &&
                      S.set(e.id, (S.get(e.id) || 0) + 1)
                    })
                  });
                  let b = 20 * o;
                  e({
                    processedPixels: m,
                    templatePixels: y,
                    stats: w,
                    templateStats: S,
                    offset: {
                      x: n.x - p * b,
                      y: n.y - h * b
                    },
                    layers: x,
                    options: {
                      ...a,
                      width: c,
                      height: u
                    },
                    selectionMask: null,
                    selectionBox: null,
                    selectionFloating: null
                  })
                }
              })
            ) (...s),
            ...(
              (e, t) => ({
                pegboardConfig: {
                  ...$
                },
                isPegboardOverviewOpen: !1,
                setPegboardConfig: t => {
                  e(e => ({
                    pegboardConfig: {
                      ...e.pegboardConfig,
                      ...t
                    }
                  }))
                },
                togglePegboardEnabled: () => {
                  let l = !t().pegboardConfig.enabled;
                  (0, c.trackEvent) ('toggle_pegboard', {
                    enabled: l
                  }),
                  e(
                    e => ({
                      pegboardConfig: {
                        ...e.pegboardConfig,
                        enabled: l,
                        activeSliceIndex: l ? e.pegboardConfig.activeSliceIndex : null
                      }
                    })
                  )
                },
                setActivePegboardSlice: t => {
                  e(
                    e => ({
                      pegboardConfig: {
                        ...e.pegboardConfig,
                        activeSliceIndex: t
                      }
                    })
                  )
                },
                setPegboardSize: (t, l) => {
                  let i = Math.max(4, Math.floor(t)),
                  r = Math.max(4, Math.floor(l));
                  e(
                    e => ({
                      pegboardConfig: {
                        ...e.pegboardConfig,
                        boardWidth: i,
                        boardHeight: r
                      }
                    })
                  )
                },
                setPegboardOverviewOpen: t => {
                  e({
                    isPegboardOverviewOpen: t
                  })
                },
                getPegboardManifest: () => {
                  let {
                    processedPixels: e,
                    pegboardConfig: l
                  }
                  = t();
                  if (!e || 0 === e.length) return {
                    totalRows: 0,
                    totalCols: 0,
                    boardRows: 0,
                    boardCols: 0,
                    totalBoards: 0,
                    boardWidth: l.boardWidth,
                    boardHeight: l.boardHeight,
                    slices: []
                  };
                  let i = e.map(e => e.map(e => e ? e.id ||
                  e.name ||
                  e.hex : null));
                  return q.slice(i, l.boardWidth, l.boardHeight)
                },
                focusPegboardSlice: l => {
                  let {
                    pegboardConfig: i,
                    processedPixels: r,
                    canvasSize: a
                  }
                  = t();
                  if (!r || !a || a.width <= 0) return;
                  let s = r.length,
                  o = r[0]?.length ||
                  0;
                  if (0 === s || 0 === o) return;
                  let n = i.boardWidth ||
                  26,
                  d = (i.boardHeight, Math.ceil(o / n));
                  e(
                    e => ({
                      pegboardConfig: {
                        ...e.pegboardConfig,
                        enabled: !0,
                        activeSliceIndex: l
                      }
                    })
                  ),
                  t().canvasSize
                }
              })
            ) (...s)
          }
        },
        {
          name: 'pixel-bead-store-v2',
          storage: {
            getItem: async e => {
              let t = null;
              try {
                let l = await i.idbStore.get(e);
                l &&
                (t = l)
              } catch (e) {
                console.warn('[PixelBead Store] 从 IndexedDB 读取失败，尝试读取 localStorage:', e)
              }
              if (!t) try {
                t = localStorage.getItem(e)
              } catch (e) {
                console.warn('[PixelBead Store] 从 localStorage 读取失败:', e)
              }
              if (!t) return null;
              try {
                let e = JSON.parse(t),
                l = e?.state?.statsPaletteId ||
                e?.state?.options?.paletteId ||
                'mard',
                i = r.ALL_PALETTES[l] ||
                r.ALL_PALETTES.mard,
                a = new Map;
                i.colors.forEach(e => {
                  a.set(e.id, e)
                });
                let s = new Map;
                return Object.values(r.ALL_PALETTES).forEach(e => {
                  e.colors.forEach(e => {
                    s.has(e.id) ||
                    s.set(e.id, e)
                  })
                }),
                JSON.parse(
                  t,
                  (e, t) => t &&
                  'object' == typeof t &&
                  !0 === t.__isMap ? new Map(t.entries) : ('processedPixels' === e || 'templatePixels' === e) &&
                  Array.isArray(t) ? t.map(
                    e => Array.isArray(e) ? e.map(
                      e => {
                        if ('string' == typeof e) {
                          let t = a.get(e);
                          return t ||
                          (t = s.get(e)) ? t : {
                            id: e,
                            name: e,
                            hex: '#FFFFFF',
                            brand: 'Custom'
                          }
                        }
                        return e
                      }
                    ) : e
                  ) : t
                )
              } catch (e) {
                return console.warn('[PixelBead Store] 持久化反序列化失败，已清空:', e),
                null
              }
            },
            setItem: async(e, t) => {
              let l = t?.state,
              i = Y?.state;
              i &&
              l &&
              i.imageSource === l.imageSource &&
              i.processedPixels === l.processedPixels &&
              i.templatePixels === l.templatePixels &&
              i.layers === l.layers &&
              i.stats === l.stats &&
              i.options === l.options &&
              i.stickers === l.stickers &&
              i.completedBeads === l.completedBeads &&
              i.activeLayerId === l.activeLayerId ||
              (
                X &&
                clearTimeout(X),
                X = setTimeout(() => {
                  s(() => {
                    Q(e, t)
                  }, 150)
                }, 80)
              )
            },
            removeItem: async e => {
              try {
                await i.idbStore.remove(e)
              } catch (e) {
                console.warn('[PixelBead Store] 从 IndexedDB 删除失败:', e)
              }
              try {
                localStorage.removeItem(e)
              } catch (e) {
                console.warn('[PixelBead Store] 从 localStorage 删除失败:', e)
              }
            }
          },
          partialize: e => ({
            imageSource: e.imageSource,
            processedPixels: e.processedPixels,
            templatePixels: e.templatePixels,
            stats: e.stats,
            templateStats: e.templateStats,
            statsPaletteId: e.statsPaletteId,
            options: e.options,
            showGrid: e.showGrid,
            gridColor: e.gridColor,
            gridThickness: e.gridThickness,
            gridColorBold: e.gridColorBold,
            gridThicknessBold: e.gridThicknessBold,
            showSymbols: e.showSymbols,
            showViewportHud: e.showViewportHud ?? !1,
            toolbarPosition: e.toolbarPosition,
            isSidebarOpen: e.isSidebarOpen,
            isLightboardMode: e.isLightboardMode,
            physicalBeadSize: e.physicalBeadSize,
            calibrationPpi: e.calibrationPpi,
            isLightboardLocked: e.isLightboardLocked,
            isViewportLocked: e.isViewportLocked,
            stickers: e.stickers,
            selectedStickerId: e.selectedStickerId,
            customStamps: e.customStamps,
            completedBeads: e.completedBeads,
            isLocatorMode: e.isLocatorMode,
            focusRulerDirection: e.focusRulerDirection,
            showUnfocusedSymbols: e.showUnfocusedSymbols,
            referenceOpacity: e.referenceOpacity,
            overlayBeadOpacity: e.overlayBeadOpacity,
            overlayTextOpacity: e.overlayTextOpacity,
            referenceMode: e.referenceMode,
            referenceOffset: e.referenceOffset,
            referenceScale: e.referenceScale,
            layers: e.layers,
            activeLayerId: e.activeLayerId
          })
        }
      )
    )
  }
  ]
);
