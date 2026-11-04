#!/bin/bash
# Gather all info needed to plan commits: status, full diff, and recent commit style.
set -e
git status
git diff HEAD
git log --oneline -5
