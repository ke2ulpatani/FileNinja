#!/bin/bash

WORKSPACE=$1

pwd
ls
whoami

mkdir -p src/temp_files
cd src
cp $HOME/.env .
if [ $? -ne 0 ]
then
  echo "Copying failed"
  exit 1
fi
npm install --suppress-package-metadata-warnings
if [ $? -ne 0 ]
then
  echo "npm install failed"
  exit 1
fi
npm test test/watermark.js
if [ $? -ne 0 ]
then
  echo "npm test watermark failed"
  exit 1
fi
npm test test/export.js
if [ $? -ne 0 ]
then
  echo "npm test export failed"
  exit 1
fi
npm test test/category.js
if [ $? -ne 0 ]
then
  echo "npm test category failed"
  exit 1
fi
npm test test/storage.js
if [ $? -ne 0 ]
then
  echo "npm test storage fails"
  exit 1
fi
node test/selenium.js
if [ $? -ne 0 ]
then
  echo "Integeration test failed"
  exit 1
fi