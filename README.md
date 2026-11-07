# AC / EC

Auditory Comprehension and Expressive Communication skills for children up to 7:11, tested one at a time or side by side. Child accounts, dated visits, retesting, a language age estimate, a plain-language report, and a research workbook. Works offline once opened.

Sources for every added skill, and what is still unverified: [docs/SOURCES.md](docs/SOURCES.md).

## Use it

Open the app, add a child with a birth date, then choose AC, EC or both. Testing starts at the child's age band. A later visit becomes a new dated visit, and progress appears once there are two.

In the report, the **share** icon opens the PDF print window and the **sheet** icon sends de-identified data to the research workbook.

## Research workbook

The workbook stays on this computer:

```sh
node scripts/research-server.mjs
```

Open http://127.0.0.1:8877/ and keep that window running while sending data. The file is `research/ac-ec-research.xlsx`, kept out of git with `dataset.json`, so back up that folder yourself. If the server is not reachable, as on a phone, the sheet icon downloads a file instead. Add it on the computer with:

```sh
node scripts/research-server.mjs --import path/to/file.json
```

The workbook is rebuilt on every send, so edits inside it are replaced. Keep the minimum group size and bell curve labels in `research/settings.json`.

## After changing app files

```sh
node scripts/build-release.cjs
node --test tests/model.test.cjs
AC_PLAYWRIGHT=/path/to/node_modules/playwright node tests/browser.cjs
```

Links are one way: the main website links here, and this app must not link back.
