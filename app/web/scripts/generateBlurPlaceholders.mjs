import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const OPTIMIZED_DIR = join(__dirname, "../public/optimized");
const OUTPUT_FILE = join(__dirname, "../app/lib/blurPlaceholders.json");
const PLACEHOLDER_WIDTH = 24;
const BLUR_SIGMA = 2;
const WEBP_QUALITY = 40;

async function generate() {
  const placeholders = {};
  const files = await readdir(OPTIMIZED_DIR).catch(() => []);
  const avifFiles = files.filter(
    (f) => extname(f).toLowerCase() === ".avif",
  );

  for (const file of avifFiles) {
    const buffer = await sharp(join(OPTIMIZED_DIR, file))
      .resize(PLACEHOLDER_WIDTH)
      .blur(BLUR_SIGMA)
      .toFormat("webp", { quality: WEBP_QUALITY })
      .toBuffer();

    placeholders[`/optimized/${file}`] = `data:image/webp;base64,${buffer.toString("base64")}`;
  }

  await mkdir(dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(
    OUTPUT_FILE,
    JSON.stringify(placeholders, null, 2) + "\n",
  );

  console.log(
    `Blur » Generated placeholders for ${avifFiles.length} AVIF image(s)`,
  );
}

generate();
