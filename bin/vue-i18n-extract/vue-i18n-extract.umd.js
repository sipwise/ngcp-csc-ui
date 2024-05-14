/* eslint-disable */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('path'), require('is-valid-glob'), require('glob'), require('fs'), require('dot-object'), require('js-yaml')) :
  typeof define === 'function' && define.amd ? define(['exports', 'path', 'is-valid-glob', 'glob', 'fs', 'dot-object', 'js-yaml'], factory) :
  (global = global || self, factory(global.vueI18NExtract = {}, global.path, global.isValidGlob, global.glob, global.fs, global.dotObject, global.jsYaml));
}(this, (function (exports, path, isValidGlob, glob, fs, dot, yaml) {
  path = path && Object.prototype.hasOwnProperty.call(path, 'default') ? path['default'] : path;
  isValidGlob = isValidGlob && Object.prototype.hasOwnProperty.call(isValidGlob, 'default') ? isValidGlob['default'] : isValidGlob;
  glob = glob && Object.prototype.hasOwnProperty.call(glob, 'default') ? glob['default'] : glob;
  fs = fs && Object.prototype.hasOwnProperty.call(fs, 'default') ? fs['default'] : fs;
  dot = dot && Object.prototype.hasOwnProperty.call(dot, 'default') ? dot['default'] : dot;
  yaml = yaml && Object.prototype.hasOwnProperty.call(yaml, 'default') ? yaml['default'] : yaml;

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  const decomment = require('decomment');

  function readVueFiles(src) {
    if (!isValidGlob(src)) {
      throw new Error(`vueFiles isn't a valid glob pattern.`);
    }

    const targetFiles = glob.sync(src);

    if (targetFiles.length === 0) {
      throw new Error('vueFiles glob has no files.');
    }

    return targetFiles.map(f => {
      const fileName = f.replace(process.cwd(), '');
      return {
        fileName,
        path: f,
        content: decomment.text(fs.readFileSync(f, 'utf8'))
      };
    });
  }

  function* getMatches(file, regExp, captureGroup = 1) {
    while (true) {
      const match = regExp.exec(file.content);

      if (match === null) {
        break;
      }

      const line = (file.content.substring(0, match.index).match(/\n/g) || []).length + 1;
      yield {
        path: match[captureGroup],
        line,
        file: file.fileName
      };
    }
  }
  /**
   * Extracts translation keys from methods such as `$t` and `$tc`.
   *
   * - **regexp pattern**: (?:[$ .]tc?)\(
   *
   *   **description**: Matches the sequence t( or tc(, optionally with either “$”, “.” or “ ” in front of it.
   *
   * - **regexp pattern**: (["'`])
   *
   *   **description**: 1. capturing group. Matches either “"”, “'”, or “`”.
   *
   * - **regexp pattern**: ((?:[^\\]|\\.)*?)
   *
   *   **description**: 2. capturing group. Matches anything except a backslash
   *   *or* matches any backslash followed by any character (e.g. “\"”, “\`”, “\t”, etc.)
   *
   * - **regexp pattern**: \1
   *
   *   **description**: matches whatever was matched by capturing group 1 (e.g. the starting string character)
   *
   * @param file a file object
   * @returns a list of translation keys found in `file`.
   */


  function extractMethodMatches(file) {
    const methodRegExp = /(?:[$ .]tc?)\(\s*?(["'`])((?:[^\\]|\\.)*?)\1/g;
    return [...getMatches(file, methodRegExp, 2)];
  }

  function extractComponentMatches(file) {
    const componentRegExp = /(?:<i18n)(?:.|\n)*?(?:[^:]path=("|'))(.*?)\1/gi;
    return [...getMatches(file, componentRegExp, 2)];
  }

  function extractDirectiveMatches(file) {
    const directiveRegExp = /v-t="'(.*?)'"/g;
    return [...getMatches(file, directiveRegExp)];
  }

  function extractI18nItemsFromVueFiles(sourceFiles) {
    return sourceFiles.reduce((accumulator, file) => {
      const methodMatches = extractMethodMatches(file);
      const componentMatches = extractComponentMatches(file);
      const directiveMatches = extractDirectiveMatches(file);
      return [...accumulator, ...methodMatches, ...componentMatches, ...directiveMatches];
    }, []);
  }

  function parseVueFiles(vueFilesPath) {
    const filesList = readVueFiles(vueFilesPath);
    return extractI18nItemsFromVueFiles(filesList);
  }

  function readLangFiles(src) {
    if (!isValidGlob(src)) {
      throw new Error(`languageFiles isn't a valid glob pattern.`);
    }

    const targetFiles = glob.sync(src);

    if (targetFiles.length === 0) {
      throw new Error('languageFiles glob has no files.');
    }

    return targetFiles.map(f => {
      const langPath = path.resolve(process.cwd(), f);
      const extension = path.extname(langPath).toLowerCase();
      const isJSON = extension === '.json';
      const isYAML = extension === '.yaml' || extension === '.yml';
      let langObj;

      if (isJSON) {
        langObj = JSON.parse(fs.readFileSync(langPath, 'utf8'));
      } else if (isYAML) {
        langObj = yaml.safeLoad(fs.readFileSync(langPath, 'utf8'));
      } else {
        langObj = eval(fs.readFileSync(langPath, 'utf8'));
      }

      const fileName = f.replace(process.cwd(), '');
      return {
        fileName,
        path: langPath,
        content: JSON.stringify(langObj)
      };
    });
  }

  function extractI18nItemsFromLanguageFiles(languageFiles, missingKeysOptions) {
    return languageFiles.reduce((accumulator, file) => {
      const language = file.fileName.substring(file.fileName.lastIndexOf('/') + 1, file.fileName.lastIndexOf('.'));

      if (!accumulator[language]) {
        accumulator[language] = [];
      }

      const fileContent = JSON.parse(file.content);
      const flattenedObject = dot.dot(fileContent);
      Object.keys(flattenedObject).forEach((key, index) => {
        var _accumulator$language;

        (_accumulator$language = accumulator[language]) == null ? void 0 : _accumulator$language.push({
          line: index,
          path: key,
          file: file.fileName,
          translated: ((missingKeysOptions.dotNotation ? dot.pick(key, fileContent) : fileContent[key]) || '').trim().length > 0
        });
      });
      return accumulator;
    }, {});
  }

  function sortedJSONStringify(obj, indent = 2) {
    function flattenEntries([key, value]) {
      return typeof value !== 'object' ? [[key, value]] : [[key, value], ...Object.entries(value).flatMap(flattenEntries)];
    }

    const allEntries = Object.entries(obj).flatMap(flattenEntries);
    const sorted = allEntries.map(entry => entry[0]).sort();
    return JSON.stringify(obj, sorted, indent);
  }

  function writeMissingToLanguage(resolvedLanguageFiles, missingKeys, missingKeysOptions, outputOptions) {
    const languageFiles = readLangFiles(resolvedLanguageFiles);
    languageFiles.forEach(languageFile => {
      const languageFileContent = JSON.parse(languageFile.content);
      missingKeys.forEach(item => {
        if (item.language && languageFile.fileName.includes(item.language) || !item.language) {
          const keyValue = item.language && missingKeysOptions.addValueForLanguages.includes(item.language) ? item.path : '';

          if (missingKeysOptions.dotNotation) {
            dot.str(item.path, keyValue, languageFileContent);
          } else {
            languageFileContent[item.path] = keyValue;
          }
        }
      });
      const fileExtension = path.extname(languageFile.fileName).toLowerCase();
      const filePath = languageFile.path;
      const stringifiedContent = outputOptions.sortKeys ? sortedJSONStringify(languageFileContent, outputOptions.indentationString) : JSON.stringify(languageFileContent, null, outputOptions.indentationString || 2);

      if (fileExtension === '.json') {
        fs.writeFileSync(filePath, stringifiedContent);
      } else if (fileExtension === '.js') {
        const jsFile = `export default ${stringifiedContent}; \n`;
        fs.writeFileSync(filePath, jsFile);
      } else if (fileExtension === '.yaml' || fileExtension === '.yml') {
        const yamlFile = yaml.safeDump(languageFileContent);
        fs.writeFileSync(filePath, yamlFile);
      }
    });
  }
  function parseLanguageFiles(languageFilesPath, missingKeysOptions) {
    const filesList = readLangFiles(languageFilesPath);
    return extractI18nItemsFromLanguageFiles(filesList, missingKeysOptions);
  }

  (function (VueI18NExtractReportTypes) {
    VueI18NExtractReportTypes[VueI18NExtractReportTypes["None"] = 0] = "None";
    VueI18NExtractReportTypes[VueI18NExtractReportTypes["Missing"] = 1] = "Missing";
    VueI18NExtractReportTypes[VueI18NExtractReportTypes["Unused"] = 2] = "Unused";
    VueI18NExtractReportTypes[VueI18NExtractReportTypes["Dynamic"] = 4] = "Dynamic";
    VueI18NExtractReportTypes[VueI18NExtractReportTypes["All"] = 7] = "All";
  })(exports.VueI18NExtractReportTypes || (exports.VueI18NExtractReportTypes = {}));

  const mightBeUsedDynamically = function (languageItem, dynamicKeys) {
    return dynamicKeys.some(dynamicKey => languageItem.path.includes(dynamicKey.path));
  };

  function extractI18NReport(parsedVueFiles, parsedLanguageFiles, reportType = exports.VueI18NExtractReportTypes.Missing + exports.VueI18NExtractReportTypes.Unused) {
    const missingKeys = [];
    const unusedKeys = [];
    const dynamicKeys = [];
    const dynamicReportEnabled = reportType & exports.VueI18NExtractReportTypes.Dynamic;
    Object.keys(parsedLanguageFiles).forEach(language => {
      let languageItems = parsedLanguageFiles[language];
      parsedVueFiles.forEach(vueItem => {
        const usedByVueItem = function (languageItem) {
          return languageItem.path === vueItem.path || languageItem.path.startsWith(vueItem.path + '.');
        };

        if (dynamicReportEnabled && (vueItem.path.includes('${') || vueItem.path.endsWith('.'))) {
          dynamicKeys.push(_extends({}, vueItem, {
            language
          }));
          return;
        }

        if (!parsedLanguageFiles[language].some(usedByVueItem)) {
          missingKeys.push(_extends({}, vueItem, {
            language
          }));
        }

        languageItems = languageItems.filter(languageItem => dynamicReportEnabled ? !mightBeUsedDynamically(languageItem, dynamicKeys) && !usedByVueItem(languageItem) : !usedByVueItem(languageItem));
      });
      unusedKeys.push(...languageItems.map(item => _extends({}, item, {
        language
      })));
    });
    let extracts = {};

    if (reportType & exports.VueI18NExtractReportTypes.Missing) {
      extracts = Object.assign(extracts, {
        missingKeys
      });
    }

    if (reportType & exports.VueI18NExtractReportTypes.Unused) {
      extracts = Object.assign(extracts, {
        unusedKeys
      });
    }

    if (dynamicReportEnabled) {
      extracts = Object.assign(extracts, {
        dynamicKeys
      });
    }

    return extracts;
  }
  function extractI18NLangFilesSynchronizationReport(parsedLanguageFiles, missingKeysOptions) {
    const missingKeys = [];

    if (missingKeysOptions.mainLanguageToSyncKeys) {
      const otherLanguages = _extends({}, parsedLanguageFiles);

      delete otherLanguages[missingKeysOptions.mainLanguageToSyncKeys];
      const mainLanguageKeys = parsedLanguageFiles[missingKeysOptions.mainLanguageToSyncKeys] || [];
      mainLanguageKeys.forEach(({
        path
      }) => {
        Object.entries(otherLanguages).forEach(([lang, iItems]) => {
          if (!iItems.some(iItem => iItem.path === path)) {
            missingKeys.push({
              path,
              language: lang
            });
          }
        });
      });
    } // detect empty translations for some languages (mainly for English)


    Object.entries(parsedLanguageFiles).forEach(([lang, iItems]) => {
      if (missingKeysOptions.addValueForLanguages.includes(lang)) {
        iItems.filter(({
          translated
        }) => !translated).forEach(({
          path
        }) => {
          missingKeys.push({
            path,
            language: lang
          });
        });
      }
    });
    return {
      missingKeys
    };
  }
  async function writeReportToFile(report, writePath) {
    const reportString = JSON.stringify(report);
    return new Promise((resolve, reject) => {
      fs.writeFile(writePath, reportString, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  if (!Array.prototype.flatMap) {
    function flatMap(f, ctx) {
      // @ts-ignore
      return this.reduce((r, x, i, a) => r.concat(f.call(ctx, x, i, a)), []);
    }

    Array.prototype.flatMap = flatMap;
  }
  function createI18NReport(vueFiles, languageFiles, command, missingKeysOptions) {
    const resolvedVueFiles = path.resolve(process.cwd(), vueFiles);
    const resolvedLanguageFiles = path.resolve(process.cwd(), languageFiles);
    const parsedVueFiles = parseVueFiles(resolvedVueFiles);
    const parsedLanguageFiles = parseLanguageFiles(resolvedLanguageFiles, missingKeysOptions);
    const reportType = command.dynamic ? exports.VueI18NExtractReportTypes.All : exports.VueI18NExtractReportTypes.Missing + exports.VueI18NExtractReportTypes.Unused;
    const report = extractI18NReport(parsedVueFiles, parsedLanguageFiles, reportType);
    const syncReport = extractI18NLangFilesSynchronizationReport(parsedLanguageFiles, missingKeysOptions); // @ts-ignore

    report.missingKeys = [...report.missingKeys, ...syncReport.missingKeys];
    return report;
  }

  function getStatisticsForKeys(keysData = []) {
    const result = {
      uniqueKeys: {},
      keysNumbers: {}
    };
    result.uniqueKeys = keysData.reduce((accumulator, currentValue) => {
      const langStatistics = accumulator[currentValue.language || '?'] = accumulator[currentValue.language || '?'] || {};
      langStatistics[currentValue.path] = (langStatistics[currentValue.path] || 0) + 1;
      return accumulator;
    }, {
      'en': {}
    });
    result.keysNumbers = Object.keys(result.uniqueKeys).reduce((acc, language) => {
      acc[language] = Object.keys(result.uniqueKeys[language]).length;
      return acc;
    }, {});
    return result;
  }

  async function reportCommand(command) {
    const {
      vueFiles,
      languageFiles,
      output,
      add,
      dynamic,
      dotNotation,
      addValueForLanguages,
      mainLanguageToSyncKeys,
      jsonSortKeys,
      jsonIndentCharacters,
      detailedReport
    } = command;
    const outputOptions = {
      sortKeys: jsonSortKeys,
      indentationString: ((indentationConfig = '2,space') => {
        const charactersMap = {
          'space': ' ',
          'tab': '\t'
        };
        const [charactersAmount, character] = indentationConfig.split(',');
        return ''.padEnd(Number(charactersAmount), charactersMap[character]);
      })(jsonIndentCharacters)
    };
    const missingKeysOptions = {
      dotNotation,
      addValueForLanguages: addValueForLanguages instanceof Array ? addValueForLanguages : addValueForLanguages ? [addValueForLanguages] : [],
      mainLanguageToSyncKeys
    };
    const report = createI18NReport(vueFiles, languageFiles, command, missingKeysOptions);

    if (detailedReport) {
      const normalizeKeysInfo = keyInfo => {
        delete keyInfo.translated;
        if (keyInfo.file) keyInfo.file = path.relative(process.cwd(), keyInfo.file).replace(/\\/g, '/');
        return keyInfo;
      };

      if (report.missingKeys) console.info('missing keys: '), console.table([...report.missingKeys].map(normalizeKeysInfo));
      if (report.unusedKeys) console.info('unused keys: '), console.table([...report.unusedKeys].map(normalizeKeysInfo));
      if (report.dynamicKeys && dynamic && dynamic > 1) console.info('dynamic detected keys: '), console.table([...report.dynamicKeys].map(normalizeKeysInfo));
    }

    if (output) {
      await writeReportToFile(report, path.resolve(process.cwd(), output));
      console.log(`The report has been has been saved to ${output}`);
    }

    const summaryReport = _extends({
      'Missing keys': getStatisticsForKeys(report.missingKeys).keysNumbers,
      'Unused keys': getStatisticsForKeys(report.unusedKeys).keysNumbers
    }, dynamic ? {
      'Dynamic keys': getStatisticsForKeys(report.dynamicKeys).keysNumbers
    } : {});

    console.info('\nSummary report:');
    console.table(summaryReport);

    if (add && report.missingKeys && report.missingKeys.length > 0) {
      const resolvedLanguageFiles = path.resolve(process.cwd(), languageFiles);
      writeMissingToLanguage(resolvedLanguageFiles, report.missingKeys, missingKeysOptions, outputOptions);
      console.log('The missing keys have been added to your languages files');
    }
  }

  var report = {
    __proto__: null,
    createI18NReport: createI18NReport,
    reportCommand: reportCommand,
    readVueFiles: readVueFiles,
    parseVueFiles: parseVueFiles,
    writeMissingToLanguage: writeMissingToLanguage,
    parseLanguageFiles: parseLanguageFiles,
    get VueI18NExtractReportTypes () { return exports.VueI18NExtractReportTypes; },
    extractI18NReport: extractI18NReport,
    extractI18NLangFilesSynchronizationReport: extractI18NLangFilesSynchronizationReport,
    writeReportToFile: writeReportToFile
  };

  var index = _extends({}, report);

  exports.createI18NReport = createI18NReport;
  exports.default = index;
  exports.extractI18NLangFilesSynchronizationReport = extractI18NLangFilesSynchronizationReport;
  exports.extractI18NReport = extractI18NReport;
  exports.parseLanguageFiles = parseLanguageFiles;
  exports.parseVueFiles = parseVueFiles;
  exports.readVueFiles = readVueFiles;
  exports.reportCommand = reportCommand;
  exports.writeMissingToLanguage = writeMissingToLanguage;
  exports.writeReportToFile = writeReportToFile;

})));
//# sourceMappingURL=vue-i18n-extract.umd.js.map
