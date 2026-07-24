import { fallOrientationEvents } from "../data/events.js";
import { siteData } from "../data/site.js";
import { getLanguage, localized, t } from "./i18n.js";

const timezone = "America/Los_Angeles";

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

function compactDateTime(date, time) {
  return `${compactDate(date)}T${time.replace(":", "")}00`;
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
  return event.confirmed.time && event.startTime ? localized(event.time) : t("common.timeTbc");
}

function locationLabel(event) {
  if (event.confirmed.location && event.location) return localized(event.location);
  if (event.confirmed.building && event.building) {
    return `${localized(event.building)} — ${t("common.roomTbc")}`;
  }
  return t("common.locationTbc");
}

function hasUnconfirmedDetails(event) {
  return !event.confirmed.date || !event.confirmed.time || !event.confirmed.location;
}

function temporalStatus(event) {
  if (event.cancelled) return "cancelled";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDate(event.date);
  const end = parseDate(event.endDate || event.date);
  if (today >= start && today <= end) return "today";
  return end < today ? "past" : "upcoming";
}

function statusBadges(event) {
  const status = temporalStatus(event);
  if (status === "cancelled") {
    return `<span class="status-badge status-cancelled">${t("status.cancelled")}</span>`;
  }
  const confirmation = hasUnconfirmedDetails(event)
    ? `<span class="status-badge status-tbc">${t("status.tbc")}</span>`
    : "";
  return `<span class="status-badge status-${status}">${t(`status.${status}`)}</span>${confirmation}`;
}

function bilingualDescription(event) {
  const time = event.confirmed.time
    ? `${event.time.en} / ${event.time.zh}`
    : "Time to be confirmed / 时间待确认";
  const location = event.confirmed.location
    ? `${event.location.en} / ${event.location.zh}`
    : event.confirmed.building
      ? `${event.building.en} — room to be confirmed / ${event.building.zh} — 教室待确认`
      : "UW Seattle campus — room to be confirmed / UW 西雅图校区 — 教室待确认";
  const lines = [
    `${event.title.en} / ${event.title.zh}`,
    `${event.description.en} / ${event.description.zh}`,
    time,
    location,
    "Please check Instagram for the latest updates. / 请关注 Instagram 获取最新安排。",
  ];
  return lines.join("\n");
}

function googleCalendarUrl(event) {
  const dates = event.confirmed.time && event.startTime && event.endTime
    ? `${compactDateTime(event.date, event.startTime)}/${compactDateTime(event.date, event.endTime)}`
    : `${compactDate(event.date)}/${compactDate(addDays(event.endDate || event.date, 1))}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: localized(event.title),
    dates,
    ctz: timezone,
    details: bilingualDescription(event),
    location: locationLabel(event),
    sprop: `website:https://${siteData.primaryDomain}/fall-schedule.html`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function calendarActions(event) {
  if (event.cancelled) return "";
  return `
    <div class="calendar-actions">
      <a class="calendar-link" href="${googleCalendarUrl(event)}" target="_blank" rel="noopener noreferrer">${t("common.addGoogle")}</a>
      <a class="calendar-link" href="calendar/events/${event.id}.ics" download>${t("common.downloadIcs")}</a>
    </div>`;
}

export function eventCard(event, options = {}) {
  const nearestClass = options.isNext ? " is-next" : "";
  return `
    <article id="event-${event.id}" class="event-card${nearestClass}">
      <div class="event-card-top">
        <p class="event-date">${formatDate(event)}</p>
        <div class="status-row">${statusBadges(event)}</div>
      </div>
      <h3>${localized(event.title)}</h3>
      <p>${localized(event.description)}</p>
      <dl class="event-details">
        <div><dt>${t("common.time")}</dt><dd>${event.cancelled ? t("status.cancelled") : timeLabel(event)}</dd></div>
        <div><dt>${t("common.location")}</dt><dd>${event.cancelled ? t("common.notApplicable") : locationLabel(event)}</dd></div>
        <div><dt>${t("common.audience")}</dt><dd>${localized(event.audience)}</dd></div>
      </dl>
      ${calendarActions(event)}
    </article>`;
}

function nextEventId(events) {
  const upcoming = events
    .filter((event) => !event.cancelled && temporalStatus(event) === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0]?.id || "";
}

export function renderSchedule(container, events = fallOrientationEvents) {
  if (!container) return;
  const publicEvents = events.filter((event) => event.public !== false);
  const nextId = nextEventId(publicEvents);
  container.innerHTML = publicEvents
    .map((event) => eventCard(event, { isNext: event.id === nextId }))
    .join("");
}

export function splitEvents(events = fallOrientationEvents) {
  return events.reduce((groups, event) => {
    if (event.cancelled) {
      groups.cancelled.push(event);
      return groups;
    }
    const status = temporalStatus(event);
    const target = status === "past" ? "past" : "upcoming";
    groups[target].push(event);
    return groups;
  }, { upcoming: [], past: [], cancelled: [] });
}

export function bindSchedule(container, events = fallOrientationEvents) {
  const render = () => renderSchedule(container, events);
  render();
  window.addEventListener("languagechange", render);
}
