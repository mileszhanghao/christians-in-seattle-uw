import { siteData } from "../data/site.js";
import { getLanguage, t } from "./i18n.js";

// --- Minimal CSV parser (handles quoted fields, commas, and newlines inside quotes) ---
function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const next = text[i + 1];

      if (inQuotes) {
              if (char === '"' && next === '"') {
                        field += '"';
                        i += 1;
              } else if (char === '"') {
                        inQuotes = false;
              } else {
                        field += char;
              }
      } else if (char === '"') {
              inQuotes = true;
      } else if (char === ",") {
              row.push(field);
              field = "";
      } else if (char === "\n" || char === "\r") {
              if (char === "\r" && next === "\n") i += 1;
              row.push(field);
              rows.push(row);
              row = [];
              field = "";
      } else {
              field += char;
      }
  }
    if (field.length || row.length) {
          row.push(field);
          rows.push(row);
    }
    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function rowsToRecords(rows) {
    if (!rows.length) return [];
    const headers = rows[0].map((h) => h.trim());
    return rows.slice(1).map((cells) => {
          const record = {};
          headers.forEach((header, index) => {
                  record[header] = (cells[index] || "").trim();
          });
          return record;
    });
}

// Escape any user-submitted text before inserting into the page — messages come
// from an anonymous public form, so this MUST happen before using innerHTML.
function escapeHtml(value) {
                         const div = document.createElement("div");
  div.textContent = value ?? "";
          return div.innerHTML;
}

function formatTimestamp(value) {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const locale = getLanguage() === "zh" ? "zh-CN" : "en-US";
    return parsed.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

function messageCard(record) {
                      const config = siteData.guestbook;
          const name = record[config.nameColumn] || "Anonymous";
                  const message = record[config.messageColumn] || "";
    const timestamp = record[config.timestampColumn] || "";

            const card = document.createElement("article");
      card.className = "info-card guestbook-entry";
      card.innerHTML = `
          <p class="activity-index">${escapeHtml(name)} · <time>${escapeHtml(formatTimestamp(timestamp))}</time></p>
          <p class="guestbook-message" translate="yes">${escapeHtml(message)}</p>
      `;

  return card;
}

async function loadMessages(listContainer) {
    const config = siteData.guestbook;
    if (!config.sheetCsvUrl || config.sheetCsvUrl.startsWith("REPLACE_WITH")) {
                             listContainer.innerHTML = `<p class="notice">Guestbook is not configured yet. Add your published Google Sheet CSV link to data/site.js.</p>`;
          return;
    }

  try {
        const response = await fetch(config.sheetCsvUrl, { cache: "no-store" });
        if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
        const text = await response.text();
        const records = rowsToRecords(parseCsv(text)).reverse(); // newest first

      listContainer.innerHTML = "";
        if (!records.length) {
                listContainer.innerHTML = `<p>${t("pages.guestbookEmpty")}</p>`;
                return;
        }
        records.forEach((record) => listContainer.appendChild(messageCard(record)));
  } catch (error) {
        console.error("Guestbook load failed:", error);
        listContainer.innerHTML = `<p class="notice">${t("pages.guestbookLoadError")}</p>`;
  }
}

export function bindGuestbook({ formFrame, listContainer }) {
    if (!listContainer) return;
    const config = siteData.guestbook;

  if (formFrame) {
        if (config.formEmbedUrl && !config.formEmbedUrl.startsWith("REPLACE_WITH")) {
                formFrame.src = config.formEmbedUrl;
        } else {
                formFrame.replaceWith(
                          Object.assign(document.createElement("p"), {
                                      className: "notice",
                                      textContent: "Guestbook form is not configured yet. Add your Google Form embed URL to data/site.js.",
                          })
                        );
        }
  }

  loadMessages(listContainer);
    const intervalId = window.setInterval(() => loadMessages(listContainer), config.refreshIntervalMs || 30000);
    window.addEventListener("languagechange", () => loadMessages(listContainer));
    window.addEventListener("beforeunload", () => window.clearInterval(intervalId));
}
