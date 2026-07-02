const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../supervisor-app/android');
const destDir = path.join(__dirname, '../franchise-app/android');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Copying android folder from supervisor-app to franchise-app...');
if (fs.existsSync(destDir)) {
  console.log('Destination folder already exists, removing it first...');
  fs.rmSync(destDir, { recursive: true, force: true });
}
copyRecursiveSync(srcDir, destDir);
console.log('Android folder copied successfully!');

// Now rename the java package
const oldPkgPath = path.join(destDir, 'app/src/main/java/com/gomotarcarsupervisor');
const newPkgPath = path.join(destDir, 'app/src/main/java/com/gomotarcarfranchise');

if (fs.existsSync(oldPkgPath)) {
  console.log('Renaming package path...');
  fs.renameSync(oldPkgPath, newPkgPath);
}

// Update Kotlin files package name
const mainActivityPath = path.join(newPkgPath, 'MainActivity.kt');
const mainApplicationPath = path.join(newPkgPath, 'MainApplication.kt');

[mainActivityPath, mainApplicationPath].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/package com\.gomotarcarsupervisor/g, 'package com.gomotarcarfranchise');
    // Also replace reference in MainApplication
    content = content.replace(/com\.gomotarcarsupervisor/g, 'com.gomotarcarfranchise');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated package name in ${path.basename(filePath)}`);
  }
});

// Update app name in strings.xml
const stringsXmlPath = path.join(destDir, 'app/src/main/res/values/strings.xml');
if (fs.existsSync(stringsXmlPath)) {
  let content = fs.readFileSync(stringsXmlPath, 'utf8');
  content = content.replace(/GoMotarCar Supervisor/g, 'GoMotarCar Franchise');
  content = content.replace(/gomotarcar-supervisor/g, 'gomotarcar-franchise');
  fs.writeFileSync(stringsXmlPath, content, 'utf8');
  console.log('Updated app name in strings.xml');
}

// Update build.gradle
const buildGradlePath = path.join(destDir, 'app/build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  content = content.replace(/applicationId "com\.gomotarcarsupervisor"/g, 'applicationId "com.gomotarcarfranchise"');
  fs.writeFileSync(buildGradlePath, content, 'utf8');
  console.log('Updated applicationId in build.gradle');
}

console.log('🎉 Franchise App Android setup completed successfully!');
