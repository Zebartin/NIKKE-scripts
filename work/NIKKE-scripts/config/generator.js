const fs = require('fs');
const path = require('path');

function flattenJson(data) {
  let ret = {};
  for (let [key, value] of Object.entries(data)) {
    if (Array.isArray(value) || typeof value != 'object') {
      ret[key] = value;
    } else {
      for (let [k, v] of Object.entries(flattenJson(value))) {
        ret[`${key}_${k}`] = v;
      }
    }
  }
  return ret;
}

let configJson = {};
try {
  const data = fs.readFileSync(path.join(__dirname, 'config.json'));
  configJson = JSON.parse(data);
} catch (error) {
  console.error('Read config.json failed');
}

let properties = new Set();
let generated = [
  'const Config = require(\'../../../common/config/config\');',
  '',
  'class NikkeConfigGenerated extends Config {'
];

let lastAdded = false;
for (let [task, taskData] of Object.entries(configJson)) {
  if (lastAdded) {
    generated.push('');
  }
  lastAdded = false;
  for (let [key, value] of Object.entries(flattenJson(taskData))) {
    if (task == 'General') {
      key = `General_${key}`;
    }
    if (properties.has(key)) {
      continue;
    }
    if (typeof value == 'string') {
      value = `'${value}'`;
    } else if (Array.isArray(value)) {
      value = '[' + value.map(x => `'${x}'`).join(', ') + ']';
    }
    if (key == 'Scheduler_NextRun') {
      value = 'new Date()';
    }
    properties.add(key);
    lastAdded = true;
    generated.push(`  ${key} = ${value};`);
  }
}
generated.push('  constructor(configName) {');
generated.push('    super(configName);');
generated.push('    this.initProperties();');
generated.push('  }');
generated.push('}');
generated.push('');
generated.push('module.exports = NikkeConfigGenerated;');

fs.writeFileSync(path.join(__dirname, 'generated.js'), generated.join('\n'));