"""Rasterize the Weavatrix mark into a multi-size Windows .ico."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "weavatrix.ico"
SIZES = (16, 24, 32, 48, 64, 128, 256)


def render(size: int) -> Image.Image:
    scale = size / 100
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    def pt(x: float, y: float) -> tuple[float, float]:
        return x * scale, y * scale

    def length(value: float) -> int:
        return max(1, round(value * scale))

    draw.rounded_rectangle([pt(7, 7), pt(93, 93)], radius=16 * scale, fill="#0b0d14")
    width = length(8)
    draw.line([pt(30, 30), pt(72, 44)], fill="#7c6cff", width=width)
    draw.line([pt(30, 30), pt(44, 74)], fill="#40e0c8", width=width)

    def circle(cx: float, cy: float, radius: float, fill: str) -> None:
        draw.ellipse([pt(cx - radius, cy - radius), pt(cx + radius, cy + radius)], fill=fill)

    circle(30, 30, 13, "#7c6cff")
    circle(72, 44, 10, "#40e0c8")
    circle(44, 74, 10, "#f0f2f8")
    return image


def main() -> None:
    master = render(256)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    master.save(OUTPUT, format="ICO", sizes=[(size, size) for size in SIZES])
    print(OUTPUT)


if __name__ == "__main__":
    main()
