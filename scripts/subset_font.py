#!/usr/bin/env python3
"""사이트에서 실제 사용하는 글자만 담은 Pretendard 서브셋을 생성한다.

원본(assets/fonts/PretendardVariable.woff2, 2MB) 대신 실제 렌더되는
글리프만 추출해 public/fonts/PretendardVariable.subset.woff2 로 출력한다.
콘텐츠(data/, components/, app/)에 새 글자가 추가되면 다시 실행할 것:

    python3 scripts/subset_font.py
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_FONT = ROOT / "assets" / "fonts" / "PretendardVariable.woff2"
OUTPUT_FONT = ROOT / "assets" / "fonts" / "PretendardVariable.subset.woff2"
CONTENT_DIRS = ["data", "components", "app", "hooks", "lib"]

# 항상 포함: ASCII 전체, 한글 자모, 자주 쓰는 문장부호/기호
BASE_CHARS = set(
    "".join(chr(c) for c in range(0x20, 0x7F))  # printable ASCII
    + "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ"
    + "·—–‘’“”…※→←↑↓✓✕★☆∙‧•₩℃①②③④⑤"
    + " "  # nbsp
)


def collect_chars() -> set[str]:
    chars: set[str] = set(BASE_CHARS)
    for dirname in CONTENT_DIRS:
        for path in (ROOT / dirname).rglob("*"):
            if path.suffix not in {".ts", ".tsx", ".md", ".json"}:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            # 한글 음절/호환 자모 + 비ASCII 문자를 모두 수집
            chars.update(re.findall(r"[가-힣ㄱ-ㅣ¡-￿]", text))
    return chars


def main() -> None:
    if not SOURCE_FONT.exists():
        sys.exit(f"원본 폰트가 없습니다: {SOURCE_FONT}")

    chars = collect_chars()
    text = "".join(sorted(chars))
    print(f"수집된 글리프: {len(chars)}자")

    OUTPUT_FONT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            sys.executable,
            "-m",
            "fontTools.subset",
            str(SOURCE_FONT),
            f"--text={text}",
            "--flavor=woff2",
            "--layout-features=*",
            "--drop-tables+=DSIG",
            f"--output-file={OUTPUT_FONT}",
        ],
        check=True,
    )
    size_kb = OUTPUT_FONT.stat().st_size / 1024
    print(f"생성 완료: {OUTPUT_FONT.relative_to(ROOT)} ({size_kb:.0f}KB)")


if __name__ == "__main__":
    main()
