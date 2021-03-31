#!/bin/sh
set -e

if [ -z $AWS_ACCESS_KEY_ID ]; then
  echo "AWS_ACCESS_KEY_ID not defined" >&2
  exit 1
fi

if [ -z $AWS_SECRET_ACCESS_KEY ]; then
  echo "AWS_SECRET_ACCESS_KEY not defined" >&2
  exit 1
fi

if [ -z $AWS_BUCKET_NAME ]; then
  echo "AWS_BUCKET_NAME not defined" >&2
  exit 1
fi

if [ -z $REGION ]; then
  echo "REGION not defined" >&2
  exit 1
fi

if [ ! -d "./jic-web" ]; then
  mkdir jic-web
fi

cp -r dist jic-web
cp -r srv jic-web
cp package.json jic-web
cp yarn.lock jic-web
cd jic-web
# yarn --production
npm cache verify
npm install --only=production

BUILD_NUM=$(git rev-parse HEAD)
TARGET_VERSION_FILE="dist/version.js";
$(touch $TARGET_VERSION_FILE)
VERSION_VAR="window.BUILD_NUM='$BUILD_NUM';"
set +x; echo "$VERSION_VAR
$(cat $TARGET_VERSION_FILE)" > $TARGET_VERSION_FILE; set -x;

cd ..
tar -zcvf "jic-web.tar.gz" jic-web
rm -rf jic-web

# upload to s3
virtualenv env
. env/bin/activate
pip install boto gevent==1.2.2

python build/lib/upload_to_s3.py --bucket ${AWS_BUCKET_NAME} --region ${REGION}  "jic-web.tar.gz" "jic-web.tar.gz"
