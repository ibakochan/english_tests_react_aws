import React, { useState, useEffect } from 'react';
import { wrapTextSafe } from "../../utils/TestHelpers";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';



const TestRenderForm = ({
  timestamp,
  question,
  selectedKeys,
  randomizedOptions,
  correctOption,
  opponentAnsweredWrong,
  selectedOption,
  inputValue,
  setInputValue,
  setCorrectOption,
  setSelectedOption,
  handleSubmit,
  randomAlphabet,
  randomLabel,
  randomWord2,
  randomPicture,
  randomCorrect,
  randomWord,
  randomJapanese,
  randomNumbers,
  questions,
  randomEikenUrl,
  randomFifth,
  randomWrongThree,
  randomWrongOne,
  randomWrongTwo,
  randomAlphabetSliced,
  opponentA,
  ws,
  isEnglish,
  gameState,
  sendData,
  handlePlay,
  isPractice,
  activeCategory,
  youAnsweredWrong,
  setYouAnsweredWrong,
}) => {
  const [droppedItems, setDroppedItems] = useState(
    randomFifth ? [null, null, null, null, null] : [null, null, null, null]
  );
  const [dragText, setDragText] = useState('');

  const allDropped = droppedItems.every(item => item !== null);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', dragText);
  };

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text');
    setDroppedItems(prev => {
      const newDropped = [...prev];
      newDropped[index] = data;
      return newDropped;
    });
  };

  useEffect(() => {
  const expectedOrder = [randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect];

  if (randomFifth) {
      expectedOrder.push(randomFifth);
  }

  const isCorrect =
    droppedItems.length === expectedOrder.length &&
    droppedItems.every((item, index) => item === expectedOrder[index]);

    if (isCorrect) {
      setCorrectOption(true);
    } else {
      setCorrectOption(false);
    }
  }, [droppedItems, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomFifth]);

  const handleReturnItem = (index) => () => {
    setDroppedItems(prev => {
      const newDropped = [...prev];
      newDropped[index] = null;
      return newDropped;
    });
  };



  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping
  };


  const options = randomizedOptions[question.duplicateId];
  if (!options) return null;
  const optionId = options.length === 1 ? options[0].id : null;
  let answered_wrong = true;
  if (correctOption) {
    answered_wrong = false;
  }

  return (
    <form
      className="test-form"
      onSubmit={(e) => {
        if (selectedOption !== null || inputValue.trim() !== '' || allDropped) {
          handleSubmit({
            e: e,
            questionId: question.id,
            question: question,
            optionId: optionId,
            testId: question.test,
          });
          if (opponentA !== "" && answered_wrong === true && ws && ws.readyState === WebSocket.OPEN) {
            sendData({
              type: "answer_submit",
              target_username: opponentA,
              answered_wrong: answered_wrong,
            });
          }
        } else {
          e.preventDefault();
        }
      }}
    >
      <div className="container-fluid">
        <div className="row">
          {!question.sentence_order && options.map(option => {
            return (
              <div key={option.id} className={!question.write_answer ? "col-md-6" : ""}>
                {question.write_answer ? (
                  <>
                    {(question.first_letter || question.second_letter || question.third_letter || question.last_letter) ? (
                      <div>
                        <span style={{ fontSize: '50px' }}>{randomAlphabetSliced}</span>
                      </div>
                    ) : null}

                    {question.description && (
                      <h4>{question.name}</h4>
                    )}
                    <input
                      type="text"
                      id={`selected_option_${question.id}_${option.id}`}
                      name={`selected_option_${question.id}`}
                      style={{ width: '400px', height: '50px', marginTop: '20px' }}
                      value={inputValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setInputValue(value);
                        if (!randomLabel && !question.word2 && value === randomAlphabet) {
                          setCorrectOption(true);
                        } else if (randomLabel && value === randomLabel) {
                          setCorrectOption(true);
                        } else if (question.word2 && value === randomWord2 ) {
                          setCorrectOption(true);
                        } else if (question.display_all && value === randomWord) {
                          setCorrectOption(true);
                        } else {
                          setCorrectOption(false);
                        }
                      }}
                    />
                  </>
                ) : (
                  <>
                    <label htmlFor={`selected_option_${question.id}_${option.id}`} style={{ fontSize: '25px', marginBottom: '10px'}}>
                      {question.question_list[option.randomOptionKey]?.picture && !question.label ? (
                      <img
                        style={{ width: '150px', height: '120px', marginTop: '8px', border: '3px solid black' }}
                        src={option.is_correct ? randomPicture : question.question_list[option.randomOptionKey].picture}
                        alt="Option"
                      />
                      ): null}
                      <input
                        type="radio"
                        id={`selected_option_${question.id}_${option.id}`}
                        name={`selected_option_${question.id}`}
                        value={option.id}
                        style={{ height: '25px', width: '25px', marginRight: '10px', flexShrink: 0 }}
                        onChange={() => {
                          setCorrectOption(option.is_correct);
                          setSelectedOption(option.id);
                        }}
                        checked={selectedOption === option.id}
                      />
                      <h4
                        style={{ flex: 1, userSelect: 'none' }}
                        onClick={(e) => randomEikenUrl && !randomWrongThree && !question.no_sound ? handlePlay(option.is_correct ? randomEikenUrl : questions.question_list[option.randomOptionKey][1], e.target) : null}
                      >
                        {(question.question_list[option.randomOptionKey]?.word === undefined && !randomPicture) ? (
                          option.is_correct ? (randomCorrect ? randomCorrect : randomAlphabet) : randomWrongThree ? (option.id == question.options[1].id ? randomWrongOne : option.id == question.options[2].id ? randomWrongTwo : randomWrongThree) : option.randomOptionKey ? option.randomOptionKey : option.name
                        ): (question.question_list[option.randomOptionKey]?.word !== undefined && !randomPicture ? (option.is_correct ? (randomNumbers !== undefined ? randomNumbers : randomWord) : (randomNumbers !== undefined ? question.question_list[option.randomOptionKey].numbers : question.question_list[option.randomOptionKey].word)) : null
                        )}
                        {question.japanese_option && (
                          option.is_correct ? randomJapanese : question.question_list[option.randomOptionKey]?.japanese
                        )}
                      </h4>
                      {question.question_list[option.randomOptionKey].word && randomPicture ? (
                      <h4 style={{ userSelect: 'none' }}>
                      {wrapTextSafe(
                        question.label
                          ? option.is_correct ? randomLabel : question.question_list[option.randomOptionKey].label === randomLabel ? "1000 Yen" : question.question_list[option.randomOptionKey].label
                          : option.is_correct ? randomWord : question.question_list[option.randomOptionKey].word
                      ).map((line, i) => <div key={i}>{line}</div>)}
                      </h4>                    
                      ): null}
                    </label>
                  </>
                )}
              </div>
            );
          })}
            {question.sentence_order && (
              <div>
                <div style={{ display: 'flex', gap: '20px', padding: '40px' }}>
                {options.map((option, index) => {
                  let textToDrag = option.is_correct
                    ? randomCorrect
                    : option.id === question.options[1].id
                    ? randomWrongOne
                    : option.id === question.options[2].id
                    ? randomWrongTwo
                    : option.id === question.options[3].id 
                    ? randomWrongThree
                    : randomFifth

                  if (droppedItems.includes(textToDrag)) {
                    textToDrag = null;
                  }
                  return (
                    <div
                      key={option.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', textToDrag);
                      }}
                      className="btn btn-light border border-dark text-dark"
                      style={{
                        width: '120px',
                        height: '60px',
                        fontSize: '20px',
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '8px auto',
                      }}
                    >
                      {textToDrag}
                    </div>
                  );
                })}
                </div>
                <h4>下まで言葉全部引っ張ってから答えて</h4>
                <h4>一回押せばもとに戻る</h4>
                <div style={{ display: 'flex', gap: '20px', padding: '40px' }}>
                {[...Array(randomFifth ? 5 : 4).keys()].map((i) => (
                  <div
                    key={i}
                    onDrop={handleDrop(i)}
                    onDragOver={handleDragOver}
                    onClick={handleReturnItem(i)}
                    className="btn btn-light border border-dark text-dark"
                    style={{
                      width: '120px',
                      height: '60px',
                      fontSize: '20px',
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '8px auto',
                    }}
                  >
                    {droppedItems[i] && droppedItems[i]}
                  </div>
                ))}
                </div>
              </div>
            )}

        </div>
      </div>
      <button
        id="submit-btn"
        type="submit"
        className="btn btn-primary"
        style={{ border: '4px solid #343a40', width: '400px', height: '80px', marginTop: '20px'}}
      >
        {isEnglish ? "Answer" : "回答する"}
      </button>
    </form>
  );
};

export default TestRenderForm;
