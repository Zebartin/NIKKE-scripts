const Device = require('../../../../common/device/device');
const logger = require('../../../../common/base/logger');
const { NotRunningError } = require('../../../../common/base/error');

class Magic {
  static magicName = '';
  constructor(device) {
    /**@type {Device} */
    this.device = device;
  }
  clickObject(object) {
    if (object === null)
      return;
    let t = object.text();
    if (!t)
      t = object.id();
    if (!t)
      t = object.desc();
    if (t)
      logger.debug(`点击"${t}"`);
    let x = object;
    while (x != null && !x.clickable()) {
      x = x.parent();
    }
    if (x != null)
      x.click();
  }
  open() { }
  close() { }
}
class V2RayNG extends Magic {
  static magicName = 'v2rayNG';
  appStart() {
    this.device.appStart(V2RayNG.magicName);
    let checked = text('配置文件').findOne(5000);
    if (checked == null) {
      throw new NotRunningError(`${V2RayNG.magicName}无法启动`);
    }
  }
  open() {
    this.appStart();
    // 关闭连接，否则会影响真连接测试
    if (id('tv_test_state').findOne().text() != '未连接')
      this.clickObject(id('fab').findOne());
    let i;
    const maxRetry = 10;
    for (i = 0; i < maxRetry; ++i) {
      this.clickObject(desc('更多选项').findOne());
      this.clickObject(text('测试全部配置真连接').findOne());
      textEndsWith('ms').waitFor();
      this.clickObject(desc('更多选项').findOne());
      this.clickObject(text('按测试结果排序').findOne());
      let firstCard = id("info_container").findOne();
      let firstDelay = firstCard.findOne(textEndsWith('ms'));
      if (firstDelay != null && firstDelay.text() != '-1ms') {
        this.clickObject(firstCard);
        break;
      }
      this.clickObject(desc('更多选项').findOne());
      this.clickObject(text('更新订阅').findOne());
      sleep(3000);
    }
    if (i == maxRetry) {
      throw new Error('启动v2rayNG服务失败');
    }
    this.clickObject(id('fab').findOne());
  }
  close() {
    this.appStart();
    if (id('tv_test_state').findOne().text() != '未连接')
      this.clickObject(id('fab').findOne());
    this.device.appStop(V2RayNG.magicName);
  }
}
class ClashForAndroid extends Magic {
  static magicName = 'Clash for Android';
  appStart() {
    this.device.appStart(ClashForAndroid.magicName);
    let checked = text('配置').findOne(5000);
    if (checked == null) {
      throw new NotRunningError(`${ClashForAndroid.magicName}无法启动`);
    }
  }
  open() {
    this.appStart();
    this.clickObject(text('运行中').findOnce());
    this.clickObject(text('点此启动').findOne());
    this.clickObject(text('代理').findOne());
    this.clickObject(desc('更多').findOne());
    this.clickObject(id('title').text('模式').findOne());
    this.clickObject(id('title').text('全局模式').findOne());
    this.clickObject(id('activity_bar_close_view').desc('关闭').findOne());
  }
  close() {
    this.appStart();
    this.clickObject(text('运行中').findOnce());
    this.device.appStop(ClashForAndroid.magicName);
  }
}

function constructMagic(device, magicName) {
  const magics = [
    V2RayNG, ClashForAndroid
  ];
  for (let m of magics) {
    if (magicName == m.magicName) {
      return new m(device);
    }
  }
  return new Magic(device);
}

module.exports = constructMagic;