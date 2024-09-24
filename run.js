const http = require("http");
const path = require("path");
const { argv } = require("process");

function sendCmd(cmd, path) {
  console.error("执行命令：", cmd);
  path = encodeURI(path)
  var req = http.get("http://127.0.0.1:9317/exec?cmd=" + cmd + "&path=" + path, (res) => {
    res.setEncoding('utf8');
    res.on('data', (data) => {
      console.error(data);
    }).on("error", () => {
      console.error("返回数据错误");
    });
  });
  req.on('error', function (err) {
    console.error("watch模式，自动" + cmd + "失败,autox.js服务未启动");
    console.error("请使用 ctrl+shift+p 快捷键，启动auto.js服务");
  });
}
let cmd = argv[2] || 'run';
console.log(cmd);
if (cmd == 'run') {
  let filePath = argv[3] || './dist/NIKKE-scripts/test.js';
  sendCmd('rerun', path.resolve(filePath));
} else if (cmd == 'save') {
  let projectPath = './dist/NIKKE-scripts';
  sendCmd('save', path.resolve(projectPath));
}