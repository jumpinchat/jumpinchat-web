from __future__ import print_function

import sys
import mimetypes
import gzip
import io
import os
import boto
import boto.s3
import argparse
import traceback
import logging

FILE_HEADERS = {
    'index.html': {
        'Cache-Control': 'no-cache',
    },
    'js/config.js': {
        'Cache-Control': 'no-cache',
    }
}

COMPRESSIBLE_FILE_TYPES = (
    "text/plain",
    "text/html",
    "text/javascript",
    "text/css",
    "text/xml",
    "application/javascript",
    "application/x-javascript",
    "application/xml",
    "text/x-component",
    "application/json",
    "application/xhtml+xml",
    "application/rss+xml",
    "application/atom+xml",
    "app/vdn.ms-fontobject",
    "image/svg+xml",
    "application/x-font-ttf",
    "font/opentype",
    "application/octet-stream",
)


def get_bucket_connection(bucket_name, region='us-west-2'):
    # Connect to S3 and get a reference to the bucket name we will push files to
    conn = boto.s3.connect_to_region(region)
    if conn is None:
        print("Invalid AWS region %s" % region)
        return

    try:
        bucket = conn.get_bucket(bucket_name, validate=True)
    except boto.exception.S3ResponseError:
        print("S3 bucket %s does not exist in region %s" % (bucket_name, region))
        return

    return bucket


def upload(data, path, size, bucket, compress=True):
    try:
        headers = {
            'Content-Type': mimetypes.guess_type(path)[0],
            'Cache-Control': "public, max-age=31536000",
            'Content-Length': size,
        }

        # gzip the file if appropriate
        if mimetypes.guess_type(path)[0] in COMPRESSIBLE_FILE_TYPES and compress:
            new_buffer = io.BytesIO()
            gz_fd = gzip.GzipFile(compresslevel=9, mode="wb", fileobj=new_buffer)
            gz_fd.write(data)
            gz_fd.close()

            headers['Content-Encoding'] = 'gzip'
            headers['Content-Length'] = new_buffer.tell()

            new_buffer.seek(0)
            data = new_buffer.read()

        logging.debug("Uploading %s (%s bytes)" % (path, headers['Content-Length']))
        key = bucket.new_key(path)

        if path in FILE_HEADERS:
            headers.update(FILE_HEADERS[path])

        key.set_contents_from_string(data, headers=headers, policy='', replace=True,
                                     reduced_redundancy=False)

    except Exception as e:
        print(traceback.format_exc(e), file=sys.stderr)
        return 0

    # Return number of bytes uploaded.
    return headers['Content-Length']


def main():
    parser = argparse.ArgumentParser(
        description="Upload specific file to s3 bucket")
    parser.add_argument("-b", "--bucket", dest="bucket", type=str, required=True,
                        help="Name of S3 bucket to unpack to")
    parser.add_argument("-r", "--region", dest="region", type=str, default="us-west-2",
                        help="Region of S3 bucket. Default=us-west-2")
    parser.add_argument("--no-compress", action="store_true",
                        help="disable gzip compression of known file types")
    parser.add_argument("local_file", type=str, help="File to load")
    parser.add_argument("s3_file", type=str, help="File to load")

    args = parser.parse_args()

    bucket = get_bucket_connection(args.bucket, args.region)

    with open(args.local_file) as fd:
        upload(fd.read(), args.s3_file, os.stat(args.local_file), bucket, not args.no_compress)


if __name__ == "__main__":
    main()
