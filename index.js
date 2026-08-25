var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  onLoad: () => onLoad,
  onUnload: () => onUnload,
  settings: () => settings
});
module.exports = __toCommonJS(src_exports);

// src/compat.ts
var vd = window.vendetta || window.bunny || {};
function _before(method, obj, cb) {
  const orig = obj[method];
  const fn = function(...args) {
    try {
      const r = cb.call(this, args);
      if (Array.isArray(r)) return orig.apply(this, r);
    } catch {
    }
    return orig.apply(this, args);
  };
  obj[method] = fn;
  return () => {
    if (obj[method] === fn) obj[method] = orig;
  };
}
function _after(method, obj, cb) {
  const orig = obj[method];
  const fn = function(...args) {
    const r = orig.apply(this, args);
    try {
      return cb.call(this, args, r);
    } catch {
      return r;
    }
  };
  obj[method] = fn;
  return () => {
    if (obj[method] === fn) obj[method] = orig;
  };
}
var before = vd?.patcher?.before || vd?.api?.patcher?.before || _before;
var after = vd?.patcher?.after || vd?.api?.patcher?.after || _after;
var metroModules = window.modules;
function _findByProps(...props) {
  if (!metroModules) return null;
  for (const id in metroModules) {
    const mod = metroModules[id];
    if (!mod?.isInitialized) continue;
    const exp = mod.publicModule?.exports;
    if (!exp || typeof exp !== "object") continue;
    if (props.every((p) => exp[p] !== void 0)) return exp;
    if (exp.default && typeof exp.default === "object" && props.every((p) => exp.default[p] !== void 0)) return exp.default;
  }
  return null;
}
function _findByStoreName(name) {
  if (!metroModules) return null;
  for (const id in metroModules) {
    const mod = metroModules[id];
    if (!mod?.isInitialized) continue;
    const exp = mod.publicModule?.exports;
    if (!exp) continue;
    const check = exp.default || exp;
    if (check?.getName?.() === name || check?.constructor?.displayName === name) return check;
  }
  return null;
}
function _lazyProxy(finder) {
  let cache;
  let resolved = false;
  return new Proxy({}, {
    get(_t, prop) {
      if (!resolved) {
        cache = finder();
        resolved = true;
      }
      return cache?.[prop];
    },
    apply(_t, thisArg, args) {
      if (!resolved) {
        cache = finder();
        resolved = true;
      }
      return typeof cache === "function" ? cache.apply(thisArg, args) : void 0;
    }
  });
}
var _metroFromVd = vd?.metro;
function findByProps(...props) {
  if (_metroFromVd?.findByProps) try {
    return _metroFromVd.findByProps(...props);
  } catch {
  }
  return _findByProps(...props);
}
function findByStoreName(name) {
  if (_metroFromVd?.findByStoreName) try {
    return _metroFromVd.findByStoreName(name);
  } catch {
  }
  return _findByStoreName(name);
}
function findByPropsLazy(...props) {
  if (_metroFromVd?.findByPropsLazy) try {
    return _metroFromVd.findByPropsLazy(...props);
  } catch {
  }
  return _lazyProxy(() => findByProps(...props));
}
function findByStoreNameLazy(name) {
  if (_metroFromVd?.findByStoreNameLazy) try {
    return _metroFromVd.findByStoreNameLazy(name);
  } catch {
  }
  return _lazyProxy(() => findByStoreName(name));
}
var _common = vd?.metro?.common || {};
var React = _common.React || findByProps("createElement", "useState");
var ReactNative = _common.ReactNative || findByProps("View", "Text", "ScrollView");
var FluxDispatcher = _common.FluxDispatcher || findByProps("dispatch", "subscribe");
var Forms = vd?.ui?.components?.Forms || findByProps("FormSection", "FormRow", "FormInput") || {};
function showToast(msg) {
  try {
    (vd?.ui?.toasts?.showToast || vd?.toasts?.showToast)?.(msg);
    return;
  } catch {
  }
  try {
    const Toasts = findByProps("open", "close", "create");
    if (Toasts?.open) {
      Toasts.open({ content: msg, source: null });
      return;
    }
  } catch {
  }
}
function getAssetIDByName(name) {
  try {
    return (vd?.ui?.assets?.getAssetIDByName || vd?.assets?.getAssetIDByName)?.(name);
  } catch {
  }
  try {
    const AssetRegistry = findByProps("registerAsset", "getAssetByID");
    if (AssetRegistry?.getAssetByID) {
      for (let i = 1; i < 5e4; i++) {
        try {
          const a = AssetRegistry.getAssetByID(i);
          if (a?.name === name) return i;
        } catch {
          break;
        }
      }
    }
  } catch {
  }
  return void 0;
}
function findInReactTree(tree, filter) {
  try {
    const fn = vd?.utils?.findInReactTree;
    if (fn) return fn(tree, filter);
  } catch {
  }
  if (!tree) return null;
  if (filter(tree)) return tree;
  if (Array.isArray(tree)) {
    for (const child of tree) {
      const r = findInReactTree(child, filter);
      if (r) return r;
    }
  }
  if (tree.props) {
    const children = tree.props.children;
    if (children) {
      const r = findInReactTree(children, filter);
      if (r) return r;
    }
  }
  return null;
}
var _storage = null;
function getStorage() {
  if (_storage) return _storage;
  try {
    const ps = vd?.plugin?.storage;
    if (ps && typeof ps === "object") {
      _storage = ps;
      return _storage;
    }
  } catch {
  }
  try {
    const raw = window.__spoofer_data;
    if (raw && typeof raw === "object") {
      _storage = raw;
      return _storage;
    }
  } catch {
  }
  _storage = {};
  window.__spoofer_data = _storage;
  return _storage;
}
function registerCommand(cmd) {
  try {
    const fn = vd?.commands?.registerCommand;
    if (fn) return fn(cmd);
  } catch {
  }
  return () => {
  };
}

// src/state.ts
var defaults = {
  userId: "",
  message: "",
  serverTagId: "",
  serverPickerOpen: false,
  serverSearch: "",
  embedsEnabled: true,
  ukTime: true,
  useUTC: false,
  customYear: 0,
  customMonth: 0,
  customDay: 0,
  customHour: 0,
  customMinute: 0,
  conversationText: "",
  convoSaveName: "",
  savedConvos: [],
  savedMessages: [],
  profiles: {},
  profileId: "",
  profileName: "",
  profileAvatar: "",
  profileSource: "",
  profileJoined: "",
  profileAccount: "",
  profileSelf: false,
  sdmScript: "",
  sdmKeywords: [],
  sdmBulkList: "",
  newKeywordName: "",
  newKeywordValue: "",
  _lastUpdate: 0
};
function initDefaults() {
  const s = getStorage();
  for (const k in defaults) {
    if (s[k] === void 0) {
      s[k] = defaults[k];
    }
  }
}
var storage = getStorage();
var originalMessages = /* @__PURE__ */ new Map();
var isLocalEditing = false;
function setLocalEditing(val) {
  isLocalEditing = val;
}
var selfActive = false;
var selfId = null;
var selfAt = 0;
function setSelfSpoof(id, active) {
  selfId = id;
  selfActive = active;
  selfAt = active ? Date.now() : 0;
}
var _cuReal = null;
var _cuId = null;
var _cuProxy = null;
function getSpoofedCU() {
  return { real: _cuReal, id: _cuId, proxy: _cuProxy };
}
function setSpoofedCU(real, id, proxy) {
  _cuReal = real;
  _cuId = id;
  _cuProxy = proxy;
}

// src/utils.ts
var _lastSnow = 0;
function genId(isoOrDate) {
  const t = typeof isoOrDate === "string" ? new Date(isoOrDate).getTime() : isoOrDate.getTime();
  let b = (t - 14200704e5) * 4194304;
  if (!(b > _lastSnow)) b = _lastSnow + 8192;
  _lastSnow = b;
  return b.toString();
}
function createdAtFromId(id) {
  try {
    const ms = Math.floor(Number(id) / 4194304) + 14200704e5;
    if (isFinite(ms)) return new Date(ms);
  } catch {
  }
  return null;
}
function lastSundayDate(year, month1) {
  const last = new Date(Date.UTC(year, month1, 0));
  return last.getUTCDate() - last.getUTCDay();
}
function ukIsBSTInstant(t) {
  const y = t.getUTCFullYear();
  const start = Date.UTC(y, 2, lastSundayDate(y, 3), 1, 0, 0);
  const end = Date.UTC(y, 9, lastSundayDate(y, 10), 1, 0, 0);
  const ms = t.getTime();
  return ms >= start && ms < end;
}
function ukNowDate() {
  const now = /* @__PURE__ */ new Date();
  const off = ukIsBSTInstant(now) ? 60 : 0;
  const s = new Date(now.getTime() + off * 6e4);
  return new Date(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), s.getUTCHours(), s.getUTCMinutes(), s.getUTCSeconds(), s.getUTCMilliseconds());
}
function ukOn(storage2) {
  try {
    return storage2.ukTime !== false;
  } catch {
    return true;
  }
}
function nowDate(storage2) {
  return ukOn(storage2) ? ukNowDate() : /* @__PURE__ */ new Date();
}
function nowISO(storage2) {
  return nowDate(storage2).toISOString();
}
function extractId(x) {
  try {
    if (!x) return null;
    if (typeof x === "string") return /^\d+$/.test(x) ? x : null;
    if (x.id) return x.id;
    if (x.userId) return x.userId;
    if (x.user && x.user.id) return x.user.id;
  } catch {
  }
  return null;
}
function forceSet(o, k, v) {
  if (!o) return;
  try {
    o[k] = v;
  } catch {
  }
  try {
    if (o[k] !== v) Object.defineProperty(o, k, { value: v, writable: true, configurable: true, enumerable: true });
  } catch {
  }
}
function forceNull(o, k) {
  try {
    if (!(k in o)) return;
  } catch {
    return;
  }
  forceSet(o, k, null);
}
function mkISO(Y0, Mo, D0, H0, Mi, useUTC) {
  const dt = useUTC ? new Date(Date.UTC(Y0, Mo - 1, D0, H0, Mi, 0, 0)) : new Date(Y0, Mo - 1, D0, H0, Mi, 0, 0);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}
function parseTime(str, base, useUTC) {
  const s = (str || "").trim();
  if (!s) return null;
  let m;
  if (m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T]+(\d{1,2}):(\d{2})$/))
    return mkISO(+m[1], +m[2], +m[3], +m[4], +m[5], useUTC);
  if (m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))
    return mkISO(+m[1], +m[2], +m[3], 0, 0, useUTC);
  if (m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i)) {
    let H0 = +m[1];
    const Mi = m[2] ? +m[2] : 0;
    const ap = m[3].toLowerCase();
    if (ap === "pm" && H0 !== 12) H0 += 12;
    if (ap === "am" && H0 === 12) H0 = 0;
    return mkISO(base.y, base.mo, base.d, H0, Mi, useUTC);
  }
  if (m = s.match(/^(\d{1,2}):(\d{2})$/))
    return mkISO(base.y, base.mo, base.d, +m[1], +m[2], useUTC);
  return null;
}
function parseLine(line) {
  const raw = (line || "").trim();
  if (!raw) return null;
  let m;
  if (m = raw.match(/^([^\s[\^|:\-–—]+)\s*\[([^\]]+)\]\s*(\^\d*)?\s*[-–—|:]\s*([\s\S]*)$/))
    return { uid: m[1], time: m[2].trim(), reply: pRef(m[3]), content: m[4] };
  if (m = raw.match(/^([^\s[\^|:\-–—]+)\s*(\^\d*)?\s*[-–—|:]\s*([\s\S]*)$/))
    return { uid: m[1], time: null, reply: pRef(m[2]), content: m[3] };
  return null;
}
function pRef(tok) {
  if (!tok) return null;
  const nn = tok.slice(1);
  return nn ? { line: parseInt(nn, 10) } : { prev: true };
}
function decodeEntities(str) {
  return ("" + str).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2F;/gi, "/").trim();
}

// src/engine.ts
var UserStore = findByStoreNameLazy("UserStore");
var ChannelStore = findByStoreNameLazy("ChannelStore");
var ChannelSelectors = findByPropsLazy("getChannelId", "getLastSelectedChannelId");
var ChannelModule = findByPropsLazy("getChannel", "getChannelId");
var GuildStore = findByStoreNameLazy("GuildStore");
var MessageStore = findByStoreNameLazy("MessageStore");
var EditModule = findByPropsLazy("sendMessage", "startEditMessage", "editMessage");
var ActionSheetModule = findByPropsLazy("openLazy", "hideActionSheet");
var ActionSheetRow = findByPropsLazy("ActionSheetRow");
var resolving = /* @__PURE__ */ new Set();
var _avSrc = /* @__PURE__ */ new Map();
function getCurrentChannelId() {
  try {
    const id = ChannelSelectors?.getChannelId?.();
    if (id) return id;
  } catch {
  }
  try {
    const id = ChannelModule?.getChannelId?.();
    if (id) return id;
  } catch {
  }
  return null;
}
function resolveServerName(inlineId, channelId) {
  try {
    let id = inlineId;
    if (!id) id = ("" + (storage.serverTagId || "")).trim();
    if (!id && channelId) {
      const ch = ChannelModule?.getChannel?.(channelId);
      id = ch?.guild_id;
    }
    if (id && GuildStore?.getGuild) {
      const g = GuildStore.getGuild(id);
      if (g?.name) return g.name;
    }
  } catch {
  }
  return null;
}
function applyTags(content, channelId) {
  if (!content) return content;
  let out = content;
  if (out.indexOf("[server") !== -1) {
    out = out.replace(/\[server:(\d{5,25})\]/gi, (_m, id) => resolveServerName(id, channelId) || _m);
    out = out.replace(/\[server\]/gi, (_m) => resolveServerName(null, channelId) || _m);
  }
  const keywords = storage.sdmKeywords;
  if (keywords?.length) {
    for (let ki = 0; ki < keywords.length; ki++) {
      const kw = keywords[ki];
      if (kw?.key && kw?.value) {
        const tag = "[" + kw.key + "]";
        while (out.indexOf(tag) !== -1) {
          out = out.split(tag).join(kw.value);
        }
      }
    }
  }
  return out;
}
function anyProf() {
  const p = storage.profiles;
  if (!p) return false;
  for (const _k in p) return true;
  return false;
}
function firstProfiledId(args) {
  if (!args) return null;
  if (!anyProf()) return null;
  const profs = storage.profiles || {};
  for (let i = 0; i < args.length; i++) {
    const id = extractId(args[i]);
    if (id && profs[id]) return id;
  }
  return null;
}
function resolveName(uid) {
  const prof = (storage.profiles || {})[uid];
  if (!prof) return null;
  if (prof.name) return prof.name;
  if (prof.sourceId && !resolving.has(uid)) {
    resolving.add(uid);
    try {
      const src = UserStore.getUser(prof.sourceId);
      if (src) return src.globalName || src.global_name || src.username || null;
    } catch {
    } finally {
      resolving.delete(uid);
    }
  }
  return null;
}
function resolveUsername(uid) {
  const prof = (storage.profiles || {})[uid];
  if (!prof) return null;
  if (prof.sourceId && !resolving.has(uid)) {
    resolving.add(uid);
    try {
      const src = UserStore.getUser(prof.sourceId);
      if (src) return src.username || null;
    } catch {
    } finally {
      resolving.delete(uid);
    }
  }
  return prof.name || null;
}
function resolveAvatar(uid) {
  const prof = (storage.profiles || {})[uid];
  if (!prof) return null;
  if (prof.sourceId && !resolving.has(uid)) {
    resolving.add(uid);
    try {
      const src = UserStore.getUser(prof.sourceId);
      if (src && typeof src.getAvatarURL === "function") {
        const u = src.getAvatarURL();
        if (u) return u;
      }
    } catch {
    } finally {
      resolving.delete(uid);
    }
  }
  return prof.avatar || null;
}
function mirrorSource(id, ret) {
  const uri = resolveAvatar(id);
  if (!uri) return ret;
  const prev = _avSrc.get(id);
  if (prev && prev.uri === uri) return prev.obj;
  const obj = ret && typeof ret === "object" ? Object.assign({}, ret, { uri }) : { uri };
  _avSrc.set(id, { uri, obj });
  return obj;
}
function resolveCreated(uid) {
  const prof = (storage.profiles || {})[uid];
  if (!prof) return null;
  if (prof.accountDate) {
    const d = new Date(prof.accountDate);
    if (!isNaN(d.getTime())) return d;
  }
  if (prof.sourceId) return createdAtFromId(prof.sourceId);
  return null;
}
function resolveJoined(uid) {
  const prof = (storage.profiles || {})[uid];
  if (!prof) return null;
  if (prof.joinedAt) return prof.joinedAt;
  if (prof.sourceId) {
    const d = createdAtFromId(prof.sourceId);
    if (d) return d.toISOString();
  }
  return null;
}
function resolveBanner(uid) {
  const prof = (storage.profiles || {})[uid];
  if (!prof || !prof.sourceId) return null;
  if (resolving.has("b" + uid)) return null;
  resolving.add("b" + uid);
  try {
    const src = UserStore.getUser(prof.sourceId);
    if (src && typeof src.getBannerURL === "function") {
      let u;
      try {
        u = src.getBannerURL({ size: 2048 });
      } catch {
      }
      if (!u) try {
        u = src.getBannerURL();
      } catch {
      }
      if (u) return u;
    }
    let bh = src?.banner;
    if (!bh) {
      try {
        const UPS = findByStoreName("UserProfileStore");
        const sp = UPS?.getUserProfile?.(prof.sourceId);
        if (sp?.banner) bh = sp.banner;
      } catch {
      }
    }
    if (bh) {
      const ext = ("" + bh).indexOf("a_") === 0 ? "gif" : "png";
      return "https://cdn.discordapp.com/banners/" + prof.sourceId + "/" + bh + "." + ext + "?size=2048";
    }
  } catch {
  } finally {
    resolving.delete("b" + uid);
  }
  return null;
}
function resolveAccent(uid) {
  const prof = (storage.profiles || {})[uid];
  if (!prof || !prof.sourceId) return null;
  if (resolving.has("a" + uid)) return null;
  resolving.add("a" + uid);
  try {
    const src = UserStore.getUser(prof.sourceId);
    if (src?.accentColor != null) return src.accentColor;
  } catch {
  } finally {
    resolving.delete("a" + uid);
  }
  return null;
}
function mkAuthor(uid) {
  let u = null;
  try {
    u = UserStore.getUser(uid);
  } catch {
  }
  const dn = resolveName(uid);
  const un = resolveUsername(uid);
  const av = resolveAvatar(uid);
  return {
    id: uid,
    username: un || (u ? u.username : "FakeUser"),
    global_name: dn || (u ? u.globalName || u.global_name || null : null),
    discriminator: u ? u.discriminator : "0001",
    avatar: av || (u ? u.avatar : null),
    bot: u ? u.bot : false
  };
}
function spoofCU(real, id) {
  try {
    const cached = getSpoofedCU();
    if (cached.proxy && cached.real === real && cached.id === id) return cached.proxy;
    const desc = Object.getOwnPropertyDescriptors(real);
    delete desc.id;
    const clone = Object.create(Object.getPrototypeOf(real), desc);
    Object.defineProperty(clone, "id", { value: id, writable: true, enumerable: true, configurable: true });
    try {
      const ca = resolveCreated(id);
      if (ca) forceSet(clone, "createdAt", ca);
    } catch {
    }
    setSpoofedCU(real, id, clone);
    return clone;
  } catch {
    return real;
  }
}
async function fetchT(url, ms, opts) {
  const ctl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => {
    try {
      ctl.abort();
    } catch {
    }
  }, ms || 8e3) : null;
  try {
    return await fetch(url, Object.assign({}, opts, ctl ? { signal: ctl.signal } : {}));
  } finally {
    if (timer) clearTimeout(timer);
  }
}
function metaTag(html, prop) {
  try {
    let m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']` + prop + `["'][^>]*?content=["']([^"']*)["']`, "i"));
    if (m?.[1]) return decodeEntities(m[1]);
    m = html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*?(?:property|name)=["']` + prop + `["']`, "i"));
    if (m?.[1]) return decodeEntities(m[1]);
  } catch {
  }
  return null;
}
function ytId(url) {
  let m;
  if (m = url.match(/[?&]v=([\w-]{11})/)) return m[1];
  if (m = url.match(/youtu\.be\/([\w-]{11})/)) return m[1];
  if (m = url.match(/youtube\.com\/shorts\/([\w-]{11})/)) return m[1];
  if (m = url.match(/youtube\.com\/embed\/([\w-]{11})/)) return m[1];
  if (m = url.match(/youtube\.com\/live\/([\w-]{11})/)) return m[1];
  return null;
}
async function fetchYouTube(url) {
  const vid = ytId(url);
  let data = {};
  try {
    const res = await fetchT("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(url), 8e3);
    if (res?.ok) data = await res.json();
  } catch {
  }
  if (!vid && !data.title) return null;
  const w = data.thumbnail_width || 1280, h = data.thumbnail_height || 720;
  const embed = { type: vid ? "video" : "rich", url, color: 16711680, provider: { name: "YouTube", url: "https://www.youtube.com" } };
  if (data.title) embed.title = ("" + data.title).slice(0, 256);
  if (data.author_name) embed.author = { name: data.author_name, url: data.author_url };
  const thumb = data.thumbnail_url || (vid ? "https://i.ytimg.com/vi/" + vid + "/hqdefault.jpg" : null);
  if (thumb) embed.thumbnail = { url: thumb, proxy_url: thumb, width: w, height: h };
  if (vid) embed.video = { url: "https://www.youtube.com/embed/" + vid, width: 1280, height: 720 };
  return embed;
}
async function fetchOpenGraph(url) {
  try {
    const res = await fetchT(url, 8e3, {
      headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)" }
    });
    if (!res?.ok) return null;
    let html = await res.text();
    if (html?.length > 6e5) html = html.slice(0, 6e5);
    const title = metaTag(html, "og:title") || metaTag(html, "twitter:title") || (() => {
      const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      return m ? decodeEntities(m[1]) : null;
    })();
    const desc = metaTag(html, "og:description") || metaTag(html, "twitter:description") || metaTag(html, "description");
    const image = metaTag(html, "og:image") || metaTag(html, "og:image:url") || metaTag(html, "twitter:image");
    const site = metaTag(html, "og:site_name");
    if (!title && !desc && !image) return null;
    const embed = { type: "rich", url, color: 5198940 };
    if (title) embed.title = title.slice(0, 256);
    if (desc) embed.description = desc.slice(0, 350);
    if (site) embed.footer = { text: site };
    if (image) embed.image = { url: image, proxy_url: image };
    return embed;
  } catch {
    return null;
  }
}
async function fetchEmbeds(content) {
  const out = [];
  try {
    const urls = ("" + (content || "")).match(/https?:\/\/[^\s<>]+/g) || [];
    const seen = {};
    for (let i = 0; i < urls.length && out.length < 4; i++) {
      const url = urls[i].replace(/[)\].,!?'"]+$/, "");
      if (seen[url]) continue;
      seen[url] = true;
      if (/(?:youtube\.com\/watch\?|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)/i.test(url)) {
        const em = await fetchYouTube(url);
        if (em) out.push(em);
      } else if (/\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(url)) {
        out.push({ type: "image", url, image: { url, proxy_url: url } });
      } else {
        const em = await fetchOpenGraph(url);
        if (em) out.push(em);
      }
    }
  } catch {
  }
  return out;
}
function addLinkEmbeds(channelId, message, content) {
  try {
    if (storage.embedsEnabled === false) return;
    if (!/https?:\/\//i.test("" + (content || ""))) return;
    fetchEmbeds(content).then((embeds) => {
      if (!embeds?.length) return;
      try {
        FluxDispatcher.dispatch({ type: "MESSAGE_UPDATE", message: Object.assign({}, message, { embeds }), otherPluginBypass: true });
      } catch {
      }
    }).catch(() => {
    });
  } catch {
  }
}
async function dispatchFakeMessage(channelId, userId, content, timestamp, msgId, replyRef) {
  content = applyTags(content, channelId);
  const id = msgId || genId(timestamp || nowISO(storage));
  try {
    const ts = timestamp || nowISO(storage);
    const message = {
      id,
      type: 0,
      channel_id: channelId,
      author: mkAuthor(userId),
      content,
      nonce: id,
      mentions: [],
      mention_roles: [],
      pinned: false,
      tts: false,
      attachments: [],
      embeds: [],
      timestamp: ts,
      edited_timestamp: null,
      state: "SENT",
      fake: true
    };
    if (replyRef?.id) {
      message.type = 19;
      message.message_reference = { message_id: replyRef.id, channel_id: channelId };
      try {
        const gid = ChannelModule?.getChannel?.(channelId)?.guild_id;
        if (gid) message.message_reference.guild_id = gid;
      } catch {
      }
      message.referenced_message = {
        id: replyRef.id,
        type: 0,
        channel_id: channelId,
        author: mkAuthor(replyRef.userId),
        content: replyRef.content,
        mentions: [],
        mention_roles: [],
        pinned: false,
        tts: false,
        attachments: [],
        embeds: [],
        timestamp: replyRef.timestamp || ts,
        edited_timestamp: null,
        state: "SENT",
        fake: true
      };
    }
    FluxDispatcher.dispatch({ type: "MESSAGE_CREATE", channelId, message, otherPluginBypass: true });
    try {
      FluxDispatcher.dispatch({ type: "MESSAGE_ACK", channelId, messageId: id, manual: true, immediate: true });
    } catch {
    }
    try {
      addLinkEmbeds(channelId, message, content);
    } catch {
    }
  } catch {
  }
}
function saveMessage(channelId, userId, content, msgId, timestamp, replyRef) {
  const d = storage.savedMessages || [];
  const rec = { id: msgId, channelId, userId, content, timestamp, createdAt: Date.now() };
  if (replyRef) rec.replyTo = replyRef;
  d.push(rec);
  storage.savedMessages = d;
  storage._lastUpdate = Date.now();
}
function replayChannel(channelId) {
  (storage.savedMessages || []).filter((s) => s.channelId === channelId).forEach((s) => {
    dispatchFakeMessage(s.channelId, s.userId, s.content, s.timestamp, s.id, s.replyTo);
  });
}
function clearSaved() {
  try {
    const count = (storage.savedMessages || []).length;
    storage.savedMessages = [];
    storage._lastUpdate = Date.now();
    showToastMsg("Cleared " + count + " saved message" + (count === 1 ? "" : "s") + ".");
  } catch {
    showToastMsg("Couldn't clear saved messages.");
  }
}
function removeAllFakes() {
  try {
    const list = (storage.savedMessages || []).slice();
    let removed = 0;
    for (const rec of list) {
      if (rec?.id && rec?.channelId) {
        try {
          FluxDispatcher.dispatch({ type: "MESSAGE_DELETE", id: rec.id, channelId: rec.channelId, otherPluginBypass: true });
          removed++;
        } catch {
        }
      }
    }
    storage.savedMessages = [];
    storage._lastUpdate = Date.now();
    showToastMsg("Removed " + removed + " spoofed message" + (removed === 1 ? "" : "s") + " and cleared saved.");
  } catch {
    showToastMsg("Couldn't remove spoofed messages.");
  }
}
function showToastMsg(msg) {
  try {
    showToast(msg);
  } catch {
  }
}
function dmNameFor(id) {
  try {
    const u = UserStore.getUser(id);
    if (u) return u.globalName || u.global_name || u.username || id;
  } catch {
  }
  return id;
}
function findExistingDM(id) {
  try {
    const PCS = findByStoreName("PrivateChannelStore");
    let cid = null;
    try {
      if (PCS?.getDMFromUserId) cid = PCS.getDMFromUserId(id);
    } catch {
    }
    if (cid) {
      const ch = ChannelStore?.getChannel?.(cid);
      if (ch?.type === 1) return cid;
    }
    let ids = [];
    try {
      if (PCS?.getPrivateChannelIds) ids = PCS.getPrivateChannelIds() || [];
    } catch {
    }
    for (const chId of ids) {
      const ch = ChannelStore?.getChannel?.(chId);
      if (!ch || ch.type !== 1) continue;
      const r = ch.recipients || [];
      if (r.length !== 1) continue;
      const rid = typeof r[0] === "string" ? r[0] : r[0]?.id;
      if (rid === id) return chId;
    }
  } catch {
  }
  return null;
}
function isDM(channelId) {
  try {
    return ChannelStore?.getChannel?.(channelId)?.type === 1;
  } catch {
    return false;
  }
}
function pushMessagesScreen(channelId) {
  try {
    const RA = findByProps("handleTapChannel");
    if (RA?.handleTapChannel) {
      RA.handleTapChannel(channelId);
      return true;
    }
  } catch {
  }
  try {
    const RA2 = findByProps("handlePressChannel");
    if (RA2?.handlePressChannel) {
      RA2.handlePressChannel(channelId);
      return true;
    }
  } catch {
  }
  try {
    const NavRef = findByProps("getRootNavigationRef");
    const ref = NavRef?.getRootNavigationRef?.();
    if (ref?.navigate) {
      for (const route of ["messages", "Messages", "Channel", "channel"]) {
        try {
          ref.navigate(route, { channelId });
          return true;
        } catch {
        }
      }
    }
  } catch {
  }
  return false;
}
function tryNavigate(channelId) {
  if (!channelId) return false;
  const sc = findByProps("selectChannel");
  if (sc?.selectChannel) {
    for (const shape of [{ guildId: null, channelId }, { guildId: "@me", channelId }, { channelId }, channelId]) {
      try {
        sc.selectChannel(shape);
        pushMessagesScreen(channelId);
        return true;
      } catch {
      }
    }
  }
  if (pushMessagesScreen(channelId)) return true;
  const tr = findByProps("transitionToChannel");
  if (tr?.transitionToChannel) {
    try {
      tr.transitionToChannel(channelId);
      return true;
    } catch {
    }
  }
  const oc = findByProps("openChannel");
  if (oc?.openChannel) {
    try {
      oc.openChannel({ channelId });
      return true;
    } catch {
    }
  }
  return false;
}
async function openDM(userId) {
  const id = ("" + (userId || "")).trim().replace(/[^0-9]/g, "");
  if (!id || !/^\d{17,20}$/.test(id)) {
    showToastMsg("Invalid user ID.");
    return null;
  }
  const ens = findByProps("ensurePrivateChannel");
  let channelId = findExistingDM(id);
  if (channelId && tryNavigate(channelId)) {
    showToastMsg("Opening DM with " + dmNameFor(id));
    return { channelId, userId: id };
  }
  if (!channelId && ens?.ensurePrivateChannel) {
    try {
      channelId = await ens.ensurePrivateChannel(id);
    } catch {
    }
  }
  if (channelId) {
    if (isDM(channelId)) {
      if (tryNavigate(channelId)) {
        showToastMsg("Opening DM with " + dmNameFor(id));
        return { channelId, userId: id };
      }
    } else {
      const real = findExistingDM(id);
      if (real && tryNavigate(real)) {
        showToastMsg("Opening DM with " + dmNameFor(id));
        return { channelId: real, userId: id };
      }
      showToastMsg("This build's create call makes a group, not a 1:1 DM.");
      return null;
    }
  }
  const acts = findByProps("openPrivateChannel");
  if (acts?.openPrivateChannel) {
    for (const shape of [id, { recipientId: id }, { userId: id }]) {
      try {
        acts.openPrivateChannel(shape);
        break;
      } catch {
      }
    }
    const real = findExistingDM(id);
    if (real && tryNavigate(real)) {
      showToastMsg("Opening DM with " + dmNameFor(id));
      return { channelId: real, userId: id };
    }
  }
  showToastMsg("Couldn't open a DM - no working DM API found.");
  return null;
}
function fillFromChat() {
  try {
    const ch = getCurrentChannelId();
    if (!ch) return null;
    let channel = ChannelModule?.getChannel?.(ch);
    if (!channel) try {
      channel = ChannelStore?.getChannel?.(ch);
    } catch {
    }
    const rec = channel?.recipients;
    if (rec?.length) {
      let id = rec[0];
      if (id && typeof id === "object") id = id.id || id.userId || id.user_id;
      if (id) return "" + id;
    }
    const raw = channel?.rawRecipients;
    if (raw?.length) {
      const id = raw[0].id || raw[0].user_id;
      if (id) return "" + id;
    }
    try {
      const ids = findByProps("getDMUserIds")?.getDMUserIds?.(ch);
      if (ids?.length) return "" + ids[0];
    } catch {
    }
    let arr = [];
    try {
      const msgs = MessageStore?.getMessages?.(ch);
      arr = msgs?.toArray ? msgs.toArray() : msgs?._array || [];
    } catch {
    }
    const meId = UserStore?.getCurrentUser?.()?.id;
    for (let i = arr.length - 1; i >= 0; i--) {
      const au = arr[i]?.author?.id;
      if (au && au !== meId) return "" + au;
    }
  } catch {
  }
  return null;
}
function randGapMs() {
  return Math.floor(6e4 + Math.random() * 6e4);
}
async function runConvo() {
  const ch = getCurrentChannelId();
  if (!ch) {
    showToastMsg("No channel selected.");
    return;
  }
  const text = storage.conversationText || "";
  const lines = text.split(/\r?\n/);
  const useUTC = ukOn(storage) ? false : storage.useUTC || false;
  const now = nowDate(storage);
  const base = {
    y: storage.customYear || now.getFullYear(),
    mo: storage.customMonth || now.getMonth() + 1,
    d: storage.customDay || now.getDate()
  };
  const items = [];
  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed || !parsed.content.trim()) continue;
    let uid = parsed.uid;
    if (/^(me|self)$/i.test(uid)) try {
      uid = UserStore?.getCurrentUser?.()?.id;
    } catch {
    }
    else if (/^(them|they|user)$/i.test(uid)) uid = (storage.userId || "").trim();
    if (!uid) continue;
    const explicit = parsed.time ? parseTime(parsed.time, base, useUTC) : null;
    items.push({ uid, content: parsed.content, reply: parsed.reply, explicit: explicit || null });
  }
  let cursor = nowDate(storage).getTime();
  for (const it of items) {
    if (it.explicit) {
      const t0 = new Date(it.explicit).getTime();
      if (!isNaN(t0)) {
        cursor = t0;
        break;
      }
    }
  }
  let count = 0;
  const built = [];
  for (const it of items) {
    let iso;
    if (it.explicit) {
      const t = new Date(it.explicit).getTime();
      if (!isNaN(t)) {
        cursor = t;
        iso = new Date(t).toISOString();
      } else iso = new Date(cursor).toISOString();
    } else iso = new Date(cursor).toISOString();
    cursor += randGapMs();
    const id = genId(iso);
    let ref = null;
    if (it.reply) {
      const target = it.reply.prev ? built[built.length - 1] : built[it.reply.line - 1];
      if (target) ref = { id: target.id, userId: target.userId, content: target.content, timestamp: target.timestamp };
    }
    await dispatchFakeMessage(ch, it.uid, it.content, iso, id, ref);
    saveMessage(ch, it.uid, it.content, id, iso, ref);
    built.push({ id, userId: it.uid, content: it.content, timestamp: iso });
    count++;
  }
  showToastMsg(count ? `Sent ${count} message${count === 1 ? "" : "s"}.` : "No valid lines found.");
}
async function runBulkSDM() {
  const script = ("" + (storage.sdmScript || "")).trim();
  if (!script) {
    showToastMsg("Set a preset script in the SDM tab first.");
    return;
  }
  const raw = ("" + (storage.sdmBulkList || "")).trim();
  if (!raw) {
    showToastMsg("Add targets to the bulk list first.");
    return;
  }
  const lines = raw.split(/\r?\n/);
  let count = 0, fails = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    const uid = parts[0];
    const sid = parts.length > 1 ? parts.slice(1).join(" ") : null;
    if (!uid || !/^\d{5,}$/.test(uid)) {
      fails++;
      continue;
    }
    let msg = script;
    if (sid && /^\d{5,}$/.test(sid.trim())) msg = msg.replace(/\[server\]/gi, "[server:" + sid.trim() + "]");
    else if (sid) msg = msg.replace(/\[server\]/gi, sid.trim());
    try {
      const result = await openDM(uid);
      if (!result) {
        fails++;
        continue;
      }
      await new Promise((r) => setTimeout(r, 350));
      const timestamp = nowISO(storage);
      const id = genId(timestamp);
      await dispatchFakeMessage(result.channelId, result.userId, msg, timestamp, id);
      saveMessage(result.channelId, result.userId, msg, id, timestamp);
      count++;
      await new Promise((r) => setTimeout(r, 500));
    } catch {
      fails++;
    }
  }
  showToastMsg("Bulk SDM: " + count + " sent" + (fails ? ", " + fails + " failed" : "") + ".");
}
var _fp;
function fetchProfileSafe(uid) {
  if (!uid) return;
  try {
    if (_fp === void 0) _fp = findByProps("fetchProfile") || null;
  } catch {
    _fp = null;
  }
  if (_fp?.fetchProfile) {
    try {
      const r = _fp.fetchProfile(uid);
      r?.catch?.(() => {
      });
    } catch {
    }
  }
}
function prefetchSources() {
  try {
    const profs = storage.profiles || {};
    const seen = {};
    for (const k in profs) {
      const sid = profs[k]?.sourceId;
      if (sid && !seen[sid]) {
        seen[sid] = true;
        fetchProfileSafe(sid);
      }
    }
  } catch {
  }
}
function installPatches() {
  const unpatches = [];
  try {
    const bDispatch = before("dispatch", FluxDispatcher, (s) => {
      const c = s[0];
      if (c.type === "MESSAGE_UPDATE" && c.message?.fake && !c.otherPluginBypass && !isLocalEditing) return [];
    });
    unpatches.push(bDispatch);
  } catch {
  }
  try {
    const AV = findByProps("getUserAvatarURL");
    if (AV?.getUserAvatarURL)
      unpatches.push(after("getUserAvatarURL", AV, (a, ret) => {
        try {
          const id = firstProfiledId(a);
          if (id) {
            const o = resolveAvatar(id);
            if (o) return o;
          }
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const AV2 = findByProps("getUserAvatarSource");
    if (AV2?.getUserAvatarSource)
      unpatches.push(after("getUserAvatarSource", AV2, (a, ret) => {
        try {
          const id = firstProfiledId(a);
          if (id) return mirrorSource(id, ret);
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const GAV = findByProps("getGuildMemberAvatarURLSimple");
    if (GAV?.getGuildMemberAvatarURLSimple)
      unpatches.push(after("getGuildMemberAvatarURLSimple", GAV, (a, ret) => {
        try {
          const id = firstProfiledId(a);
          if (id) {
            const o = resolveAvatar(id);
            if (o) return o;
          }
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const cu = UserStore?.getCurrentUser?.();
    const proto = cu?.constructor?.prototype;
    if (proto?.getAvatarURL)
      unpatches.push(after("getAvatarURL", proto, function(_a, ret) {
        try {
          const id = this?.id;
          if (id && (storage.profiles || {})[id]) {
            const o = resolveAvatar(id);
            if (o) return o;
          }
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    if (UserStore?.getUser)
      unpatches.push(after("getUser", UserStore, (a, ret) => {
        try {
          const profs = storage.profiles;
          const id = a?.[0];
          if (profs && id && profs[id] && ret) {
            const dn = resolveName(id);
            const un = resolveUsername(id);
            if (un && ret.username !== un) forceSet(ret, "username", un);
            if (dn && ret.globalName !== dn) forceSet(ret, "globalName", dn);
            forceNull(ret, "avatarDecorationData");
            forceNull(ret, "avatarDecoration");
            forceNull(ret, "primaryGuild");
            forceNull(ret, "clan");
            forceSet(ret, "premiumType", 0);
            forceNull(ret, "premiumSince");
            forceNull(ret, "premiumGuildSince");
            const ca0 = resolveCreated(id);
            if (ca0) forceSet(ret, "createdAt", ca0);
            if (profs[id].sourceId) {
              const ac = resolveAccent(id);
              if (ac != null) forceSet(ret, "accentColor", ac);
            }
          }
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const GMS = findByStoreName("GuildMemberStore");
    if (GMS?.getNick)
      unpatches.push(after("getNick", GMS, (a, ret) => {
        try {
          const profs = storage.profiles;
          if (profs && a) {
            const id = profs[a[1]] ? a[1] : profs[a[0]] ? a[0] : null;
            if (id) {
              const nm = resolveName(id);
              if (nm) return nm;
            }
          }
        } catch {
        }
        return ret;
      }));
    if (GMS?.getMember)
      unpatches.push(after("getMember", GMS, (a, ret) => {
        try {
          const profs = storage.profiles;
          if (profs && a && ret) {
            const id = profs[a[1]] ? a[1] : profs[a[0]] ? a[0] : null;
            if (id) {
              const nm = resolveName(id);
              if (nm) {
                forceSet(ret, "nick", nm);
                if ("nickname" in ret) forceSet(ret, "nickname", nm);
              }
              const ja = resolveJoined(id);
              if (ja) {
                forceSet(ret, "joinedAt", ja);
                if ("joinedAtTimestamp" in ret) forceSet(ret, "joinedAtTimestamp", new Date(ja).getTime());
              }
            }
          }
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const NK = findByProps("getNickname");
    if (NK?.getNickname)
      unpatches.push(after("getNickname", NK, (a, ret) => {
        try {
          const profs = storage.profiles;
          if (profs && a) {
            for (const arg of a) {
              const id = extractId(arg);
              if (id && profs[id]) {
                const nm = resolveName(id);
                if (nm) return nm;
              }
            }
          }
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const NM = findByProps("getName");
    if (NM?.getName)
      unpatches.push(after("getName", NM, (a, ret) => {
        try {
          const profs = storage.profiles;
          if (profs && a) {
            for (const arg of a) {
              const id = extractId(arg);
              if (id && profs[id]) {
                const nm = resolveName(id);
                if (nm) return nm;
              }
            }
          }
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const BU = findByProps("getUserBannerURL");
    if (BU?.getUserBannerURL)
      unpatches.push(after("getUserBannerURL", BU, (a, ret) => {
        try {
          const id = firstProfiledId(a);
          const prof = id && (storage.profiles || {})[id];
          if (prof?.sourceId) return resolveBanner(id);
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const cu = UserStore?.getCurrentUser?.();
    const proto = cu?.constructor?.prototype;
    if (proto?.getBannerURL)
      unpatches.push(after("getBannerURL", proto, function(_a, ret) {
        try {
          const id = this?.id;
          const prof = id && (storage.profiles || {})[id];
          if (prof?.sourceId) return resolveBanner(id);
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const DU = findByProps("getAvatarDecorationURL");
    if (DU?.getAvatarDecorationURL)
      unpatches.push(after("getAvatarDecorationURL", DU, (a, ret) => {
        try {
          const id = extractId(a?.[0]);
          if (id && (storage.profiles || {})[id]) return null;
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const UPS = findByStoreName("UserProfileStore");
    if (UPS?.getUserProfile)
      unpatches.push(after("getUserProfile", UPS, (a, ret) => {
        try {
          const profs = storage.profiles;
          const id = a?.[0];
          if (profs && id && profs[id] && ret) {
            const prof = profs[id];
            forceNull(ret, "avatarDecoration");
            forceNull(ret, "avatarDecorationData");
            forceNull(ret, "profileEffectId");
            forceNull(ret, "primaryGuild");
            forceNull(ret, "clan");
            forceSet(ret, "badges", []);
            forceSet(ret, "premiumType", 0);
            forceNull(ret, "premiumSince");
            forceNull(ret, "premiumGuildSince");
            if (prof.sourceId && !resolving.has("p" + id)) {
              resolving.add("p" + id);
              try {
                const sp = UPS.getUserProfile(prof.sourceId);
                if (sp) {
                  if (sp.bio != null) forceSet(ret, "bio", sp.bio);
                  if (sp.pronouns != null) forceSet(ret, "pronouns", sp.pronouns);
                  if (sp.accentColor != null) forceSet(ret, "accentColor", sp.accentColor);
                  if (sp.themeColors != null) forceSet(ret, "themeColors", sp.themeColors);
                }
                let sbh = null;
                try {
                  const src2 = UserStore.getUser(prof.sourceId);
                  sbh = src2?.banner || sp?.banner || null;
                } catch {
                }
                forceSet(ret, "banner", sbh);
              } catch {
              } finally {
                resolving.delete("p" + id);
              }
            }
          }
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const BG = findByProps("getBadges");
    if (BG?.getBadges)
      unpatches.push(after("getBadges", BG, (a, ret) => {
        try {
          const id = firstProfiledId(a);
          if (id) return [];
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const BG2 = findByProps("getUserProfileBadges");
    if (BG2?.getUserProfileBadges)
      unpatches.push(after("getUserProfileBadges", BG2, (a, ret) => {
        try {
          const id = firstProfiledId(a);
          if (id) return [];
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    if (UserStore?.getCurrentUser)
      unpatches.push(after("getCurrentUser", UserStore, (_a, ret) => {
        try {
          if (selfActive && selfId && ret) return spoofCU(ret, selfId);
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const ICU = findByProps("isCurrentUser");
    if (ICU?.isCurrentUser)
      unpatches.push(after("isCurrentUser", ICU, (a, ret) => {
        try {
          const profs = storage.profiles;
          const id = extractId(a?.[0]) || a?.[0];
          if (profs && id && profs[id]?.self) return true;
        } catch {
        }
        return ret;
      }));
    const IM = findByProps("isMe");
    if (IM?.isMe)
      unpatches.push(after("isMe", IM, (a, ret) => {
        try {
          const profs = storage.profiles;
          const id = extractId(a?.[0]) || a?.[0];
          if (profs && id && profs[id]?.self) return true;
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    if (ActionSheetModule?.hideActionSheet)
      unpatches.push(after("hideActionSheet", ActionSheetModule, () => {
        try {
          if (selfActive && Date.now() - selfAt > 400) setSelfSpoof(null, false);
        } catch {
        }
      }));
  } catch {
  }
  try {
    if (ActionSheetModule?.openLazy) {
      unpatches.push(before("openLazy", ActionSheetModule, (s) => {
        try {
          const [sheet, compKey, u] = s;
          const profs = storage.profiles;
          if (profs && u) {
            let fid = null;
            const cands = [u.userId, u.user?.id, u.user?.userId];
            for (const cv of cands) {
              if (cv && profs[cv]?.self) {
                fid = cv;
                break;
              }
            }
            if (!fid) {
              try {
                for (const key in u) {
                  const val = u[key];
                  if (typeof val === "string" && profs[val]?.self) {
                    fid = val;
                    break;
                  }
                  if (val && typeof val === "object") {
                    const sub = val.id || val.userId;
                    if (sub && profs[sub]?.self) {
                      fid = sub;
                      break;
                    }
                  }
                }
              } catch {
              }
            }
            if (fid) {
              setSelfSpoof(fid, true);
              setTimeout(() => setSelfSpoof(null, false), 8e3);
            }
          }
          const msg = u?.message;
          if (compKey === "MessageLongPressActionSheet" && msg) {
            sheet.then((d) => {
              const ip = after("default", d, (_g, h) => {
                setTimeout(ip, 0);
                const M = findInReactTree(h, (m) => m?.[0]?.type?.name === "ActionSheetRow");
                if (!M) return;
                let o = null;
                try {
                  o = UserStore?.getCurrentUser?.();
                } catch {
                }
                const a = MessageStore?.getMessage?.(msg.channel_id, msg.id) ?? msg;
                if (a.author.id === o?.id || M.some((m) => m?.props?.label === "Edit Locally")) return;
                const ASR = ActionSheetRow?.ActionSheetRow || M[0]?.type;
                if (!ASR) return;
                const p = Math.max(M.findIndex((m) => m.props?.message?.toString?.()?.includes?.("MARK_UNREAD") || m.props?.label === "Mark Unread"), 0);
                M.splice(
                  p,
                  0,
                  React.createElement(ASR, {
                    label: "Edit Locally",
                    icon: ASR.Icon ? React.createElement(ASR.Icon, { source: getAssetIDByName("ic_edit_24px") }) : void 0,
                    onPress: () => {
                      setLocalEditing(true);
                      if (!originalMessages.has(a.id)) originalMessages.set(a.id, JSON.parse(JSON.stringify(a)));
                      try {
                        ActionSheetModule.hideActionSheet();
                      } catch {
                      }
                      try {
                        EditModule.startEditMessage(a.channel_id, a.id, a.content);
                      } catch {
                      }
                    }
                  }),
                  React.createElement(ASR, {
                    label: "Use as Fake User",
                    icon: ASR.Icon ? React.createElement(ASR.Icon, { source: getAssetIDByName("ic_members") }) : void 0,
                    onPress: () => {
                      try {
                        storage.userId = a.author.id;
                        ActionSheetModule.hideActionSheet();
                        showToastMsg("Fake user set: " + (a.author.username || a.author.id));
                      } catch {
                      }
                    }
                  })
                );
              });
            });
          }
        } catch {
        }
      }));
    }
  } catch {
  }
  try {
    if (EditModule?.editMessage) {
      unpatches.push(before("editMessage", EditModule, (s) => {
        const [_c, u, t] = s;
        if (isLocalEditing) {
          const d = originalMessages.get(u);
          if (!d) return;
          const i = storage.savedMessages || [];
          const g = i.find((h) => h.id === u);
          if (g) {
            g.content = t.content;
            storage.savedMessages = i;
          }
          FluxDispatcher.dispatch({ type: "MESSAGE_UPDATE", message: { ...d, content: t.content, edited_timestamp: null }, otherPluginBypass: true });
          return [];
        }
      }));
    }
  } catch {
  }
  try {
    if (EditModule?.endEditMessage) {
      unpatches.push(after("endEditMessage", EditModule, () => {
        if (isLocalEditing) setLocalEditing(false);
      }));
    }
  } catch {
  }
  return unpatches;
}

// src/commands.ts
function argsToMap(args) {
  return Array.isArray(args) ? Object.fromEntries(args.map((a) => [a?.name, a?.value])) : args ?? {};
}
function registerAllCommands() {
  const unregister = [];
  try {
    unregister.push(registerCommand({
      name: "spoofer",
      displayName: "spoofer",
      description: "Open the Local Message Spoofer settings.",
      displayDescription: "Open the Local Message Spoofer settings.",
      type: 1,
      inputType: 1,
      options: [],
      execute: () => {
        showToastMsg("Open Spoofer from the Plugins list (settings).");
      }
    }));
  } catch {
  }
  try {
    unregister.push(registerCommand({
      name: "filluid",
      displayName: "filluid",
      description: "Fill the spoofer User ID from this chat, or pass a specific ID.",
      displayDescription: "Fill the spoofer User ID from this chat, or pass a specific ID.",
      type: 1,
      inputType: 1,
      options: [{
        name: "userid",
        displayName: "userid",
        description: "Optional: a specific user ID to set.",
        displayDescription: "Optional: a specific user ID to set.",
        type: 3,
        required: false
      }],
      execute: (args) => {
        try {
          const map = argsToMap(args);
          let id = ("" + (map.userid ?? "")).trim();
          if (!id) id = fillFromChat() || "";
          if (id) {
            storage.userId = id;
            showToastMsg("User ID set: " + id);
          } else showToastMsg("No user found here. Try: /filluid userid:123456789");
        } catch {
          showToastMsg("Couldn't set the User ID.");
        }
      }
    }));
  } catch {
  }
  try {
    unregister.push(registerCommand({
      name: "clearfakes",
      displayName: "clearfakes",
      description: "Clear all saved fake messages (stops them replaying).",
      displayDescription: "Clear all saved fake messages (stops them replaying).",
      type: 1,
      inputType: 1,
      options: [],
      execute: () => {
        clearSaved();
      }
    }));
  } catch {
  }
  try {
    unregister.push(registerCommand({
      name: "dm",
      displayName: "dm",
      description: "Open a DM with a user by ID, mention, or profile link.",
      displayDescription: "Open a DM with a user by ID, mention, or profile link.",
      type: 1,
      inputType: 1,
      options: [{
        name: "user",
        displayName: "user",
        description: "User ID, mention, or profile URL.",
        displayDescription: "User ID, mention, or profile URL.",
        type: 3,
        required: true
      }],
      execute: (args) => {
        try {
          const map = argsToMap(args);
          openDM("" + (map.user ?? ""));
        } catch {
          showToastMsg("Couldn't run /dm.");
        }
      }
    }));
  } catch {
  }
  try {
    unregister.push(registerCommand({
      name: "sdm",
      displayName: "sdm",
      description: "Open a DM and send the preset script (or a custom message).",
      displayDescription: "Open a DM and send the preset script (or a custom message).",
      type: 1,
      inputType: 1,
      options: [
        { name: "user", displayName: "user", description: "User ID, mention, or profile URL.", displayDescription: "User ID, mention, or profile URL.", type: 3, required: true },
        { name: "message", displayName: "message", description: "Override message (leave blank to use preset script).", displayDescription: "Override message (leave blank to use preset script).", type: 3, required: false }
      ],
      execute: async (args) => {
        try {
          const map = argsToMap(args);
          const result = await openDM("" + (map.user ?? ""));
          if (!result) {
            showToastMsg("Failed to open DM or user not found.");
            return;
          }
          let content = ("" + (map.message ?? "")).trim();
          if (!content) content = ("" + (storage.sdmScript || "")).trim();
          if (!content) {
            showToastMsg("No message and no preset script set. Add one in the spoofer SDM tab.");
            return;
          }
          await new Promise((r) => setTimeout(r, 250));
          const timestamp = nowISO(storage);
          const id = genId(timestamp);
          await dispatchFakeMessage(result.channelId, result.userId, content, timestamp, id);
          saveMessage(result.channelId, result.userId, content, id, timestamp);
          showToastMsg("Spoofed message sent in DM.");
        } catch (e) {
          showToastMsg("Error: " + (e?.message || "unknown"));
        }
      }
    }));
  } catch {
  }
  try {
    unregister.push(registerCommand({
      name: "sdm-bulk",
      displayName: "sdm-bulk",
      description: "Send the preset script to every target in the bulk list.",
      displayDescription: "Send the preset script to every target in the bulk list.",
      type: 1,
      inputType: 1,
      options: [],
      execute: async () => {
        await runBulkSDM();
      }
    }));
  } catch {
  }
  return unregister;
}

// src/settings.tsx
var UserStore2 = findByStoreNameLazy("UserStore");
var GuildStore2 = findByStoreNameLazy("GuildStore");
var ChannelModule2 = findByPropsLazy("getChannel", "getChannelId");
function buildTimestampISO() {
  const _nd = nowDate(storage);
  if (storage.useUTC && !ukOn(storage)) {
    return new Date(Date.UTC(
      storage.customYear || _nd.getFullYear(),
      (storage.customMonth || _nd.getMonth() + 1) - 1,
      storage.customDay || _nd.getDate(),
      storage.customHour !== void 0 ? storage.customHour : _nd.getHours(),
      storage.customMinute !== void 0 ? storage.customMinute : _nd.getMinutes(),
      0,
      0
    )).toISOString();
  }
  return new Date(
    storage.customYear || _nd.getFullYear(),
    (storage.customMonth || _nd.getMonth() + 1) - 1,
    storage.customDay || _nd.getDate(),
    storage.customHour !== void 0 ? storage.customHour : _nd.getHours(),
    storage.customMinute !== void 0 ? storage.customMinute : _nd.getMinutes(),
    0,
    0
  ).toISOString();
}
function SpooferSettings() {
  const [tick, setTick] = React.useState(0);
  const [tab, setTab] = React.useState(0);
  const _scrollRef = React.useRef(null);
  const RN = ReactNative;
  const _View = RN?.View;
  const _SV = RN?.ScrollView;
  const _Touch = RN?.TouchableOpacity || RN?.Pressable;
  const _Text = RN?.Text;
  let _width = 380;
  try {
    if (RN?.Dimensions?.get) _width = RN.Dimensions.get("window").width || 380;
  } catch {
  }
  const _canSwipe = !!(_View && _SV && _Touch && _Text);
  const r = storage.userId || "";
  const s = storage.message || "";
  let c = null;
  try {
    if (r) c = UserStore2?.getUser?.(r);
  } catch {
  }
  const u = (storage.savedMessages || []).length;
  const t = nowDate(storage);
  const d = storage.customYear || t.getFullYear();
  const i = storage.customMonth || t.getMonth() + 1;
  const g = storage.customDay || t.getDate();
  const h = storage.customHour !== void 0 ? storage.customHour : t.getHours();
  const M = storage.customMinute !== void 0 ? storage.customMinute : t.getMinutes();
  const bump = () => setTick((k) => k + 1);
  const resolveServerDisplay = () => {
    try {
      let id = ("" + (storage.serverTagId || "")).trim();
      if (!id) {
        const ch = ChannelModule2?.getChannel?.(getCurrentChannelId());
        id = ch?.guild_id;
      }
      if (id) {
        const g2 = GuildStore2?.getGuild?.(id);
        if (g2?.name) return g2.name;
      }
    } catch {
    }
    return "(no match - join that server or recheck the ID)";
  };
  async function sendFakeMessage() {
    const o = getCurrentChannelId();
    const a = (storage.message || "").trim();
    if (!a || !o) {
      showToastMsg("Enter a message and open a channel first.");
      return;
    }
    let p = (storage.userId || "").trim();
    try {
      if (!p) p = UserStore2?.getCurrentUser?.()?.id || "";
    } catch {
    }
    if (!p) return;
    const C = buildTimestampISO();
    const m = genId(C);
    await dispatchFakeMessage(o, p, a, C, m);
    saveMessage(o, p, a, m, C);
    showToastMsg("Fake message sent.");
  }
  if (!Forms?.FormSection || !Forms?.FormInput || !Forms?.FormRow) {
    return React.createElement("text", {}, "Local Message Spoofer loaded but UI components unavailable.");
  }
  const messageTab = React.createElement(
    Forms.FormSection,
    { title: "Fake Message" },
    React.createElement(Forms.FormInput, { key: "uid" + tick, title: "User ID (Optional)", placeholder: "Leave empty to use current user", value: r, onChange: (o) => {
      storage.userId = o || "";
    }, helperText: c ? `User: ${c.username} - use "them" in the builder` : r ? 'User not found (still usable as "them")' : "Will use your account" }),
    React.createElement(Forms.FormRow, { label: "Fill from current chat", subLabel: "Grab the other person in this DM (or the last sender in this channel).", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_members") }) : void 0, onPress: () => {
      const id = fillFromChat();
      if (id) {
        storage.userId = id;
        bump();
        showToastMsg("Filled User ID: " + id);
      } else showToastMsg("Couldn't find a user here.");
    } }),
    React.createElement(Forms.FormInput, { title: "Message", placeholder: "Enter message content", value: s, onChange: (o) => {
      storage.message = o || "";
    }, multiline: true }),
    React.createElement(Forms.FormInput, { title: "Server ID for [server] tag (optional)", placeholder: "Paste a server ID; [server] becomes its name", value: storage.serverTagId || "", onChange: (o) => {
      storage.serverTagId = o || "";
      bump();
    } }),
    React.createElement(Forms.FormRow, { label: "[server] = " + resolveServerDisplay(), subLabel: "Type [server] in your message and it's swapped for the name when sent. Use [server:123] to name a specific server inline." }),
    React.createElement(Forms.FormRow, { label: "Use the server I'm in now", subLabel: "One tap - fills the box above with your current server.", onPress: () => {
      const ch = ChannelModule2?.getChannel?.(getCurrentChannelId());
      const gid = ch?.guild_id;
      if (!gid) {
        showToastMsg("You're not in a server right now.");
        return;
      }
      storage.serverTagId = gid;
      const g2 = GuildStore2?.getGuild?.(gid);
      showToastMsg('Set to "' + (g2?.name || gid) + '".');
      bump();
    } }),
    React.createElement(Forms.FormRow, { label: storage.serverPickerOpen ? "Hide server list" : "Pick from my servers", subLabel: "Choose a server by name - no ID needed.", onPress: () => {
      storage.serverPickerOpen = !storage.serverPickerOpen;
      bump();
    } }),
    storage.serverPickerOpen ? buildServerPicker(bump) : null,
    React.createElement(Forms.FormRow, { label: "Link Previews", subLabel: "Show embeds for links in fake messages (YouTube, websites, images).", trailing: Forms.FormSwitch ? React.createElement(Forms.FormSwitch, { value: storage.embedsEnabled !== false, onValueChange: (o) => {
      storage.embedsEnabled = o;
    } }) : void 0 }),
    React.createElement(Forms.FormRow, { label: "Send Fake Message", subLabel: "Sends using the current timestamp settings.", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_send") }) : void 0, onPress: sendFakeMessage })
  );
  const timeTab = React.createElement(
    Forms.FormSection,
    { title: "Custom Timestamp" },
    React.createElement(Forms.FormRow, { label: "UK time (GMT/BST)" + (ukOn(storage) ? " - ON" : " - off"), subLabel: "Automatic timestamps use UK time. Handles BST/GMT automatically.", trailing: Forms.FormSwitch ? React.createElement(Forms.FormSwitch, { value: ukOn(storage), onValueChange: (o) => {
      storage.ukTime = o;
      bump();
    } }) : void 0 }),
    React.createElement(Forms.FormRow, { label: ukOn(storage) ? "UTC mode (ignored while UK is on)" : storage.useUTC ? "Using UTC Time" : "Using Local Time", subLabel: ukOn(storage) ? "Turn off UK time above to use this." : storage.useUTC ? "Time will be the same for everyone" : "Time will adjust to viewer's timezone", trailing: Forms.FormSwitch ? React.createElement(Forms.FormSwitch, { value: storage.useUTC || false, onValueChange: (o) => {
      storage.useUTC = o;
      bump();
    } }) : void 0 }),
    React.createElement(Forms.FormInput, { title: "Year", placeholder: "YYYY", value: String(d), onChange: (o) => {
      const a = parseInt(o);
      storage.customYear = isNaN(a) ? t.getFullYear() : a;
    }, keyboardType: "number-pad" }),
    React.createElement(Forms.FormInput, { title: "Month", placeholder: "1-12", value: String(i), onChange: (o) => {
      const a = parseInt(o);
      storage.customMonth = isNaN(a) ? t.getMonth() + 1 : Math.min(Math.max(a, 1), 12);
    }, keyboardType: "number-pad" }),
    React.createElement(Forms.FormInput, { title: "Day", placeholder: "1-31", value: String(g), onChange: (o) => {
      const a = parseInt(o);
      storage.customDay = isNaN(a) ? t.getDate() : Math.min(Math.max(a, 1), 31);
    }, keyboardType: "number-pad" }),
    React.createElement(Forms.FormInput, { title: "Hour", placeholder: "0-23", value: String(h), onChange: (o) => {
      const a = parseInt(o);
      storage.customHour = isNaN(a) ? t.getHours() : Math.min(Math.max(a, 0), 23);
    }, keyboardType: "number-pad" }),
    React.createElement(Forms.FormInput, { title: "Minute", placeholder: "0-59", value: String(M), onChange: (o) => {
      const a = parseInt(o);
      storage.customMinute = isNaN(a) ? t.getMinutes() : Math.min(Math.max(a, 0), 59);
    }, keyboardType: "number-pad" }),
    React.createElement(Forms.FormRow, { label: "Send Fake Message", subLabel: `${u} messages saved | Timestamp: ${d}-${String(i).padStart(2, "0")}-${String(g).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(M).padStart(2, "0")}`, onPress: sendFakeMessage })
  );
  const convoTab = React.createElement(
    Forms.FormSection,
    { title: "Conversation Builder" },
    React.createElement(Forms.FormInput, { title: "Conversation", placeholder: "One line each:\nuserId [time] [^reply] - message\n\nme = you | them = the User ID above\n^N = reply to line N | ^ = reply to previous\n\nExample:\nme [9pm] - hey\nthem [9:01pm] ^1 - hi back\nme ^ - lol", value: storage.conversationText || "", onChange: (o) => {
      storage.conversationText = o || "";
    }, multiline: true }),
    React.createElement(Forms.FormRow, { label: "Build Conversation", subLabel: "'me' = you, 'them' = the User ID above. Reply with ^N or ^ (previous).", onPress: async () => {
      await runConvo();
    } }),
    React.createElement(Forms.FormInput, { title: "Save this conversation as (optional)", placeholder: "A name to find it later", value: storage.convoSaveName || "", onChange: (o) => {
      storage.convoSaveName = o || "";
    } }),
    React.createElement(Forms.FormRow, { label: "Save conversation", subLabel: "Saves the text above on-device to reload later.", onPress: () => {
      const txt = storage.conversationText || "";
      if (!txt.trim()) {
        showToastMsg("Nothing to save.");
        return;
      }
      const arr = (storage.savedConvos || []).slice();
      const nm = ("" + (storage.convoSaveName || "")).trim() || "Saved " + (arr.length + 1);
      arr.push({ name: nm, text: txt });
      storage.savedConvos = arr;
      storage.convoSaveName = "";
      showToastMsg('Saved "' + nm + '".');
      bump();
    } }),
    (storage.savedConvos || []).length ? React.createElement(Forms.FormRow, { label: "Clear saved conversations", subLabel: (storage.savedConvos || []).length + " saved. Removes them all.", onPress: () => {
      storage.savedConvos = [];
      showToastMsg("Cleared saved conversations.");
      bump();
    } }) : null,
    ...(storage.savedConvos || []).map((sc, idx) => React.createElement(Forms.FormRow, { key: "sc" + idx, label: sc.name, subLabel: "Tap to load this into the builder.", onPress: () => {
      storage.conversationText = sc.text || "";
      showToastMsg('Loaded "' + sc.name + '".');
      bump();
    } }))
  );
  const sdmTab = React.createElement(
    React.Fragment,
    {},
    React.createElement(
      Forms.FormSection,
      { title: "SDM Preset Script" },
      React.createElement(Forms.FormRow, { label: "How it works", subLabel: "Write a message template below. When you run /sdm (userid) without a message, this script is sent instead. Use [server] and any custom keywords you define." }),
      React.createElement(Forms.FormInput, { key: "sdmscript" + tick, title: "Preset Script", placeholder: "e.g. Hey! I saw you in [server], wanted to reach out about [topic]...", value: storage.sdmScript || "", onChange: (o) => {
        storage.sdmScript = o || "";
      }, multiline: true }),
      React.createElement(Forms.FormRow, { label: "Preview", subLabel: (() => {
        const raw = storage.sdmScript || "";
        if (!raw.trim()) return "(no script set)";
        const resolved = applyTags(raw, getCurrentChannelId());
        return resolved.length > 200 ? resolved.slice(0, 200) + "..." : resolved;
      })() }),
      React.createElement(Forms.FormRow, { label: "Custom Keywords", subLabel: (storage.sdmKeywords || []).length ? (storage.sdmKeywords || []).length + " keyword(s) defined. Use [keyword] in your script." : "No custom keywords yet. Add one below." }),
      ...(storage.sdmKeywords || []).map((kw, idx) => React.createElement(Forms.FormRow, { key: "kw" + idx, label: "[" + kw.key + "] = " + kw.value, subLabel: "Tap to remove this keyword.", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_trash_24px") }) : void 0, onPress: () => {
        const arr = (storage.sdmKeywords || []).slice();
        arr.splice(idx, 1);
        storage.sdmKeywords = arr;
        showToastMsg("Removed [" + kw.key + "].");
        bump();
      } })),
      React.createElement(Forms.FormInput, { key: "newkwname" + tick, title: "New keyword name", placeholder: "e.g. topic, greeting, invite", value: storage.newKeywordName || "", onChange: (o) => {
        storage.newKeywordName = o || "";
      } }),
      React.createElement(Forms.FormInput, { key: "newkwval" + tick, title: "New keyword value", placeholder: "What [keyword] gets replaced with", value: storage.newKeywordValue || "", onChange: (o) => {
        storage.newKeywordValue = o || "";
      } }),
      React.createElement(Forms.FormRow, { label: "Add Keyword", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_add_24px") || getAssetIDByName("ic_add") }) : void 0, onPress: () => {
        const name = ("" + (storage.newKeywordName || "")).trim().toLowerCase().replace(/[[\]]/g, "");
        const val = ("" + (storage.newKeywordValue || "")).trim();
        if (!name) {
          showToastMsg("Enter a keyword name first.");
          return;
        }
        if (!val) {
          showToastMsg("Enter a value for [" + name + "].");
          return;
        }
        if (name === "server") {
          showToastMsg("Use the Server ID field on the Message tab for [server].");
          return;
        }
        const arr = (storage.sdmKeywords || []).slice();
        const existing = arr.findIndex((kw) => kw.key === name);
        if (existing !== -1) arr[existing] = { key: name, value: val };
        else arr.push({ key: name, value: val });
        storage.sdmKeywords = arr;
        storage.newKeywordName = "";
        storage.newKeywordValue = "";
        showToastMsg("Added [" + name + "] = " + val);
        bump();
      } }),
      React.createElement(Forms.FormRow, { label: "Clear All Keywords", subLabel: "Remove every custom keyword.", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_trash_24px") }) : void 0, onPress: () => {
        storage.sdmKeywords = [];
        showToastMsg("Cleared all custom keywords.");
        bump();
      } })
    ),
    React.createElement(
      Forms.FormSection,
      { title: "Bulk SDM" },
      React.createElement(Forms.FormRow, { label: "How it works", subLabel: "One target per line: userId serverId. Each gets the preset script with [server] resolved to their specific server. Run with the button below or /sdm-bulk." }),
      React.createElement(Forms.FormInput, { key: "sdmbulk" + tick, title: "Bulk Target List", placeholder: "userId serverId\nuserId serverId\n\ne.g.\n123456789 987654321\n111222333 444555666", value: storage.sdmBulkList || "", onChange: (o) => {
        storage.sdmBulkList = o || "";
      }, multiline: true }),
      React.createElement(Forms.FormRow, { label: (() => {
        const raw = ("" + (storage.sdmBulkList || "")).trim();
        if (!raw) return "0 targets";
        const ct = raw.split(/\r?\n/).filter((l) => l.trim() && /^\d{5,}/.test(l.trim())).length;
        return ct + " target" + (ct === 1 ? "" : "s") + " in list";
      })(), subLabel: "Each line should be: userId serverId (server ID is optional)." }),
      React.createElement(Forms.FormRow, { label: "Run Bulk SDM", subLabel: "Opens a DM with each target and sends the preset script.", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_send") }) : void 0, onPress: async () => {
        await runBulkSDM();
        bump();
      } }),
      React.createElement(Forms.FormRow, { label: "Clear Bulk List", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_trash_24px") }) : void 0, onPress: () => {
        storage.sdmBulkList = "";
        showToastMsg("Cleared bulk list.");
        bump();
      } })
    )
  );
  const savedTab = React.createElement(
    Forms.FormSection,
    { title: "Saved Messages" },
    React.createElement(Forms.FormRow, { label: "Clear Saved Messages", subLabel: u + " saved. These replay each time you reopen a channel - clearing stops that.", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_trash_24px") }) : void 0, onPress: () => {
      clearSaved();
      bump();
    } }),
    React.createElement(Forms.FormRow, { label: "Remove All Spoofed Messages", subLabel: "Deletes every spoofed message from view now and clears the saved list.", leading: Forms.FormRow.Icon ? React.createElement(Forms.FormRow.Icon, { source: getAssetIDByName("ic_trash_24px") }) : void 0, onPress: () => {
      removeAllFakes();
      bump();
    } })
  );
  const tabs = [messageTab, timeTab, convoTab, sdmTab, savedTab];
  const tabLabels = ["Message", "Time", "Convo", "SDM", "Saved"];
  if (!_canSwipe) {
    return React.createElement(
      React.Fragment,
      {},
      React.createElement(Forms.FormRow, { label: "Local Message Spoofer", subLabel: "Local-only fake messages - nothing leaves your device" }),
      ...tabs
    );
  }
  return React.createElement(
    React.Fragment,
    {},
    React.createElement(Forms.FormRow, { label: "Local Message Spoofer", subLabel: "Local-only fake messages - nothing leaves your device" }),
    React.createElement(
      _View,
      { key: "pager" },
      React.createElement(
        _View,
        { style: { flexDirection: "row", paddingHorizontal: 6, marginBottom: 10, marginTop: 4 } },
        ...tabLabels.map((lbl, idx) => React.createElement(
          _Touch,
          {
            key: "tab" + idx,
            style: { flex: 1, paddingVertical: 9, alignItems: "center", borderBottomWidth: 2, borderBottomColor: tab === idx ? "#5865f2" : "rgba(255,255,255,0.08)" },
            onPress: () => {
              setTab(idx);
              try {
                _scrollRef.current?.scrollTo({ x: idx * _width, animated: true });
              } catch {
              }
            }
          },
          React.createElement(_Text, { style: { color: tab === idx ? "#ffffff" : "#949ba4", fontSize: 13, fontWeight: tab === idx ? "600" : "400" } }, lbl)
        ))
      ),
      React.createElement(
        _SV,
        {
          ref: _scrollRef,
          horizontal: true,
          pagingEnabled: true,
          showsHorizontalScrollIndicator: false,
          keyboardShouldPersistTaps: "handled",
          onMomentumScrollEnd: (ev) => {
            try {
              setTab(Math.round(ev.nativeEvent.contentOffset.x / _width));
            } catch {
            }
          }
        },
        ...tabs.map((content, idx) => React.createElement(
          _View,
          { key: "page" + idx, style: { width: _width } },
          React.createElement(
            _SV,
            { style: { maxHeight: 560 }, contentContainerStyle: { paddingTop: 8, paddingHorizontal: 14, paddingBottom: 180 }, keyboardShouldPersistTaps: "handled", nestedScrollEnabled: true },
            content
          )
        ))
      )
    )
  );
}
function buildServerPicker(bump) {
  let guilds = [];
  try {
    const all = GuildStore2?.getGuilds?.() || {};
    guilds = Object.keys(all).map((k) => all[k]).filter((g) => g?.name);
    guilds.sort((a, b) => ("" + a.name).localeCompare("" + b.name));
  } catch {
  }
  const sq = ("" + (storage.serverSearch || "")).trim().toLowerCase();
  if (sq) guilds = guilds.filter((g) => ("" + g.name).toLowerCase().indexOf(sq) !== -1);
  const total = guilds.length;
  const shown = guilds.slice(0, 30);
  const rows = [
    React.createElement(Forms.FormInput, { key: "ssearch", title: "Search servers", placeholder: "Type a server name", value: storage.serverSearch || "", onChange: (o) => {
      storage.serverSearch = o || "";
      bump();
    } })
  ];
  if (!shown.length) rows.push(React.createElement(Forms.FormRow, { key: "snone", label: sq ? "(no servers match)" : "(no servers found)" }));
  shown.forEach((g) => rows.push(React.createElement(Forms.FormRow, {
    key: "g" + g.id,
    label: g.name,
    onPress: () => {
      storage.serverTagId = g.id;
      storage.serverPickerOpen = false;
      storage.serverSearch = "";
      showToastMsg('Set to "' + g.name + '".');
      bump();
    }
  })));
  if (total > shown.length) rows.push(React.createElement(Forms.FormRow, { key: "smore", label: total - shown.length + " more - keep typing to narrow", subLabel: "Showing the first 30 matches." }));
  return rows;
}

// src/index.ts
var cleanups = [];
var onLoad = () => {
  try {
    initDefaults();
  } catch {
  }
  let unpatches = [];
  try {
    unpatches = installPatches();
  } catch {
  }
  let unregister = [];
  try {
    unregister = registerAllCommands();
  } catch {
  }
  try {
    const onChannelSelect = (ev) => {
      try {
        if (ev?.channelId) replayChannel(ev.channelId);
      } catch {
      }
    };
    if (FluxDispatcher?.subscribe) {
      FluxDispatcher.subscribe("CHANNEL_SELECT", onChannelSelect);
      cleanups.push(() => FluxDispatcher.unsubscribe("CHANNEL_SELECT", onChannelSelect));
    }
  } catch {
  }
  try {
    prefetchSources();
  } catch {
  }
  cleanups = [
    ...cleanups,
    ...unregister,
    ...unpatches
  ];
};
var onUnload = () => {
  cleanups.forEach((fn) => {
    try {
      fn();
    } catch {
    }
  });
  cleanups = [];
  try {
    originalMessages.clear();
  } catch {
  }
  try {
    setLocalEditing(false);
  } catch {
  }
};
var settings = SpooferSettings;
