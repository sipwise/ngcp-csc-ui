#!/bin/bash

if [ "$1" == "report" ]; then
    OTHER_PARAMS=()
else
    OTHER_PARAMS=(--add --json-sort-keys --json-indent-characters "1,tab" --no-detailed-report)
fi

node ./bin/vue-i18n-extract/vue-i18n-extract.js report -v './src/**/*.?(js|vue)' -l './src/i18n/*.json' \
    --no-dot-notation --add-value-for-languages en --main-language-to-sync-keys en "${OTHER_PARAMS[@]}"
