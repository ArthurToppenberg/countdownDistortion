import { readdir } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const MEDIA_DIR = join(__dirname, "../media");

async function findHeicFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      const nested = await findHeicFiles(fullPath);
      files.push(...nested);
    } else if (entry.isFile()) {
      const extension = extname(entry.name).toLowerCase();
      if (extension === ".heic") {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function convertImageWithSips(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "sips",
      ["-s", "format", "png", inputPath, "--out", outputPath],
      {
        stdio: "ignore",
      },
    );

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Media » sips exited with code ${code} for file ${inputPath}`,
          ),
        );
      }
    });
  });
}

async function convertImage(inputPath, outputPath) {
  if (process.platform === "darwin") {
    await convertImageWithSips(inputPath, outputPath);
    return;
  }

  await sharp(inputPath).png().toFile(outputPath);
}

async function convertHeicToPng() {
  const heicFiles = await findHeicFiles(MEDIA_DIR);

  if (heicFiles.length === 0) {
    console.log("Media » No HEIC files found to convert");
    return;
  }

  for (const inputPath of heicFiles) {
    const outputPath = `${inputPath.replace(/\.[^.]+$/u, "")}.png`;

    console.log(
      `Media » Converting ${inputPath.replace(
        dirname(MEDIA_DIR),
        "",
      )} → ${outputPath.replace(dirname(MEDIA_DIR), "")}`,
    );

    // eslint-disable-next-line no-await-in-loop
    await convertImage(inputPath, outputPath);
  }

  console.log(`Media » Converted ${heicFiles.length} HEIC file(s) to PNG`);
}

convertHeicToPng().catch((error) => {
  console.error("Media » Failed to convert HEIC files to PNG", error);
  process.exitCode = 1;
});

