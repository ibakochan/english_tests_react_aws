import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Form, Button, Alert } from 'react-bootstrap';
import { CategoryButtons, CategoryReturnButton } from "./TestChildren/CategoryTogglers";
import { useUser } from "../context/UserContext";

const TestCreate = () => {
  const { currentUser, setCurrentUser, lvl, setLvl, petLevel, setPetLevel, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish } = useUser();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [tests, setTests] = useState([]);
  const [testQuestions, setTestQuestions] = useState({});
  const [options, setOptions] = useState({});
  const [cookies] = useCookies(['csrftoken']);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [writeAnswer, setWriteAnswer] = useState(false);
  const [japaneseOption, setJapaneseOption] = useState(false);
  const [description, setDescription] = useState(false);
  const [doubleObject, setDoubleObject] = useState(false);
  const [firstLetter, setFirstLetter] = useState(false);
  const [secondLetter, setSecondLetter] = useState(false);
  const [thirdLetter, setThirdLetter] = useState(false);
  const [lastLetter, setLastLetter] = useState(false);
  const [displayAll, setDisplayAll] = useState(false);
  const [sentenceOrder, setSentenceOrder] = useState(false);
  const [questionNoSound, setQuestionNoSound] = useState(false);
  const [questionSound2, setQuestionSound2] = useState(false);
  const [questionSound3, setQuestionSound3] = useState(false);
  const [questionSound4, setQuestionSound4] = useState(false);
  const [questionLabel, setQuestionLabel] = useState(false);
  const [questionPicture2, setQuestionPicture2] = useState(false);
  const [questionWord2, setQuestionWord2] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const urlPath = window.urlPath


  useEffect(() => {
  }, [options]);



  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get('/api/name-id-tests/');
        setTests(response.data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };
  
    fetchTests();
  }, []);


  const fetchQuestionsByTest = (testId) => {
    axios.get(`/api/test-questions/by-test/${testId}/`)
      .then(response => {
        setTestQuestions(prevQuestions => ({
          ...prevQuestions,
          [testId]: response.data,
        }));
      })
      .catch(error => {
        console.error(`Error fetching questions for test ${testId}:`, error);
      });
  };

  const toggleCategories = async (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
  };

  const fetchOptionsByQuestion = (questionId) => {
    axios.get(`/api/options/by-question/${questionId}/`)
      .then(response => {
        setOptions(prevOptions => ({
          ...prevOptions,
          [questionId]: response.data,
        }));
      })
      .catch(error => {
        console.error(`Error fetching options for question ${questionId}:`, error);
      });
  };



  const handleTestCreateInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };





  const handleTestCreateSubmit = async (e) => {
      e.preventDefault();
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('lesson_number', formData.lesson_number);
      data.append('picture_url', formData.picture_url);
      data.append('sound_url', formData.sound_url || "");
      data.append('score_multiplier', formData.score_multiplier);
      data.append('number_of_questions', formData.number_of_questions);


      try {
          const response = await fetch(`/test/create/`, {
              method: 'POST',
              headers: {
                  'X-CSRFToken': cookies.csrftoken,
              },
              body: data,
          });

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const result = await response.json();
          setResponseMessage(result.message);
          setTests(prevTests => [
              { id: result.id, name: result.name, category: result.category },
              ...prevTests
          ]);


      } catch (error) {
          console.error('There was a problem with the fetch operation:', error);
      }
  };


  const handleTestDelete = async (testId) => {
    try {
      const response = await fetch(`/test/${testId}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': cookies.csrftoken,
        },
      });
      setActiveTestId(null);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      setTests(prevTests =>
          prevTests.filter(test => test.id !== testId)
      );



    } catch (error) {
      console.error(`There was a problem with the delete operation:`, error);
    }
  };



  const handleQuestionPictureFileChange = (e) => {
    setFormData({ ...formData, question_picture: e.target.files[0] });
  };

  const handleQuestionSoundFileChange = (e) => {
    setFormData({ ...formData, question_sound: e.target.files[0] });
  };

  const handleWriteAnswerChange = (e) => {
    setWriteAnswer(e.target.checked);
  };

  const handleJapaneseOptionChange = (e) => {
    setJapaneseOption(e.target.checked);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.checked);
  };

  const handleDoubleObjectChange = (e) => {
    setDoubleObject(e.target.checked);
  };

  const handleQuestionSound2Change = (e) => {
    setQuestionSound2(e.target.checked);
  };

  const handleQuestionNoSoundChange = (e) => {
    setQuestionNoSound(e.target.checked);
  };

  const handleQuestionSound3Change = (e) => {
    setQuestionSound3(e.target.checked);
  };

  const handleQuestionSound4Change = (e) => {
    setQuestionSound4(e.target.checked);
  };

  const handleQuestionLabelChange = (e) => {
    setQuestionLabel(e.target.checked);
  };

  const handleQuestionPicture2Change = (e) => {
    setQuestionPicture2(e.target.checked);
  };

  const handleQuestionWord2Change = (e) => {
    setQuestionWord2(e.target.checked);
  };



  const handleFirstLetterChange = (e) => {
    setFirstLetter(e.target.checked);
  };

  const handleSecondLetterChange = (e) => {
    setSecondLetter(e.target.checked);
  };

  const handleThirdLetterChange = (e) => {
    setThirdLetter(e.target.checked);
  };

  const handleLastLetterChange = (e) => {
    setLastLetter(e.target.checked);
  };

  const handleDisplayAllChange = (e) => {
    setDisplayAll(e.target.checked);
  };

  const handleSentenceOrderChange = (e) => {
    setSentenceOrder(e.target.checked);
  };


  const handleQuestionSubmit = async (testId, e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    if (formData.question_picture) {
      data.append('question_picture', formData.question_picture);
    }
    if (formData.question_sound) {
      data.append('question_sound', formData.question_sound);
    }
    data.append('category', formData.category);
    data.append('list_selection', formData.list_selection);
    data.append('japanese_option', japaneseOption);
    data.append('write_answer', writeAnswer);
    data.append('description', description);
    data.append('double_object', doubleObject);
    data.append('first_letter', firstLetter);
    data.append('second_letter', secondLetter);
    data.append('third_letter', thirdLetter);
    data.append('last_letter', lastLetter);
    data.append('display_all', displayAll);
    data.append('sentence_order', sentenceOrder);
    data.append('no_sound', questionNoSound)
    data.append('sound2', questionSound2)
    data.append('sound3', questionSound3)
    data.append('sound4', questionSound4)
    data.append('label', questionLabel)
    data.append('picture2', questionPicture2)
    data.append('word2', questionWord2)


    try {
      const response = await fetch(`/question/${testId}/create/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': cookies.csrftoken,
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setResponseMessage(result.message);

      setTestQuestions(prevQuestions => {
          const newQuestions = {...prevQuestions};
          if (!newQuestions[testId]) {
              newQuestions[testId] = [];
          }
          newQuestions[testId].unshift({id: result.id, name: result.name});
          return newQuestions;
      });

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleQuestionDelete = async (questionId) => {
    try {
      const response = await fetch(`/question/${questionId}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': cookies.csrftoken,
        },
      });
      setActiveQuestionId(null);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      setTestQuestions(prevTestQuestions => {
        const newTestQuestions = {...prevTestQuestions};
        for (let testId in newTestQuestions) {
          newTestQuestions[testId] = newTestQuestions[testId].filter(question => question.id !== questionId);
        }
        return newTestQuestions;
      });

    } catch (error) {
      console.error(`There was a problem with the delete operation:`, error);
    }
  };



  const handleOptionCreateFileChange = (e) => {
    setFormData({ ...formData, option_picture: e.target.files[0] });
  };

  const handleIsCorrectChange = (e) => {
    setIsCorrect(e.target.checked);
  };


  const handleOptionCreateSubmit = async (questionId, e) => {
      e.preventDefault();
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.option_picture) {
          data.append('option_picture', formData.option_picture);
      }
      data.append('is_correct', isCorrect);

      try {
          const response = await fetch(`/option/${questionId}/create/`, {
              method: 'POST',
              headers: {
                  'X-CSRFToken': cookies.csrftoken,
              },
              body: data,
          });

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const result = await response.json();
          setResponseMessage(result.message);

          setOptions(prevOptions => {
              const newOptions = {...prevOptions};
              if (!newOptions[questionId]) {
                  newOptions[questionId] = [];
              }
              newOptions[questionId].unshift({id: result.pk, name: result.name, is_correct: result.is_correct}); // Add the new option at the beginning of the array
              return newOptions;
          });

      } catch (error) {
          console.error('There was a problem with the fetch operation:', error);
      }
  };

  const handleOptionDelete = async (optionId) => {
    try {
      const response = await fetch(`/option/${optionId}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': cookies.csrftoken,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      setOptions(prevOptions => {
        const newOptions = {...prevOptions};
        for (let questionId in newOptions) {
          newOptions[questionId] = newOptions[questionId].filter(option => option.id !== optionId);
        }
        return newOptions;
      });

    } catch (error) {
      console.error(`There was a problem with the delete operation:`, error);
    }
  };




  const toggleQuestionDetails = (testId) => {
    if (activeTestId === testId) {
      setActiveTestId(null);
      setActiveQuestionId(null);
    } else {
      setActiveTestId(testId);
      setActiveQuestionId(null);
      fetchQuestionsByTest(testId);
    }
  };

  const toggleOptionDetails = (questionId) => {
    if (activeQuestionId === questionId) {
      setActiveQuestionId(null);
    } else {
      setActiveQuestionId(questionId);
      fetchOptionsByQuestion(questionId);
    }
  };

  return (
    <div>
          <form onSubmit={(e) => handleTestCreateSubmit(e)}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleTestCreateInputChange}
              placeholder="Test Name"
              className="form-control"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleTestCreateInputChange}
              placeholder="Description"
              className="form-control"
            />
            <input
              type="text"
              name="picture_url"
              value={formData.picture_url}
              onChange={handleTestCreateInputChange}
              placeholder="picture url"
              className="form-control"
            />
            <input
              type="text"
              name="sound_url"
              value={formData.sound_url}
              onChange={handleTestCreateInputChange}
              placeholder="sound url"
              className="form-control"
            />
            <input
              type="number"
              name="lesson_number"
              value={formData.lesson_number}
              onChange={handleTestCreateInputChange}
              placeholder="lesson number"
              className="form-control"
            />
            <input
              type="number"
              name="score_multiplier"
              value={formData.score_multiplier}
              onChange={handleTestCreateInputChange}
              placeholder="score multiplier"
              className="form-control"
            />
            <input
              type="number"
              name="number_of_questions"
              value={formData.number_of_questions}
              onChange={handleTestCreateInputChange}
              placeholder="number_of_questions"
              className="form-control"
            />
            <select name="category" value={formData.category} onChange={handleTestCreateInputChange} className="form-control">
                <option value="">Select Category</option>
                <option value="japanese">Japanese</option>
                <option value="english_5">English_5</option>
                <option value="english_6">English_6</option>
                <option value="jr_1">Jr_1</option>
                <option value="jr_2">Jr_2</option>
                <option value="jr_3">Jr_3</option>
                <option value="phonics">Phonics</option>
                <option value="numbers">Numbers</option>
                <option value="eiken">Eiken</option>
                <option value="eiken4">Eiken4</option>
                <option value="eiken3">Eiken3</option>
                <option value="eiken_pre2">Eiken Pre2</option>
                <option value="eiken2">Eiken2</option>
            </select>
            <button type="submit" style={{ border: '5px solid black' }} className="btn btn-primary submit_buttons">Submit</button>
          </form>
          {responseMessage && <p>{responseMessage}</p>}
          <div className="test-buttons-container">
            <div style={{ justifyContent: 'center' }}>
              <CategoryButtons isEnglish={isEnglish} toggleCategories={toggleCategories} activeCategory={activeCategory} currentUser={currentUser} />
              {!activeTestId &&
                <CategoryReturnButton isEnglish={isEnglish} toggleCategories={toggleCategories} activeCategory={activeCategory} activeTestId={activeTestId} />
              }
            </div>
            {tests
            .filter(test => test.category === activeCategory)
            .map(test => (
              <span key={test.id}>
                {activeTestId === null || activeTestId === test.id ? (
                <span>
                  <Button
                    variant="warning"
                    className="toggle-test-btn"
                    style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                    onClick={() => toggleQuestionDetails(test.id)}
                  >
                    {test.name}
                  </Button>
                </span>
                ) : null}
                {activeTestId === test.id && testQuestions[test.id] && (
                  <div className="questions-container">
                  <Button
                    variant="danger"
                    onClick={() => handleTestDelete(test.id)}
                    style={{ width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                  >
                    Delete Test
                  </Button>
                  <form onSubmit={(e) => handleQuestionSubmit(test.id, e)}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleTestCreateInputChange}
                      placeholder="Question Name"
                      className="form-control"
                    />
                    <select name="list_selection" value={formData.list_selection} onChange={handleTestCreateInputChange} className="form-control">
                        <option value="">Select List</option>
                        {test.category === 'english_5' &&
                        <>
                        <option value="grade5_lesson1_words">Grade5_lesson1_words</option>
                        <option value="grade5_lesson1_names">Grade5_lesson1_names</option>
                        <option value="grade5_lesson1_sentence">Grade5_lesson1_sentence</option>
                        <option value="grade5_lesson2">Grade5_lesson2</option>
                        <option value="grade5_lesson3">Grade5_lesson3</option>
                        <option value="grade5_lesson3_sentence">Grade5_lesson3_sentence</option>
                        <option value="grade5_lesson4_sentence">grade5_lesson4_sentence</option>
                        <option value="lesson4_list">Grade5_lesson4</option>
                        <option value="grade_5_lesson_5">Grade5_lesson5</option>
                        <option value="grade_5_lesson_6">Grade5_lesson6</option>
                        <option value="grade5_lesson7">Grade5_lesson7</option>
                        <option value="grade5_lesson8">Grade5_lesson8</option>
                        </>
                        }
                        {test.category === 'english_6' &&
                        <>
                        <option value="grade6_lesson1">Grade6_lesson1</option>
                        <option value="grade6_lesson2">Grade6_lesson2</option>
                        <option value="grade6_lesson3">Grade6_lesson3</option>
                        <option value="grade6_lesson3_frequency">Grade6_lesson3_frequency</option>
                        <option value="lesson4_grade6_dict">Grade6_lesson4</option>
                        <option value="grade6_lesson4_vocab">grade6_lesson4_vocab</option>
                        <option value="grade_6_lesson_5">Grade6_lesson5</option>
                        <option value="grade_6_lesson_6">Grade6_lesson6</option>
                        <option value="grade_6_lesson_7">Grade6_lesson7</option>
                        <option value="grade_6_lesson_8">Grade6_lesson8</option>
                        </>
                        }
                        {test.category === 'jr_1' &&
                        <>
                        <option value="jr_1_lesson_1_vocab">Lesson 1 Vocab</option>
                        <option value="jr_1_lesson_1_conversation">Lesson 1 Conversation</option>
                        <option value="jr_1_lesson_2_vocab">Lesson 2 Vocab</option>
                        <option value="jr_1_lesson_2_conversation">Lesson 2 Conversation</option>
                        <option value="jr_1_lesson_3_vocab">Lesson 3 Vocab</option>
                        <option value="jr_1_lesson_3_sentence">Lesson 3 Sentence</option>
                        <option value="jr_1_lesson_4_vocab">Lesson 4 Vocab</option>
                        <option value="jr_1_lesson_4_conversation">Lesson 4 Conversation</option>
                        <option value="jr_1_lesson_5_vocab">Lesson 5 Vocab</option>
                        <option value="jr_1_lesson_5_conversation">Lesson 5 Conversation</option>
                        <option value="jr_1_lesson_6_vocab">Lesson 6 Vocab</option>
                        <option value="jr_1_lesson_6_sentence">Lesson 6 Sentence</option>
                        <option value="jr_1_lesson_7_vocab">Lesson 7 Vocab</option>
                        <option value="jr_1_lesson_7_conversation">Lesson 7 Conversation</option>
                        <option value="jr_1_lesson_8_vocab">Lesson 8 Vocab</option>
                        <option value="jr_1_lesson_8_sentence">Lesson 8 Sentence</option>
                        <option value="jr_1_lesson_9_vocab">Lesson 9 Vocab</option>
                        <option value="jr_1_lesson_9_conversation">Lesson 9 Conversation</option>
                        <option value="jr_1_lesson_10_vocab">Lesson 10 Vocab</option>
                        <option value="lesson_10_story">Lesson 10 Story</option>
                        </>
                        }
                        {test.category === 'jr_2' &&
                        <>
                        <option value="jr_2_lesson_1_vocab">Lesson 1 Vocab</option>
                        <option value="jr_2_lesson_1_story">Lesson 1 Story</option>
                        <option value="jr_2_lesson_2_vocab">Lesson 2 Vocab</option>
                        <option value="jr_2_lesson_2_story">Lesson 2 Story</option>
                        <option value="jr_2_lesson_3_vocab">Lesson 3 Vocab</option>
                        <option value="jr_2_lesson_3_story">Lesson 3 Story</option>
                        <option value="jr_2_lesson_4_vocab">Lesson 4 Vocab</option>
                        <option value="jr_2_lesson_4_story">Lesson 4 Story</option>
                        <option value="jr_2_lesson_5_vocab">Lesson 5 Vocab</option>
                        <option value="jr_2_lesson_5_story">Lesson 5 Story</option>
                        <option value="jr_2_lesson_6_vocab">Lesson 6 Vocab</option>
                        <option value="jr_2_lesson_6_story">Lesson 6 Story</option>
                        <option value="jr_2_lesson_7_vocab">Lesson 7 Vocab</option>
                        <option value="jr_2_lesson_7_story">Lesson 7 Story</option>
                        <option value="jr_2_lesson_8_vocab">Lesson 8 Vocab</option>
                        <option value="jr_2_lesson_8_story">Lesson 8 Story</option>
                        </>
                        }
                        {test.category === 'jr_3' &&
                        <>
                        <option value="jr_3_lesson_1_vocab">Lesson 1 Vocab</option>
                        <option value="jr_3_lesson_1_story">Lesson 1 Story</option>
                        <option value="jr_3_lesson_2_vocab">Lesson 2 Vocab</option>
                        <option value="jr_3_lesson_2_story">Lesson 2 Story</option>
                        <option value="jr_3_lesson_3_vocab">Lesson 3 Vocab</option>
                        <option value="jr_3_lesson_3_story">Lesson 3 Story</option>
                        <option value="jr_3_lesson_4_vocab">Lesson 4 Vocab</option>
                        <option value="jr_3_lesson_4_story">Lesson 4 Story</option>
                        <option value="jr_3_lesson_5_vocab">Lesson 5 Vocab</option>
                        <option value="jr_3_lesson_5_story">Lesson 5 Story</option>
                        <option value="jr_3_lesson_6_vocab">Lesson 6 Vocab</option>
                        <option value="jr_3_lesson_6_story">Lesson 6 Story</option>
                        <option value="jr_3_lesson_7_vocab">Lesson 7 Vocab</option>
                        <option value="jr_3_lesson_7_story">Lesson 7 Story</option>
                        </>
                        }
                        {test.category === 'phonics' &&
                        <>
                        <option value="alphabet_sounds">Big Alphabet</option>
                        <option value="hebonshiki1">Hebonshiki1</option>
                        <option value="hebonshiki2">Hebonshiki2</option>
                        <option value="hebonshiki3">Hebonshiki3</option>
                        <option value="hebonshiki4">Hebonshiki4</option>
                        <option value="hebonshiki5">Hebonshiki5</option>
                        <option value="small_alphabet_sounds">Small Alphabet</option>
                        <option value="alphabet_phonics">alphabet Phonics</option>
                        <option value="alphabet_sounds2">Alphabet Phonics2</option>
                        <option value="alphabet_sounds3">Alphabet Phonics3</option>
                        <option value="phonics1">Phonics1</option>
                        <option value="phonics_2">Phonics2</option>
                        <option value="phonics3">Phonics3</option>
                        </>
                        }
                        {test.category === 'numbers' &&
                        <>
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                        <option value="dates">Dates</option>
                        <option value="one_twenty">One Twenty</option>
                        <option value="one_hundred">One Hundred</option>
                        <option value="eleven_ninety">Eleven Ninety</option>
                        <option value="one_thousand">One Thousand</option>
                        <option value="one_quadrillion">One Quadrillion</option>
                        <option value="thousand_quadrillion">Thousand Quadrillion</option>
                        </>
                        }
                        {test.category === 'eiken' && 
                        <>
                        {urlPath === "/ar/" ? (
                        <>
                        <option value="arabic_eiken5_vocab">Arabic_eiken5 Vocab</option>
                        <option value="arabic_eiken5_vocab1">Arabic_eiken5 Vocab1</option>
                        <option value="arabic_eiken5_vocab2">Arabic_eiken5 Vocab2</option>
                        <option value="arabic_eiken5_vocab3">Arabic_eiken5 Vocab3</option>
                        <option value="arabic_eiken5_vocab4">Arabic_eiken5 Vocab4</option>
                        <option value="arabic_eiken5_vocab5">Arabic_eiken5 Vocab5</option>
                        <option value="arabic_eiken5_vocab6">Arabic_eiken5 Vocab6</option>
                        <option value="arabic_eiken5_vocab7">Arabic_eiken5 Vocab7</option>
                        <option value="arabic_eiken5_vocab8">Arabic_eiken5 Vocab8</option>
                        <option value="arabic_eiken5_vocab9">Arabic_eiken5 Vocab9</option>
                        <option value="arabic_eiken5_vocab10">Arabic_eiken5 Vocab10</option>
                        <option value="arabic_eiken5_vocab11">Arabic_eiken5 Vocab11</option>
                        <option value="arabic_eiken5_vocab12">Arabic_eiken5 Vocab12</option>
                        <option value="arabic_eiken5_vocab13">Arabic_eiken5 Vocab13</option>
                        <option value="arabic_eiken5_vocab14">Arabic_eiken5 Vocab14</option>
                        <option value="arabic_eiken5_vocab15">Arabic_eiken5 Vocab15</option>
                        <option value="arabic_eiken5_vocab16">Arabic_eiken5 Vocab16</option>
                        </>
                        ) : (
                        <>
                        <option value="eiken5_vocab1">Eiken5 Vocab1</option>
                        <option value="eiken5_vocab2">Eiken5 Vocab2</option>
                        <option value="eiken5_vocab3">Eiken5 Vocab3</option>
                        <option value="eiken5_vocab4">Eiken5 Vocab4</option>
                        <option value="eiken5_vocab5">Eiken5 Vocab5</option>
                        <option value="eiken5_vocab6">Eiken5 Vocab6</option>
                        <option value="eiken5_vocab7">Eiken5 Vocab7</option>
                        <option value="eiken5_vocab8">Eiken5 Vocab8</option>
                        <option value="eiken5_vocab9">Eiken5 Vocab9</option>
                        <option value="eiken5_vocab10">Eiken5 Vocab10</option>
                        <option value="eiken5_vocab11">Eiken5 Vocab11</option>
                        <option value="eiken5_vocab12">Eiken5 Vocab12</option>
                        <option value="eiken5_vocab13">Eiken5 Vocab13</option>
                        <option value="eiken5_vocab14">Eiken5 Vocab14</option>
                        <option value="eiken5_vocab15">Eiken5 Vocab15</option>
                        <option value="eiken5_vocab16">Eiken5 Vocab16</option>
                        <option value="eiken5_vocab">Eiken5 Vocab</option>
                        <option value="eiken5_grammar_vocab">Eiken5 Grammar Vocab</option>
                        <option value="eiken5_vocab_practice">Eiken5 Vocab Practice</option>
                        <option value="eiken5_grammar_practice">Eiken5 Grammar Practice</option>
                        <option value="eiken5_grammar_sentence_answers">Eiken5 Grammar Sentence Answers</option>
                        <option value="eiken5_conversation_vocab_practice">Eiken5 Conversation Vocab Practice</option>
                        <option value="eiken5_sentence_order">Eiken5 Sentence Order</option>
                        </>
                        )}
                        </>
                        }
                        {test.category === 'eiken4' &&
                        <>
                        {urlPath === "/ar/" ? (
                        <>
                        <option value="arabic_eiken4_vocab1">Arabic Eiken4 Vocab1</option>
                        <option value="arabic_eiken4_vocab2">Arabic Eiken4 Vocab2</option>
                        <option value="arabic_eiken4_vocab3">Arabic Eiken4 Vocab3</option>
                        <option value="arabic_eiken4_vocab4">Arabic Eiken4 Vocab4</option>
                        <option value="arabic_eiken4_vocab5">Arabic Eiken4 Vocab5</option>
                        <option value="arabic_eiken4_vocab6">Arabic Eiken4 Vocab6</option>
                        <option value="arabic_eiken4_vocab7">Arabic Eiken4 Vocab7</option>
                        <option value="arabic_eiken4_vocab8">Arabic Eiken4 Vocab8</option>
                        <option value="arabic_eiken4_vocab9">Arabic Eiken4 Vocab9</option>
                        <option value="arabic_eiken4_vocab10">Arabic Eiken4 Vocab10</option>
                        <option value="arabic_eiken4_vocab11">Arabic Eiken4 Vocab11</option>
                        <option value="arabic_eiken4_vocab12">Arabic Eiken4 Vocab12</option>
                        <option value="arabic_eiken4_vocab">Arabic Eiken4 Vocab</option>
                        </>
                        ) : (
                        <>
                        <option value="eiken4_vocab1">Eiken4 Vocab1</option>
                        <option value="eiken4_vocab2">Eiken4 Vocab2</option>
                        <option value="eiken4_vocab3">Eiken4 Vocab3</option>
                        <option value="eiken4_vocab4">Eiken4 Vocab4</option>
                        <option value="eiken4_vocab5">Eiken4 Vocab5</option>
                        <option value="eiken4_vocab6">Eiken4 Vocab6</option>
                        <option value="eiken4_vocab7">Eiken4 Vocab7</option>
                        <option value="eiken4_vocab8">Eiken4 Vocab8</option>
                        <option value="eiken4_vocab9">Eiken4 Vocab9</option>
                        <option value="eiken4_vocab10">Eiken4 Vocab10</option>
                        <option value="eiken4_vocab11">Eiken4 Vocab11</option>
                        <option value="eiken4_vocab12">Eiken4 Vocab12</option>
                        <option value="eiken4_vocab">Eiken4 Vocab</option>
                        <option value="eiken4_grammar_vocab">Eiken4 Grammar Vocab</option>
                        <option value="eiken4_vocab_practice">Eiken4 Vocab Practice</option>
                        <option value="eiken4_conversation_vocab_practice">Eiken4 Conversation Vocab Practice</option>
                        <option value="eiken4_grammar_practice">Eiken4 Grammar Practice</option>
                        <option value="eiken4_grammar_sentence_answers">Eiken4 Grammar Sentence Answers</option>
                        <option value="eiken4_sentence_order">Eiken4 Sentence Order</option>
                        </>
                        )}
                        </>
                        }
                        {test.category === 'eiken3' &&
                        <>
                        <option value="eiken3_vocab">Eiken3 Vocab</option>
                        <option value="eiken3_vocab1">Eiken3 Vocab1</option>
                        <option value="eiken3_vocab2">Eiken3 Vocab2</option>
                        <option value="eiken3_vocab3">Eiken3 Vocab3</option>
                        <option value="eiken3_vocab4">Eiken3 Vocab4</option>
                        <option value="eiken3_vocab5">Eiken3 Vocab5</option>
                        <option value="eiken3_vocab6">Eiken3 Vocab6</option>
                        <option value="eiken3_vocab7">Eiken3 Vocab7</option>
                        <option value="eiken3_vocab8">Eiken3 Vocab8</option>
                        <option value="eiken3_vocab9">Eiken3 Vocab9</option>
                        <option value="eiken3_vocab10">Eiken3 Vocab10</option>
                        <option value="eiken3_vocab11">Eiken3 Vocab11</option>
                        <option value="eiken3_vocab12">Eiken3 Vocab12</option>
                        <option value="eiken3_vocab13">Eiken3 Vocab13</option>
                        <option value="eiken3_vocab14">Eiken3 Vocab14</option>
                        <option value="eiken3_vocab15">Eiken3 Vocab15</option>
                        <option value="eiken3_vocab16">Eiken3 Vocab16</option>
                        <option value="eiken3_grammar_vocab">Eiken3 Grammar Vocab</option>
                        <option value="eiken3_vocab_practice">Eiken3 Vocab Practice</option>
                        <option value="eiken3_conversation_vocab_practice">Eiken3 Conversation Vocab Practice</option>
                        <option value="eiken3_grammar_practice">Eiken3 Grammar Practice</option>
                        <option value="eiken3_conversation_grammar_practice">Eiken3 Conversation Grammar Practice</option>
                        <option value="eiken3_grammar_sentence_answers">Eiken3 Grammar Sentence Answers</option>
                        </>
                        }
                        {test.category === 'eiken2' &&
                        <>
                            <option value="true_eiken2_vocab">True_eiken2 Vocab</option>
                            <option value="eiken2_vocab1">Eiken2 Vocab1</option>
                            <option value="eiken2_vocab2">Eiken2 Vocab2</option>
                            <option value="eiken2_vocab3">Eiken2 Vocab3</option>
                            <option value="eiken2_vocab4">Eiken2 Vocab4</option>
                            <option value="eiken2_vocab5">Eiken2 Vocab5</option>
                            <option value="eiken2_vocab6">Eiken2 Vocab6</option>
                            <option value="eiken2_vocab7">Eiken2 Vocab7</option>
                            <option value="eiken2_vocab8">Eiken2 Vocab8</option>
                            <option value="eiken2_vocab9">Eiken2 Vocab9</option>
                            <option value="eiken2_vocab10">Eiken2 Vocab10</option>
                            <option value="eiken2_vocab11">Eiken2 Vocab11</option>
                            <option value="eiken2_vocab12">Eiken2 Vocab12</option>
                            <option value="eiken2_vocab13">Eiken2 Vocab13</option>
                            <option value="eiken2_vocab14">Eiken2 Vocab14</option>
                            <option value="eiken2_vocab15">Eiken2 Vocab15</option>
                            <option value="eiken2_vocab_practice">Eiken2 Vocab_practice</option>
                        </>
                        }
                        {test.category === 'eiken_pre2' &&
                        <>
                        <option value="true_eiken_pre2_vocab">True_eiken_pre2 Vocab</option>
                        <option value="eiken_pre2_vocab1">Eiken_pre2 Vocab1</option>
                        <option value="eiken_pre2_vocab2">Eiken_pre2 Vocab2</option>
                        <option value="eiken_pre2_vocab3">Eiken_pre2 Vocab3</option>
                        <option value="eiken_pre2_vocab4">Eiken_pre2 Vocab4</option>
                        <option value="eiken_pre2_vocab5">Eiken_pre2 Vocab5</option>
                        <option value="eiken_pre2_vocab6">Eiken_pre2 Vocab6</option>
                        <option value="eiken_pre2_vocab7">Eiken_pre2 Vocab7</option>
                        <option value="eiken_pre2_vocab8">Eiken_pre2 Vocab8</option>
                        <option value="eiken_pre2_vocab9">Eiken_pre2 Vocab9</option>
                        <option value="eiken_pre2_vocab10">Eiken_pre2 Vocab10</option>
                        <option value="eiken_pre2_vocab11">Eiken_pre2 Vocab11</option>
                        <option value="eiken_pre2_vocab12">Eiken_pre2 Vocab12</option>
                        <option value="eiken_pre2_vocab13">Eiken_pre2 Vocab13</option>
                        <option value="eiken_pre2_vocab14">Eiken_pre2 Vocab14</option>
                        <option value="eiken_pre2_vocab15">Eiken_pre2 Vocab15</option>
                        <option value="eiken_pre2_vocab16">Eiken_pre2 Vocab16</option>
                        <option value="eiken_pre2_vocab_practice">Eiken_pre2 Vocab_practice</option>
                        </>
                        }
                    </select>
                    <select name="category" value={formData.category} onChange={handleTestCreateInputChange} className="form-control">
                        <option value="">Select Category</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="ar">Ar</option>
                    </select>
                    <input
                      type="file"
                      name="question_picture"
                      onChange={handleQuestionPictureFileChange}
                      className="form-control"
                    />
                    <input
                      type="file"
                      name="question_sound"
                      onChange={handleQuestionSoundFileChange}
                      className="form-control"
                    />
                    <div className="form-check">
                    <input
                      type="checkbox"
                      name="description"
                      checked={description}
                      onChange={handleDescriptionChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Description</label>
                    </div>
                    <div className="form-check">
                    <input
                      type="checkbox"
                      name="japanese_option"
                      checked={japaneseOption}
                      onChange={handleJapaneseOptionChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Japanese Option</label>
                    </div>
                    <div className="form-check">
                    <input
                      type="checkbox"
                      name="write_answer"
                      checked={writeAnswer}
                      onChange={handleWriteAnswerChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Write Answer</label>
                    </div>
                    <div className="form-check">
                    <input
                      type="checkbox"
                      name="double_object"
                      checked={doubleObject}
                      onChange={handleDoubleObjectChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Double Object</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="first_letter"
                        checked={firstLetter}
                        onChange={handleFirstLetterChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">First Letter</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="second_letter"
                        checked={secondLetter}
                        onChange={handleSecondLetterChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Second Letter</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="third_letter"
                        checked={thirdLetter}
                        onChange={handleThirdLetterChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Third Letter</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="last_letter"
                        checked={lastLetter}
                        onChange={handleLastLetterChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Last Letter</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="display_all"
                        checked={displayAll}
                        onChange={handleDisplayAllChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">display all</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="sentence_order"
                        checked={sentenceOrder}
                        onChange={handleSentenceOrderChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">sentence order</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="no_sound"
                        checked={questionNoSound}
                        onChange={handleQuestionNoSoundChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">No Sound</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="sound2"
                        checked={questionSound2}
                        onChange={handleQuestionSound2Change}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Sound2</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="sound3"
                        checked={questionSound3}
                        onChange={handleQuestionSound3Change}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Sound3</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="sound4"
                        checked={questionSound4}
                        onChange={handleQuestionSound4Change}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Sound4</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="label"
                        checked={questionLabel}
                        onChange={handleQuestionLabelChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Label</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="picture2"
                        checked={questionPicture2}
                        onChange={handleQuestionPicture2Change}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Picture2</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="word2"
                        checked={questionWord2}
                        onChange={handleQuestionWord2Change}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Word2</label>
                    </div>
                    <button type="submit" style={{ border: '5px solid black' }} className="btn btn-primary submit_buttons">Submit</button>
                  </form>
                  {responseMessage && <p>{responseMessage}</p>}
                    {testQuestions[test.id].map(question => (
                      <span key={question.id}>
                        {activeQuestionId === null || activeQuestionId === question.id ? (
                          <Button
                            variant="primary"
                            style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                            className="mb-2"
                            onClick={() => toggleOptionDetails(question.id)}
                          >
                            {
                              question.name !== "undefined" ? question.name : 'randomized'
                            }
                            {activeTestId === test.id && (
                              question.question_picture && (
                                <img src={question.question_picture} alt="Question" width="100" height="100" />
                              )
                            )}
                          </Button>
                        ) : null}
                        {activeQuestionId === question.id && options[question.id] && (
                          <div className="options-container">
                          <Button
                              variant="danger"
                              onClick={() => handleQuestionDelete(question.id)}
                              style={{ width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                          >
                            Delete
                          </Button>
                          <div>
                          {question.question_sound && (
                            <audio controls>
                              <source src={question.question_sound} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          )}
                          </div>
                          <div>
                          <form onSubmit={(e) => handleOptionCreateSubmit(question.id, e)}>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleTestCreateInputChange}
                              placeholder="Option Name"
                              className="form-control"
                            />
                            <input
                              type="file"
                              name="option_picture"
                              onChange={handleOptionCreateFileChange}
                              className="form-control"
                            />
                            <div className="form-check">
                            <input
                              type="checkbox"
                              name="is_correct"
                              checked={isCorrect}
                              onChange={handleIsCorrectChange}
                              className="form-check-input"
                            />
                            <label className="form-check-label">Is Correct</label>
                            </div>
                            <button type="submit" style={{ border: '5px solid black' }} className="btn btn-primary submit_buttons">Submit</button>
                          </form>
                          </div>
                            {options[question.id].map(option => (
                            <div key={option.id}>
                              <li>
                              <Button
                                variant="info"
                                style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                                className="mb-1"
                              >
                                {option.name}
                                {option.option_picture && (
                              <img src={option.option_picture} alt="Option" width="100" height="100" />
                              )}
                              {option.is_correct ? (
                                <span className="text-success" style={{ fontSize: '20px', marginLeft: '10px' }}>&#x2713;</span>
                              ) : (
                                <span className="text-danger" style={{ fontSize: '20px', marginLeft: '10px' }}>&#x2717;</span>
                            )}
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => handleOptionDelete(option.id)}
                                style={{ width: '200px', padding: '10px', margin: '5px', border: '4px solid black' }}
                              >
                                Delete
                              </Button>
                              </li>
                            </div>
                            ))}
                          </div>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </span>
            ))}
          </div>
    </div>
  );
};

export default TestCreate;
