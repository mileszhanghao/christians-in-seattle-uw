# Christians in Seattle at UW

Static bilingual website for **Christians in Seattle at UW**, a student-led Registered Student Organization at the University of Washington.

- Planned primary production domain: `https://christiansinseattle.org`
- Protected secondary domain: `https://christiansinseattle.com`
- Source code: GitHub under the `mileszhanghao` account
- Hosting: Netlify
- Domain registration and DNS: Squarespace Domains

Squarespace manages the domains and DNS. Netlify hosts the static website. GitHub is the source of truth.

## Fall 2026 Sources

The September-October schedule in this revision was audited against:

1. `Christians in Seattle RSO Transition Guide.docx`
2. `UW Church Plan List.pdf`

The plan PDF is the authoritative source for event dates and the later follow-up on page 2 overrides earlier draft details. In particular:

- September 30 uses the updated time of 5:30-7:30 p.m.
- The HUB room remains unconfirmed because the document mentions both HUB 307 and HUB 337.
- The October 2 Friday event is marked cancelled and is not included in calendar downloads.

Do not publish a person's name, phone number, private email address, roster, signature, or internal planning material from either source document.

## Local Preview

From this directory:

```powershell
python -m http.server 4174
```

Open `http://127.0.0.1:4174/`. Do not open the HTML files directly because JavaScript modules require a local server.

## Shared Configuration

Edit `data/site.js` for organization-wide information:

```js
organizationName
organizationNameZh
instagramUsername
instagramUrl
instagramQrImage
discordInviteUrl
discordChannelUrl
campusGroupsUrl
churchWebsiteUrl
contactEmail
primaryDomain
secondaryDomain
lastUpdated
```

Leave an unconfirmed public link as an empty string. The site hides the corresponding button automatically. Never use a Discord channel URL as a public invite URL.

## Updating September-October Events

Edit `data/events.js`. Each event records its public description, date, time, building, room, audience, source, publication status, cancellation status, and confirmation flags.

Use confirmation flags literally:

```js
confirmed: {
  date: true,
  time: false,
  building: false,
  room: false,
  location: false,
}
```

Do not fill a missing time, room, contact, or registration link by guessing. If an event is cancelled, set `cancelled: true`; cancelled events remain visible for clarity but do not receive calendar links.

After editing event data:

1. Update `lastUpdated` in `data/site.js`.
2. Regenerate all calendar files:

   ```powershell
   node scripts/generate-calendar.mjs
   ```

3. Check English and Chinese.
4. Check the homepage and full schedule on desktop and mobile.
5. Test the Google Calendar link, one individual `.ics`, and the combined `.ics`.

## Calendar Rules

`scripts/generate-calendar.mjs` creates:

- one file per published event in `calendar/events/`
- `calendar/fall-2026-orientation.ics` with all published, non-cancelled events

Timed events use `America/Los_Angeles`. Events without a confirmed time temporarily use an all-day calendar entry, while the webpage and calendar description explicitly say the time is unconfirmed.

Every event contains:

- stable `UID`
- `DTSTAMP`
- `DTSTART`
- `DTEND`
- bilingual `SUMMARY` and `DESCRIPTION`
- `LOCATION`
- `URL`

The generator escapes commas, semicolons, backslashes, and line breaks and folds long calendar lines.

## Instagram

Instagram is configured in `data/site.js`. The current public profile is:

`https://www.instagram.com/christiansinseattleatuw`

The QR image is `images/qr/instagram-uw.png`. Replace that file with the new official QR image when the account changes, keep the same square aspect ratio, and test it with a phone before publishing.

The official logo is `images/branding/logo-cis-uw.jpg`, confirmed against the public Instagram profile.

## Discord

- `discordInviteUrl` is for prospective members and every **Join Discord** button.
- `discordChannelUrl` is only for people who already joined the server and have channel permission.

The previous invite `https://discord.gg/gWJFtXPt` was tested on July 24, 2026 and returned **Invite Invalid**. Until an administrator creates a new permanent, unlimited-use invite, keep `discordInviteUrl` empty. The website then shows “Discord invite being updated.”

## Images

Use:

```text
images/
  branding/
  qr/
  hero/
  events/
  gallery/
  announcements/
  social/
```

Use original, approved organization assets. Add useful alt text and optimize large files. Public Instagram posts can be content candidates, but photos with identifiable people still require publication approval. Do not use screenshots when an original file is available.

## GitHub and Netlify Workflow

1. Create a branch from `main`.
2. Make and test the content change.
3. Open a Pull Request.
4. Review the Netlify Deploy Preview.
5. Verify all links, both languages, mobile layout, and calendar data.
6. Merge to `main` only after approval.

Do not change Squarespace DNS until the Netlify preview has been approved. Preserve all existing MX, TXT, verification, and email records during any future domain migration.

## Security and Privacy

Never commit:

- student rosters
- private phone numbers or email addresses
- private Discord messages or prayer requests
- login credentials, passwords, or API tokens
- domain transfer codes
- old officer signatures or private constitution pages
