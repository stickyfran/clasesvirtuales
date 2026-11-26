(function () {
  "use strict";

  var API_URL = "https://francomusco.duckdns.org/_api/gemini/chat";
  var MODEL_ID = "gemini-4-hydrogen";
  var THINKING_MODE = "medium";
  var MAX_STORED_RESOLUTIONS = 20;
  var STORAGE_KEY = "gemini_help_resolutions_" + window.location.pathname;

  var resolutions = [];
  var activeIndex = -1;
  var isPanelOpen = false;
  var isLoading = false;
  var lastFile = null;

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

    var text = String(md).replace(/\r\n?/g, "\n");

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

  function resizeImageToBase64(file, maxDim, quality) {
    maxDim = maxDim || 1600;
    quality = quality || 0.85;
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
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

  function showLoading() {
    isLoading = true;
    activeIndex = -1;
    panelTitleEl.textContent = "";
    panelTimeEl.textContent = "";
    panelBodyEl.innerHTML =
      '<div class="gemini-loading">' +
      '<span class="gemini-spinner" aria-hidden="true"></span>' +
      "<span>Analizando imagen con Gemini Hydrogen...</span>" +
      "</div>";
    openPanel();
  }

  function showError(message) {
    isLoading = false;
    panelTitleEl.textContent = "";
    panelTimeEl.textContent = "";
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
    isLoading = false;
    activeIndex = idx;
    var item = resolutions[idx];
    panelTitleEl.textContent = "Resolución (" + (idx + 1) + ")";
    panelTimeEl.textContent = item.timeLabel ? " (" + item.timeLabel + ")" : "";
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

  async function processImageFile(file) {
    if (!file) return;
    lastFile = file;
    showLoading();

    try {
      var base64Data = await resizeImageToBase64(file, 1600, 0.85);
      var contextTitle = document.title || "Distribución de probabilidad";
      var prompt =
        "Resolvé paso a paso el ejercicio de la imagen (contexto: " +
        contextTitle +
        "). Escribí la explicación con formato claro usando títulos cortos (####), párrafos y listas simples (como una guía de ayuda académica), definiendo la variable aleatoria, la distribución, los parámetros y cada paso del cálculo en LaTeX ($...$ y $$...$$). Al final, incluí una sección **Respuesta:** con una oración completa en español que responda directamente a la pregunta del problema en palabras y contexto (no solo el valor numérico o la aritmética).";

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

      resolutions.push({
        reply: data.reply,
        timeLabel: formatTimeLabel(new Date()),
        title: contextTitle
      });
      saveResolutions();
      showResolution(resolutions.length - 1);
    } catch (err) {
      showError(err && err.message ? err.message : "No se pudo completar la consulta.");
    }
  }

  function buildUi() {
    var flipEl = document.getElementById("flip1");
    if (!flipEl) return;

    helpBtn = flipEl.querySelector("button");
    if (!helpBtn) return;

    // Remove legacy jQuery toggle handler on Help button
    if (window.jQuery) {
      window.jQuery(helpBtn).off("click");
    }
    var freshHelpBtn = helpBtn.cloneNode(true);
    helpBtn.parentNode.replaceChild(freshHelpBtn, helpBtn);
    helpBtn = freshHelpBtn;
    helpBtn.type = "button";
    helpBtn.setAttribute("aria-controls", "gemini-resolution-panel");
    helpBtn.setAttribute("aria-expanded", "false");
    helpBtn.title = "Sacar foto del ejercicio y resolver paso a paso con Gemini Hydrogen";

    solvedListEl = document.getElementById("help-solved-list");
    if (!solvedListEl) {
      solvedListEl = document.createElement("span");
      solvedListEl.id = "help-solved-list";
      flipEl.appendChild(solvedListEl);
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

    helpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isLoading) return;
      fileInputEl.click();
    });

    panelEl = document.createElement("div");
    panelEl.id = "gemini-resolution-panel";
    panelEl.setAttribute("role", "region");
    panelEl.setAttribute("aria-label", "Resolución paso a paso");
    panelEl.style.display = "none";

    var headerEl = document.createElement("div");
    headerEl.className = "gemini-panel-header";

    var headerLeft = document.createElement("div");
    headerLeft.className = "gemini-panel-meta";

    panelTitleEl = document.createElement("strong");
    panelTitleEl.className = "gemini-panel-title";

    panelTimeEl = document.createElement("span");
    panelTimeEl.className = "gemini-panel-time";

    headerLeft.appendChild(panelTitleEl);
    headerLeft.appendChild(panelTimeEl);

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "gemini-panel-close";
    closeBtn.textContent = "×";
    closeBtn.title = "Cerrar resolución";
    closeBtn.setAttribute("aria-label", "Cerrar resolución");
    closeBtn.addEventListener("click", closePanel);

    headerEl.appendChild(headerLeft);
    headerEl.appendChild(closeBtn);

    panelBodyEl = document.createElement("div");
    panelBodyEl.className = "gemini-panel-body";

    panelEl.appendChild(headerEl);
    panelEl.appendChild(panelBodyEl);

    var footerEl = document.querySelector("footer");
    if (footerEl && footerEl.parentNode) {
      footerEl.parentNode.insertBefore(panelEl, footerEl.nextSibling);
    } else {
      document.body.appendChild(panelEl);
    }

    resolutions = loadResolutions();
    renderSolvedButtons();
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
