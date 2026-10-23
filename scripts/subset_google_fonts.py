#!/usr/bin/env python3
"""구글 폰트를 쓰는 글자만 남겨 assets/fonts 에 저장한다.

빌드 때 next/font/google 이 구글에서 한글 글꼴 조각 수백 개를 받다가 자주 실패해서,
글꼴 파일을 저장소에 두고 next/font/local 로 읽는다.
원본 TTF는 google/fonts 저장소에서 .font-src/ 에 한 번 받아 두고(커밋하지 않음),
각 글꼴을 쓰는 파일과 그 파일이 가져오는 데모 부품·데이터의 글자만 남긴다.
문구를 고치거나 새 글자가 생기면 다시 실행할 것:

    python3 scripts/subset_google_fonts.py
"""

from __future__ import annotations

import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / ".font-src"
OUT_DIR = ROOT / "assets" / "fonts" / "google"
RAW = "https://raw.githubusercontent.com/google/fonts/main/ofl/"

BASE_CHARS = set(
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ"
    + "·—–‘’“”…※→←↑↓✓✕★☆∙‧•₩℃①②③④⑤"
    + " "
)

# 출력 이름: (원본 경로, 변수 글꼴이면 남길 굵기, 글자를 모을 파일. None이면 사이트 전체)
FONTS = {
    "BlackHanSans-Regular": ("blackhansans/BlackHanSans-Regular.ttf", None, None),
    "IBMPlexSansKR-Regular": ("ibmplexsanskr/IBMPlexSansKR-Regular.ttf", None, "IBM_Plex_Sans_KR"),
    "IBMPlexSansKR-Bold": ("ibmplexsanskr/IBMPlexSansKR-Bold.ttf", None, "IBM_Plex_Sans_KR"),
    "Jua-Regular": ("jua/Jua-Regular.ttf", None, "Jua"),
    "GowunBatang-Regular": ("gowunbatang/GowunBatang-Regular.ttf", None, "Gowun_Batang"),
    "GowunBatang-Bold": ("gowunbatang/GowunBatang-Bold.ttf", None, "Gowun_Batang"),
    "NanumPenScript-Regular": ("nanumpenscript/NanumPenScript-Regular.ttf", None, "Nanum_Pen_Script"),
    "NanumGothicCoding-Regular": ("nanumgothiccoding/NanumGothicCoding-Regular.ttf", None, "Nanum_Gothic_Coding"),
    "NanumGothicCoding-Bold": ("nanumgothiccoding/NanumGothicCoding-Bold.ttf", None, "Nanum_Gothic_Coding"),
    "GasoekOne-Regular": ("gasoekone/GasoekOne-Regular.ttf", None, "Gasoek_One"),
    "NotoSerifKR": ("notoserifkr/NotoSerifKR[wght].ttf", "400:900", "Noto_Serif_KR"),
    "JetBrainsMono": ("jetbrainsmono/JetBrainsMono[wght].ttf", "400:600", "JetBrains_Mono"),
}

CONTENT_DIRS = ["data", "components", "app", "hooks", "lib"]


def chars_of(text: str) -> set[str]:
    return set(re.findall(r"[가-힣ㄱ-ㅣ¡-￿]", text))


def site_chars() -> set[str]:
    chars: set[str] = set(BASE_CHARS)
    for dirname in CONTENT_DIRS:
        for path in (ROOT / dirname).rglob("*"):
            if path.suffix in {".ts", ".tsx", ".md", ".json"}:
                chars |= chars_of(path.read_text(encoding="utf-8", errors="ignore"))
    return chars


def resolve(spec: str) -> Path | None:
    base = ROOT / spec.removeprefix("@/")
    for cand in (base.with_suffix(".tsx"), base.with_suffix(".ts"), base / "index.ts"):
        if cand.exists():
            return cand
    return None


def user_chars(marker: str) -> set[str]:
    """글꼴을 쓰는 파일과, 그 파일이 가져오는 @/components·@/data 파일의 글자."""
    chars: set[str] = set(BASE_CHARS)
    users = [p for p in (ROOT / "components").rglob("*.tsx") if "/local-fonts" in p.read_text() and marker in p.read_text()]
    seen: set[Path] = set()
    stack = list(users)
    while stack:
        path = stack.pop()
        if path in seen:
            continue
        seen.add(path)
        text = path.read_text(encoding="utf-8")
        chars |= chars_of(text)
        for spec in re.findall(r'from "(@/(?:components|data)/[^"]+)"', text):
            dep = resolve(spec)
            if dep:
                stack.append(dep)
    if not users:
        print(f"{marker} 를 쓰는 파일이 없어 기본 글자만 담습니다.")
    return chars


def source(rel: str) -> Path:
    dest = SRC_DIR / rel.split("/")[-1]
    if not dest.exists():
        SRC_DIR.mkdir(exist_ok=True)
        print(f"원본 받는 중: {rel}")
        urllib.request.urlretrieve(RAW + urllib.request.quote(rel), dest)
    return dest


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    site = site_chars()
    for name, (rel, wght, marker) in FONTS.items():
        src = source(rel)
        if wght:
            # 변수 글꼴은 쓰는 굵기 범위만 남긴다
            limited = SRC_DIR / f"{name}.limited.ttf"
            subprocess.run(
                [sys.executable, "-m", "fontTools.varLib.instancer", str(src), f"wght={wght}", "-o", str(limited), "-q"],
                check=True,
            )
            src = limited
        text = "".join(sorted(site if marker is None else user_chars(marker)))
        out = OUT_DIR / f"{name}.woff2"
        subprocess.run(
            [
                sys.executable, "-m", "fontTools.subset", str(src),
                f"--text={text}", "--flavor=woff2", "--layout-features=*",
                "--drop-tables+=DSIG", f"--output-file={out}",
            ],
            check=True,
        )
        print(f"{out.relative_to(ROOT)}: {len(text)}자, {out.stat().st_size / 1024:.0f}KB")


if __name__ == "__main__":
    main()
