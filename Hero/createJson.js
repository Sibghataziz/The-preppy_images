const fs = require("fs");
const path = require("path");

const GITHUB_REPO_URL = "https://github.com/Sibghataziz/The-preppy_images/blob/main/Hero";
const IMAGES_FOLDER_PATH = path.join(__dirname);
const SUPPORTED_IMAGE_FORMATS = [".png", ".jpg", ".jpeg", ".webp"];

function convertGithubToRawImageURL(githubUrl) {
  return githubUrl
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");
}

function getOptimizedImageUrl(rawUrl, width = 1000, quality = 75) {
  const strippedUrl = rawUrl.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${strippedUrl}&w=${width}&output=webp&q=${quality}`;
}

function generateImageLinks() {
  const files = fs.readdirSync(IMAGES_FOLDER_PATH);

  const imageLinks = files
    .filter(file => SUPPORTED_IMAGE_FORMATS.includes(path.extname(file).toLowerCase()))
    .map(file => {
      const githubUrl = `${GITHUB_REPO_URL}/${encodeURIComponent(file)}`;
      const rawUrl = convertGithubToRawImageURL(githubUrl);
      return getOptimizedImageUrl(rawUrl);
    });

  fs.writeFileSync("imageLinks.json", JSON.stringify(imageLinks, null, 2), "utf-8");
  console.log("✅ Image links saved to imageLinks.json");
}

generateImageLinks();
