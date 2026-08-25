"""
Generates assets/og-image.png — the 1200x630 card shown when the portfolio
URL is shared on LinkedIn, Slack, WhatsApp, or X.

Design matches the site: Georgia serif for the name, Arial for everything
else, and the dark palette from styles.css (--paper #14161a, --ink #e9e6e1,
--accent #8fb4e0).

Re-run after editing:  python tools/make_og_image.py
"""

from PIL import Image, ImageDraw, ImageFont

# --- canvas -----------------------------------------------------------------
# 1200x630 is the size LinkedIn, Facebook, and X all crop to. Rendering at 2x
# and downsampling gives us antialiased text without needing a font hinting
# pass.
W, H = 1200, 630
SCALE = 2

# --- palette (mirrors :root in styles.css) ----------------------------------
PAPER      = "#14161a"
PAPER_LIFT = "#1b1e24"
INK        = "#e9e6e1"
INK_SOFT   = "#b4afa7"
INK_FAINT  = "#857f76"
ACCENT     = "#8fb4e0"
RULE       = "#2b2f36"

FONTS = "C:/Windows/Fonts/"


def font(name, size):
    return ImageFont.truetype(FONTS + name, size * SCALE)


serif_bold = font("georgiab.ttf", 78)
sans_med   = font("arialbd.ttf", 21)
sans       = font("arial.ttf", 25)
sans_small = font("arial.ttf", 20)
mono_small = font("arialbd.ttf", 18)

img = Image.new("RGB", (W * SCALE, H * SCALE), PAPER)
d = ImageDraw.Draw(img)

# --- accent hairline down the left edge -------------------------------------
# Echoes the site's restrained use of the accent color: a single vertical
# stroke rather than a colored block.
d.rectangle([0, 0, 7 * SCALE, H * SCALE], fill=ACCENT)

# --- layout metrics ---------------------------------------------------------
PAD_X = 82 * SCALE
y = 118 * SCALE


def text(s, f, fill, dy=0, x=PAD_X):
    """Draw a line, advance the cursor by its height plus dy."""
    global y
    d.text((x, y), s, font=f, fill=fill)
    y += (f.getbbox(s)[3] - f.getbbox(s)[1]) + dy * SCALE
    return y


# --- eyebrow ----------------------------------------------------------------
d.text((PAD_X, y), "P O R T F O L I O", font=mono_small, fill=INK_FAINT)
y += 46 * SCALE

# --- name -------------------------------------------------------------------
d.text((PAD_X, y), "Tanish Saini", font=serif_bold, fill=INK)
y += 104 * SCALE

# --- role -------------------------------------------------------------------
d.text((PAD_X, y), "AI  &  BACKEND  DEVELOPER", font=sans_med, fill=ACCENT)
y += 56 * SCALE

# --- rule -------------------------------------------------------------------
d.rectangle([PAD_X, y, PAD_X + 132 * SCALE, y + 2], fill=RULE)
y += 40 * SCALE

# --- tagline (manually wrapped so the line breaks land where I want) --------
for line in (
    "RAG pipelines, chatbots, and workflow automation",
    "with Python, the OpenAI API, Pinecone, and n8n.",
):
    d.text((PAD_X, y), line, font=sans, fill=INK_SOFT)
    y += 40 * SCALE

# --- tech chips -------------------------------------------------------------
y += 26 * SCALE
chip_x = PAD_X
for label in ("Python", "OpenAI API", "Pinecone", "n8n", "Docker"):
    bbox = mono_small.getbbox(label)
    tw = bbox[2] - bbox[0]
    pad_h, pad_v = 15 * SCALE, 10 * SCALE
    box_w = tw + pad_h * 2
    box_h = 37 * SCALE

    d.rounded_rectangle(
        [chip_x, y, chip_x + box_w, y + box_h],
        radius=box_h // 2,
        fill=PAPER_LIFT,
        outline=RULE,
        width=SCALE,
    )
    d.text(
        (chip_x + pad_h, y + pad_v - 2 * SCALE),
        label,
        font=mono_small,
        fill=INK_SOFT,
    )
    chip_x += box_w + 11 * SCALE

# --- footer URL -------------------------------------------------------------
url = "tanish-gitt.github.io/portfolio"
d.text((PAD_X, (H - 78) * SCALE), url, font=sans_small, fill=INK_FAINT)

# --- downsample & save ------------------------------------------------------
img = img.resize((W, H), Image.LANCZOS)
img.save("assets/og-image.png", "PNG", optimize=True)
print(f"wrote assets/og-image.png  ({W}x{H})")
