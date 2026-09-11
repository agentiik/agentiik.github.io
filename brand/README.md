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
