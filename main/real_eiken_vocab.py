from .eiken2_lists import true_eiken2_vocab
from .eiken_pre2_lists import eiken_pre2_vocab, true_eiken_pre2_vocab
from .eiken3_lists import eiken3_vocab, true_eiken3_vocab
from .eiken4_lists import eiken4_vocab
from .lists_eiken import eiken5_vocab
from .jr_high_grade_1_lists import (
    jr_1_lesson_1_vocab, jr_1_lesson_2_vocab, jr_1_lesson_3_vocab,
    jr_1_lesson_4_vocab, jr_1_lesson_5_vocab, jr_1_lesson_6_vocab,
    jr_1_lesson_7_vocab, jr_1_lesson_8_vocab, jr_1_lesson_9_vocab,
    jr_1_lesson_10_vocab
)

from .jr_high_grade_2_lists import (
    jr_2_lesson_1_vocab, jr_2_lesson_2_vocab, jr_2_lesson_3_vocab,
    jr_2_lesson_4_vocab, jr_2_lesson_5_vocab, jr_2_lesson_6_vocab,
    jr_2_lesson_7_vocab, jr_2_lesson_8_vocab,
)

from .jr_high_grade_3_lists import (
    jr_3_lesson_1_vocab, jr_3_lesson_2_vocab, jr_3_lesson_3_vocab,
    jr_3_lesson_4_vocab, jr_3_lesson_5_vocab, jr_3_lesson_6_vocab,
    jr_3_lesson_7_vocab,
)

eiken2_real_vocab = {
    "quality", "announcement", "grand opening", "sale", "compact",
    "instant", "miss out on", "go", "go with", "on sale",
    "even if", "what's more", "item", "choice", "vacuum",
    "fever", "dictionary", "wouldn't", "belong", "rock",
    "band", "vocalist", "musical", "abroad", "belong to",
    "powerful", "lift", "heater", "shake", "shake hands with",
    "wish", "would", "if you had", "AI", "control",
    "including", "patient", "disease", "muscle", "weak",
    "inventor", "loneliness", "connect", "alone", "itself",
    "rather", "certainly", "society", "get along with", "no longer",
    "not good but okay", "take part in", "I wish I could", "imagine", "probably",
    "anywhere", "grandchildren", "simple", "mask", "various",
    "emotion", "imagination", "come true", "take a class", "far away",
    "shrink", "trash can", "itroduction", "access", "exhibition",
    "race", "several", "inter-class", "against", "ball game",
    "tornament", "password", "document", "drive", "knew"
}

def extract_vocab_info_case_insensitive_structured(real_vocab, *vocab_dicts):
    matched_vocab = {}
    remaining_vocab = {}
 
    real_vocab_lower_map = {word.lower(): word for word in real_vocab}
    unmatched_lower_keys = set(real_vocab_lower_map.keys())

    for vocab_dict in vocab_dicts:
        for word, info in vocab_dict.items():
            word_lower = word.lower()

            if word_lower in unmatched_lower_keys:
                original_word = real_vocab_lower_map[word_lower]
 
                if isinstance(info[0], list):
                    jp_sentence = info[0]
                else:
                    jp_sentence = [info[0], ""]

                matched_vocab[original_word] = [jp_sentence, info[1]]
                unmatched_lower_keys.remove(word_lower)
 
    for word_lower in unmatched_lower_keys:
        original_word = real_vocab_lower_map[word_lower]
        remaining_vocab[original_word] = [["", ""], ""]

    return matched_vocab, remaining_vocab


matched_real_eiken3_vocab, remaining_eiken3_real_vocab = extract_vocab_info_case_insensitive_structured(
    eiken2_real_vocab,
    eiken5_vocab,
    eiken4_vocab,
    eiken3_vocab,
    true_eiken3_vocab,
    true_eiken_pre2_vocab,
    true_eiken2_vocab,
    jr_1_lesson_1_vocab,
    jr_1_lesson_2_vocab,
    jr_1_lesson_3_vocab,
    jr_1_lesson_4_vocab,
    jr_1_lesson_5_vocab,
    jr_1_lesson_6_vocab,
    jr_1_lesson_7_vocab,
    jr_1_lesson_8_vocab,
    jr_1_lesson_9_vocab,
    jr_1_lesson_10_vocab,
    jr_2_lesson_1_vocab,
    jr_2_lesson_2_vocab,
    jr_2_lesson_3_vocab,
    jr_2_lesson_4_vocab,
    jr_2_lesson_5_vocab,
    jr_2_lesson_6_vocab,
    jr_2_lesson_7_vocab,
    jr_2_lesson_8_vocab,
    jr_3_lesson_1_vocab,
    jr_3_lesson_2_vocab,
    jr_3_lesson_3_vocab,
    jr_3_lesson_4_vocab,
    jr_3_lesson_5_vocab,
    jr_3_lesson_6_vocab,
    jr_3_lesson_7_vocab,
    eiken_pre2_vocab
)