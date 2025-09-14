from django import forms
from main.models import Classroom, Test, Question, Option
from django.core.files.uploadedfile import InMemoryUploadedFile
from accounts.models import CustomUser
from main.humanize import naturalsize
from django.forms import DateInput
from django.core.exceptions import ValidationError
from django.forms import CharField

from .arabic_eiken4_lists import (
    arabic_eiken4_vocab, arabic_eiken4_vocab1, arabic_eiken4_vocab2, arabic_eiken4_vocab3, arabic_eiken4_vocab4,
    arabic_eiken4_vocab5, arabic_eiken4_vocab6, arabic_eiken4_vocab7, arabic_eiken4_vocab8, arabic_eiken4_vocab9,
    arabic_eiken4_vocab10, arabic_eiken4_vocab11, arabic_eiken4_vocab12
)

from .arabic_eiken5_lists import (
    arabic_eiken5_vocab, arabic_eiken5_vocab1, arabic_eiken5_vocab2, arabic_eiken5_vocab3, arabic_eiken5_vocab4,
    arabic_eiken5_vocab5, arabic_eiken5_vocab6, arabic_eiken5_vocab7, arabic_eiken5_vocab8, arabic_eiken5_vocab9,
    arabic_eiken5_vocab10, arabic_eiken5_vocab11, arabic_eiken5_vocab12, arabic_eiken5_vocab13, arabic_eiken5_vocab14,
    arabic_eiken5_vocab15, arabic_eiken5_vocab16
)

from .eiken2_lists import (
    eiken2_vocab1, eiken2_vocab2, eiken2_vocab3, eiken2_vocab4,
    eiken2_vocab5, eiken2_vocab6, eiken2_vocab7, eiken2_vocab8,
    eiken2_vocab9, eiken2_vocab10, eiken2_vocab11, eiken2_vocab12,
    eiken2_vocab13, eiken2_vocab14, eiken2_vocab15,
    eiken2_vocab_practice, true_eiken2_vocab
)
from .eiken_pre2_lists import (
    eiken_pre2_vocab1, eiken_pre2_vocab2, eiken_pre2_vocab3, eiken_pre2_vocab4,
    eiken_pre2_vocab5, eiken_pre2_vocab6, eiken_pre2_vocab7, eiken_pre2_vocab8,
    eiken_pre2_vocab9, eiken_pre2_vocab10, eiken_pre2_vocab11, eiken_pre2_vocab12,
    eiken_pre2_vocab13, eiken_pre2_vocab14, eiken_pre2_vocab15, eiken_pre2_vocab16,
    eiken_pre2_vocab, eiken_pre2_vocab_practice, true_eiken_pre2_vocab
)
from .eiken3_lists import (
    eiken3_vocab1, eiken3_vocab2, eiken3_vocab3, eiken3_vocab4,
    eiken3_vocab5, eiken3_vocab6, eiken3_vocab7, eiken3_vocab8,
    eiken3_vocab9, eiken3_vocab10, eiken3_vocab11, eiken3_vocab12,
    eiken3_vocab13, eiken3_vocab14, eiken3_vocab15, eiken3_vocab16,
    eiken3_vocab, eiken3_grammar_vocab, eiken3_vocab_practice, eiken3_conversation_vocab_practice,
    eiken3_grammar_practice, eiken3_conversation_grammar_practice, eiken3_grammar_sentence_answers
)
from .eiken4_lists import eiken4_sentence_order, eiken4_grammar_sentence_answers, eiken4_grammar_practice, eiken4_conversation_vocab_practice, eiken4_grammar_vocab, eiken4_vocab_practice, eiken4_vocab, eiken4_vocab1, eiken4_vocab2, eiken4_vocab3, eiken4_vocab4, eiken4_vocab5, eiken4_vocab6, eiken4_vocab7, eiken4_vocab8, eiken4_vocab9, eiken4_vocab10, eiken4_vocab11, eiken4_vocab12
from .lists_eiken import eiken5_sentence_order, eiken5_grammar_sentence_answers, eiken5_grammar_vocab, eiken5_vocab1, eiken5_vocab2, eiken5_vocab3, eiken5_vocab4, eiken5_vocab5, eiken5_vocab6, eiken5_vocab7, eiken5_vocab8, eiken5_vocab9, eiken5_vocab10, eiken5_vocab11, eiken5_vocab12, eiken5_vocab13, eiken5_vocab14, eiken5_vocab15, eiken5_vocab16, eiken5_vocab, eiken5_vocab_practice, eiken5_grammar_practice, eiken5_conversation_vocab_practice
from .lists import hebonshiki1, hebonshiki2, hebonshiki3, hebonshiki4, hebonshiki5, grade5_lesson3_sentence, alphabet_sounds3, grade5_lesson8, grade5_lesson7, grade5_lesson1_names, grade5_lesson1_words, grade5_lesson1_sentence, grade5_lesson2, grade5_lesson3, grade5_lesson4_sentence, dates, months, days, grade6_lesson1, grade6_lesson2, grade6_lesson3, grade6_lesson3_frequency, grade_6_lesson_8, grade_6_lesson_7, phonics3, alphabet_sounds2, japanese_numbers, grade_6_lesson_6, alphabet_sounds, one_twenty, one_hundred, eleven_ninety, one_thousand, one_quadrillion, thousand_quadrillion, grade_6_lesson_5, grade_5_lesson_5, grade_5_lesson_6, small_alphabet_sounds, alphabet_phonics, jlpt_n5_vocabulary, phonics1, phonics_2, lesson4_list, lesson4_grade6_dict
from .jr_high_grade_1_lists import (
    jr_1_lesson_1_vocab, jr_1_lesson_1_conversation, jr_1_lesson_2_vocab, jr_1_lesson_2_conversation, jr_1_lesson_3_vocab, jr_1_lesson_3_sentence,
    jr_1_lesson_4_vocab, jr_1_lesson_4_conversation, jr_1_lesson_5_vocab, jr_1_lesson_5_conversation,
    jr_1_lesson_6_vocab, jr_1_lesson_6_sentence, jr_1_lesson_7_vocab, jr_1_lesson_7_conversation, jr_1_lesson_8_vocab, jr_1_lesson_8_sentence, jr_1_lesson_9_vocab, jr_1_lesson_9_conversation, jr_1_lesson_10_vocab, lesson_10_story
)

from .jr_high_grade_2_lists import (
    jr_2_lesson_1_vocab, jr_2_lesson_1_story,
    jr_2_lesson_2_vocab, jr_2_lesson_2_story,
    jr_2_lesson_3_vocab, jr_2_lesson_3_story,
    jr_2_lesson_4_vocab, jr_2_lesson_4_story,
    jr_2_lesson_5_vocab, jr_2_lesson_5_story,
    jr_2_lesson_6_vocab, jr_2_lesson_6_story,
    jr_2_lesson_7_vocab, jr_2_lesson_7_story,
    jr_2_lesson_8_vocab, jr_2_lesson_8_story,
)

from .jr_high_grade_3_lists import (
    jr_3_lesson_1_vocab, jr_3_lesson_1_story,
    jr_3_lesson_2_vocab, jr_3_lesson_2_story,
    jr_3_lesson_3_vocab, jr_3_lesson_3_story,
    jr_3_lesson_4_vocab, jr_3_lesson_4_story,
    jr_3_lesson_5_vocab, jr_3_lesson_5_story,
    jr_3_lesson_6_vocab, jr_3_lesson_6_story,
    jr_3_lesson_7_vocab, jr_3_lesson_7_story,
)


class ClassroomJoinForm(forms.Form):
    classroom_name = forms.CharField(
        label="教室名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )

class ConnectTestForm(forms.Form):
    classroom_name = forms.CharField(
        label="教室名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )
    classroom_password = forms.CharField(
        label="教室のパスワード",
        required=True,
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
    )


class SingleCheckboxSelect(forms.CheckboxSelectMultiple):
    def value_from_datadict(self, data, files, name):
        value = super().value_from_datadict(data, files, name)
        if isinstance(value, list):
            return value[0] if value else None
        return value








class ClassroomCreateForm(forms.ModelForm):


    class Meta:
        model = Classroom
        fields = ['name']

        labels = {
            'name': '教室名',
        }

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
        }





class TestCreateForm(forms.ModelForm):

    class Meta:
        model = Test
        fields = ['name', 'description', 'category', 'picture_url', 'sound_url', 'lesson_number', 'score_multiplier', 'number_of_questions']

    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }

QUESTION_LISTS = {
    'alphabet_sounds': alphabet_sounds,
    'hebonshiki1': hebonshiki1,
    'hebonshiki2': hebonshiki2,
    'hebonshiki3': hebonshiki3,
    'hebonshiki4': hebonshiki4,
    'hebonshiki5': hebonshiki5,
    'small_alphabet_sounds': small_alphabet_sounds,
    'jlpt_n5_vocabulary': jlpt_n5_vocabulary,
    'phonics1': phonics1,
    'phonics3': phonics3,
    'lesson4_list': lesson4_list,
    'lesson4_grade6_dict': lesson4_grade6_dict,
    'alphabet_phonics': alphabet_phonics,
    'phonics_2': phonics_2,
    'grade_6_lesson_5': grade_6_lesson_5,
    'grade5_lesson1_names': grade5_lesson1_names,
    'grade5_lesson1_words': grade5_lesson1_words,
    'grade5_lesson1_sentence': grade5_lesson1_sentence,
    'grade5_lesson2': grade5_lesson2,
    'grade5_lesson3': grade5_lesson3,
    'grade5_lesson3_sentence': grade5_lesson3_sentence,
    'grade5_lesson4_sentence': grade5_lesson4_sentence,
    'grade5_lesson7': grade5_lesson7,
    'grade5_lesson8': grade5_lesson8,
    'grade_5_lesson_5': grade_5_lesson_5,
    'grade_5_lesson_6': grade_5_lesson_6,
    'grade_6_lesson_6': grade_6_lesson_6,
    'grade_6_lesson_7': grade_6_lesson_7,
    'grade_6_lesson_8': grade_6_lesson_8,
    'grade6_lesson1': grade6_lesson1,
    'grade6_lesson2': grade6_lesson2,
    'grade6_lesson3': grade6_lesson3,
    'grade6_lesson3_frequency': grade6_lesson3_frequency,
    'jr_1_lesson_1_vocab': jr_1_lesson_1_vocab,
    'jr_1_lesson_1_conversation': jr_1_lesson_1_conversation,
    'jr_1_lesson_2_vocab': jr_1_lesson_2_vocab,
    'jr_1_lesson_2_conversation': jr_1_lesson_2_conversation,
    'jr_1_lesson_3_vocab': jr_1_lesson_3_vocab,
    'jr_1_lesson_3_sentence': jr_1_lesson_3_sentence,
    'jr_1_lesson_4_vocab': jr_1_lesson_4_vocab,
    'jr_1_lesson_4_conversation': jr_1_lesson_4_conversation,
    'jr_1_lesson_5_vocab': jr_1_lesson_5_vocab,
    'jr_1_lesson_5_conversation': jr_1_lesson_5_conversation,
    'jr_1_lesson_6_vocab': jr_1_lesson_6_vocab,
    'jr_1_lesson_6_sentence': jr_1_lesson_6_sentence,
    'jr_1_lesson_7_vocab': jr_1_lesson_7_vocab,
    'jr_1_lesson_7_conversation': jr_1_lesson_7_conversation,
    'jr_1_lesson_8_vocab': jr_1_lesson_8_vocab,
    'jr_1_lesson_8_sentence': jr_1_lesson_8_sentence,
    'jr_1_lesson_9_vocab': jr_1_lesson_9_vocab,
    'jr_1_lesson_9_conversation': jr_1_lesson_9_conversation,
    'jr_1_lesson_10_vocab': jr_1_lesson_10_vocab,
    'lesson_10_story': lesson_10_story,
    'jr_2_lesson_1_vocab': jr_2_lesson_1_vocab,
    'jr_2_lesson_1_story': jr_2_lesson_1_story,
    'jr_2_lesson_2_vocab': jr_2_lesson_2_vocab,
    'jr_2_lesson_2_story': jr_2_lesson_2_story,
    'jr_2_lesson_3_vocab': jr_2_lesson_3_vocab,
    'jr_2_lesson_3_story': jr_2_lesson_3_story,
    'jr_2_lesson_4_vocab': jr_2_lesson_4_vocab,
    'jr_2_lesson_4_story': jr_2_lesson_4_story,
    'jr_2_lesson_5_vocab': jr_2_lesson_5_vocab,
    'jr_2_lesson_5_story': jr_2_lesson_5_story,
    'jr_2_lesson_6_vocab': jr_2_lesson_6_vocab,
    'jr_2_lesson_6_story': jr_2_lesson_6_story,
    'jr_2_lesson_7_vocab': jr_2_lesson_7_vocab,
    'jr_2_lesson_7_story': jr_2_lesson_7_story,
    'jr_2_lesson_8_vocab': jr_2_lesson_8_vocab,
    'jr_2_lesson_8_story': jr_2_lesson_8_story,
    'jr_3_lesson_1_vocab': jr_3_lesson_1_vocab,
    'jr_3_lesson_1_story': jr_3_lesson_1_story,
    'jr_3_lesson_2_vocab': jr_3_lesson_2_vocab,
    'jr_3_lesson_2_story': jr_3_lesson_2_story,
    'jr_3_lesson_3_vocab': jr_3_lesson_3_vocab,
    'jr_3_lesson_3_story': jr_3_lesson_3_story,
    'jr_3_lesson_4_vocab': jr_3_lesson_4_vocab,
    'jr_3_lesson_4_story': jr_3_lesson_4_story,
    'jr_3_lesson_5_vocab': jr_3_lesson_5_vocab,
    'jr_3_lesson_5_story': jr_3_lesson_5_story,
    'jr_3_lesson_6_vocab': jr_3_lesson_6_vocab,
    'jr_3_lesson_6_story': jr_3_lesson_6_story,
    'jr_3_lesson_7_vocab': jr_3_lesson_7_vocab,
    'jr_3_lesson_7_story': jr_3_lesson_7_story,
    'months': months,
    'dates': dates,
    'days': days,
    'one_twenty': one_twenty,
    'one_hundred': one_hundred,
    'eleven_ninety': eleven_ninety,
    'one_thousand': one_thousand,
    'one_quadrillion': one_quadrillion,
    'thousand_quadrillion': thousand_quadrillion,
    'japanese_numbers': japanese_numbers,
    'alphabet_sounds2': alphabet_sounds2,
    'alphabet_sounds3': alphabet_sounds3,
    'eiken2_vocab1': eiken2_vocab1,
    'eiken2_vocab2': eiken2_vocab2,
    'eiken2_vocab3': eiken2_vocab3,
    'eiken2_vocab4': eiken2_vocab4,
    'eiken2_vocab5': eiken2_vocab5,
    'eiken2_vocab6': eiken2_vocab6,
    'eiken2_vocab7': eiken2_vocab7,
    'eiken2_vocab8': eiken2_vocab8,
    'eiken2_vocab9': eiken2_vocab9,
    'eiken2_vocab10': eiken2_vocab10,
    'eiken2_vocab11': eiken2_vocab11,
    'eiken2_vocab12': eiken2_vocab12,
    'eiken2_vocab13': eiken2_vocab13,
    'eiken2_vocab14': eiken2_vocab14,
    'eiken2_vocab15': eiken2_vocab15,
    'true_eiken2_vocab': true_eiken2_vocab,
    'eiken2_vocab_practice': eiken2_vocab_practice,
    'eiken_pre2_vocab1': eiken_pre2_vocab1,
    'eiken_pre2_vocab2': eiken_pre2_vocab2,
    'eiken_pre2_vocab3': eiken_pre2_vocab3,
    'eiken_pre2_vocab4': eiken_pre2_vocab4,
    'eiken_pre2_vocab5': eiken_pre2_vocab5,
    'eiken_pre2_vocab6': eiken_pre2_vocab6,
    'eiken_pre2_vocab7': eiken_pre2_vocab7,
    'eiken_pre2_vocab8': eiken_pre2_vocab8,
    'eiken_pre2_vocab9': eiken_pre2_vocab9,
    'eiken_pre2_vocab10': eiken_pre2_vocab10,
    'eiken_pre2_vocab11': eiken_pre2_vocab11,
    'eiken_pre2_vocab12': eiken_pre2_vocab12,
    'eiken_pre2_vocab13': eiken_pre2_vocab13,
    'eiken_pre2_vocab14': eiken_pre2_vocab14,
    'eiken_pre2_vocab15': eiken_pre2_vocab15,
    'eiken_pre2_vocab16': eiken_pre2_vocab16,
    'eiken_pre2_vocab': eiken_pre2_vocab,
    'true_eiken_pre2_vocab': true_eiken_pre2_vocab,
    'eiken_pre2_vocab_practice': eiken_pre2_vocab_practice,
    'eiken3_vocab1': eiken3_vocab1,
    'eiken3_vocab2': eiken3_vocab2,
    'eiken3_vocab3': eiken3_vocab3,
    'eiken3_vocab4': eiken3_vocab4,
    'eiken3_vocab5': eiken3_vocab5,
    'eiken3_vocab6': eiken3_vocab6,
    'eiken3_vocab7': eiken3_vocab7,
    'eiken3_vocab8': eiken3_vocab8,
    'eiken3_vocab9': eiken3_vocab9,
    'eiken3_vocab10': eiken3_vocab10,
    'eiken3_vocab11': eiken3_vocab11,
    'eiken3_vocab12': eiken3_vocab12,
    'eiken3_vocab13': eiken3_vocab13,
    'eiken3_vocab14': eiken3_vocab14,
    'eiken3_vocab15': eiken3_vocab15,
    'eiken3_vocab16': eiken3_vocab16,
    'eiken3_vocab': eiken3_vocab,
    'eiken3_grammar_vocab': eiken3_grammar_vocab,
    'eiken3_vocab_practice': eiken3_vocab_practice,
    'eiken3_conversation_vocab_practice': eiken3_conversation_vocab_practice,
    'eiken3_grammar_practice': eiken3_grammar_practice,
    'eiken3_conversation_grammar_practice': eiken3_conversation_grammar_practice,
    'eiken3_grammar_sentence_answers': eiken3_grammar_sentence_answers,
    'eiken4_vocab': eiken4_vocab,
    'eiken4_grammar_vocab': eiken4_grammar_vocab,
    'eiken4_vocab1': eiken4_vocab1,
    'eiken4_vocab2': eiken4_vocab2,
    'eiken4_vocab3': eiken4_vocab3,
    'eiken4_vocab4': eiken4_vocab4,
    'eiken4_vocab5': eiken4_vocab5,
    'eiken4_vocab6': eiken4_vocab6,
    'eiken4_vocab7': eiken4_vocab7,
    'eiken4_vocab8': eiken4_vocab8,
    'eiken4_vocab9': eiken4_vocab9,
    'eiken4_vocab10': eiken4_vocab10,
    'eiken4_vocab11': eiken4_vocab11,
    'eiken4_vocab12': eiken4_vocab12,
    'arabic_eiken4_vocab1': arabic_eiken4_vocab1,
    'arabic_eiken4_vocab2': arabic_eiken4_vocab2,
    'arabic_eiken4_vocab3': arabic_eiken4_vocab3,
    'arabic_eiken4_vocab4': arabic_eiken4_vocab4,
    'arabic_eiken4_vocab5': arabic_eiken4_vocab5,
    'arabic_eiken4_vocab6': arabic_eiken4_vocab6,
    'arabic_eiken4_vocab7': arabic_eiken4_vocab7,
    'arabic_eiken4_vocab8': arabic_eiken4_vocab8,
    'arabic_eiken4_vocab9': arabic_eiken4_vocab9,
    'arabic_eiken4_vocab10': arabic_eiken4_vocab10,
    'arabic_eiken4_vocab11': arabic_eiken4_vocab11,
    'arabic_eiken4_vocab12': arabic_eiken4_vocab12,
    'arabic_eiken4_vocab': arabic_eiken4_vocab,
    'eiken4_vocab_practice': eiken4_vocab_practice,
    'eiken4_conversation_vocab_practice': eiken4_conversation_vocab_practice,
    'eiken4_grammar_practice': eiken4_grammar_practice,
    'eiken4_grammar_sentence_answers': eiken4_grammar_sentence_answers,
    'eiken4_sentence_order': eiken4_sentence_order,
    'eiken5_vocab1': eiken5_vocab1,
    'eiken5_vocab2': eiken5_vocab2,
    'eiken5_vocab3': eiken5_vocab3,
    'eiken5_vocab4': eiken5_vocab4,
    'eiken5_vocab5': eiken5_vocab5,
    'eiken5_vocab6': eiken5_vocab6,
    'eiken5_vocab7': eiken5_vocab7,
    'eiken5_vocab8': eiken5_vocab8,
    'eiken5_vocab9': eiken5_vocab9,
    'eiken5_vocab10': eiken5_vocab10,
    'eiken5_vocab11': eiken5_vocab11,
    'eiken5_vocab12': eiken5_vocab12,
    'eiken5_vocab13': eiken5_vocab13,
    'eiken5_vocab14': eiken5_vocab14,
    'eiken5_vocab15': eiken5_vocab15,
    'eiken5_vocab16': eiken5_vocab16,
    'eiken5_vocab': eiken5_vocab,
    'arabic_eiken5_vocab1': arabic_eiken5_vocab1,
    'arabic_eiken5_vocab2': arabic_eiken5_vocab2,
    'arabic_eiken5_vocab3': arabic_eiken5_vocab3,
    'arabic_eiken5_vocab4': arabic_eiken5_vocab4,
    'arabic_eiken5_vocab5': arabic_eiken5_vocab5,
    'arabic_eiken5_vocab6': arabic_eiken5_vocab6,
    'arabic_eiken5_vocab7': arabic_eiken5_vocab7,
    'arabic_eiken5_vocab8': arabic_eiken5_vocab8,
    'arabic_eiken5_vocab9': arabic_eiken5_vocab9,
    'arabic_eiken5_vocab10': arabic_eiken5_vocab10,
    'arabic_eiken5_vocab11': arabic_eiken5_vocab11,
    'arabic_eiken5_vocab12': arabic_eiken5_vocab12,
    'arabic_eiken5_vocab13': arabic_eiken5_vocab13,
    'arabic_eiken5_vocab14': arabic_eiken5_vocab14,
    'arabic_eiken5_vocab15': arabic_eiken5_vocab15,
    'arabic_eiken5_vocab16': arabic_eiken5_vocab16,
    'arabic_eiken5_vocab': arabic_eiken5_vocab,
    'eiken5_vocab_practice': eiken5_vocab_practice,
    'eiken5_grammar_vocab': eiken5_grammar_vocab,
    'eiken5_grammar_sentence_answers': eiken5_grammar_sentence_answers,
    'eiken5_grammar_practice': eiken5_grammar_practice,
    'eiken5_conversation_vocab_practice': eiken5_conversation_vocab_practice,
    'eiken5_sentence_order': eiken5_sentence_order,
}


class QuestionCreateForm(forms.ModelForm):

    list_choices = [
        ('alphabet_sounds', 'Alphabet Sounds'),
        ('hebonshiki1', 'Hebonshiki1'),
        ('hebonshiki2', 'Hebonshiki2'),
        ('hebonshiki3', 'Hebonshiki3'),
        ('hebonshiki4', 'Hebonshiki4'),
        ('hebonshiki5', 'Hebonshiki5'),
        ('small_alphabet_sounds', 'Small Alphabet Sounds'),
        ('jlpt_n5_vocabulary', 'Jlpt_n5_vocabulary'),
        ('phonics1', 'Phonics1'),
        ('phonics3', 'Phonics3'),
        ('lesson4_list', 'Lesson4_list'),
        ('lesson4_grade6_dict', 'Lesson4_grade6_dict'),
        ('alphabet_phonics', 'Alphabet_phonics'),
        ('phonics_2', 'Phonics_2'),
        ('grade_6_lesson_5', 'grade_6_lesson_5'),
        ('grade5_lesson1_names', 'grade5_lesson1_names'),
        ('grade5_lesson1_words', 'grade5_lesson1_words'),
        ('grade5_lesson1_sentence', 'grade5_lesson1_sentence'),
        ('grade5_lesson2', 'grade5_lesson2'),
        ('grade5_lesson3', 'grade5_lesson3'),
        ('grade5_lesson3_sentence', 'grade5_lesson3_sentence'),
        ('grade5_lesson4_sentence', 'grade5_lesson4_sentence'),
        ('grade5_lesson7', 'grade5_lesson7'),
        ('grade5_lesson8', 'grade5_lesson8'),
        ('grade_5_lesson_5', 'grade_5_lesson_5'),
        ('grade_5_lesson_6', 'grade_5_lesson_6'),
        ('grade_6_lesson_6', 'grade_6_lesson_6'),
        ('grade_6_lesson_7', 'grade_6_lesson_7'),
        ('grade_6_lesson_8', 'grade_6_lesson_8'),
        ('grade6_lesson1', 'grade6_lesson1'),
        ('grade6_lesson2', 'grade6_lesson2'),
        ('grade6_lesson3', 'grade6_lesson3'),
        ('grade6_lesson3_frequency', 'grade6_lesson3_frequency'),
        ('jr_1_lesson_1_vocab', 'jr_1_lesson_1_vocab'),
        ('jr_1_lesson_1_conversation', 'jr_1_lesson_1_conversation'),
        ('jr_1_lesson_2_vocab', 'jr_1_lesson_2_vocab'),
        ('jr_1_lesson_2_conversation', 'jr_1_lesson_2_conversation'),
        ('jr_1_lesson_3_vocab', 'jr_1_lesson_3_vocab'),
        ('jr_1_lesson_3_sentence', 'jr_1_lesson_3_sentence'),
        ('jr_1_lesson_4_vocab', 'jr_1_lesson_4_vocab'),
        ('jr_1_lesson_4_conversation', 'jr_1_lesson_4_conversation'),
        ('jr_1_lesson_5_vocab', 'jr_1_lesson_5_vocab'),
        ('jr_1_lesson_5_conversation', 'jr_1_lesson_5_conversation'),
        ('jr_1_lesson_6_vocab', 'jr_1_lesson_6_vocab'),
        ('jr_1_lesson_6_sentence', 'jr_1_lesson_6_sentence'),
        ('jr_1_lesson_7_vocab', 'jr_1_lesson_7_vocab'),
        ('jr_1_lesson_7_conversation', 'jr_1_lesson_7_conversation'),
        ('jr_1_lesson_8_vocab', 'jr_1_lesson_8_vocab'),
        ('jr_1_lesson_8_sentence', 'jr_1_lesson_8_sentence'),
        ('jr_1_lesson_9_vocab', 'jr_1_lesson_9_vocab'),
        ('jr_1_lesson_9_conversation', 'jr_1_lesson_9_conversation'),
        ('jr_1_lesson_10_vocab', 'jr_1_lesson_10_vocab'),
        ('lesson_10_story', 'lesson_10_story'),
        ('jr_2_lesson_1_vocab', 'jr_2_lesson_1_vocab'),
        ('jr_2_lesson_1_story', 'jr_2_lesson_1_story'),
        ('jr_2_lesson_2_vocab', 'jr_2_lesson_2_vocab'),
        ('jr_2_lesson_2_story', 'jr_2_lesson_2_story'),
        ('jr_2_lesson_3_vocab', 'jr_2_lesson_3_vocab'),
        ('jr_2_lesson_3_story', 'jr_2_lesson_3_story'),
        ('jr_2_lesson_4_vocab', 'jr_2_lesson_4_vocab'),
        ('jr_2_lesson_4_story', 'jr_2_lesson_4_story'),
        ('jr_2_lesson_5_vocab', 'jr_2_lesson_5_vocab'),
        ('jr_2_lesson_5_story', 'jr_2_lesson_5_story'),
        ('jr_2_lesson_6_vocab', 'jr_2_lesson_6_vocab'),
        ('jr_2_lesson_6_story', 'jr_2_lesson_6_story'),
        ('jr_2_lesson_7_vocab', 'jr_2_lesson_7_vocab'),
        ('jr_2_lesson_7_story', 'jr_2_lesson_7_story'),
        ('jr_2_lesson_8_vocab', 'jr_2_lesson_8_vocab'),
        ('jr_2_lesson_8_story', 'jr_2_lesson_8_story'),
        ('jr_3_lesson_1_vocab', 'jr_3_lesson_1_vocab'),
        ('jr_3_lesson_1_story', 'jr_3_lesson_1_story'),
        ('jr_3_lesson_2_vocab', 'jr_3_lesson_2_vocab'),
        ('jr_3_lesson_2_story', 'jr_3_lesson_2_story'),
        ('jr_3_lesson_3_vocab', 'jr_3_lesson_3_vocab'),
        ('jr_3_lesson_3_story', 'jr_3_lesson_3_story'),
        ('jr_3_lesson_4_vocab', 'jr_3_lesson_4_vocab'),
        ('jr_3_lesson_4_story', 'jr_3_lesson_4_story'),
        ('jr_3_lesson_5_vocab', 'jr_3_lesson_5_vocab'),
        ('jr_3_lesson_5_story', 'jr_3_lesson_5_story'),
        ('jr_3_lesson_6_vocab', 'jr_3_lesson_6_vocab'),
        ('jr_3_lesson_6_story', 'jr_3_lesson_6_story'),
        ('jr_3_lesson_7_vocab', 'jr_3_lesson_7_vocab'),
        ('jr_3_lesson_7_story', 'jr_3_lesson_7_story'),
        ('months', 'Months'),
        ('dates', 'Dates'),
        ('days', 'Days'),
        ('one_twenty', 'One Twenty'),
        ('one_hundred', 'One Hundred'),
        ('eleven_ninety', 'Eleven Ninety'),
        ('one_thousand', 'One Thousand'),
        ('one_quadrillion', 'One Quadrillion'),
        ('thousand_quadrillion', 'Thousand Quadrillion'),
        ('japanese_numbers', 'Japanese_Numbers'),
        ('alphabet_sounds2', 'Alphabet Sounds2'),
        ('alphabet_sounds3', 'Alphabet Sounds3'),
        ('eiken2_vocab1', 'Eiken2_vocab1'),
        ('eiken2_vocab2', 'Eiken2_vocab2'),
        ('eiken2_vocab3', 'Eiken2_vocab3'),
        ('eiken2_vocab4', 'Eiken2_vocab4'),
        ('eiken2_vocab5', 'Eiken2_vocab5'),
        ('eiken2_vocab6', 'Eiken2_vocab6'),
        ('eiken2_vocab7', 'Eiken2_vocab7'),
        ('eiken2_vocab8', 'Eiken2_vocab8'),
        ('eiken2_vocab9', 'Eiken2_vocab9'),
        ('eiken2_vocab10', 'Eiken2_vocab10'),
        ('eiken2_vocab11', 'Eiken2_vocab11'),
        ('eiken2_vocab12', 'Eiken2_vocab12'),
        ('eiken2_vocab13', 'Eiken2_vocab13'),
        ('eiken2_vocab14', 'Eiken2_vocab14'),
        ('eiken2_vocab15', 'Eiken2_vocab15'),
        ('true_eiken2_vocab', 'True_eiken2_vocab'),
        ('eiken2_vocab_practice', 'Eiken2_vocab_practice'),
        ('eiken_pre2_vocab1', 'Eiken_pre2_vocab1'),
        ('eiken_pre2_vocab2', 'Eiken_pre2_vocab2'),
        ('eiken_pre2_vocab3', 'Eiken_pre2_vocab3'),
        ('eiken_pre2_vocab4', 'Eiken_pre2_vocab4'),
        ('eiken_pre2_vocab5', 'Eiken_pre2_vocab5'),
        ('eiken_pre2_vocab6', 'Eiken_pre2_vocab6'),
        ('eiken_pre2_vocab7', 'Eiken_pre2_vocab7'),
        ('eiken_pre2_vocab8', 'Eiken_pre2_vocab8'),
        ('eiken_pre2_vocab9', 'Eiken_pre2_vocab9'),
        ('eiken_pre2_vocab10', 'Eiken_pre2_vocab10'),
        ('eiken_pre2_vocab11', 'Eiken_pre2_vocab11'),
        ('eiken_pre2_vocab12', 'Eiken_pre2_vocab12'),
        ('eiken_pre2_vocab13', 'Eiken_pre2_vocab13'),
        ('eiken_pre2_vocab14', 'Eiken_pre2_vocab14'),
        ('eiken_pre2_vocab15', 'Eiken_pre2_vocab15'),
        ('eiken_pre2_vocab16', 'Eiken_pre2_vocab16'),
        ('eiken_pre2_vocab', 'Eiken_pre2_vocab'),
        ('true_eiken_pre2_vocab', 'True_eiken_pre2_vocab'),
        ('eiken_pre2_vocab_practice', 'Eiken_pre2_vocab_practice'),
        ('eiken3_vocab1', 'Eiken3_vocab1'),
        ('eiken3_vocab2', 'Eiken3_vocab2'),
        ('eiken3_vocab3', 'Eiken3_vocab3'),
        ('eiken3_vocab4', 'Eiken3_vocab4'),
        ('eiken3_vocab5', 'Eiken3_vocab5'),
        ('eiken3_vocab6', 'Eiken3_vocab6'),
        ('eiken3_vocab7', 'Eiken3_vocab7'),
        ('eiken3_vocab8', 'Eiken3_vocab8'),
        ('eiken3_vocab9', 'Eiken3_vocab9'),
        ('eiken3_vocab10', 'Eiken3_vocab10'),
        ('eiken3_vocab11', 'Eiken3_vocab11'),
        ('eiken3_vocab12', 'Eiken3_vocab12'),
        ('eiken3_vocab13', 'Eiken3_vocab13'),
        ('eiken3_vocab14', 'Eiken3_vocab14'),
        ('eiken3_vocab15', 'Eiken3_vocab15'),
        ('eiken3_vocab16', 'Eiken3_vocab16'),
        ('eiken3_vocab', 'Eiken3_vocab'),
        ('eiken3_grammar_vocab', 'Eiken3_grammar_vocab'),
        ('eiken3_vocab_practice', 'eiken3_vocab_practice'),
        ('eiken3_conversation_vocab_practice', 'eiken3_conversation_vocab_practice'),
        ('eiken3_grammar_practice', 'eiken3_grammar_practice'),
        ('eiken3_conversation_grammar_practice', 'eiken3_conversation_grammar_practice'),
        ('eiken3_grammar_sentence_answers', 'eiken3_grammar_sentence_answers'),
        ('eiken4_vocab', 'Eiken4_vocab'),
        ('eiken4_grammar_vocab', 'Eiken4_grammar_vocab'),
        ('eiken4_vocab1', 'Eiken4_vocab1'),
        ('eiken4_vocab2', 'Eiken4_vocab2'),
        ('eiken4_vocab3', 'Eiken4_vocab3'),
        ('eiken4_vocab4', 'Eiken4_vocab4'),
        ('eiken4_vocab5', 'Eiken4_vocab5'),
        ('eiken4_vocab6', 'Eiken4_vocab6'),
        ('eiken4_vocab7', 'Eiken4_vocab7'),
        ('eiken4_vocab8', 'Eiken4_vocab8'),
        ('eiken4_vocab9', 'Eiken4_vocab9'),
        ('eiken4_vocab10', 'Eiken4_vocab10'),
        ('eiken4_vocab11', 'Eiken4_vocab11'),
        ('eiken4_vocab12', 'Eiken4_vocab12'),
        ('arabic_eiken4_vocab1', 'Arabic_eiken4_vocab1'),
        ('arabic_eiken4_vocab2', 'Arabic_eiken4_vocab2'),
        ('arabic_eiken4_vocab3', 'Arabic_eiken4_vocab3'),
        ('arabic_eiken4_vocab4', 'Arabic_eiken4_vocab4'),
        ('arabic_eiken4_vocab5', 'Arabic_eiken4_vocab5'),
        ('arabic_eiken4_vocab6', 'Arabic_eiken4_vocab6'),
        ('arabic_eiken4_vocab7', 'Arabic_eiken4_vocab7'),
        ('arabic_eiken4_vocab8', 'Arabic_eiken4_vocab8'),
        ('arabic_eiken4_vocab9', 'Arabic_eiken4_vocab9'),
        ('arabic_eiken4_vocab10', 'Arabic_eiken4_vocab10'),
        ('arabic_eiken4_vocab11', 'Arabic_eiken4_vocab11'),
        ('arabic_eiken4_vocab12', 'Arabic_eiken4_vocab12'),
        ('arabic_eiken4_vocab', 'Arabic_eiken4_vocab'),
        ('eiken4_vocab_practice', 'eiken4_vocab_practice'),
        ('eiken4_conversation_vocab_practice', 'eiken4_conversation_vocab_practice'),
        ('eiken4_grammar_practice', 'eiken4_grammar_practice'),
        ('eiken4_grammar_sentence_answers', 'eiken4_grammar_sentence_answers'),
        ('eiken4_sentence_order', 'eiken4_sentence_order'),
        ('eiken5_vocab1', 'Eiken5_vocab1'),
        ('eiken5_vocab2', 'Eiken5_vocab2'),
        ('eiken5_vocab3', 'Eiken5_vocab3'),
        ('eiken5_vocab4', 'Eiken5_vocab4'),
        ('eiken5_vocab5', 'Eiken5_vocab5'),
        ('eiken5_vocab6', 'Eiken5_vocab6'),
        ('eiken5_vocab7', 'Eiken5_vocab7'),
        ('eiken5_vocab8', 'Eiken5_vocab8'),
        ('eiken5_vocab9', 'Eiken5_vocab9'),
        ('eiken5_vocab10', 'Eiken5_vocab10'),
        ('eiken5_vocab11', 'Eiken5_vocab11'),
        ('eiken5_vocab12', 'Eiken5_vocab12'),
        ('eiken5_vocab13', 'Eiken5_vocab13'),
        ('eiken5_vocab14', 'Eiken5_vocab14'),
        ('eiken5_vocab15', 'Eiken5_vocab15'),
        ('eiken5_vocab16', 'Eiken5_vocab16'),
        ('eiken5_vocab', 'Eiken5_vocab'),
        ('arabic_eiken5_vocab1', 'Arabic_eiken5_vocab1'),
        ('arabic_eiken5_vocab2', 'Arabic_eiken5_vocab2'),
        ('arabic_eiken5_vocab3', 'Arabic_eiken5_vocab3'),
        ('arabic_eiken5_vocab4', 'Arabic_eiken5_vocab4'),
        ('arabic_eiken5_vocab5', 'Arabic_eiken5_vocab5'),
        ('arabic_eiken5_vocab6', 'Arabic_eiken5_vocab6'),
        ('arabic_eiken5_vocab7', 'Arabic_eiken5_vocab7'),
        ('arabic_eiken5_vocab8', 'Arabic_eiken5_vocab8'),
        ('arabic_eiken5_vocab9', 'Arabic_eiken5_vocab9'),
        ('arabic_eiken5_vocab10', 'Arabic_eiken5_vocab10'),
        ('arabic_eiken5_vocab11', 'Arabic_eiken5_vocab11'),
        ('arabic_eiken5_vocab12', 'Arabic_eiken5_vocab12'),
        ('arabic_eiken5_vocab13', 'Arabic_eiken5_vocab13'),
        ('arabic_eiken5_vocab14', 'Arabic_eiken5_vocab14'),
        ('arabic_eiken5_vocab15', 'Arabic_eiken5_vocab15'),
        ('arabic_eiken5_vocab16', 'Arabic_eiken5_vocab16'),
        ('arabic_eiken5_vocab', 'arabic_Eiken5_vocab'),
        ('eiken5_vocab_practice', 'eiken5_vocab_practice'),
        ('eiken5_grammar_vocab', 'Eiken5_grammar_vocab'),
        ('eiken5_grammar_sentence_answers', 'eiken5_grammar_sentence_answers'),
        ('eiken5_grammar_practice', 'eiken5_grammar_practice'),
        ('eiken5_conversation_vocab_practice', 'eiken5_conversation_vocab_practice'),
        ('eiken5_sentence_order', 'eiken5_sentence_order'),
    ]
    list_selection = forms.ChoiceField(choices=list_choices, required=False, label='Select List')



    class Meta:
        model = Question
        fields = ['name', 'category', 'description', 'double_object', 'write_answer', 'japanese_option', 'question_list', 'list_selection', 'first_letter', 'second_letter', 'third_letter', 'last_letter', 'no_sound', 'sound2', 'sound3', 'sound4', 'picture2', 'word2', 'label', 'display_all', 'sentence_order']

    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }


    def save(self, commit=True):
        instance = super(QuestionCreateForm, self).save(commit=False)

        selected_list = self.cleaned_data.get('list_selection')
        if selected_list:
            instance.question_list = QUESTION_LISTS.get(selected_list)

        if commit:
            instance.save()

        return instance


class OptionCreateForm(forms.ModelForm):



    class Meta:
        model = Option
        fields = ['name', 'is_correct']

    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }