# website-pdf

Save a URL as a PDF using [Puppeteer](https://pptr.dev/).

Puppeteer will download a compatible version of Chromium when installed.

```sh
npm i -D website-pdf
```

```sh
website-pdf http://example.com -o example.pdf
```

## Options

```
-o --out-file   Output filename
-w --width      Width in pixels
-h --height     Height in pixels
--no-sandbox    Disable puppeteer sandbox
```
