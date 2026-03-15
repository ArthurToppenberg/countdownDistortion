import { readdir, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const MEDIA_DIR = join(__dirname, "../media");
const OPTIMIZED_DIR = join(__dirname, "../public/optimized");
const MAX_LONG_EDGE = 1600;
const AVIF_QUALITY = 60;
const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

async function optimizeMedia() {
  const files = await readdir(MEDIA_DIR);
  const toOptimize = files.filter((f) =>
    SOURCE_EXTENSIONS.has(extname(f).toLowerCase()),
  );

  if (toOptimize.length === 0) {
    return;
  }

  await mkdir(OPTIMIZED_DIR, { recursive: true });

  for (const file of toOptimize) {
    const inputPath = join(MEDIA_DIR, file);
    const base = file.replace(/\.[^.]+$/u, "");
    const outputPath = join(OPTIMIZED_DIR, `${base}.avif`);

    const image = sharp(inputPath).rotate();
    const { width, height } = await image.metadata();
    const long = Math.max(width ?? 0, height ?? 0);

    if (long <= MAX_LONG_EDGE) {
      await image.avif({ quality: AVIF_QUALITY }).toFile(outputPath);
    } else {
      await image
        .resize(MAX_LONG_EDGE, MAX_LONG_EDGE, { fit: "inside" })
        .avif({ quality: AVIF_QUALITY })
        .toFile(outputPath);
    }
  }

  console.log(
    `Media » Optimized ${toOptimize.length} image(s) to AVIF (max ${MAX_LONG_EDGE}px)`,
  );
}

optimizeMedia().catch((err) => {
  console.error("Media » Optimize failed", err);
  process.exitCode = 1;
});
