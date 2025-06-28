const fs = require("fs");
const path = require("path");

const GITHUB_REPO_URL = "https://github.com/Sibghataziz/The-preppy_images/blob/main/Product";
const IMAGES_FOLDER_PATH = path.join(__dirname);
const SUPPORTED_IMAGE_FORMATS = [".png", ".jpg", ".jpeg", ".webp"];
const CURRENT_DETAILS_PATH = path.join(__dirname, "CurrentProductDetails.json");
const LOG_FILE_PATH = path.join(__dirname, "log.txt");

function convertGithubToRawImageURL(githubUrl) {
  return githubUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
}

function getOptimizedImageUrl(rawUrl, width = 600, quality = 75) {
  const strippedUrl = rawUrl.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(strippedUrl)}&w=${width}&output=webp&q=${quality}`;
}

function generateJsonData() {
  let existingData = [];
  if (fs.existsSync(CURRENT_DETAILS_PATH)) {
    try {
      const rawData = fs.readFileSync(CURRENT_DETAILS_PATH, "utf-8");
      existingData = JSON.parse(rawData);
    } catch (err) {
      console.error("⚠️ Failed to read or parse CurrentProductDetails.json:", err);
    }
  }

  const existingMap = {};
  existingData.forEach(item => {
    if (item.name) {
      existingMap[item.name] = item;
    }
  });

  const folders = fs.readdirSync(IMAGES_FOLDER_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const output = [];
  const logLines = [];

  const existingFolderNames = Object.keys(existingMap);

  // Find and log new folders
  folders.forEach(folderName => {
    if (!existingMap[folderName]) {
      logLines.push(`🟢 New folder found: ${folderName}`);
    }

    const folderPath = path.join(IMAGES_FOLDER_PATH, folderName);
    const files = fs.readdirSync(folderPath);

    const imageFiles = files
      .filter(file => SUPPORTED_IMAGE_FORMATS.includes(path.extname(file).toLowerCase()))
      .sort();

    if (imageFiles.length === 0) return;

    const defaultImage = getOptimizedImageUrl(
      convertGithubToRawImageURL(`${GITHUB_REPO_URL}/${encodeURIComponent(folderName)}/${encodeURIComponent(imageFiles[0])}`)
    );

    const images = imageFiles.map((fileName, index) => ({
      link: getOptimizedImageUrl(convertGithubToRawImageURL(`${GITHUB_REPO_URL}/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`)),
      alt: `image ${index + 1}`
    }));

    const existing = existingMap[folderName] || {};

    output.push({
      name: folderName,
      description: existing.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      message: existing.message || folderName,
      defaultImage,
      images
    });
  });

  // Find and log removed folders
  existingFolderNames.forEach(existingFolder => {
    if (!folders.includes(existingFolder)) {
      logLines.push(`🔴 Folder missing from filesystem: ${existingFolder}`);
    }
  });

  fs.writeFileSync("output.json", JSON.stringify(output, null, 2), "utf-8");
  fs.writeFileSync(LOG_FILE_PATH, logLines.join("\n"), "utf-8");

  console.log("✅ JSON file created: output.json");
  console.log("📝 Log file created: log.txt");
}

generateJsonData();
