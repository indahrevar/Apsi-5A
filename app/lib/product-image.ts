const legacyMenuImagePaths: Record<string, string> = {
  "/figma/menu-brownies.png": "/figma/menu-brownies.jpg",
  "/figma/menu-bolu.png": "/figma/menu-bolu.jpg",
  "/figma/menu-risol.png": "/figma/menu-risol.jpg",
  "/figma/menu-pastel.png": "/figma/menu-pastel.jpg",
  "/figma/menu-lapis.png": "/figma/menu-lapis.jpg",
};

export const pinukuikImageUrl =
  "https://upload.wikimedia.org/wikipedia/commons/7/74/Pinukuik.jpg";

export function getProductImageUrl(image: string | null, productName: string) {
  if (!image && productName.startsWith("Pinukuik")) return pinukuikImageUrl;
  if (!image) return "/figma/menu-brownies.jpg";
  return legacyMenuImagePaths[image] ?? image;
}
