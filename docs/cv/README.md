# CV source

`cv.html` is the source of truth for `public/Malisetti-Obulamurthy-CV.pdf`.
The original was a flat PDF from a CV builder with no editable source, so it was
rebuilt from its extracted text layer as HTML that renders to the same layout.

To change the CV, edit `cv.html` and re-render:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=../../public/Malisetti-Obulamurthy-CV.pdf cv.html
```

Keep it to one page. A CSS grid container will not split across printed pages in
Chrome — if the content overflows, the whole two-column block jumps to page two
and leaves page one empty. If it spills, tighten the spacing tokens at the top of
the file rather than letting it break.
