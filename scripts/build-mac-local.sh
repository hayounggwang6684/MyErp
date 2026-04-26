#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RELEASE_DIR="$ROOT_DIR/release"
DIST_DIR="$ROOT_DIR/dist/mac"
ARCHIVE_DIR="$DIST_DIR/archive"
CURRENT_VERSION="$(cd "$ROOT_DIR" && node -p "require('./package.json').version")"
CURRENT_MAJOR="${CURRENT_VERSION%%.*}"
REST_VERSION="${CURRENT_VERSION#*.}"
CURRENT_MINOR="${REST_VERSION%%.*}"
ARCHIVE_VERSION="${CURRENT_MAJOR}.${CURRENT_MINOR}.0"
ARCHIVE_VERSION_DIR="$ARCHIVE_DIR/$ARCHIVE_VERSION"

echo "Cleaning local macOS artifact directory..."
mkdir -p "$DIST_DIR"
mkdir -p "$ARCHIVE_DIR"
find "$DIST_DIR" -maxdepth 1 -type f \( -name "*.dmg" -o -name "*.zip" -o -name "*latest*.yml" -o -name "*.blockmap" \) -delete

echo "Building macOS client artifacts..."
cd "$ROOT_DIR"
npx electron-builder --mac dmg zip --universal

echo "Collecting artifacts into dist/mac..."
for artifact in \
  "$RELEASE_DIR/Sunjin ERP-$CURRENT_VERSION"-*.dmg \
  "$RELEASE_DIR/Sunjin ERP-$CURRENT_VERSION"-*.zip \
  "$RELEASE_DIR"/*latest*.yml \
  "$RELEASE_DIR/Sunjin ERP-$CURRENT_VERSION"-*.blockmap
do
  [ -e "$artifact" ] || continue
  cp "$artifact" "$DIST_DIR/"
done

for artifact in "$DIST_DIR/Sunjin ERP-$CURRENT_VERSION"-*.dmg; do
  [ -e "$artifact" ] || continue
  cp "$artifact" "$DIST_DIR/Sunjin-ERP-latest-universal.dmg"
  break
done

for artifact in "$DIST_DIR/Sunjin ERP-$CURRENT_VERSION"-*.zip; do
  [ -e "$artifact" ] || continue
  cp "$artifact" "$DIST_DIR/Sunjin-ERP-latest-universal.zip"
  break
done

echo "Archiving current minor line into dist/mac/archive..."
mkdir -p "$ARCHIVE_VERSION_DIR"
find "$DIST_DIR" -maxdepth 1 -type f \( -name "Sunjin ERP-$CURRENT_VERSION-*.dmg" -o -name "Sunjin ERP-$CURRENT_VERSION-*.zip" -o -name "Sunjin ERP-$CURRENT_VERSION-*.blockmap" -o -name "*latest*.yml" \) ! -name "Sunjin-ERP-latest-universal.dmg" ! -name "Sunjin-ERP-latest-universal.zip" -print0 | while IFS= read -r -d '' artifact; do
  cp "$artifact" "$ARCHIVE_VERSION_DIR/"
done

node -e "
const fs = require('fs');
const path = require('path');

const archiveDir = process.argv[1];
const currentMajor = Number(process.argv[2]);

const parse = (value) => value.split('.').map((part) => Number(part));
const compare = (a, b) => {
  const av = parse(a);
  const bv = parse(b);
  for (let i = 0; i < 3; i += 1) {
    if (av[i] !== bv[i]) return av[i] - bv[i];
  }
  return 0;
};

const versionDirs = () =>
  fs.existsSync(archiveDir)
    ? fs
        .readdirSync(archiveDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^\\d+\\.\\d+\\.\\d+$/.test(entry.name))
        .map((entry) => entry.name)
        .sort(compare)
    : [];

let versions = versionDirs();
const olderMajor = versions.filter((version) => parse(version)[0] < currentMajor);
if (olderMajor.length > 1) {
  const keep = olderMajor[olderMajor.length - 1];
  for (const version of olderMajor) {
    if (version === keep) continue;
    fs.rmSync(path.join(archiveDir, version), { recursive: true, force: true });
  }
}

versions = versionDirs();
while (versions.length > 10) {
  const oldest = versions.shift();
  fs.rmSync(path.join(archiveDir, oldest), { recursive: true, force: true });
}
" "$ARCHIVE_DIR" "$CURRENT_MAJOR"

echo ""
echo "Local macOS artifacts are ready in:"
echo "  $DIST_DIR"
ls -1 "$DIST_DIR"
