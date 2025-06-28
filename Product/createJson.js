const fs = require("fs");
const path = require("path");

const GITHUB_REPO_URL = "https://github.com/Sibghataziz/The-preppy_images/blob/main/Product";
const IMAGES_FOLDER_PATH = path.join(__dirname);
const SUPPORTED_IMAGE_FORMATS = [".png", ".jpg", ".jpeg", ".webp"];

function convertGithubToRawImageURL(githubUrl) {
  return githubUrl
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");
}

function getOptimizedImageUrl(rawUrl, width = 600, quality = 75) {
  const strippedUrl = rawUrl.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(strippedUrl)}&w=${width}&output=webp&q=${quality}`;
}


function generateJsonData() {
  const folders = fs.readdirSync(IMAGES_FOLDER_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const output = folders.map(folderName => {
    const folderPath = path.join(IMAGES_FOLDER_PATH, folderName);
    const files = fs.readdirSync(folderPath);

    const imageFiles = files
      .filter(file => SUPPORTED_IMAGE_FORMATS.includes(path.extname(file).toLowerCase()))
      .sort();

    if (imageFiles.length === 0) return null;

    const defaultImage = getOptimizedImageUrl(convertGithubToRawImageURL(`${GITHUB_REPO_URL}/${encodeURIComponent(folderName)}/${encodeURIComponent(imageFiles[0])}`));
    const images = imageFiles.map((fileName, index) => ({
      link: getOptimizedImageUrl(convertGithubToRawImageURL(`${GITHUB_REPO_URL}/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`)),
      alt: `image ${index + 1}`
    }));

    return {
      name: folderName,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      defaultImage,
      images,
      message: folderName
    };
  }).filter(Boolean);

  fs.writeFileSync("output.json", JSON.stringify(output, null, 2), "utf-8");
  console.log("✅ JSON file created: output.json");
}

generateJsonData();
