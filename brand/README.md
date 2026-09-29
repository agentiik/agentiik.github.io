# Brand files

Square exports of the mark, for the places that ask for an image rather than a page:
an organisation avatar, a social card, a slide. The vector master is
[`../assets/logo.svg`](../assets/logo.svg), which the documents draw inline; these are
renderings of the same shape.

| File | Ground |
| --- | --- |
| `agentiik-mark-1024.png`, `agentiik-mark-512.png` | transparent, light accent |
| `agentiik-mark-1024-light.png`, `agentiik-mark-512-light.png` | paper `#FBFCF8` |
| `agentiik-mark-1024-dark.png` | `#111614`, dark accent |

`agentiik-mark-square.svg` is what they are rendered from: the mark on a 24-unit square,
which is the clear space the design system asks for: one bar, four units, on every side.
Regenerate at any size by rasterising at that size rather than by scaling a PNG:

```
magick -background none agentiik-mark-square.svg -resize 256x256 out.png
```

## Social cards

`social.html` draws the image a shared link shows, 1200 by 630 pixels, one card per page named after `#`: `home`, `docs` and `roadmap`. The pages name the rendered files in their `og:image`, so a card changed here is rendered again into `../assets/`, from the repository's root:

```
npx playwright screenshot --viewport-size "1200, 630" --wait-for-timeout 1000 "file://$PWD/brand/social.html#home" assets/social-home.png
npx playwright screenshot --viewport-size "1200, 630" --wait-for-timeout 1000 "file://$PWD/brand/social.html#docs" assets/social-docs.png
npx playwright screenshot --viewport-size "1200, 630" --wait-for-timeout 1000 "file://$PWD/brand/social.html#roadmap" assets/social-roadmap.png
```

The mark on the cards, like the one the home page draws, has its lighter bars mixed with the paper rather than made transparent, so nothing behind it shows through.
