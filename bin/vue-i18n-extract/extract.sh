#!/bin/bash

if [ "$1" == "report" ]; then
    OTHER_PARAMS=(--main-language-to-sync-keys en -l './src/i18n/*.json')
else
    OTHER_PARAMS=(--add --json-sort-keys --json-indent-characters "4,space" --no-detailed-report -l './src/i18n/en.json')
fi

node ./bin/vue-i18n-extract/vue-i18n-extract.js report -v './src/**/*.?(js|vue)' \
    --no-dot-notation --add-value-for-languages en "${OTHER_PARAMS[@]}"
