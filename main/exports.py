def write_vocab_dict_two_line_style(vocab_dict, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("question_list = {\n")
        for key, value in vocab_dict.items():
            jp, example = value[0]
            sound = value[1]
            # Escape double quotes in strings to avoid syntax errors
            jp_escaped = jp.replace('"', r'\"')
            example_escaped = example.replace('"', r'\"')
            sound_escaped = sound.replace('"', r'\"')

            f.write(f'    "{key}": [["{jp_escaped}",\n')
            f.write(f'    "{example_escaped}"], "{sound_escaped}"],\n')
        f.write("}\n")


if __name__ == "__main__":
    # Import your dicts here, e.g.:
    from .real_eiken_vocab import matched_real_eiken3_vocab, remaining_eiken3_real_vocab

    # Export matched vocab
    write_vocab_dict_two_line_style(matched_real_eiken3_vocab, "matched_vocab_export.py")

    # Export remaining vocab
    write_vocab_dict_two_line_style(remaining_eiken3_real_vocab, "remaining_vocab_export.py")

    print("Export finished!")