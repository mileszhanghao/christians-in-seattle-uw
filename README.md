# Christians in Seattle at UW

Static website for **Christians in Seattle at UW**, a student-led Registered Student Organization at the University of Washington.

- Primary production domain: `https://christiansinseattle.org`
- Future aliases: `www.christiansinseattle.org`, `christiansinseattle.com`, and `www.christiansinseattle.com`
- Source code: GitHub under the `mileszhanghao` account
- Hosting: Netlify
- Domain registration and DNS: Squarespace Domains

Squarespace manages the domain and DNS only. Netlify hosts the new static website. GitHub is the source of truth.

## Local Preview

From this directory:

```powershell
python -m http.server 4174
```

Open `http://127.0.0.1:4174/`.

Do not open the HTML files directly because JavaScript modules require a local server.

## Project Structure

```text
.
├── index.html
├── about.html
├── fall-schedule.html
├── events.html
├── bible-study.html
├── new-students.html
├── resources.html
├── contact.html
├── data/
│   ├── site.js
│   ├── events.js
│   └── i18n.js
├── js/
│   ├── app.js
│   ├── i18n.js
│   └── schedule.js
├── css/site.css
├── calendar/fall-2026-orientation.ics
└── images/
    ├── branding/
    ├── hero/
    ├── events/
    ├── gallery/
    └── announcements/
```

## Updating Shared Information

Edit `data/site.js` to update:

- Instagram
- Discord
- Campus Groups
- church website
- public contact email
- weekly time and location
- last updated date

Leave unconfirmed links and contact fields as empty strings. The website hides unavailable buttons automatically. Never add a private phone number or a student roster.

## Adding or Confirming Events

Edit `data/events.js`.

Each event has:

```js
confirmed: {
  date: true,
  time: false,
  location: false,
}
```

When a time or room is confirmed:

1. Add the bilingual `time` or `location` value.
2. Change the matching `confirmed` value to `true`.
3. Update `calendar/fall-2026-orientation.ics`.
4. Update `lastUpdated` in `data/site.js`.
5. Test both languages.

Events that have ended move automatically from Upcoming Events to Past Events.

## Calendar File

The `.ics` file supports Apple Calendar, Outlook, and other calendar applications. Every event must include:

- a stable `UID`
- `DTSTAMP`
- `SUMMARY`
- `DESCRIPTION`
- `LOCATION`
- `DTSTART` and `DTEND`

Use all-day dates while a specific time is unconfirmed. After a time is confirmed, use a timezone-aware date-time in `America/Los_Angeles`.

## Images

Use these directories:

```text
images/
  branding/
  hero/
  events/
  gallery/
  announcements/
```

Requirements:

- Use real, approved student-organization images.
- Add useful alt text.
- Do not fabricate event photos.
- Optimize large images before committing.
- Missing images are replaced by a neutral placeholder.

The current selected images were copied from the existing public `christiansinseattle.org` site and still require final confirmation before production launch.

## GitHub Workflow

1. Create a branch from `main`.
2. Make the content change.
3. Preview locally.
4. Open a Pull Request.
5. Review links, both languages, mobile layout, and calendar data.
6. Merge to `main` after approval.

Netlify should deploy automatically after a change is merged to `main`. Deploy Previews should be enabled for Pull Requests.

## Domain Migration

Do not change Squarespace DNS until the Netlify preview has been approved.

Before switching:

1. Export or record every existing DNS record.
2. Preserve all MX, TXT, verification, and email records.
3. Add the Netlify custom domain.
4. Change only the website records required by Netlify.
5. Make `.org` the primary domain.
6. Redirect `.com` and both `www` hosts to `.org`.
7. Keep the old website online until DNS propagation and SSL are verified.

## Security and Privacy

Never commit:

- student rosters
- private phone numbers
- private email addresses
- login credentials
- API tokens
- domain transfer codes
- old officer signatures or private constitution pages
