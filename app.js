const DB_NAME = "edgeForgeV2";
const DB_VERSION = 1;
const TRADE_STORE = "trades";
const IMAGE_STORE = "images";

const SUPABASE_URL = "https://glvskwnsotlotzfjnssz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tsFYhQmml_1X_qPmmrfR3A_EstQOROS";
const SUPABASE_TRADES_TABLE = "journal_trades";
const SUPABASE_IMAGE_BUCKET = "trade-images";

const STORAGE_KEYS = {
  SETTINGS: "edgeForgeSettingsV2",
  CLAUDE_KEY: "edgeForgeClaudeKey",
  AI_HINT_DISMISSED: "edgeForgeAiHintDismissedV1",
};

const DEFAULT_PAIRS = ["GBPUSD", "EURUSD", "GBPJPY", "USDJPY", "XAUUSD", "GBPCAD", "EURGBP", "AUDUSD"];
const DEFAULT_SESSIONS = ["London", "NY", "Asian"];
const PAIR_PREFIX = {
  GBPUSD: "GU",
  EURUSD: "EU",
  USDJPY: "UJ",
  GBPJPY: "GJ",
  XAUUSD: "XA",
  GBPCAD: "GC",
  EURGBP: "EG",
  AUDUSD: "AU",
  USDCAD: "UC",
};

const DEFAULT_PAIR_NOTES = {
  GBPJPY: "High volatility - strongest setups only",
  USDJPY: "BOJ intervention risk - use conservative stops",
  AUDUSD: "Commodity sensitivity - check macro before entry",
  XAUUSD: "Pip values larger than forex - 0.01 lots ~= $1/pip",
};

const DEFAULT_SETTINGS = {
  pairs: [...DEFAULT_PAIRS],
  sessions: [...DEFAULT_SESSIONS],
  pairNotes: { ...DEFAULT_PAIR_NOTES },
  defaultLotSize: 0.01,
  defaultStrategy: "SMC",
  defaultSession: "London",
  backtestMode: false,
};

const STRATEGY_CONFLUENCES = {
  SMC: [
    { key: "liquidity_sweep", label: "Liquidity sweep" },
    { key: "mss_body_close", label: "MSS body close" },
    { key: "fvg_present", label: "FVG present" },
    { key: "htf_bias_aligned", label: "HTF bias aligned" },
    { key: "structural_liquidity", label: "Structural liquidity" },
    { key: "clean_rto", label: "Clean RTO" },
  ],
  ICC: [
    { key: "indication_leg", label: "Indication / expansion leg" },
    { key: "correction_formed", label: "Correction / sweep formed" },
    { key: "mss_15m", label: "15m MSS body close" },
    { key: "htf_bias_aligned", label: "HTF bias aligned" },
    { key: "overlap_window", label: "Overlap window (London/NY)" },
    { key: "first_pullback", label: "First clean pullback" },
  ],
};

const CONFLUENCE_EXPLAINERS = {
  liquidity_sweep: "Price sweeps a key high/low then reverses back through that level.",
  mss_body_close: "A candle body closes beyond the prior swing, confirming structural shift.",
  fvg_present: "A clear 3-candle imbalance gap is visible in displacement.",
  htf_bias_aligned: "Higher timeframe direction supports this setup.",
  structural_liquidity: "Clear liquidity target exists in trade direction.",
  clean_rto: "Price returns cleanly to entry zone without breaking structure first.",
  indication_leg: "Strong impulsive leg establishes directional intent.",
  correction_formed: "Structured pullback forms against the indication leg.",
  mss_15m: "15m structure shift confirms continuation after correction.",
  overlap_window: "Setup occurs during London/NY overlap timing.",
  first_pullback: "Entry is the first clean pullback after the shift.",
};

const ALL_CONFLUENCE_KEYS = [
  "liquidity_sweep",
  "mss_body_close",
  "fvg_present",
  "htf_bias_aligned",
  "structural_liquidity",
  "clean_rto",
  "indication_leg",
  "correction_formed",
  "mss_15m",
  "overlap_window",
  "first_pullback",
];

const LEGACY_CONFLUENCE_MAP = {
  "clear liquidity sweep": "liquidity_sweep",
  "valid mss / displacement body close": "mss_body_close",
  "fvg present": "fvg_present",
  "htf bias aligned": "htf_bias_aligned",
  "structural liquidity in trade direction": "structural_liquidity",
  "first clean return to zone": "clean_rto",
  "clear indication / expansion leg present": "indication_leg",
  "proper correction / sweep formed": "correction_formed",
  "valid 15m mss body close": "mss_15m",
  "ny/overlap window aligned": "overlap_window",
  "first clean pullback after mss": "first_pullback",
};

const state = {
  trades: [],
  settings: loadSettings(),
  filters: { status: "all", strategy: "all", mode: "all", pair: "all" },
  syncBusy: false,
  lightboxImages: [],
  lightboxIndex: 0,
  lightboxSourceTradeId: "",
  authUser: null,
  formImageBlob: null,
  formImageUrl: "",
  formAfterImageBlob: null,
  formAfterImageUrl: "",
  formAiResult: null,
  formDirection: "",
  formOutcome: "",
  formStrategy: "",
  editingTradeId: null,
};

const supabaseClient = createSupabaseClient();
const dbApi = createDbApi();

const refs = {
  screens: {
    history: document.getElementById("screen-history"),
    log: document.getElementById("screen-log"),
    settings: document.getElementById("screen-settings"),
  },
  historyList: document.getElementById("historyList"),
  filterPair: document.getElementById("filterPair"),
  sessionStatusPill: document.getElementById("sessionStatusPill"),
  backtestBanner: document.getElementById("backtestBanner"),
  exitBacktestBtn: document.getElementById("exitBacktestBtn"),
  tradeForm: document.getElementById("tradeForm"),
  fPair: document.getElementById("fPair"),
  fPairNote: document.getElementById("fPairNote"),
  fDirectionToggle: document.getElementById("fDirectionToggle"),
  fEntryPrice: document.getElementById("fEntryPrice"),
  fEntryPriceAiMark: document.getElementById("fEntryPriceAiMark"),
  fLotSize: document.getElementById("fLotSize"),
  fSlPrice: document.getElementById("fSlPrice"),
  fTpPrice: document.getElementById("fTpPrice"),
  fScreenshotZone: document.getElementById("fScreenshotZone"),
  fImageInput: document.getElementById("fImageInput"),
  fScreenshotLabel: document.getElementById("fScreenshotLabel"),
  fScreenshotHint: document.getElementById("fScreenshotHint"),
  fAiLoading: document.getElementById("fAiLoading"),
  fAiKeyHint: document.getElementById("fAiKeyHint"),
  fBeforePreviewWrap: document.getElementById("fBeforePreviewWrap"),
  fBeforePreview: document.getElementById("fBeforePreview"),
  fClearBefore: document.getElementById("fClearBefore"),
  fAfterWrap: document.getElementById("fAfterWrap"),
  fAfterZone: document.getElementById("fAfterZone"),
  fAfterInput: document.getElementById("fAfterInput"),
  fAfterPreviewWrap: document.getElementById("fAfterPreviewWrap"),
  fAfterPreview: document.getElementById("fAfterPreview"),
  fClearAfter: document.getElementById("fClearAfter"),
  fStrategyToggle: document.getElementById("fStrategyToggle"),
  fSessionPills: document.getElementById("fSessionPills"),
  fConfluenceWrap: document.getElementById("fConfluenceWrap"),
  fConfluenceList: document.getElementById("fConfluenceList"),
  fAiAnalysisState: document.getElementById("fAiAnalysisState"),
  fTwoBulletsToggle: document.getElementById("fTwoBulletsToggle"),
  fTwoBulletsPanel: document.getElementById("fTwoBulletsPanel"),
  fBulletLotSize: document.getElementById("fBulletLotSize"),
  fTotalExposureHint: document.getElementById("fTotalExposureHint"),
  fB1Outcome: document.getElementById("fB1Outcome"),
  fB1Pnl: document.getElementById("fB1Pnl"),
  fB2Outcome: document.getElementById("fB2Outcome"),
  fB2Pnl: document.getElementById("fB2Pnl"),
  fB2TargetRr: document.getElementById("fB2TargetRr"),
  fB2StopMovedWrap: document.getElementById("fB2StopMovedWrap"),
  fB2StopMoved: document.getElementById("fB2StopMoved"),
  fTwoBulletsTotalPnl: document.getElementById("fTwoBulletsTotalPnl"),
  fEffectiveRr: document.getElementById("fEffectiveRr"),
  fOutcomeGrid: document.getElementById("fOutcomeGrid"),
  fSingleOutcomePanel: document.getElementById("fSingleOutcomePanel"),
  fPnlWrap: document.getElementById("fPnlWrap"),
  fPnlInput: document.getElementById("fPnlInput"),
  fPnlPrefix: document.getElementById("fPnlPrefix"),
  fNote: document.getElementById("fNote"),
  fSaveBtn: document.getElementById("fSaveBtn"),
  fClearBtn: document.getElementById("fClearBtn"),
  fCancelBtn: document.getElementById("fCancelBtn"),
  authEmail: document.getElementById("authEmail"),
  sendMagicLinkBtn: document.getElementById("sendMagicLinkBtn"),
  signOutBtn: document.getElementById("signOutBtn"),
  authState: document.getElementById("authState"),
  syncState: document.getElementById("syncState"),
  claudeApiKey: document.getElementById("claudeApiKey"),
  saveApiKeyBtn: document.getElementById("saveApiKeyBtn"),
  testApiKeyBtn: document.getElementById("testApiKeyBtn"),
  pairsList: document.getElementById("pairsList"),
  newPairInput: document.getElementById("newPairInput"),
  addPairBtn: document.getElementById("addPairBtn"),
  sessionsList: document.getElementById("sessionsList"),
  newSessionInput: document.getElementById("newSessionInput"),
  addSessionBtn: document.getElementById("addSessionBtn"),
  defaultLotInput: document.getElementById("defaultLotInput"),
  defaultStrategySelect: document.getElementById("defaultStrategySelect"),
  defaultSessionSelect: document.getElementById("defaultSessionSelect"),
  backtestModeToggle: document.getElementById("backtestModeToggle"),
  saveDefaultsBtn: document.getElementById("saveDefaultsBtn"),
  exportLiveJsonBtn: document.getElementById("exportLiveJsonBtn"),
  exportBacktestJsonBtn: document.getElementById("exportBacktestJsonBtn"),
  exportAllJsonBtn: document.getElementById("exportAllJsonBtn"),
  exportLiveCsvBtn: document.getElementById("exportLiveCsvBtn"),
  exportBacktestCsvBtn: document.getElementById("exportBacktestCsvBtn"),
  forceSyncBtn: document.getElementById("forceSyncBtn"),
  tradeDetailModal: document.getElementById("tradeDetailModal"),
  detailTradeId: document.getElementById("detailTradeId"),
  detailBody: document.getElementById("detailBody"),
  closeDetailBtn: document.getElementById("closeDetailBtn"),
  editFromDetailBtn: document.getElementById("editFromDetailBtn"),
  lightbox: document.getElementById("lightbox"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxClose: document.getElementById("lightboxClose"),
  lightboxPrev: document.getElementById("lightboxPrev"),
  lightboxNext: document.getElementById("lightboxNext"),
  toast: document.getElementById("toast"),
};

void init();

async function init() {
  bindNavigation();
  bindHistoryFilters();
  bindTradeForm();
  bindDetailAndLightbox();
  bindSettings();
  bindBacktestBanner();
  bindSessionStatusIndicator();
  setupAuth();

  refs.claudeApiKey.value = localStorage.getItem(STORAGE_KEYS.CLAUDE_KEY) || "";

  await loadTrades();
  renderAll();
  resetTradeForm();
}

function bindNavigation() {
  const onNav = (event) => {
    const btn = event.target.closest("[data-screen]");
    if (!btn) {
      return;
    }
    setActiveScreen(btn.dataset.screen || "history");
  };
  document.querySelectorAll(".sidebar").forEach((el) => el.addEventListener("click", onNav));
  document.querySelectorAll(".bottom-nav").forEach((el) => el.addEventListener("click", onNav));
}

function setActiveScreen(name) {
  const screens = ["history", "log", "settings"];
  screens.forEach((screen) => {
    const node = refs.screens[screen];
    if (node) {
      node.classList.toggle("is-active", screen === name);
    }
    document.querySelectorAll(`[data-screen=\"${screen}\"]`).forEach((btn) => {
      btn.classList.toggle("active", screen === name);
    });
  });
}

function bindHistoryFilters() {
  document.querySelectorAll("[data-filter-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filters.status = btn.dataset.filterStatus || "all";
      applyPillState("[data-filter-status]", btn);
      renderHistory();
    });
  });

  document.querySelectorAll("[data-filter-strategy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filters.strategy = btn.dataset.filterStrategy || "all";
      applyPillState("[data-filter-strategy]", btn);
      renderHistory();
    });
  });

  document.querySelectorAll("[data-filter-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filters.mode = btn.dataset.filterMode || "all";
      applyPillState("[data-filter-mode]", btn);
      renderHistory();
    });
  });

  refs.filterPair.addEventListener("change", () => {
    state.filters.pair = refs.filterPair.value || "all";
    renderHistory();
  });

  document.getElementById("clearFiltersBtn").addEventListener("click", () => {
    state.filters = { status: "all", strategy: "all", mode: "all", pair: "all" };
    refs.filterPair.value = "all";
    resetPills("[data-filter-status]");
    resetPills("[data-filter-strategy]");
    resetPills("[data-filter-mode]");
    renderHistory();
  });
}

function applyPillState(selector, activeBtn) {
  document.querySelectorAll(selector).forEach((btn) => btn.classList.toggle("active", btn === activeBtn));
}

function resetPills(selector) {
  const first = document.querySelector(selector);
  if (first) {
    applyPillState(selector, first);
  }
}

function bindTradeForm() {
  refs.fPair.addEventListener("change", () => {
    refs.fPairNote.textContent = state.settings.pairNotes[refs.fPair.value] || "";
  });

  refs.fLotSize.addEventListener("blur", () => {
    if (!refs.fLotSize.value || Number(refs.fLotSize.value) <= 0) {
      refs.fLotSize.value = String(state.settings.defaultLotSize || 0.01);
    }
  });

  refs.fDirectionToggle.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-value]");
    if (!btn) {
      return;
    }
    state.formDirection = btn.dataset.value || "";
    refs.fDirectionToggle.querySelectorAll("button[data-value]").forEach((node) => {
      node.classList.toggle("active", node === btn);
    });
  });

  refs.fStrategyToggle.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-strategy]");
    if (!btn) {
      return;
    }
    state.formStrategy = btn.dataset.strategy || "";
    refs.fStrategyToggle.querySelectorAll("button").forEach((node) => {
      node.classList.toggle("active", node === btn);
    });
    renderFormConfluences();
  });

  refs.fSessionPills.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-session]");
    if (btn) {
      btn.classList.toggle("active");
    }
  });

  refs.fConfluenceList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-key]");
    if (!row) {
      return;
    }
    row.classList.toggle("checked");
    const check = row.querySelector(".confluence-check");
    if (check) {
      check.classList.toggle("checked", row.classList.contains("checked"));
      check.textContent = row.classList.contains("checked") ? "✓" : "";
    }
  });

  refs.fTwoBulletsToggle.addEventListener("change", () => {
    const on = refs.fTwoBulletsToggle.checked;
    refs.fTwoBulletsPanel.hidden = !on;
    refs.fSingleOutcomePanel.hidden = on;
    updateFormTwoBullets();
  });

  [refs.fBulletLotSize, refs.fB1Pnl, refs.fB2Pnl, refs.fB2TargetRr, refs.fB1Outcome, refs.fB2Outcome].forEach((el) => {
    el.addEventListener("input", updateFormTwoBullets);
    el.addEventListener("change", updateFormTwoBullets);
  });

  refs.fOutcomeGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-outcome]");
    if (!btn) {
      return;
    }
    state.formOutcome = btn.dataset.outcome || "";
    refs.fOutcomeGrid.querySelectorAll("button").forEach((node) => {
      node.classList.toggle("active", node === btn);
    });
    handleFormOutcomeChange(state.formOutcome);
  });

  refs.fScreenshotZone.addEventListener("click", () => {
    // Clear value so selecting the same file still triggers a change event.
    refs.fImageInput.value = "";
    refs.fImageInput.click();
  });
  refs.fImageInput.addEventListener("change", async () => {
    const file = refs.fImageInput.files?.[0];
    if (file) {
      await setFormBeforeImage(file);
    }
  });

  refs.fScreenshotZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    refs.fScreenshotZone.classList.add("drag-over");
  });
  refs.fScreenshotZone.addEventListener("dragleave", () => refs.fScreenshotZone.classList.remove("drag-over"));
  refs.fScreenshotZone.addEventListener("drop", async (event) => {
    event.preventDefault();
    refs.fScreenshotZone.classList.remove("drag-over");
    const file = Array.from(event.dataTransfer?.files || []).find((item) => item.type.startsWith("image/"));
    if (file) {
      await setFormBeforeImage(file);
    }
  });

  refs.fAfterZone.addEventListener("click", () => {
    refs.fAfterInput.value = "";
    refs.fAfterInput.click();
  });
  refs.fAfterInput.addEventListener("change", async () => {
    const file = refs.fAfterInput.files?.[0];
    if (file) {
      await setFormAfterImage(file);
    }
  });
  refs.fAfterZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    refs.fAfterZone.classList.add("drag-over");
  });
  refs.fAfterZone.addEventListener("dragleave", () => refs.fAfterZone.classList.remove("drag-over"));
  refs.fAfterZone.addEventListener("drop", async (event) => {
    event.preventDefault();
    refs.fAfterZone.classList.remove("drag-over");
    const file = Array.from(event.dataTransfer?.files || []).find((item) => item.type.startsWith("image/"));
    if (file) {
      await setFormAfterImage(file);
    }
  });

  refs.fClearBefore.addEventListener("click", clearFormBeforeImage);
  refs.fClearAfter.addEventListener("click", clearFormAfterImage);
  refs.fClearBtn.addEventListener("click", resetTradeForm);

  document.addEventListener("paste", async (event) => {
    if (!refs.screens.log.classList.contains("is-active")) {
      return;
    }
    const item = Array.from(event.clipboardData?.items || []).find((entry) => entry.type.startsWith("image/"));
    if (!item) {
      return;
    }
    const file = item.getAsFile();
    if (!file) {
      return;
    }
    if (!state.formImageBlob) {
      await setFormBeforeImage(file);
      return;
    }
    await setFormAfterImage(file);
  });

  refs.fCancelBtn.addEventListener("click", () => {
    resetTradeForm();
    setActiveScreen("history");
  });

  refs.tradeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveTradeForm();
    } catch (error) {
      console.error(error);
      showToast("Save failed - check console");
    }
  });
}

async function setFormBeforeImage(file) {
  state.formImageBlob = file;
  if (state.formImageUrl) {
    URL.revokeObjectURL(state.formImageUrl);
  }
  state.formImageUrl = URL.createObjectURL(file);
  refs.fBeforePreview.src = state.formImageUrl;
  refs.fBeforePreviewWrap.hidden = false;
  refs.fAfterWrap.hidden = false;
  refs.fScreenshotLabel.textContent = "Before screenshot ✓";
  refs.fScreenshotHint.textContent = "Replace before screenshot";

  const apiKey = localStorage.getItem(STORAGE_KEYS.CLAUDE_KEY);
  if (!apiKey) {
    const dismissed = localStorage.getItem(STORAGE_KEYS.AI_HINT_DISMISSED) === "1";
    refs.fAiKeyHint.hidden = dismissed;
    return;
  }

  refs.fAiLoading.hidden = false;
  startConfluenceScanAnimation();
  let ai = null;
  try {
    ai = await inferConfluences(file, state.formStrategy || "SMC");
  } catch (error) {
    console.error(error);
    showToast("AI analysis unavailable");
  } finally {
    stopConfluenceScanAnimation();
    refs.fAiLoading.hidden = true;
  }
  state.formAiResult = ai;

  if (!ai) {
    return;
  }

  if (ai.chart_data && typeof ai.chart_data === "object") {
    const chartData = ai.chart_data;
    if (chartData.pair && state.settings.pairs.includes(chartData.pair)) {
      refs.fPair.value = chartData.pair;
      refs.fPairNote.textContent = state.settings.pairNotes[chartData.pair] || "";
    }
    if (chartData.direction === "buy" || chartData.direction === "sell") {
      state.formDirection = chartData.direction;
      refs.fDirectionToggle.querySelectorAll("button[data-value]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.value === chartData.direction);
      });
    }
    if (Number.isFinite(chartData.entry_price)) {
      refs.fEntryPrice.value = String(chartData.entry_price);
      refs.fEntryPriceAiMark.hidden = false;
    }
    if (Number.isFinite(chartData.sl_price)) {
      refs.fSlPrice.value = String(chartData.sl_price);
    }
    if (Number.isFinite(chartData.tp_price)) {
      refs.fTpPrice.value = String(chartData.tp_price);
    }
  }

  const allowed = STRATEGY_CONFLUENCES[state.formStrategy] || [];
  allowed.forEach(({ key }) => {
    const node = refs.fConfluenceList.querySelector(`[data-key=\"${key}\"]`);
    const inference = ai[key];
    if (!node || !inference) {
      return;
    }
    if (inference.present && Number(inference.confidence || 0) >= 0.4) {
      node.classList.add("checked", "ai-suggested");
      const check = node.querySelector(".confluence-check");
      if (check) {
        check.classList.add("checked");
        check.textContent = "✓";
      }
    }
    const badge = node.querySelector(".ai-badge");
    if (badge) {
      const confidence = Number(inference.confidence || 0);
      badge.className = `ai-badge ${confidence >= 0.75 ? "high" : confidence >= 0.4 ? "medium" : "low"}`;
      badge.textContent = `${Math.round(confidence * 100)}%`;
      badge.hidden = false;
    }
  });
}

function clearFormBeforeImage() {
  state.formImageBlob = null;
  state.formAiResult = null;
  if (state.formImageUrl) {
    URL.revokeObjectURL(state.formImageUrl);
  }
  state.formImageUrl = "";
  refs.fImageInput.value = "";
  refs.fBeforePreviewWrap.hidden = true;
  refs.fBeforePreview.removeAttribute("src");
  refs.fEntryPriceAiMark.hidden = true;
  refs.fAiLoading.hidden = true;
  stopConfluenceScanAnimation();
  refs.fScreenshotLabel.textContent = "Before screenshot";
  refs.fScreenshotHint.textContent = "Paste, drag, or tap to add chart screenshot";
  clearFormAfterImage();
  refs.fAfterWrap.hidden = true;
}

async function setFormAfterImage(file) {
  state.formAfterImageBlob = file;
  if (state.formAfterImageUrl) {
    URL.revokeObjectURL(state.formAfterImageUrl);
  }
  state.formAfterImageUrl = URL.createObjectURL(file);
  refs.fAfterPreview.src = state.formAfterImageUrl;
  refs.fAfterPreviewWrap.hidden = false;
}

function clearFormAfterImage() {
  state.formAfterImageBlob = null;
  if (state.formAfterImageUrl) {
    URL.revokeObjectURL(state.formAfterImageUrl);
  }
  state.formAfterImageUrl = "";
  refs.fAfterInput.value = "";
  refs.fAfterPreviewWrap.hidden = true;
  refs.fAfterPreview.removeAttribute("src");
}

function updateFormTwoBullets() {
  const lot = parseNumber(refs.fBulletLotSize.value) || 0.01;
  refs.fTotalExposureHint.textContent = `Total: ${round2(lot * 2)} lots`;

  const b1 = parseNumber(refs.fB1Pnl.value) || 0;
  const b2 = parseNumber(refs.fB2Pnl.value) || 0;
  refs.fTwoBulletsTotalPnl.textContent = formatCurrency(round2(b1 + b2));

  const b2Outcome = refs.fB2Outcome.value;
  const rr = parseNumber(refs.fB2TargetRr.value);
  if (b2Outcome === "win" && Number.isFinite(rr) && rr > 0) {
    refs.fEffectiveRr.textContent = `1:${rr.toFixed(1)}`;
  } else if (b2Outcome === "breakeven") {
    refs.fEffectiveRr.textContent = "1:1 (runner BE)";
  } else if (b2Outcome === "loss") {
    refs.fEffectiveRr.textContent = "-1R";
  } else {
    refs.fEffectiveRr.textContent = "-";
  }

  refs.fB2StopMovedWrap.hidden = !(refs.fB1Outcome.value === "win" && !refs.fB2Outcome.value);
}

function handleFormOutcomeChange(outcome) {
  if (!outcome) {
    refs.fPnlWrap.hidden = true;
    refs.fPnlInput.value = "";
    refs.fPnlInput.disabled = false;
    return;
  }

  refs.fPnlWrap.hidden = false;
  const abs = Math.abs(parseNumber(refs.fPnlInput.value) || 0);
  if (outcome === "win") {
    refs.fPnlInput.value = String(abs || "");
    refs.fPnlInput.disabled = false;
    refs.fPnlPrefix.textContent = "+";
    refs.fPnlPrefix.style.color = "var(--color-win)";
    return;
  }
  if (outcome === "loss") {
    refs.fPnlInput.value = String(abs || "");
    refs.fPnlInput.disabled = false;
    refs.fPnlPrefix.textContent = "-";
    refs.fPnlPrefix.style.color = "var(--color-loss)";
    return;
  }
  if (outcome === "breakeven") {
    refs.fPnlInput.value = "0";
    refs.fPnlInput.disabled = true;
    refs.fPnlPrefix.textContent = "";
    return;
  }
}

function renderFormConfluences() {
  if (!state.formStrategy) {
    refs.fConfluenceWrap.hidden = true;
    refs.fConfluenceList.innerHTML = "";
    return;
  }

  refs.fConfluenceWrap.hidden = false;
  const items = STRATEGY_CONFLUENCES[state.formStrategy] || [];
  refs.fConfluenceList.innerHTML = items
    .map(
      ({ key, label }) => `<div class=\"confluence-item\" data-key=\"${escapeHtmlAttr(key)}\">\n        <span class=\"confluence-check\"></span>\n        <span>${escapeHtml(label)}</span>\n        <span class=\"confluence-help\" title=\"${escapeHtmlAttr(CONFLUENCE_EXPLAINERS[key] || "Confluence detail") }\">i</span>\n        <span class=\"ai-badge low\" hidden></span>\n      </div>`
    )
    .join("");
}

let confluenceScanTimer = null;

function startConfluenceScanAnimation() {
  stopConfluenceScanAnimation();
  const rows = Array.from(refs.fConfluenceList.querySelectorAll(".confluence-item"));
  if (!rows.length) {
    return;
  }

  let i = 0;
  confluenceScanTimer = window.setInterval(() => {
    rows.forEach((row) => row.classList.remove("scan-pulse"));
    rows[i % rows.length].classList.add("scan-pulse");
    i += 1;
  }, 100);
}

function stopConfluenceScanAnimation() {
  if (confluenceScanTimer) {
    window.clearInterval(confluenceScanTimer);
    confluenceScanTimer = null;
  }
  refs.fConfluenceList.querySelectorAll(".confluence-item.scan-pulse").forEach((row) => {
    row.classList.remove("scan-pulse");
  });
}

function renderFormSessionPills() {
  refs.fSessionPills.innerHTML = state.settings.sessions
    .map((session) => `<button class=\"chip\" data-session=\"${escapeHtmlAttr(session)}\" type=\"button\">${escapeHtml(session)}</button>`)
    .join("");
}

async function saveTradeForm() {
  const pair = refs.fPair.value;
  const direction = state.formDirection;
  const entryPrice = parseNumber(refs.fEntryPrice.value);
  const lotSize = parseNumber(refs.fLotSize.value);

  if (!pair || !direction || !entryPrice || entryPrice <= 0 || !lotSize || lotSize <= 0) {
    showToast("Fill pair, direction, entry price and lot size");
    return;
  }

  const twoBullets = refs.fTwoBulletsToggle.checked;
  if (twoBullets) {
    const b1 = refs.fB1Outcome.value;
    const b2 = refs.fB2Outcome.value;
    if (b2 && !b1) {
      showToast("B1 must close before B2 can close");
      return;
    }
    if (b1 === "win" && !b2 && !refs.fB2StopMoved.checked) {
      showToast("Confirm B2 stop moved to breakeven");
      return;
    }
  }

  const now = new Date();
  const existing = state.editingTradeId ? state.trades.find((trade) => trade.id === state.editingTradeId) : null;

  const beforeImageId = state.formImageBlob
    ? await dbApi.saveImage(state.formImageBlob)
    : existing?.before_image_id || null;
  const afterImageId = state.formAfterImageBlob
    ? await dbApi.saveImage(state.formAfterImageBlob)
    : existing?.after_image_id || null;

  const sessions = Array.from(refs.fSessionPills.querySelectorAll("button.active"))
    .map((btn) => btn.dataset.session || "")
    .filter(Boolean);

  const confluences = {};
  refs.fConfluenceList.querySelectorAll("[data-key]").forEach((row) => {
    const key = row.getAttribute("data-key");
    if (key) {
      confluences[key] = row.classList.contains("checked");
    }
  });

  let outcome = "";
  let pnl = null;
  let b1Outcome = "";
  let b1Pnl = null;
  let b2Outcome = "";
  let b2Pnl = null;
  let b2TargetRr = null;
  let b2StopMoved = false;

  if (twoBullets) {
    b1Outcome = refs.fB1Outcome.value || "";
    b2Outcome = refs.fB2Outcome.value || "";
    b1Pnl = parseNumber(refs.fB1Pnl.value);
    b2Pnl = parseNumber(refs.fB2Pnl.value);
    b2TargetRr = parseNumber(refs.fB2TargetRr.value);
    b2StopMoved = refs.fB2StopMoved.checked;
    outcome = !b1Outcome && !b2Outcome ? "" : b2Outcome || b1Outcome;
    const b1n = Number.isFinite(b1Pnl) ? b1Pnl : 0;
    const b2n = Number.isFinite(b2Pnl) ? b2Pnl : 0;
    pnl = round2(b1n + b2n);
  } else {
    outcome = state.formOutcome;
    pnl = getPnlWithSign(outcome, parseNumber(refs.fPnlInput.value));
  }

  const hasDetails = Boolean(state.formStrategy) || sessions.length > 0 || Object.values(confluences).some(Boolean) || Boolean(outcome);
  const needsReview = !hasDetails;

  const id = existing?.id || createId();
  const existingForId = state.trades.filter((trade) => trade.pair === pair && trade.id !== id);

  const trade = normalizeTrade({
    ...(existing || {}),
    id,
    trade_id: existing?.trade_id || generateTradeId(pair, existingForId),
    pair,
    direction,
    lot_size: twoBullets ? parseNumber(refs.fBulletLotSize.value) || lotSize : lotSize,
    entry_price: entryPrice,
    sl_price: parseNumber(refs.fSlPrice.value),
    tp_price: parseNumber(refs.fTpPrice.value),
    strategy: state.formStrategy || "",
    sessions,
    confluences: { ...emptyConfluences(), ...confluences },
    ai_inference: state.formAiResult || existing?.ai_inference || {},
    outcome,
    pnl: Number.isFinite(pnl) ? pnl : null,
    two_bullets: twoBullets,
    b1_outcome: b1Outcome,
    b1_pnl: b1Pnl,
    b2_outcome: b2Outcome,
    b2_pnl: b2Pnl,
    b2_target_rr: b2TargetRr,
    b2_stop_moved: b2StopMoved,
    note: refs.fNote.value.trim(),
    is_backtest: Boolean(state.settings.backtestMode),
    backtest_date: state.settings.backtestMode ? now.toISOString().slice(0, 10) : null,
    is_unmatched: false,
    before_image_id: beforeImageId,
    after_image_id: afterImageId,
    captured_at_utc: existing?.captured_at_utc || now.toISOString(),
    captured_at_local: existing?.captured_at_local || formatLocalDate(now),
    closed_at_utc: outcome ? existing?.closed_at_utc || now.toISOString() : null,
    status: outcome ? "closed" : "open",
    needs_review: needsReview,
    created_at: existing?.created_at || now.toISOString(),
    updated_at: now.toISOString(),
    edit_count: Number(existing?.edit_count || 0) + (existing ? 1 : 0),
  });

  if (existing) {
    const idx = state.trades.findIndex((row) => row.id === trade.id);
    if (idx >= 0) {
      state.trades[idx] = trade;
    } else {
      state.trades.unshift(trade);
    }
  } else {
    state.trades.unshift(trade);
  }

  await dbApi.putTrade(trade);
  await syncTradeToCloud(trade);

  showToast(existing ? "Trade updated" : "Trade saved");
  resetTradeForm();
  renderAll();
  setActiveScreen("log");
}

function resetTradeForm() {
  refs.tradeForm.reset();
  refs.fLotSize.value = String(state.settings.defaultLotSize || 0.01);

  state.formDirection = "";
  state.formOutcome = "";
  state.formStrategy = "";
  state.editingTradeId = null;
  state.formAiResult = null;

  refs.fDirectionToggle.querySelectorAll("button[data-value]").forEach((btn) => btn.classList.remove("active"));
  refs.fStrategyToggle.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active");
  });
  refs.fOutcomeGrid.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", (btn.dataset.outcome || "") === "");
  });
  handleFormOutcomeChange("");

  refs.fTwoBulletsToggle.checked = false;
  refs.fTwoBulletsPanel.hidden = true;
  refs.fSingleOutcomePanel.hidden = false;
  refs.fPnlWrap.hidden = true;
  refs.fSaveBtn.textContent = "Save Trade";
  refs.fCancelBtn.hidden = true;

  clearFormBeforeImage();
  renderFormConfluences();
  renderFormSessionPills();
}

function bindDetailAndLightbox() {
  refs.closeDetailBtn.addEventListener("click", () => {
    refs.tradeDetailModal.hidden = true;
  });

  refs.editFromDetailBtn.addEventListener("click", () => {
    refs.tradeDetailModal.hidden = true;
    const trade = state.trades.find((row) => row.id === state.lightboxSourceTradeId);
    if (trade) {
      openTradeForEdit(trade);
    }
  });

  refs.lightboxClose.addEventListener("click", () => {
    refs.lightbox.hidden = true;
  });
  refs.lightbox.addEventListener("click", (event) => {
    if (event.target === refs.lightbox) {
      refs.lightbox.hidden = true;
    }
  });
  refs.lightboxPrev.addEventListener("click", () => {
    if (!state.lightboxImages.length) {
      return;
    }
    state.lightboxIndex = (state.lightboxIndex - 1 + state.lightboxImages.length) % state.lightboxImages.length;
    refs.lightboxImage.src = state.lightboxImages[state.lightboxIndex];
  });
  refs.lightboxNext.addEventListener("click", () => {
    if (!state.lightboxImages.length) {
      return;
    }
    state.lightboxIndex = (state.lightboxIndex + 1) % state.lightboxImages.length;
    refs.lightboxImage.src = state.lightboxImages[state.lightboxIndex];
  });
}

function openTradeForEdit(trade) {
  state.editingTradeId = trade.id;
  state.formStrategy = trade.strategy || "";
  state.formDirection = trade.direction || "";
  state.formOutcome = trade.outcome || "";

  refs.fPair.value = trade.pair || "";
  refs.fPairNote.textContent = state.settings.pairNotes[trade.pair] || "";
  refs.fLotSize.value = String(trade.lot_size || 0.01);
  refs.fEntryPrice.value = trade.entry_price ? String(trade.entry_price) : "";
  refs.fSlPrice.value = trade.sl_price ? String(trade.sl_price) : "";
  refs.fTpPrice.value = trade.tp_price ? String(trade.tp_price) : "";
  refs.fNote.value = trade.note || "";

  refs.fDirectionToggle.querySelectorAll("button[data-value]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === state.formDirection);
  });

  refs.fStrategyToggle.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.strategy === state.formStrategy);
  });

  renderFormConfluences();
  const items = STRATEGY_CONFLUENCES[state.formStrategy] || [];
  items.forEach(({ key }) => {
    if (!trade.confluences?.[key]) {
      return;
    }
    const row = refs.fConfluenceList.querySelector(`[data-key=\"${key}\"]`);
    if (!row) {
      return;
    }
    row.classList.add("checked");
    const check = row.querySelector(".confluence-check");
    if (check) {
      check.classList.add("checked");
      check.textContent = "✓";
    }
  });

  renderFormSessionPills();
  refs.fSessionPills.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", trade.sessions.includes(btn.dataset.session || ""));
  });

  refs.fOutcomeGrid.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", (btn.dataset.outcome || "") === state.formOutcome);
  });
  handleFormOutcomeChange(state.formOutcome);
  if (trade.pnl != null) {
    refs.fPnlInput.value = String(Math.abs(trade.pnl));
  }

  refs.fTwoBulletsToggle.checked = Boolean(trade.two_bullets);
  refs.fTwoBulletsPanel.hidden = !trade.two_bullets;
  refs.fSingleOutcomePanel.hidden = Boolean(trade.two_bullets);
  if (trade.two_bullets) {
    refs.fBulletLotSize.value = String(trade.lot_size || 0.01);
    refs.fB1Outcome.value = trade.b1_outcome || "";
    refs.fB1Pnl.value = trade.b1_pnl ?? "";
    refs.fB2Outcome.value = trade.b2_outcome || "";
    refs.fB2Pnl.value = trade.b2_pnl ?? "";
    refs.fB2TargetRr.value = trade.b2_target_rr ?? "";
    refs.fB2StopMoved.checked = Boolean(trade.b2_stop_moved);
    updateFormTwoBullets();
  }

  refs.fSaveBtn.textContent = "Update Trade";
  refs.fCancelBtn.hidden = false;
  setActiveScreen("log");
}

function bindSettings() {
  refs.saveApiKeyBtn.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEYS.CLAUDE_KEY, refs.claudeApiKey.value.trim());
    showToast("Claude API key saved");
  });

  refs.testApiKeyBtn.addEventListener("click", async () => {
    const key = refs.claudeApiKey.value.trim();
    if (!key) {
      showToast("API key is empty");
      return;
    }
    const ok = await testClaudeApiKey(key);
    showToast(ok ? "Claude connection successful" : "Claude connection failed");
  });

  refs.addPairBtn.addEventListener("click", () => {
    const value = refs.newPairInput.value.trim().toUpperCase();
    if (!value || state.settings.pairs.includes(value)) {
      return;
    }
    state.settings.pairs.push(value);
    refs.newPairInput.value = "";
    saveSettings();
    renderAll();
  });

  refs.addSessionBtn.addEventListener("click", () => {
    const value = refs.newSessionInput.value.trim();
    if (!value || state.settings.sessions.includes(value)) {
      return;
    }
    state.settings.sessions.push(value);
    refs.newSessionInput.value = "";
    saveSettings();
    renderAll();
  });

  refs.saveDefaultsBtn.addEventListener("click", () => {
    const lot = parseNumber(refs.defaultLotInput.value);
    state.settings.defaultLotSize = Number.isFinite(lot) && lot > 0 ? lot : 0.01;
    state.settings.defaultStrategy = refs.defaultStrategySelect.value || "SMC";
    state.settings.defaultSession = refs.defaultSessionSelect.value || "London";
    state.settings.backtestMode = refs.backtestModeToggle.checked;
    saveSettings();
    renderAll();
    showToast("Defaults saved");
  });

  refs.exportLiveJsonBtn.addEventListener("click", () => exportJson((trade) => !trade.is_backtest, "edge-forge-live"));
  refs.exportBacktestJsonBtn.addEventListener("click", () => exportJson((trade) => trade.is_backtest, "edge-forge-backtest"));
  refs.exportAllJsonBtn.addEventListener("click", () => exportJson(() => true, "edge-forge-all"));
  refs.exportLiveCsvBtn.addEventListener("click", () => exportCsv((trade) => !trade.is_backtest, "edge-forge-live"));
  refs.exportBacktestCsvBtn.addEventListener("click", () => exportCsv((trade) => trade.is_backtest, "edge-forge-backtest"));
  refs.forceSyncBtn.addEventListener("click", forceSync);

  refs.sendMagicLinkBtn.addEventListener("click", signInWithMagicLink);
  refs.signOutBtn.addEventListener("click", signOut);
}

function bindBacktestBanner() {
  refs.exitBacktestBtn.addEventListener("click", () => {
    state.settings.backtestMode = false;
    saveSettings();
    renderAll();
  });
}

function bindSessionStatusIndicator() {
  const render = () => {
    const status = getSessionStatus();
    refs.sessionStatusPill.dataset.status = status.tone;
    refs.sessionStatusPill.innerHTML = `<span class="session-dot">●</span><span>${escapeHtml(status.label)}</span>`;
  };
  render();
  window.setInterval(render, 60000);
}

function getSessionStatus() {
  const now = new Date();
  const totalMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const inLondon = totalMin >= 480 && totalMin < 960;
  const inNY = totalMin >= 720 && totalMin < 1200;
  if (inLondon && inNY) {
    return { label: "London/NY Overlap", tone: "overlap" };
  }
  if (inLondon) {
    return { label: "London Open", tone: "active" };
  }
  if (inNY) {
    return { label: "NY Session", tone: "active" };
  }
  return { label: "Off-Session", tone: "off" };
}

async function loadTrades() {
  const rows = await dbApi.getAllTrades();
  state.trades = rows.map(normalizeTrade).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function renderAll() {
  renderPairSelects();
  renderFormSessionPills();
  renderHistory();
  renderSettings();
  refs.backtestBanner.hidden = !state.settings.backtestMode;
}

function renderPairSelects() {
  const pairOptions = ["<option value=''>Select pair</option>"]
    .concat(state.settings.pairs.map((pair) => `<option value=\"${escapeHtmlAttr(pair)}\">${escapeHtml(pair)}</option>`))
    .join("");
  refs.fPair.innerHTML = pairOptions;

  refs.filterPair.innerHTML = ["<option value='all'>All pairs</option>"]
    .concat(state.settings.pairs.map((pair) => `<option value=\"${escapeHtmlAttr(pair)}\">${escapeHtml(pair)}</option>`))
    .join("");
  refs.filterPair.value = state.filters.pair;
}

function renderHistory() {
  const rows = state.trades.filter((trade) => {
    if (state.filters.status !== "all" && trade.status !== state.filters.status) {
      return false;
    }
    if (state.filters.strategy !== "all" && trade.strategy !== state.filters.strategy) {
      return false;
    }
    if (state.filters.mode === "live" && trade.is_backtest) {
      return false;
    }
    if (state.filters.mode === "backtest" && !trade.is_backtest) {
      return false;
    }
    if (state.filters.pair !== "all" && trade.pair !== state.filters.pair) {
      return false;
    }
    return true;
  });

  if (!rows.length) {
    refs.historyList.innerHTML = "<div class='empty-state'><div class='empty-icon'>▦</div><h3>No trades found</h3><p>Log a trade to start building your ledger.</p></div>";
    return;
  }

  refs.historyList.innerHTML = rows
    .map((trade) => {
      const total = (STRATEGY_CONFLUENCES[trade.strategy] || []).length || 6;
      const present = (STRATEGY_CONFLUENCES[trade.strategy] || []).filter((item) => trade.confluences?.[item.key]).length;
      const sessions = trade.sessions.join("/") || "-";
      const pnlClass = !Number.isFinite(trade.pnl) || trade.status === "open" ? "open" : trade.pnl >= 0 ? "win" : "loss";
      return `<article class=\"history-card\" data-trade-id=\"${escapeHtmlAttr(trade.id)}\" data-outcome=\"${escapeHtmlAttr(trade.outcome || "") || "open"}\">\n        <div class=\"history-top\">\n          <div>\n            <div class=\"trade-id\">${escapeHtml(trade.trade_id)}</div>\n            <div class=\"pair-name\">${escapeHtml(trade.pair)} ${escapeHtml((trade.direction || "").toUpperCase())} <span class=\"price\">@ ${formatPrice(trade.entry_price)}</span></div>\n            <div class=\"hint\">${escapeHtml(trade.captured_at_local)}</div>\n          </div>\n          <div class=\"badge-row\">\n            <span class=\"badge ${trade.direction}\">${escapeHtml(trade.direction || "")}</span>\n            <span class=\"badge ${trade.outcome || "open"}\">${escapeHtml(outcomeLabel(trade.outcome))}</span>\n            ${trade.two_bullets ? "<span class='badge ghost'>2B</span>" : ""}\n            ${trade.is_backtest ? "<span class='badge ghost'>BT</span>" : ""}\n            ${trade.needs_review ? "<span class='badge incomplete'>Incomplete</span>" : ""}\n          </div>\n        </div>\n        <div class=\"history-bottom\">\n          <div class=\"hint\">${escapeHtml(trade.strategy)} · ${escapeHtml(sessions)} · ${present}/${total} confluences</div>\n          <div class=\"pnl-value ${pnlClass}\">${formatPnlForCard(trade)}</div>\n        </div>\n      </article>`;
    })
    .join("");

  refs.historyList.querySelectorAll(".history-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-trade-id") || "";
      void openTradeDetail(id);
    });
  });
}

async function openTradeDetail(id) {
  const trade = state.trades.find((row) => row.id === id);
  if (!trade) {
    return;
  }
  state.lightboxSourceTradeId = trade.id;

  const beforeBlob = trade.before_image_id ? await getImageBlob(trade.before_image_id) : null;
  const afterBlob = trade.after_image_id ? await getImageBlob(trade.after_image_id) : null;

  const beforeUrl = beforeBlob ? URL.createObjectURL(beforeBlob) : "";
  const afterUrl = afterBlob ? URL.createObjectURL(afterBlob) : "";
  state.lightboxImages = [beforeUrl, afterUrl].filter(Boolean);
  state.lightboxIndex = 0;

  refs.detailTradeId.textContent = `${trade.trade_id} - ${trade.pair}`;
  refs.detailBody.innerHTML = `<div class=\"detail-grid\">\n    <div><div class=\"detail-label\">Pair</div><div class=\"detail-value\">${escapeHtml(trade.pair)}</div></div>\n    <div><div class=\"detail-label\">Direction</div><div class=\"detail-value\">${escapeHtml(trade.direction)}</div></div>\n    <div><div class=\"detail-label\">Entry price (use this to find in MT5)</div><div class=\"detail-value\">${formatPrice(trade.entry_price)}</div></div>\n    <div><div class=\"detail-label\">Status</div><div class=\"detail-value\">${escapeHtml(trade.status)}</div></div>\n  </div>\n  <div><div class=\"detail-label\">Two Bullets</div><div class=\"detail-value\">${trade.two_bullets ? `B1: ${trade.b1_outcome || "Open"} ${trade.b1_pnl != null ? formatCurrency(trade.b1_pnl) : ""} | B2: ${trade.b2_outcome || "Open"} ${trade.b2_pnl != null ? formatCurrency(trade.b2_pnl) : ""} ${trade.b2_target_rr ? `(target 1:${trade.b2_target_rr})` : ""}` : "Off"}</div></div>\n  <div><div class=\"detail-label\">Note</div><div class=\"detail-value\">${escapeHtml(trade.note || "-")}</div></div>\n  <div class=\"detail-grid\">\n    ${beforeUrl ? `<div><div class=\"detail-label\">Before</div><img class=\"trade-image-thumb\" data-lightbox-index=\"0\" src=\"${beforeUrl}\" alt=\"Before\" /></div>` : ""}\n    ${afterUrl ? `<div><div class=\"detail-label\">After</div><img class=\"trade-image-thumb\" data-lightbox-index=\"1\" src=\"${afterUrl}\" alt=\"After\" /></div>` : ""}\n  </div>`;

  refs.detailBody.querySelectorAll("[data-lightbox-index]").forEach((img) => {
    img.addEventListener("click", () => {
      state.lightboxIndex = Number(img.getAttribute("data-lightbox-index") || "0");
      refs.lightboxImage.src = state.lightboxImages[state.lightboxIndex] || "";
      refs.lightbox.hidden = false;
    });
  });

  refs.tradeDetailModal.hidden = false;
}

function renderSettings() {
  refs.defaultLotInput.value = String(state.settings.defaultLotSize || 0.01);
  refs.defaultStrategySelect.value = state.settings.defaultStrategy || "SMC";
  refs.defaultSessionSelect.innerHTML = state.settings.sessions
    .map((session) => `<option value=\"${escapeHtmlAttr(session)}\">${escapeHtml(session)}</option>`)
    .join("");
  refs.defaultSessionSelect.value = state.settings.defaultSession || state.settings.sessions[0] || "";
  refs.backtestModeToggle.checked = Boolean(state.settings.backtestMode);

  refs.pairsList.innerHTML = state.settings.pairs
    .map((pair) => `<div class=\"kv-item\"><div><strong>${escapeHtml(pair)}</strong><div class=\"hint\">${escapeHtml(state.settings.pairNotes[pair] || "No note")}</div></div><button class=\"btn\" data-remove-pair=\"${escapeHtmlAttr(pair)}\" type=\"button\">Remove</button></div>`)
    .join("");

  refs.pairsList.querySelectorAll("[data-remove-pair]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pair = btn.getAttribute("data-remove-pair") || "";
      state.settings.pairs = state.settings.pairs.filter((item) => item !== pair);
      delete state.settings.pairNotes[pair];
      saveSettings();
      renderAll();
    });
  });

  refs.sessionsList.innerHTML = state.settings.sessions
    .map((session) => `<div class=\"kv-item\"><strong>${escapeHtml(session)}</strong><button class=\"btn\" data-remove-session=\"${escapeHtmlAttr(session)}\" type=\"button\">Remove</button></div>`)
    .join("");

  refs.sessionsList.querySelectorAll("[data-remove-session]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const session = btn.getAttribute("data-remove-session") || "";
      state.settings.sessions = state.settings.sessions.filter((item) => item !== session);
      if (state.settings.defaultSession === session) {
        state.settings.defaultSession = state.settings.sessions[0] || "";
      }
      saveSettings();
      renderAll();
    });
  });
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      pairs: Array.isArray(parsed.pairs) && parsed.pairs.length ? parsed.pairs : [...DEFAULT_SETTINGS.pairs],
      sessions: Array.isArray(parsed.sessions) && parsed.sessions.length ? parsed.sessions : [...DEFAULT_SETTINGS.sessions],
      pairNotes: parsed.pairNotes && typeof parsed.pairNotes === "object" ? parsed.pairNotes : { ...DEFAULT_PAIR_NOTES },
    };
  } catch (_error) {
    return { ...DEFAULT_SETTINGS, pairNotes: { ...DEFAULT_PAIR_NOTES } };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
}

function normalizeTrade(raw) {
  const now = new Date().toISOString();
  const trade = {
    id: raw?.id || createId(),
    trade_id: raw?.trade_id || "",
    pair: String(raw?.pair || "GBPUSD").toUpperCase(),
    direction: normalizeDirection(raw?.direction),
    lot_size: parseNumber(raw?.lot_size) || 0.01,
    entry_price: parseNumber(raw?.entry_price),
    sl_price: parseNumber(raw?.sl_price),
    tp_price: parseNumber(raw?.tp_price),
    strategy: normalizeStrategy(raw?.strategy),
    confluences: emptyConfluences(),
    ai_inference: raw?.ai_inference && typeof raw.ai_inference === "object" ? raw.ai_inference : {},
    outcome: normalizeOutcome(raw?.outcome),
    pnl: parseNumber(raw?.pnl),
    two_bullets: Boolean(raw?.two_bullets),
    b1_outcome: normalizeOutcome(raw?.b1_outcome),
    b1_pnl: parseNumber(raw?.b1_pnl),
    b2_outcome: normalizeOutcome(raw?.b2_outcome),
    b2_pnl: parseNumber(raw?.b2_pnl),
    b2_target_rr: parseNumber(raw?.b2_target_rr),
    b2_stop_moved: Boolean(raw?.b2_stop_moved),
    sessions: Array.isArray(raw?.sessions) ? raw.sessions.map((item) => String(item || "").trim()).filter(Boolean) : [],
    before_image_id: raw?.before_image_id || null,
    after_image_id: raw?.after_image_id || null,
    note: String(raw?.note || ""),
    is_backtest: Boolean(raw?.is_backtest),
    backtest_date: raw?.backtest_date || null,
    is_unmatched: false,
    captured_at_utc: raw?.captured_at_utc || now,
    captured_at_local: raw?.captured_at_local || formatLocalDate(now),
    closed_at_utc: raw?.closed_at_utc || null,
    status: raw?.status === "closed" ? "closed" : "open",
    needs_review: Boolean(raw?.needs_review),
    created_at: raw?.created_at || now,
    updated_at: raw?.updated_at || now,
    edit_count: Number(raw?.edit_count || 0),
  };

  if (raw?.confluences && typeof raw.confluences === "object") {
    trade.confluences = { ...trade.confluences, ...raw.confluences };
  } else if (Array.isArray(raw?.present_confluences)) {
    const migrated = emptyConfluences();
    raw.present_confluences.forEach((label) => {
      const key = LEGACY_CONFLUENCE_MAP[String(label || "").trim().toLowerCase()];
      if (key) {
        migrated[key] = true;
      }
    });
    trade.confluences = migrated;
  }

  return trade;
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // RFC4122-ish fallback for environments without crypto.randomUUID.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function normalizeDirection(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "buy" || normalized === "sell") {
    return normalized;
  }
  if (normalized === "long") {
    return "buy";
  }
  if (normalized === "short") {
    return "sell";
  }
  return "";
}

function normalizeOutcome(value) {
  const normalized = String(value || "").toLowerCase();
  if (["win", "loss", "breakeven"].includes(normalized)) {
    return normalized;
  }
  if (normalized === "full win") {
    return "win";
  }
  if (normalized === "full loss") {
    return "loss";
  }
  if (normalized === "partial + be") {
    return "breakeven";
  }
  return "";
}

function normalizeStrategy(value) {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "SMC" || normalized === "ICC") {
    return normalized;
  }
  return "";
}

function emptyConfluences() {
  return Object.fromEntries(ALL_CONFLUENCE_KEYS.map((key) => [key, false]));
}

function generateTradeId(pair, existingTrades) {
  const prefix = PAIR_PREFIX[pair] || String(pair || "").slice(0, 2).toUpperCase();
  const count = existingTrades.filter((trade) => String(trade.trade_id || "").startsWith(`${prefix}-`)).length;
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

function getPnlWithSign(outcome, absoluteValue) {
  if (outcome === "win") {
    return Math.abs(absoluteValue || 0);
  }
  if (outcome === "loss") {
    return -Math.abs(absoluteValue || 0);
  }
  if (outcome === "breakeven") {
    return 0;
  }
  return null;
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function formatPrice(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const abs = Math.abs(value);
  if (abs > 100) {
    return Number(value).toFixed(3);
  }
  return Number(value).toFixed(5);
}

function formatLocalDate(input) {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatPnlForCard(trade) {
  if (trade.status === "open" || !Number.isFinite(trade.pnl)) {
    return "OPEN";
  }
  return formatCurrency(trade.pnl);
}

function outcomeLabel(outcome) {
  if (outcome === "win") {
    return "WIN";
  }
  if (outcome === "loss") {
    return "LOSS";
  }
  if (outcome === "breakeven") {
    return "BE";
  }
  return "OPEN";
}

function showToast(message) {
  if (showToast.timer) {
    window.clearTimeout(showToast.timer);
  }
  refs.toast.textContent = String(message || "");
  refs.toast.classList.remove("show");
  window.requestAnimationFrame(() => refs.toast.classList.add("show"));
  showToast.timer = window.setTimeout(() => {
    refs.toast.classList.remove("show");
  }, 3800);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function createSupabaseClient() {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
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

async function setupAuth() {
  if (!supabaseClient) {
    refs.authState.textContent = "Supabase unavailable";
    return;
  }
  const { data } = await supabaseClient.auth.getSession();
  state.authUser = data?.session?.user || null;
  renderAuthState();
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    state.authUser = session?.user || null;
    renderAuthState();
  });
}

function renderAuthState() {
  refs.authState.textContent = state.authUser ? `Signed in as ${state.authUser.email || "user"}` : "Not signed in";
}

async function signInWithMagicLink() {
  if (!supabaseClient) {
    showToast("Supabase unavailable");
    return;
  }
  const email = refs.authEmail.value.trim();
  if (!email) {
    showToast("Enter email first");
    return;
  }
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  });
  if (error) {
    showToast("Failed to send magic link");
    return;
  }
  showToast("Magic link sent");
}

async function signOut() {
  if (!supabaseClient) {
    return;
  }
  await supabaseClient.auth.signOut();
  showToast("Signed out");
}

async function syncTradeToCloud(trade) {
  if (!supabaseClient || !state.authUser || !navigator.onLine) {
    return;
  }
  try {
    await syncImageToCloud(trade.before_image_id);
    await syncImageToCloud(trade.after_image_id);
    const payload = normalizeTrade(trade);
    const { error } = await supabaseClient
      .from(SUPABASE_TRADES_TABLE)
      .upsert(
        {
          id: payload.id,
          user_id: state.authUser.id,
          trade: payload,
          updated_at: payload.updated_at,
        },
        { onConflict: "id" }
      );
    if (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
}

async function fetchAllFromSupabase() {
  const { data, error } = await supabaseClient
    .from(SUPABASE_TRADES_TABLE)
    .select("trade")
    .eq("user_id", state.authUser.id)
    .order("updated_at", { ascending: false });
  if (error) {
    throw error;
  }
  return (data || []).map((row) => normalizeTrade(row.trade));
}

async function syncImageToCloud(imageId) {
  if (!imageId || !supabaseClient || !state.authUser) {
    return;
  }
  const image = await dbApi.getImage(imageId);
  if (!image?.blob || image.uploaded) {
    return;
  }
  const path = `${state.authUser.id}/${imageId}.png`;
  const { error } = await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).upload(path, image.blob, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) {
    console.error(error);
    return;
  }
  await dbApi.putImage({ ...image, uploaded: true });
}

async function getImageBlob(imageId) {
  if (!imageId) {
    return null;
  }
  const local = await dbApi.getImage(imageId);
  if (local?.blob) {
    return local.blob;
  }
  if (!supabaseClient || !state.authUser) {
    return null;
  }
  const path = `${state.authUser.id}/${imageId}.png`;
  const { data, error } = await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).download(path);
  if (error || !data) {
    return null;
  }
  await dbApi.putImage({ id: imageId, blob: data, uploaded: true, created_at: new Date().toISOString() });
  return data;
}

async function forceSync() {
  if (!supabaseClient || !state.authUser) {
    showToast("Sign in first to sync");
    return;
  }
  if (state.syncBusy) {
    showToast("Sync already in progress");
    return;
  }
  state.syncBusy = true;
  refs.syncState.textContent = "Syncing...";
  try {
    await dbApi.clearTrades();
    const cloudTrades = await fetchAllFromSupabase();
    await Promise.all(cloudTrades.map((trade) => dbApi.putTrade(trade)));
    state.trades = cloudTrades.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderAll();
    showToast(`Synced - ${cloudTrades.length} trades loaded`);
  } catch (error) {
    console.error(error);
    showToast("Force sync failed");
  } finally {
    state.syncBusy = false;
    refs.syncState.textContent = "Sync idle";
  }
}

function exportJson(predicate, name) {
  const rows = state.trades.filter(predicate);
  downloadFile(`${name}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(rows, null, 2), "application/json");
}

function exportCsv(predicate, name) {
  const confluenceCols = [
    "liquidity_sweep",
    "mss_body_close",
    "fvg_present",
    "htf_bias_aligned",
    "structural_liquidity",
    "clean_rto",
    "indication_leg",
    "correction_formed",
    "mss_15m",
    "overlap_window",
    "first_pullback",
  ];
  const cols = [
    "trade_id",
    "pair",
    "direction",
    "entry_price",
    "lot_size",
    "strategy",
    "sessions",
    "outcome",
    "pnl",
    "status",
    "is_backtest",
    "captured_at_utc",
    "closed_at_utc",
    "note",
    ...confluenceCols,
  ];

  const lines = [cols.join(",")];
  state.trades.filter(predicate).forEach((trade) => {
    const row = cols
      .map((col) => {
        let value = trade[col];
        if (col === "sessions") {
          value = (trade.sessions || []).join("|");
        } else if (col === "is_backtest") {
          value = trade.is_backtest ? "TRUE" : "FALSE";
        } else if (confluenceCols.includes(col)) {
          value = trade.confluences?.[col] ? "TRUE" : "FALSE";
        }
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
      })
      .join(",");
    lines.push(row);
  });

  downloadFile(`${name}-${new Date().toISOString().slice(0, 10)}.csv`, lines.join("\n"), "text/csv;charset=utf-8");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createDbApi() {
  let dbPromise;

  function openDb() {
    if (dbPromise) {
      return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(TRADE_STORE)) {
          db.createObjectStore(TRADE_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          db.createObjectStore(IMAGE_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("DB open failed"));
    });
    return dbPromise;
  }

  function toPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("DB request failed"));
    });
  }

  function done(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("DB tx failed"));
      tx.onabort = () => reject(tx.error || new Error("DB tx aborted"));
    });
  }

  return {
    async getAllTrades() {
      const db = await openDb();
      const tx = db.transaction(TRADE_STORE, "readonly");
      const rows = await toPromise(tx.objectStore(TRADE_STORE).getAll());
      await done(tx);
      return rows || [];
    },
    async putTrade(trade) {
      const db = await openDb();
      const tx = db.transaction(TRADE_STORE, "readwrite");
      tx.objectStore(TRADE_STORE).put(trade);
      await done(tx);
    },
    async clearTrades() {
      const db = await openDb();
      const tx = db.transaction(TRADE_STORE, "readwrite");
      tx.objectStore(TRADE_STORE).clear();
      await done(tx);
    },
    async saveImage(blob) {
      const id = createId();
      const db = await openDb();
      const tx = db.transaction(IMAGE_STORE, "readwrite");
      tx.objectStore(IMAGE_STORE).put({ id, blob, uploaded: false, created_at: new Date().toISOString() });
      await done(tx);
      return id;
    },
    async getImage(id) {
      const db = await openDb();
      const tx = db.transaction(IMAGE_STORE, "readonly");
      const row = await toPromise(tx.objectStore(IMAGE_STORE).get(id));
      await done(tx);
      return row || null;
    },
    async putImage(image) {
      const db = await openDb();
      const tx = db.transaction(IMAGE_STORE, "readwrite");
      tx.objectStore(IMAGE_STORE).put(image);
      await done(tx);
    },
  };
}

async function testClaudeApiKey(key) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16,
        messages: [{ role: "user", content: [{ type: "text", text: "Reply OK" }] }],
      }),
    });
    return response.ok;
  } catch (_error) {
    return false;
  }
}

async function inferConfluences(imageBlob, strategy) {
  const key = localStorage.getItem(STORAGE_KEYS.CLAUDE_KEY);
  if (!key) {
    return null;
  }

  const base64 = await blobToBase64(imageBlob);
  const mediaType = imageBlob.type || "image/png";

  const smcPrompt = `You are an SMC trading confluence detector analyzing a TradingView chart screenshot.
Identify which confluences are clearly visible. Return ONLY valid JSON, no other text.

Confluence definitions:
- liquidity_sweep: Price visibly spikes above/below a significant level then immediately reverses.
- mss_body_close: A candle BODY closes past the immediate prior swing point, proving displacement.
- fvg_present: A three-candle imbalance gap where candles do not overlap.
- htf_bias_aligned: Trend direction supports the visible trade direction.
- structural_liquidity: Obvious target level exists in trade direction.
- clean_rto: Price returns cleanly to FVG/OB zone without invalidating structure first.

Return this exact structure:
{
  "liquidity_sweep": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "mss_body_close": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "fvg_present": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "htf_bias_aligned": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "structural_liquidity": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "clean_rto": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "chart_data": {
    "pair": "e.g. XAUUSD or null",
    "direction": "buy or sell or null",
    "entry_price": null,
    "sl_price": null,
    "tp_price": null,
    "chart_date": "YYYY-MM-DD or null",
    "chart_time": "HH:MM or null"
  }
}`;

  const iccPrompt = `You are an ICC (Indication, Correction, Continuation) trading confluence detector analyzing a TradingView chart screenshot.
Identify which confluences are clearly visible. Return ONLY valid JSON, no other text.

Confluence definitions:
- indication_leg: Clear aggressive impulsive move establishing new high/low.
- correction_formed: Structured counter-trend pullback against indication leg.
- mss_15m: Candle body close past correction swing point signaling continuation.
- htf_bias_aligned: Higher timeframe trend supports trade direction.
- overlap_window: Chart timestamps indicate London/NY session.
- first_pullback: First clean pullback after MSS in continuation direction.

Return this exact structure:
{
  "indication_leg": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "correction_formed": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "mss_15m": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "htf_bias_aligned": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "overlap_window": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "first_pullback": {"present": false, "confidence": 0.0, "reason": "one sentence"},
  "chart_data": {
    "pair": "e.g. GBPUSD or null",
    "direction": "buy or sell or null",
    "entry_price": null,
    "sl_price": null,
    "tp_price": null,
    "chart_date": "YYYY-MM-DD or null",
    "chart_time": "HH:MM or null"
  }
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: strategy === "ICC" ? iccPrompt : smcPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || "";
    if (!text) {
      return null;
    }

    return JSON.parse(text.replaceAll("```json", "").replaceAll("```", "").trim());
  } catch (error) {
    console.error(error);
    return null;
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.split(",")[1] : value);
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to encode image"));
    reader.readAsDataURL(blob);
  });
}
