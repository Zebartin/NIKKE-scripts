const logger = require("./logger");

importPackage(org.opencv.core);
importPackage(org.opencv.features2d);
importPackage(org.opencv.calib3d);
importPackage(org.opencv.imgproc);

let utils = {};
/**
 * 
 * @param {Rect} area 
 * @param {number[]} offset 
 * @returns {Rect}
 */
utils.areaOffset = function (area, offset) {
  let [x, y] = offset;
  return new android.graphics.Rect(
    area.left + x, area.top + y,
    area.right + x, area.bottom + y
  );
}
/**
 * 
 * @param {Rect} area 
 * @param {number|number[]} pad 
 * @returns {Rect}
 */
utils.areaPad = function (area, pad) {
  let l, r, t, b;
  if (!Array.isArray(pad)) {
    l = r = t = b = pad;
  } else if (pad.length == 2) {
    [l, t] = pad;
    [r, b] = pad;
  } else if (pad.length == 4) {
    [l, t, r, b] = pad;
  }
  return new android.graphics.Rect(
    area.left + l, area.top + t,
    area.right - r, area.bottom - b
  );
}
/**
 * 
 * @param {Rect} area 
 * @param {number} scale 
 * @returns {Rect}
 */
utils.scaleRect = function (area, scale) {
  let diff = (1 - scale) / 2;
  let dw = area.width() * diff, dh = area.height() * diff;
  return utils.areaPad(area, [dw, dh]);
}
/**
 * 
 * @param {Rect} rect
 * @param {boolean} round
 */
utils.randomRectPoint = function (rect, round) {
  let x = Math.random() * rect.width() + rect.left;
  let y = Math.random() * rect.height() + rect.top;
  if (round !== false) {
    x = Math.round(x);
    y = Math.round(y);
  }
  return [x, y];
};
utils.limitIn = function (x, lower, upper) {
  return Math.max(Math.min(x || 0, upper), lower);
};
utils.buildRegion = function (region, img) {
  let x, y, w, h;
  if (region instanceof android.graphics.Rect) {
    x = region.left;
    y = region.top;
    w = region.width();
    h = region.height();
  } else {
    region = region || [];
    x = region[0] === undefined ? 0 : region[0];
    y = region[1] === undefined ? 0 : region[1];
    w = region[2] === undefined ? (img.width - x) : region[2];
    h = region[3] === undefined ? (img.height - y) : region[3];
  }
  if (x < 0 || y < 0 || x + w > img.width || y + h > img.height)
    throw new Error("out of region: region = [" + [x, y, w, h] + "], image.size = [" + [img.width, img.height] + "]");
  return [x, y, w, h];
};
/**
 * @param {number|string|number[]} color
 */
utils.colorToRGB = function (color) {
  let r, g, b;
  if (Array.isArray(color)) {
    r = color[0];
    g = color[1];
    b = color[2];
  } else if (typeof color === 'string' || typeof color === 'number') {
    r = colors.red(color);
    g = colors.green(color);
    b = colors.blue(color);
  } else {
    throw new Error(`Invalid color: ${color}`);
  }
  return [r, g, b];
};
utils.saveImage = function (image, file) {
  if (!file) {
    let dir = files.path('./images/nikkerror');
    if (!files.exists(dir)) {
      dir = files.cwd();
    }
    file = files.join(dir, new Date().toTimeString().split(' ')[0].replace(/:/g, '_') + '.jpg');
  }
  file = files.path(file);
  try {
    images.save(image, file);
  } catch (error) {
    if (error.message.includes('FileNotFoundException')) {
      logger.error(error.message);
      return null;
    }
    throw error;
  }
  return file;
}
/**
 * Reference: https://docs.opencv.org/3.4/d1/de0/tutorial_py_feature_homography.html
 * @param {Image} trainImg
 * @param {Image} queryImg
 * @param {Rect} area
 * @param {Number} minMatchCount
 * @param {boolean} debug
 * @returns {Rect}
 */
utils.matchFeature = function (trainImg, queryImg, area = null, minMatchCount = 4, debug = false) {
  let grayImg1 = images.grayscale(queryImg);
  let grayImg2 = images.grayscale(trainImg);
  let clipImg = null;
  let beforeReturn = function () {
    grayImg1 && grayImg1.recycle();
    grayImg2 && grayImg2.recycle();
    clipImg && clipImg.recycle();
  };
  let img1 = grayImg1.getMat(), img2 = grayImg2.getMat();
  if (area) {
    let [x, y, w, h] = utils.buildRegion(area, grayImg2);
    clipImg = images.clip(grayImg2, x, y, w, h);
    img2 = clipImg.getMat();
  }
  // 1、SIFT算法提取特征
  let sift = SIFT.create();
  let kp1 = MatOfKeyPoint();
  let des1 = Mat();
  let kp2 = MatOfKeyPoint();
  let des2 = Mat();
  sift.detectAndCompute(img1, Mat(), kp1, des1);
  sift.detectAndCompute(img2, Mat(), kp2, des2);
  // 2、穷举找k近邻匹配
  let bf = BFMatcher();
  let matches = java.lang.reflect.Array.newInstance(MatOfDMatch, 0);
  matches = java.util.ArrayList(java.util.Arrays.asList(matches));
  bf.knnMatch(des1, des2, matches, 2);
  // 3、对匹配结果进行筛选，ratio test
  let srcPtsList = java.util.ArrayList(MatOfPoint2f().toList());
  let dstPtsList = java.util.ArrayList(MatOfPoint2f().toList());
  for (let i = 0; i < matches.size(); i++) {
    let t = matches.get(i).toArray();
    if (t.length < 2)
      continue;
    if (t[0].distance < 0.75 * t[1].distance) {
      srcPtsList.add(kp1.toArray()[t[0].queryIdx].pt);
      dstPtsList.add(kp2.toArray()[t[0].trainIdx].pt);
    }
  }
  if (srcPtsList.size() < minMatchCount) {
    beforeReturn();
    return null;
  }
  let srcPts = MatOfPoint2f();
  let dstPts = MatOfPoint2f();
  srcPts.fromList(srcPtsList);
  dstPts.fromList(dstPtsList);
  // 4、计算单应性矩阵
  let homoMat = Calib3d.findHomography(srcPts, dstPts, Calib3d.RANSAC, 5.0);
  // 5、根据homoMat计算透视变换
  let pts = Mat(4, 1, CvType.CV_32FC2);
  let dst = Mat(4, 1, CvType.CV_32FC2);
  let doubleArr = java.lang.reflect.Array.newInstance(java.lang.Double.TYPE, 2);
  doubleArr[0] = 0;
  doubleArr[1] = 0;
  pts.put(0, 0, doubleArr);
  doubleArr[1] = img1.height() - 1;
  pts.put(1, 0, doubleArr);
  doubleArr[0] = img1.width() - 1;
  pts.put(2, 0, doubleArr);
  doubleArr[1] = 0;
  pts.put(3, 0, doubleArr);
  try {
    Core.perspectiveTransform(pts, dst, homoMat);
  } catch (error) {
    log(error);
    beforeReturn();
    return null;
  }
  // 6、从dst中获得投影点，并转化为Rect
  let ptsArr = [];
  for (let i = 0; i < dst.rows(); ++i) {
    let [x, y] = dst.get(i, 0);
    ptsArr.push(Point(x, y))
  }
  let bounds = new android.graphics.Rect();
  pts = [MatOfPoint()];
  pts[0].fromArray(ptsArr);
  ptsArr.sort((a, b) => a.x - b.x);
  bounds.left = Math.round((ptsArr[0].x + ptsArr[1].x) / 2);
  bounds.right = Math.round((ptsArr[2].x + ptsArr[3].x) / 2);
  ptsArr.sort((a, b) => a.y - b.y);
  bounds.top = Math.round((ptsArr[0].y + ptsArr[1].y) / 2);
  bounds.bottom = Math.round((ptsArr[2].y + ptsArr[3].y) / 2);
  if (debug) {
    Imgproc.polylines(img2, pts, true, Scalar(0), 3, Imgproc.LINE_AA);
    ptsArr[0] = Point(bounds.left, bounds.top);
    ptsArr[1] = Point(bounds.left, bounds.bottom);
    ptsArr[2] = Point(bounds.right, bounds.bottom);
    ptsArr[3] = Point(bounds.right, bounds.top);
    pts[0].fromArray(ptsArr);
    Imgproc.polylines(img2, pts, true, Scalar(255), 3, Imgproc.LINE_AA);
    let file = utils.saveImage(images.matToImage(img2));
    log(`Feature matching saved to: ${file}`);
  }
  if (area) {
    let [x, y] = utils.buildRegion(area, trainImg);
    bounds = utils.areaOffset(bounds, [x, y]);
  }
  beforeReturn();
  return bounds;
};
/**
 * Distance metric used here is a little bit different from that of ALAS/SRC
 * The result may be slightly smaller
 * @param {Image} image 
 * @param {string|number|number[]} color 
 */
utils.colorSimilarity2d = function (image, color) {
  let mat = image.getMat();
  let diff = new Mat();
  let channels = new java.util.ArrayList();
  let maxDiff = new Mat();
  let result = new Mat();
  let [r, g, b] = utils.colorToRGB(color);
  Core.absdiff(mat, new Scalar(r, g, b), diff);
  Core.split(diff, channels);
  Core.max(channels[0], channels[1], maxDiff);
  Core.max(channels[2], maxDiff, maxDiff);
  Core.subtract(new Mat(new Size(maxDiff.cols(), maxDiff.rows()), CvType.CV_8UC1, new Scalar(255)), maxDiff, result);
  // Manually releasing Mats is unnecessary here (probably?)
  return result;
}
/**
 * @param {Image} image
 * @param {string} color
 * @param {number} threshold
 * @param {number} count
 */
utils.imageColorCount = function (image, color, threshold = 221, count = 50) {
  let mask = utils.colorSimilarity2d(image, color);
  Core.inRange(mask, new Scalar(threshold), new Scalar(255), mask);
  let inRangeCount = Core.countNonZero(mask);
  log(`${inRangeCount}/${image.getWidth() * image.getHeight()}`);
  return inRangeCount > count;
}
/**
 * 
 * @param {Image} image 
 * @param {Rect} area 
 * @param {number|number[]} threshold 
 * @param {string} thresholdType 
 * @param {Function} filter 
 * @param {boolean} debug
 */
utils.detectContours = function (image, area = null, threshold = 160, thresholdType = 'BINARY_INV', filter = null, debug = false) {
  let clipImg = image;
  let x = 0, y = 0, w = image.width, h = image.height;
  if (area !== null) {
    [x, y, w, h] = utils.buildRegion(area, image);
    clipImg = images.clip(image, x, y, w, h);
  }
  if (Array.isArray(threshold)) {
    // random here is a function built in autox.js
    threshold = random(threshold[0], threshold[1]);
    if (debug)
      logger.debug(`Random threshold: ${threshold}`);
  }
  let grayImg = images.cvtColor(clipImg, "BGR2GRAY");
  let threImg = images.threshold(grayImg, threshold, 255, thresholdType);
  let ret = [];
  let threImgMat = threImg.getMat();
  let contours = java.lang.reflect.Array.newInstance(MatOfPoint, 0);
  contours = new java.util.ArrayList(java.util.Arrays.asList(contours));
  Imgproc.findContours(threImgMat, contours, Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE);
  for (let i = 0; i < contours.size(); ++i) {
    let contour2f = new MatOfPoint2f(contours.get(i).toArray());
    let epsilon = Imgproc.arcLength(contour2f, true) * 0.01;
    let approxCurve = new MatOfPoint2f();
    Imgproc.approxPolyDP(contour2f, approxCurve, epsilon, true);
    let pts = new MatOfPoint(approxCurve.toArray());
    let rect = Imgproc.boundingRect(pts);
    let newRect = new android.graphics.Rect(
      rect.x + x, rect.y + y,
      rect.x + rect.width + x,
      rect.y + rect.height + y
    );
    if (filter && !filter(newRect)) {
      if (debug)
        logger.debug(`Filterred: ${newRect}`);
      continue;
    }
    ret.push(newRect);
    if (debug) {
      logger.debug(`Found: ${newRect}`);
      Imgproc.rectangle(threImgMat, Point(rect.x, rect.y), Point(rect.x + rect.width, rect.y + rect.height), Scalar(150), 3);
    }
  }
  if (debug) {
    let file = utils.saveImage(images.matToImage(threImgMat));
    logger.debug(`Contours detecting saved to: ${file}`);
  }
  threImg.recycle();
  grayImg.recycle();
  if (area !== null)
    clipImg.recycle();
  ret.sort((a, b) => {
    let t = a.top - b.top;
    if (Math.abs(t) < 20)
      return a.left - b.left;
    return t;
  });
  return ret;
}

module.exports = utils;
