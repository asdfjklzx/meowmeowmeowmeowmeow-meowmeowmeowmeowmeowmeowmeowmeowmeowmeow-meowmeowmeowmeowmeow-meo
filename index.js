var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var import_common3 = require("@vendetta/metro/common");

// src/commands.ts
var import_commands = require("@vendetta/commands");

// src/engine.ts
var import_assets = require("@vendetta/ui/assets");
var import_patcher = require("@vendetta/patcher");
var import_toasts = require("@vendetta/ui/toasts");
var import_utils = require("@vendetta/utils");
var import_common = require("@vendetta/metro/common");
var import_metro = require("@vendetta/metro");

// src/state.ts
var import_plugin = require("@vendetta/plugin");
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
  for (const k in defaults) {
    if (import_plugin.storage[k] === void 0) {
      import_plugin.storage[k] = defaults[k];
    }
  }
}
__name(initDefaults, "initDefaults");
var storage = import_plugin.storage;
var originalMessages = /* @__PURE__ */ new Map();
var isLocalEditing = false;
function setLocalEditing(val) {
  isLocalEditing = val;
}
__name(setLocalEditing, "setLocalEditing");
var selfActive = false;
var selfId = null;
var selfAt = 0;
function setSelfSpoof(id, active) {
  selfId = id;
  selfActive = active;
  selfAt = active ? Date.now() : 0;
}
__name(setSelfSpoof, "setSelfSpoof");
var _cuReal = null;
var _cuId = null;
var _cuProxy = null;
function getSpoofedCU() {
  return { real: _cuReal, id: _cuId, proxy: _cuProxy };
}
__name(getSpoofedCU, "getSpoofedCU");
function setSpoofedCU(real, id, proxy) {
  _cuReal = real;
  _cuId = id;
  _cuProxy = proxy;
}
__name(setSpoofedCU, "setSpoofedCU");

// src/utils.ts
var _lastSnow = 0;
function genId(isoOrDate) {
  const t = typeof isoOrDate === "string" ? new Date(isoOrDate).getTime() : isoOrDate.getTime();
  let b = (t - 14200704e5) * 4194304;
  if (!(b > _lastSnow)) b = _lastSnow + 8192;
  _lastSnow = b;
  return b.toString();
}
__name(genId, "genId");
function createdAtFromId(id) {
  try {
    const ms = Math.floor(Number(id) / 4194304) + 14200704e5;
    if (isFinite(ms)) return new Date(ms);
  } catch {
  }
  return null;
}
__name(createdAtFromId, "createdAtFromId");
function lastSundayDate(year, month1) {
  const last = new Date(Date.UTC(year, month1, 0));
  return last.getUTCDate() - last.getUTCDay();
}
__name(lastSundayDate, "lastSundayDate");
function ukIsBSTInstant(t) {
  const y = t.getUTCFullYear();
  const start = Date.UTC(y, 2, lastSundayDate(y, 3), 1, 0, 0);
  const end = Date.UTC(y, 9, lastSundayDate(y, 10), 1, 0, 0);
  const ms = t.getTime();
  return ms >= start && ms < end;
}
__name(ukIsBSTInstant, "ukIsBSTInstant");
function ukNowDate() {
  const now = /* @__PURE__ */ new Date();
  const off = ukIsBSTInstant(now) ? 60 : 0;
  const s = new Date(now.getTime() + off * 6e4);
  return new Date(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), s.getUTCHours(), s.getUTCMinutes(), s.getUTCSeconds(), s.getUTCMilliseconds());
}
__name(ukNowDate, "ukNowDate");
function ukOn(storage2) {
  try {
    return storage2.ukTime !== false;
  } catch {
    return true;
  }
}
__name(ukOn, "ukOn");
function nowDate(storage2) {
  return ukOn(storage2) ? ukNowDate() : /* @__PURE__ */ new Date();
}
__name(nowDate, "nowDate");
function nowISO(storage2) {
  return nowDate(storage2).toISOString();
}
__name(nowISO, "nowISO");
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
__name(extractId, "extractId");
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
__name(forceSet, "forceSet");
function forceNull(o, k) {
  try {
    if (!(k in o)) return;
  } catch {
    return;
  }
  forceSet(o, k, null);
}
__name(forceNull, "forceNull");
function mkISO(Y0, Mo, D0, H0, Mi, useUTC) {
  const dt = useUTC ? new Date(Date.UTC(Y0, Mo - 1, D0, H0, Mi, 0, 0)) : new Date(Y0, Mo - 1, D0, H0, Mi, 0, 0);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}
__name(mkISO, "mkISO");
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
__name(parseTime, "parseTime");
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
__name(parseLine, "parseLine");
function pRef(tok) {
  if (!tok) return null;
  const nn = tok.slice(1);
  return nn ? { line: parseInt(nn, 10) } : { prev: true };
}
__name(pRef, "pRef");
function decodeEntities(str) {
  return ("" + str).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2F;/gi, "/").trim();
}
__name(decodeEntities, "decodeEntities");

// src/engine.ts
var UserStore = (0, import_metro.findByStoreNameLazy)("UserStore");
var ChannelStore = (0, import_metro.findByStoreNameLazy)("ChannelStore");
var ChannelSelectors = (0, import_metro.findByPropsLazy)("getChannelId", "getLastSelectedChannelId");
var ChannelModule = (0, import_metro.findByPropsLazy)("getChannel", "getChannelId");
var GuildStore = (0, import_metro.findByStoreNameLazy)("GuildStore");
var MessageStore = (0, import_metro.findByStoreNameLazy)("MessageStore");
var EditModule = (0, import_metro.findByPropsLazy)("sendMessage", "startEditMessage", "editMessage");
var ActionSheetModule = (0, import_metro.findByPropsLazy)("openLazy", "hideActionSheet");
var ActionSheetRow = (0, import_metro.findByPropsLazy)("ActionSheetRow");
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
__name(getCurrentChannelId, "getCurrentChannelId");
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
__name(resolveServerName, "resolveServerName");
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
__name(applyTags, "applyTags");
function anyProf() {
  const p = storage.profiles;
  if (!p) return false;
  for (const _k in p) return true;
  return false;
}
__name(anyProf, "anyProf");
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
__name(firstProfiledId, "firstProfiledId");
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
__name(resolveName, "resolveName");
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
__name(resolveUsername, "resolveUsername");
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
__name(resolveAvatar, "resolveAvatar");
function mirrorSource(id, ret) {
  const uri = resolveAvatar(id);
  if (!uri) return ret;
  const prev = _avSrc.get(id);
  if (prev && prev.uri === uri) return prev.obj;
  const obj = ret && typeof ret === "object" ? Object.assign({}, ret, { uri }) : { uri };
  _avSrc.set(id, { uri, obj });
  return obj;
}
__name(mirrorSource, "mirrorSource");
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
__name(resolveCreated, "resolveCreated");
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
__name(resolveJoined, "resolveJoined");
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
        const UPS = (0, import_metro.findByStoreName)("UserProfileStore");
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
__name(resolveBanner, "resolveBanner");
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
__name(resolveAccent, "resolveAccent");
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
__name(mkAuthor, "mkAuthor");
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
__name(spoofCU, "spoofCU");
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
__name(fetchT, "fetchT");
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
__name(metaTag, "metaTag");
function ytId(url) {
  let m;
  if (m = url.match(/[?&]v=([\w-]{11})/)) return m[1];
  if (m = url.match(/youtu\.be\/([\w-]{11})/)) return m[1];
  if (m = url.match(/youtube\.com\/shorts\/([\w-]{11})/)) return m[1];
  if (m = url.match(/youtube\.com\/embed\/([\w-]{11})/)) return m[1];
  if (m = url.match(/youtube\.com\/live\/([\w-]{11})/)) return m[1];
  return null;
}
__name(ytId, "ytId");
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
__name(fetchYouTube, "fetchYouTube");
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
__name(fetchOpenGraph, "fetchOpenGraph");
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
__name(fetchEmbeds, "fetchEmbeds");
function addLinkEmbeds(channelId, message, content) {
  try {
    if (storage.embedsEnabled === false) return;
    if (!/https?:\/\//i.test("" + (content || ""))) return;
    fetchEmbeds(content).then((embeds) => {
      if (!embeds?.length) return;
      try {
        import_common.FluxDispatcher.dispatch({ type: "MESSAGE_UPDATE", message: Object.assign({}, message, { embeds }), otherPluginBypass: true });
      } catch {
      }
    }).catch(() => {
    });
  } catch {
  }
}
__name(addLinkEmbeds, "addLinkEmbeds");
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
    import_common.FluxDispatcher.dispatch({ type: "MESSAGE_CREATE", channelId, message, otherPluginBypass: true });
    try {
      import_common.FluxDispatcher.dispatch({ type: "MESSAGE_ACK", channelId, messageId: id, manual: true, immediate: true });
    } catch {
    }
    try {
      addLinkEmbeds(channelId, message, content);
    } catch {
    }
  } catch {
  }
}
__name(dispatchFakeMessage, "dispatchFakeMessage");
function saveMessage(channelId, userId, content, msgId, timestamp, replyRef) {
  const d = storage.savedMessages || [];
  const rec = { id: msgId, channelId, userId, content, timestamp, createdAt: Date.now() };
  if (replyRef) rec.replyTo = replyRef;
  d.push(rec);
  storage.savedMessages = d;
  storage._lastUpdate = Date.now();
}
__name(saveMessage, "saveMessage");
function replayChannel(channelId) {
  (storage.savedMessages || []).filter((s) => s.channelId === channelId).forEach((s) => {
    dispatchFakeMessage(s.channelId, s.userId, s.content, s.timestamp, s.id, s.replyTo);
  });
}
__name(replayChannel, "replayChannel");
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
__name(clearSaved, "clearSaved");
function removeAllFakes() {
  try {
    const list = (storage.savedMessages || []).slice();
    let removed = 0;
    for (const rec of list) {
      if (rec?.id && rec?.channelId) {
        try {
          import_common.FluxDispatcher.dispatch({ type: "MESSAGE_DELETE", id: rec.id, channelId: rec.channelId, otherPluginBypass: true });
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
__name(removeAllFakes, "removeAllFakes");
function showToastMsg(msg) {
  try {
    (0, import_toasts.showToast)(msg);
  } catch {
  }
}
__name(showToastMsg, "showToastMsg");
function dmNameFor(id) {
  try {
    const u = UserStore.getUser(id);
    if (u) return u.globalName || u.global_name || u.username || id;
  } catch {
  }
  return id;
}
__name(dmNameFor, "dmNameFor");
function findExistingDM(id) {
  try {
    const PCS = (0, import_metro.findByStoreName)("PrivateChannelStore");
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
__name(findExistingDM, "findExistingDM");
function isDM(channelId) {
  try {
    return ChannelStore?.getChannel?.(channelId)?.type === 1;
  } catch {
    return false;
  }
}
__name(isDM, "isDM");
function pushMessagesScreen(channelId) {
  try {
    const RA = (0, import_metro.findByProps)("handleTapChannel");
    if (RA?.handleTapChannel) {
      RA.handleTapChannel(channelId);
      return true;
    }
  } catch {
  }
  try {
    const RA2 = (0, import_metro.findByProps)("handlePressChannel");
    if (RA2?.handlePressChannel) {
      RA2.handlePressChannel(channelId);
      return true;
    }
  } catch {
  }
  try {
    const NavRef = (0, import_metro.findByProps)("getRootNavigationRef");
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
__name(pushMessagesScreen, "pushMessagesScreen");
function tryNavigate(channelId) {
  if (!channelId) return false;
  const sc = (0, import_metro.findByProps)("selectChannel");
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
  const tr = (0, import_metro.findByProps)("transitionToChannel");
  if (tr?.transitionToChannel) {
    try {
      tr.transitionToChannel(channelId);
      return true;
    } catch {
    }
  }
  const oc = (0, import_metro.findByProps)("openChannel");
  if (oc?.openChannel) {
    try {
      oc.openChannel({ channelId });
      return true;
    } catch {
    }
  }
  return false;
}
__name(tryNavigate, "tryNavigate");
async function openDM(userId) {
  const id = ("" + (userId || "")).trim().replace(/[^0-9]/g, "");
  if (!id || !/^\d{17,20}$/.test(id)) {
    showToastMsg("Invalid user ID.");
    return null;
  }
  const ens = (0, import_metro.findByProps)("ensurePrivateChannel");
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
  const acts = (0, import_metro.findByProps)("openPrivateChannel");
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
__name(openDM, "openDM");
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
      const ids = (0, import_metro.findByProps)("getDMUserIds")?.getDMUserIds?.(ch);
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
__name(fillFromChat, "fillFromChat");
function randGapMs() {
  return Math.floor(6e4 + Math.random() * 6e4);
}
__name(randGapMs, "randGapMs");
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
__name(runConvo, "runConvo");
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
__name(runBulkSDM, "runBulkSDM");
var _fp;
function fetchProfileSafe(uid) {
  if (!uid) return;
  try {
    if (_fp === void 0) _fp = (0, import_metro.findByProps)("fetchProfile") || null;
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
__name(fetchProfileSafe, "fetchProfileSafe");
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
__name(prefetchSources, "prefetchSources");
function installPatches() {
  const unpatches = [];
  const bDispatch = (0, import_patcher.before)("dispatch", import_common.FluxDispatcher, (s) => {
    const c = s[0];
    if (c.type === "MESSAGE_UPDATE" && c.message?.fake && !c.otherPluginBypass && !isLocalEditing) return [];
  });
  unpatches.push(bDispatch);
  try {
    const AV = (0, import_metro.findByProps)("getUserAvatarURL");
    if (AV?.getUserAvatarURL)
      unpatches.push((0, import_patcher.after)("getUserAvatarURL", AV, (a, ret) => {
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
    const AV2 = (0, import_metro.findByProps)("getUserAvatarSource");
    if (AV2?.getUserAvatarSource)
      unpatches.push((0, import_patcher.after)("getUserAvatarSource", AV2, (a, ret) => {
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
    const GAV = (0, import_metro.findByProps)("getGuildMemberAvatarURLSimple");
    if (GAV?.getGuildMemberAvatarURLSimple)
      unpatches.push((0, import_patcher.after)("getGuildMemberAvatarURLSimple", GAV, (a, ret) => {
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
      unpatches.push((0, import_patcher.after)("getAvatarURL", proto, function(_a, ret) {
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
      unpatches.push((0, import_patcher.after)("getUser", UserStore, (a, ret) => {
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
    const GMS = (0, import_metro.findByStoreName)("GuildMemberStore");
    if (GMS?.getNick)
      unpatches.push((0, import_patcher.after)("getNick", GMS, (a, ret) => {
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
      unpatches.push((0, import_patcher.after)("getMember", GMS, (a, ret) => {
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
    const NK = (0, import_metro.findByProps)("getNickname");
    if (NK?.getNickname)
      unpatches.push((0, import_patcher.after)("getNickname", NK, (a, ret) => {
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
    const NM = (0, import_metro.findByProps)("getName");
    if (NM?.getName)
      unpatches.push((0, import_patcher.after)("getName", NM, (a, ret) => {
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
    const BU = (0, import_metro.findByProps)("getUserBannerURL");
    if (BU?.getUserBannerURL)
      unpatches.push((0, import_patcher.after)("getUserBannerURL", BU, (a, ret) => {
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
      unpatches.push((0, import_patcher.after)("getBannerURL", proto, function(_a, ret) {
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
    const DU = (0, import_metro.findByProps)("getAvatarDecorationURL");
    if (DU?.getAvatarDecorationURL)
      unpatches.push((0, import_patcher.after)("getAvatarDecorationURL", DU, (a, ret) => {
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
    const UPS = (0, import_metro.findByStoreName)("UserProfileStore");
    if (UPS?.getUserProfile)
      unpatches.push((0, import_patcher.after)("getUserProfile", UPS, (a, ret) => {
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
    const BG = (0, import_metro.findByProps)("getBadges");
    if (BG?.getBadges)
      unpatches.push((0, import_patcher.after)("getBadges", BG, (a, ret) => {
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
    const BG2 = (0, import_metro.findByProps)("getUserProfileBadges");
    if (BG2?.getUserProfileBadges)
      unpatches.push((0, import_patcher.after)("getUserProfileBadges", BG2, (a, ret) => {
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
      unpatches.push((0, import_patcher.after)("getCurrentUser", UserStore, (_a, ret) => {
        try {
          if (selfActive && selfId && ret) return spoofCU(ret, selfId);
        } catch {
        }
        return ret;
      }));
  } catch {
  }
  try {
    const ICU = (0, import_metro.findByProps)("isCurrentUser");
    if (ICU?.isCurrentUser)
      unpatches.push((0, import_patcher.after)("isCurrentUser", ICU, (a, ret) => {
        try {
          const profs = storage.profiles;
          const id = extractId(a?.[0]) || a?.[0];
          if (profs && id && profs[id]?.self) return true;
        } catch {
        }
        return ret;
      }));
    const IM = (0, import_metro.findByProps)("isMe");
    if (IM?.isMe)
      unpatches.push((0, import_patcher.after)("isMe", IM, (a, ret) => {
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
      unpatches.push((0, import_patcher.after)("hideActionSheet", ActionSheetModule, () => {
        try {
          if (selfActive && Date.now() - selfAt > 400) setSelfSpoof(null, false);
        } catch {
        }
      }));
  } catch {
  }
  try {
    if (ActionSheetModule?.openLazy) {
      unpatches.push((0, import_patcher.before)("openLazy", ActionSheetModule, (s) => {
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
              const ip = (0, import_patcher.after)("default", d, (_g, h) => {
                setTimeout(ip, 0);
                const M = (0, import_utils.findInReactTree)(h, (m) => m?.[0]?.type?.name === "ActionSheetRow");
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
                  import_common.React.createElement(ASR, {
                    label: "Edit Locally",
                    icon: ASR.Icon ? import_common.React.createElement(ASR.Icon, { source: (0, import_assets.getAssetIDByName)("ic_edit_24px") }) : void 0,
                    onPress: /* @__PURE__ */ __name(() => {
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
                    }, "onPress")
                  }),
                  import_common.React.createElement(ASR, {
                    label: "Use as Fake User",
                    icon: ASR.Icon ? import_common.React.createElement(ASR.Icon, { source: (0, import_assets.getAssetIDByName)("ic_members") }) : void 0,
                    onPress: /* @__PURE__ */ __name(() => {
                      try {
                        storage.userId = a.author.id;
                        ActionSheetModule.hideActionSheet();
                        showToastMsg("Fake user set: " + (a.author.username || a.author.id));
                      } catch {
                      }
                    }, "onPress")
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
      unpatches.push((0, import_patcher.before)("editMessage", EditModule, (s) => {
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
          import_common.FluxDispatcher.dispatch({ type: "MESSAGE_UPDATE", message: { ...d, content: t.content, edited_timestamp: null }, otherPluginBypass: true });
          return [];
        }
      }));
    }
  } catch {
  }
  try {
    if (EditModule?.endEditMessage) {
      unpatches.push((0, import_patcher.after)("endEditMessage", EditModule, () => {
        if (isLocalEditing) setLocalEditing(false);
      }));
    }
  } catch {
  }
  return unpatches;
}
__name(installPatches, "installPatches");

// src/commands.ts
function argsToMap(args) {
  return Array.isArray(args) ? Object.fromEntries(args.map((a) => [a?.name, a?.value])) : args ?? {};
}
__name(argsToMap, "argsToMap");
function registerAllCommands() {
  const unregister = [];
  unregister.push((0, import_commands.registerCommand)({
    name: "spoofer",
    displayName: "spoofer",
    description: "Open the Local Message Spoofer settings.",
    displayDescription: "Open the Local Message Spoofer settings.",
    type: 1,
    inputType: 1,
    options: [],
    execute: /* @__PURE__ */ __name(() => {
      showToastMsg("Open Spoofer from the Plugins list (settings).");
    }, "execute")
  }));
  unregister.push((0, import_commands.registerCommand)({
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
    execute: /* @__PURE__ */ __name((args) => {
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
    }, "execute")
  }));
  unregister.push((0, import_commands.registerCommand)({
    name: "clearfakes",
    displayName: "clearfakes",
    description: "Clear all saved fake messages (stops them replaying).",
    displayDescription: "Clear all saved fake messages (stops them replaying).",
    type: 1,
    inputType: 1,
    options: [],
    execute: /* @__PURE__ */ __name(() => {
      clearSaved();
    }, "execute")
  }));
  unregister.push((0, import_commands.registerCommand)({
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
    execute: /* @__PURE__ */ __name((args) => {
      try {
        const map = argsToMap(args);
        openDM("" + (map.user ?? ""));
      } catch {
        showToastMsg("Couldn't run /dm.");
      }
    }, "execute")
  }));
  unregister.push((0, import_commands.registerCommand)({
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
    execute: /* @__PURE__ */ __name(async (args) => {
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
    }, "execute")
  }));
  unregister.push((0, import_commands.registerCommand)({
    name: "sdm-bulk",
    displayName: "sdm-bulk",
    description: "Send the preset script to every target in the bulk list.",
    displayDescription: "Send the preset script to every target in the bulk list.",
    type: 1,
    inputType: 1,
    options: [],
    execute: /* @__PURE__ */ __name(async () => {
      await runBulkSDM();
    }, "execute")
  }));
  return unregister;
}
__name(registerAllCommands, "registerAllCommands");

// src/settings.tsx
var import_assets2 = require("@vendetta/ui/assets");
var import_common2 = require("@vendetta/metro/common");
var import_components = require("@vendetta/ui/components");
var import_metro2 = require("@vendetta/metro");
var UserStore2 = (0, import_metro2.findByStoreNameLazy)("UserStore");
var GuildStore2 = (0, import_metro2.findByStoreNameLazy)("GuildStore");
var ChannelModule2 = (0, import_metro2.findByPropsLazy)("getChannel", "getChannelId");
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
__name(buildTimestampISO, "buildTimestampISO");
function SpooferSettings() {
  const [tick, setTick] = import_common2.React.useState(0);
  const [tab, setTab] = import_common2.React.useState(0);
  const _scrollRef = import_common2.React.useRef(null);
  const RN = import_common2.ReactNative;
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
  const bump = /* @__PURE__ */ __name(() => setTick((k) => k + 1), "bump");
  const resolveServerDisplay = /* @__PURE__ */ __name(() => {
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
  }, "resolveServerDisplay");
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
  __name(sendFakeMessage, "sendFakeMessage");
  const messageTab = import_common2.React.createElement(
    import_components.Forms.FormSection,
    { title: "Fake Message" },
    import_common2.React.createElement(import_components.Forms.FormInput, { key: "uid" + tick, title: "User ID (Optional)", placeholder: "Leave empty to use current user", value: r, onChange: /* @__PURE__ */ __name((o) => {
      storage.userId = o || "";
    }, "onChange"), helperText: c ? `User: ${c.username} - use "them" in the builder` : r ? 'User not found (still usable as "them")' : "Will use your account" }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Fill from current chat", subLabel: "Grab the other person in this DM (or the last sender in this channel).", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_members") }) : void 0, onPress: /* @__PURE__ */ __name(() => {
      const id = fillFromChat();
      if (id) {
        storage.userId = id;
        bump();
        showToastMsg("Filled User ID: " + id);
      } else showToastMsg("Couldn't find a user here.");
    }, "onPress") }),
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Message", placeholder: "Enter message content", value: s, onChange: /* @__PURE__ */ __name((o) => {
      storage.message = o || "";
    }, "onChange"), multiline: true }),
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Server ID for [server] tag (optional)", placeholder: "Paste a server ID; [server] becomes its name", value: storage.serverTagId || "", onChange: /* @__PURE__ */ __name((o) => {
      storage.serverTagId = o || "";
      bump();
    }, "onChange") }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "[server] = " + resolveServerDisplay(), subLabel: "Type [server] in your message and it's swapped for the name when sent. Use [server:123] to name a specific server inline." }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Use the server I'm in now", subLabel: "One tap - fills the box above with your current server.", onPress: /* @__PURE__ */ __name(() => {
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
    }, "onPress") }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: storage.serverPickerOpen ? "Hide server list" : "Pick from my servers", subLabel: "Choose a server by name - no ID needed.", onPress: /* @__PURE__ */ __name(() => {
      storage.serverPickerOpen = !storage.serverPickerOpen;
      bump();
    }, "onPress") }),
    storage.serverPickerOpen ? buildServerPicker(bump) : null,
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Link Previews", subLabel: "Show embeds for links in fake messages (YouTube, websites, images).", trailing: import_common2.React.createElement(import_components.Forms.FormSwitch, { value: storage.embedsEnabled !== false, onValueChange: /* @__PURE__ */ __name((o) => {
      storage.embedsEnabled = o;
    }, "onValueChange") }) }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Send Fake Message", subLabel: "Sends using the current timestamp settings.", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_send") }) : void 0, onPress: sendFakeMessage })
  );
  const timeTab = import_common2.React.createElement(
    import_components.Forms.FormSection,
    { title: "Custom Timestamp" },
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "UK time (GMT/BST)" + (ukOn(storage) ? " - ON" : " - off"), subLabel: "Automatic timestamps use UK time. Handles BST/GMT automatically.", trailing: import_common2.React.createElement(import_components.Forms.FormSwitch, { value: ukOn(storage), onValueChange: /* @__PURE__ */ __name((o) => {
      storage.ukTime = o;
      bump();
    }, "onValueChange") }) }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: ukOn(storage) ? "UTC mode (ignored while UK is on)" : storage.useUTC ? "Using UTC Time" : "Using Local Time", subLabel: ukOn(storage) ? "Turn off UK time above to use this." : storage.useUTC ? "Time will be the same for everyone" : "Time will adjust to viewer's timezone", trailing: import_common2.React.createElement(import_components.Forms.FormSwitch, { value: storage.useUTC || false, onValueChange: /* @__PURE__ */ __name((o) => {
      storage.useUTC = o;
      bump();
    }, "onValueChange") }) }),
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Year", placeholder: "YYYY", value: String(d), onChange: /* @__PURE__ */ __name((o) => {
      const a = parseInt(o);
      storage.customYear = isNaN(a) ? t.getFullYear() : a;
    }, "onChange"), keyboardType: "number-pad" }),
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Month", placeholder: "1-12", value: String(i), onChange: /* @__PURE__ */ __name((o) => {
      const a = parseInt(o);
      storage.customMonth = isNaN(a) ? t.getMonth() + 1 : Math.min(Math.max(a, 1), 12);
    }, "onChange"), keyboardType: "number-pad" }),
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Day", placeholder: "1-31", value: String(g), onChange: /* @__PURE__ */ __name((o) => {
      const a = parseInt(o);
      storage.customDay = isNaN(a) ? t.getDate() : Math.min(Math.max(a, 1), 31);
    }, "onChange"), keyboardType: "number-pad" }),
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Hour", placeholder: "0-23", value: String(h), onChange: /* @__PURE__ */ __name((o) => {
      const a = parseInt(o);
      storage.customHour = isNaN(a) ? t.getHours() : Math.min(Math.max(a, 0), 23);
    }, "onChange"), keyboardType: "number-pad" }),
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Minute", placeholder: "0-59", value: String(M), onChange: /* @__PURE__ */ __name((o) => {
      const a = parseInt(o);
      storage.customMinute = isNaN(a) ? t.getMinutes() : Math.min(Math.max(a, 0), 59);
    }, "onChange"), keyboardType: "number-pad" }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Send Fake Message", subLabel: `${u} messages saved | Timestamp: ${d}-${String(i).padStart(2, "0")}-${String(g).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(M).padStart(2, "0")}`, onPress: sendFakeMessage })
  );
  const convoTab = import_common2.React.createElement(
    import_components.Forms.FormSection,
    { title: "Conversation Builder" },
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Conversation", placeholder: "One line each:\nuserId [time] [^reply] - message\n\nme = you | them = the User ID above\n^N = reply to line N | ^ = reply to previous\n\nExample:\nme [9pm] - hey\nthem [9:01pm] ^1 - hi back\nme ^ - lol", value: storage.conversationText || "", onChange: /* @__PURE__ */ __name((o) => {
      storage.conversationText = o || "";
    }, "onChange"), multiline: true }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Build Conversation", subLabel: "'me' = you, 'them' = the User ID above. Reply with ^N or ^ (previous).", onPress: /* @__PURE__ */ __name(async () => {
      await runConvo();
    }, "onPress") }),
    import_common2.React.createElement(import_components.Forms.FormInput, { title: "Save this conversation as (optional)", placeholder: "A name to find it later", value: storage.convoSaveName || "", onChange: /* @__PURE__ */ __name((o) => {
      storage.convoSaveName = o || "";
    }, "onChange") }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Save conversation", subLabel: "Saves the text above on-device to reload later.", onPress: /* @__PURE__ */ __name(() => {
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
    }, "onPress") }),
    (storage.savedConvos || []).length ? import_common2.React.createElement(import_components.Forms.FormRow, { label: "Clear saved conversations", subLabel: (storage.savedConvos || []).length + " saved. Removes them all.", onPress: /* @__PURE__ */ __name(() => {
      storage.savedConvos = [];
      showToastMsg("Cleared saved conversations.");
      bump();
    }, "onPress") }) : null,
    ...(storage.savedConvos || []).map((sc, idx) => import_common2.React.createElement(import_components.Forms.FormRow, { key: "sc" + idx, label: sc.name, subLabel: "Tap to load this into the builder.", onPress: /* @__PURE__ */ __name(() => {
      storage.conversationText = sc.text || "";
      showToastMsg('Loaded "' + sc.name + '".');
      bump();
    }, "onPress") }))
  );
  const sdmTab = import_common2.React.createElement(
    import_common2.React.Fragment,
    {},
    import_common2.React.createElement(
      import_components.Forms.FormSection,
      { title: "SDM Preset Script" },
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "How it works", subLabel: "Write a message template below. When you run /sdm (userid) without a message, this script is sent instead. Use [server] and any custom keywords you define." }),
      import_common2.React.createElement(import_components.Forms.FormInput, { key: "sdmscript" + tick, title: "Preset Script", placeholder: "e.g. Hey! I saw you in [server], wanted to reach out about [topic]...", value: storage.sdmScript || "", onChange: /* @__PURE__ */ __name((o) => {
        storage.sdmScript = o || "";
      }, "onChange"), multiline: true }),
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "Preview", subLabel: (() => {
        const raw = storage.sdmScript || "";
        if (!raw.trim()) return "(no script set)";
        const resolved = applyTags(raw, getCurrentChannelId());
        return resolved.length > 200 ? resolved.slice(0, 200) + "..." : resolved;
      })() }),
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "Custom Keywords", subLabel: (storage.sdmKeywords || []).length ? (storage.sdmKeywords || []).length + " keyword(s) defined. Use [keyword] in your script." : "No custom keywords yet. Add one below." }),
      ...(storage.sdmKeywords || []).map((kw, idx) => import_common2.React.createElement(import_components.Forms.FormRow, { key: "kw" + idx, label: "[" + kw.key + "] = " + kw.value, subLabel: "Tap to remove this keyword.", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_trash_24px") }) : void 0, onPress: /* @__PURE__ */ __name(() => {
        const arr = (storage.sdmKeywords || []).slice();
        arr.splice(idx, 1);
        storage.sdmKeywords = arr;
        showToastMsg("Removed [" + kw.key + "].");
        bump();
      }, "onPress") })),
      import_common2.React.createElement(import_components.Forms.FormInput, { key: "newkwname" + tick, title: "New keyword name", placeholder: "e.g. topic, greeting, invite", value: storage.newKeywordName || "", onChange: /* @__PURE__ */ __name((o) => {
        storage.newKeywordName = o || "";
      }, "onChange") }),
      import_common2.React.createElement(import_components.Forms.FormInput, { key: "newkwval" + tick, title: "New keyword value", placeholder: "What [keyword] gets replaced with", value: storage.newKeywordValue || "", onChange: /* @__PURE__ */ __name((o) => {
        storage.newKeywordValue = o || "";
      }, "onChange") }),
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "Add Keyword", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_add_24px") || (0, import_assets2.getAssetIDByName)("ic_add") }) : void 0, onPress: /* @__PURE__ */ __name(() => {
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
      }, "onPress") }),
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "Clear All Keywords", subLabel: "Remove every custom keyword.", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_trash_24px") }) : void 0, onPress: /* @__PURE__ */ __name(() => {
        storage.sdmKeywords = [];
        showToastMsg("Cleared all custom keywords.");
        bump();
      }, "onPress") })
    ),
    import_common2.React.createElement(
      import_components.Forms.FormSection,
      { title: "Bulk SDM" },
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "How it works", subLabel: "One target per line: userId serverId. Each gets the preset script with [server] resolved to their specific server. Run with the button below or /sdm-bulk." }),
      import_common2.React.createElement(import_components.Forms.FormInput, { key: "sdmbulk" + tick, title: "Bulk Target List", placeholder: "userId serverId\nuserId serverId\n\ne.g.\n123456789 987654321\n111222333 444555666", value: storage.sdmBulkList || "", onChange: /* @__PURE__ */ __name((o) => {
        storage.sdmBulkList = o || "";
      }, "onChange"), multiline: true }),
      import_common2.React.createElement(import_components.Forms.FormRow, { label: (() => {
        const raw = ("" + (storage.sdmBulkList || "")).trim();
        if (!raw) return "0 targets";
        const ct = raw.split(/\r?\n/).filter((l) => l.trim() && /^\d{5,}/.test(l.trim())).length;
        return ct + " target" + (ct === 1 ? "" : "s") + " in list";
      })(), subLabel: "Each line should be: userId serverId (server ID is optional)." }),
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "Run Bulk SDM", subLabel: "Opens a DM with each target and sends the preset script.", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_send") }) : void 0, onPress: /* @__PURE__ */ __name(async () => {
        await runBulkSDM();
        bump();
      }, "onPress") }),
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "Clear Bulk List", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_trash_24px") }) : void 0, onPress: /* @__PURE__ */ __name(() => {
        storage.sdmBulkList = "";
        showToastMsg("Cleared bulk list.");
        bump();
      }, "onPress") })
    )
  );
  const savedTab = import_common2.React.createElement(
    import_components.Forms.FormSection,
    { title: "Saved Messages" },
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Clear Saved Messages", subLabel: u + " saved. These replay each time you reopen a channel - clearing stops that.", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_trash_24px") }) : void 0, onPress: /* @__PURE__ */ __name(() => {
      clearSaved();
      bump();
    }, "onPress") }),
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Remove All Spoofed Messages", subLabel: "Deletes every spoofed message from view now and clears the saved list.", leading: import_components.Forms.FormRow.Icon ? import_common2.React.createElement(import_components.Forms.FormRow.Icon, { source: (0, import_assets2.getAssetIDByName)("ic_trash_24px") }) : void 0, onPress: /* @__PURE__ */ __name(() => {
      removeAllFakes();
      bump();
    }, "onPress") })
  );
  const tabs = [messageTab, timeTab, convoTab, sdmTab, savedTab];
  const tabLabels = ["Message", "Time", "Convo", "SDM", "Saved"];
  if (!_canSwipe) {
    return import_common2.React.createElement(
      import_common2.React.Fragment,
      {},
      import_common2.React.createElement(import_components.Forms.FormRow, { label: "Local Message Spoofer", subLabel: "Local-only fake messages - nothing leaves your device" }),
      ...tabs
    );
  }
  return import_common2.React.createElement(
    import_common2.React.Fragment,
    {},
    import_common2.React.createElement(import_components.Forms.FormRow, { label: "Local Message Spoofer", subLabel: "Local-only fake messages - nothing leaves your device" }),
    import_common2.React.createElement(
      _View,
      { key: "pager" },
      import_common2.React.createElement(
        _View,
        { style: { flexDirection: "row", paddingHorizontal: 6, marginBottom: 10, marginTop: 4 } },
        ...tabLabels.map((lbl, idx) => import_common2.React.createElement(
          _Touch,
          {
            key: "tab" + idx,
            style: { flex: 1, paddingVertical: 9, alignItems: "center", borderBottomWidth: 2, borderBottomColor: tab === idx ? "#5865f2" : "rgba(255,255,255,0.08)" },
            onPress: /* @__PURE__ */ __name(() => {
              setTab(idx);
              try {
                _scrollRef.current?.scrollTo({ x: idx * _width, animated: true });
              } catch {
              }
            }, "onPress")
          },
          import_common2.React.createElement(_Text, { style: { color: tab === idx ? "#ffffff" : "#949ba4", fontSize: 13, fontWeight: tab === idx ? "600" : "400" } }, lbl)
        ))
      ),
      import_common2.React.createElement(
        _SV,
        {
          ref: _scrollRef,
          horizontal: true,
          pagingEnabled: true,
          showsHorizontalScrollIndicator: false,
          keyboardShouldPersistTaps: "handled",
          onMomentumScrollEnd: /* @__PURE__ */ __name((ev) => {
            try {
              setTab(Math.round(ev.nativeEvent.contentOffset.x / _width));
            } catch {
            }
          }, "onMomentumScrollEnd")
        },
        ...tabs.map((content, idx) => import_common2.React.createElement(
          _View,
          { key: "page" + idx, style: { width: _width } },
          import_common2.React.createElement(
            _SV,
            { style: { maxHeight: 560 }, contentContainerStyle: { paddingTop: 8, paddingHorizontal: 14, paddingBottom: 180 }, keyboardShouldPersistTaps: "handled", nestedScrollEnabled: true },
            content
          )
        ))
      )
    )
  );
}
__name(SpooferSettings, "SpooferSettings");
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
    import_common2.React.createElement(import_components.Forms.FormInput, { key: "ssearch", title: "Search servers", placeholder: "Type a server name", value: storage.serverSearch || "", onChange: /* @__PURE__ */ __name((o) => {
      storage.serverSearch = o || "";
      bump();
    }, "onChange") })
  ];
  if (!shown.length) rows.push(import_common2.React.createElement(import_components.Forms.FormRow, { key: "snone", label: sq ? "(no servers match)" : "(no servers found)" }));
  shown.forEach((g) => rows.push(import_common2.React.createElement(import_components.Forms.FormRow, {
    key: "g" + g.id,
    label: g.name,
    onPress: /* @__PURE__ */ __name(() => {
      storage.serverTagId = g.id;
      storage.serverPickerOpen = false;
      storage.serverSearch = "";
      showToastMsg('Set to "' + g.name + '".');
      bump();
    }, "onPress")
  })));
  if (total > shown.length) rows.push(import_common2.React.createElement(import_components.Forms.FormRow, { key: "smore", label: total - shown.length + " more - keep typing to narrow", subLabel: "Showing the first 30 matches." }));
  return rows;
}
__name(buildServerPicker, "buildServerPicker");

// src/index.ts
var cleanups = [];
var onLoad = /* @__PURE__ */ __name(() => {
  initDefaults();
  const unpatches = installPatches();
  const unregister = registerAllCommands();
  const onChannelSelect = /* @__PURE__ */ __name((ev) => {
    try {
      if (ev?.channelId) replayChannel(ev.channelId);
    } catch {
    }
  }, "onChannelSelect");
  import_common3.FluxDispatcher.subscribe("CHANNEL_SELECT", onChannelSelect);
  try {
    prefetchSources();
  } catch {
  }
  cleanups = [
    ...unregister,
    ...unpatches,
    () => import_common3.FluxDispatcher.unsubscribe("CHANNEL_SELECT", onChannelSelect)
  ];
}, "onLoad");
var onUnload = /* @__PURE__ */ __name(() => {
  cleanups.forEach((fn) => {
    try {
      fn();
    } catch {
    }
  });
  cleanups = [];
  originalMessages.clear();
  setLocalEditing(false);
}, "onUnload");
var settings = SpooferSettings;
