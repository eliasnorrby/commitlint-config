#!/usr/bin/env bash

set -exo pipefail;

ORIG_DIR=$(pwd)
function finish {
  if [ ! $? -eq 0 ] ; then
    echo "There are failing tests"
  else
    echo "All tests passed!"
  fi
  cd "$ORIG_DIR"
}
trap finish EXIT

function setup {
  local FLAG=$1
  cd "$(mktemp -d)"
  git init
  npm init -y
  npx $ORIG_DIR $FLAG
  ls -a
}

function common_test {
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

  echo "'@commitlint/cli' should be installed"
  [ -d "node_modules/@commitlint/cli" ]
}

function install_test {
  setup

  common_test

  echo "'@eliasnorrby/commitlint-config should be installed"
  [ -d "node_modules/@eliasnorrby/commitlint-config" ]
}

function no_install_test {
  setup "--no-install"

  common_test

  echo "'@eliasnorrby/commitlint-config' should not be installed"
  [ ! -d "node_modules/@eliasnorrby/commitlint-config" ]

  echo "'@commitlint/config-conventional' should be installed"
  [ -d "node_modules/@commitlint/config-conventional" ]
}

function help_test {
  npx $ORIG_DIR --help | grep "Usage"
}

install_test

no_install_test

help_test
