#!/bin/bash
# Usage: commit.sh <message> <file1> [file2 ...]
# Stages the listed files and commits with the given message.
set -e

message="$1"
shift

if [ $# -eq 0 ]; then
    echo "Error: No files specified" >&2
    exit 1
fi

git add "$@"
git commit -m "$message"
