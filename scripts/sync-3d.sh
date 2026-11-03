#!/bin/sh
# 3D 웹 제작 페이지(원본: 01_Active/모션-카탈로그)를 public/3d 로 복사한다. 원본에서 고친 뒤 이 스크립트를 돌리고 커밋한다.
# 섬 화면(index.html)은 island.html 로 올린다. /3d 는 사이트 페이지이고 /3d/island.html 을 위쪽에 끼워 쓴다.
# 시안 폴더와 임시 확인 파일(__*.html)은 올리지 않는다.
set -e
SRC="${1:-$(cd "$(dirname "$0")/../.." && pwd)/모션-카탈로그}"
DST="$(cd "$(dirname "$0")/.." && pwd)/public/3d"
[ -f "$SRC/index.html" ] || { echo "원본이 없습니다: $SRC"; exit 1; }
rm -rf "$DST" && mkdir -p "$DST"
cp "$SRC/index.html" "$DST/island.html"
for p in assets configurator door hanok sign sofa space; do cp -R "$SRC/$p" "$DST/"; done
find "$DST" -name '__*' -delete
echo "복사함: $SRC -> $DST"
