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

CONFIG_FILE="commitlint.config.js"
echo "'$CONFIG_FILE' should exist"
[ -e "$CONFIG_FILE" ]

MESSAGE_FILE=".gitmessage"
echo "'$MESSAGE_FILE' should exist"
[ -e "$MESSAGE_FILE" ]

echo "contents of $MESSAGE_FILE"
cat "$MESSAGE_FILE"

echo "'commit.template' should be set"
git config commit.template

echo "'@eliasnorrby/commitlint-config should be installed"
[ -d "node_modules/@eliasnorrby/commitlint-config" ]

echo "'@commitlint/cli' should be installed"
[ -d "node_modules/@commitlint/cli" ]
