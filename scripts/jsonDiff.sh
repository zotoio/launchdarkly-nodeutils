#!/bin/bash

display_usage() {
    echo "This script must be run with two files to compare."
    echo "eg. ./jsonDiff.sh ./before.json ../after.json"
}

if [ $# -eq 0 ]; then
    display_usage
    exit 1
fi
node ../node_modules/json-diff/bin/json-diff.js $1 $2