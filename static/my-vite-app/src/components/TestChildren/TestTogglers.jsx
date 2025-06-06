import React from "react";
import { FaArrowLeft } from "react-icons/fa";

export const FinalsButton = ({ setActiveFinals }) => (
  <button className="btn btn-success test_buttons test_button_hover" onClick={() => setActiveFinals(true)}>
    <span className="text-center text-white text_shadow" style={{ fontSize: '15px' }}>
      まとめテスト
    </span>
    <img
      src={'https://storage.googleapis.com/grade5_lesson8/ivar.jpg'}
      alt="Question"
      width="170"
      height="170"
    />
  </button>
);

export const FinalsReturnButton = ({ openModal, gameState, isEnglish, audioRef }) => (
  <button
    className="btn btn-warning test_button_hover"
    style={{
      height: '50px',
      width: '400px',
      border: '5px solid black',
      marginBottom: '20px',
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}
    onClick={() => {
      if (audioRef?.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      openModal();
    }}
  >
    <span className="text-center text-white text_shadow">
      <FaArrowLeft style={{ marginRight: '10px' }} />
      {gameState.activeQuestionIndex !== 0 ? (isEnglish ? 'Record score and ' : '点数記録して') : ''}
      {isEnglish ? 'Go back from ' : ''}まとめてスト{!isEnglish ? 'から戻る!' : ''}
    </span>
  </button>
);

export const TestReturnButton = ({ openModal, gameState, isEnglish, activeTestId, test, audioRef }) => (
    <button
      translate="no"
      className={`btn btn-warning test_button_hover ${activeTestId === test.id || activeTestId === null ? 'active' : 'd-none'}`}
      style={{ height: '50px', width: '400px', border: '5px solid black', marginBottom: '20px' }}
      onClick={() => {
        if (audioRef?.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        openModal();
      }}
    >
      <span className="text-center text-white text_shadow">
        <FaArrowLeft style={{ marginRight: '10px' }} />
        {gameState.activeQuestionIndex !== 0 ? (isEnglish ? 'Record score and ' : '点数記録して') : ''}
        {isEnglish ? 'Go back from ' : ''}
        {test.name}{!isEnglish ? 'から戻る!' : ''}
      </span>
    </button>
);

export const TestButtons = ({ test, activeCategory, activeTestId, toggleQuestionDetails, maxScores, isEnglish, audioRef }) => (
    <button
      className={`btn btn-warning test_buttons test_button_hover ${activeCategory === test.category && activeTestId === null ? 'active' : 'd-none'}`}
      onClick={() => toggleQuestionDetails({
        testId: test.id, testDescription: test.description, testDescriptionSound: test.sound_url,
        numberOfQuestions: test.number_of_questions, testName: test.name, category: undefined
      })}
    >
      <span className="text-center text-white text_shadow" style={{ fontSize: '15px' }}>
        {test.name}
      </span>
      {test.picture_url && <img src={test.picture_url} alt="Question" width="170" height="170" />}
      <div>
        {maxScores.some(maxScore => maxScore.test === test.id)
          ? maxScores.map(maxScore =>
              maxScore.test === test.id ? (
                <h5 key={maxScore.id} className="text-white">
                  {isEnglish ? "High score: " : "最高記録："}{maxScore.score}/{test.total_score}
                </h5>
              ) : null
            )
          : <h5 className="text-white">{isEnglish ? "Still " : "まだ"}0/{test.total_score}</h5>
        }
      </div>
    </button>
);