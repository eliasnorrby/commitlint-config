#!/usr/bin/env node
const yargs = require("yargs");

yargs
  .alias("v", "version")
  .usage("Usage: $0 [options]")
  .help("h")
  .alias("h", "help")
  .option("i", {
    describe: "Install this package",
    type: "boolean",
    alias: "install",
    default: true,
  })
  .describe("no-install", "Skip installing this package")
  .strict(true);

const argv = yargs.argv;

const log = msg => console.log(">> \x1b[36m%s\x1b[0m", msg);
const packageName = "@eliasnorrby/commitlint-config";

const fs = require("fs");
if (!fs.existsSync("package.json")) {
  console.error(
    "No package.json found in the current directory. Make sure you are in the project root. If no package.json exists yet, run `npm init` first.",
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
    husky.hooks["commit-msg"],
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
  log("Added commitlint to git hook");
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  log("package.json saved");
}

const config = argv.install
  ? `\
module.exports = {
  extends: ["@eliasnorrby/commitlint-config"],
  // Override rules here
};`
  : `\
module.exports = {
  extends: ["@commitlint/config-conventional"],
  // Add rules here
}`;

if (!fs.existsSync("commitlint.config.js"))
  fs.writeFileSync("commitlint.config.js", config, "utf8");

const gitmessage = `\


# type(scope?): subject  #scope is optional
# Real world examples can look like this:

#   chore: run tests on travis ci
#   fix(server): send cors headers
#   feat(blog): add comment section

# type can be one of:
# build | ci | chore | docs | feat | fix | perf | refactor | revert | style | test
`;

fs.writeFileSync(".gitmessage", gitmessage, "utf8");

log("Setting local git commit message template");
require("child_process").execSync("git config commit.template .gitmessage", {
  stdio: "inherit",
});

log("Installing peer dependencies (@commitlint/cli, husky)");
require("child_process").execSync(
  "npm install --save-dev @commitlint/cli husky",
  { stdio: "inherit" },
);

if (argv.install) {
  log(`Installing self (${packageName})`);
  require("child_process").execSync(`npm install --save-dev ${packageName}`, {
    stdio: "inherit",
  });
} else {
  log("Skipping install of self");
}

log("Done!");
