#!/usr/bin/env bash

# Travis keep-alive ping (builds without output for 10 minutes are aborted...)
(
  while true; do
    sleep 60
    echo "[travis keep-alive: $(date)]"
  done
) &
pid=$!
trap 'kill $pid' EXIT

set -ex

if ! $TRAVIS_PULL_REQUEST && [[ $TRAVIS_OS_NAME = osx ]]; then
  security create-keychain -p mynotsecretpassword build.keychain
  security default-keychain -s build.keychain
  security unlock-keychain -p mynotsecretpassword
  openssl aes-256-cbc \
    -K $encrypted_9a8a3e27a7e5_key -iv $encrypted_9a8a3e27a7e5_iv \
    -in cert/solminer.p12.enc -out solminer.p12 -d
  security import solminer.p12 -P "$OSX_SOLMINER_P12_PASSWORD" -T /usr/bin/codesign
  rm -f solminer.p12
  security find-identity -v
fi

npm run lint

if [[ -z $TRAVIS_TAG ]]; then
  if [[ $TRAVIS_OS_NAME = linux ]]; then
    npx semantic-release
  fi
  time npm run make
else
  npm version $TRAVIS_TAG --no-git-tag-version
  time npm run publish
fi
