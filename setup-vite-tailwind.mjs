#!/usr/bin/env node
/**
 * Setup script for Vite + Tailwind + gh-pages
 * Works for existing folders and new projects.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const cwd = process.cwd();
const projectName = path.basename(cwd);

// ----- Helpers -----
const run = (cmd) => execSync(cmd, { cwd, stdio: "inherit" });
const write = (file, content) =>
  fs.writeFileSync(path.join(cwd, file), content);

// ----- Initialize npm if needed -----
if (!fs.existsSync(path.join(cwd, "package.json"))) {
  console.log("🟢 Initializing npm...");
  run("npm init -y");
}

// ----- Read and update package.json -----
const pkgPath = path.join(cwd, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.name = pkg.name || projectName;
pkg.version = pkg.version || "1.0.0";
pkg.homepage = `https://github.com/JVarney03/${projectName}`; 
pkg.description =
  pkg.description ||
  `Auto-generated Vite + Tailwind + gh-pages setup for ${projectName}.`;

pkg.prettier = {
  plugins: ["prettier-plugin-tailwindcss"],
};

pkg.devDependencies = {
  "gh-pages": "^6.3.0",
  prettier: "^3.6.2",
  "prettier-plugin-tailwindcss": "^0.7.1",
  vite: "^7.1.12",
  ...(pkg.devDependencies || {}),
};

pkg.dependencies = {
  "@tailwindcss/vite": "^4.1.16",
  tailwindcss: "^4.1.16",
  ...(pkg.dependencies || {}),
};

pkg.scripts = {
  predeploy: "npm run build",
  deploy: "gh-pages -d dist",
  dev: "vite",
  build: "vite build",
  preview: "vite preview",
  ...(pkg.scripts || {}),
};


// ----- Write updated package.json -----
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("✅ Updated package.json");

// ----- Create vite.config.js -----
const viteConfigPath = path.join(cwd, "vite.config.js");
const viteConfig = `import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "/${projectName}/",
});
`;
write("vite.config.js", viteConfig);
console.log("✅ Created vite.config.js");

// ----- Create Tailwind source CSS -----
const srcDir = path.join(cwd, "src");
if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);

const cssPath = path.join(srcDir, "style.css");
if (!fs.existsSync(cssPath)) {
  write(
    "src/style.css",
    `@import "tailwindcss";`
  );
  console.log("✅ Created src/style.css");
}

// ----- Install dependencies -----
console.log("📦 Installing dependencies (this might take a minute)...");
run("npm install");

console.log("\n🎉 All done!");
console.log(`👉 Run "npm run dev" to start the project.`);
