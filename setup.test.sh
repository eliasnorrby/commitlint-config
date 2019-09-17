#!/usr/bin/env bash

set -exo pipefail;

ORIG_DIR=$(pwd)
function finish {
  cd "$ORIG_DIR"
}
trap finish EXIT

cd "$(mktemp -d)"
git init
npm init -y
npx $ORIG_DIR
ls -a

FILE_NAME="commitlint.config.js"
echo "'$FILE_NAME' should exist"
[ -e "$FILE_NAME" ]

FILE_NAME=".gitmessage"
echo "'$FILE_NAME' should exist"
[ -e "$FILE_NAME" ]

echo "contents of $FILE_NAME"
cat "$FILE_NAME"

echo "'commit.template' should be set"
git config commit.template

echo "'@commitlint/cli' should be installed"
[ -d "node_modules/@commitlint/cli" ]

echo "'@commitlint/config-conventional' should be installed"
[ -d "node_modules/@commitlint/config-conventional" ]
