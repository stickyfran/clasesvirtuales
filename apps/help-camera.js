(function () {
  "use strict";

  var API_URL = "https://francomusco.duckdns.org/_api/gemini/chat";
  var STATUS_URL = "https://francomusco.duckdns.org/_api/gemini/status";
  var CONVERSATIONS_URL = "https://francomusco.duckdns.org/_api/gemini/conversations?limit=10";
  var CONVERSATION_URL = "https://francomusco.duckdns.org/_api/gemini/conversation?id=";
  var MODEL_ID = "gemini-4-hydrogen";
  var THINKING_MODE = "off";
  var TEXT_OPACITY = "0.1";
  var MAX_STORED_RESOLUTIONS = 20;
  var STORAGE_KEY = "gemini_help_resolutions_" + window.location.pathname;
  var PENDING_KEY = "gemini_help_pending_" + window.location.pathname;

  var resolutions = [];
  var activeIndex = -1;
  var isPanelOpen = false;
  var isLoading = false;
  var isTextHidden = false;
  var lastFile = null;
  var loadingTimer = null;

  var helpBtn = null;
  var solvedListEl = null;
  var panelEl = null;
  var panelTitleEl = null;
  var panelTimeEl = null;
  var panelBodyEl = null;
  var fileInputEl = null;

  function loadResolutions() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_e) {
      return [];
    }
  }

  function saveResolutions() {
    try {
      if (resolutions.length > MAX_STORED_RESOLUTIONS) {
        resolutions = resolutions.slice(resolutions.length - MAX_STORED_RESOLUTIONS);
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolutions));
    } catch (_e) {
      // Ignore storage quota errors
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function markdownToHtml(md) {
    if (!md) return "";
    var placeholders = [];
    function hold(html) {
      var idx = placeholders.length;
      placeholders.push(html);
      return "\u0000PH" + idx + "\u0000";
    }

    var text = String(md)
      .replace(/\r\n?/g, "\n")
      .replace(/\[cite:\s*[\d,\s]+\]/gi, "");

    // Protect fenced code blocks first
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, function (_m, _lang, code) {
      return hold("<pre><code>" + escapeHtml(code.replace(/\n$/, "")) + "</code></pre>");
    });

    // Protect LaTeX display and inline expressions
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, function (m) {
      return hold('<div class="gemini-math-display">' + escapeHtml(m) + "</div>");
    });
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, function (m) {
      return hold('<div class="gemini-math-display">' + escapeHtml(m) + "</div>");
    });
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, function (m) {
      return hold(escapeHtml(m));
    });
    text = text.replace(/(^|[^\\])\$([^\s$](?:[^$\n]*?[^\s$])?)\$/g, function (_m, prefix, inner) {
      return prefix + hold("$" + escapeHtml(inner) + "$");
    });

    // Protect inline code
    text = text.replace(/`([^`\n]+)`/g, function (_m, code) {
      return hold("<code>" + escapeHtml(code) + "</code>");
    });

    // Escape remaining HTML
    text = escapeHtml(text);

    // Inline formatting
    function formatInline(s) {
      return s
        .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
        .replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
        .replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    }

    var lines = text.split("\n");
    var htmlParts = [];
    var inUl = false;
    var inOl = false;

    function closeLists() {
      if (inUl) {
        htmlParts.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        htmlParts.push("</ol>");
        inOl = false;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      if (!trimmed) {
        closeLists();
        continue;
      }

      if (/^#{1,4}\s+/.test(trimmed)) {
        closeLists();
        var levelMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
        var lvl = Math.min(4, levelMatch[1].length + 1);
        htmlParts.push("<h" + lvl + ">" + formatInline(levelMatch[2]) + "</h" + lvl + ">");
        continue;
      }

      if (/^[-*_]{3,}$/.test(trimmed)) {
        closeLists();
        htmlParts.push("<hr>");
        continue;
      }

      var bqMatch = trimmed.match(/^>\s?(.*)$/);
      if (bqMatch) {
        closeLists();
        htmlParts.push("<blockquote>" + formatInline(bqMatch[1]) + "</blockquote>");
        continue;
      }

      var ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
      if (ulMatch) {
        if (inOl) {
          htmlParts.push("</ol>");
          inOl = false;
        }
        if (!inUl) {
          htmlParts.push("<ul>");
          inUl = true;
        }
        htmlParts.push("<li>" + formatInline(ulMatch[1]) + "</li>");
        continue;
      }

      var olMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
      if (olMatch) {
        if (inUl) {
          htmlParts.push("</ul>");
          inUl = false;
        }
        if (!inOl) {
          htmlParts.push("<ol>");
          inOl = true;
        }
        htmlParts.push("<li>" + formatInline(olMatch[1]) + "</li>");
        continue;
      }

      closeLists();
      htmlParts.push("<p>" + formatInline(trimmed) + "</p>");
    }

    closeLists();

    var result = htmlParts.join("\n");
    result = result.replace(/\u0000PH(\d+)\u0000/g, function (_m, idx) {
      return placeholders[Number(idx)] || "";
    });
    return result;
  }

  function isHeicFile(file) {
    var type = (file.type || "").toLowerCase();
    var name = (file.name || "").toLowerCase();
    return (
      type.indexOf("heic") !== -1 ||
      type.indexOf("heif") !== -1 ||
      /\.hei[cf]$/.test(name)
    );
  }

  function loadHeic2Any() {
    if (typeof window.heic2any === "function") {
      return Promise.resolve(window.heic2any);
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
      script.onload = function () {
        if (typeof window.heic2any === "function") {
          resolve(window.heic2any);
        } else {
          reject(new Error("No se pudo inicializar el conversor HEIC."));
        }
      };
      script.onerror = function () {
        reject(new Error("No se pudo cargar el conversor HEIC."));
      };
      document.head.appendChild(script);
    });
  }

  function blobToCanvasBase64(blob, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () {
        try {
          var width = img.naturalWidth || img.width;
          var height = img.naturalHeight || img.height;
          if (!width || !height) {
            URL.revokeObjectURL(url);
            reject(new Error("No se pudo leer las dimensiones de la imagen."));
            return;
          }

          var scale = Math.min(1, maxDim / Math.max(width, height));
          var targetW = Math.max(1, Math.round(width * scale));
          var targetH = Math.max(1, Math.round(height * scale));

          var canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          var ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);

          var dataUrl = canvas.toDataURL("image/jpeg", quality);
          URL.revokeObjectURL(url);
          var commaIdx = dataUrl.indexOf(",");
          resolve(commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo cargar la foto seleccionada."));
      };
      img.src = url;
    });
  }

  function resizeImageToBase64(file, maxDim, quality) {
    maxDim = maxDim || 1600;
    quality = quality || 0.85;
    return blobToCanvasBase64(file, maxDim, quality).catch(function (err) {
      if (!isHeicFile(file)) {
        throw err;
      }
      return loadHeic2Any()
        .then(function (heic2any) {
          return heic2any({ blob: file, toType: "image/jpeg", quality: quality });
        })
        .then(function (converted) {
          var outBlob = Array.isArray(converted) ? converted[0] : converted;
          return blobToCanvasBase64(outBlob, maxDim, quality);
        });
    });
  }

  function typesetMath(el) {
    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
      window.MathJax.typesetPromise([el]).catch(function () {});
    }
  }

  function renderSolvedButtons() {
    if (!solvedListEl) return;
    solvedListEl.innerHTML = "";
    for (var i = 0; i < resolutions.length; i++) {
      (function (idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "help-solved-btn" + (isPanelOpen && activeIndex === idx ? " active" : "");
        btn.textContent = "(" + (idx + 1) + ")";
        btn.title = "Ver resolución (" + (idx + 1) + ")";
        btn.setAttribute("aria-pressed", String(isPanelOpen && activeIndex === idx));
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (isPanelOpen && activeIndex === idx && !isLoading) {
            closePanel();
          } else {
            showResolution(idx);
          }
        });
        solvedListEl.appendChild(btn);
      })(i);
    }
  }

  function openPanel() {
    isPanelOpen = true;
    panelEl.style.display = "block";
    if (helpBtn) {
      helpBtn.setAttribute("aria-expanded", "true");
    }
    renderSolvedButtons();
  }

  function closePanel() {
    isPanelOpen = false;
    panelEl.style.display = "none";
    if (helpBtn) {
      helpBtn.setAttribute("aria-expanded", "false");
    }
    renderSolvedButtons();
  }

  function clearLoadingTimer() {
    if (loadingTimer) {
      clearInterval(loadingTimer);
      loadingTimer = null;
    }
  }

  function showLoading(startMs) {
    clearLoadingTimer();
    isLoading = true;
    activeIndex = -1;
    isTextHidden = false;
    var baseStart = startMs || Date.now();
    panelBodyEl.style.opacity = "0.85";
    function loadingMessage(secs) {
      if (secs > 60) {
        return "Reintentando conexión por demora de red... (" + secs + "s)";
      }
      if (secs > 25) {
        return "Procesando resolución paso a paso en el servidor... (" + secs + "s)";
      }
      return "Analizando imagen con Gemini Hydrogen... (" + secs + "s)";
    }
    var initialSecs = Math.max(0, Math.floor((Date.now() - baseStart) / 1000));
    panelBodyEl.innerHTML =
      '<div class="gemini-loading">' +
      '<span class="gemini-spinner" aria-hidden="true"></span>' +
      '<span id="gemini-loading-text">' + loadingMessage(initialSecs) + "</span>" +
      "</div>";
    openPanel();
    loadingTimer = setInterval(function () {
      var el = document.getElementById("gemini-loading-text");
      if (!el) return;
      var secs = Math.max(0, Math.floor((Date.now() - baseStart) / 1000));
      el.textContent = loadingMessage(secs);
    }, 1000);
  }

  function showError(message) {
    clearLoadingTimer();
    isLoading = false;
    isTextHidden = false;
    panelBodyEl.style.opacity = "0.9";
    panelBodyEl.innerHTML =
      '<div class="gemini-error">' +
      "<p><strong>Error:</strong> " + escapeHtml(message) + "</p>" +
      (lastFile
        ? '<button type="button" class="gemini-retry-btn">Reintentar</button>'
        : "") +
      "</div>";
    var retryBtn = panelBodyEl.querySelector(".gemini-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        if (lastFile) {
          processImageFile(lastFile);
        }
      });
    }
    openPanel();
  }

  function showResolution(idx) {
    if (idx < 0 || idx >= resolutions.length) return;
    clearLoadingTimer();
    isLoading = false;
    isTextHidden = false;
    panelBodyEl.style.opacity = TEXT_OPACITY;
    activeIndex = idx;
    var item = resolutions[idx];
    panelBodyEl.innerHTML = markdownToHtml(item.reply);
    openPanel();
    typesetMath(panelBodyEl);
  }

  function formatTimeLabel(date) {
    try {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (_e) {
      return "";
    }
  }

  function isRefusalReply(text) {
    if (!text) return false;
    var trimmed = String(text).trim();
    if (trimmed.length > 260) return false;
    return /solo soy (un modelo de lenguaje|una ia)|no puedo ayudarte con eso/i.test(trimmed);
  }

  async function sendImageQuery(prompt, base64Data) {
    var response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: prompt,
        files: [
          {
            name: "ejercicio.jpg",
            mimeType: "image/jpeg",
            data: base64Data
          }
        ],
        temporary: false,
        model: MODEL_ID,
        thinking_mode: THINKING_MODE
      })
    });

    var rawText = await response.text();
    var data = null;
    try {
      data = JSON.parse(rawText);
    } catch (_parseErr) {
      data = null;
    }

    if (!response.ok || !data || !data.ok || !data.reply) {
      var errMsg =
        (data && data.error) ||
        "El servidor respondió con estado HTTP " + response.status + ".";
      throw new Error(errMsg);
    }

    return data.reply;
  }

  async function processImageFile(file) {
    if (!file) return;
    lastFile = file;
    var startedAt = Date.now();
    savePendingJob(startedAt);
    showLoading(startedAt);

    try {
      var base64Data = await resizeImageToBase64(file, 1280, 0.82);
      var contextTitle = document.title || "Estadística";
      var prompt =
        "Transcribí los enunciados de esta guía de ejercicios de probabilidad y estadística y explicá paso a paso cómo resolver cada uno con fines de estudio. Definí la variable aleatoria, la distribución o estadístico, los parámetros/datos y cada paso del cálculo en LaTeX ($...$ y $$...$$). Al final de cada ejercicio, agregá una sección **Respuesta:** con una oración completa en español que responda directamente a la pregunta en palabras y contexto (no solo el valor numérico o la aritmética).";

      var reply = await sendImageQuery(prompt, base64Data);
      if (isRefusalReply(reply)) {
        var fallbackPrompt =
          "Transcribí el texto matemático que aparece en esta imagen y desarrollá los cálculos paso a paso en LaTeX ($...$ y $$...$$). Al final, incluí una sección **Respuesta:** con una oración completa en español.";
        reply = await sendImageQuery(fallbackPrompt, base64Data);
      }

      resolutions.push({
        reply: reply,
        timeLabel: formatTimeLabel(new Date()),
        title: contextTitle
      });
      saveResolutions();
      clearPendingJob();
      showResolution(resolutions.length - 1);
    } catch (err) {
      var recovered = await pollPendingJob(startedAt, 90000);
      if (!recovered) {
        clearPendingJob();
        showError(err && err.message ? err.message : "No se pudo completar la consulta.");
      }
    }
  }

  function savePendingJob(startedAt) {
    try {
      window.localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ startedAt: startedAt || Date.now() })
      );
    } catch (_e) {}
  }

  function clearPendingJob() {
    try {
      window.localStorage.removeItem(PENDING_KEY);
    } catch (_e) {}
  }

  async function tryFetchCompletedReply(startedAt) {
    var listResp = await fetch(CONVERSATIONS_URL);
    if (!listResp.ok) return false;
    var listData = await listResp.json();
    if (!listData || !listData.ok || !Array.isArray(listData.conversations)) return false;

    var match = null;
    for (var i = 0; i < listData.conversations.length; i++) {
      var c = listData.conversations[i];
      var ts = Date.parse(c.createdAt || c.lastActive || "");
      if (!isNaN(ts) && ts >= startedAt - 15000) {
        match = c;
        break;
      }
    }
    if (!match || !match.id) return false;

    var detailResp = await fetch(CONVERSATION_URL + encodeURIComponent(match.id));
    if (!detailResp.ok) return false;
    var detail = await detailResp.json();
    if (!detail || !detail.ok || !Array.isArray(detail.messages)) return false;

    for (var j = detail.messages.length - 1; j >= 0; j--) {
      if (detail.messages[j].role === "assistant" && detail.messages[j].content) {
        resolutions.push({
          reply: detail.messages[j].content,
          timeLabel: formatTimeLabel(new Date()),
          title: document.title || "Estadística"
        });
        saveResolutions();
        clearPendingJob();
        showResolution(resolutions.length - 1);
        return true;
      }
    }
    return false;
  }

  async function hasActiveServerJob() {
    try {
      var stResp = await fetch(STATUS_URL);
      if (!stResp.ok) return false;
      var st = await stResp.json();
      return Boolean(st && Array.isArray(st.active_jobs) && st.active_jobs.length > 0);
    } catch (_e) {
      return false;
    }
  }

  function sleepMs(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function pollPendingJob(startedAt, maxWaitMs) {
    var deadline = Date.now() + (maxWaitMs || 110000);
    while (Date.now() < deadline) {
      try {
        if (await tryFetchCompletedReply(startedAt)) {
          return true;
        }
        var active = await hasActiveServerJob();
        if (!active) {
          // Give one extra second for conversation persistence then re-check once
          await sleepMs(1200);
          return await tryFetchCompletedReply(startedAt);
        }
      } catch (_e) {
        // Ignore transient poll errors
      }
      await sleepMs(3000);
    }
    return false;
  }

  async function recoverPendingJobIfAny() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(PENDING_KEY);
    } catch (_e) {
      return;
    }
    if (!raw) return;

    var pending = null;
    try {
      pending = JSON.parse(raw);
    } catch (_e) {
      clearPendingJob();
      return;
    }

    if (!pending || !pending.startedAt || Date.now() - pending.startedAt > 15 * 60 * 1000) {
      clearPendingJob();
      return;
    }

    try {
      if (await tryFetchCompletedReply(pending.startedAt)) {
        return;
      }
      if (await hasActiveServerJob()) {
        showLoading(pending.startedAt);
        var ok = await pollPendingJob(pending.startedAt, 120000);
        if (!ok) {
          clearPendingJob();
          showError("El servidor tardó demasiado en responder. Tocá el nombre para sacar la foto de nuevo.");
        }
      } else {
        clearPendingJob();
      }
    } catch (_e) {
      // Ignore recovery errors
    }
  }

  function buildUi() {
    var footerRight = document.getElementById("footerright");
    if (!footerRight) return;

    var smallP = footerRight.querySelector("p.small") || footerRight;
    var triggerEl = document.createElement("span");
    triggerEl.id = "gemini-camera-trigger";
    triggerEl.setAttribute("role", "button");
    triggerEl.setAttribute("tabindex", "0");
    triggerEl.setAttribute("aria-controls", "gemini-resolution-panel");
    triggerEl.setAttribute("aria-expanded", "false");
    triggerEl.title = "Sacar foto del ejercicio y resolver paso a paso con Gemini Hydrogen";

    // Move existing text nodes (e.g., ©2026 Matt Bognar, PhD) into the clickable trigger
    var existingNodes = Array.prototype.slice.call(smallP.childNodes);
    for (var i = 0; i < existingNodes.length; i++) {
      var node = existingNodes[i];
      if (node.nodeName !== "BR") {
        triggerEl.appendChild(node);
      }
    }
    smallP.innerHTML = "";
    smallP.appendChild(triggerEl);

    helpBtn = triggerEl;

    solvedListEl = document.getElementById("help-solved-list");
    if (!solvedListEl) {
      solvedListEl = document.createElement("span");
      solvedListEl.id = "help-solved-list";
      smallP.appendChild(solvedListEl);
    }

    fileInputEl = document.createElement("input");
    fileInputEl.type = "file";
    fileInputEl.accept = "image/*";
    fileInputEl.setAttribute("capture", "environment");
    fileInputEl.style.display = "none";
    document.body.appendChild(fileInputEl);

    fileInputEl.addEventListener("change", function () {
      var file = fileInputEl.files && fileInputEl.files[0];
      fileInputEl.value = "";
      if (file) {
        processImageFile(file);
      }
    });

    function openCamera(e) {
      e.preventDefault();
      e.stopPropagation();
      if (isLoading) return;
      fileInputEl.click();
    }

    helpBtn.addEventListener("click", openCamera);
    helpBtn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        openCamera(e);
      }
    });

    panelEl = document.createElement("div");
    panelEl.id = "gemini-resolution-panel";
    panelEl.setAttribute("role", "region");
    panelEl.setAttribute("aria-label", "Resolución paso a paso");
    panelEl.style.display = "none";

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "gemini-panel-close";
    closeBtn.textContent = "×";
    closeBtn.title = "Cerrar";
    closeBtn.setAttribute("aria-label", "Cerrar");
    closeBtn.addEventListener("click", closePanel);

    var headerEl = document.createElement("div");
    headerEl.className = "gemini-panel-header";
    headerEl.appendChild(closeBtn);

    panelBodyEl = document.createElement("div");
    panelBodyEl.className = "gemini-panel-body";

    panelEl.appendChild(headerEl);
    panelEl.appendChild(panelBodyEl);

    panelEl.addEventListener("click", function (e) {
      if (isLoading) return;
      if (e.target && e.target.closest && e.target.closest("button")) return;
      isTextHidden = !isTextHidden;
      panelBodyEl.style.opacity = isTextHidden ? "0" : TEXT_OPACITY;
    });

    var footerEl = document.querySelector("footer");
    if (footerEl && footerEl.parentNode) {
      footerEl.parentNode.insertBefore(panelEl, footerEl.nextSibling);
    } else {
      document.body.appendChild(panelEl);
    }

    resolutions = loadResolutions();
    renderSolvedButtons();
    recoverPendingJobIfAny();
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        setTimeout(buildUi, 50);
      });
    } else {
      setTimeout(buildUi, 50);
    }
  }

  init();
})();
