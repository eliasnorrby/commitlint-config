#!/usr/bin/env node

const fs = require("fs");
if (!fs.existsSync("package.json")) {
  console.error(
    "No package.json found in the current directory. Make sure you are in the project root. If no package.json exists yet, run `npm init` first."
  );
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const husky = packageJson.husky;

const hooksDefined = Boolean(husky && husky.hooks);
const msghookDefined = Boolean(hooksDefined && husky.hooks["commit-msg"]);

if (msghookDefined) {
  console.log(
    "commit-msg hook already configured: ",
    husky.hooks["commit-msg"]
  );
} else {
  const newHusky = {
    hooks: {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
    },
  };
  if (husky && hooksDefined) {
    newHusky.hooks = { ...husky.hooks, ...newHusky.hooks };
  }
  packageJson.husky = newHusky;
  console.log("Added commitlint to git hook");
  // console.log("pkg: ", JSON.stringify(packageJson, null, 2));
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("package.json saved");
}

const config = `\
module.exports = {
  extends: ["@commitlint/config-conventional"],
  // Override rules here
};
`;

if (!fs.existsSync("commitlint.config.js"))
  fs.writeFileSync("commitlint.config.js", config, "utf8");

require("child_process").execSync(
  "npm install --save-dev @commitlint/cli @commitlint/config-conventional",
  { stdio: "inherit" }
);
