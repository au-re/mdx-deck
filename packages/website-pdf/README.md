# website-pdf

Save a URL as a PDF using [puppeteer-core](https://pptr.dev/).

You'll need to have a Chromium or Chrome executable available on your system. If you want Puppeteer to download its own browser, install the `puppeteer` package separately.

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
