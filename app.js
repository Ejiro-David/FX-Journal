const DB_NAME = "lazyButDataV4";
const DB_VERSION = 1;
const TRADE_STORE = "trades";
const IMAGE_STORE = "images";
const CLOUD_SYNC_INTERVAL_MS = 15000;
const SUPABASE_URL = "https://glvskwnsotlotzfjnssz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tsFYhQmml_1X_qPmmrfR3A_EstQOROS";
const SUPABASE_TRADES_TABLE = "journal_trades";
const SUPABASE_SETTINGS_TABLE = "journal_settings";
const SUPABASE_IMAGE_BUCKET = "trade-images";

const STORAGE_KEYS = {
  LEGACY_WIPE_FLAG: "lazyButDataLegacyWipedV4",
  LEGACY_STORAGE_KEY: "lazyButDataTradesV3",
  DEFAULTS_KEY: "lazyButDataDefaultsV4",
  PAIR_REGISTRY_KEY: "lazyButDataPairsV4",
  THEME_KEY: "lazyButDataThemeV1",
  SETTINGS_KEY: "lazyButDataSettingsV1",
  SETTINGS_UPDATED_KEY: "lazyButDataSettingsUpdatedV1",
  SYNC_QUEUE_KEY: "lazyButDataSyncQueueV1",
  SYNC_CURSOR_KEY: "lazyButDataSyncCursorV1",
  AUTH_EMAIL_KEY: "lazyButDataAuthEmailV1",
  IMAGE_HYDRATION_MISS_KEY: "lazyButDataImageHydrationMissV1",
  LOT_SIZE_MIGRATION_KEY: "lazyButDataLotSizeMigrationV1",
};

const ADD_PAIR_OPTION_VALUE = "__ADD_PAIR_OPTION__";

const PAIRS = ["GBPUSD", "EURUSD", "USDJPY", "XAUUSD", "NAS100"];
const OUTCOMES = ["Full Win", "Partial + BE", "Breakeven", "Full Loss"];
const DEFAULT_SESSION_OPTIONS = ["London", "NY", "Asian"];
const DEFAULT_LOT_SIZE = 0.01;
const LOT_SIZE_STEP = 0.01;
const LOT_SIZE_MIN = 0.01;

function createBaseSettings() {
  return {
    showInsightReel: false,
    strategyMode: "all",
    sessionOptions: [...DEFAULT_SESSION_OPTIONS],
    ruleChangeMode: "new_only",
  };
}

const {
  LEGACY_WIPE_FLAG,
  LEGACY_STORAGE_KEY,
  DEFAULTS_KEY,
  PAIR_REGISTRY_KEY,
  THEME_KEY,
  SETTINGS_KEY,
  SETTINGS_UPDATED_KEY,
  SYNC_QUEUE_KEY,
  SYNC_CURSOR_KEY,
  AUTH_EMAIL_KEY,
  IMAGE_HYDRATION_MISS_KEY,
  LOT_SIZE_MIGRATION_KEY,
} = STORAGE_KEYS;

const DEFAULT_STRATEGIES = ["ICC", "SMC"];

const INTEGRITY_ORDER = ["Full", "High", "Reduced", "Bad"];

const STRATEGY_CONFIG = {
  SMC: {
    core: [
      "Clear liquidity sweep",
      "Valid MSS / displacement body close",
      "FVG present",
    ],
    backing: [
      "HTF bias aligned",
      "Structural liquidity in trade direction",
    ],
    quality: ["First clean return to zone"],
    entryTypes: ["OB", "Breaker", "Liquidity entry", "FVG-only"],
  },
  ICC: {
    core: [
      "Clear indication / expansion leg present",
      "Proper correction / sweep formed",
      "Valid 15m MSS body close",
    ],
    backing: ["HTF bias aligned", "NY/overlap window aligned"],
    quality: ["First clean pullback after MSS"],
  },
};

const CONFLUENCE_RULES = {
  SMC: {
    core: [...STRATEGY_CONFIG.SMC.core],
    backing: [...STRATEGY_CONFIG.SMC.backing],
    quality: [...STRATEGY_CONFIG.SMC.quality],
  },
  ICC: {
    core: [...STRATEGY_CONFIG.ICC.core],
    backing: [...STRATEGY_CONFIG.ICC.backing],
    quality: [...STRATEGY_CONFIG.ICC.quality],
  },
};

const BACKING_LABEL_MAP = {
  "HTF bias aligned": "off-bias",
  "Structural liquidity in trade direction": "no structural objective",
  "NY/overlap window aligned": "off-session",
};

const BACKING_PRIORITY = [
  "HTF bias aligned",
  "NY/overlap window aligned",
  "Structural liquidity in trade direction",
];

const CORE_LABEL_MAP = {
  "Clear liquidity sweep": "no liquidity sweep",
  "Valid MSS / displacement body close": "no MSS/displacement",
  "FVG present": "no FVG",
  "Clear indication / expansion leg present": "no indication leg",
  "Proper correction / sweep formed": "no correction/sweep",
  "Valid 15m MSS body close": "no 15m MSS",
};

function integrityLabel(value) {
  switch (value) {
    case "Full":
      return "Full";
    case "High":
      return "High";
    case "Reduced":
      return "Reduced";
    default:
      return "Bad";
  }
}

function pickPrimaryBackingIssue(missingBacking) {
  const set = new Set(missingBacking || []);
  for (const key of BACKING_PRIORITY) {
    if (set.has(key)) {
      return BACKING_LABEL_MAP[key] || "weak backing";
    }
  }
  const first = (missingBacking || [])[0];
  return BACKING_LABEL_MAP[first] || "weak backing";
}

const TAB_INSIGHTS = {
  performance: [
    "total_trades",
    "closed_trades",
    "open_trades",
    "net_pnl",
    "win_rate",
    "expectancy_per_trade",
    "profit_factor",
    "average_win",
    "average_loss",
  ],
  risk: [
    "max_drawdown",
    "current_drawdown",
    "worst_trade",
    "max_win_streak",
    "max_loss_streak",
    "recovery_factor",
  ],
  confluence: [
    "strategy_mix",
    "setup_grade_distribution",
    "full_soft_hard_performance",
    "missing_required_frequency",
    "missing_quality_frequency",
    "confluence_compliance_trend",
  ],
  sessions: [
    "session_net_pnl",
    "session_win_rate",
    "session_expectancy",
    "hour_expectancy",
    "time_to_close_distribution",
  ],
  market: [
    "pair_pnl_ranking",
    "pair_expectancy_ranking",
    "direction_split_pnl",
    "direction_split_win_rate",
    "lot_size_bucket_expectancy",
  ],
  behavior: [
    "image_completeness_rate",
    "note_usage_and_median_length",
    "edit_frequency_per_trade",
    "image_hydration_misses",
  ],
};

const METRIC_LABELS = {
  total_trades: "Total Trades",
  closed_trades: "Closed Trades",
  open_trades: "Open Trades",
  net_pnl: "Net PnL",
  gross_profit: "Gross Profit",
  gross_loss: "Gross Loss",
  win_rate: "Win Rate",
  loss_rate: "Loss Rate",
  breakeven_rate: "Breakeven Rate",
  profit_factor: "Profit Factor",
  expectancy_per_trade: "Expectancy / Trade",
  average_win: "Average Win",
  average_loss: "Average Loss",
  win_loss_size_ratio: "Win/Loss Size Ratio",
  outcome_distribution: "Outcome Distribution",
  equity_curve: "Equity Curve",
  drawdown_curve: "Drawdown Curve",
  max_drawdown: "Max Drawdown",
  current_drawdown: "Current Drawdown",
  longest_drawdown_duration: "Longest Drawdown Duration",
  best_trade: "Best Trade",
  worst_trade: "Worst Trade",
  max_win_streak: "Max Win Streak",
  max_loss_streak: "Max Loss Streak",
  recovery_factor: "Recovery Factor",
  strategy_mix: "Strategy Mix",
  strategy_net_pnl: "Strategy Net PnL",
  strategy_win_rate: "Strategy Win Rate",
  confluence_score_distribution: "Confluence Score Distribution",
  setup_integrity_distribution: "Setup Integrity Distribution",
  setup_grade_distribution: "Setup Grade Distribution",
  missing_confluence_frequency_overall: "Missing Confluence Frequency",
  missing_required_frequency: "Missing Required Frequency",
  missing_quality_frequency: "Missing Quality Frequency",
  full_soft_hard_performance: "Full/Soft/Hard Performance",
  confluence_compliance_trend: "Confluence Compliance Trend",
  grade_vs_pnl_distribution: "Grade vs PnL Distribution",
  session_mix_share: "Session Mix Share",
  session_net_pnl: "Session Net PnL",
  session_win_rate: "Session Win Rate",
  session_expectancy: "Session Expectancy",
  session_x_strategy_heatmap: "Session x Strategy Heatmap",
  session_x_pair_heatmap: "Session x Pair Heatmap",
  hour_trade_frequency: "Hour-of-Day Frequency",
  hour_expectancy: "Hour-of-Day Expectancy",
  day_of_week_performance: "Day-of-Week Performance",
  time_to_close_distribution: "Time-to-Close Distribution",
  pair_pnl_ranking: "Pair PnL Ranking",
  pair_win_rate_ranking: "Pair Win Rate Ranking",
  pair_expectancy_ranking: "Pair Expectancy Ranking",
  direction_split_pnl: "Direction Split PnL",
  direction_split_win_rate: "Direction Split Win Rate",
  lot_size_vs_pnl_scatter: "Lot Size vs PnL Scatter",
  lot_size_bucket_expectancy: "Lot Bucket Expectancy",
  open_trade_aging: "Open Trade Aging",
  image_completeness_rate: "Image Completeness Rate",
  before_presence_rate: "Before Image Presence",
  after_presence_rate: "After Image Presence",
  image_hydration_misses: "Image Hydration Misses",
  note_usage_and_median_length: "Note Usage + Median Length",
  edit_frequency_per_trade: "Edit Frequency / Trade",
};

function createToastController(toastEl, options = {}) {
  const defaultDuration = Number.isFinite(options.defaultDuration) ? options.defaultDuration : 1800;
  const queue = [];
  let timer = null;
  let active = false;

  function hideAndContinue() {
    toastEl.className = "toast";
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      active = false;
      flush();
    }, 120);
  }

  function flush() {
    if (active || !queue.length) {
      return;
    }
    const { message, tone, duration } = queue.shift();
    active = true;
    toastEl.textContent = message;
    toastEl.className = "toast show" + (tone ? ` ${tone}` : "");

    window.clearTimeout(timer);
    timer = window.setTimeout(hideAndContinue, duration);
  }

  return {
    show(message, tone = "", duration = defaultDuration) {
      const text = String(message || "").trim();
      if (!text) {
        return;
      }
      queue.push({
        message: text,
        tone: tone || "",
        duration: Number.isFinite(duration) ? duration : defaultDuration,
      });
      flush();
    },
    clear() {
      queue.length = 0;
      active = false;
      window.clearTimeout(timer);
      toastEl.className = "toast";
    },
  };
}

function createIdbStorage(options = {}) {
  const {
    dbName = "lazyButDataV4",
    dbVersion = 1,
    tradeStore = "trades",
    imageStore = "images",
  } = options;

  let dbPromise;

  async function openDb() {
    if (dbPromise) {
      return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(tradeStore)) {
          db.createObjectStore(tradeStore, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(imageStore)) {
          db.createObjectStore(imageStore, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
    });

    return dbPromise;
  }

  function idbRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
    });
  }

  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    });
  }

  async function dbGetAllTrades() {
    const db = await openDb();
    const tx = db.transaction(tradeStore, "readonly");
    const store = tx.objectStore(tradeStore);
    const rows = await idbRequest(store.getAll());
    await txDone(tx);
    return Array.isArray(rows) ? rows : [];
  }

  async function dbPutTrade(trade) {
    const db = await openDb();
    const tx = db.transaction(tradeStore, "readwrite");
    tx.objectStore(tradeStore).put(trade);
    await txDone(tx);
  }

  async function dbDeleteTrade(id) {
    const db = await openDb();
    const tx = db.transaction(tradeStore, "readwrite");
    tx.objectStore(tradeStore).delete(id);
    await txDone(tx);
  }

  async function dbSaveImage(blob) {
    const db = await openDb();
    const id = crypto.randomUUID();
    const tx = db.transaction(imageStore, "readwrite");
    tx.objectStore(imageStore).put({ id, blob, created_at: new Date().toISOString() });
    await txDone(tx);
    return id;
  }

  async function dbPutImage(id, blob) {
    if (!id || !blob) {
      return;
    }
    const db = await openDb();
    const tx = db.transaction(imageStore, "readwrite");
    tx.objectStore(imageStore).put({ id, blob, created_at: new Date().toISOString() });
    await txDone(tx);
  }

  async function dbDeleteImage(id) {
    if (!id) {
      return;
    }
    const db = await openDb();
    const tx = db.transaction(imageStore, "readwrite");
    tx.objectStore(imageStore).delete(id);
    await txDone(tx);
  }

  async function dbGetImage(id) {
    if (!id) {
      return null;
    }
    const db = await openDb();
    const tx = db.transaction(imageStore, "readonly");
    const record = await idbRequest(tx.objectStore(imageStore).get(id));
    await txDone(tx);
    return record?.blob || null;
  }

  async function dbGetImages(ids) {
    const result = new Map();
    const validIds = (Array.isArray(ids) ? ids : []).filter(Boolean);
    if (!validIds.length) {
      return result;
    }

    const db = await openDb();
    const tx = db.transaction(imageStore, "readonly");
    const store = tx.objectStore(imageStore);

    await Promise.all(
      validIds.map(async (id) => {
        const record = await idbRequest(store.get(id));
        if (record?.blob) {
          result.set(id, record.blob);
        }
      })
    );

    await txDone(tx);
    return result;
  }

  return {
    openDb,
    dbGetAllTrades,
    dbPutTrade,
    dbDeleteTrade,
    dbSaveImage,
    dbPutImage,
    dbDeleteImage,
    dbGetImage,
    dbGetImages,
  };
}

function createSupabaseClient() {
  const hasClientFactory = Boolean(window.supabase && typeof window.supabase.createClient === "function");
  if (!hasClientFactory || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

function loadSyncQueue() {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveSyncQueue(queue) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(Array.isArray(queue) ? queue : []));
}

function getSyncCursor() {
  return localStorage.getItem(SYNC_CURSOR_KEY) || "";
}

function setSyncCursor(cursor) {
  if (!cursor) {
    return;
  }
  localStorage.setItem(SYNC_CURSOR_KEY, cursor);
}

function getSettingsUpdatedAt() {
  return localStorage.getItem(SETTINGS_UPDATED_KEY) || "";
}

function setSettingsUpdatedAt(value) {
  if (!value) {
    return;
  }
  localStorage.setItem(SETTINGS_UPDATED_KEY, value);
}

function queueSyncOperation(operation) {
  if (!operation || !operation.type) {
    return;
  }

  const next = {
    type: operation.type,
    queued_at: operation.queued_at || new Date().toISOString(),
    trade_id: operation.trade_id || null,
    image_id: operation.image_id || null,
    updated_at: operation.updated_at || new Date().toISOString(),
    retry_count: Number(operation.retry_count || 0),
  };

  let queue = loadSyncQueue();
  if (next.type === "settings_upsert") {
    queue = queue.filter((item) => item.type !== "settings_upsert");
  }
  if (next.type === "trade_upsert" || next.type === "trade_delete") {
    queue = queue.filter((item) => !(item.trade_id && item.trade_id === next.trade_id && (item.type === "trade_upsert" || item.type === "trade_delete")));
  }
  if (next.type === "image_upload" || next.type === "image_delete") {
    queue = queue.filter((item) => !(item.image_id && item.image_id === next.image_id && (item.type === "image_upload" || item.type === "image_delete")));
  }

  queue.push(next);
  saveSyncQueue(queue);
  updateCloudSyncUi();
  scheduleCloudSync(850);
}

function scheduleCloudSync(delayMs = 0) {
  if (!supabaseClient) {
    return;
  }
  window.clearTimeout(cloudSyncTimer);
  
  // Rate limit: enforce minimum interval between sync attempts
  const timeSinceLastSync = Date.now() - lastCloudSyncTime;
  const actualDelay = Math.max(Number(delayMs) || 0, Math.max(0, MIN_SYNC_INTERVAL_MS - timeSinceLastSync));
  
  cloudSyncTimer = window.setTimeout(() => {
    runCloudSync().catch((error) => {
      console.error(error);
    });
  }, actualDelay);
}

function buildImageStoragePath(userId, imageId) {
  return `${userId}/${imageId}`;
}

function updateCloudSyncUi() {
  const queue = loadSyncQueue();
  const pending = queue.length;
  const pendingLabel = `${pending} ${pending === 1 ? "change" : "changes"}`;

  if (syncQueueHintEl) {
    syncQueueHintEl.textContent = `Your data is safe locally. ${pendingLabel} waiting to sync.`;
  }

  if (syncLastSyncEl) {
    syncLastSyncEl.textContent = lastCloudSyncAt
      ? `Last sync: ${formatDateTime(lastCloudSyncAt)}`
      : "Last sync: never";
  }

  if (authStatusEl) {
    authStatusEl.textContent = authUser?.email ? `Signed in as ${authUser.email}` : "Not signed in";
  }

  if (authSignOutBtn) {
    authSignOutBtn.disabled = !authUser || isCloudSyncing;
  }
  if (authSignInBtn) {
    authSignInBtn.disabled = isCloudSyncing;
  }
  if (syncNowBtn) {
    syncNowBtn.disabled = !authUser || isCloudSyncing;
  }

  if (!syncStatusPillEl) {
    return;
  }

  let className = "sync-pill is-offline";
  let label = "Offline";

  if (!supabaseClient) {
    className = "sync-pill is-error";
    label = "Cloud Unavailable";
  } else if (!authUser) {
    className = "sync-pill is-offline";
    label = "Offline";
  } else if (isCloudSyncing) {
    className = "sync-pill is-syncing";
    label = "Syncing";
  } else if (!navigator.onLine) {
    className = "sync-pill is-offline";
    label = "Offline";
  } else if (cloudSyncError) {
    className = "sync-pill is-error";
    label = "Sync Error";
  } else if (pending > 0) {
    className = "sync-pill is-pending";
    label = "Pending Changes";
  } else {
    className = "sync-pill is-synced";
    label = "Synced";
  }

  syncStatusPillEl.className = className;
  syncStatusPillEl.textContent = label;

  if (settingsSyncCardEl) {
    const isHealthy = className.includes("is-synced");
    settingsSyncCardEl.classList.toggle("sync-compact", isHealthy);
  }
}

function getTradeById(tradeId) {
  return trades.find((trade) => trade.id === tradeId) || null;
}

async function saveTradeRecord(trade, options = {}) {
  const { enqueue = true } = options;
  await dbPutTrade(trade);
  if (enqueue) {
    queueSyncOperation({
      type: "trade_upsert",
      trade_id: trade.id,
      updated_at: trade.updated_at || new Date().toISOString(),
    });
  }
}

async function deleteTradeRecord(tradeId, options = {}) {
  const { enqueue = true } = options;
  await dbDeleteTrade(tradeId);
  if (enqueue) {
    queueSyncOperation({
      type: "trade_delete",
      trade_id: tradeId,
      updated_at: new Date().toISOString(),
    });
  }
}

async function saveImageRecord(blob, options = {}) {
  const { enqueue = true } = options;
  const imageId = await dbSaveImage(blob);
  if (enqueue) {
    queueSyncOperation({
      type: "image_upload",
      image_id: imageId,
    });
  }
  return imageId;
}

async function putImageRecord(imageId, blob, options = {}) {
  const { enqueue = false } = options;
  await dbPutImage(imageId, blob);
  if (enqueue) {
    queueSyncOperation({
      type: "image_upload",
      image_id: imageId,
    });
  }
}

async function deleteImageRecord(imageId, options = {}) {
  const { enqueue = true } = options;
  await dbDeleteImage(imageId);
  if (enqueue && imageId) {
    queueSyncOperation({
      type: "image_delete",
      image_id: imageId,
    });
  }
}

async function initCloudSync() {
  if (authEmailEl) {
    authEmailEl.value = localStorage.getItem(AUTH_EMAIL_KEY) || "";
  }

  if (!supabaseClient) {
    updateCloudSyncUi();
    return;
  }

  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();
  if (error) {
    console.error(error);
  }
  authUser = session?.user || null;
  cloudSyncError = "";
  updateCloudSyncUi();

  supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
    authUser = nextSession?.user || null;
    cloudSyncError = "";
    updateCloudSyncUi();
    if (authUser) {
      scheduleCloudSync(200);
    }
  });

  window.addEventListener("online", () => {
    cloudSyncError = "";
    updateCloudSyncUi();
    scheduleCloudSync(120);
  });
  window.addEventListener("offline", updateCloudSyncUi);

  window.setInterval(() => {
    runCloudSync().catch((syncError) => {
      console.error(syncError);
    });
  }, CLOUD_SYNC_INTERVAL_MS);

  if (authUser) {
    scheduleCloudSync(300);
  }
}

async function sendMagicLinkSignIn() {
  if (!supabaseClient) {
    showToast("Cloud sync unavailable", "bad");
    return;
  }
  const email = String(authEmailEl?.value || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    showToast("Enter a valid email", "bad");
    return;
  }

  localStorage.setItem(AUTH_EMAIL_KEY, email);
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) {
    throw error;
  }
  showToast("Magic link sent. Check your inbox.", "ok");
}

async function signOutCloudSync() {
  if (!supabaseClient) {
    return;
  }
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    throw error;
  }
  authUser = null;
  updateCloudSyncUi();
}

async function runCloudSync(options = {}) {
  const { showFeedback = false } = options;
  if (!supabaseClient || !authUser || !navigator.onLine || isCloudSyncing) {
    updateCloudSyncUi();
    return;
  }

  isCloudSyncing = true;
  cloudSyncError = "";
  updateCloudSyncUi();

  try {
    ensureInitialCloudSeedQueue();
    await pushCloudQueue();
    await pullCloudSettings();
    await pullCloudTrades();
    lastCloudSyncAt = new Date().toISOString();
    lastCloudSyncTime = Date.now(); // Record sync time for rate limiting
    if (showFeedback) {
      showToast("Cloud sync complete", "ok");
    }
  } catch (error) {
    cloudSyncError = error?.message || "Cloud sync failed";
    lastCloudSyncTime = Date.now(); // Record time even on error to rate limit retries
    if (showFeedback) {
      showToast(cloudSyncError, "bad");
    }
    throw error;
  } finally {
    isCloudSyncing = false;
    updateCloudSyncUi();
  }
}

function ensureInitialCloudSeedQueue() {
  if (!authUser) {
    return;
  }
  const hasCursor = Boolean(getSyncCursor());
  const queue = loadSyncQueue();
  if (hasCursor || queue.length || !trades.length) {
    return;
  }

  const seededQueue = [...queue];
  trades.forEach((trade) => {
    seededQueue.push({
      type: "trade_upsert",
      trade_id: trade.id,
      updated_at: trade.updated_at || new Date().toISOString(),
      queued_at: new Date().toISOString(),
      retry_count: 0,
    });

    if (trade.before_image_id) {
      seededQueue.push({
        type: "image_upload",
        image_id: trade.before_image_id,
        queued_at: new Date().toISOString(),
        retry_count: 0,
      });
    }
    if (trade.after_image_id) {
      seededQueue.push({
        type: "image_upload",
        image_id: trade.after_image_id,
        queued_at: new Date().toISOString(),
        retry_count: 0,
      });
    }
  });
  seededQueue.push({
    type: "settings_upsert",
    updated_at: getSettingsUpdatedAt() || new Date().toISOString(),
    queued_at: new Date().toISOString(),
    retry_count: 0,
  });

  saveSyncQueue(seededQueue);
  updateCloudSyncUi();
}

async function pushCloudQueue() {
  if (!supabaseClient || !authUser) {
    return;
  }
  const queue = loadSyncQueue();
  if (!queue.length) {
    return;
  }

  const remaining = [...queue];
  while (remaining.length) {
    const operation = remaining[0];
    try {
      await applyCloudQueueOperation(operation);
      remaining.shift();
      saveSyncQueue(remaining);
      updateCloudSyncUi();
    } catch (error) {
      operation.retry_count = Number(operation.retry_count || 0) + 1;
      remaining[0] = operation;
      saveSyncQueue(remaining);
      throw error;
    }
  }
}

async function applyCloudQueueOperation(operation) {
  if (!supabaseClient || !authUser) {
    return;
  }

  if (operation.type === "trade_upsert") {
    const trade = getTradeById(operation.trade_id);
    if (!trade) {
      return;
    }
    const { error } = await supabaseClient.from(SUPABASE_TRADES_TABLE).upsert(
      {
        id: trade.id,
        user_id: authUser.id,
        trade,
        updated_at: trade.updated_at || new Date().toISOString(),
        deleted_at: null,
      },
      { onConflict: "id" }
    );
    if (error) {
      throw error;
    }
    return;
  }

  if (operation.type === "trade_delete") {
    const deletedAt = operation.updated_at || new Date().toISOString();
    const { error } = await supabaseClient.from(SUPABASE_TRADES_TABLE).upsert(
      {
        id: operation.trade_id,
        user_id: authUser.id,
        trade: null,
        updated_at: deletedAt,
        deleted_at: deletedAt,
      },
      { onConflict: "id" }
    );
    if (error) {
      throw error;
    }
    return;
  }

  if (operation.type === "settings_upsert") {
    const { error } = await supabaseClient.from(SUPABASE_SETTINGS_TABLE).upsert(
      {
        user_id: authUser.id,
        settings: appSettings,
        updated_at: getSettingsUpdatedAt() || new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) {
      throw error;
    }
    return;
  }

  if (operation.type === "image_upload") {
    await syncImageBlobToCloud(operation.image_id);
    return;
  }

  if (operation.type === "image_delete") {
    await removeImageFromCloud(operation.image_id);
  }
}

async function syncImageBlobToCloud(imageId) {
  if (!imageId || !supabaseClient || !authUser) {
    return;
  }
  const blob = await dbGetImage(imageId);
  if (!blob) {
    return;
  }
  const path = buildImageStoragePath(authUser.id, imageId);
  const { error } = await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || "image/jpeg",
  });
  if (error) {
    throw error;
  }
}

async function removeImageFromCloud(imageId) {
  if (!imageId || !supabaseClient || !authUser) {
    return;
  }
  const path = buildImageStoragePath(authUser.id, imageId);
  const { error } = await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).remove([path]);
  if (error) {
    throw error;
  }
}

async function fetchImageFromCloud(imageId) {
  if (!imageId || !supabaseClient || !authUser) {
    return null;
  }
  const path = buildImageStoragePath(authUser.id, imageId);
  const { data, error } = await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).download(path);
  if (error || !data) {
    return null;
  }
  return data;
}

async function pullCloudTrades() {
  if (!supabaseClient || !authUser) {
    return;
  }
  const cursor = getSyncCursor();
  let query = supabaseClient
    .from(SUPABASE_TRADES_TABLE)
    .select("id, trade, updated_at, deleted_at")
    .eq("user_id", authUser.id)
    .order("updated_at", { ascending: true })
    .limit(1000);

  if (cursor) {
    query = query.gt("updated_at", cursor);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  if (!Array.isArray(data) || !data.length) {
    return;
  }

  let hasTradeChanges = false;
  let latestCursor = cursor;

  for (const row of data) {
    latestCursor = row.updated_at || latestCursor;
    const localIndex = trades.findIndex((trade) => trade.id === row.id);
    if (row.deleted_at) {
      if (localIndex !== -1) {
        const localTrade = trades[localIndex];
        if (localTrade.before_image_id) {
          await deleteImageRecord(localTrade.before_image_id, { enqueue: false });
        }
        if (localTrade.after_image_id) {
          await deleteImageRecord(localTrade.after_image_id, { enqueue: false });
        }
        await deleteTradeRecord(row.id, { enqueue: false });
        trades.splice(localIndex, 1);
        hasTradeChanges = true;
      }
      continue;
    }

    if (!row.trade || typeof row.trade !== "object") {
      continue;
    }

    const remoteTrade = normalizeTrade({
      ...row.trade,
      id: row.id,
      updated_at: row.updated_at || row.trade.updated_at,
    });
    const localTrade = localIndex === -1 ? null : trades[localIndex];
    if (!localTrade || toMillis(remoteTrade.updated_at) >= toMillis(localTrade.updated_at)) {
      if (localIndex === -1) {
        trades.unshift(remoteTrade);
      } else {
        trades[localIndex] = remoteTrade;
      }
      await saveTradeRecord(remoteTrade, { enqueue: false });
      hasTradeChanges = true;
    }
  }

  setSyncCursor(latestCursor);

  if (hasTradeChanges) {
    invalidateAnalyticsCache();
    syncPairRegistryFromTrades(trades);
    refreshPairSelectors();
    renderAll();
  }
}

async function pullCloudSettings() {
  if (!supabaseClient || !authUser) {
    return;
  }
  const { data, error } = await supabaseClient
    .from(SUPABASE_SETTINGS_TABLE)
    .select("settings, updated_at")
    .eq("user_id", authUser.id)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data || !data.settings) {
    return;
  }

  const remoteUpdatedAt = data.updated_at || "";
  const localUpdatedAt = getSettingsUpdatedAt();
  if (remoteUpdatedAt && toMillis(remoteUpdatedAt) <= toMillis(localUpdatedAt)) {
    return;
  }

  appSettings = normalizeSettings(data.settings);
  settingsRuleDraft = cloneConfluenceRules(appSettings.confluenceRules);
  settingsSessionDraft = [...getConfiguredSessions()];
  saveAppSettings({ enqueue: false, updatedAt: remoteUpdatedAt || new Date().toISOString() });
  applySettingsUi();
}

function parsePnl(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) {
    return null;
  }
  // Validate format: optional +/-, digits, optional decimal
  if (!/^[+\-]?\d+(\.\d+)?$/.test(raw.replace(/[$,\s]/g, ""))) {
    return null; // Reject invalid format
  }
  const cleaned = raw.replace(/[$,\s]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function validatePnlInput(rawValue) {
  const result = parsePnl(rawValue);
  if (String(rawValue || "").trim() && result === null) {
    return "PnL must be a number (e.g., +50.25 or -10)";
  }
  return null;
}

function getMissingEntryFields({ pair, direction, strategy, sessions }) {
  const missing = [];
  if (!pair) {
    missing.push("Pair");
  }
  if (!direction) {
    missing.push("Direction");
  }
  if (!strategy) {
    missing.push("Strategy");
  }
  if (!sessions || sessions.length === 0) {
    missing.push("Session");
  }
  return missing;
}

function toMillisDefault(value) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function sortTradesForDisplayWithOpenFirst(rows, toMillis = toMillisDefault) {
  return [...rows].sort((a, b) => {
    const statusA = a.status === "open" ? 0 : 1;
    const statusB = b.status === "open" ? 0 : 1;
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    return toMillis(b.captured_at_utc) - toMillis(a.captured_at_utc);
  });
}

function chartOptions(numberYAxis = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#5b4f8f",
          font: { family: "DM Sans", size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(41,31,96,0.94)",
        titleColor: "#fff",
        bodyColor: "#f7f4ff",
        borderColor: "rgba(123,97,255,0.35)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#6f63a3", font: { family: "DM Sans", size: 10 } },
        grid: { color: "rgba(110,83,208,0.12)" },
      },
      y: {
        ticks: {
          color: "#6f63a3",
          font: { family: "DM Sans", size: 10 },
          callback: numberYAxis
            ? (value) => {
                if (typeof value === "number") {
                  return value.toFixed(2);
                }
                return value;
              }
            : undefined,
        },
        grid: { color: "rgba(110,83,208,0.12)" },
      },
    },
  };
}

function createChartWithRegistry(id, config, chartRegistry) {
  const canvas = document.getElementById(id);
  if (!(canvas instanceof HTMLCanvasElement) || typeof Chart === "undefined") {
    return;
  }
  const existing = chartRegistry.get(id);
  if (existing) {
    existing.destroy();
  }
  const chart = new Chart(canvas, config);
  chartRegistry.set(id, chart);
}

class InsightOrbitCarousel {
  constructor(root, slides, options = {}) {
    this.root = root;
    this.track = root.querySelector(".insight-orbit-track");
    this.dotsWrap = root.querySelector(".orbit-dots");
    this.prevBtn = root.querySelector(".orbit-prev");
    this.nextBtn = root.querySelector(".orbit-next");
    this.slidesData = slides || [];
    this.index = Number.isInteger(options.startIndex) ? options.startIndex : 0;
    this.autoplayMs = options.autoplayMs || 7600;
    this.escape = typeof options.escapeHtml === "function" ? options.escapeHtml : (value) => String(value || "");
    this.timer = null;
    this.cleanupFns = [];
    this.prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchTracking = false;

    this.slides = [];
    this.dots = [];

    this.render();
    this.bind();
    this.update();
    this.startAutoplay();
  }

  on(target, event, handler, options) {
    if (!target) {
      return;
    }
    target.addEventListener(event, handler, options);
    this.cleanupFns.push(() => target.removeEventListener(event, handler, options));
  }

  render() {
    if (!this.track || !this.dotsWrap) {
      return;
    }

    this.track.innerHTML = "";
    this.dotsWrap.innerHTML = "";
    this.slides = this.slidesData.map((item) => {
      const metricRows = Array.isArray(item.metrics) ? item.metrics.slice(0, 3) : [];
      const metricHtml = metricRows.length
        ? `
          <div class="orbit-metrics">
            ${metricRows
              .map(
                ([label, value]) => `
              <div class="orbit-metric">
                <div class="label">${this.escape(label || "-")}</div>
                <div class="value">${this.escape(value || "-")}</div>
              </div>`
              )
              .join("")}
          </div>
        `
        : "";

      const slide = document.createElement("article");
      slide.className = "orbit-slide";
      slide.innerHTML = `
        <div class="orbit-kicker">${this.escape(item.kicker || "Insight Spotlight")}</div>
        <div class="orbit-title">${this.escape(item.title || "Need More Data")}</div>
        <div class="orbit-text">${this.escape(item.text || "Log more trades to unlock this insight.")}</div>
        ${metricHtml}
      `;
      this.track.appendChild(slide);
      return slide;
    });

    this.dots = this.slidesData.map((item, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "orbit-dot";
      dot.setAttribute("aria-label", `Go to insight ${index + 1}: ${item.title || "Insight"}`);
      this.on(dot, "click", () => {
        this.index = index;
        this.update();
        this.restartAutoplay();
      });
      this.dotsWrap.appendChild(dot);
      return dot;
    });
  }

  bind() {
    this.on(this.prevBtn, "click", () => this.prev());
    this.on(this.nextBtn, "click", () => this.next());

    this.root.tabIndex = 0;
    this.on(this.root, "keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.prev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.next();
      }
    });

    this.on(this.root, "mouseenter", () => this.stopAutoplay());
    this.on(this.root, "mouseleave", () => this.startAutoplay());
    this.on(this.root, "focusin", () => this.stopAutoplay());
    this.on(this.root, "focusout", () => this.startAutoplay());
    this.on(window, "resize", () => this.update());

    this.on(
      this.root,
      "touchstart",
      (event) => {
        if (!event.touches || event.touches.length !== 1) {
          this.touchTracking = false;
          return;
        }
        this.touchTracking = true;
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
        this.stopAutoplay();
      },
      { passive: true }
    );

    this.on(
      this.root,
      "touchend",
      (event) => {
        if (!this.touchTracking || !event.changedTouches || !event.changedTouches.length) {
          this.startAutoplay();
          return;
        }
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;
        const dx = endX - this.touchStartX;
        const dy = endY - this.touchStartY;
        const horizontalSwipe = Math.abs(dx) >= 46 && Math.abs(dx) > Math.abs(dy) * 1.15;
        if (horizontalSwipe) {
          if (dx < 0) {
            this.next();
          } else {
            this.prev();
          }
        } else {
          this.startAutoplay();
        }
        this.touchTracking = false;
      },
      { passive: true }
    );

    this.on(
      this.root,
      "touchcancel",
      () => {
        this.touchTracking = false;
        this.startAutoplay();
      },
      { passive: true }
    );
  }

  normalizeDiff(index) {
    const total = this.slidesData.length;
    let diff = index - this.index;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  }

  classify(diff) {
    if (diff === 0) return "is-center";
    if (diff === -1) return "is-left";
    if (diff === 1) return "is-right";
    if (diff < 0) return "is-off-left";
    return "is-off-right";
  }

  isCompactViewport() {
    return this.root.clientWidth <= 680;
  }

  getScaleFactor() {
    const width = this.root.clientWidth;
    if (width <= 680) {
      const compactRaw = width / 420;
      return Math.max(0.82, Math.min(1, compactRaw));
    }
    const raw = width / 980;
    return Math.max(0.56, Math.min(1.06, raw));
  }

  getPreset(diff, compact = false) {
    if (compact) {
      if (diff === 0) return { x: 0, z: 0, ry: 0, scale: 1, opacity: 1, zIndex: 5, filter: "none" };
      if (diff === -1) return { x: -118, z: 0, ry: 0, scale: 0.9, opacity: 0.26, zIndex: 4, filter: "none" };
      if (diff === 1) return { x: 118, z: 0, ry: 0, scale: 0.9, opacity: 0.26, zIndex: 4, filter: "none" };
      if (diff < 0) return { x: -220, z: 0, ry: 0, scale: 0.84, opacity: 0, zIndex: 1, filter: "none" };
      return { x: 220, z: 0, ry: 0, scale: 0.84, opacity: 0, zIndex: 1, filter: "none" };
    }

    if (diff === 0) return { x: 0, z: 165, ry: 0, scale: 1.03, opacity: 1, zIndex: 5, filter: "none" };
    if (diff === -1) return { x: -324, z: -84, ry: 42, scale: 0.82, opacity: 0.88, zIndex: 4, filter: "saturate(0.78)" };
    if (diff === 1) return { x: 324, z: -84, ry: -42, scale: 0.82, opacity: 0.88, zIndex: 4, filter: "saturate(0.78)" };
    if (diff < 0) return { x: -610, z: -320, ry: 64, scale: 0.56, opacity: 0, zIndex: 1, filter: "blur(1.2px) saturate(0.6)" };
    return { x: 610, z: -320, ry: -64, scale: 0.56, opacity: 0, zIndex: 1, filter: "blur(1.2px) saturate(0.6)" };
  }

  composeTransform(preset, scaleFactor) {
    const x = preset.x * scaleFactor;
    const z = preset.z * scaleFactor;
    return `translate3d(calc(-50% + ${x}px), -50%, ${z}px) rotateY(${preset.ry}deg) scale(${preset.scale})`;
  }

  update() {
    const compact = this.isCompactViewport();
    this.root.classList.toggle("is-compact", compact);
    const scaleFactor = this.getScaleFactor();
    this.slides.forEach((slide, index) => {
      const diff = this.normalizeDiff(index);
      const cls = this.classify(diff);
      const preset = this.getPreset(diff, compact);
      slide.classList.remove("is-center", "is-left", "is-right", "is-off-left", "is-off-right");
      slide.classList.add(cls);
      slide.style.transform = this.composeTransform(preset, scaleFactor);
      slide.style.opacity = String(preset.opacity);
      slide.style.zIndex = String(preset.zIndex);
      slide.style.filter = preset.filter;
      slide.style.pointerEvents = cls === "is-center" ? "auto" : "none";
    });

    this.dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === this.index);
    });
  }

  next() {
    if (!this.slidesData.length) {
      return;
    }
    this.index = (this.index + 1) % this.slidesData.length;
    this.update();
    this.restartAutoplay();
  }

  prev() {
    if (!this.slidesData.length) {
      return;
    }
    this.index = (this.index - 1 + this.slidesData.length) % this.slidesData.length;
    this.update();
    this.restartAutoplay();
  }

  startAutoplay() {
    if (this.prefersReduced || this.slidesData.length < 2 || this.timer) {
      return;
    }
    this.timer = window.setInterval(() => {
      this.index = (this.index + 1) % this.slidesData.length;
      this.update();
    }, this.autoplayMs);
  }

  stopAutoplay() {
    if (!this.timer) {
      return;
    }
    window.clearInterval(this.timer);
    this.timer = null;
  }

  restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  destroy() {
    this.stopAutoplay();
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }
}

function sortStrategiesByTradeCount(analytics, options = {}) {
  const { includeZero = false } = options;
  const rows = Object.entries(analytics?.strategyCounts || {});
  const filtered = includeZero ? rows : rows.filter(([, count]) => Number(count) > 0);
  return filtered.sort((left, right) => (Number(right[1]) || 0) - (Number(left[1]) || 0));
}

function formatStrategyMixLine(analytics, limit = 3) {
  const ranked = sortStrategiesByTradeCount(analytics)
    .slice(0, limit)
    .map(([strategy, count]) => `${strategy} ${count}`);
  return ranked.length ? ranked.join(" / ") : "No strategy data";
}

function formatStrategyNetLine(analytics, formatMoney, limit = 3) {
  const ranked = sortStrategiesByTradeCount(analytics)
    .slice(0, limit)
    .map(([strategy]) => `${strategy} ${formatMoney(analytics?.strategyNetPnl?.[strategy] || 0)}`);
  return ranked.length ? ranked.join(" | ") : "No strategy data";
}

function formatStrategyWinLine(analytics, limit = 3) {
  const ranked = sortStrategiesByTradeCount(analytics)
    .slice(0, limit)
    .map(([strategy]) => `${strategy} ${(analytics?.strategyWinRate?.[strategy] || 0).toFixed(1)}%`);
  return ranked.length ? ranked.join(" | ") : "No strategy data";
}

const form = document.getElementById("trade-form");
const resetBtn = document.getElementById("reset-form");
const saveBtn = document.getElementById("saveBtn");
const errorEl = document.getElementById("form-error");
const toastEl = document.getElementById("toast");
const themeToggleEl = document.getElementById("themeToggle");

const manualTimeToggleEl = document.getElementById("manualTimeToggle");
const manualTimeFieldsEl = document.getElementById("manualTimeFields");
const entryCapturedHintEl = document.getElementById("entryCapturedHint");

const tradeDateEl = document.getElementById("tradeDate");
const tradeTimeEl = document.getElementById("tradeTime");
const pairEl = document.getElementById("pair");
const directionEl = document.getElementById("direction");
const lotSizeEl = document.getElementById("lotSize");
const strategyEl = document.getElementById("strategy");
const outcomeEl = document.getElementById("outcome");
const pnlEl = document.getElementById("pnl");
const noteEl = document.getElementById("note");
const createConfluenceDetailsEl = document.getElementById("createConfluenceDetails");
const confluenceChecklistEl = document.getElementById("confluenceChecklist");
const confluenceSummaryEl = document.getElementById("confluenceSummary");
const createSmcEntryTypesWrapEl = document.getElementById("createSmcEntryTypesWrap");
const createSmcEntryTypesEl = document.getElementById("createSmcEntryTypes");
const entryPnlFieldEl = document.getElementById("entryPnlField");

const beforeZone = document.getElementById("beforeZone");
const afterZone = document.getElementById("afterZone");
const beforeFile = document.getElementById("beforeFile");
const afterFile = document.getElementById("afterFile");
const beforePreview = document.getElementById("beforePreview");
const afterPreview = document.getElementById("afterPreview");
const clearBeforeBtn = document.getElementById("clearBefore");
const clearAfterBtn = document.getElementById("clearAfter");

const analyticsCard = document.getElementById("analytics-card");
const historyCard = document.getElementById("history-card");
const analyticsTabsEl = document.getElementById("analyticsTabs");
const analyticsPanelEl = document.getElementById("analyticsPanel");
const topInsightPanelEl = document.getElementById("topInsightPanel");
const spotlightCardEl = document.getElementById("spotlight-card");

const filterPairEl = document.getElementById("filterPair");
const filterSessionEl = document.getElementById("filterSession");
const filterOutcomeEl = document.getElementById("filterOutcome");
const filterStrategyEl = document.getElementById("filterStrategy");
const filterIntegrityEl = document.getElementById("filterIntegrity");
const historyStatusTabsEl = document.getElementById("historyStatusTabs");
const historyTabClosedEl = document.getElementById("historyTabClosed");
const historyTabOpenEl = document.getElementById("historyTabOpen");
const historyTabAllEl = document.getElementById("historyTabAll");
const historyFilterToggleEl = document.getElementById("historyFilterToggle");
const historyFilterMetaEl = document.getElementById("historyFilterMeta");
const historyFilterPanelEl = document.getElementById("historyFilterPanel");
const historyClearFiltersEl = document.getElementById("historyClearFilters");
const sessionChipsEl = document.getElementById("sessionChips");
const editSessionChipsEl = document.getElementById("editSessionChips");

const settingShowInsightReelEl = document.getElementById("settingShowInsightReel");
const settingStrategyModeEl = document.getElementById("settingStrategyMode");
const authEmailEl = document.getElementById("authEmail");
const authSignInBtn = document.getElementById("authSignIn");
const authSignOutBtn = document.getElementById("authSignOut");
const syncNowBtn = document.getElementById("syncNowBtn");
const authStatusEl = document.getElementById("authStatus");
const syncQueueHintEl = document.getElementById("syncQueueHint");
const syncStatusPillEl = document.getElementById("syncStatusPill");
const syncLastSyncEl = document.getElementById("syncLastSync");
const settingsSyncCardEl = document.getElementById("settingsSyncCard");
const settingsStrategyTabsEl = document.getElementById("settingsStrategyTabs");
const settingsNewStrategyEl = document.getElementById("settingsNewStrategy");
const settingsAddStrategyBtn = document.getElementById("settingsAddStrategy");
const settingsDuplicateStrategyBtn = document.getElementById("settingsDuplicateStrategy");
const settingsNewSessionEl = document.getElementById("settingsNewSession");
const settingsAddSessionBtn = document.getElementById("settingsAddSession");
const settingsSessionEditorEl = document.getElementById("settingsSessionEditor");
const settingsSaveSessionsBtn = document.getElementById("settingsSaveSessions");
const settingsRuleEditorEl = document.getElementById("settingsRuleEditor");
const settingsRulesNewOnlyEl = document.getElementById("settingsRulesNewOnly");
const settingsSaveRulesBtn = document.getElementById("settingsSaveRules");
const settingsResetRulesBtn = document.getElementById("settingsResetRules");

const viewListBtn = document.getElementById("viewList");
const viewGridBtn = document.getElementById("viewGrid");
const exportAllBtn = document.getElementById("export-all");
const exportFilteredBtn = document.getElementById("export-filtered");
const historyGalleryEl = document.getElementById("historyGallery");

const lotDecBtn = document.getElementById("lotDec");
const lotIncBtn = document.getElementById("lotInc");
const editLotDecBtn = document.getElementById("editLotDec");
const editLotIncBtn = document.getElementById("editLotInc");
const lotPresetButtons = Array.from(document.querySelectorAll("[data-lot-preset]"));
const afterScreenshotFieldEl = document.getElementById("afterScreenshotField");

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editSaveBtn = editForm?.querySelector('button[type="submit"]');
const editErrorEl = document.getElementById("edit-error");
const modalCloseBtn = document.getElementById("modal-close");
const deleteTradeBtn = document.getElementById("delete-trade");

const editIdEl = document.getElementById("editId");
const editManualTimeToggleEl = document.getElementById("editManualTimeToggle");
const editManualTimeFieldsEl = document.getElementById("editManualTimeFields");
const editDateEl = document.getElementById("editDate");
const editTimeEl = document.getElementById("editTime");
const editPairEl = document.getElementById("editPair");
const editDirectionEl = document.getElementById("editDirection");
const editLotSizeEl = document.getElementById("editLotSize");
const editStrategyEl = document.getElementById("editStrategy");
const editOutcomeEl = document.getElementById("editOutcome");
const editPnlEl = document.getElementById("editPnl");
const editNoteEl = document.getElementById("editNote");
const editConfluenceDetailsEl = document.getElementById("editConfluenceDetails");
const editConfluenceChecklistEl = document.getElementById("editConfluenceChecklist");
const editConfluenceSummaryEl = document.getElementById("editConfluenceSummary");
const editSmcEntryTypesWrapEl = document.getElementById("editSmcEntryTypesWrap");
const editSmcEntryTypesEl = document.getElementById("editSmcEntryTypes");

const editBeforeZone = document.getElementById("editBeforeZone");
const editAfterZone = document.getElementById("editAfterZone");
const editBeforeFile = document.getElementById("editBeforeFile");
const editAfterFile = document.getElementById("editAfterFile");
const editBeforePreview = document.getElementById("editBeforePreview");
const editAfterPreview = document.getElementById("editAfterPreview");
const editClearBeforeBtn = document.getElementById("editClearBefore");
const editClearAfterBtn = document.getElementById("editClearAfter");
const tradeDetailModalEl = document.getElementById("trade-detail-modal");
const detailModalBodyEl = document.getElementById("detailModalBody");
const detailModalCloseBtn = document.getElementById("detail-modal-close");
const detailEditBtn = document.getElementById("detailEditBtn");

const toast = createToastController(toastEl);
const storage = createIdbStorage({
  dbName: DB_NAME,
  dbVersion: DB_VERSION,
  tradeStore: TRADE_STORE,
  imageStore: IMAGE_STORE,
});
const supabaseClient = createSupabaseClient();
const {
  dbGetAllTrades,
  dbPutTrade,
  dbDeleteTrade,
  dbSaveImage,
  dbPutImage,
  dbDeleteImage,
  dbGetImage,
  dbGetImages,
} = storage;

let trades = [];
let historyViewMode = "list";
let historyStatusTab = "closed";
let activeAnalyticsTab = "performance";
let openInlineEditorId = null;
let entryManualTimeEnabled = false;
let editManualTimeEnabled = false;
let isRenderingHistory = false;
let analyticsCarousel = null;
let pairRegistry = [];
let authUser = null;
let isCloudSyncing = false;
let cloudSyncTimer = 0;
let lastCloudSyncTime = 0; // Track last sync time for rate limiting
const MIN_SYNC_INTERVAL_MS = 3000; // Minimum 3 seconds between sync attempts
let cloudSyncError = "";
let lastCloudSyncAt = "";
let appSettings = createDefaultSettings();
let settingsEditorStrategy = DEFAULT_STRATEGIES[0];
let settingsRuleDraft = cloneConfluenceRules(CONFLUENCE_RULES);
let settingsSessionDraft = [...DEFAULT_SESSION_OPTIONS];

const chartRegistry = new Map();
const createChart = (id, config) => createChartWithRegistry(id, config, chartRegistry);
let historyObjectUrls = [];

const createImages = {
  beforeBlob: null,
  afterBlob: null,
};

const editImages = {
  beforeImageId: null,
  afterImageId: null,
  beforeNewBlob: null,
  afterNewBlob: null,
  beforeRemoved: false,
  afterRemoved: false,
};

let activeDetailTradeId = null;
let detailModalUrls = [];
let imageHydrationMisses = Number(localStorage.getItem(IMAGE_HYDRATION_MISS_KEY) || 0);

if (!Number.isFinite(imageHydrationMisses) || imageHydrationMisses < 0) {
  imageHydrationMisses = 0;
}

// Analytics caching: memoize computeAnalytics outputs
let analyticsCache = null;
let analyticsCacheKey = "";

function getAnalyticsCacheKey(rows) {
  // Simple key: trade count + last trade id + filter state
  const count = (Array.isArray(rows) ? rows.length : 0);
  const lastId = rows?.length ? rows[rows.length - 1]?.id : "";
  const pair = filterPairEl?.value || "";
  const session = filterSessionEl?.value || "";
  const outcome = filterOutcomeEl?.value || "";
  const strategy = filterStrategyEl?.value || "";
  const integrity = filterIntegrityEl?.value || "";
  return `${count}:${lastId}:${pair}:${session}:${outcome}:${strategy}:${integrity}`;
}

function getAnalyticsCached(rows) {
  const key = getAnalyticsCacheKey(rows);
  if (analyticsCache && analyticsCacheKey === key) {
    return analyticsCache;
  }
  analyticsCache = computeAnalytics(rows);
  analyticsCacheKey = key;
  return analyticsCache;
}

function invalidateAnalyticsCache() {
  analyticsCache = null;
  analyticsCacheKey = "";
}

function incrementImageHydrationMisses(count = 1) {
  const increment = Math.max(0, Number(count) || 0);
  imageHydrationMisses += increment;
  localStorage.setItem(IMAGE_HYDRATION_MISS_KEY, String(imageHydrationMisses));
}

let createBeforeBinder;
let createAfterBinder;
let editBeforeBinder;
let editAfterBinder;

init().catch((error) => {
  console.error(error);
  showToast("App failed to initialize", "bad");
});

async function init() {
  wipeLegacyTestData();
  applyStoredTheme();
  loadAppSettings();
  applySettingsUi({ rerender: false });

  bootstrapPairRegistry();
  refreshPairSelectors();
  refreshStrategySelectors();
  refreshSessionSelectors();
  fillTimeSuggestions();
  applyDefaultDateTime();
  applySavedDefaults();
  syncEntryFlowState({ forceChecklistRerender: true });

  analyticsCard.open = false;
  historyCard.open = false;

  bindDropZones();
  bindEvents();

  await loadTradesFromDb();
  await migrateTradeLotSizesIfNeeded();
  syncPairRegistryFromTrades(trades);
  refreshPairSelectors();
  refreshSessionSelectors();
  syncEntryFlowState();
  setHistoryView("list");
  setHistoryStatusTab("closed");
  renderAll();
  await initCloudSync();
}

function bindEvents() {
  form.addEventListener("submit", handleCreateSubmit);
  resetBtn.addEventListener("click", () => handleClear({ showToast: true }));
  if (themeToggleEl) {
    themeToggleEl.addEventListener("click", toggleTheme);
  }

  pairEl.addEventListener("change", () => {
    handlePairSelectChange(pairEl);
  });
  editPairEl.addEventListener("change", () => {
    handlePairSelectChange(editPairEl);
  });
  if (settingShowInsightReelEl) {
    settingShowInsightReelEl.addEventListener("change", () => {
      appSettings.showInsightReel = Boolean(settingShowInsightReelEl.checked);
      saveAppSettings();
      applyInsightReelVisibility();
      renderTopInsightReel(trades);
    });
  }
  if (settingStrategyModeEl) {
    settingStrategyModeEl.addEventListener("change", () => {
      const mode = normalizeStrategyMode(settingStrategyModeEl.value);
      appSettings.strategyMode = mode;
      saveAppSettings();
      refreshStrategySelectors();
      syncEntryFlowState({ forceChecklistRerender: true });
      renderAll();
      showToast(`Enabled strategies: ${appSettings.strategyMode === "all" ? "All" : appSettings.strategyMode}`, "ok");
    });
  }
  if (authSignInBtn) {
    authSignInBtn.addEventListener("click", async () => {
      try {
        await sendMagicLinkSignIn();
      } catch (error) {
        console.error(error);
        showToast(error?.message || "Sign-in failed", "bad");
      }
    });
  }
  if (authSignOutBtn) {
    authSignOutBtn.addEventListener("click", async () => {
      try {
        await signOutCloudSync();
        showToast("Signed out", "ok");
      } catch (error) {
        console.error(error);
        showToast(error?.message || "Sign-out failed", "bad");
      }
    });
  }
  if (syncNowBtn) {
    syncNowBtn.addEventListener("click", async () => {
      try {
        await runCloudSync({ showFeedback: true });
      } catch (error) {
        console.error(error);
      }
    });
  }
  if (authEmailEl) {
    authEmailEl.addEventListener("change", () => {
      const email = String(authEmailEl.value || "").trim().toLowerCase();
      localStorage.setItem(AUTH_EMAIL_KEY, email);
    });
  }
  if (settingsStrategyTabsEl) {
    settingsStrategyTabsEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const button = target.closest("[data-settings-strategy]");
      if (!button) {
        return;
      }
      const strategy = button.getAttribute("data-settings-strategy");
      if (!getDraftStrategies().includes(strategy)) {
        return;
      }
      settingsEditorStrategy = strategy;
      renderSettingsRuleTabs();
      renderSettingsRuleEditor();
    });
  }
  if (settingsAddStrategyBtn) {
    settingsAddStrategyBtn.addEventListener("click", () => {
      addStrategyFromSettings(settingsNewStrategyEl?.value);
    });
  }
  if (settingsNewStrategyEl) {
    settingsNewStrategyEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      addStrategyFromSettings(settingsNewStrategyEl.value);
    });
  }
  if (settingsAddSessionBtn) {
    settingsAddSessionBtn.addEventListener("click", () => {
      addSessionFromSettings(settingsNewSessionEl?.value);
    });
  }
  if (settingsNewSessionEl) {
    settingsNewSessionEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      addSessionFromSettings(settingsNewSessionEl.value);
    });
  }
  if (settingsSessionEditorEl) {
    settingsSessionEditorEl.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !target.matches("[data-session-index]")) {
        return;
      }
      const index = Number(target.dataset.sessionIndex);
      if (!Number.isInteger(index) || index < 0 || index >= settingsSessionDraft.length) {
        return;
      }
      settingsSessionDraft[index] = target.value;
    });

    settingsSessionEditorEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const moveButton = target.closest("[data-move-session-index]");
      if (moveButton) {
        const index = Number(moveButton.getAttribute("data-move-session-index"));
        const delta = Number(moveButton.getAttribute("data-move-session-delta"));
        const nextIndex = index + delta;
        if (!Number.isInteger(index) || !Number.isInteger(delta) || nextIndex < 0 || nextIndex >= settingsSessionDraft.length) {
          return;
        }
        const draft = [...settingsSessionDraft];
        const [moved] = draft.splice(index, 1);
        draft.splice(nextIndex, 0, moved);
        settingsSessionDraft = draft;
        renderSettingsSessionEditor();
        return;
      }

      const removeButton = target.closest("[data-remove-session-index]");
      if (!removeButton) {
        return;
      }
      const index = Number(removeButton.getAttribute("data-remove-session-index"));
      if (!Number.isInteger(index) || index < 0 || index >= settingsSessionDraft.length) {
        return;
      }
      settingsSessionDraft.splice(index, 1);
      renderSettingsSessionEditor();
    });
  }
  if (settingsSaveSessionsBtn) {
    settingsSaveSessionsBtn.addEventListener("click", saveSettingsSessions);
  }
  if (settingsRuleEditorEl) {
    settingsRuleEditorEl.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
        return;
      }
      if (!target.matches("[data-rule-kind][data-rule-index]")) {
        return;
      }
      const kind = target.dataset.ruleKind;
      const index = Number(target.dataset.ruleIndex);
      if ((kind !== "core" && kind !== "backing" && kind !== "quality") || !Number.isInteger(index) || index < 0) {
        return;
      }
      settingsRuleDraft[settingsEditorStrategy][kind][index] = target.value;
    });

    settingsRuleEditorEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const removeButton = target.closest("[data-remove-rule-kind]");
      if (removeButton) {
        const kind = removeButton.getAttribute("data-remove-rule-kind");
        const index = Number(removeButton.getAttribute("data-remove-rule-index"));
        if ((kind === "core" || kind === "backing" || kind === "quality") && Number.isInteger(index) && index >= 0) {
          settingsRuleDraft[settingsEditorStrategy][kind].splice(index, 1);
          renderSettingsRuleEditor();
        }
        return;
      }

      const addButton = target.closest("[data-add-rule-kind]");
      if (!addButton) {
        return;
      }
      const kind = addButton.getAttribute("data-add-rule-kind");
      if (kind !== "core" && kind !== "backing" && kind !== "quality") {
        return;
      }
      const input = settingsRuleEditorEl.querySelector(`[data-add-rule-input="${kind}"]`);
      const value = String(input?.value || "").trim();
      if (!value) {
        showToast("Enter a confluence label first", "bad");
        return;
      }
      settingsRuleDraft[settingsEditorStrategy][kind].push(value);
      input.value = "";
      renderSettingsRuleEditor();
    });
  }
  if (settingsDuplicateStrategyBtn) {
    settingsDuplicateStrategyBtn.addEventListener("click", duplicateStrategyFromSettings);
  }
  if (settingsSaveRulesBtn) {
    settingsSaveRulesBtn.addEventListener("click", async () => {
      await saveSettingsRules();
    });
  }
  if (settingsResetRulesBtn) {
    settingsResetRulesBtn.addEventListener("click", () => {
      settingsRuleDraft = cloneConfluenceRules(CONFLUENCE_RULES);
      const availableStrategies = getDraftStrategies();
      settingsEditorStrategy = availableStrategies[0] || "";
      renderSettingsRuleTabs();
      renderSettingsRuleEditor();
      showToast("Defaults loaded. Save rules to apply.", "ok");
    });
  }

  manualTimeToggleEl.addEventListener("click", toggleEntryManualTime);
  bindChipToggle(sessionChipsEl, "session");
  bindChipToggle(editSessionChipsEl, "editSession");
  strategyEl.addEventListener("change", () => {
    const previousStrategy = normalizeStrategyName(strategyEl.dataset.prevStrategy || "");
    const nextStrategy = normalizeStrategyName(strategyEl.value);
    if (previousStrategy && nextStrategy && previousStrategy !== nextStrategy) {
      clearCheckedValues(form, "createConfluence");
      clearCheckedValues(form, "createSmcEntryType");
    }
    strategyEl.dataset.prevStrategy = nextStrategy;
    syncEntryFlowState({ forceChecklistRerender: true });
  });
  outcomeEl.addEventListener("change", syncEntryFlowState);
  confluenceChecklistEl.addEventListener("change", syncEntryFlowState);
  form.addEventListener("input", syncEntryFlowState);
  form.addEventListener("change", syncEntryFlowState);

  [filterPairEl, filterSessionEl, filterOutcomeEl, filterStrategyEl, filterIntegrityEl].forEach((el) => {
    el.addEventListener("change", () => {
      openInlineEditorId = null;
      updateHistoryFilterMeta();
      renderFilteredSections();
    });
  });

  if (historyFilterToggleEl && historyFilterPanelEl) {
    historyFilterToggleEl.addEventListener("click", () => {
      const nextHidden = !historyFilterPanelEl.hidden;
      historyFilterPanelEl.hidden = nextHidden;
      historyFilterToggleEl.textContent = nextHidden ? "Filter" : "Hide Filters";
    });
  }

  if (historyClearFiltersEl) {
    historyClearFiltersEl.addEventListener("click", () => {
      filterPairEl.value = "";
      filterSessionEl.value = "";
      filterOutcomeEl.value = "";
      filterStrategyEl.value = "";
      filterIntegrityEl.value = "";
      openInlineEditorId = null;
      updateHistoryFilterMeta();
      renderFilteredSections();
    });
  }

  if (historyStatusTabsEl) {
    historyStatusTabsEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const button = target.closest("[data-status]");
      if (!button) {
        return;
      }
      const status = button.getAttribute("data-status");
      if (!status) {
        return;
      }
      setHistoryStatusTab(status);
    });
  }

  analyticsTabsEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const button = target.closest("[data-tab]");
    if (!button) {
      return;
    }
    const tab = button.getAttribute("data-tab");
    if (!tab || !TAB_INSIGHTS[tab]) {
      return;
    }
    activeAnalyticsTab = tab;
    setAnalyticsActiveTab(tab);
    renderAnalytics(getAnalyticsTrades());
  });

  viewListBtn.addEventListener("click", () => setHistoryView("list"));
  viewGridBtn.addEventListener("click", () => setHistoryView("grid"));

  if (lotDecBtn && lotSizeEl) {
    lotDecBtn.addEventListener("click", () => adjustLot(lotSizeEl, -1));
  }
  if (lotIncBtn && lotSizeEl) {
    lotIncBtn.addEventListener("click", () => adjustLot(lotSizeEl, 1));
  }
  if (editLotDecBtn && editLotSizeEl) {
    editLotDecBtn.addEventListener("click", () => adjustLot(editLotSizeEl, -1));
  }
  if (editLotIncBtn && editLotSizeEl) {
    editLotIncBtn.addEventListener("click", () => adjustLot(editLotSizeEl, 1));
  }

  lotPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preset = Number(button.getAttribute("data-lot-preset"));
      if (!Number.isFinite(preset)) {
        return;
      }
      lotSizeEl.value = normalizeLotSizeValue(preset).toFixed(2);
      syncLotPresetState();
    });
  });

  lotSizeEl.addEventListener("change", () => {
    normalizeLotStep(lotSizeEl);
    syncLotPresetState();
  });
  editLotSizeEl.addEventListener("change", () => normalizeLotStep(editLotSizeEl));

  exportAllBtn.addEventListener("click", () => exportCsv(trades, "lazy-but-data-v4-all.csv"));
  exportFilteredBtn.addEventListener("click", () => exportCsv(getFilteredTrades(), "lazy-but-data-v4-filtered.csv"));

  historyGalleryEl.addEventListener("click", onHistoryActionClick);
  historyGalleryEl.addEventListener("keydown", onHistoryActionKeyDown);

  if (detailModalCloseBtn) {
    detailModalCloseBtn.addEventListener("click", closeDetailModal);
  }
  if (tradeDetailModalEl) {
    tradeDetailModalEl.addEventListener("click", (event) => {
      if (event.target === tradeDetailModalEl) {
        closeDetailModal();
      }
    });
  }
  if (detailEditBtn) {
    detailEditBtn.addEventListener("click", async () => {
      const id = activeDetailTradeId;
      if (!id) {
        return;
      }
      const trade = trades.find((item) => item.id === id);
      if (!trade) {
        return;
      }
      if (!confirmClosedTradeEdit(trade)) {
        return;
      }
      closeDetailModal();
      await openEditModal(id);
    });
  }

  modalCloseBtn.addEventListener("click", closeEditModal);
  editModal.addEventListener("click", (event) => {
    if (event.target === editModal) {
      closeEditModal();
    }
  });

  editManualTimeToggleEl.addEventListener("click", toggleEditManualTime);
  editStrategyEl.addEventListener("change", () => {
    const previousStrategy = normalizeStrategyName(editStrategyEl.dataset.prevStrategy || "");
    const nextStrategy = normalizeStrategyName(editStrategyEl.value);
    if (previousStrategy && nextStrategy && previousStrategy !== nextStrategy) {
      clearCheckedValues(editForm, "editConfluence");
      clearCheckedValues(editForm, "editSmcEntryType");
    }
    editStrategyEl.dataset.prevStrategy = nextStrategy;
    renderEditConfluenceChecklist();
    updateEditConfluenceSummary();
    syncSmcEntryTypeVisibility(editStrategyEl.value, {
      wrapEl: editSmcEntryTypesWrapEl,
      listEl: editSmcEntryTypesEl,
      inputName: "editSmcEntryType",
      selectedValues: getCheckedValues(editForm, "editSmcEntryType"),
    });
    if (editConfluenceDetailsEl && !editConfluenceDetailsEl.open) {
      editConfluenceDetailsEl.open = true;
    }
  });
  editConfluenceChecklistEl.addEventListener("change", updateEditConfluenceSummary);

  editForm.addEventListener("submit", handleEditSubmit);
}

function bindChipToggle(containerEl, inputName) {
  if (!containerEl) {
    return;
  }

  containerEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const chip = target.closest(".chip");
    if (!chip || !containerEl.contains(chip)) {
      return;
    }

    const input = chip.querySelector(`input[name="${inputName}"]`);
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    event.preventDefault();
    input.checked = !input.checked;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function wipeLegacyTestData() {
  if (localStorage.getItem(LEGACY_WIPE_FLAG)) {
    return;
  }
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.setItem(LEGACY_WIPE_FLAG, "1");
}

function setAnalyticsActiveTab(tab) {
  analyticsTabsEl.querySelectorAll(".analytics-tab").forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-tab") === tab);
  });
}

function bindDropZones() {
  createBeforeBinder = wireDropZone(
    beforeZone,
    beforeFile,
    beforePreview,
    clearBeforeBtn,
    (blob) => {
      createImages.beforeBlob = blob;
      syncEntryFlowState();
    },
    () => {
      createImages.beforeBlob = null;
      syncEntryFlowState();
    }
  );

  createAfterBinder = wireDropZone(
    afterZone,
    afterFile,
    afterPreview,
    clearAfterBtn,
    (blob) => {
      createImages.afterBlob = blob;
      syncEntryFlowState();
    },
    () => {
      createImages.afterBlob = null;
      syncEntryFlowState();
    }
  );

  editBeforeBinder = wireDropZone(
    editBeforeZone,
    editBeforeFile,
    editBeforePreview,
    editClearBeforeBtn,
    (blob) => {
      editImages.beforeNewBlob = blob;
      editImages.beforeRemoved = false;
    },
    () => {
      editImages.beforeNewBlob = null;
      editImages.beforeRemoved = true;
      editImages.beforeImageId = null;
    }
  );

  editAfterBinder = wireDropZone(
    editAfterZone,
    editAfterFile,
    editAfterPreview,
    editClearAfterBtn,
    (blob) => {
      editImages.afterNewBlob = blob;
      editImages.afterRemoved = false;
    },
    () => {
      editImages.afterNewBlob = null;
      editImages.afterRemoved = true;
      editImages.afterImageId = null;
    }
  );
}

function wireDropZone(zoneEl, fileEl, previewEl, clearBtnEl, onSet, onClear) {
  let previewUrl = "";

  function revokePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }
  }

  function showBlob(blob) {
    revokePreview();
    previewUrl = URL.createObjectURL(blob);
    previewEl.src = previewUrl;
    previewEl.style.display = "block";
    clearBtnEl.style.display = "inline-flex";
    zoneEl.style.display = "none";
  }

  function clearVisual() {
    revokePreview();
    previewEl.src = "";
    previewEl.style.display = "none";
    clearBtnEl.style.display = "none";
    fileEl.value = "";
    zoneEl.style.display = "";
  }

  async function processFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Only image files", "bad");
      return;
    }
    const blob = await compressImage(file);
    showBlob(blob);
    onSet(blob);
    showToast("Screenshot added", "ok");
  }

  zoneEl.addEventListener("dragover", (event) => {
    event.preventDefault();
    zoneEl.classList.add("is-dragover");
  });

  zoneEl.addEventListener("dragleave", () => {
    zoneEl.classList.remove("is-dragover");
  });

  zoneEl.addEventListener("drop", async (event) => {
    event.preventDefault();
    zoneEl.classList.remove("is-dragover");
    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }
    await processFile(file);
  });

  zoneEl.addEventListener("paste", async (event) => {
    const item = [...(event.clipboardData?.items || [])].find((entry) => entry.type.startsWith("image/"));
    if (!item) {
      return;
    }
    const file = item.getAsFile();
    if (!file) {
      return;
    }
    event.preventDefault();
    await processFile(file);
  });

  fileEl.addEventListener("change", async () => {
    const file = fileEl.files?.[0];
    if (!file) {
      return;
    }
    await processFile(file);
  });

  clearBtnEl.addEventListener("click", () => {
    clearVisual();
    onClear();
    showToast("Screenshot removed", "ok");
  });

  return {
    setPreviewBlob(blob) {
      if (!blob) {
        clearVisual();
        return;
      }
      showBlob(blob);
    },
    clearSilent() {
      clearVisual();
    },
    destroy() {
      revokePreview();
    },
  };
}

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 720;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.6
        );
      };
      image.onerror = reject;
      image.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function adjustLot(inputEl, direction) {
  const current = Number(inputEl.value) || DEFAULT_LOT_SIZE;
  const next = Math.max(LOT_SIZE_MIN, Number((current + direction * LOT_SIZE_STEP).toFixed(2)));
  inputEl.value = next.toFixed(2);
}

function normalizeLotStep(inputEl) {
  const value = Number(inputEl.value);
  if (!Number.isFinite(value)) {
    return;
  }
  const snapped = Math.round(value / LOT_SIZE_STEP) * LOT_SIZE_STEP;
  inputEl.value = Math.max(LOT_SIZE_MIN, snapped).toFixed(2);
}

function normalizeLotSizeValue(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_LOT_SIZE;
  }
  const snapped = Math.round(parsed / LOT_SIZE_STEP) * LOT_SIZE_STEP;
  return Number(Math.max(LOT_SIZE_MIN, snapped).toFixed(2));
}

function normalizePairCode(raw) {
  return String(raw || "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function dedupePairs(values) {
  const seen = new Set();
  const out = [];
  (values || []).forEach((value) => {
    const pair = normalizePairCode(value);
    if (!pair || seen.has(pair)) {
      return;
    }
    seen.add(pair);
    out.push(pair);
  });
  return out;
}

function loadPairRegistry() {
  try {
    const raw = localStorage.getItem(PAIR_REGISTRY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function savePairRegistry() {
  localStorage.setItem(PAIR_REGISTRY_KEY, JSON.stringify(pairRegistry));
}

function bootstrapPairRegistry() {
  pairRegistry = dedupePairs([...PAIRS, ...loadPairRegistry()]);
  savePairRegistry();
}

function syncPairRegistryFromTrades(rows) {
  const merged = dedupePairs([...pairRegistry, ...(rows || []).map((trade) => trade?.pair || "")]);
  const changed = merged.length !== pairRegistry.length || merged.some((pair, index) => pair !== pairRegistry[index]);
  if (!changed) {
    return;
  }
  pairRegistry = merged;
  savePairRegistry();
}

function getPairUniverse(extraRows) {
  return dedupePairs([...pairRegistry, ...(extraRows || []).map((trade) => trade?.pair || "")]);
}

function isAddPairOptionValue(value) {
  return value === ADD_PAIR_OPTION_VALUE;
}

function normalizedSelectedPair(value) {
  const raw = String(value || "").trim();
  if (!raw || isAddPairOptionValue(raw)) {
    return "";
  }
  return normalizePairCode(raw);
}

function fillPairOptions(selectEl, includeBlank, selectedValue = "", options = {}) {
  const { includeAddAction = true } = options;
  const nextSelected = normalizedSelectedPair(selectedValue || selectEl.value);
  const pairs = getPairUniverse();

  selectEl.innerHTML = "";
  if (includeBlank) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "-";
    selectEl.appendChild(option);
  }

  pairs.forEach((pair) => {
    const option = document.createElement("option");
    option.value = pair;
    option.textContent = pair;
    selectEl.appendChild(option);
  });

  if (includeAddAction) {
    const option = document.createElement("option");
    option.value = ADD_PAIR_OPTION_VALUE;
    option.textContent = "+ Add pair...";
    selectEl.appendChild(option);
  }

  let applied = "";
  if (nextSelected && pairs.includes(nextSelected)) {
    applied = nextSelected;
  } else if (!includeBlank && pairs.length) {
    applied = pairs[0];
  }
  selectEl.value = applied;
  selectEl.dataset.prevPair = applied;
}

function fillPairFilter(selectedValue = "") {
  const nextSelected = normalizedSelectedPair(selectedValue || filterPairEl.value);
  const pairs = getPairUniverse();

  filterPairEl.innerHTML = '<option value="">All Pairs</option>';
  pairs.forEach((pair) => {
    const option = document.createElement("option");
    option.value = pair;
    option.textContent = pair;
    filterPairEl.appendChild(option);
  });

  if (nextSelected && pairs.includes(nextSelected)) {
    filterPairEl.value = nextSelected;
  }
}

function refreshPairSelectors() {
  fillPairOptions(pairEl, true, pairEl.value, { includeAddAction: true });
  fillPairOptions(editPairEl, true, editPairEl.value, { includeAddAction: true });
  fillPairFilter(filterPairEl.value);
}

function registerPair(rawPair) {
  const pair = normalizePairCode(rawPair);
  if (!pair) {
    return { ok: false, reason: "Enter a pair code first." };
  }
  if (pair.length < 3) {
    return { ok: false, reason: "Pair code must be at least 3 characters." };
  }
  if (pair.length > 12) {
    return { ok: false, reason: "Pair code is too long." };
  }

  const existing = pairRegistry.includes(pair);
  if (!existing) {
    pairRegistry.push(pair);
    savePairRegistry();
    refreshPairSelectors();
  }
  return { ok: true, pair, isNew: !existing };
}

function promptAddPair() {
  const raw = window.prompt("Add pair code (3-12 chars), e.g. AUDUSD or US30:");
  if (raw == null) {
    return null;
  }
  const result = registerPair(raw);
  if (!result.ok) {
    showToast(result.reason, "bad");
    return;
  }
  showToast(result.isNew ? `Pair ${result.pair} added` : `Pair ${result.pair} already available`, "ok");
  return result.pair;
}

function handlePairSelectChange(selectEl) {
  if (!selectEl) {
    return;
  }
  if (!isAddPairOptionValue(selectEl.value)) {
    selectEl.dataset.prevPair = normalizedSelectedPair(selectEl.value);
    return;
  }

  const previous = normalizedSelectedPair(selectEl.dataset.prevPair || "");
  const addedPair = promptAddPair();
  if (!addedPair) {
    selectEl.value = previous || "";
    return;
  }

  if (selectEl.classList.contains("inline-pair")) {
    selectEl.innerHTML = pairOptionsHtml(addedPair, true, true);
  } else {
    refreshPairSelectors();
  }
  selectEl.value = addedPair;
  selectEl.dataset.prevPair = addedPair;
}

function fillTimeSuggestions() {
  const list = document.getElementById("time-suggestions");
  const options = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }
  list.innerHTML = options.map((value) => `<option value="${value}"></option>`).join("");
}

function toggleEntryManualTime() {
  entryManualTimeEnabled = !entryManualTimeEnabled;
  manualTimeFieldsEl.style.display = entryManualTimeEnabled ? "grid" : "none";
  manualTimeToggleEl.textContent = entryManualTimeEnabled ? "Auto" : "Edit";
  entryCapturedHintEl.textContent = entryManualTimeEnabled ? "Time: Manual override" : "Time: Auto";
  if (entryManualTimeEnabled && !tradeDateEl.value) {
    applyDefaultDateTime();
  }
}

function toggleEditManualTime() {
  editManualTimeEnabled = !editManualTimeEnabled;
  editManualTimeFieldsEl.style.display = editManualTimeEnabled ? "grid" : "none";
  editManualTimeToggleEl.textContent = editManualTimeEnabled ? "Use Existing Time" : "Set Time Manually";
}

function applyDefaultDateTime() {
  const now = new Date();
  tradeDateEl.value = toDateInputValue(now);
  tradeTimeEl.value = toTimeInputValue(now);
}

function applySavedDefaults() {
  const defaults = loadDefaults();
  lotSizeEl.value = DEFAULT_LOT_SIZE.toFixed(2);

  if (defaults) {
    if (defaults.lotSize) {
      const parsedLot = Number(defaults.lotSize);
      if (Number.isFinite(parsedLot) && parsedLot > 0) {
        lotSizeEl.value = normalizeLotSizeValue(parsedLot).toFixed(2);
      }
    }
  }

  pairEl.dataset.prevPair = normalizePairCode(pairEl.value);
  strategyEl.dataset.prevStrategy = normalizeStrategyName(strategyEl.value);

  syncEntryFlowState({ forceChecklistRerender: true });
  syncLotPresetState();
}

function syncEntryFlowState(options = {}) {
  const { forceChecklistRerender = false } = options;
  const outcomeSelected = Boolean(String(outcomeEl?.value || "").trim());
  const strategySelected = Boolean(String(strategyEl?.value || "").trim());

  if (entryPnlFieldEl && pnlEl) {
    pnlEl.disabled = !outcomeSelected;
    entryPnlFieldEl.classList.toggle("is-secondary", !outcomeSelected);
    entryPnlFieldEl.classList.toggle("is-ready", outcomeSelected);
    if (!outcomeSelected) {
      if (String(pnlEl.value || "").trim()) {
        pnlEl.value = "";
      }
      pnlEl.placeholder = "Set outcome to enter PnL";
    } else {
      pnlEl.placeholder = "+3.50 or -1.20";
    }
  }

  if (afterScreenshotFieldEl) {
    afterScreenshotFieldEl.classList.toggle("is-secondary", !outcomeSelected);
  }

  if (createConfluenceDetailsEl) {
    createConfluenceDetailsEl.hidden = !strategySelected;
  }
  if (strategySelected) {
    const renderedForStrategy = String(confluenceChecklistEl?.dataset?.strategy || "");
    const selectedStrategy = String(strategyEl.value || "");
    const shouldRenderChecklist =
      forceChecklistRerender ||
      renderedForStrategy !== selectedStrategy ||
      !confluenceChecklistEl ||
      confluenceChecklistEl.children.length === 0;

    if (shouldRenderChecklist) {
      renderCreateConfluenceChecklist();
      if (confluenceChecklistEl) {
        confluenceChecklistEl.dataset.strategy = selectedStrategy;
      }
    }
    updateCreateConfluenceSummary();
    syncSmcEntryTypeVisibility(strategyEl.value, {
      wrapEl: createSmcEntryTypesWrapEl,
      listEl: createSmcEntryTypesEl,
      inputName: "createSmcEntryType",
      selectedValues: getCheckedValues(form, "createSmcEntryType"),
    });
  } else {
    confluenceChecklistEl.innerHTML = "";
    confluenceChecklistEl.dataset.strategy = "";
    confluenceSummaryEl.textContent = "Select strategy to load checklist.";
    confluenceSummaryEl.className = "confluence-summary muted-empty";
    syncSmcEntryTypeVisibility("", {
      wrapEl: createSmcEntryTypesWrapEl,
      listEl: createSmcEntryTypesEl,
      inputName: "createSmcEntryType",
      selectedValues: [],
    });
  }

  updateInvalidSaveState(
    saveBtn,
    strategyEl.value,
    getCheckedValues(form, "createConfluence"),
    "Log Trade",
    "Force Save Invalid Setup"
  );
}

function syncLotPresetState() {
  const lot = normalizeLotSizeValue(lotSizeEl.value);
  lotPresetButtons.forEach((button) => {
    const preset = Number(button.getAttribute("data-lot-preset"));
    const isActive = Number.isFinite(preset) && Math.abs(preset - lot) < 0.0001;
    button.classList.toggle("is-active", isActive);
  });
}

function getStoredTheme() {
  return "dark";
}

function applyStoredTheme() {
  setTheme(getStoredTheme(), { persist: false });
}

function setTheme(theme, options = {}) {
  const { persist = true } = options;
  const nextTheme = "dark";
  document.documentElement.dataset.theme = nextTheme;

  if (themeToggleEl) {
    const isDark = nextTheme === "dark";
    themeToggleEl.classList.toggle("is-dark", isDark);
    themeToggleEl.setAttribute("aria-pressed", String(isDark));
    themeToggleEl.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  if (persist) {
    localStorage.setItem(THEME_KEY, nextTheme);
  }
}

function toggleTheme() {
  setTheme("dark");
}

function handleClear(options = {}) {
  const { showToast: shouldShowToast = false } = options;

  form.reset();
  applyDefaultDateTime();
  applySavedDefaults();

  if (entryManualTimeEnabled) {
    toggleEntryManualTime();
  }

  createImages.beforeBlob = null;
  createImages.afterBlob = null;
  createBeforeBinder.clearSilent();
  createAfterBinder.clearSilent();

  syncEntryFlowState({ forceChecklistRerender: true });
  syncLotPresetState();

  errorEl.textContent = "";
  if (shouldShowToast) {
    showToast("Form cleared", "ok");
  }
}

function saveDefaults(defaults) {
  localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
}

function loadDefaults() {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function createDefaultSettings() {
  return {
    showInsightReel: false,
    strategyMode: "all",
    sessionOptions: [...DEFAULT_SESSION_OPTIONS],
    ruleChangeMode: "new_only",
    confluenceRules: cloneConfluenceRules(CONFLUENCE_RULES),
  };
}

function normalizeSessionName(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }
  return normalized.slice(0, 24);
}

function orderSessions(list) {
  const unique = [];
  const seen = new Set();

  (Array.isArray(list) ? list : []).forEach((item) => {
    const session = normalizeSessionName(item);
    if (!session) {
      return;
    }
    const key = session.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push(session);
  });

  const coreSet = new Set(DEFAULT_SESSION_OPTIONS.map((item) => item.toLowerCase()));
  const coreOrdered = DEFAULT_SESSION_OPTIONS.filter((session) =>
    unique.some((item) => item.toLowerCase() === session.toLowerCase())
  );
  const customOrdered = unique
    .filter((session) => !coreSet.has(session.toLowerCase()))
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));

  return [...coreOrdered, ...customOrdered];
}

function getSessionUniverse(options = {}) {
  const {
    rows = trades,
    includeTradeSessions = true,
    configuredSessions = appSettings?.sessionOptions || DEFAULT_SESSION_OPTIONS,
  } = options;

  const candidates = [...configuredSessions];
  if (includeTradeSessions && Array.isArray(rows)) {
    rows.forEach((trade) => {
      (Array.isArray(trade?.sessions) ? trade.sessions : []).forEach((session) => {
        candidates.push(session);
      });
    });
  }
  const ordered = orderSessions(candidates);
  return ordered.length ? ordered : [...DEFAULT_SESSION_OPTIONS];
}

function getConfiguredSessions() {
  return getSessionUniverse({ rows: [], includeTradeSessions: false });
}

function normalizeStrategyName(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }
  return normalized.slice(0, 24);
}

function orderStrategies(list) {
  const unique = [];
  const seen = new Set();

  (Array.isArray(list) ? list : []).forEach((item) => {
    const strategy = normalizeStrategyName(item);
    if (!strategy) {
      return;
    }
    const key = strategy.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push(strategy);
  });

  const coreSet = new Set(DEFAULT_STRATEGIES.map((item) => item.toLowerCase()));
  const coreOrdered = DEFAULT_STRATEGIES.filter((strategy) =>
    unique.some((item) => item.toLowerCase() === strategy.toLowerCase())
  );
  const customOrdered = unique
    .filter((strategy) => !coreSet.has(strategy.toLowerCase()))
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));

  return [...coreOrdered, ...customOrdered];
}

function mapRulesByStrategy(rules) {
  const out = {};
  Object.entries(rules && typeof rules === "object" ? rules : {}).forEach(([rawStrategy, source]) => {
    const strategy = normalizeStrategyName(rawStrategy);
    if (!strategy || out[strategy]) {
      return;
    }
    out[strategy] = source && typeof source === "object" ? source : {};
  });
  return out;
}

function getStrategyUniverse(options = {}) {
  const {
    rulesMap = appSettings?.confluenceRules || CONFLUENCE_RULES,
    rows = trades,
    includeTradeStrategies = true,
  } = options;

  const candidates = [...DEFAULT_STRATEGIES];
  Object.keys(rulesMap && typeof rulesMap === "object" ? rulesMap : {}).forEach((strategy) => {
    candidates.push(strategy);
  });

  if (includeTradeStrategies && Array.isArray(rows)) {
    rows.forEach((trade) => {
      candidates.push(trade?.strategy);
    });
  }

  const ordered = orderStrategies(candidates);
  return ordered.length ? ordered : [...DEFAULT_STRATEGIES];
}

function getConfiguredStrategies() {
  return getStrategyUniverse({ includeTradeStrategies: false });
}

function getDraftStrategies() {
  return getStrategyUniverse({
    rulesMap: settingsRuleDraft,
    rows: [],
    includeTradeStrategies: false,
  });
}

function normalizeStrategyMode(value, options = {}) {
  const { strategies = getConfiguredStrategies() } = options;
  const raw = String(value || "").trim();
  if (!raw || raw.toLowerCase() === "all" || raw.toLowerCase() === "both") {
    return "all";
  }
  const normalized = normalizeStrategyName(raw);
  if (!normalized) {
    return "all";
  }
  return strategies.includes(normalized) ? normalized : "all";
}

function cloneConfluenceRules(rules) {
  const sourceMap = mapRulesByStrategy(rules);
  const strategies = getStrategyUniverse({
    rulesMap: sourceMap,
    rows: [],
    includeTradeStrategies: false,
  });
  const out = {};
  strategies.forEach((strategy) => {
    const source = sourceMap[strategy] || {};
    const legacyRequired = Array.isArray(source.required) ? [...source.required] : [];
    const coreSource = Array.isArray(source.core) ? source.core : legacyRequired;
    const backingSource = Array.isArray(source.backing) ? source.backing : [];
    out[strategy] = {
      core: normalizeConfluenceLabels(coreSource),
      backing: normalizeConfluenceLabels(backingSource),
      quality: Array.isArray(source.quality) ? [...source.quality] : [],
    };
  });
  return out;
}

function normalizeConfluenceLabels(list) {
  const seen = new Set();
  const out = [];
  (Array.isArray(list) ? list : []).forEach((item) => {
    const label = String(item || "").trim();
    if (!label) {
      return;
    }
    const key = label.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    out.push(label.slice(0, 120));
  });
  return out;
}

function normalizeConfluenceRulesMap(rawRules) {
  const defaults = mapRulesByStrategy(CONFLUENCE_RULES);
  const sourceMap = mapRulesByStrategy(rawRules);
  const strategies = orderStrategies([...Object.keys(defaults), ...Object.keys(sourceMap)]);
  const out = {};

  strategies.forEach((strategy) => {
    const source = sourceMap[strategy] || defaults[strategy] || {};
    const legacyRequired = normalizeConfluenceLabels(source.required);
    const core = normalizeConfluenceLabels(source.core || legacyRequired);
    const backing = normalizeConfluenceLabels(source.backing || []);
    const qualityRaw = normalizeConfluenceLabels(source.quality);
    const reserved = new Set([...core, ...backing].map((item) => item.toLowerCase()));
    const quality = qualityRaw.filter((item) => !reserved.has(item.toLowerCase()));
    out[strategy] = { core, backing, quality };
  });

  return out;
}

function normalizeSettings(rawSettings) {
  const defaults = createDefaultSettings();
  if (!rawSettings || typeof rawSettings !== "object") {
    return defaults;
  }

  const confluenceRules = normalizeConfluenceRulesMap(rawSettings.confluenceRules);
  const sessionOptions = orderSessions(rawSettings.sessionOptions);
  const strategyMode = normalizeStrategyMode(rawSettings.strategyMode, {
    strategies: Object.keys(confluenceRules),
  });

  return {
    showInsightReel: rawSettings.showInsightReel !== false,
    strategyMode,
    sessionOptions,
    ruleChangeMode: rawSettings.ruleChangeMode === "recompute_all" ? "recompute_all" : "new_only",
    confluenceRules,
  };
}

function loadAppSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    appSettings = normalizeSettings(raw ? JSON.parse(raw) : null);
  } catch (_error) {
    appSettings = createDefaultSettings();
  }
  settingsRuleDraft = cloneConfluenceRules(appSettings.confluenceRules);
  settingsSessionDraft = [...getConfiguredSessions()];
  const availableStrategies = getDraftStrategies();
  settingsEditorStrategy = availableStrategies.includes(settingsEditorStrategy)
    ? settingsEditorStrategy
    : (availableStrategies[0] || "");
  if (!getSettingsUpdatedAt()) {
    setSettingsUpdatedAt(new Date().toISOString());
  }
  renderSettingsPanel();
}

function saveAppSettings(options = {}) {
  const { enqueue = true, updatedAt = new Date().toISOString() } = options;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
  setSettingsUpdatedAt(updatedAt);
  if (enqueue) {
    queueSyncOperation({
      type: "settings_upsert",
      updated_at: updatedAt,
    });
  }
}

function applySettingsUi(options = {}) {
  const { rerender = true } = options;
  applyInsightReelVisibility();
  refreshStrategySelectors();
  refreshSessionSelectors();
  renderSettingsPanel();

  if (!rerender) {
    return;
  }

  syncEntryFlowState({ forceChecklistRerender: true });
  renderAll();
}

function applyInsightReelVisibility() {
  if (!spotlightCardEl) {
    return;
  }
  spotlightCardEl.style.display = appSettings.showInsightReel ? "" : "none";
}

function isSingleStrategyMode() {
  const strategies = getConfiguredStrategies();
  return appSettings.strategyMode !== "all" && strategies.includes(appSettings.strategyMode);
}

function getAllowedStrategies() {
  const strategies = getConfiguredStrategies();
  if (!strategies.length) {
    return [];
  }
  return isSingleStrategyMode() ? [appSettings.strategyMode] : strategies;
}

function getStrategyOptionsForEdit(selectedValue) {
  const selected = normalizeStrategyName(selectedValue);
  const allowed = getAllowedStrategies();
  if (selected && !allowed.includes(selected)) {
    return [selected, ...allowed];
  }
  return allowed;
}

function fillStrategyOptions(selectEl, includeBlank, selectedValue = "", options = {}) {
  if (!selectEl) {
    return;
  }
  const { includeLegacy = false } = options;
  const selected = normalizeStrategyName(selectedValue);
  const values = includeLegacy ? getStrategyOptionsForEdit(selected) : getAllowedStrategies();

  selectEl.innerHTML = "";
  const shouldIncludeBlank = includeBlank && values.length > 1;
  if (shouldIncludeBlank) {
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "-";
    selectEl.appendChild(blank);
  }

  values.forEach((strategy) => {
    const option = document.createElement("option");
    option.value = strategy;
    option.textContent = includeLegacy && !getAllowedStrategies().includes(strategy) ? `${strategy} (legacy)` : strategy;
    selectEl.appendChild(option);
  });

  if (selected && values.includes(selected)) {
    selectEl.value = selected;
  } else if (values.length === 1 && includeLegacy) {
    selectEl.value = values[0];
  } else {
    selectEl.value = shouldIncludeBlank ? "" : values[0] || "";
  }

  if (includeLegacy) {
    selectEl.disabled = false;
  } else {
    selectEl.disabled = isSingleStrategyMode();
  }
}

function fillStrategyFilter(selectedValue = "") {
  const selected = normalizeStrategyName(selectedValue);
  const values = getStrategyUniverse();
  filterStrategyEl.innerHTML = '<option value="">All Strategies</option>';
  values.forEach((strategy) => {
    const option = document.createElement("option");
    option.value = strategy;
    option.textContent = strategy;
    filterStrategyEl.appendChild(option);
  });
  if (selected) {
    filterStrategyEl.value = selected;
  }
}

function refreshStrategySelectors() {
  fillStrategyOptions(strategyEl, true, strategyEl.value, { includeLegacy: false });
  fillStrategyOptions(editStrategyEl, true, editStrategyEl.value, { includeLegacy: true });
  if (isSingleStrategyMode() && getAllowedStrategies().includes(editStrategyEl.value) && getStrategyOptionsForEdit(editStrategyEl.value).length === 1) {
    editStrategyEl.disabled = true;
  }
  fillStrategyFilter(filterStrategyEl.value);
}

function matchSessionSelection(options, selectedValues) {
  const selectedSet = new Set((Array.isArray(selectedValues) ? selectedValues : []).map((item) => String(item).toLowerCase()));
  return options.filter((session) => selectedSet.has(session.toLowerCase()));
}

function getSessionOptionsForInput(selectedValues = []) {
  const configured = getConfiguredSessions();
  const extras = [];
  const configuredSet = new Set(configured.map((session) => session.toLowerCase()));

  (Array.isArray(selectedValues) ? selectedValues : []).forEach((item) => {
    const session = normalizeSessionName(item);
    if (!session) {
      return;
    }
    const key = session.toLowerCase();
    if (configuredSet.has(key) || extras.some((entry) => entry.toLowerCase() === key)) {
      return;
    }
    extras.push(session);
  });

  return [...configured, ...extras];
}

function renderSessionChips(containerEl, inputName, options, selectedValues = []) {
  if (!containerEl) {
    return;
  }
  const selected = new Set(matchSessionSelection(options, selectedValues).map((item) => item.toLowerCase()));
  containerEl.innerHTML = options
    .map((session) => {
      const checked = selected.has(session.toLowerCase()) ? "checked" : "";
      return `<label class="chip"><input type="checkbox" name="${escapeHtmlAttr(inputName)}" value="${escapeHtmlAttr(session)}" ${checked} /><span>${escapeHtml(session)}</span></label>`;
    })
    .join("");
}

function fillSessionFilter(selectedValue = "") {
  if (!filterSessionEl) {
    return;
  }
  const selected = normalizeSessionName(selectedValue);
  const options = getSessionUniverse();

  filterSessionEl.innerHTML = '<option value="">All Sessions</option>';
  options.forEach((session) => {
    const option = document.createElement("option");
    option.value = session;
    option.textContent = session;
    filterSessionEl.appendChild(option);
  });

  if (selected && options.some((session) => session.toLowerCase() === selected.toLowerCase())) {
    const exact = options.find((session) => session.toLowerCase() === selected.toLowerCase());
    filterSessionEl.value = exact || "";
  } else {
    filterSessionEl.value = "";
  }
}

function refreshSessionSelectors() {
  const createSelected = getCheckedValues(form, "session");
  const editSelected = getCheckedValues(editForm, "editSession");

  renderSessionChips(sessionChipsEl, "session", getConfiguredSessions(), createSelected);
  renderSessionChips(editSessionChipsEl, "editSession", getSessionOptionsForInput(editSelected), editSelected);
  fillSessionFilter(filterSessionEl?.value || "");
}

function renderStrategyModeOptions() {
  if (!settingStrategyModeEl) {
    return;
  }
  const strategies = getConfiguredStrategies();
  const options = [
    { value: "all", label: "All enabled" },
    ...strategies.map((strategy) => ({ value: strategy, label: `${strategy} only` })),
  ];

  settingStrategyModeEl.innerHTML = "";
  options.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.value;
    option.textContent = entry.label;
    settingStrategyModeEl.appendChild(option);
  });

  const normalizedMode = normalizeStrategyMode(appSettings.strategyMode, { strategies });
  appSettings.strategyMode = normalizedMode;
  settingStrategyModeEl.value = normalizedMode;
}

function renderSettingsPanel() {
  if (settingShowInsightReelEl) {
    settingShowInsightReelEl.checked = Boolean(appSettings.showInsightReel);
  }
  if (settingsRulesNewOnlyEl) {
    settingsRulesNewOnlyEl.checked = appSettings.ruleChangeMode !== "recompute_all";
  }
  renderStrategyModeOptions();
  renderSettingsSessionEditor();
  renderSettingsRuleTabs();
  renderSettingsRuleEditor();
}

function renderSettingsRuleTabs() {
  if (!settingsStrategyTabsEl) {
    return;
  }
  const strategies = getDraftStrategies();
  if (!strategies.length) {
    settingsStrategyTabsEl.innerHTML = "";
    settingsEditorStrategy = "";
    return;
  }
  if (!strategies.includes(settingsEditorStrategy)) {
    settingsEditorStrategy = strategies[0];
  }

  settingsStrategyTabsEl.innerHTML = strategies
    .map((strategy) => {
      const isActive = strategy === settingsEditorStrategy;
      return `<button class="analytics-tab${isActive ? " is-active" : ""}" data-settings-strategy="${escapeHtmlAttr(strategy)}" type="button">${escapeHtml(strategy)}</button>`;
    })
    .join("");
}

function addStrategyFromSettings(rawName) {
  const strategy = normalizeStrategyName(rawName);
  if (!strategy) {
    showToast("Enter a strategy name first", "bad");
    return;
  }

  const existing = getDraftStrategies();
  const exists = existing.some((item) => item.toLowerCase() === strategy.toLowerCase());
  if (exists) {
    showToast(`${strategy} already exists`, "bad");
    return;
  }

  settingsRuleDraft[strategy] = { core: [], backing: [], quality: [] };
  settingsEditorStrategy = strategy;
  if (settingsNewStrategyEl) {
    settingsNewStrategyEl.value = "";
  }
  renderSettingsRuleTabs();
  renderSettingsRuleEditor();
  showToast(`Added ${strategy}. Add confluences, then save rules.`, "ok");
}

function duplicateStrategyFromSettings() {
  const source = settingsEditorStrategy;
  if (!source || !settingsRuleDraft[source]) {
    showToast("Select a strategy first", "bad");
    return;
  }

  const existing = getDraftStrategies();
  let suffix = 2;
  let nextName = `${source} v${suffix}`;
  while (existing.some((item) => item.toLowerCase() === nextName.toLowerCase())) {
    suffix += 1;
    nextName = `${source} v${suffix}`;
  }

  const sourceRules = settingsRuleDraft[source];
  settingsRuleDraft[nextName] = {
    core: [...(sourceRules.core || [])],
    backing: [...(sourceRules.backing || [])],
    quality: [...(sourceRules.quality || [])],
  };
  settingsEditorStrategy = nextName;
  renderSettingsRuleTabs();
  renderSettingsRuleEditor();
  showToast(`Duplicated ${source} -> ${nextName}`, "ok");
}

function renderSettingsRuleEditor() {
  if (!settingsRuleEditorEl) {
    return;
  }
  const rules = settingsRuleDraft?.[settingsEditorStrategy] || { core: [], backing: [], quality: [] };

  const renderRuleList = (kind) => {
    const items = rules[kind] || [];
    const rows = items
      .map(
        (item, index) => `
          <div class="settings-rule-row">
            <textarea
              class="settings-rule-text"
              data-rule-kind="${kind}"
              data-rule-index="${index}"
              maxlength="120"
              rows="2"
            >${escapeHtml(item)}</textarea>
            <button
              type="button"
              class="settings-rule-remove"
              data-remove-rule-kind="${kind}"
              data-remove-rule-index="${index}"
              aria-label="Remove confluence"
              title="Remove confluence"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        `
      )
      .join("");

    return rows || '<div class="muted-empty">No confluences added yet.</div>';
  };

  settingsRuleEditorEl.innerHTML = `
    <div class="settings-rule-columns">
      <section class="settings-rule-column">
        <div class="confluence-label">Core</div>
        <div class="micro-hint">Missing makes setup invalid.</div>
        <div class="settings-rule-list">${renderRuleList("core")}</div>
        <div class="settings-rule-add">
          <input type="text" placeholder="Add core confluence" data-add-rule-input="core" maxlength="120" />
          <button type="button" class="btn btn-ghost btn-tiny" data-add-rule-kind="core">Add</button>
        </div>
      </section>
      <section class="settings-rule-column">
        <div class="confluence-label">Backing</div>
        <div class="micro-hint">Context and support layer.</div>
        <div class="settings-rule-list">${renderRuleList("backing")}</div>
        <div class="settings-rule-add">
          <input type="text" placeholder="Add backing confluence" data-add-rule-input="backing" maxlength="120" />
          <button type="button" class="btn btn-ghost btn-tiny" data-add-rule-kind="backing">Add</button>
        </div>
      </section>
      <section class="settings-rule-column">
        <div class="confluence-label">Quality</div>
        <div class="micro-hint">Improves entry quality.</div>
        <div class="settings-rule-list">${renderRuleList("quality")}</div>
        <div class="settings-rule-add">
          <input type="text" placeholder="Add quality confluence" data-add-rule-input="quality" maxlength="120" />
          <button type="button" class="btn btn-ghost btn-tiny" data-add-rule-kind="quality">Add</button>
        </div>
      </section>
    </div>
  `;
}

function renderSettingsSessionEditor() {
  if (!settingsSessionEditorEl) {
    return;
  }
  const sessions = orderSessions(settingsSessionDraft);
  settingsSessionDraft = [...sessions];

  settingsSessionEditorEl.innerHTML = sessions.length
    ? sessions
        .map(
          (session, index) => `
            <div class="settings-rule-row">
              <input
                class="settings-rule-text settings-session-text"
                data-session-index="${index}"
                type="text"
                maxlength="24"
                value="${escapeHtmlAttr(session)}"
              />
              <div class="settings-session-actions">
                <button
                  type="button"
                  class="settings-rule-remove settings-rule-move"
                  data-move-session-index="${index}"
                  data-move-session-delta="-1"
                  aria-label="Move session up"
                  title="Move up"
                >
                  <span aria-hidden="true">↑</span>
                </button>
                <button
                  type="button"
                  class="settings-rule-remove settings-rule-move"
                  data-move-session-index="${index}"
                  data-move-session-delta="1"
                  aria-label="Move session down"
                  title="Move down"
                >
                  <span aria-hidden="true">↓</span>
                </button>
                <button
                  type="button"
                  class="settings-rule-remove"
                  data-remove-session-index="${index}"
                  aria-label="Remove session"
                  title="Remove session"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </div>
          `
        )
        .join("")
    : '<div class="muted-empty">No sessions added yet.</div>';
}

function addSessionFromSettings(rawName) {
  const session = normalizeSessionName(rawName);
  if (!session) {
    showToast("Enter a session name first", "bad");
    return;
  }

  const exists = settingsSessionDraft.some((item) => item.toLowerCase() === session.toLowerCase());
  if (exists) {
    showToast(`${session} already exists`, "bad");
    return;
  }

  settingsSessionDraft = orderSessions([...settingsSessionDraft, session]);
  if (settingsNewSessionEl) {
    settingsNewSessionEl.value = "";
  }
  renderSettingsSessionEditor();
  showToast(`Added ${session}. Save sessions to apply.`, "ok");
}

function saveSettingsSessions() {
  if (settingsSaveSessionsBtn) {
    settingsSaveSessionsBtn.disabled = true;
  }
  try {
    const normalized = orderSessions(settingsSessionDraft);
    if (!normalized.length) {
      showToast("Add at least one session", "bad");
      return;
    }

    appSettings.sessionOptions = [...normalized];
    settingsSessionDraft = [...normalized];
    saveAppSettings();
    refreshSessionSelectors();
    renderSettingsSessionEditor();
    renderAll();
    showToast("Sessions saved", "ok");
  } finally {
    if (settingsSaveSessionsBtn) {
      settingsSaveSessionsBtn.disabled = false;
    }
  }
}

async function saveSettingsRules() {
  if (settingsSaveRulesBtn) {
    settingsSaveRulesBtn.disabled = true;
  }
  try {
    const normalized = normalizeConfluenceRulesMap(settingsRuleDraft);
    const configured = Object.keys(normalized);
    const missingCore = configured.find((strategy) => !(normalized[strategy]?.core || []).length);
    if (missingCore) {
      showToast(`${missingCore}: add at least one core confluence`, "bad");
      return;
    }

    const missingBacking = configured.find((strategy) => !(normalized[strategy]?.backing || []).length);
    if (missingBacking) {
      showToast(`${missingBacking}: add at least one backing confluence`, "bad");
      return;
    }

    const applyNewOnly = Boolean(settingsRulesNewOnlyEl?.checked);

    if (!applyNewOnly) {
      const proceed = confirm("Recompute existing trades with the new rule set? This will change historical analytics.");
      if (!proceed) {
        showToast("Rule save cancelled", "bad");
        return;
      }
    }

    appSettings.confluenceRules = normalized;
    appSettings.strategyMode = normalizeStrategyMode(appSettings.strategyMode, { strategies: configured });
    appSettings.ruleChangeMode = applyNewOnly ? "new_only" : "recompute_all";
    settingsRuleDraft = cloneConfluenceRules(normalized);
    saveAppSettings();

    refreshStrategySelectors();
    renderSettingsPanel();
    let updatedCount = 0;
    if (!applyNewOnly) {
      updatedCount = await recomputeTradesForCurrentRules();
    }
    syncEntryFlowState({ forceChecklistRerender: true });
    renderEditConfluenceChecklist();
    updateEditConfluenceSummary();
    renderAll();

    if (applyNewOnly) {
      showToast("Rules saved for new trades only", "ok");
    } else {
      showToast(`Confluence rules saved (${updatedCount} trades refreshed)`, "ok");
    }
  } finally {
    if (settingsSaveRulesBtn) {
      settingsSaveRulesBtn.disabled = false;
    }
  }
}

async function recomputeTradesForCurrentRules() {
  let updatedCount = 0;
  for (let index = 0; index < trades.length; index += 1) {
    const trade = trades[index];
    const inferred = inferConfluence(trade.strategy, trade.present_confluences || []);
    const next = {
      ...trade,
      confluence_score: inferred.confluence_score,
      total_confluences: inferred.total_confluences,
      missing_confluences: inferred.missing_confluences,
      required_missing_count: inferred.required_missing_count,
      quality_missing_count: inferred.quality_missing_count,
      setup_integrity: inferred.setup_integrity,
      setup_grade: inferred.setup_grade,
      state_tag: inferred.state_tag,
      model_adherence: inferred.model_adherence,
      core_present_count: inferred.core_present_count,
      core_total_count: inferred.core_total_count,
      backing_present_count: inferred.backing_present_count,
      backing_total_count: inferred.backing_total_count,
      quality_present_count: inferred.quality_present_count,
      quality_total_count: inferred.quality_total_count,
      missing_core: inferred.missing_core,
      missing_backing: inferred.missing_backing,
      missing_quality: inferred.missing_quality,
      raw_score_present: inferred.raw_score_present,
      raw_score_total: inferred.raw_score_total,
      updated_at: new Date().toISOString(),
    };

    const changed =
      trade.confluence_score !== next.confluence_score ||
      Number(trade.total_confluences) !== Number(next.total_confluences) ||
      !sameStringArray(trade.missing_confluences, next.missing_confluences) ||
      Number(trade.required_missing_count) !== Number(next.required_missing_count) ||
      Number(trade.quality_missing_count) !== Number(next.quality_missing_count) ||
      trade.setup_integrity !== next.setup_integrity ||
      trade.setup_grade !== next.setup_grade ||
      trade.state_tag !== next.state_tag ||
      trade.model_adherence !== next.model_adherence;

    if (!changed) {
      continue;
    }

    trades[index] = next;
    await saveTradeRecord(next);
    updatedCount += 1;
  }
  return updatedCount;
}

function sameStringArray(left, right) {
  const a = Array.isArray(left) ? left : [];
  const b = Array.isArray(right) ? right : [];
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index += 1) {
    if (String(a[index]) !== String(b[index])) {
      return false;
    }
  }
  return true;
}

function getCheckedValues(root, name) {
  return [...root.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
}

function clearCheckedValues(root, name) {
  root.querySelectorAll(`input[name="${name}"]:checked`).forEach((input) => {
    if (input instanceof HTMLInputElement) {
      input.checked = false;
    }
  });
}

function updateInvalidSaveState(buttonEl, strategy, presentConfluences, defaultText, forceText) {
  if (!buttonEl) {
    return;
  }
  const hasStrategy = Boolean(String(strategy || "").trim());
  if (!hasStrategy || !presentConfluences.length) {
    buttonEl.classList.remove("is-force-invalid");
    buttonEl.textContent = defaultText;
    return;
  }

  const inferred = inferConfluence(strategy, presentConfluences);
  if (inferred.setup_grade === "F") {
    buttonEl.classList.add("is-force-invalid");
    buttonEl.textContent = forceText;
    return;
  }

  buttonEl.classList.remove("is-force-invalid");
  buttonEl.textContent = defaultText;
}

function getStrategyConfig(strategy) {
  const normalized = normalizeStrategyName(strategy);
  const configuredRules = appSettings?.confluenceRules?.[normalized];
  if (configuredRules) {
    const fallback = STRATEGY_CONFIG[normalized] || { entryTypes: [] };
    return {
      core: Array.isArray(configuredRules.core) ? [...configuredRules.core] : [],
      backing: Array.isArray(configuredRules.backing) ? [...configuredRules.backing] : [],
      quality: Array.isArray(configuredRules.quality) ? [...configuredRules.quality] : [],
      entryTypes: Array.isArray(fallback.entryTypes) ? [...fallback.entryTypes] : [],
    };
  }
  if (STRATEGY_CONFIG[normalized]) {
    return STRATEGY_CONFIG[normalized];
  }
  const fallbackKey = Object.keys(STRATEGY_CONFIG).find((item) => item.toLowerCase() === normalized.toLowerCase());
  const fallback = (fallbackKey && STRATEGY_CONFIG[fallbackKey]) || { core: [], backing: [], quality: [], entryTypes: [] };
  const configuredFallback = fallbackKey ? appSettings?.confluenceRules?.[fallbackKey] : null;
  if (configuredFallback) {
    return {
      core: Array.isArray(configuredFallback.core) ? [...configuredFallback.core] : [...(fallback.core || [])],
      backing: Array.isArray(configuredFallback.backing) ? [...configuredFallback.backing] : [...(fallback.backing || [])],
      quality: Array.isArray(configuredFallback.quality) ? [...configuredFallback.quality] : [...(fallback.quality || [])],
      entryTypes: Array.isArray(fallback.entryTypes) ? [...fallback.entryTypes] : [],
    };
  }
  return fallback;
}

function getConfluenceRules(strategy) {
  const config = getStrategyConfig(strategy);
  return {
    required: [...(config.core || []), ...(config.backing || [])],
    quality: [...(config.quality || [])],
  };
}

function inferConfluence(strategy, presentConfluences) {
  const config = getStrategyConfig(strategy);
  const core = config.core || [];
  const backing = config.backing || [];
  const quality = config.quality || [];
  const all = [...core, ...backing, ...quality];

  const presentSet = new Set(presentConfluences || []);
  const missingCore = core.filter((item) => !presentSet.has(item));
  const missingBacking = backing.filter((item) => !presentSet.has(item));
  const missingQuality = quality.filter((item) => !presentSet.has(item));
  const missing = [...missingCore, ...missingBacking, ...missingQuality];

  const corePresentCount = core.length - missingCore.length;
  const backingPresentCount = backing.length - missingBacking.length;
  const qualityPresentCount = quality.length - missingQuality.length;
  const rawScorePresent = all.length - missing.length;

  let grade = "F";
  if (missingCore.length > 0) {
    grade = "F";
  } else if (missingBacking.length === 0 && missingQuality.length === 0) {
    grade = "A+";
  } else if (missingBacking.length === 0 && missingQuality.length > 0) {
    grade = "A";
  } else if (missingBacking.length === 1 && missingQuality.length === 0) {
    grade = "B";
  } else {
    grade = "C";
  }

  let stateTag = "Valid, degraded";
  if (grade === "A+") {
    stateTag = "Full-model";
  } else if (grade === "A") {
    stateTag = "Valid, reduced quality";
  } else if (grade === "B") {
    stateTag = `Valid, ${pickPrimaryBackingIssue(missingBacking)}`;
  } else if (grade === "C") {
    if (missingBacking.length >= 1 && missingQuality.length > 0) {
      stateTag = `Valid, ${pickPrimaryBackingIssue(missingBacking)} + reduced quality`;
    } else if (missingBacking.length >= 1) {
      stateTag = `Valid, ${pickPrimaryBackingIssue(missingBacking)}`;
    } else if (missingQuality.length > 0) {
      stateTag = "Valid, reduced quality";
    } else {
      stateTag = "Valid, weak backing";
    }
  } else if (grade === "F") {
    const coreTags = missingCore.map((item) => CORE_LABEL_MAP[item] || `no ${item.toLowerCase()}`);
    stateTag = `Invalid, ${coreTags.join(" + ")}`;
  }

  const adherenceMap = {
    "A+": "Full",
    A: "High",
    B: "High",
    C: "Reduced",
    F: "Bad",
  };
  const adherence = adherenceMap[grade] || "Bad";

  const legacyIntegrityMap = {
    Full: "full_confluence",
    High: "one_soft_confluence_missing",
    Reduced: "multiple_soft_confluences_missing",
    Bad: "hard_invalidation_present",
  };

  return {
    confluence_score: `${rawScorePresent}/${all.length || 0}`,
    total_confluences: all.length,
    missing_confluences: missing,
    required_missing_count: missingCore.length,
    quality_missing_count: missingQuality.length,
    setup_integrity: legacyIntegrityMap[adherence] || "hard_invalidation_present",
    setup_grade: grade,
    state_tag: stateTag,
    model_adherence: adherence,
    core_present_count: corePresentCount,
    core_total_count: core.length,
    backing_present_count: backingPresentCount,
    backing_total_count: backing.length,
    quality_present_count: qualityPresentCount,
    quality_total_count: quality.length,
    missing_core: missingCore,
    missing_backing: missingBacking,
    missing_quality: missingQuality,
    raw_score_present: rawScorePresent,
    raw_score_total: all.length,
  };
}

function buildConfluenceChecklistHtml(strategy, inputName, selectedValues) {
  const selected = new Set(selectedValues || []);
  const config = getStrategyConfig(strategy);
  if (!config.core.length && !config.backing.length && !config.quality.length) {
    return `<div class="muted-empty">Select strategy to load checklist.</div>`;
  }

  const renderItems = (items) =>
    items
      .map((item, index) => {
        const checked = selected.has(item) ? "checked" : "";
        const id = `${inputName}-${slugify(item)}-${index}`;
        return `<label class="confluence-item" for="${id}">
          <input id="${id}" name="${inputName}" type="checkbox" value="${escapeHtmlAttr(item)}" ${checked} />
          <span>${escapeHtml(item)}</span>
        </label>`;
      })
      .join("");

  return `
    <section class="confluence-block">
      <div class="confluence-label">Core</div>
      <div class="confluence-list">${renderItems(config.core)}</div>
    </section>
    <section class="confluence-block">
      <div class="confluence-label">Backing</div>
      <div class="confluence-list">${renderItems(config.backing)}</div>
    </section>
    <section class="confluence-block">
      <div class="confluence-label">Quality</div>
      <div class="confluence-list">${renderItems(config.quality)}</div>
    </section>
  `;
}

function syncSmcEntryTypeVisibility(strategy, { wrapEl, listEl, inputName, selectedValues }) {
  if (!wrapEl || !listEl) {
    return;
  }
  const config = getStrategyConfig(strategy);
  const entries = config.entryTypes || [];
  const selected = new Set(selectedValues || []);

  if (!entries.length) {
    wrapEl.hidden = true;
    listEl.innerHTML = "";
    return;
  }

  wrapEl.hidden = false;
  listEl.innerHTML = entries
    .map((entry) => {
      const checked = selected.has(entry) ? "checked" : "";
      return `<label class="chip"><input type="checkbox" name="${escapeHtmlAttr(inputName)}" value="${escapeHtmlAttr(entry)}" ${checked} /><span>${escapeHtml(entry)}</span></label>`;
    })
    .join("");
}

function renderConfluenceSummary(summaryEl, strategy, presentConfluences) {
  if (!strategy) {
    summaryEl.textContent = "Select strategy to load checklist.";
    summaryEl.className = "confluence-summary muted-empty";
    return;
  }

  const inferred = inferConfluence(strategy, presentConfluences);
  const noInteractionYet = !Array.isArray(presentConfluences) || presentConfluences.length === 0;
  if (noInteractionYet) {
    summaryEl.className = "confluence-summary muted-empty";
    summaryEl.innerHTML = "<div><strong>Setup verdict will appear here.</strong></div><div>Select confluences to compute grade.</div>";
    return;
  }

  const missing = inferred.missing_confluences.length ? inferred.missing_confluences.join(", ") : "None";
  const topReason =
    inferred.required_missing_count > 0
      ? "Missing core confirmations"
      : inferred.quality_missing_count > 0
        ? "Missing quality confirmations"
        : "Setup aligned";

  summaryEl.className = "confluence-summary";
  summaryEl.innerHTML = `
    <div class="confluence-summary-main"><strong>${escapeHtml(inferred.setup_grade)} - ${escapeHtml(inferred.state_tag)}</strong></div>
    <div class="confluence-summary-reason">${escapeHtml(topReason)}</div>
    <div><strong>Adherence:</strong> ${escapeHtml(inferred.model_adherence)}</div>
    <details class="confluence-detail-expander">
      <summary>Show details</summary>
      <div class="confluence-detail-body">
        <div><strong>Core:</strong> ${inferred.core_present_count}/${inferred.core_total_count} · <strong>Backing:</strong> ${inferred.backing_present_count}/${inferred.backing_total_count} · <strong>Quality:</strong> ${inferred.quality_present_count}/${inferred.quality_total_count}</div>
        <div><strong>Missing:</strong> ${escapeHtml(missing)}</div>
        <div><strong>Raw score:</strong> ${escapeHtml(inferred.confluence_score)}</div>
      </div>
    </details>
  `;
}

function renderCreateConfluenceChecklist() {
  const strategy = strategyEl.value;
  const selected = getCheckedValues(form, "createConfluence");
  confluenceChecklistEl.innerHTML = buildConfluenceChecklistHtml(strategy, "createConfluence", selected);
  confluenceChecklistEl.dataset.strategy = strategy || "";
}

function updateCreateConfluenceSummary() {
  renderConfluenceSummary(confluenceSummaryEl, strategyEl.value, getCheckedValues(form, "createConfluence"));
}

function renderEditConfluenceChecklist(selectedValues) {
  const strategy = editStrategyEl.value;
  const selected = selectedValues || getCheckedValues(editForm, "editConfluence");
  editConfluenceChecklistEl.innerHTML = buildConfluenceChecklistHtml(strategy, "editConfluence", selected);
  syncSmcEntryTypeVisibility(strategy, {
    wrapEl: editSmcEntryTypesWrapEl,
    listEl: editSmcEntryTypesEl,
    inputName: "editSmcEntryType",
    selectedValues: getCheckedValues(editForm, "editSmcEntryType"),
  });
}

function updateEditConfluenceSummary() {
  renderConfluenceSummary(editConfluenceSummaryEl, editStrategyEl.value, getCheckedValues(editForm, "editConfluence"));
  updateInvalidSaveState(
    editSaveBtn,
    editStrategyEl.value,
    getCheckedValues(editForm, "editConfluence"),
    "Save Changes",
    "Force Save Invalid Setup"
  );
}

async function handleCreateSubmit(event) {
  event.preventDefault();
  errorEl.textContent = "";

  try {
    const lotSize = Number(lotSizeEl.value);
    if (!Number.isFinite(lotSize) || lotSize <= 0) {
      failInline("Lot size must be a positive number.");
      return;
    }

    const sessions = getCheckedValues(form, "session");
    const missingRequiredFields = getMissingEntryFields({
      pair: pairEl.value,
      direction: directionEl.value,
      strategy: strategyEl.value,
      sessions,
    });
    if (missingRequiredFields.length) {
      failInline(`Missing required: ${missingRequiredFields.join(", ")}.`);
      return;
    }

    // Validate pair is properly formatted
    const normalizedPair = normalizePairCode(pairEl.value);
    if (!normalizedPair || normalizedPair.length < 4) {
      failInline("Pair must be valid (e.g., EURUSD, GBPUSD).");
      return;
    }

    if (!createImages.beforeBlob) {
      failInline("Primary screenshot is required.");
      return;
    }

    const pnl = parsePnl(pnlEl.value);
    const pnlError = validatePnlInput(pnlEl.value);
    if (pnlError) {
      failInline(pnlError);
      return;
    }

    let capturedAt = new Date();
    if (entryManualTimeEnabled) {
      if (!tradeDateEl.value || !tradeTimeEl.value) {
        failInline("Manual time needs both date and time.");
        return;
      }
      capturedAt = combineDateTime(tradeDateEl.value, tradeTimeEl.value);
      if (Number.isNaN(capturedAt.getTime())) {
        failInline("Invalid manual date/time.");
        return;
      }
    }

    const presentConfluences = getCheckedValues(form, "createConfluence");
    if (!presentConfluences.length) {
      failInline("Tick at least one setup checklist item.");
      return;
    }
    const inferred = inferConfluence(strategyEl.value, presentConfluences);
    const smcEntryTypes = strategyEl.value === "SMC" ? getCheckedValues(form, "createSmcEntryType") : [];

    registerPair(pairEl.value);
    const beforeImageId = createImages.beforeBlob ? await saveImageRecord(createImages.beforeBlob) : null;
    const afterImageId = createImages.afterBlob ? await saveImageRecord(createImages.afterBlob) : null;

    const nowIso = new Date().toISOString();
    const status = outcomeEl.value ? "closed" : "open";

    const trade = normalizeTrade({
      id: crypto.randomUUID(),
      pair: pairEl.value,
      direction: directionEl.value,
      lot_size: normalizeLotSizeValue(lotSize),
      sessions,
      strategy: strategyEl.value,
      smc_entry_types: smcEntryTypes,
      present_confluences: presentConfluences,
      confluence_score: inferred.confluence_score,
      total_confluences: inferred.total_confluences,
      missing_confluences: inferred.missing_confluences,
      required_missing_count: inferred.required_missing_count,
      quality_missing_count: inferred.quality_missing_count,
      setup_integrity: inferred.setup_integrity,
      setup_grade: inferred.setup_grade,
      state_tag: inferred.state_tag,
      model_adherence: inferred.model_adherence,
      core_present_count: inferred.core_present_count,
      core_total_count: inferred.core_total_count,
      backing_present_count: inferred.backing_present_count,
      backing_total_count: inferred.backing_total_count,
      quality_present_count: inferred.quality_present_count,
      quality_total_count: inferred.quality_total_count,
      missing_core: inferred.missing_core,
      missing_backing: inferred.missing_backing,
      missing_quality: inferred.missing_quality,
      raw_score_present: inferred.raw_score_present,
      raw_score_total: inferred.raw_score_total,
      outcome: outcomeEl.value,
      pnl: Number.isFinite(pnl) ? pnl : null,
      note: noteEl.value.trim(),
      captured_at_utc: capturedAt.toISOString(),
      captured_at_local: formatDateTime(capturedAt.toISOString()),
      timezone_offset_min: capturedAt.getTimezoneOffset(),
      status,
      closed_at_utc: status === "closed" ? nowIso : null,
      edit_count: 0,
      before_image_id: beforeImageId,
      after_image_id: afterImageId,
      created_at: nowIso,
      updated_at: nowIso,
    });

    await saveTradeRecord(trade);
    trades.unshift(trade);

    invalidateAnalyticsCache();
    showToast("Trade saved", "ok");
    quickSavePulse();
    handleClear({ showToast: false });
    renderAll();
  } catch (error) {
    console.error(error);
    failInline("Unable to save trade.");
  }
}

function failInline(message) {
  errorEl.textContent = message;
  showToast(message, "bad");
}

function quickSavePulse() {
  saveBtn.animate(
    [
      { transform: "scale(1)", filter: "brightness(1)" },
      { transform: "scale(1.03)", filter: "brightness(1.06)" },
      { transform: "scale(1)", filter: "brightness(1)" },
    ],
    { duration: 280, easing: "ease-out" }
  );
}

function showToast(message, tone) {
  toast.show(message, tone);
}

function setHistoryView(mode) {
  historyViewMode = mode;
  if (mode === "grid") {
    openInlineEditorId = null;
  }
  viewListBtn.classList.toggle("is-active", mode === "list");
  viewGridBtn.classList.toggle("is-active", mode === "grid");
  renderHistory(getFilteredTrades());
}

function setHistoryStatusTab(status) {
  const allowed = status === "open" || status === "all" ? status : "closed";
  historyStatusTab = allowed;
  historyTabClosedEl?.classList.toggle("is-active", allowed === "closed");
  historyTabOpenEl?.classList.toggle("is-active", allowed === "open");
  historyTabAllEl?.classList.toggle("is-active", allowed === "all");
  openInlineEditorId = null;
  renderHistory(getFilteredTrades());
}

function getActiveFilterCount() {
  return [filterPairEl, filterSessionEl, filterOutcomeEl, filterStrategyEl, filterIntegrityEl].reduce(
    (count, el) => count + (el && el.value ? 1 : 0),
    0
  );
}

function updateHistoryFilterMeta() {
  if (!historyFilterMetaEl) {
    return;
  }
  const active = getActiveFilterCount();
  historyFilterMetaEl.textContent = active ? `${active} filter${active === 1 ? "" : "s"} active` : "No filters";
}

function getFilteredTrades() {
  return trades.filter((trade) => {
    const statusOk = historyStatusTab === "all" || trade.status === historyStatusTab;
    const pairOk = !filterPairEl.value || trade.pair === filterPairEl.value;
    const sessionOk = !filterSessionEl.value || (trade.sessions || []).includes(filterSessionEl.value);
    const outcomeOk =
      !filterOutcomeEl.value ||
      (filterOutcomeEl.value === "__OPEN__" ? trade.status === "open" : trade.outcome === filterOutcomeEl.value);
    const strategyOk = !filterStrategyEl.value || trade.strategy === filterStrategyEl.value;
    const adherenceValue = trade.model_adherence || "Bad";
    const integrityOk = !filterIntegrityEl.value || adherenceValue === filterIntegrityEl.value;

    return statusOk && pairOk && sessionOk && outcomeOk && strategyOk && integrityOk;
  });
}

function getAnalyticsTrades() {
  return trades.filter((trade) => {
    const pairOk = !filterPairEl.value || trade.pair === filterPairEl.value;
    const sessionOk = !filterSessionEl.value || (trade.sessions || []).includes(filterSessionEl.value);
    const outcomeOk =
      !filterOutcomeEl.value ||
      (filterOutcomeEl.value === "__OPEN__" ? trade.status === "open" : trade.outcome === filterOutcomeEl.value);
    const strategyOk = !filterStrategyEl.value || trade.strategy === filterStrategyEl.value;
    const adherenceValue = trade.model_adherence || "Bad";
    const integrityOk = !filterIntegrityEl.value || adherenceValue === filterIntegrityEl.value;

    // Keep Edge Review independent from history status tabs so KPIs remain globally accurate.
    return pairOk && sessionOk && outcomeOk && strategyOk && integrityOk;
  });
}

function renderAll() {
  renderTopInsightReel(trades);
  renderFilteredSections();
}

function renderFilteredSections() {
  updateHistoryFilterMeta();
  const historyRows = getFilteredTrades();
  const analyticsRows = getAnalyticsTrades();
  renderAnalytics(analyticsRows);
  renderHistory(historyRows);
}

function sortTradesForDisplay(rows) {
  return sortTradesForDisplayWithOpenFirst(rows, toMillis);
}

async function renderHistory(rows) {
  if (isRenderingHistory) {
    return;
  }
  isRenderingHistory = true;

  try {
    const ordered = sortTradesForDisplay(rows);
    const openRows = ordered.filter((trade) => trade.status === "open");
    const closedRows = ordered.filter((trade) => trade.status !== "open");

    if (historyViewMode === "list") {
      releaseHistoryUrls();
      renderHistoryList(openRows, closedRows);
    } else {
      await renderHistoryGrid(openRows, closedRows);
    }
  } finally {
    isRenderingHistory = false;
  }
}

function renderHistoryList(openRows, closedRows) {
  historyGalleryEl.className = "history-list";
  historyGalleryEl.innerHTML = "";

  if (!openRows.length && !closedRows.length) {
    historyGalleryEl.innerHTML = '<div class="muted-empty">No trades found.</div>';
    return;
  }

  if (openRows.length) {
    historyGalleryEl.appendChild(createGroupTitle("Open Trades", true, openRows.length));
    openRows.forEach((trade) => {
      const row = createTradeRow(trade);
      historyGalleryEl.appendChild(row);
      if (openInlineEditorId === trade.id) {
        historyGalleryEl.appendChild(createInlineEditorRow(trade));
      }
    });
  }

  if (closedRows.length) {
    historyGalleryEl.appendChild(createGroupTitle("Closed Trades", false, closedRows.length));
    closedRows.forEach((trade) => {
      const row = createTradeRow(trade);
      historyGalleryEl.appendChild(row);
      if (openInlineEditorId === trade.id) {
        historyGalleryEl.appendChild(createInlineEditorRow(trade));
      }
    });
  }
}

async function renderHistoryGrid(openRows, closedRows) {
  historyGalleryEl.className = "history-list";
  historyGalleryEl.innerHTML = "";

  if (!openRows.length && !closedRows.length) {
    historyGalleryEl.innerHTML = '<div class="muted-empty">No trades found.</div>';
    return;
  }

  releaseHistoryUrls();
  const { map: urlMap, missingImageIds } = await loadImageUrls([...openRows, ...closedRows]);

  if (openRows.length) {
    historyGalleryEl.appendChild(createGroupTitle("Open Trades", true, openRows.length));
    historyGalleryEl.appendChild(createCardGroup(openRows, urlMap, missingImageIds));
  }

  if (closedRows.length) {
    historyGalleryEl.appendChild(createGroupTitle("Closed Trades", false, closedRows.length));
    historyGalleryEl.appendChild(createCardGroup(closedRows, urlMap, missingImageIds));
  }
}

function createGroupTitle(label, isOpen, count) {
  const title = document.createElement("div");
  title.className = `group-title${isOpen ? " open" : ""}`;
  title.textContent = `${label} (${count})`;
  return title;
}

function createCardGroup(rows, urlMap, missingImageIds = []) {
  const grid = document.createElement("div");
  grid.className = "history-gallery group-gallery";

  rows.forEach((trade) => {
    const beforeUrl = trade.before_image_id ? urlMap.get(trade.before_image_id) : "";
    const afterUrl = trade.after_image_id ? urlMap.get(trade.after_image_id) : "";
    const beforeMissing = trade.before_image_id && !beforeUrl;
    const afterMissing = trade.after_image_id && !afterUrl;

    const setupClass = integrityClass(trade.setup_integrity);
    const outcomeClass = badgeClassForOutcome(trade.outcome);
    const pnlClass = Number.isFinite(trade.pnl) ? (trade.pnl >= 0 ? "pnl-pos" : "pnl-neg") : "muted-empty";

    const beforeImg = beforeUrl
      ? `<img class="trade-img" src="${beforeUrl}" alt="Before screenshot" />`
      : `<div class="trade-img muted-empty">${beforeMissing ? "❌" : ""}</div>`;
    const afterImg = afterUrl
      ? `<img class="trade-img" src="${afterUrl}" alt="After screenshot" />`
      : `<div class="trade-img muted-empty">${afterMissing ? "❌" : ""}</div>`;

    const card = document.createElement("article");
    card.className = `trade-card${trade.status === "open" ? " open-trade" : ""}`;
    card.dataset.viewId = trade.id;
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    
    // Check if this trade has pending sync operations
    const queue = loadSyncQueue();
    const hasPendingSync = queue.some((op) => op.trade_id === trade.id);
    const syncIndicator = hasPendingSync ? '<span class="badge b-warn" title="Pending cloud sync">📤</span>' : "";
    
    card.innerHTML = `
      <div class="trade-image-grid">
        ${beforeImg}
        ${afterImg}
      </div>
      <div class="trade-caption">
        <div class="cap-top">
          <div class="cap-pair">${escapeHtml(trade.pair)} · ${escapeHtml(trade.direction)}</div>
          <div class="cap-time">${formatDateTime(trade.captured_at_utc)}</div>
        </div>
        <div class="cap-meta">
          ${trade.status === "open" ? '<span class="open-chip">Open</span>' : ""}
          ${syncIndicator}
          <span class="badge ${setupClass}">${escapeHtml(trade.state_tag || integrityLabel(trade.model_adherence || "Bad"))}</span>
          <span class="badge ${outcomeClass}">${escapeHtml(trade.outcome || "Open")}</span>
          <span class="badge b-info">${escapeHtml(trade.strategy || "-")}</span>
          <span class="badge b-info">${escapeHtml((trade.sessions || []).join(" / "))}</span>
          <span class="badge b-info">Grade ${escapeHtml(trade.setup_grade || "-")}</span>
          <span class="badge b-info">${escapeHtml(trade.model_adherence || "Bad")}</span>
        </div>
        <div class="cap-note">${escapeHtml(trade.note || "-")}</div>
        <div class="cap-bottom">
          <div class="${pnlClass}">${formatMoney(trade.pnl)}</div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  return grid;
}

function shortOutcomeLabel(trade) {
  if (trade.status === "open") {
    return "Open";
  }
  switch (trade.outcome) {
    case "Full Win":
      return "Win";
    case "Full Loss":
      return "Loss";
    case "Partial + BE":
      return "P+BE";
    case "Breakeven":
      return "BE";
    default:
      return "Closed";
  }
}

function createTradeRow(trade) {
  const row = document.createElement("div");
  const pnlClass = Number.isFinite(trade.pnl) ? (trade.pnl >= 0 ? "pnl-pos" : "pnl-neg") : "muted-empty";
  const outcome = shortOutcomeLabel(trade);
  const grade = trade.setup_grade || "-";
  const strategy = trade.strategy || "-";
  const glanceText = `${outcome} · Grade ${grade} · ${strategy}`;

  row.className = `trade-row${trade.status === "open" ? " open-trade" : ""}`;
  row.dataset.viewId = trade.id;
  row.setAttribute("role", "button");
  row.tabIndex = 0;
  row.innerHTML = `
    <div class="tr-pair">${escapeHtml(trade.pair)} <span class="tr-dir">${escapeHtml(trade.direction)}</span></div>
    <div class="tr-glance" title="${escapeHtmlAttr((trade.state_tag || "") + " | " + formatDateTime(trade.captured_at_utc))}">${escapeHtml(glanceText)}</div>
    <div class="tr-pnl ${pnlClass}">${escapeHtml(formatMoney(trade.pnl))}</div>
  `;
  return row;
}

function createInlineEditorRow(trade) {
  const row = document.createElement("form");
  row.className = "inline-editor-row";
  row.dataset.id = trade.id;

  const date = toDateInputValue(trade.captured_at_utc || new Date());
  const time = toTimeInputValue(trade.captured_at_utc || new Date());

  row.innerHTML = `
    <div class="inline-grid">
      <label class="field">Pair
        <select class="inline-pair">${pairOptionsHtml(trade.pair, true, true)}</select>
      </label>
      <label class="field">Direction
        <select class="inline-direction">
          ${optionsHtml(["Buy", "Sell"], trade.direction, true)}
        </select>
      </label>
      <label class="field">Lot Size
        <input class="inline-lot" type="number" min="0.01" step="0.01" value="${Number(normalizeLotSizeValue(trade.lot_size)).toFixed(2)}" />
      </label>
      <label class="field">Strategy
        <select class="inline-strategy">${optionsHtml(getStrategyOptionsForEdit(trade.strategy), trade.strategy, !isSingleStrategyMode())}</select>
      </label>

      <div class="field">Session
        <div class="chip-row">
          ${getSessionOptionsForInput(trade.sessions || []).map((session) => {
            const checked = (trade.sessions || []).includes(session) ? "checked" : "";
            return `<label class="chip"><input type="checkbox" name="inlineSession" value="${escapeHtmlAttr(session)}" ${checked} /><span>${escapeHtml(session)}</span></label>`;
          }).join("")}
        </div>
      </div>

      <label class="field">Outcome
        <select class="inline-outcome">
          <option value="">Open - fill later</option>
          ${OUTCOMES.map((outcome) => `<option value="${outcome}" ${trade.outcome === outcome ? "selected" : ""}>${outcome}</option>`).join("")}
        </select>
      </label>

      <label class="field">PnL ($)
        <input class="inline-pnl" type="text" value="${Number.isFinite(trade.pnl) ? escapeHtmlAttr(String(trade.pnl)) : ""}" />
      </label>

      <label class="field">Note
        <input class="inline-note" type="text" maxlength="240" value="${escapeHtmlAttr(trade.note || "")}" />
      </label>
    </div>

    <details class="confluence-card confluence-collapsible">
      <summary class="confluence-toggle">
        <span>Setup Checklist</span>
        <span class="confluence-toggle-meta">
          <span class="micro-hint">Tap to expand</span>
          <span class="confluence-toggle-v" aria-hidden="true">⌄</span>
        </span>
      </summary>
      <div class="confluence-body">
        <div class="section-head section-head-tight">
          <div class="micro-hint">Tick all confluences that were present</div>
          <button type="button" class="btn btn-ghost btn-tiny time-toggle-btn" data-inline-time-toggle="${trade.id}">Set Time Manually</button>
        </div>
        <div class="manual-time-fields" data-inline-time-fields="${trade.id}" style="display: none">
          <label class="field">Date<input class="inline-date" type="date" value="${date}" /></label>
          <label class="field">Time<input class="inline-time" type="time" value="${time}" /></label>
        </div>
        <div class="confluence-grid inline-confluence"></div>
        <div class="confluence-summary inline-summary"></div>
      </div>
    </details>

    <div class="inline-grid">
      <label class="field">Before Image
        <input class="inline-before-file" type="file" accept="image/*" />
      </label>
      <label class="field">After Image
        <input class="inline-after-file" type="file" accept="image/*" />
      </label>
      <label class="field">Before (${trade.before_image_id ? "present" : "missing"})
        <input class="inline-before-remove" type="checkbox" ${trade.before_image_id ? "" : "disabled"} /> Remove
      </label>
      <label class="field">After (${trade.after_image_id ? "present" : "missing"})
        <input class="inline-after-remove" type="checkbox" ${trade.after_image_id ? "" : "disabled"} /> Remove
      </label>
    </div>

    <div class="action-row">
      <div class="inline-delete-hint">${trade.status === "closed" ? "Closed trades require hold to delete" : "Open trades use normal delete"}</div>
      <button class="btn btn-danger" type="button" data-inline-delete="${trade.id}">Delete</button>
      <button class="btn btn-ghost" type="button" data-inline-cancel="${trade.id}">Cancel</button>
      <button class="btn btn-primary" type="submit">Save</button>
    </div>
  `;

  const strategySelect = row.querySelector(".inline-strategy");
  const pairSelect = row.querySelector(".inline-pair");
  const confluenceContainer = row.querySelector(".inline-confluence");
  const confluenceSummary = row.querySelector(".inline-summary");
  if (pairSelect instanceof HTMLSelectElement) {
    pairSelect.dataset.prevPair = normalizePairCode(trade.pair);
  }
  if (strategySelect instanceof HTMLSelectElement && isSingleStrategyMode()) {
    strategySelect.disabled = getAllowedStrategies().includes(trade.strategy);
  }

  const renderInlineConfluence = () => {
    const currentStrategy = strategySelect.value;
    const selected = getCheckedValues(row, "inlineConfluence");
    confluenceContainer.innerHTML = buildConfluenceChecklistHtml(currentStrategy, "inlineConfluence", selected);
    renderConfluenceSummary(confluenceSummary, currentStrategy, getCheckedValues(row, "inlineConfluence"));
  };

  confluenceContainer.innerHTML = buildConfluenceChecklistHtml(trade.strategy, "inlineConfluence", trade.present_confluences || []);
  renderConfluenceSummary(confluenceSummary, trade.strategy, trade.present_confluences || []);

  row.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.classList.contains("inline-pair")) {
      handlePairSelectChange(target);
      return;
    }

    if (target.classList.contains("inline-strategy")) {
      clearCheckedValues(row, "inlineConfluence");
      renderInlineConfluence();
      return;
    }

    if (target.getAttribute("name") === "inlineConfluence") {
      renderInlineConfluence();
    }
  });

  row.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleInlineSubmit(row, trade);
  });

  const cancelBtn = row.querySelector(`[data-inline-cancel="${trade.id}"]`);
  cancelBtn?.addEventListener("click", () => {
    openInlineEditorId = null;
    renderAll();
  });

  const timeToggle = row.querySelector(`[data-inline-time-toggle="${trade.id}"]`);
  const timeFields = row.querySelector(`[data-inline-time-fields="${trade.id}"]`);
  let manualTimeEnabled = false;

  timeToggle?.addEventListener("click", () => {
    manualTimeEnabled = !manualTimeEnabled;
    timeFields.style.display = manualTimeEnabled ? "grid" : "none";
    timeToggle.textContent = manualTimeEnabled ? "Use Existing Time" : "Set Time Manually";
  });

  row.dataset.manualTime = "false";
  timeToggle?.addEventListener("click", () => {
    row.dataset.manualTime = manualTimeEnabled ? "true" : "false";
  });

  const deleteBtn = row.querySelector(`[data-inline-delete="${trade.id}"]`);
  if (deleteBtn instanceof HTMLButtonElement) {
    configureDeleteButton(deleteBtn, trade, async () => {
      await deleteTrade(trade.id);
    });
  }

  return row;
}

async function handleInlineSubmit(formEl, existingTrade) {
  const lot = Number(formEl.querySelector(".inline-lot")?.value || "");
  if (!Number.isFinite(lot) || lot <= 0) {
    showToast("Inline edit: invalid lot size", "bad");
    return;
  }

  const pair = formEl.querySelector(".inline-pair")?.value || "";
  const direction = formEl.querySelector(".inline-direction")?.value || "";
  const strategy = formEl.querySelector(".inline-strategy")?.value || "";
  const sessions = getCheckedValues(formEl, "inlineSession");
  const presentConfluences = getCheckedValues(formEl, "inlineConfluence");
  const outcome = formEl.querySelector(".inline-outcome")?.value || "";
  const note = (formEl.querySelector(".inline-note")?.value || "").trim();
  const pnl = parsePnl(formEl.querySelector(".inline-pnl")?.value || "");

  if (!pair || !direction || !strategy || sessions.length === 0) {
    showToast("Inline edit: missing required fields", "bad");
    return;
  }

  if ((formEl.querySelector(".inline-pnl")?.value || "").trim() && !Number.isFinite(pnl)) {
    showToast("Inline edit: invalid PnL", "bad");
    return;
  }

  if (!presentConfluences.length) {
    showToast("Inline edit: setup checklist required", "bad");
    return;
  }

  let capturedAtUtc = existingTrade.captured_at_utc;
  if (formEl.dataset.manualTime === "true") {
    const dateValue = formEl.querySelector(".inline-date")?.value;
    const timeValue = formEl.querySelector(".inline-time")?.value;
    if (!dateValue || !timeValue) {
      showToast("Inline edit: manual time needs date and time", "bad");
      return;
    }
    const parsed = combineDateTime(dateValue, timeValue);
    if (Number.isNaN(parsed.getTime())) {
      showToast("Inline edit: invalid manual date/time", "bad");
      return;
    }
    capturedAtUtc = parsed.toISOString();
  }

  const beforeFile = formEl.querySelector(".inline-before-file")?.files?.[0];
  const afterFile = formEl.querySelector(".inline-after-file")?.files?.[0];
  const removeBefore = Boolean(formEl.querySelector(".inline-before-remove")?.checked);
  const removeAfter = Boolean(formEl.querySelector(".inline-after-remove")?.checked);

  let beforeBlob = null;
  let afterBlob = null;

  if (beforeFile) {
    beforeBlob = await compressImage(beforeFile);
  }
  if (afterFile) {
    afterBlob = await compressImage(afterFile);
  }

  const finalBefore = removeBefore && !beforeBlob ? null : existingTrade.before_image_id;
  const finalAfter = removeAfter && !afterBlob ? null : existingTrade.after_image_id;
  if (!finalBefore && !finalAfter && !beforeBlob && !afterBlob) {
    showToast("At least one screenshot is required", "bad");
    return;
  }

  await updateTrade(existingTrade.id, {
    pair,
    direction,
    lot_size: normalizeLotSizeValue(lot),
    sessions,
    strategy,
    smc_entry_types: existingTrade.smc_entry_types || [],
    present_confluences: presentConfluences,
    outcome,
    pnl: Number.isFinite(pnl) ? pnl : null,
    note,
    captured_at_utc: capturedAtUtc,
    timezone_offset_min: new Date(capturedAtUtc).getTimezoneOffset(),
    imagePatch: {
      before: { remove: removeBefore, newBlob: beforeBlob },
      after: { remove: removeAfter, newBlob: afterBlob },
    },
  });

  openInlineEditorId = null;
  showToast("Trade updated", "ok");
  renderAll();
}

function onHistoryActionClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.closest(".inline-editor-row")) {
    return;
  }

  const editBtn = target.closest("[data-edit-id]");
  if (editBtn) {
    const id = editBtn.getAttribute("data-edit-id");
    if (!id) {
      return;
    }
    const trade = trades.find((item) => item.id === id);
    if (!trade) {
      return;
    }

    if (historyViewMode === "list" && trade.status === "open") {
      openInlineEditorId = openInlineEditorId === id ? null : id;
      renderHistory(getFilteredTrades());
      return;
    }

    if (!confirmClosedTradeEdit(trade)) {
      return;
    }

    openEditModal(id);
    return;
  }

  const viewTarget = target.closest("[data-view-id]");
  if (!viewTarget) {
    return;
  }
  const id = viewTarget.getAttribute("data-view-id");
  if (!id) {
    return;
  }
  openTradeDetailModal(id);
}

function onHistoryActionKeyDown(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.closest("button, input, select, textarea, summary")) {
    return;
  }

  const rowOrCard = target.closest("[data-view-id]");
  if (!rowOrCard) {
    return;
  }

  event.preventDefault();
  const id = rowOrCard.getAttribute("data-view-id");
  if (!id) {
    return;
  }
  openTradeDetailModal(id);
}

function confirmClosedTradeEdit(trade) {
  if (!trade || trade.status !== "closed") {
    return true;
  }
  return window.confirm("Closed trade edit check: continue only if this is a meaningful correction.");
}

function renderDetailListHtml(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<span class="muted-empty">None</span>';
  }
  return `<ul class="detail-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function releaseDetailModalUrls() {
  detailModalUrls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore URL revocation failures.
    }
  });
  detailModalUrls = [];
}

async function openTradeDetailModal(id) {
  const trade = trades.find((item) => item.id === id);
  if (!trade || !tradeDetailModalEl || !detailModalBodyEl) {
    return;
  }

  activeDetailTradeId = id;
  releaseDetailModalUrls();

  let beforeUrl = "";
  let afterUrl = "";

  if (trade.before_image_id) {
    try {
      const beforeBlob = await dbGetImageBlob(trade.before_image_id);
      if (beforeBlob) {
        beforeUrl = URL.createObjectURL(beforeBlob);
        detailModalUrls.push(beforeUrl);
      }
    } catch {
      beforeUrl = "";
    }
  }

  if (trade.after_image_id) {
    try {
      const afterBlob = await dbGetImageBlob(trade.after_image_id);
      if (afterBlob) {
        afterUrl = URL.createObjectURL(afterBlob);
        detailModalUrls.push(afterUrl);
      }
    } catch {
      afterUrl = "";
    }
  }

  detailModalBodyEl.innerHTML = `
    <div class="detail-image-grid">
      ${beforeUrl ? `<img class="detail-image" src="${beforeUrl}" alt="Before screenshot" />` : '<div class="detail-image muted-empty">Before image missing</div>'}
      ${afterUrl ? `<img class="detail-image" src="${afterUrl}" alt="After screenshot" />` : '<div class="detail-image muted-empty">After image missing</div>'}
    </div>
    <div class="detail-meta-grid">
      <div><span class="detail-label">Pair</span><strong>${escapeHtml(trade.pair)} ${escapeHtml(trade.direction)}</strong></div>
      <div><span class="detail-label">Captured</span><strong>${escapeHtml(formatDateTime(trade.captured_at_utc))}</strong></div>
      <div><span class="detail-label">Status</span><strong>${escapeHtml(trade.status === "open" ? "Open" : "Closed")}</strong></div>
      <div><span class="detail-label">Strategy</span><strong>${escapeHtml(trade.strategy || "-")}</strong></div>
      <div><span class="detail-label">Sessions</span><strong>${escapeHtml((trade.sessions || []).join(" / ") || "-")}</strong></div>
      <div><span class="detail-label">Lot / PnL</span><strong>${escapeHtml(Number(trade.lot_size || 0).toFixed(3))} / ${escapeHtml(formatMoney(trade.pnl))}</strong></div>
      <div><span class="detail-label">Grade</span><strong>${escapeHtml(trade.setup_grade || "-")}</strong></div>
      <div><span class="detail-label">Adherence</span><strong>${escapeHtml(trade.model_adherence || "Bad")}</strong></div>
      <div><span class="detail-label">State</span><strong>${escapeHtml(trade.state_tag || "-")}</strong></div>
      <div><span class="detail-label">Outcome</span><strong>${escapeHtml(trade.outcome || "Open")}</strong></div>
    </div>
    <div class="detail-note-block">
      <span class="detail-label">Note</span>
      <p>${escapeHtml(trade.note || "No note")}</p>
    </div>
    <div class="detail-columns">
      <div>
        <span class="detail-label">Missing Core</span>
        ${renderDetailListHtml(trade.missing_core)}
      </div>
      <div>
        <span class="detail-label">Missing Backing</span>
        ${renderDetailListHtml(trade.missing_backing)}
      </div>
      <div>
        <span class="detail-label">Missing Quality</span>
        ${renderDetailListHtml(trade.missing_quality)}
      </div>
    </div>
  `;

  tradeDetailModalEl.style.display = "grid";
}

function closeDetailModal() {
  if (!tradeDetailModalEl) {
    return;
  }
  tradeDetailModalEl.style.display = "none";
  activeDetailTradeId = null;
  if (detailModalBodyEl) {
    detailModalBodyEl.innerHTML = "";
  }
  releaseDetailModalUrls();
}

async function hydrateEditImagePreviews(trade) {
  const imageTasks = [];
  if (trade.before_image_id) {
    imageTasks.push(dbGetImageBlob(trade.before_image_id));
  } else {
    imageTasks.push(Promise.resolve(null));
  }
  if (trade.after_image_id) {
    imageTasks.push(dbGetImageBlob(trade.after_image_id));
  } else {
    imageTasks.push(Promise.resolve(null));
  }

  const [beforeResult, afterResult] = await Promise.allSettled(imageTasks);
  let missingCount = 0;

  if (trade.before_image_id) {
    const beforeBlob = beforeResult.status === "fulfilled" ? beforeResult.value : null;
    if (beforeBlob) {
      editBeforeBinder.setPreviewBlob(beforeBlob);
    } else {
      missingCount += 1;
    }
  }

  if (trade.after_image_id) {
    const afterBlob = afterResult.status === "fulfilled" ? afterResult.value : null;
    if (afterBlob) {
      editAfterBinder.setPreviewBlob(afterBlob);
    } else {
      missingCount += 1;
    }
  }

  if (missingCount > 0) {
    incrementImageHydrationMisses(missingCount);
    showToast("Some saved screenshots could not be loaded. You can replace them.", "bad");
  }
}

async function openEditModal(id) {
  const trade = trades.find((item) => item.id === id);
  if (!trade) {
    return;
  }

  registerPair(trade.pair);
  editIdEl.value = trade.id;
  fillStrategyOptions(editStrategyEl, true, trade.strategy, { includeLegacy: true });
  editPairEl.value = trade.pair;
  editPairEl.dataset.prevPair = normalizePairCode(trade.pair);
  editDirectionEl.value = trade.direction;
  editLotSizeEl.value = Number(normalizeLotSizeValue(trade.lot_size)).toFixed(2);
  editStrategyEl.value = trade.strategy || "";
  editStrategyEl.dataset.prevStrategy = normalizeStrategyName(editStrategyEl.value);
  if (isSingleStrategyMode() && getAllowedStrategies().includes(editStrategyEl.value) && getStrategyOptionsForEdit(editStrategyEl.value).length === 1) {
    editStrategyEl.disabled = true;
  }
  editOutcomeEl.value = trade.outcome || "";
  editPnlEl.value = Number.isFinite(trade.pnl) ? String(trade.pnl) : "";
  editNoteEl.value = trade.note || "";

  editManualTimeEnabled = false;
  editManualTimeFieldsEl.style.display = "none";
  editManualTimeToggleEl.textContent = "Set Time Manually";
  if (editConfluenceDetailsEl) {
    editConfluenceDetailsEl.open = false;
  }

  const capturedDate = trade.captured_at_utc ? new Date(trade.captured_at_utc) : new Date();
  editDateEl.value = toDateInputValue(capturedDate);
  editTimeEl.value = toTimeInputValue(capturedDate);

  syncEditSessions(trade.sessions || []);
  renderEditConfluenceChecklist(trade.present_confluences || []);
  syncSmcEntryTypeVisibility(editStrategyEl.value, {
    wrapEl: editSmcEntryTypesWrapEl,
    listEl: editSmcEntryTypesEl,
    inputName: "editSmcEntryType",
    selectedValues: trade.smc_entry_types || [],
  });
  updateEditConfluenceSummary();

  editImages.beforeImageId = trade.before_image_id || null;
  editImages.afterImageId = trade.after_image_id || null;
  editImages.beforeNewBlob = null;
  editImages.afterNewBlob = null;
  editImages.beforeRemoved = false;
  editImages.afterRemoved = false;

  editBeforeBinder.clearSilent();
  editAfterBinder.clearSilent();
  await hydrateEditImagePreviews(trade);

  configureDeleteButton(deleteTradeBtn, trade, async () => {
    await deleteTrade(trade.id);
    closeEditModal();
  });

  editErrorEl.textContent = "";
  editModal.style.display = "grid";
}

function closeEditModal() {
  editModal.style.display = "none";
}

function syncEditSessions(values) {
  renderSessionChips(editSessionChipsEl, "editSession", getSessionOptionsForInput(values), values);
}

async function handleEditSubmit(event) {
  event.preventDefault();
  editErrorEl.textContent = "";

  const trade = trades.find((item) => item.id === editIdEl.value);
  if (!trade) {
    return;
  }

  const lot = Number(editLotSizeEl.value);
  if (!Number.isFinite(lot) || lot <= 0) {
    editErrorEl.textContent = "Lot size must be a positive number.";
    showToast("Invalid lot size", "bad");
    return;
  }

  const sessions = getCheckedValues(editForm, "editSession");
  if (!editPairEl.value || !editDirectionEl.value || !editStrategyEl.value || sessions.length === 0) {
    editErrorEl.textContent = "Pair, direction, strategy and sessions are required.";
    showToast("Missing required fields", "bad");
    return;
  }

  const pnl = parsePnl(editPnlEl.value);
  if (editPnlEl.value.trim() && !Number.isFinite(pnl)) {
    editErrorEl.textContent = "PnL must be numeric.";
    showToast("Invalid PnL", "bad");
    return;
  }

  const presentConfluences = getCheckedValues(editForm, "editConfluence");
  if (!presentConfluences.length) {
    editErrorEl.textContent = "Tick at least one setup checklist item.";
    showToast("Setup checklist required", "bad");
    return;
  }

  let capturedAtUtc = trade.captured_at_utc;
  if (editManualTimeEnabled) {
    if (!editDateEl.value || !editTimeEl.value) {
      editErrorEl.textContent = "Manual time requires date and time.";
      showToast("Manual date/time missing", "bad");
      return;
    }
    const parsed = combineDateTime(editDateEl.value, editTimeEl.value);
    if (Number.isNaN(parsed.getTime())) {
      editErrorEl.textContent = "Invalid manual date/time.";
      showToast("Invalid manual date/time", "bad");
      return;
    }
    capturedAtUtc = parsed.toISOString();
  }

  const beforeStillPresent = (editImages.beforeImageId && !editImages.beforeRemoved) || editImages.beforeNewBlob;
  const afterStillPresent = (editImages.afterImageId && !editImages.afterRemoved) || editImages.afterNewBlob;
  if (!beforeStillPresent && !afterStillPresent) {
    editErrorEl.textContent = "At least one screenshot is required.";
    showToast("At least one screenshot required", "bad");
    return;
  }

  await updateTrade(trade.id, {
    pair: editPairEl.value,
    direction: editDirectionEl.value,
    lot_size: normalizeLotSizeValue(lot),
    sessions,
    strategy: editStrategyEl.value,
    smc_entry_types: editStrategyEl.value === "SMC" ? getCheckedValues(editForm, "editSmcEntryType") : [],
    present_confluences: presentConfluences,
    outcome: editOutcomeEl.value,
    pnl: Number.isFinite(pnl) ? pnl : null,
    note: editNoteEl.value.trim(),
    captured_at_utc: capturedAtUtc,
    timezone_offset_min: new Date(capturedAtUtc).getTimezoneOffset(),
    imagePatch: {
      before: { remove: editImages.beforeRemoved, newBlob: editImages.beforeNewBlob },
      after: { remove: editImages.afterRemoved, newBlob: editImages.afterNewBlob },
    },
  });

  closeEditModal();
  renderAll();
  showToast("Trade updated", "ok");
}

async function updateTrade(id, patch) {
  const index = trades.findIndex((trade) => trade.id === id);
  if (index === -1) {
    return;
  }

  registerPair(patch.pair);
  const current = trades[index];
  const beforeResult = await applyImagePatch(current.before_image_id, patch.imagePatch?.before);
  const afterResult = await applyImagePatch(current.after_image_id, patch.imagePatch?.after);

  const inferred = inferConfluence(patch.strategy, patch.present_confluences || []);
  const status = patch.outcome ? "closed" : "open";

  let closedAtUtc = current.closed_at_utc || null;
  if (status === "closed" && !closedAtUtc) {
    closedAtUtc = new Date().toISOString();
  }
  if (status === "open") {
    closedAtUtc = null;
  }

  const nextTrade = normalizeTrade({
    ...current,
    pair: patch.pair,
    direction: patch.direction,
    lot_size: patch.lot_size,
    sessions: patch.sessions,
    strategy: patch.strategy,
    smc_entry_types: Array.isArray(patch.smc_entry_types) ? patch.smc_entry_types : current.smc_entry_types,
    present_confluences: patch.present_confluences,
    confluence_score: inferred.confluence_score,
    total_confluences: inferred.total_confluences,
    missing_confluences: inferred.missing_confluences,
    required_missing_count: inferred.required_missing_count,
    quality_missing_count: inferred.quality_missing_count,
    setup_integrity: inferred.setup_integrity,
    setup_grade: inferred.setup_grade,
    state_tag: inferred.state_tag,
    model_adherence: inferred.model_adherence,
    core_present_count: inferred.core_present_count,
    core_total_count: inferred.core_total_count,
    backing_present_count: inferred.backing_present_count,
    backing_total_count: inferred.backing_total_count,
    quality_present_count: inferred.quality_present_count,
    quality_total_count: inferred.quality_total_count,
    missing_core: inferred.missing_core,
    missing_backing: inferred.missing_backing,
    missing_quality: inferred.missing_quality,
    raw_score_present: inferred.raw_score_present,
    raw_score_total: inferred.raw_score_total,
    outcome: patch.outcome,
    pnl: patch.pnl,
    note: patch.note,
    captured_at_utc: patch.captured_at_utc,
    captured_at_local: formatDateTime(patch.captured_at_utc),
    timezone_offset_min: patch.timezone_offset_min,
    status,
    closed_at_utc: closedAtUtc,
    before_image_id: beforeResult,
    after_image_id: afterResult,
    edit_count: Number(current.edit_count || 0) + 1,
    updated_at: new Date().toISOString(),
  });

  trades[index] = nextTrade;
  await saveTradeRecord(nextTrade);
  
  invalidateAnalyticsCache();
}

async function applyImagePatch(currentImageId, imagePatch) {
  if (!imagePatch) {
    return currentImageId || null;
  }

  let imageId = currentImageId || null;

  if (imagePatch.remove && imageId) {
    await deleteImageRecord(imageId);
    imageId = null;
  }

  if (imagePatch.newBlob) {
    const newId = await saveImageRecord(imagePatch.newBlob);
    if (imageId) {
      await deleteImageRecord(imageId);
    }
    imageId = newId;
  }

  return imageId;
}

function configureDeleteButton(buttonEl, trade, onDelete) {
  buttonEl.classList.remove("delete-hold");
  buttonEl.style.removeProperty("--hold-progress");

  buttonEl.onpointerdown = null;
  buttonEl.onpointerup = null;
  buttonEl.onpointerleave = null;
  buttonEl.onclick = null;

  if (trade.status === "closed") {
    buttonEl.textContent = "Hold 3s to Delete";
    buttonEl.classList.add("delete-hold");

    let holdStart = 0;
    let raf = 0;
    let holdTimeout = 0;
    let confirmed = false;

    const resetHold = () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(holdTimeout);
      buttonEl.style.setProperty("--hold-progress", "0%");
      holdStart = 0;
    };

    const step = () => {
      if (!holdStart) {
        return;
      }
      const elapsed = performance.now() - holdStart;
      const progress = Math.min(100, (elapsed / 3000) * 100);
      buttonEl.style.setProperty("--hold-progress", `${progress}%`);
      if (progress < 100) {
        raf = window.requestAnimationFrame(step);
      }
    };

    buttonEl.onpointerdown = async (event) => {
      event.preventDefault();
      confirmed = window.confirm("Delete this closed trade? Hold the button for 3 seconds to confirm.");
      if (!confirmed) {
        resetHold();
        return;
      }

      holdStart = performance.now();
      raf = window.requestAnimationFrame(step);
      holdTimeout = window.setTimeout(async () => {
        resetHold();
        await onDelete();
      }, 3000);
    };

    buttonEl.onpointerup = resetHold;
    buttonEl.onpointerleave = resetHold;
    buttonEl.onclick = (event) => {
      event.preventDefault();
    };
    return;
  }

  buttonEl.textContent = "Delete";
  buttonEl.onclick = async () => {
    const confirmed = window.confirm("Delete this trade?");
    if (!confirmed) {
      return;
    }
    await onDelete();
  };
}

async function deleteTrade(id) {
  const index = trades.findIndex((trade) => trade.id === id);
  if (index === -1) {
    return;
  }

  const trade = trades[index];
  if (trade.before_image_id) {
    await deleteImageRecord(trade.before_image_id);
  }
  if (trade.after_image_id) {
    await deleteImageRecord(trade.after_image_id);
  }

  await deleteTradeRecord(id);
  trades.splice(index, 1);

  if (openInlineEditorId === id) {
    openInlineEditorId = null;
  }

  invalidateAnalyticsCache();
  showToast("Trade deleted", "ok");
  renderAll();
}

function badgeClassForOutcome(outcome) {
  switch (outcome) {
    case "Full Win":
      return "b-ok";
    case "Full Loss":
      return "b-bad";
    case "Partial + BE":
    case "Breakeven":
      return "b-info";
    default:
      return "b-warn";
  }
}

function integrityClass(integrity) {
  switch (integrity) {
    case "full_confluence":
      return "b-ok";
    case "one_soft_confluence_missing":
      return "b-info";
    case "multiple_soft_confluences_missing":
      return "b-warn";
    default:
      return "b-bad";
  }
}

function editIconSvg() {
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
}

async function loadImageUrls(rows) {
  const ids = [...new Set(rows.flatMap((row) => [row.before_image_id, row.after_image_id]).filter(Boolean))];
  const map = new Map();
  const missingImageIds = []; // Track which images failed to load

  if (!ids.length) {
    return { map, missingImageIds };
  }

  const blobs = await dbGetImages(ids);
  const idsToFetch = ids.filter((id) => !blobs.has(id));
  
  for (const imageId of idsToFetch) {
    const cloudBlob = await fetchImageFromCloud(imageId);
    if (!cloudBlob) {
      missingImageIds.push(imageId); // Track missing image
      incrementImageHydrationMisses(1);
      continue;
    }
    await putImageRecord(imageId, cloudBlob, { enqueue: false });
    blobs.set(imageId, cloudBlob);
  }

  blobs.forEach((blob, id) => {
    const url = URL.createObjectURL(blob);
    historyObjectUrls.push(url);
    map.set(id, url);
  });

  return { map, missingImageIds };
}

function releaseHistoryUrls() {
  historyObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  historyObjectUrls = [];
}

function renderTopInsightReel(rows) {
  if (!topInsightPanelEl || !appSettings.showInsightReel) {
    if (analyticsCarousel) {
      analyticsCarousel.destroy();
      analyticsCarousel = null;
    }
    if (topInsightPanelEl) {
      topInsightPanelEl.innerHTML = "";
    }
    return;
  }

  const analytics = computeAnalytics(rows);
  const slides = buildTopInsightSlides(analytics);
  topInsightPanelEl.innerHTML = renderInsightOrbitCarousel(slides, "topInsightCarousel");

  if (analyticsCarousel) {
    analyticsCarousel.destroy();
    analyticsCarousel = null;
  }
  initInsightOrbitCarousel(slides, "topInsightCarousel");
}

function renderAnalytics(rows) {
  const analytics = getAnalyticsCached(rows);
  const keys = TAB_INSIGHTS[activeAnalyticsTab] || [];

  const cards = keys
    .map((key) => {
      const value = formatMetricValue(key, analytics);
      return `
        <article class="stat">
          <div class="label">${escapeHtml(METRIC_LABELS[key] || key)}</div>
          <div class="value">${escapeHtml(value)}</div>
        </article>
      `;
    })
    .join("");

  analyticsPanelEl.innerHTML = `
    <div class="stats-grid">${cards}</div>
    <div id="analyticsVisuals" class="chart-grid"></div>
    <div id="analyticsTables" class="table-wrap"></div>
  `;

  destroyCharts();
  renderAnalyticsVisuals(activeAnalyticsTab, analytics);
}

function buildTopInsightSlides(analytics) {
  const deck = buildInsightDeck(analytics);

  const fSlide = {
    kicker: "Risk Discipline",
    title: "Grade F Damage Tracker",
    text: `Top missing required confluence: ${analytics.topMissingRequiredConfluenceFMonth || "None"}`,
    metrics: [
      ["F Trades (Month)", String(analytics.fTradesThisMonth)],
      ["Net PnL from F", formatMoney(analytics.fNetPnlThisMonth)],
      ["% Loss from F", `${analytics.fLossContributionPct.toFixed(1)}%`],
    ],
  };

  const pulseSlide = {
    kicker: "Performance Snapshot",
    title: "Month Pulse",
    text: `Net ${formatMoney(analytics.netPnlThisMonth)} from ${analytics.closedTradesThisMonth} closed trades this month.`,
    metrics: [
      ["Net (Month)", formatMoney(analytics.netPnlThisMonth)],
      ["Win Rate", `${analytics.winRate.toFixed(1)}%`],
      ["Expectancy", formatMoney(analytics.expectancy)],
    ],
  };

  const deckSlides = deck.map((item) => ({
    kicker: item.kicker || "Insight Spotlight",
    title: item.title,
    text: item.text,
    metrics: item.metrics || [],
  }));

  return [fSlide, pulseSlide, ...deckSlides];
}

function renderInsightOrbitCarousel(slides, carouselId = "topInsightCarousel") {
  if (!slides.length) {
    return '<div class="muted-empty">Log more trades to unlock insight carousel.</div>';
  }
  return `
    <section class="insight-carousel-shell">
      <div id="${escapeHtmlAttr(carouselId)}" class="insight-orbit" aria-label="Insight Reel Carousel">
        <div class="orbit-controls">
          <button class="orbit-nav orbit-prev" type="button" aria-label="Previous insight">←</button>
          <button class="orbit-nav orbit-next" type="button" aria-label="Next insight">→</button>
        </div>
        <div class="insight-orbit-stage">
          <div class="insight-orbit-track"></div>
        </div>
        <div class="orbit-footer">
          <div class="orbit-dots"></div>
        </div>
      </div>
    </section>
  `;
}

function initInsightOrbitCarousel(slides, carouselId = "topInsightCarousel") {
  const root = document.getElementById(carouselId);
  if (!root || !slides.length) {
    return;
  }
  analyticsCarousel = new InsightOrbitCarousel(root, slides, {
    autoplayMs: 8200,
    startIndex: 0,
    escapeHtml,
  });
}

function buildInsightDeck(analytics) {
  const monthWithoutF = analytics.netPnlThisMonth - analytics.fNetPnlThisMonth;
  const nyEdge = analytics.sessionExpectancy.NY - analytics.sessionExpectancy.London;
  const fullVsHardWinGap = analytics.fullConfluenceWinRate - analytics.hardInvalidationWinRate;
  const afterDelta = analytics.afterImageOutcomeDelta;
  const sizeDelta = analytics.highLotUnderperformance;
  const strategyRanked = sortStrategiesByTradeCount(analytics);
  const primaryStrategy = strategyRanked[0]?.[0] || "N/A";
  const secondaryStrategy = strategyRanked[1]?.[0] || "";
  const primaryNet = analytics.strategyNetPnl?.[primaryStrategy] || 0;
  const secondaryNet = analytics.strategyNetPnl?.[secondaryStrategy] || 0;
  const primaryWin = analytics.strategyWinRate?.[primaryStrategy] || 0;
  const secondaryWin = analytics.strategyWinRate?.[secondaryStrategy] || 0;
  const strategyWinDelta = primaryWin - secondaryWin;

  return [
    {
      kicker: "Risk Discipline",
      title: "Rule Break Cost",
      text: `You lost ${formatMoney(analytics.fNetPnlThisMonth)} on Grade F trades this month. Without F trades your month sits at ${formatMoney(monthWithoutF)}.`,
      metrics: [
        ["F Trades", String(analytics.fTradesThisMonth)],
        ["Net from F", formatMoney(analytics.fNetPnlThisMonth)],
        ["Without F", formatMoney(monthWithoutF)],
      ],
    },
    {
      kicker: "Risk Discipline",
      title: "F-Trade Volume Check",
      text: `${analytics.fTradesThisMonth} Grade F trades this month, average losing F trade: ${formatMoney(analytics.fAvgLossPerTradeThisMonth)}.`,
      metrics: [
        ["F Count", String(analytics.fTradesThisMonth)],
        ["Avg Loss/F", formatMoney(analytics.fAvgLossPerTradeThisMonth)],
        ["Loss Share", `${analytics.fLossContributionPct.toFixed(1)}%`],
      ],
    },
    {
      kicker: "Sessions/Timing",
      title: "Session Edge",
      text: `NY expectancy is ${formatMoney(analytics.sessionExpectancy.NY || 0)} vs London ${formatMoney(analytics.sessionExpectancy.London || 0)} (${formatMoney(nyEdge)} difference).`,
      metrics: [
        ["NY Exp", formatMoney(analytics.sessionExpectancy.NY || 0)],
        ["LDN Exp", formatMoney(analytics.sessionExpectancy.London || 0)],
        ["Delta", formatMoney(nyEdge)],
      ],
    },
    {
      kicker: "Confluence",
      title: "Confluence Quality",
      text: `Full confluence win rate is ${analytics.fullConfluenceWinRate.toFixed(1)}% vs hard invalidation ${analytics.hardInvalidationWinRate.toFixed(1)}%.`,
      metrics: [
        ["Full Win%", `${analytics.fullConfluenceWinRate.toFixed(1)}%`],
        ["Hard Win%", `${analytics.hardInvalidationWinRate.toFixed(1)}%`],
        ["Gap", `${fullVsHardWinGap.toFixed(1)} pts`],
      ],
    },
    {
      kicker: "Behavior",
      title: "Execution Proof",
      text: `Trades with after-screenshot average ${formatMoney(analytics.withAfterAvgPnl)} vs ${formatMoney(analytics.withoutAfterAvgPnl)} without (${formatMoney(afterDelta)} delta).`,
      metrics: [
        ["With After", formatMoney(analytics.withAfterAvgPnl)],
        ["Without", formatMoney(analytics.withoutAfterAvgPnl)],
        ["Delta", formatMoney(afterDelta)],
      ],
    },
    {
      kicker: "Market/Execution",
      title: "Size Discipline",
      text: `Lot sizes above 0.10 average ${formatMoney(analytics.highLotAvgPnl)} per trade vs baseline ${formatMoney(analytics.baselineLotAvgPnl)}.`,
      metrics: [
        [">0.10", formatMoney(analytics.highLotAvgPnl)],
        ["Baseline", formatMoney(analytics.baselineLotAvgPnl)],
        ["Delta", formatMoney(sizeDelta)],
      ],
    },
    {
      kicker: "Market/Execution",
      title: "Pair Leaderboard",
      text: `Best pair by net PnL is ${analytics.bestPairByPnl.key} at ${formatMoney(analytics.bestPairByPnl.value)}.`,
      metrics: [
        ["Best Pair", analytics.bestPairByPnl.key],
        ["Net", formatMoney(analytics.bestPairByPnl.value)],
        ["Win Rate", `${analytics.bestPairByWinRate.value.toFixed(1)}%`],
      ],
    },
    {
      kicker: "Market/Execution",
      title: "Pair Weak Spot",
      text: `Weakest pair by net PnL is ${analytics.worstPairByPnl.key} at ${formatMoney(analytics.worstPairByPnl.value)}.`,
      metrics: [
        ["Weak Pair", analytics.worstPairByPnl.key],
        ["Net", formatMoney(analytics.worstPairByPnl.value)],
        ["Best Exp", formatMoney(analytics.bestPairByExpectancy.value)],
      ],
    },
    {
      kicker: "Sessions/Timing",
      title: "Best Session",
      text: `Top session by expectancy is ${analytics.bestSessionByExpectancy.key} at ${formatMoney(analytics.bestSessionByExpectancy.value)} per closed trade.`,
      metrics: [
        ["Best", analytics.bestSessionByExpectancy.key],
        ["Expectancy", formatMoney(analytics.bestSessionByExpectancy.value)],
        ["Worst Exp", formatMoney(analytics.worstSessionByExpectancy.value)],
      ],
    },
    {
      kicker: "Risk",
      title: "Drawdown Pulse",
      text: `Current drawdown is ${formatMoney(-analytics.currentDrawdown)} against max drawdown ${formatMoney(-analytics.maxDrawdown)}.`,
      metrics: [
        ["Current DD", formatMoney(-analytics.currentDrawdown)],
        ["Max DD", formatMoney(-analytics.maxDrawdown)],
        ["Duration", `${analytics.longestDrawdownDuration} trades`],
      ],
    },
    {
      kicker: "Risk",
      title: "Open Trade Risk",
      text: `${analytics.openAging.over24h} open trades are older than 24h (avg age ${analytics.openAging.avgHours.toFixed(1)}h).`,
      metrics: [
        ["Open", String(analytics.openAging.count)],
        [">24h", String(analytics.openAging.over24h)],
        ["Avg Age", `${analytics.openAging.avgHours.toFixed(1)}h`],
      ],
    },
    {
      kicker: "Confluence",
      title: "Strategy Mix",
      text: secondaryStrategy
        ? `${primaryStrategy} net is ${formatMoney(primaryNet)} and ${secondaryStrategy} net is ${formatMoney(secondaryNet)}.`
        : `${primaryStrategy} net is ${formatMoney(primaryNet)} across ${analytics.strategyCounts?.[primaryStrategy] || 0} trades.`,
      metrics: [
        [`${primaryStrategy} Net`, formatMoney(primaryNet)],
        [secondaryStrategy ? `${secondaryStrategy} Net` : "Total Strategies", secondaryStrategy ? formatMoney(secondaryNet) : String(Object.keys(analytics.strategyCounts || {}).length)],
        ["Mix", formatStrategyMixLine(analytics, 2)],
      ],
    },
    {
      kicker: "Confluence",
      title: "Strategy Win Quality",
      text: secondaryStrategy
        ? `${primaryStrategy} win rate ${primaryWin.toFixed(1)}% vs ${secondaryStrategy} ${secondaryWin.toFixed(1)}%.`
        : `${primaryStrategy} win rate is ${primaryWin.toFixed(1)}%.`,
      metrics: [
        [`${primaryStrategy} Win%`, `${primaryWin.toFixed(1)}%`],
        [secondaryStrategy ? `${secondaryStrategy} Win%` : "Trades", secondaryStrategy ? `${secondaryWin.toFixed(1)}%` : String(analytics.strategyCounts?.[primaryStrategy] || 0)],
        ["Delta", secondaryStrategy ? `${strategyWinDelta.toFixed(1)} pts` : "N/A"],
      ],
    },
    {
      kicker: "Confluence",
      title: "Grade Spread",
      text: `Grade A average PnL is ${formatMoney(analytics.gradeVsPnl.A)} while Grade F averages ${formatMoney(analytics.gradeVsPnl.F)}.`,
      metrics: [
        ["Grade A Avg", formatMoney(analytics.gradeVsPnl.A)],
        ["Grade F Avg", formatMoney(analytics.gradeVsPnl.F)],
        ["Grade A Share", `${analytics.gradeAShare.toFixed(1)}%`],
      ],
    },
    {
      kicker: "Sessions/Timing",
      title: "Time-to-Close Pattern",
      text: `Most common close time bucket: ${analytics.dominantTimeToCloseBucket.key} (${analytics.dominantTimeToCloseBucket.value} trades).`,
      metrics: [
        ["Top Bucket", analytics.dominantTimeToCloseBucket.key],
        ["Trades", String(analytics.dominantTimeToCloseBucket.value)],
        ["Best Day", `${analytics.bestDayByPnl.name} ${formatMoney(analytics.bestDayByPnl.value)}`],
      ],
    },
    {
      kicker: "Sessions/Timing",
      title: "Best Hour",
      text: `Best expectancy hour is ${analytics.bestHourByExpectancy}:00 at ${formatMoney(analytics.bestHourExpectancyValue)}.`,
      metrics: [
        ["Best Hour", `${analytics.bestHourByExpectancy}:00`],
        ["Expectancy", formatMoney(analytics.bestHourExpectancyValue)],
        ["Busiest", `${analytics.busiestHour}:00`],
      ],
    },
    {
      kicker: "Sessions/Timing",
      title: "Peak Activity",
      text: `Busiest trading hour is ${analytics.busiestHour}:00 with ${analytics.busiestHourCount} trades.`,
      metrics: [
        ["Busiest Hour", `${analytics.busiestHour}:00`],
        ["Trades", String(analytics.busiestHourCount)],
        ["Session Share", `${analytics.bestSessionByShare.sharePct.toFixed(1)}% ${analytics.bestSessionByShare.key}`],
      ],
    },
    {
      kicker: "Performance",
      title: "Core Performance",
      text: `Profit factor is ${analytics.profitFactor == null ? "-" : analytics.profitFactor.toFixed(2)} with expectancy ${formatMoney(analytics.expectancy)} per closed trade.`,
      metrics: [
        ["Profit Factor", analytics.profitFactor == null ? "-" : analytics.profitFactor.toFixed(2)],
        ["Expectancy", formatMoney(analytics.expectancy)],
        ["Win Rate", `${analytics.winRate.toFixed(1)}%`],
      ],
    },
    {
      kicker: "Risk",
      title: "Momentum Pattern",
      text: `Max win streak is ${analytics.maxWinStreak} while max loss streak is ${analytics.maxLossStreak}.`,
      metrics: [
        ["Win Streak", String(analytics.maxWinStreak)],
        ["Loss Streak", String(analytics.maxLossStreak)],
        ["Recovery", analytics.recoveryFactor == null ? "-" : analytics.recoveryFactor.toFixed(2)],
      ],
    },
    {
      kicker: "Confluence",
      title: "Required Rule Leak",
      text: `Most missed required confluence this month: ${analytics.topMissingRequiredConfluenceFMonth || "None"} (${analytics.topMissingRequiredConfluenceFMonthCount} misses).`,
      metrics: [
        ["Top Missing", analytics.topMissingRequiredConfluenceFMonth || "None"],
        ["Count", String(analytics.topMissingRequiredConfluenceFMonthCount)],
        ["Hard Share", `${analytics.hardIntegrityShare.toFixed(1)}%`],
      ],
    },
  ];
}

function renderAnalyticsVisuals(tab, analytics) {
  const visualsEl = document.getElementById("analyticsVisuals");
  const tablesEl = document.getElementById("analyticsTables");
  if (!visualsEl || !tablesEl) {
    return;
  }

  const noTable = '<div class="muted-empty" style="padding:0.55rem;">No detail table for this tab.</div>';
  const closedSample = Number(analytics.closedTrades || 0);
  const sampleMessage = (minimum, focus) =>
    `Need ${minimum}+ closed trades for reliable ${focus}. Currently ${closedSample}.`;
  const placeholderCard = (title, message, span = false) => `
    <article class="chart-card${span ? " chart-span" : ""}">
      <h3>${escapeHtml(title)}</h3>
      <div class="muted-empty" style="padding:0.55rem;">${escapeHtml(message)}</div>
    </article>
  `;

  if (tab === "performance") {
    visualsEl.innerHTML = `
      <article class="chart-card">
        <h3>Outcome Distribution</h3>
        <div class="chart-wrap"><canvas id="chart-outcomes"></canvas></div>
      </article>
      <article class="chart-card">
        <h3>Cumulative Net PnL</h3>
        ${
          analytics.equityCurve.length
            ? '<div class="chart-wrap"><canvas id="chart-cumulative-pnl"></canvas></div>'
            : '<div class="muted-empty" style="padding:0.55rem;">No closed-trade PnL data yet.</div>'
        }
      </article>
    `;
    tablesEl.innerHTML = noTable;

    createChart("chart-outcomes", {
      type: "bar",
      data: {
        labels: Object.keys(analytics.outcomeCounts),
        datasets: [
          {
            data: Object.values(analytics.outcomeCounts),
            backgroundColor: ["#1f9d71", "#7b61ff", "#b18cff", "#d44e75", "#d6a03a"],
            borderWidth: 0,
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(),
    });

    if (analytics.equityCurve.length) {
      createChart("chart-cumulative-pnl", {
        type: "line",
        data: {
          labels: analytics.equityCurve.map((_, index) => String(index + 1)),
          datasets: [
            {
              label: "Net PnL",
              data: analytics.equityCurve,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              tension: 0.25,
              fill: true,
              pointRadius: 0,
            },
          ],
        },
        options: chartOptions(true),
      });
    }

    if (closedSample < 10) {
      tablesEl.innerHTML = `<div class="muted-empty" style="padding:0.55rem;">${escapeHtml(sampleMessage(10, "performance shape and expectancy"))}</div>`;
    }
    return;
  }

  if (tab === "risk") {
    if (closedSample < 20) {
      visualsEl.innerHTML = placeholderCard("Risk Curves", sampleMessage(20, "risk curves"), true);
      tablesEl.innerHTML = renderKeyValueTable(
        "Risk Snapshot",
        [
          ["Closed Trades", String(analytics.closedTrades)],
          ["Max Drawdown", formatMoney(-analytics.maxDrawdown)],
          ["Current Drawdown", formatMoney(-analytics.currentDrawdown)],
          ["Worst Trade", formatMoney(analytics.worstTrade)],
          ["Max Loss Streak", String(analytics.maxLossStreak)],
        ],
        ["Metric", "Value"]
      );
      return;
    }

    visualsEl.innerHTML = `
      <article class="chart-card chart-span">
        <h3>Equity and Drawdown Curves</h3>
        <div class="chart-wrap"><canvas id="chart-risk-curves"></canvas></div>
      </article>
    `;
    tablesEl.innerHTML = noTable;

    createChart("chart-risk-curves", {
      type: "line",
      data: {
        labels: analytics.equityCurve.map((_, index) => String(index + 1)),
        datasets: [
          {
            label: "Equity",
            data: analytics.equityCurve,
            borderColor: "#6247e8",
            backgroundColor: "rgba(98, 71, 232, 0.1)",
            tension: 0.25,
            fill: false,
            pointRadius: 0,
          },
          {
            label: "Drawdown",
            data: analytics.drawdownCurve,
            borderColor: "#d44e75",
            backgroundColor: "rgba(212, 78, 117, 0.08)",
            tension: 0.25,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: chartOptions(true),
    });
    return;
  }

  if (tab === "confluence") {
    visualsEl.innerHTML = `
      <article class="chart-card">
        <h3>Integrity Distribution</h3>
        <div class="chart-wrap"><canvas id="chart-integrity"></canvas></div>
      </article>
      <article class="chart-card">
        <h3>Grade Distribution</h3>
        <div class="chart-wrap"><canvas id="chart-grade"></canvas></div>
      </article>
      <article class="chart-card chart-span">
        <h3>Confluence Compliance Trend (Weekly Full %)</h3>
        <div class="chart-wrap"><canvas id="chart-compliance"></canvas></div>
      </article>
    `;

    const scoreRows = Object.entries(analytics.scoreCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([score, count]) => [score, String(count)]);
    const integrityPerfRows = INTEGRITY_ORDER.map((key) => [integrityLabel(key), formatMoney(analytics.integrityPerformance[key] || 0)]);
    const gradeVsPnlRows = ["A", "B", "C", "F"].map((grade) => [grade, formatMoney(analytics.gradeVsPnl[grade] || 0)]);

    tablesEl.innerHTML = `
      ${renderKeyValueTable("Confluence Score Distribution", scoreRows, ["Score", "Trades"])}
      ${renderKeyValueTable(
        "Missing Confluences (Overall)",
        Object.entries(analytics.missingOverall).map(([key, value]) => [key, String(value)]),
        ["Confluence", "Missing Count"]
      )}
      ${renderKeyValueTable(
        "Missing Required Confluences",
        Object.entries(analytics.missingRequired).map(([key, value]) => [key, String(value)]),
        ["Confluence", "Missing Count"]
      )}
      ${renderKeyValueTable(
        "Missing Quality Confluences",
        Object.entries(analytics.missingQuality).map(([key, value]) => [key, String(value)]),
        ["Confluence", "Missing Count"]
      )}
      ${renderKeyValueTable("Integrity Performance (Net PnL)", integrityPerfRows, ["Integrity", "Net PnL"])}
      ${renderKeyValueTable("Grade vs Avg PnL", gradeVsPnlRows, ["Grade", "Avg PnL"])}
    `;

    createChart("chart-integrity", {
      type: "bar",
      data: {
        labels: INTEGRITY_ORDER.map((key) => integrityLabel(key)),
        datasets: [
          {
            data: INTEGRITY_ORDER.map((key) => analytics.integrityCounts[key] || 0),
            backgroundColor: ["#1f9d71", "#7b61ff", "#d6a03a", "#d44e75"],
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(),
    });

    createChart("chart-grade", {
      type: "bar",
      data: {
        labels: ["A", "B", "C", "F"],
        datasets: [
          {
            data: ["A", "B", "C", "F"].map((grade) => analytics.gradeCounts[grade] || 0),
            backgroundColor: ["#1f9d71", "#7b61ff", "#d6a03a", "#d44e75"],
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(),
    });

    if (closedSample >= 20) {
      createChart("chart-compliance", {
        type: "line",
        data: {
          labels: analytics.complianceTrend.labels,
          datasets: [
            {
              label: "Full Confluence %",
              data: analytics.complianceTrend.values,
              borderColor: "#6247e8",
              backgroundColor: "rgba(98, 71, 232, 0.12)",
              tension: 0.3,
              fill: true,
              pointRadius: 3,
            },
          ],
        },
        options: chartOptions(),
      });
    } else {
      const complianceWrap = document.getElementById("chart-compliance")?.parentElement;
      if (complianceWrap) {
        complianceWrap.innerHTML = `<div class="muted-empty" style="padding:0.55rem;">${escapeHtml(sampleMessage(20, "confluence trend analysis"))}</div>`;
      }
    }
    return;
  }

  if (tab === "sessions") {
    const sessionOptions = Array.isArray(analytics.sessionOptions) && analytics.sessionOptions.length
      ? analytics.sessionOptions
      : [...DEFAULT_SESSION_OPTIONS];

    visualsEl.innerHTML = `
      <article class="chart-card">
        <h3>Session Net PnL</h3>
        <div class="chart-wrap"><canvas id="chart-session-pnl"></canvas></div>
      </article>
      <article class="chart-card">
        <h3>Hour-of-Day Frequency</h3>
        <div class="chart-wrap"><canvas id="chart-hour-freq"></canvas></div>
      </article>
      <article class="chart-card chart-span">
        <h3>Day-of-Week Performance</h3>
        <div class="chart-wrap"><canvas id="chart-day-performance"></canvas></div>
      </article>
    `;

    const sessionSummaryRows = sessionOptions.map((session) => [
      session,
      `${analytics.totalTrades ? ((analytics.sessionMix[session] / analytics.totalTrades) * 100).toFixed(1) : "0.0"}%`,
      formatMoney(analytics.sessionNetPnl[session] || 0),
      `${(analytics.sessionWinRate[session] || 0).toFixed(1)}%`,
      formatMoney(analytics.sessionExpectancy[session] || 0),
    ]);

    const hourExpectancyRows = analytics.hourExpectancy
      .map((value, hour) => [String(hour).padStart(2, "0"), value])
      .filter(([, value]) => Number.isFinite(value) && value !== 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([hour, value]) => [`${hour}:00`, formatMoney(value)]);

    tablesEl.innerHTML = `
      ${renderCustomTable("Session Summary", ["Session", "Share", "Net PnL", "Win Rate", "Expectancy"], sessionSummaryRows)}
      ${renderKeyValueTable("Hour-of-Day Expectancy (Top)", hourExpectancyRows, ["Hour", "Expectancy"])}
      ${renderMatrixTable("Session x Strategy (Net PnL)", analytics.sessionByStrategyMatrix.rows, analytics.sessionByStrategyMatrix.cols, analytics.sessionByStrategyMatrix.values, true)}
      ${renderMatrixTable("Session x Pair (Net PnL)", analytics.sessionByPairMatrix.rows, analytics.sessionByPairMatrix.cols, analytics.sessionByPairMatrix.values, true)}
      ${renderKeyValueTable("Time-to-Close Buckets", Object.entries(analytics.timeToCloseBuckets), ["Bucket", "Trades"])}
    `;

    createChart("chart-session-pnl", {
      type: "bar",
      data: {
        labels: sessionOptions,
        datasets: [
          {
            data: sessionOptions.map((session) => analytics.sessionNetPnl[session] || 0),
            backgroundColor: sessionOptions.map((_, index) => `hsl(${(index * 59 + 248) % 360} 72% 56%)`),
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(true),
    });

    createChart("chart-hour-freq", {
      type: "line",
      data: {
        labels: analytics.hourFrequency.map((_, hour) => String(hour).padStart(2, "0")),
        datasets: [
          {
            label: "Trades",
            data: analytics.hourFrequency,
            borderColor: "#6247e8",
            backgroundColor: "rgba(98, 71, 232, 0.08)",
            tension: 0.25,
            fill: true,
            pointRadius: 0,
          },
        ],
      },
      options: chartOptions(),
    });

    createChart("chart-day-performance", {
      type: "bar",
      data: {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        datasets: [
          {
            data: analytics.dayPerformance,
            backgroundColor: analytics.dayPerformance.map((value) => (value >= 0 ? "#1f9d71" : "#d44e75")),
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(true),
    });
    return;
  }

  if (tab === "market") {
    visualsEl.innerHTML = `
      <article class="chart-card">
        <h3>Pair Net PnL</h3>
        <div class="chart-wrap"><canvas id="chart-pair-pnl"></canvas></div>
      </article>
      <article class="chart-card">
        <h3>Direction Split PnL</h3>
        <div class="chart-wrap"><canvas id="chart-direction"></canvas></div>
      </article>
      <article class="chart-card chart-span">
        <h3>Lot Bucket Expectancy</h3>
        <div class="chart-wrap"><canvas id="chart-lot-buckets"></canvas></div>
      </article>
    `;

    const directionRows = ["Buy", "Sell"].map((direction) => [
      direction,
      formatMoney(analytics.directionPnl[direction] || 0),
      `${(analytics.directionWinRate[direction] || 0).toFixed(1)}%`,
    ]);

    const lotBucketRows = [...analytics.lotBucketExpectancy]
      .sort((a, b) => a.bucket.localeCompare(b.bucket))
      .map((entry) => [entry.bucket, formatMoney(entry.expectancy)]);

    tablesEl.innerHTML = `
      ${renderKeyValueTable(
        "Pair Win Rate Ranking",
        analytics.pairWinRateRanking.map((item) => [item.pair, `${item.winRate.toFixed(1)}%`]),
        ["Pair", "Win Rate"]
      )}
      ${renderKeyValueTable(
        "Pair Expectancy Ranking",
        analytics.pairExpectancyRanking.map((item) => [item.pair, formatMoney(item.expectancy)]),
        ["Pair", "Expectancy"]
      )}
      ${renderKeyValueTable(
        "Open Trade Aging",
        [
          ["Open Trades", String(analytics.openAging.count)],
          ["Average Age", `${analytics.openAging.avgHours.toFixed(1)}h`],
          ["Max Age", `${analytics.openAging.maxHours.toFixed(1)}h`],
          [">24h", String(analytics.openAging.over24h)],
        ],
        ["Metric", "Value"]
      )}
      ${renderCustomTable("Direction Split", ["Direction", "Net PnL", "Win Rate"], directionRows)}
      ${renderKeyValueTable("Lot Bucket Expectancy", lotBucketRows, ["Lot Bucket", "Expectancy"])}
    `;

    createChart("chart-pair-pnl", {
      type: "bar",
      data: {
        labels: analytics.pairPnlRanking.map((entry) => entry.pair),
        datasets: [
          {
            data: analytics.pairPnlRanking.map((entry) => entry.pnl),
            backgroundColor: analytics.pairPnlRanking.map((entry) => (entry.pnl >= 0 ? "#1f9d71" : "#d44e75")),
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(true),
    });

    createChart("chart-direction", {
      type: "bar",
      data: {
        labels: ["Buy", "Sell"],
        datasets: [
          {
            data: [analytics.directionPnl.Buy || 0, analytics.directionPnl.Sell || 0],
            backgroundColor: ["#6247e8", "#b18cff"],
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(true),
    });

    createChart("chart-lot-buckets", {
      type: "bar",
      data: {
        labels: analytics.lotBucketExpectancy.map((entry) => entry.bucket),
        datasets: [
          {
            label: "Expectancy",
            data: analytics.lotBucketExpectancy.map((entry) => entry.expectancy),
            backgroundColor: analytics.lotBucketExpectancy.map((entry) => (entry.expectancy >= 0 ? "#1f9d71" : "#d44e75")),
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(true),
    });
    return;
  }

  visualsEl.innerHTML = `
    <article class="chart-card">
      <h3>Image Presence</h3>
      <div class="chart-wrap"><canvas id="chart-images"></canvas></div>
    </article>
    <article class="chart-card">
      <h3>Note Usage</h3>
      <div class="chart-wrap"><canvas id="chart-notes"></canvas></div>
    </article>
    <article class="chart-card chart-span">
      <h3>Edit Count Distribution</h3>
      <div class="chart-wrap"><canvas id="chart-edits"></canvas></div>
    </article>
  `;

  tablesEl.innerHTML = renderKeyValueTable(
    "Behavior Summary",
    [
      ["Image Completeness", `${analytics.imageCompletenessRate.toFixed(1)}%`],
      ["Before Presence", `${analytics.beforePresenceRate.toFixed(1)}%`],
      ["After Presence", `${analytics.afterPresenceRate.toFixed(1)}%`],
      ["Image Hydration Misses", String(analytics.imageHydrationMisses)],
      ["Notes Used", `${analytics.noteUsageRate.toFixed(1)}%`],
      ["Median Note Length", `${analytics.medianNoteLength.toFixed(0)} chars`],
      ["Avg Edit Count", analytics.avgEditCount.toFixed(2)],
      ["Max Edit Count", String(analytics.maxEditCount)],
    ],
    ["Metric", "Value"]
  );

  createChart("chart-images", {
    type: "bar",
    data: {
      labels: ["Both", "Before only", "After only", "None"],
      datasets: [
        {
          data: analytics.imageBuckets,
          backgroundColor: ["#1f9d71", "#6247e8", "#b18cff", "#d44e75"],
          borderWidth: 0,
          borderRadius: 8,
        },
      ],
    },
    options: chartOptions(),
  });

  createChart("chart-notes", {
    type: "bar",
    data: {
      labels: ["With Note", "Without Note"],
      datasets: [
        {
          data: [analytics.notesUsedCount, analytics.totalTrades - analytics.notesUsedCount],
          backgroundColor: ["#6247e8", "#d6a03a"],
          borderRadius: 8,
        },
      ],
    },
    options: chartOptions(),
  });

  createChart("chart-edits", {
    type: "bar",
    data: {
      labels: Object.keys(analytics.editCountDistribution),
      datasets: [
        {
          data: Object.values(analytics.editCountDistribution),
          backgroundColor: "#7b61ff",
          borderRadius: 8,
        },
      ],
    },
    options: chartOptions(),
  });
}

function destroyCharts() {
  chartRegistry.forEach((chart) => chart.destroy());
  chartRegistry.clear();
}

function renderKeyValueTable(title, rows, headers = ["Key", "Value"]) {
  const body = rows
    .map(([key, value]) => `<tr><td>${escapeHtml(String(key))}</td><td>${escapeHtml(String(value))}</td></tr>`)
    .join("");

  return `
    <div class="table-wrap" style="margin-bottom:0.45rem;">
      <table class="insight-table">
        <thead>
          <tr><th colspan="2">${escapeHtml(title)}</th></tr>
          <tr><th>${escapeHtml(headers[0])}</th><th>${escapeHtml(headers[1])}</th></tr>
        </thead>
        <tbody>${body || '<tr><td colspan="2" class="muted-empty">No data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

function renderMatrixTable(title, rows, cols, matrix, money = false) {
  const head = cols.map((col) => `<th>${escapeHtml(col)}</th>`).join("");
  const body = rows
    .map((rowLabel, rowIndex) => {
      const cells = cols
        .map((_, colIndex) => {
          const value = matrix[rowIndex]?.[colIndex] ?? 0;
          return `<td>${escapeHtml(money ? formatMoney(value) : String(value))}</td>`;
        })
        .join("");
      return `<tr><th>${escapeHtml(rowLabel)}</th>${cells}</tr>`;
    })
    .join("");

  return `
    <div class="table-wrap" style="margin-bottom:0.45rem;">
      <table class="insight-table">
        <thead>
          <tr><th colspan="${cols.length + 1}">${escapeHtml(title)}</th></tr>
          <tr><th>Row</th>${head}</tr>
        </thead>
        <tbody>${body || '<tr><td colspan="99" class="muted-empty">No data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

function renderCustomTable(title, headers, rows) {
  const head = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`)
    .join("");

  return `
    <div class="table-wrap" style="margin-bottom:0.45rem;">
      <table class="insight-table">
        <thead>
          <tr><th colspan="${headers.length}">${escapeHtml(title)}</th></tr>
          <tr>${head}</tr>
        </thead>
        <tbody>${body || `<tr><td colspan="${headers.length}" class="muted-empty">No data</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function formatMetricValue(key, analytics) {
  switch (key) {
    case "total_trades":
      return String(analytics.totalTrades);
    case "closed_trades":
      return String(analytics.closedTrades);
    case "open_trades":
      return String(analytics.openTrades);
    case "net_pnl":
      return formatMoney(analytics.netPnl);
    case "gross_profit":
      return formatMoney(analytics.grossProfit);
    case "gross_loss":
      return formatMoney(-analytics.grossLossAbs);
    case "win_rate":
      return `${analytics.winRate.toFixed(1)}%`;
    case "loss_rate":
      return `${analytics.lossRate.toFixed(1)}%`;
    case "breakeven_rate":
      return `${analytics.breakevenRate.toFixed(1)}%`;
    case "profit_factor":
      return analytics.profitFactor == null ? "-" : analytics.profitFactor.toFixed(2);
    case "expectancy_per_trade":
      return formatMoney(analytics.expectancy);
    case "average_win":
      return formatMoney(analytics.avgWin);
    case "average_loss":
      return formatMoney(analytics.avgLoss);
    case "win_loss_size_ratio":
      return analytics.winLossRatio == null ? "-" : analytics.winLossRatio.toFixed(2);
    case "outcome_distribution":
      return "Chart below";
    case "equity_curve":
      return `${analytics.equityCurve.length} points`;
    case "drawdown_curve":
      return `${analytics.drawdownCurve.length} points`;
    case "max_drawdown":
      return formatMoney(-analytics.maxDrawdown);
    case "current_drawdown":
      return formatMoney(-analytics.currentDrawdown);
    case "longest_drawdown_duration":
      return `${analytics.longestDrawdownDuration} trades`;
    case "best_trade":
      return formatMoney(analytics.bestTrade);
    case "worst_trade":
      return formatMoney(analytics.worstTrade);
    case "max_win_streak":
      return String(analytics.maxWinStreak);
    case "max_loss_streak":
      return String(analytics.maxLossStreak);
    case "recovery_factor":
      return analytics.recoveryFactor == null ? "-" : analytics.recoveryFactor.toFixed(2);
    case "strategy_mix":
      return formatStrategyMixLine(analytics);
    case "strategy_net_pnl":
      return formatStrategyNetLine(analytics, formatMoney);
    case "strategy_win_rate":
      return formatStrategyWinLine(analytics);
    case "confluence_score_distribution":
      return analytics.topConfluenceScore.key ? `${analytics.topConfluenceScore.key} (${analytics.topConfluenceScore.value} trades)` : "No score data";
    case "setup_integrity_distribution":
      return `Full ${analytics.fullIntegrityShare.toFixed(1)}% | Hard ${analytics.hardIntegrityShare.toFixed(1)}%`;
    case "setup_grade_distribution":
      return `A ${analytics.gradeAShare.toFixed(1)}% | F ${analytics.gradeFShare.toFixed(1)}%`;
    case "missing_confluence_frequency_overall":
      return analytics.topMissingOverall.key ? `${analytics.topMissingOverall.key} (${analytics.topMissingOverall.value})` : "No missing confluence";
    case "missing_required_frequency":
      return analytics.topMissingRequired.key ? `${analytics.topMissingRequired.key} (${analytics.topMissingRequired.value})` : "No required misses";
    case "missing_quality_frequency":
      return analytics.topMissingQuality.key ? `${analytics.topMissingQuality.key} (${analytics.topMissingQuality.value})` : "No quality misses";
    case "full_soft_hard_performance":
      return `Full ${formatMoney(analytics.integrityPerformance.full_confluence || 0)} | Hard ${formatMoney(analytics.integrityPerformance.hard_invalidation_present || 0)}`;
    case "confluence_compliance_trend":
      return analytics.latestCompliancePct == null ? "No weekly trend" : `Latest week ${analytics.latestCompliancePct.toFixed(1)}% full`;
    case "grade_vs_pnl_distribution":
      return `A ${formatMoney(analytics.gradeVsPnl.A)} | F ${formatMoney(analytics.gradeVsPnl.F)}`;
    case "session_mix_share":
      return `${analytics.bestSessionByShare.key} ${analytics.bestSessionByShare.sharePct.toFixed(1)}% share`;
    case "session_net_pnl":
      return `${analytics.bestSessionByNet.key} ${formatMoney(analytics.bestSessionByNet.value)}`;
    case "session_win_rate":
      return `${analytics.bestSessionByWinRate.key} ${analytics.bestSessionByWinRate.value.toFixed(1)}%`;
    case "session_expectancy":
      return `${analytics.bestSessionByExpectancy.key} ${formatMoney(analytics.bestSessionByExpectancy.value)}`;
    case "session_x_strategy_heatmap":
      return `${analytics.hottestSessionStrategyCell.row} x ${analytics.hottestSessionStrategyCell.col}: ${formatMoney(analytics.hottestSessionStrategyCell.value)}`;
    case "session_x_pair_heatmap":
      return `${analytics.hottestSessionPairCell.row} x ${analytics.hottestSessionPairCell.col}: ${formatMoney(analytics.hottestSessionPairCell.value)}`;
    case "hour_trade_frequency":
      return `${analytics.busiestHour}:00 (${analytics.busiestHourCount} trades)`;
    case "hour_expectancy":
      return `${analytics.bestHourByExpectancy}:00 (${formatMoney(analytics.bestHourExpectancyValue)})`;
    case "day_of_week_performance":
      return `${analytics.bestDayByPnl.name} ${formatMoney(analytics.bestDayByPnl.value)}`;
    case "time_to_close_distribution":
      return `${analytics.dominantTimeToCloseBucket.key} (${analytics.dominantTimeToCloseBucket.value} trades)`;
    case "pair_pnl_ranking":
      return `${analytics.bestPairByPnl.key} ${formatMoney(analytics.bestPairByPnl.value)}`;
    case "pair_win_rate_ranking":
      return `${analytics.bestPairByWinRate.key} ${analytics.bestPairByWinRate.value.toFixed(1)}%`;
    case "pair_expectancy_ranking":
      return `${analytics.bestPairByExpectancy.key} ${formatMoney(analytics.bestPairByExpectancy.value)}`;
    case "direction_split_pnl":
      return `Buy ${formatMoney(analytics.directionPnl.Buy)} | Sell ${formatMoney(analytics.directionPnl.Sell)}`;
    case "direction_split_win_rate":
      return `Buy ${analytics.directionWinRate.Buy.toFixed(1)}% | Sell ${analytics.directionWinRate.Sell.toFixed(1)}%`;
    case "lot_size_vs_pnl_scatter":
      return `Corr ${analytics.lotPnlCorrelation == null ? "-" : analytics.lotPnlCorrelation.toFixed(2)}`;
    case "lot_size_bucket_expectancy":
      return `${analytics.bestLotBucket.key} ${formatMoney(analytics.bestLotBucket.value)}`;
    case "open_trade_aging":
      return `avg ${analytics.openAging.avgHours.toFixed(1)}h | max ${analytics.openAging.maxHours.toFixed(1)}h`;
    case "image_completeness_rate":
      return `${analytics.imageCompletenessRate.toFixed(1)}%`;
    case "before_presence_rate":
      return `${analytics.beforePresenceRate.toFixed(1)}%`;
    case "after_presence_rate":
      return `${analytics.afterPresenceRate.toFixed(1)}%`;
    case "image_hydration_misses":
      return String(analytics.imageHydrationMisses);
    case "note_usage_and_median_length":
      return `${analytics.noteUsageRate.toFixed(1)}% used | median ${analytics.medianNoteLength.toFixed(0)} chars`;
    case "edit_frequency_per_trade":
      return `avg ${analytics.avgEditCount.toFixed(2)} | max ${analytics.maxEditCount}`;
    default:
      return "-";
  }
}

function computeAnalytics(rows) {
  const totalTrades = rows.length;
  const closedRows = rows.filter((trade) => trade.status === "closed");
  const openRows = rows.filter((trade) => trade.status === "open");
  const pairUniverse = getPairUniverse(rows);

  const pnlRows = closedRows.filter((trade) => Number.isFinite(trade.pnl));
  const netPnl = sum(pnlRows.map((trade) => trade.pnl));
  const grossProfit = sum(pnlRows.filter((trade) => trade.pnl > 0).map((trade) => trade.pnl));
  const grossLossAbs = Math.abs(sum(pnlRows.filter((trade) => trade.pnl < 0).map((trade) => trade.pnl)));

  const wins = closedRows.filter((trade) => trade.outcome === "Full Win").length;
  const losses = closedRows.filter((trade) => trade.outcome === "Full Loss").length;
  const breakevens = closedRows.filter((trade) => trade.outcome === "Breakeven" || trade.outcome === "Partial + BE").length;

  const closedCount = closedRows.length;
  const winRate = closedCount ? (wins / closedCount) * 100 : 0;
  const lossRate = closedCount ? (losses / closedCount) * 100 : 0;
  const breakevenRate = closedCount ? (breakevens / closedCount) * 100 : 0;
  const profitFactor = grossLossAbs > 0 ? grossProfit / grossLossAbs : null;
  const expectancy = closedCount ? netPnl / closedCount : 0;

  const winPnl = pnlRows.filter((trade) => trade.pnl > 0).map((trade) => trade.pnl);
  const lossPnl = pnlRows.filter((trade) => trade.pnl < 0).map((trade) => trade.pnl);
  const avgWin = winPnl.length ? sum(winPnl) / winPnl.length : 0;
  const avgLoss = lossPnl.length ? sum(lossPnl) / lossPnl.length : 0;
  const winLossRatio = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : null;

  const outcomeCounts = {
    "Full Win": 0,
    "Partial + BE": 0,
    Breakeven: 0,
    "Full Loss": 0,
    Open: 0,
  };
  rows.forEach((trade) => {
    const key = trade.outcome || "Open";
    if (outcomeCounts[key] == null) {
      outcomeCounts[key] = 0;
    }
    outcomeCounts[key] += 1;
  });

  const orderedPnlRows = [...pnlRows].sort((a, b) => toMillis(a.captured_at_utc) - toMillis(b.captured_at_utc));
  const equityCurve = [];
  const drawdownCurve = [];
  let runningEquity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  let longestDrawdownDuration = 0;
  let currentDrawdownSpan = 0;

  orderedPnlRows.forEach((trade) => {
    runningEquity += trade.pnl;
    equityCurve.push(runningEquity);

    peak = Math.max(peak, runningEquity);
    const drawdown = peak - runningEquity;
    drawdownCurve.push(drawdown);

    maxDrawdown = Math.max(maxDrawdown, drawdown);

    if (drawdown > 0) {
      currentDrawdownSpan += 1;
      longestDrawdownDuration = Math.max(longestDrawdownDuration, currentDrawdownSpan);
    } else {
      currentDrawdownSpan = 0;
    }
  });

  const currentDrawdown = drawdownCurve.length ? drawdownCurve[drawdownCurve.length - 1] : 0;
  const bestTrade = pnlRows.length ? Math.max(...pnlRows.map((trade) => trade.pnl)) : 0;
  const worstTrade = pnlRows.length ? Math.min(...pnlRows.map((trade) => trade.pnl)) : 0;
  const { maxWinStreak, maxLossStreak } = streaksFromRows(orderedPnlRows);
  const recoveryFactor = maxDrawdown > 0 ? netPnl / maxDrawdown : null;
  const strategyUniverse = getStrategyUniverse({ rows, includeTradeStrategies: true });
  const strategyCounts = Object.fromEntries(strategyUniverse.map((strategy) => [strategy, 0]));
  const strategyNetPnl = Object.fromEntries(strategyUniverse.map((strategy) => [strategy, 0]));
  const strategyClosed = Object.fromEntries(strategyUniverse.map((strategy) => [strategy, 0]));
  const strategyWins = Object.fromEntries(strategyUniverse.map((strategy) => [strategy, 0]));

  const scoreCounts = {};
  const integrityCounts = {
    full_confluence: 0,
    one_soft_confluence_missing: 0,
    multiple_soft_confluences_missing: 0,
    hard_invalidation_present: 0,
  };
  const gradeCounts = { A: 0, B: 0, C: 0, F: 0 };

  const missingOverall = {};
  const missingRequired = {};
  const missingQuality = {};
  const integrityPerformance = {
    full_confluence: 0,
    one_soft_confluence_missing: 0,
    multiple_soft_confluences_missing: 0,
    hard_invalidation_present: 0,
  };

  const complianceByWeek = {};
  const gradePnl = { A: [], B: [], C: [], F: [] };

  rows.forEach((trade) => {
    const strategy = normalizeStrategyName(trade.strategy);

    if (strategy) {
      if (!(strategy in strategyCounts)) {
        strategyCounts[strategy] = 0;
        strategyNetPnl[strategy] = 0;
        strategyClosed[strategy] = 0;
        strategyWins[strategy] = 0;
      }
      strategyCounts[strategy] += 1;
      if (Number.isFinite(trade.pnl)) {
        strategyNetPnl[strategy] += trade.pnl;
      }
      if (trade.status === "closed") {
        strategyClosed[strategy] += 1;
      }
      if (trade.outcome === "Full Win") {
        strategyWins[strategy] += 1;
      }

      scoreCounts[trade.confluence_score] = (scoreCounts[trade.confluence_score] || 0) + 1;
      integrityCounts[trade.setup_integrity] = (integrityCounts[trade.setup_integrity] || 0) + 1;
      gradeCounts[trade.setup_grade] = (gradeCounts[trade.setup_grade] || 0) + 1;

      (trade.missing_confluences || []).forEach((item) => {
        missingOverall[item] = (missingOverall[item] || 0) + 1;
      });

      const rules = getConfluenceRules(strategy);
      (trade.missing_confluences || []).forEach((item) => {
        if (rules.required.includes(item)) {
          missingRequired[item] = (missingRequired[item] || 0) + 1;
        }
        if (rules.quality.includes(item)) {
          missingQuality[item] = (missingQuality[item] || 0) + 1;
        }
      });

      if (Number.isFinite(trade.pnl)) {
        integrityPerformance[trade.setup_integrity] = (integrityPerformance[trade.setup_integrity] || 0) + trade.pnl;
        if (!gradePnl[trade.setup_grade]) {
          gradePnl[trade.setup_grade] = [];
        }
        gradePnl[trade.setup_grade].push(trade.pnl);
      }

      const week = getWeekKey(trade.captured_at_utc);
      complianceByWeek[week] = complianceByWeek[week] || { full: 0, total: 0 };
      complianceByWeek[week].total += 1;
      if (trade.setup_integrity === "full_confluence") {
        complianceByWeek[week].full += 1;
      }
    }
  });

  const strategyWinRate = {};
  Object.keys(strategyCounts).forEach((strategy) => {
    strategyWinRate[strategy] = strategyClosed[strategy] ? (strategyWins[strategy] / strategyClosed[strategy]) * 100 : 0;
  });

  const complianceTrendEntries = Object.entries(complianceByWeek).sort(([a], [b]) => a.localeCompare(b));
  const complianceTrend = {
    labels: complianceTrendEntries.map(([week]) => week),
    values: complianceTrendEntries.map(([, bucket]) => (bucket.total ? (bucket.full / bucket.total) * 100 : 0)),
  };

  const gradeVsPnl = {
    A: avg(gradePnl.A),
    B: avg(gradePnl.B),
    C: avg(gradePnl.C),
    F: avg(gradePnl.F),
  };

  const sessionOptions = getSessionUniverse({ rows });
  const sessionMix = Object.fromEntries(sessionOptions.map((session) => [session, 0]));
  const sessionNetPnl = Object.fromEntries(sessionOptions.map((session) => [session, 0]));
  const sessionClosed = Object.fromEntries(sessionOptions.map((session) => [session, 0]));
  const sessionWins = Object.fromEntries(sessionOptions.map((session) => [session, 0]));

  const sessionByStrategyMatrix = {
    rows: sessionOptions,
    cols: [...Object.keys(strategyCounts)],
    values: sessionOptions.map(() => Object.keys(strategyCounts).map(() => 0)),
  };

  const sessionByPairMatrix = {
    rows: sessionOptions,
    cols: pairUniverse,
    values: sessionOptions.map(() => pairUniverse.map(() => 0)),
  };

  const hourFrequency = Array.from({ length: 24 }, () => 0);
  const hourPnl = Array.from({ length: 24 }, () => 0);
  const hourClosed = Array.from({ length: 24 }, () => 0);

  const dayPerformance = Array.from({ length: 7 }, () => 0);

  const timeToCloseBuckets = {
    "<1h": 0,
    "1-4h": 0,
    "4-24h": 0,
    "1-3d": 0,
    ">3d": 0,
  };

  rows.forEach((trade) => {
    const captured = new Date(trade.captured_at_utc);
    const hour = captured.getHours();
    hourFrequency[hour] += 1;

    if (Number.isFinite(trade.pnl)) {
      hourPnl[hour] += trade.pnl;
    }
    if (trade.status === "closed") {
      hourClosed[hour] += 1;
    }

    dayPerformance[captured.getDay()] += Number.isFinite(trade.pnl) ? trade.pnl : 0;

    sessionOptions.forEach((session, sessionIndex) => {
      if (!(trade.sessions || []).includes(session)) {
        return;
      }

      sessionMix[session] += 1;
      if (Number.isFinite(trade.pnl)) {
        sessionNetPnl[session] += trade.pnl;
      }
      if (trade.status === "closed") {
        sessionClosed[session] += 1;
      }
      if (trade.outcome === "Full Win") {
        sessionWins[session] += 1;
      }

      const tradeStrategy = normalizeStrategyName(trade.strategy);
      sessionByStrategyMatrix.cols.forEach((strategy, strategyIndex) => {
        if (tradeStrategy === strategy) {
          sessionByStrategyMatrix.values[sessionIndex][strategyIndex] += Number.isFinite(trade.pnl) ? trade.pnl : 0;
        }
      });

      pairUniverse.forEach((pair, pairIndex) => {
        if (trade.pair === pair) {
          sessionByPairMatrix.values[sessionIndex][pairIndex] += Number.isFinite(trade.pnl) ? trade.pnl : 0;
        }
      });
    });

    if (trade.status === "closed" && trade.closed_at_utc && trade.captured_at_utc) {
      const hours = Math.max(0, (toMillis(trade.closed_at_utc) - toMillis(trade.captured_at_utc)) / 3600000);
      if (hours < 1) {
        timeToCloseBuckets["<1h"] += 1;
      } else if (hours < 4) {
        timeToCloseBuckets["1-4h"] += 1;
      } else if (hours < 24) {
        timeToCloseBuckets["4-24h"] += 1;
      } else if (hours < 72) {
        timeToCloseBuckets["1-3d"] += 1;
      } else {
        timeToCloseBuckets[">3d"] += 1;
      }
    }
  });

  const hourExpectancy = hourPnl.map((value, index) => (hourClosed[index] ? value / hourClosed[index] : 0));

  const sessionWinRate = Object.fromEntries(
    sessionOptions.map((session) => [session, sessionClosed[session] ? (sessionWins[session] / sessionClosed[session]) * 100 : 0])
  );

  const sessionExpectancy = Object.fromEntries(
    sessionOptions.map((session) => [session, sessionClosed[session] ? sessionNetPnl[session] / sessionClosed[session] : 0])
  );

  const pairAgg = {};
  pairUniverse.forEach((pair) => {
    pairAgg[pair] = { pair, pnl: 0, wins: 0, closed: 0 };
  });

  rows.forEach((trade) => {
    const pair = normalizePairCode(trade.pair || "");
    if (!pair) {
      return;
    }
    if (!pairAgg[pair]) {
      pairAgg[pair] = { pair, pnl: 0, wins: 0, closed: 0 };
    }
    if (Number.isFinite(trade.pnl)) {
      pairAgg[pair].pnl += trade.pnl;
    }
    if (trade.status === "closed") {
      pairAgg[pair].closed += 1;
    }
    if (trade.outcome === "Full Win") {
      pairAgg[pair].wins += 1;
    }
  });

  const pairPnlRanking = Object.values(pairAgg).sort((a, b) => b.pnl - a.pnl);
  const pairWinRateRanking = Object.values(pairAgg)
    .map((item) => ({ pair: item.pair, winRate: item.closed ? (item.wins / item.closed) * 100 : 0 }))
    .sort((a, b) => b.winRate - a.winRate);
  const pairExpectancyRanking = Object.values(pairAgg)
    .map((item) => ({ pair: item.pair, expectancy: item.closed ? item.pnl / item.closed : 0 }))
    .sort((a, b) => b.expectancy - a.expectancy);

  const directionPnl = { Buy: 0, Sell: 0 };
  const directionClosed = { Buy: 0, Sell: 0 };
  const directionWins = { Buy: 0, Sell: 0 };

  rows.forEach((trade) => {
    if (trade.direction !== "Buy" && trade.direction !== "Sell") {
      return;
    }
    if (Number.isFinite(trade.pnl)) {
      directionPnl[trade.direction] += trade.pnl;
    }
    if (trade.status === "closed") {
      directionClosed[trade.direction] += 1;
    }
    if (trade.outcome === "Full Win") {
      directionWins[trade.direction] += 1;
    }
  });

  const directionWinRate = {
    Buy: directionClosed.Buy ? (directionWins.Buy / directionClosed.Buy) * 100 : 0,
    Sell: directionClosed.Sell ? (directionWins.Sell / directionClosed.Sell) * 100 : 0,
  };

  const lotScatter = pnlRows.map((trade) => ({ x: Number(trade.lot_size) || 0, y: trade.pnl }));
  const lotBucketAgg = {};
  pnlRows.forEach((trade) => {
    const bucket = lotBucket(Number(trade.lot_size));
    lotBucketAgg[bucket] = lotBucketAgg[bucket] || { pnl: 0, count: 0 };
    lotBucketAgg[bucket].pnl += trade.pnl;
    lotBucketAgg[bucket].count += 1;
  });
  const lotBucketExpectancy = Object.entries(lotBucketAgg).map(([bucket, value]) => ({
    bucket,
    expectancy: value.count ? value.pnl / value.count : 0,
  }));

  const now = Date.now();
  const openAges = openRows.map((trade) => Math.max(0, (now - toMillis(trade.captured_at_utc)) / 3600000));
  const openAging = {
    count: openRows.length,
    avgHours: openAges.length ? avg(openAges) : 0,
    maxHours: openAges.length ? Math.max(...openAges) : 0,
    over24h: openAges.filter((value) => value > 24).length,
  };

  let bothImages = 0;
  let beforeImages = 0;
  let afterImages = 0;

  rows.forEach((trade) => {
    const hasBefore = Boolean(trade.before_image_id);
    const hasAfter = Boolean(trade.after_image_id);
    if (hasBefore) beforeImages += 1;
    if (hasAfter) afterImages += 1;
    if (hasBefore && hasAfter) bothImages += 1;
  });

  const imageCompletenessRate = totalTrades ? (bothImages / totalTrades) * 100 : 0;
  const beforePresenceRate = totalTrades ? (beforeImages / totalTrades) * 100 : 0;
  const afterPresenceRate = totalTrades ? (afterImages / totalTrades) * 100 : 0;

  const notes = rows
    .map((trade) => (trade.note || "").trim())
    .filter((note) => note.length > 0);
  const notesUsedCount = notes.length;
  const noteUsageRate = totalTrades ? (notesUsedCount / totalTrades) * 100 : 0;
  const medianNoteLength = notes.length ? median(notes.map((note) => note.length)) : 0;

  const editCounts = rows.map((trade) => Number(trade.edit_count || 0));
  const avgEditCount = editCounts.length ? avg(editCounts) : 0;
  const maxEditCount = editCounts.length ? Math.max(...editCounts) : 0;

  const editCountDistribution = {};
  editCounts.forEach((count) => {
    const bucket = count >= 5 ? "5+" : String(count);
    editCountDistribution[bucket] = (editCountDistribution[bucket] || 0) + 1;
  });

  const imageBuckets = [
    rows.filter((trade) => trade.before_image_id && trade.after_image_id).length,
    rows.filter((trade) => trade.before_image_id && !trade.after_image_id).length,
    rows.filter((trade) => !trade.before_image_id && trade.after_image_id).length,
    rows.filter((trade) => !trade.before_image_id && !trade.after_image_id).length,
  ];

  const topConfluenceScore = topEntryFromObject(scoreCounts);
  const topMissingOverall = topEntryFromObject(missingOverall);
  const topMissingRequired = topEntryFromObject(missingRequired);
  const topMissingQuality = topEntryFromObject(missingQuality);

  const fullIntegrityShare = totalTrades ? ((integrityCounts.full_confluence || 0) / totalTrades) * 100 : 0;
  const hardIntegrityShare = totalTrades ? ((integrityCounts.hard_invalidation_present || 0) / totalTrades) * 100 : 0;
  const gradeAShare = totalTrades ? ((gradeCounts.A || 0) / totalTrades) * 100 : 0;
  const gradeFShare = totalTrades ? ((gradeCounts.F || 0) / totalTrades) * 100 : 0;

  const latestCompliancePct = complianceTrend.values.length
    ? complianceTrend.values[complianceTrend.values.length - 1]
    : null;

  const bestSessionByShareRaw = topEntryFromObject(sessionMix);
  const bestSessionByShare = {
    ...bestSessionByShareRaw,
    sharePct: totalTrades ? (bestSessionByShareRaw.value / totalTrades) * 100 : 0,
  };
  const bestSessionByNet = topEntryFromObject(sessionNetPnl);
  const bestSessionByWinRate = topEntryFromObject(sessionWinRate);
  const bestSessionByExpectancy = topEntryFromObject(sessionExpectancy);
  const worstSessionByExpectancy = bottomEntryFromObject(sessionExpectancy);

  const hottestSessionStrategyCell = topMatrixCell(
    sessionByStrategyMatrix.rows,
    sessionByStrategyMatrix.cols,
    sessionByStrategyMatrix.values
  );
  const hottestSessionPairCell = topMatrixCell(
    sessionByPairMatrix.rows,
    sessionByPairMatrix.cols,
    sessionByPairMatrix.values
  );

  const busiestHourIndex = indexOfMax(hourFrequency);
  const bestHourExpectancyIndex = indexOfMax(hourExpectancy);
  const busiestHour = String(Math.max(0, busiestHourIndex)).padStart(2, "0");
  const busiestHourCount = hourFrequency[busiestHourIndex] || 0;
  const bestHourByExpectancy = String(Math.max(0, bestHourExpectancyIndex)).padStart(2, "0");
  const bestHourExpectancyValue = hourExpectancy[bestHourExpectancyIndex] || 0;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bestDayIndex = indexOfMax(dayPerformance);
  const bestDayByPnl = {
    name: dayNames[Math.max(0, bestDayIndex)] || "Sun",
    value: dayPerformance[bestDayIndex] || 0,
  };

  const dominantTimeToCloseBucket = topEntryFromObject(timeToCloseBuckets);
  const bestPairByPnl = pairPnlRanking[0] ? { key: pairPnlRanking[0].pair, value: pairPnlRanking[0].pnl } : { key: "-", value: 0 };
  const worstPairByPnl = pairPnlRanking[pairPnlRanking.length - 1]
    ? { key: pairPnlRanking[pairPnlRanking.length - 1].pair, value: pairPnlRanking[pairPnlRanking.length - 1].pnl }
    : { key: "-", value: 0 };
  const bestPairByWinRate = pairWinRateRanking[0]
    ? { key: pairWinRateRanking[0].pair, value: pairWinRateRanking[0].winRate }
    : { key: "-", value: 0 };
  const bestPairByExpectancy = pairExpectancyRanking[0]
    ? { key: pairExpectancyRanking[0].pair, value: pairExpectancyRanking[0].expectancy }
    : { key: "-", value: 0 };

  const bestLotBucket = lotBucketExpectancy.length
    ? [...lotBucketExpectancy].sort((a, b) => b.expectancy - a.expectancy)[0]
    : { bucket: "-", expectancy: 0 };

  const withAfterAvgPnl = avg(pnlRows.filter((trade) => trade.after_image_id).map((trade) => trade.pnl));
  const withoutAfterAvgPnl = avg(pnlRows.filter((trade) => !trade.after_image_id).map((trade) => trade.pnl));
  const afterImageOutcomeDelta = withAfterAvgPnl - withoutAfterAvgPnl;

  const highLotAvgPnl = avg(pnlRows.filter((trade) => Number(trade.lot_size) > 0.1).map((trade) => trade.pnl));
  const baselineLotAvgPnl = avg(pnlRows.filter((trade) => Number(trade.lot_size) <= 0.1).map((trade) => trade.pnl));
  const highLotUnderperformance = highLotAvgPnl - baselineLotAvgPnl;

  const fullClosedRows = closedRows.filter((trade) => trade.setup_integrity === "full_confluence");
  const hardClosedRows = closedRows.filter((trade) => trade.setup_integrity === "hard_invalidation_present");
  const fullConfluenceWinRate = fullClosedRows.length
    ? (fullClosedRows.filter((trade) => trade.outcome === "Full Win").length / fullClosedRows.length) * 100
    : 0;
  const hardInvalidationWinRate = hardClosedRows.length
    ? (hardClosedRows.filter((trade) => trade.outcome === "Full Win").length / hardClosedRows.length) * 100
    : 0;

  const nowDate = new Date();
  const monthStartMs = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1).getTime();
  const monthRows = rows.filter((trade) => toMillis(trade.captured_at_utc) >= monthStartMs);
  const monthClosedRows = monthRows.filter((trade) => trade.status === "closed");
  const monthClosedPnlRows = monthClosedRows.filter((trade) => Number.isFinite(trade.pnl));
  const fMonthRows = monthRows.filter((trade) => trade.setup_grade === "F");
  const fMonthClosedPnlRows = fMonthRows.filter((trade) => trade.status === "closed" && Number.isFinite(trade.pnl));
  const fTradesThisMonth = fMonthRows.length;
  const fNetPnlThisMonth = sum(fMonthClosedPnlRows.map((trade) => trade.pnl));
  const fLossAbsThisMonth = Math.abs(sum(fMonthClosedPnlRows.filter((trade) => trade.pnl < 0).map((trade) => trade.pnl)));
  const totalLossAbsThisMonth = Math.abs(sum(monthClosedPnlRows.filter((trade) => trade.pnl < 0).map((trade) => trade.pnl)));
  const fLossContributionPct = totalLossAbsThisMonth ? (fLossAbsThisMonth / totalLossAbsThisMonth) * 100 : 0;
  const fAvgLossPerTradeThisMonth = avg(fMonthClosedPnlRows.filter((trade) => trade.pnl < 0).map((trade) => trade.pnl));
  const netPnlThisMonth = sum(monthClosedPnlRows.map((trade) => trade.pnl));

  const requiredMissesFMonth = {};
  fMonthRows.forEach((trade) => {
    const rules = getConfluenceRules(trade.strategy);
    (trade.missing_confluences || []).forEach((item) => {
      if (rules.required.includes(item)) {
        requiredMissesFMonth[item] = (requiredMissesFMonth[item] || 0) + 1;
      }
    });
  });
  const topMissingRequiredConfluenceFMonthEntry = topEntryFromObject(requiredMissesFMonth);
  const topMissingRequiredConfluenceFMonth = topMissingRequiredConfluenceFMonthEntry.key;
  const topMissingRequiredConfluenceFMonthCount = topMissingRequiredConfluenceFMonthEntry.value;

  const lotPnlCorrelation = pearsonCorrelation(
    pnlRows.map((trade) => Number(trade.lot_size) || 0),
    pnlRows.map((trade) => trade.pnl)
  );

  return {
    totalTrades,
    closedTrades: closedRows.length,
    openTrades: openRows.length,
    netPnl,
    grossProfit,
    grossLossAbs,
    winRate,
    lossRate,
    breakevenRate,
    profitFactor,
    expectancy,
    avgWin,
    avgLoss,
    winLossRatio,
    outcomeCounts,

    equityCurve,
    drawdownCurve,
    maxDrawdown,
    currentDrawdown,
    longestDrawdownDuration,
    bestTrade,
    worstTrade,
    maxWinStreak,
    maxLossStreak,
    recoveryFactor,

    strategyCounts,
    strategyNetPnl,
    strategyWinRate,
    topConfluenceScore,
    scoreCounts,
    integrityCounts,
    gradeCounts,
    fullIntegrityShare,
    hardIntegrityShare,
    gradeAShare,
    gradeFShare,
    missingOverall,
    missingRequired,
    missingQuality,
    topMissingOverall,
    topMissingRequired,
    topMissingQuality,
    integrityPerformance,
    complianceTrend,
    latestCompliancePct,
    gradeVsPnl,
    fullConfluenceWinRate,
    hardInvalidationWinRate,

    sessionMix,
    sessionOptions,
    sessionNetPnl,
    sessionWinRate,
    sessionExpectancy,
    bestSessionByShare,
    bestSessionByNet,
    bestSessionByWinRate,
    bestSessionByExpectancy,
    worstSessionByExpectancy,
    sessionByStrategyMatrix,
    sessionByPairMatrix,
    hottestSessionStrategyCell,
    hottestSessionPairCell,
    hourFrequency,
    hourExpectancy,
    busiestHour,
    busiestHourCount,
    bestHourByExpectancy,
    bestHourExpectancyValue,
    dayPerformance,
    bestDayByPnl,
    timeToCloseBuckets,
    dominantTimeToCloseBucket,

    pairPnlRanking,
    pairWinRateRanking,
    pairExpectancyRanking,
    bestPairByPnl,
    worstPairByPnl,
    bestPairByWinRate,
    bestPairByExpectancy,
    directionPnl,
    directionWinRate,
    lotScatter,
    lotPnlCorrelation,
    lotBucketExpectancy,
    bestLotBucket: { key: bestLotBucket.bucket, value: bestLotBucket.expectancy },
    highLotAvgPnl,
    baselineLotAvgPnl,
    highLotUnderperformance,
    openAging,

    imageCompletenessRate,
    beforePresenceRate,
    afterPresenceRate,
    imageHydrationMisses,
    withAfterAvgPnl,
    withoutAfterAvgPnl,
    afterImageOutcomeDelta,
    noteUsageRate,
    notesUsedCount,
    medianNoteLength,
    avgEditCount,
    maxEditCount,
    editCountDistribution,
    imageBuckets,
    netPnlThisMonth,
    closedTradesThisMonth: monthClosedRows.length,
    fTradesThisMonth,
    fNetPnlThisMonth,
    fLossContributionPct,
    fAvgLossPerTradeThisMonth,
    topMissingRequiredConfluenceFMonth,
    topMissingRequiredConfluenceFMonthCount,
  };
}

function streaksFromRows(rows) {
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentWin = 0;
  let currentLoss = 0;

  rows.forEach((trade) => {
    if (!Number.isFinite(trade.pnl)) {
      return;
    }
    if (trade.pnl > 0) {
      currentWin += 1;
      currentLoss = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWin);
      return;
    }
    if (trade.pnl < 0) {
      currentLoss += 1;
      currentWin = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLoss);
      return;
    }
    currentWin = 0;
    currentLoss = 0;
  });

  return { maxWinStreak, maxLossStreak };
}

function lotBucket(lot) {
  if (lot <= 0.01) return "<=0.010";
  if (lot <= 0.05) return "0.011-0.050";
  if (lot <= 0.1) return "0.051-0.100";
  if (lot <= 0.5) return "0.101-0.500";
  return ">0.500";
}

function getWeekKey(timestamp) {
  const date = new Date(timestamp || Date.now());
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstDay) / 86400000);
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function exportCsv(rows, filename) {
  const headers = [
    "id",
    "captured_at_utc",
    "pair",
    "direction",
    "lot_size",
    "sessions",
    "strategy",
    "smc_entry_types",
    "present_confluences",
    "confluence_score",
    "raw_score_present",
    "raw_score_total",
    "total_confluences",
    "missing_confluences",
    "missing_core",
    "missing_backing",
    "missing_quality",
    "core_present_count",
    "core_total_count",
    "backing_present_count",
    "backing_total_count",
    "quality_present_count",
    "quality_total_count",
    "required_missing_count",
    "quality_missing_count",
    "setup_integrity",
    "setup_grade",
    "state_tag",
    "model_adherence",
    "outcome",
    "status",
    "pnl_usd",
    "note",
    "before_image_present",
    "after_image_present",
    "closed_at_utc",
    "edit_count",
    "created_at",
    "updated_at",
  ];

  const csvRows = rows.map((row) => [
    row.id,
    row.captured_at_utc,
    row.pair,
    row.direction,
    Number(row.lot_size).toFixed(3),
    (row.sessions || []).join("|"),
    row.strategy,
    (row.smc_entry_types || []).join("|"),
    (row.present_confluences || []).join("|"),
    row.confluence_score,
    row.raw_score_present,
    row.raw_score_total,
    row.total_confluences,
    (row.missing_confluences || []).join("|"),
    (row.missing_core || []).join("|"),
    (row.missing_backing || []).join("|"),
    (row.missing_quality || []).join("|"),
    row.core_present_count,
    row.core_total_count,
    row.backing_present_count,
    row.backing_total_count,
    row.quality_present_count,
    row.quality_total_count,
    row.required_missing_count,
    row.quality_missing_count,
    row.setup_integrity,
    row.setup_grade,
    row.state_tag || "",
    row.model_adherence || "",
    row.outcome || "",
    row.status,
    Number.isFinite(row.pnl) ? row.pnl : "",
    row.note || "",
    row.before_image_id ? "Yes" : "No",
    row.after_image_id ? "Yes" : "No",
    row.closed_at_utc || "",
    Number(row.edit_count || 0),
    row.created_at,
    row.updated_at,
  ]);

  const content = [headers, ...csvRows].map((entry) => entry.map(csvEscape).join(",")).join("\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  showToast("CSV exported", "ok");
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function formatMoney(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${value.toFixed(2)}`;
}

function formatDateTime(utcIso) {
  if (!utcIso) {
    return "-";
  }
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function combineDateTime(date, time) {
  return new Date(`${date}T${time || "00:00"}:00`);
}

function toDateInputValue(dateInput) {
  const date = new Date(dateInput);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function toTimeInputValue(dateInput) {
  const date = new Date(dateInput);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(11, 16);
}

function pairOptionsHtml(selected, includeBlank, includeAddAction = true) {
  const nextSelected = normalizedSelectedPair(selected);
  const options = [];
  if (includeBlank) {
    options.push('<option value="">-</option>');
  }
  getPairUniverse().forEach((value) => {
    options.push(`<option value="${escapeHtmlAttr(value)}" ${nextSelected === value ? "selected" : ""}>${escapeHtml(value)}</option>`);
  });
  if (includeAddAction) {
    options.push(`<option value="${ADD_PAIR_OPTION_VALUE}">+ Add pair...</option>`);
  }
  return options.join("");
}

function optionsHtml(values, selected, includeBlank) {
  const options = [];
  if (includeBlank) {
    options.push(`<option value="">-</option>`);
  }
  values.forEach((value) => {
    options.push(`<option value="${escapeHtmlAttr(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(value)}</option>`);
  });
  return options.join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toMillis(value) {
  const date = new Date(value || 0);
  const ms = date.getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function sum(values) {
  return values.reduce((acc, value) => acc + value, 0);
}

function avg(values) {
  if (!values.length) {
    return 0;
  }
  return sum(values) / values.length;
}

function median(values) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function topEntryFromObject(obj) {
  const entries = Object.entries(obj || {});
  if (!entries.length) {
    return { key: "None", value: 0 };
  }
  entries.sort((a, b) => (b[1] || 0) - (a[1] || 0));
  return { key: entries[0][0], value: Number(entries[0][1] || 0) };
}

function bottomEntryFromObject(obj) {
  const entries = Object.entries(obj || {});
  if (!entries.length) {
    return { key: "None", value: 0 };
  }
  entries.sort((a, b) => (a[1] || 0) - (b[1] || 0));
  return { key: entries[0][0], value: Number(entries[0][1] || 0) };
}

function topMatrixCell(rows, cols, matrix) {
  let best = { row: rows?.[0] || "-", col: cols?.[0] || "-", value: 0 };
  (rows || []).forEach((row, rowIndex) => {
    (cols || []).forEach((col, colIndex) => {
      const value = Number(matrix?.[rowIndex]?.[colIndex] || 0);
      if (value > best.value) {
        best = { row, col, value };
      }
    });
  });
  return best;
}

function indexOfMax(values) {
  if (!values || !values.length) {
    return 0;
  }
  let bestIndex = 0;
  let bestValue = Number(values[0] || 0);
  for (let index = 1; index < values.length; index += 1) {
    const value = Number(values[index] || 0);
    if (value > bestValue) {
      bestValue = value;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function pearsonCorrelation(xs, ys) {
  if (!Array.isArray(xs) || !Array.isArray(ys) || xs.length !== ys.length || xs.length < 2) {
    return null;
  }
  const n = xs.length;
  const meanX = avg(xs);
  const meanY = avg(ys);
  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;

  for (let index = 0; index < n; index += 1) {
    const x = Number(xs[index] || 0) - meanX;
    const y = Number(ys[index] || 0) - meanY;
    numerator += x * y;
    sumSqX += x * x;
    sumSqY += y * y;
  }

  const denominator = Math.sqrt(sumSqX * sumSqY);
  if (!denominator) {
    return null;
  }
  return numerator / denominator;
}

function normalizeTrade(trade) {
  const strategy = normalizeStrategyName(trade.strategy);
  const presentConfluences = Array.isArray(trade.present_confluences) ? trade.present_confluences : [];
  const inferred = inferConfluence(strategy, presentConfluences);

  const rawStatus = String(trade.status || "").toLowerCase().trim();
  const status = rawStatus === "open" || rawStatus === "closed" ? rawStatus : trade.outcome ? "closed" : "open";

  return {
    ...trade,
    pair: normalizePairCode(trade.pair || ""),
    direction: trade.direction || "",
    lot_size: normalizeLotSizeValue(trade.lot_size || DEFAULT_LOT_SIZE),
    sessions: orderSessions(Array.isArray(trade.sessions) ? trade.sessions : []),
    strategy,
    smc_entry_types: Array.isArray(trade.smc_entry_types) ? trade.smc_entry_types : [],
    present_confluences: presentConfluences,
    confluence_score: trade.confluence_score || inferred.confluence_score,
    total_confluences: Number.isFinite(trade.total_confluences) ? trade.total_confluences : inferred.total_confluences,
    missing_confluences: Array.isArray(trade.missing_confluences) ? trade.missing_confluences : inferred.missing_confluences,
    required_missing_count: Number.isFinite(trade.required_missing_count)
      ? trade.required_missing_count
      : inferred.required_missing_count,
    quality_missing_count: Number.isFinite(trade.quality_missing_count)
      ? trade.quality_missing_count
      : inferred.quality_missing_count,
    setup_integrity: trade.setup_integrity || inferred.setup_integrity,
    setup_grade: trade.setup_grade || inferred.setup_grade,
    state_tag: trade.state_tag || inferred.state_tag,
    model_adherence: trade.model_adherence || inferred.model_adherence,
    core_present_count: Number.isFinite(trade.core_present_count) ? trade.core_present_count : inferred.core_present_count,
    core_total_count: Number.isFinite(trade.core_total_count) ? trade.core_total_count : inferred.core_total_count,
    backing_present_count: Number.isFinite(trade.backing_present_count)
      ? trade.backing_present_count
      : inferred.backing_present_count,
    backing_total_count: Number.isFinite(trade.backing_total_count) ? trade.backing_total_count : inferred.backing_total_count,
    quality_present_count: Number.isFinite(trade.quality_present_count)
      ? trade.quality_present_count
      : inferred.quality_present_count,
    quality_total_count: Number.isFinite(trade.quality_total_count) ? trade.quality_total_count : inferred.quality_total_count,
    missing_core: Array.isArray(trade.missing_core) ? trade.missing_core : inferred.missing_core,
    missing_backing: Array.isArray(trade.missing_backing) ? trade.missing_backing : inferred.missing_backing,
    missing_quality: Array.isArray(trade.missing_quality) ? trade.missing_quality : inferred.missing_quality,
    raw_score_present: Number.isFinite(trade.raw_score_present) ? trade.raw_score_present : inferred.raw_score_present,
    raw_score_total: Number.isFinite(trade.raw_score_total) ? trade.raw_score_total : inferred.raw_score_total,
    outcome: trade.outcome || "",
    pnl: Number.isFinite(trade.pnl) ? trade.pnl : null,
    note: trade.note || "",
    captured_at_utc: trade.captured_at_utc || trade.created_at || new Date().toISOString(),
    captured_at_local: trade.captured_at_local || formatDateTime(trade.captured_at_utc || trade.created_at),
    timezone_offset_min: Number.isFinite(trade.timezone_offset_min) ? trade.timezone_offset_min : new Date().getTimezoneOffset(),
    status,
    closed_at_utc: trade.closed_at_utc || null,
    edit_count: Number.isFinite(trade.edit_count) ? trade.edit_count : 0,
    before_image_id: trade.before_image_id || null,
    after_image_id: trade.after_image_id || null,
    created_at: trade.created_at || new Date().toISOString(),
    updated_at: trade.updated_at || new Date().toISOString(),
  };
}

async function migrateTradeLotSizesIfNeeded() {
  if (localStorage.getItem(LOT_SIZE_MIGRATION_KEY) === "done") {
    return;
  }

  let migratedCount = 0;
  for (let index = 0; index < trades.length; index += 1) {
    const trade = trades[index];
    const normalizedLot = normalizeLotSizeValue(trade.lot_size);
    if (Math.abs(Number(trade.lot_size || 0) - normalizedLot) < 0.0001) {
      continue;
    }

    const nextTrade = normalizeTrade({
      ...trade,
      lot_size: normalizedLot,
      updated_at: new Date().toISOString(),
    });
    trades[index] = nextTrade;
    await saveTradeRecord(nextTrade);
    migratedCount += 1;
  }

  localStorage.setItem(LOT_SIZE_MIGRATION_KEY, "done");
  if (migratedCount > 0) {
    showToast(`Lot migration done: ${migratedCount} trades updated`, "ok");
  }
}

async function loadTradesFromDb() {
  const rows = await dbGetAllTrades();
  trades = rows.map(normalizeTrade);
}

async function dbGetImageBlob(id) {
  const localBlob = await dbGetImage(id);
  if (localBlob) {
    return localBlob;
  }
  const cloudBlob = await fetchImageFromCloud(id);
  if (cloudBlob) {
    await putImageRecord(id, cloudBlob, { enqueue: false });
  }
  return cloudBlob;
}
