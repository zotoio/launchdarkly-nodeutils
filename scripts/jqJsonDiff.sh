#!/bin/bash

display_usage() {
    echo "This script must be run with two files to compare."
    echo "eg. ./jqJsonDiff.sh ./before.json ../after.json"
}

if [ $# -eq 0 ]; then
    display_usage
    exit 1
fi

diff <(cat "$1" | jq . --sort-keys) <(cat "$2" | jq . --sort-keys)
