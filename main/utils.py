from fugashi import Tagger
import re

KANJI_REGEX = re.compile(r'[\u4e00-\u9fff]')  # Unicode range for CJK Unified Ideographs

def katakana_to_hiragana(katakana):
    return ''.join(
        chr(ord(ch) - 0x60) if 'ァ' <= ch <= 'ン' else ch
        for ch in katakana
    )

def add_furigana(text, tagger=None):
    if tagger is None:
        tagger = Tagger()
    result = ''
    for word in tagger(text):
        surface = word.surface
        reading = getattr(word.feature, 'reading', None) or surface

        if KANJI_REGEX.search(surface) and surface != reading and reading != '*':
            hiragana = katakana_to_hiragana(reading)
            result += f"<ruby>{surface}<rt>{hiragana}</rt></ruby>"
        else:
            result += surface
    return result
