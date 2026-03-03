#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDir = path.join(root, "node_modules", "hanzi-writer-data");
const targetDir = path.join(root, "public", "hanzi");
const sourcePkgPath = path.join(sourceDir, "package.json");
const stampPath = path.join(targetDir, ".source-version");

const readSourceVersion = async () => {
  const sourcePkgRaw = await fs.readFile(sourcePkgPath, "utf8");
  const sourcePkg = JSON.parse(sourcePkgRaw);

  return typeof sourcePkg.version === "string" ? sourcePkg.version : "unknown";
};

const isAlreadySynced = async (sourceVersion) => {
  try {
    const currentStamp = await fs.readFile(stampPath, "utf8");
    return currentStamp.trim() === sourceVersion;
  } catch {
    return false;
  }
};

const main = async () => {
  const sourceVersion = await readSourceVersion();

  if (await isAlreadySynced(sourceVersion)) {
    console.log(`[sync:hanzi] up to date (${sourceVersion})`);
    return;
  }

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true });
  await fs.writeFile(stampPath, `${sourceVersion}\n`, "utf8");

  console.log(`[sync:hanzi] copied hanzi-writer-data ${sourceVersion}`);
};

main().catch((error) => {
  console.error("[sync:hanzi] failed", error);
  process.exit(1);
});
