"""Generate all 25 AI images for Dream's Latkans & Laces using Gemini Nano Banana.
Run: python /app/backend/generate_images.py
"""
import asyncio
import os
import base64
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

OUT_DIR = ROOT_DIR / "static" / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)

API_KEY = os.getenv("EMERGENT_LLM_KEY")
MODEL = "gemini-3.1-flash-image-preview"

PROMPTS = {
    # HERO (landscape feel)
    "hero-1": "Ultra-luxurious close-up product photography of an array of colorful Indian fancy latkans (decorative tassel ornaments) hanging beautifully with golden threads, intricate stone work and resham embroidery, soft studio lighting, shallow depth of field, dreamy bokeh, warm cinematic tones, 16:9 wide composition, premium e-commerce hero banner aesthetic",
    "hero-2": "Elegant flat lay top-view of Indian saree laces and decorative borders spread artfully on a white marble surface, gold zari work, red and ivory tones, beautiful symmetry, soft natural light, magazine-quality wholesale textile photography, 16:9 wide landscape composition",
    "hero-3": "Bridal kalire ornament pair with silk tassels hanging gracefully, festive Indian wedding mood, warm golden bokeh background, ornate gold metalwork glistening, soft cinematic lighting, luxurious 16:9 wide banner photograph",
    "hero-4": "Curated collection of decorative diamond and rhinestone patches, embroidery appliques and stone work pieces arranged elegantly on ivory silk fabric, macro studio photography, sparkles catching warm golden light, 16:9 landscape banner image",
    "hero-5": "Festive Diwali latkans toran hanging beside a beautifully decorated traditional Indian doorway, warm golden marigold light, brass diyas glowing softly, celebratory ambiance, cinematic wide 16:9 photograph",
    # CATEGORIES (square)
    "cat-1": "Six colorful Indian fancy latkans hanging in a neat row against a clean white studio background, stone and mirror work, vibrant colors, professional product photography, square 1:1 composition",
    "cat-2": "Extreme close-up macro of an intricate Indian saree border lace with gold zari embroidery on ivory background, rich texture detail, soft natural lighting, square 1:1 composition",
    "cat-3": "A pair of ornate bridal kalire in polished gold finish with hanging tassels, soft warm festive backdrop with golden bokeh, elegant product shot, square 1:1 composition",
    "cat-4": "Sparkling diamond rhinestone patches arranged on dark velvet background, dramatic sparkle effect catching light, luxurious macro studio photograph, square 1:1 composition",
    "cat-5": "Bright colorful Diwali festive latkan decoration set with marigold flowers and small diyas glowing, warm festive lighting, joyous mood, square 1:1 composition",
    "cat-6": "Beautiful macro close-up of hand-embroidered Indian stone work and resham silk thread embroidery on rich fabric, intricate craftsmanship visible, golden hour soft light, square 1:1 composition",
    # PRODUCTS (square)
    "prod-1": "Single multi-color stone-work latkan tassel ornament hanging against a clean white background, professional e-commerce product shot, soft shadow, square 1:1",
    "prod-2": "Single resham embroidered latkan in deep maroon thread with golden accents, clean white studio background, premium product photography, square 1:1",
    "prod-3": "Single golden zari bridal latkan with ornate metalwork, hanging gracefully, clean white background, luxury product shot, square 1:1",
    "prod-4": "Single mirror-work latkan tassel, sparkling close-up macro detail, clean white background, professional e-commerce photograph, square 1:1",
    "prod-5": "Rolled spool of golden zari saree border lace placed elegantly on white surface, professional textile product photography, square 1:1",
    "prod-6": "Intricate cutwork fancy border lace laid flat on a white marble surface, top view, beautiful patterns visible, square 1:1",
    "prod-7": "A single ornate bridal kalire in gold color with delicate hanging chains, clean white studio background, premium product photograph, square 1:1",
    "prod-8": "A vibrant multi-color silk festive tassel decoration on clean white background, bright colors pop, premium product photo, square 1:1",
    "prod-9": "Single diamond rhinestone patch on rich dark velvet background, dramatic sparkle, macro detail, square 1:1",
    "prod-10": "Single colorful Indian embroidery applique patch on a clean white background, vibrant resham thread work visible, square 1:1",
    "prod-11": "A Diwali latkan toran set decoration laid out on a clean ivory background, festive colors, professional product shot, square 1:1",
    "prod-12": "Bright multi-color Navratri tassel decorations bundled together, clean white background, festive vibrant photograph, square 1:1",
    # ABOUT
    "about-1": "Atmospheric street photograph of Mumbai's busy Bhuleshwar wholesale textile market, colorful fabrics and lace stalls, warm afternoon golden tones, candid documentary style, slight motion, rich cultural ambience, landscape composition",
    "about-2": "Close-up of an Indian artisan's hands holding a bundle of colorful handmade latkans, golden hour warm light, intimate craftsmanship feel, shallow depth of field, square composition",
}


async def generate_one(key: str, prompt: str, retries: int = 2) -> bool:
    out_path = OUT_DIR / f"{key}.png"
    if out_path.exists() and out_path.stat().st_size > 1000:
        print(f"[skip] {key} already exists")
        return True
    for attempt in range(retries + 1):
        try:
            chat = LlmChat(
                api_key=API_KEY,
                session_id=f"img-{key}-{attempt}",
                system_message="You are a professional product photographer creating luxury e-commerce imagery.",
            )
            chat.with_model("gemini", MODEL).with_params(modalities=["image", "text"])
            msg = UserMessage(text=prompt)
            text, images = await chat.send_message_multimodal_response(msg)
            if images:
                img = images[0]
                image_bytes = base64.b64decode(img['data'])
                with open(out_path, "wb") as f:
                    f.write(image_bytes)
                print(f"[ok]   {key} ({len(image_bytes)} bytes)")
                return True
            else:
                print(f"[warn] {key} no image returned (attempt {attempt+1})")
        except Exception as e:
            print(f"[err]  {key} attempt {attempt+1}: {type(e).__name__}: {str(e)[:120]}")
        await asyncio.sleep(1.5)
    return False


async def main():
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    items = [(k, v) for k, v in PROMPTS.items() if (not only or k in only)]
    print(f"Generating {len(items)} images -> {OUT_DIR}")
    # Run with limited concurrency to avoid rate limits
    sem = asyncio.Semaphore(3)

    async def bound(k, p):
        async with sem:
            return await generate_one(k, p)

    results = await asyncio.gather(*(bound(k, p) for k, p in items))
    ok = sum(1 for r in results if r)
    print(f"Done: {ok}/{len(items)} succeeded")


if __name__ == "__main__":
    asyncio.run(main())
