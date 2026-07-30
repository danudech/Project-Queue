import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const messagesDirectory = path.join(projectRoot, "src", "messages");
const sourceDirectory = path.join(projectRoot, "src");

const readJson = (fileName) =>
  JSON.parse(fs.readFileSync(path.join(messagesDirectory, fileName), "utf8"));

function flattenMessages(value, prefix = "", output = {}) {
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flattenMessages(child, fullKey, output);
    } else {
      output[fullKey] = child;
    }
  }
  return output;
}

function interpolationVariables(value) {
  return [...String(value).matchAll(/\{([\w]+)\}/g)]
    .map((match) => match[1])
    .sort()
    .join(",");
}

function collectSourceFiles(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, output);
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      output.push(fullPath);
    }
  }
  return output;
}

function findTranslationCalls(fileName, source) {
  const calls = [];
  const bindings =
    /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*["']([^"']+)["']\s*\)/g;
  const namespacesByVariable = new Map();

  for (const binding of source.matchAll(bindings)) {
    const [, variableName, namespace] = binding;
    const namespaces = namespacesByVariable.get(variableName) ?? new Set();
    namespaces.add(namespace);
    namespacesByVariable.set(variableName, namespaces);
  }

  for (const [variableName, namespaceSet] of namespacesByVariable) {
    const callPattern = new RegExp(
      `\\b${variableName}\\(\\s*["']([^"']+)["']`,
      "g",
    );
    for (const call of source.matchAll(callPattern)) {
      calls.push({
        fileName,
        namespaces: [...namespaceSet],
        relativeKey: call[1],
      });
    }
  }

  return calls;
}

const english = flattenMessages(readJson("en.json"));
const thai = flattenMessages(readJson("th.json"));
const englishKeys = new Set(Object.keys(english));
const thaiKeys = new Set(Object.keys(thai));

const onlyEnglish = [...englishKeys].filter((key) => !thaiKeys.has(key));
const onlyThai = [...thaiKeys].filter((key) => !englishKeys.has(key));
const placeholderMismatches = [...englishKeys].filter(
  (key) =>
    thaiKeys.has(key) &&
    interpolationVariables(english[key]) !== interpolationVariables(thai[key]),
);

const sourceCalls = collectSourceFiles(sourceDirectory).flatMap((fileName) =>
  findTranslationCalls(fileName, fs.readFileSync(fileName, "utf8")),
);
const missingSourceKeys = sourceCalls.filter(
  ({ namespaces, relativeKey }) =>
    !namespaces.some((namespace) => {
      const key = `${namespace}.${relativeKey}`;
      return englishKeys.has(key) && thaiKeys.has(key);
    }),
);

function printSection(title, rows) {
  console.log(`${title}: ${rows.length}`);
  for (const row of rows) console.log(`  ${row}`);
}

printSection("Keys present only in en.json", onlyEnglish);
printSection("Keys present only in th.json", onlyThai);
printSection(
  "Interpolation variable mismatches",
  placeholderMismatches.map(
    (key) =>
      `${key} (en: ${interpolationVariables(english[key]) || "-"}; th: ${
        interpolationVariables(thai[key]) || "-"
      })`,
  ),
);
printSection(
  "Translation keys referenced by source but missing",
  missingSourceKeys.map(
    ({ fileName, namespaces, relativeKey }) =>
      `${path.relative(projectRoot, fileName)} -> ${namespaces.join("|")}.${
        relativeKey
      }`,
  ),
);

console.log(
  `Message totals: en=${englishKeys.size}, th=${thaiKeys.size}; source calls=${sourceCalls.length}`,
);

if (
  onlyEnglish.length ||
  onlyThai.length ||
  placeholderMismatches.length ||
  missingSourceKeys.length
) {
  process.exitCode = 1;
}
