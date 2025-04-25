import React from 'react';

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
        if (selectedOption !== null || inputValue.trim() !== '') {
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
          {options.map(option => {
            return (
              <div key={option.id} className={!question.write_answer ? "col-md-6" : ""}>
                {question.write_answer ? (
                  <>
                    {(question.first_letter || question.second_letter || question.third_letter || question.last_letter) ? (
                      <div>
                        <span style={{ fontSize: '50px' }}>{randomAlphabetSliced}</span>
                        <p>書いてある文字と足りない文字を全部書いて上の言葉を完成させてください</p>
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
                      <span
                        style={{ flex: 1 }}
                        onClick={(e) => randomEikenUrl && !randomWrongThree && !question.no_sound ? handlePlay(option.is_correct ? randomEikenUrl : questions.question_list[option.randomOptionKey][1], e.target) : null}
                      >
                        {(question.question_list[option.randomOptionKey]?.word === undefined && !randomPicture) ? (
                          option.is_correct ? (randomCorrect ? randomCorrect : randomAlphabet) : randomWrongThree ? (option.id == question.options[1].id ? randomWrongOne : option.id == question.options[2].id ? randomWrongTwo : randomWrongThree) : option.randomOptionKey ? option.randomOptionKey : option.name
                        ): (question.question_list[option.randomOptionKey]?.word !== undefined && !randomPicture ? (option.is_correct ? (randomNumbers !== undefined ? randomNumbers : randomWord) : (randomNumbers !== undefined ? question.question_list[option.randomOptionKey].numbers : question.question_list[option.randomOptionKey].word)) : null
                        )}
                        {question.japanese_option && (
                          option.is_correct ? randomJapanese : question.question_list[option.randomOptionKey]?.japanese
                        )}
                      </span>
                    </label>
                    {question.question_list[option.randomOptionKey].word && randomPicture ? (
                      <h4>{question.label ? (option.is_correct ? randomLabel : (question.question_list[option.randomOptionKey].label === randomLabel) ? "1000 Yen" : question.question_list[option.randomOptionKey].label) : option.is_correct ? randomWord : question.question_list[option.randomOptionKey].word}</h4>
                    ): null}
                  </>
                )}
              </div>
            );
          })}
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
