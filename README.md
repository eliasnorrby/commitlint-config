# Commitlint Config

[![Travis](https://img.shields.io/travis/com/eliasnorrby/commitlint-config?style=for-the-badge)](https://travis-ci.com/eliasnorrby/commitlint-config)
[![npm](https://img.shields.io/npm/v/@eliasnorrby/commitlint-config?style=for-the-badge)](https://www.npmjs.com/package/@eliasnorrby/commitlint-config)

My commitlint config. Right now it only extends
`@commitlint/config-conventional`, but that could change.

:warning: Subject to change in the future.

# Setup

## Using `npx`

Run the following command to install and configure commitlint

```sh
npx @eliasnorrby/commitlint-config
```

This will run a setup script, adding this package to `devDependencies`,
intalling `husky`, populating the `husky.hooks.commit-msg` field in
`package.json`, setting the git commit template to `.gitmessage` and writing the
config to `commitlint.config.js`.

### `--no-install`

Run setup with the `--no-install` flag to avoid installing this package as a
dependency. Your `commitling.config.js` will instead extend
`@commitlint/config-conventional`.

## Manually

Install the package

```sh
npm i -D @eliasnorrby/commitlint-config
```

and add the configuration to `commitlint.config.js`.

### `commitlint.config.js`

```js
module.exports = require("@eliasnorrby/commitlint-config");
```

# Overriding settings

Just add your overrides to `commitlint.config.js`:

```js
module.exports = {
  ...require("@eliasnorrby/commitlint-config"),
  rules: {
    "header-max-length": [0, "always", 72],
  },
};
```
