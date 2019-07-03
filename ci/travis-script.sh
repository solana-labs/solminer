#!/usr/bin/env bash

set -ex

if ! $TRAVIS_PULL_REQUEST && [[ $TRAVIS_OS_NAME = osx ]]; then
  security create-keychain -p mynotsecretpassword build.keychain
  security default-keychain -s build.keychain
  security unlock-keychain -p mynotsecretpassword
  openssl aes-256-cbc \
    -K $encrypted_9a8a3e27a7e5_key -iv $encrypted_9a8a3e27a7e5_iv \
    -in cert/solminer.p12.enc -out solminer.p12 -d
  security import solminer.p12 -A -P "$OSX_SOLMINER_P12_PASSWORD"
  rm -f solminer.p12
  security find-identity -v -s solminer
fi

npm run lint

if [[ -z $TRAVIS_TAG ]]; then
  if [[ $TRAVIS_OS_NAME = linux ]]; then
    npx semantic-release
  fi
  DEBUG='e*' npm run make
else
  npm version $TRAVIS_TAG --no-git-tag-version
  DEBUG='e*' npm run publish
fi