#!/usr/bin/env node
// vim: set filetype=javascript:
/* eslint-disable */
'use strict';
const program = require('commander');
const { reportCommand } = require('./vue-i18n-extract.umd.js');

function increaseDynamic(dummyValue, previous) {
  return previous + 1;
}

program
  .command('report', { isDefault: true })
  .description('Create a report from a glob of your Vue.js source files and your language files.')
  .requiredOption(
    '-v, --vueFiles <vueFiles>',
    'The Vue.js file(s) you want to extract i18n strings from. It can be a path to a folder or to a file. It accepts glob patterns. (ex. *, ?, (pattern|pattern|pattern)',
  )
  .requiredOption(
    '-l, --languageFiles <languageFiles>',
    'The language file(s) you want to compare your Vue.js file(s) to. It can be a path to a folder or to a file. It accepts glob patterns (ex. *, ?, (pattern|pattern|pattern) ',
  )
  .option(
    '-o, --output <output>',
    'Use if you want to create a json file out of your report. (ex. -o output.json)',
  )
  .option(
    '-a, --add',
    'Use if you want to add missing keys into your json language files.',
  )
  .option(
    '-d, --dynamic',
    'Use if you want to ignore dynamic keys false-positive. Use it 2 times to get dynamic keys report',
    increaseDynamic,
    0
  )
  .option(
    '--no-dot-notation',
    'Use if your language keys are flat, contains dots and you do not use a dot character as a separator for nested key structure'
  )
  .option(
    '--add-value-for-languages <languages>',
    'Duplicate missing key text to it`s value for specified languages. (Pass them as coma-separated parameter value)',
    function splitLanguages(value= '') {
      return value.split(',');
    }
  )
  .option(
    '--main-language-to-sync-keys <mainLanguage>',
    'Use it if you want to check and synchronize all translation keys from some lang file to all others. Mainly it should be English lang file'
  )
  .option(
    '--json-sort-keys',
    'Use if you want to resort language JSON file`s keys alphabetically',
    false
    )
  .option(
    '--json-indent-characters <jsonIndentCharacters>',
    'You can specify indentation characters for lines in language JSON files. It will work if JSON language file will be updated, for example because of (--add) option',
    function checkValue(value) {
      let [amount, character] = value.split(',');
      amount = parseInt(amount, 10)
      if (isNaN(amount) || amount <= 0 || !['space', 'tab'].includes(character)) {
        console.error(`Unknown or incorrect value format for "--json-indent-characters" option: "${value}"`);
        process.exit(1)
      }
      return value
    },
    '2,space'
  )
  .option(
    '--no-detailed-report',
    'Use if you do not want to see detailed list of the keys output on the screen'
  )
  .action(reportCommand);

program.parseAsync(process.argv);
