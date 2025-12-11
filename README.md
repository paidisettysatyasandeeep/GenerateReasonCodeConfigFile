## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Mon Dec 08 2025 14:36:34 GMT+0530 (India Standard Time)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.18.0|
|**Generation Platform**<br>Visual Studio Code|
|**Template Used**<br>Basic|
|**Service Type**<br>None|
|**Service URL**<br>N/A|
|**Module Name**<br>downtimeconf|
|**Application Title**<br>Reason Code Configuration|
|**Namespace**<br>|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.143.0|
|**Enable Code Assist Libraries**<br>False|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>False|
# Downtime Configuration (Reason Code Configuration)

An SAPUI5 (SAP Fiori) single-page application to manage unscheduled/planned downtime reason codes for manufacturing sites. This project provides an interactive UI to confirm top-level reason data, add dynamic reason rows, delete rows, and export the dataset as a CSV file.

---

## Features

- Lock/unlock the top-level inputs (Site, Time Element, REASON_CODE1) via an `OK` confirmation.
- Add dynamic `REASON_CODE2` / `REASON_CODE3` rows and save multiple comma-separated `REASON_CODE3` values at once.
- Delete individual rows or clear all rows.
- Live, dynamic row count shown above the data table.
- Export to CSV with normalized `REASON_CODE1` (uppercased) and a filename containing the time element, reason code and current date.

## Why this project is useful

Many manufacturing systems require well-structured reason codes for downtime logging and reporting. This lightweight UI helps operations teams quickly build and export reason-code tables for ingestion into core systems while providing simple guardrails (locking, de-duplication, basic validation).

## Quick Start (Development)

Prerequisites:

- Node.js (LTS recommended)
- npm

Install and run locally:

```powershell
npm install
npm run start-noflp
```

Open the displayed URL in a browser to use the app.

## Screenshots

> Add screenshots here showing the UI in action. Example: table display, row add/delete, CSV export.

## Usage

1. Select a `Site` and a `Time Element`, then enter `REASON_CODE1` and click `OK`.
2. Use `Add REASON_CODE2 / REASON_CODE3` to add dynamic rows. Enter comma-separated `REASON_CODE3` values to create multiple rows at once.
3. Use the delete button in the Actions column to remove a single row, or `Clear All` to reset.
4. Click `Download (CSV)` to export the dataset. The exported CSV will uppercase `REASON_CODE1`.

## File structure

Key files and folders:

```
webapp/
    ├─ controller/UploadScreen.controller.js   # UI logic and CSV export
    ├─ view/UploadScreen.view.xml             # Main UI5 view
    ├─ css/style.css                          # Custom styles
    └─ test/                                  # Unit & integration tests (QUnit/OPA)
```

## Customization

- To change the heading font/size, edit `webapp/css/style.css`.
- To add more `Site` or `Time Element` options, update `UploadScreen.view.xml` or load them dynamically into the model.

## Export behavior

- CSV columns follow the template expected in `CSV_COLUMNS` in the controller.
- `REASON_CODE1` is normalized to uppercase during CSV mapping.

## Contributing

See `CONTRIBUTING.md` for contribution guidelines (pull requests, coding conventions, and testing).

## License

This repository contains an `MIT` license in `LICENSE`.

---

## GitHub Actions CI

A GitHub Actions workflow (`.github/workflows/ci.yml`) is configured to run on every push and pull request:

- Runs on Node.js 16.x and 18.x
- Installs dependencies and builds the project
- Runs any configured tests

See the workflow file for details.

## Issue & PR Templates

Use the GitHub issue templates (`.github/ISSUE_TEMPLATE/`) to report bugs or request features.
Pull requests should follow the checklist in `.github/pull_request_template.md`.

---