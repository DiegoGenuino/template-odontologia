"""Generate a 1200 x 630 Open Graph image from a client photo and brand settings.

Run from any directory: python scripts/generate_og.py
Settings live in src/config/og-image.json; command-line options can override one run.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path, PurePosixPath
from typing import Any

try:
    from PIL import Image, ImageColor, ImageDraw, ImageFont, ImageOps
except ImportError as error:
    raise SystemExit(
        "Pillow não está instalado. Execute: python -m pip install -r scripts/requirements-og.txt"
    ) from error


ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "src" / "config" / "og-image.json"
SIZE = (1200, 630)
MARGIN = 82
TEXT_WIDTH = 625


def project_path(value: str) -> Path:
    path = Path(value).expanduser()
    return path if path.is_absolute() else ROOT / path


def output_path(file_name: str) -> Path:
    relative = PurePosixPath(file_name.replace("\\", "/"))
    if relative.is_absolute() or ".." in relative.parts or not relative.name:
        raise ValueError("fileName deve ser um caminho dentro de public/, sem '..'.")
    return ROOT / "public" / Path(*relative.parts)


def font_path(value: str) -> str:
    if value:
        path = project_path(value)
        if not path.is_file():
            raise FileNotFoundError(f"Fonte não encontrada: {path}")
        return str(path)
    for candidate in (
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("/Library/Fonts/Arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ):
        if candidate.is_file():
            return str(candidate)
    return "DejaVuSans.ttf"


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            candidate = f"{current} {word}"
            if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def fit_name(draw: ImageDraw.ImageDraw, name: str, font_file: str) -> tuple[ImageFont.FreeTypeFont, list[str], int]:
    for size in range(116, 51, -2):
        font = ImageFont.truetype(font_file, size)
        lines = wrap_text(draw, name, font, TEXT_WIDTH)
        step = round(size * 1.05)
        if len(lines) <= 3 and len(lines) * step <= 306 and all(
            draw.textbbox((0, 0), line, font=font)[2] <= TEXT_WIDTH for line in lines
        ):
            return font, lines, step
    raise ValueError("Nome longo demais para o card. Encurte-o ou use quebras de linha no campo 'name'.")


def render(settings: dict[str, Any]) -> Path:
    background_path = project_path(settings["background"])
    if not background_path.is_file():
        raise FileNotFoundError(f"Imagem de fundo não encontrada: {background_path}")
    focal = settings.get("focalPoint", [0.5, 0.5])
    if len(focal) != 2 or any(not 0 <= float(value) <= 1 for value in focal):
        raise ValueError("focalPoint deve conter dois números entre 0 e 1.")
    side = settings.get("textSide", "left")
    if side not in ("left", "right"):
        raise ValueError("textSide deve ser 'left' ou 'right'.")

    with Image.open(background_path) as source:
        canvas = ImageOps.fit(
            source.convert("RGB"), SIZE, method=Image.Resampling.LANCZOS,
            centering=(float(focal[0]), float(focal[1])),
        ).convert("RGBA")

    overlay_rgb = ImageColor.getrgb(settings.get("overlayColor", "#071a22"))
    mask = Image.new("L", (SIZE[0], 1))
    mask.putdata([
        round(228 + (42 - 228) * (x / (SIZE[0] - 1) if side == "left" else 1 - x / (SIZE[0] - 1)))
        for x in range(SIZE[0])
    ])
    mask = mask.resize(SIZE)
    overlay = Image.new("RGBA", SIZE, (*overlay_rgb, 255))
    canvas.paste(overlay, (0, 0), mask)
    draw = ImageDraw.Draw(canvas)
    font_file = font_path(settings.get("font", ""))
    text_color = ImageColor.getrgb(settings.get("textColor", "#ffffff"))
    accent_color = ImageColor.getrgb(settings.get("accentColor", "#53c7fa"))
    text_x = MARGIN if side == "left" else SIZE[0] - MARGIN - TEXT_WIDTH

    draw.rounded_rectangle((text_x, 76, text_x + 62, 83), radius=3, fill=accent_color)
    eyebrow = settings.get("eyebrow", "").strip()
    if eyebrow:
        small_font = ImageFont.truetype(font_file, 24)
        draw.text((text_x, 110), eyebrow, font=small_font, fill=text_color, anchor="lt")

    name = settings["name"].strip()
    if not name:
        raise ValueError("Defina o nome do dentista ou da clínica em 'name'.")
    name_font, name_lines, step = fit_name(draw, name, font_file)
    name_top = 211 if len(name_lines) <= 2 else 189
    for index, line in enumerate(name_lines):
        draw.text((text_x, name_top + index * step), line, font=name_font, fill=text_color, anchor="lt")

    subtitle = settings.get("subtitle", "").strip()
    if subtitle:
        subtitle_font = ImageFont.truetype(font_file, 28)
        subtitle_lines = wrap_text(draw, subtitle, subtitle_font, TEXT_WIDTH)
        if len(subtitle_lines) > 2:
            raise ValueError("Subtítulo longo demais. Use até duas linhas.")
        subtitle_y = 543 - (len(subtitle_lines) - 1) * 33
        for index, line in enumerate(subtitle_lines):
            draw.text((text_x, subtitle_y + index * 33), line, font=subtitle_font, fill=text_color, anchor="lt")

    target = output_path(settings["fileName"])
    target.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(target, "PNG", optimize=True)
    return target


def main() -> None:
    parser = argparse.ArgumentParser(description="Gera uma imagem OG de 1200 x 630 px para o template.")
    parser.add_argument("--background", help="Foto ou arte criada para o cliente (arquivo local).")
    parser.add_argument("--name", help="Nome do profissional ou da clínica. Use \\n para uma quebra manual.")
    parser.add_argument("--font", help="Caminho para uma fonte .ttf ou .otf.")
    parser.add_argument("--eyebrow", help="Linha curta acima do nome.")
    parser.add_argument("--subtitle", help="Frase curta abaixo do nome.")
    args = parser.parse_args()
    settings = json.loads(CONFIG.read_text(encoding="utf-8"))
    for key in ("background", "name", "font", "eyebrow", "subtitle"):
        value = getattr(args, key)
        if value is not None:
            settings[key] = value.replace("\\n", "\n") if key == "name" else value
    try:
        target = render(settings)
    except (FileNotFoundError, ValueError, OSError) as error:
        parser.exit(2, f"Erro: {error}\n")
    print(f"Imagem OG gerada: {target} ({SIZE[0]} x {SIZE[1]} px)")


if __name__ == "__main__":
    main()
