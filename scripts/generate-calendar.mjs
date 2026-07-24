import { mkdir, writeFile } from "node:fs/promises";
import { fallOrientationEvents } from "../data/events.js";
import { siteData } from "../data/site.js";

const outputDirectory = new URL("../calendar/events/", import.meta.url);
const combinedFile = new URL("../calendar/fall-2026-orientation.ics", import.meta.url);
const dtstamp = "20260724T170000Z";

function escapeIcs(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

function foldLine(line) {
  const encoder = new TextEncoder();
  const folded = [];
  let current = "";
  let limit = 75;
  for (const character of line) {
    const candidate = current + character;
    if (encoder.encode(candidate).length > limit) {
      const trailingSpaces = current.match(/ +$/)?.[0] || "";
      folded.push(trailingSpaces ? current.slice(0, -trailingSpaces.length) : current);
      current = ` ${trailingSpaces}${character}`;
      limit = 75;
    } else {
      current = candidate;
    }
  }
  folded.push(current);
  return folded.join("\r\n");
}

function compactDate(value) {
  return value.replaceAll("-", "");
}

function compactDateTime(date, time) {
  return `${compactDate(date)}T${time.replace(":", "")}00`;
}

function addDays(value, count) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

function timeText(event) {
  if (!event.confirmed.time) return "Time to be confirmed / 时间待确认";
  return `${event.time.en} / ${event.time.zh}`;
}

function locationText(event) {
  if (event.confirmed.location) return `${event.location.en} / ${event.location.zh}`;
  if (event.confirmed.building) {
    return `${event.building.en} - room to be confirmed / ${event.building.zh} - 教室待确认`;
  }
  return "UW Seattle campus - room to be confirmed / UW 西雅图校区 - 教室待确认";
}

function eventLines(event) {
  const description = [
    `${event.title.en} / ${event.title.zh}`,
    `${event.description.en} / ${event.description.zh}`,
    timeText(event),
    locationText(event),
    `Source: ${event.source}`,
  ].join("\n");
  const url = `https://${siteData.primaryDomain}/fall-schedule.html#event-${event.id}`;
  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.id}-${compactDate(event.date)}@${siteData.primaryDomain}`,
    `DTSTAMP:${dtstamp}`,
  ];

  if (event.confirmed.time && event.startTime && event.endTime) {
    lines.push(
      `DTSTART;TZID=America/Los_Angeles:${compactDateTime(event.date, event.startTime)}`,
      `DTEND;TZID=America/Los_Angeles:${compactDateTime(event.date, event.endTime)}`,
    );
  } else {
    lines.push(
      `DTSTART;VALUE=DATE:${compactDate(event.date)}`,
      `DTEND;VALUE=DATE:${compactDate(addDays(event.endDate || event.date, 1))}`,
    );
  }

  lines.push(
    `SUMMARY:${escapeIcs(`${event.title.en} / ${event.title.zh}`)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(locationText(event))}`,
    `URL:${url}`,
    "END:VEVENT",
  );
  return lines;
}

function calendar(events, name) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Christians in Seattle at UW//Fall 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(name)}`,
    "X-WR-TIMEZONE:America/Los_Angeles",
    ...events.flatMap(eventLines),
    "END:VCALENDAR",
  ];
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

const publishedEvents = fallOrientationEvents.filter((event) => event.public && !event.cancelled);

await mkdir(outputDirectory, { recursive: true });
await Promise.all(
  publishedEvents.map((event) =>
    writeFile(new URL(`${event.id}.ics`, outputDirectory), calendar([event], event.title.en), "utf8"),
  ),
);
await writeFile(
  combinedFile,
  calendar(publishedEvents, "Christians in Seattle at UW - Fall 2026"),
  "utf8",
);

console.log(`Generated ${publishedEvents.length} individual calendars and one combined calendar.`);
