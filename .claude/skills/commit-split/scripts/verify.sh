#!/bin/bash
# Final verification: confirm clean tree and show the commits that were created.
set -e
git status
git log --oneline -10
