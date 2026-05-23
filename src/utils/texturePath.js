export function resolveTexturePath(path, TEXTURE_BASE = "./assets/textures/") {
  if (!path) return null;
  if (
    path.startsWith("assets/") ||
    path.startsWith("./") ||
    path.startsWith("/")
  )
    return path;
  return TEXTURE_BASE + path;
}
