import { siteData } from "../data/site.js";
import { applyDocumentLanguage, getLanguage, t, toggleLanguage } from "./i18n.js";

const navigation = [
  ["nav.home", "index.html"],
  ["nav.about", "about.html"],
  ["nav.schedule", "fall-schedule.html"],
  ["nav.events", "events.html"],
  ["nav.bibleStudy", "bible-study.html"],
  ["nav.newStudents", "new-students.html"],
  ["nav.resources", "resources.html"],
  ["nav.contact", "contact.html"],
];

function currentFile() {
  return location.pathname.split("/").pop() || "index.html";
}

function externalLink(url, label, className = "text-link") {
  if (!url) return "";
  return `<a class="${className}" href="${url}" target="_blank" rel="noopener noreferrer">${label}<span class="sr-only"> (${t("common.external")})</span></a>`;
}

function renderNavigation() {
  const target = document.querySelector("#site-header");
  if (!target) return;
  const links = navigation.map(([key, href]) => {
    const active = currentFile() === href;
    return `<a class="nav-link${active ? " is-active" : ""}" href="${href}"${active ? ' aria-current="page"' : ""}>${t(key)}</a>`;
  }).join("");

  target.innerHTML = `
    <header class="site-header">
      <div class="nav-shell">
        <a class="brand" href="index.html" aria-label="${siteData.organizationName}">
          <img class="brand-logo" src="${siteData.logoImage}" alt="">
          <span><strong>${getLanguage() === "zh" ? siteData.organizationNameZh : siteData.organizationName}</strong><small>${t("common.rso")}</small></span>
        </a>
        <button class="icon-button menu-button" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>
        <nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">${links}</nav>
        <button class="language-button" type="button">${getLanguage() === "en" ? "中文" : "EN"}</button>
      </div>
    </header>`;

  const menuButton = target.querySelector(".menu-button");
  const nav = target.querySelector(".primary-nav");
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  target.querySelector(".language-button").addEventListener("click", toggleLanguage);
}

function renderFooter() {
  const target = document.querySelector("#site-footer");
  if (!target) return;
  const social = [
    externalLink(siteData.instagramUrl, t("common.instagram")),
    externalLink(siteData.discordInviteUrl, t("common.discord")),
    externalLink(siteData.campusGroupsUrl, t("common.campusGroups")),
    externalLink(siteData.churchWebsiteUrl, t("common.church")),
  ].filter(Boolean).join("");

  target.innerHTML = `
    <footer class="site-footer">
      <div class="footer-shell">
        <div>
          <strong>${getLanguage() === "zh" ? siteData.organizationNameZh : siteData.organizationName}</strong>
          <p>${t("common.studentLed")}</p>
        </div>
        <nav class="footer-links" aria-label="Footer">${social}</nav>
        <p class="footer-date">${t("common.lastUpdated")}: <time datetime="${siteData.lastUpdated}">${siteData.lastUpdated}</time></p>
      </div>
    </footer>`;
}

function renderConfigLinks() {
  document.querySelectorAll("[data-link]").forEach((element) => {
    const url = siteData[element.dataset.link];
    if (!url) {
      element.hidden = true;
      return;
    }
    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  });
}

function renderConfiguredContent() {
  document.querySelectorAll("[data-public-name]").forEach((element) => {
    element.textContent = getLanguage() === "zh" ? siteData.organizationNameZh : siteData.organizationName;
  });
  document.querySelectorAll("[data-organization-type]").forEach((element) => {
    element.textContent = siteData.organizationType[getLanguage()];
  });
  document.querySelectorAll("[data-weekly-time]").forEach((element) => {
    element.textContent = siteData.weeklyTime[getLanguage()];
  });
  document.querySelectorAll("[data-weekly-location]").forEach((element) => {
    element.textContent = siteData.weeklyLocation[getLanguage()];
  });
  document.querySelectorAll("[data-contact-email]").forEach((element) => {
    if (!siteData.contactEmail) {
      element.hidden = true;
      return;
    }
    element.href = `mailto:${siteData.contactEmail}`;
    element.textContent = siteData.contactEmail;
  });
  document.querySelectorAll("[data-instagram-username]").forEach((element) => {
    element.textContent = `@${siteData.instagramUsername}`;
  });
  document.querySelectorAll("[data-config-image]").forEach((element) => {
    const source = siteData[element.dataset.configImage];
    if (!source) {
      element.hidden = true;
      return;
    }
    element.src = source;
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.alt = t(element.dataset.i18nAlt);
  });
  document.querySelectorAll("[data-discord-unavailable]").forEach((element) => {
    element.hidden = Boolean(siteData.discordInviteUrl);
  });
}

function installImageFallbacks() {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      const placeholder = document.createElement("div");
      placeholder.className = "media-placeholder";
      placeholder.setAttribute("role", "img");
      placeholder.setAttribute("aria-label", image.alt || "Image coming soon");
      image.replaceWith(placeholder);
    }, { once: true });
  });
}

function renderShared() {
  applyDocumentLanguage();
  renderNavigation();
  renderFooter();
  renderConfigLinks();
  renderConfiguredContent();
  installImageFallbacks();
}

document.addEventListener("DOMContentLoaded", renderShared);
window.addEventListener("languagechange", renderShared);

export { siteData, t, getLanguage, externalLink };
