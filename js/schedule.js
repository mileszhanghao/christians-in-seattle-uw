import { fallOrientationEvents } from "../data/events.js";
import { getLanguage, localized, t } from "./i18n.js";

function parseDate(value) {
  return new Date(`${value}T00:00:00`);
}

function addDays(value, count) {
  const date = parseDate(value);
  date.setDate(date.getDate() + count);
  return date.toISOString().slice(0, 10);
}

function compactDate(value) {
  return value.replaceAll("-", "");
}

function formatDate(event) {
  const locale = getLanguage() === "zh" ? "zh-CN" : "en-US";
  const options = { weekday: "short", month: "short", day: "numeric" };
  const start = parseDate(event.date).toLocaleDateString(locale, options);
  if (!event.endDate || event.endDate === event.date) return start;
  const end = parseDate(event.endDate).toLocaleDateString(locale, options);
  return `${start} – ${end}`;
}

function timeLabel(event) {
  return event.confirmed.time && event.time ? localized(event.time) : t("common.timeTbc");
}

function locationLabel(event) {
  return event.confirmed.location && event.location ? localized(event.location) : t("common.locationTbc");
}

function googleCalendarUrl(event) {
  const end = addDays(event.endDate || event.date, 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: localized(event.title),
    dates: `${compactDate(event.date)}/${compactDate(end)}`,
    details: `${localized(event.description)} ${timeLabel(event)}`,
    location: locationLabel(event),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function eventCard(event) {
  return `
    <article class="event-card">
      <p class="event-date">${formatDate(event)}</p>
      <h3>${localized(event.title)}</h3>
      <p>${localized(event.description)}</p>
      <dl class="event-details">
        <div><dt>${getLanguage() === "zh" ? "时间" : "Time"}</dt><dd>${timeLabel(event)}</dd></div>
        <div><dt>${getLanguage() === "zh" ? "地点" : "Location"}</dt><dd>${locationLabel(event)}</dd></div>
      </dl>
      <a class="calendar-link" href="${googleCalendarUrl(event)}" target="_blank" rel="noopener noreferrer">${t("common.addGoogle")}</a>
    </article>`;
}

export function renderSchedule(container, events = fallOrientationEvents) {
  if (!container) return;
  container.innerHTML = events.map(eventCard).join("");
}

export function splitEvents(events = fallOrientationEvents) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return events.reduce((groups, event) => {
    const finalDate = parseDate(event.endDate || event.date);
    groups[finalDate < today ? "past" : "upcoming"].push(event);
    return groups;
  }, { upcoming: [], past: [] });
}

export function bindSchedule(container, events = fallOrientationEvents) {
  const render = () => renderSchedule(container, events);
  render();
  window.addEventListener("languagechange", render);
}
