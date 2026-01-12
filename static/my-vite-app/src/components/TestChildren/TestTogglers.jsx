import React from "react";
import { FaArrowLeft } from "react-icons/fa";

export const MusicVideoButton = ({ setActiveMusicVideos, activeMusicVideos }) => (
  <button className="btn btn-light test_buttons test_button_hover" onClick={() => setActiveMusicVideos(!activeMusicVideos)}style={{borderRadius: "0.75rem"}}>
    <span className="text-center text-white text_shadow" style={{ fontSize: '15px' }}>
      {activeMusicVideos ? '戻る' : '音楽ユーチューブ動画'}
    </span>
    <img
      src={'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg'}
      alt="Question"
      width="170"
      height="170"
    />
  </button>
);

export const IbaruCharactersButton = ({ toggleIbaruCharacters, activeIbaruCharacters }) => (
  <button 
    className="btn btn-primary test_button_hover"
    onClick={toggleIbaruCharacters}
    style={{
      borderRadius: "0.75rem",
      border: "4px solid #000",
      marginBottom: "20px",
      width: !activeIbaruCharacters ? "180px" : "400px",
      height: !activeIbaruCharacters ? "180px" : "50px",
    }}
  >
    <span className="text-center text-white text_shadow" style={{ fontSize: '15px' }}>
      {activeIbaruCharacters ? '戻る' : 'キャラの紹介'}
    </span>
    {!activeIbaruCharacters &&
    <img
      src={'https://storage.googleapis.com/stories_conversations/ibarunodensetsu.png'}
      alt="Question"
      width="150"
      height="130"
    />
    }
  </button>
);

export const FinalsButton = ({ setActiveFinals }) => (
  <button className="btn btn-success test_buttons test_button_hover" onClick={() => setActiveFinals(true)} style={{ borderRadius: "0.75rem" }}>
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
      marginRight: 'auto',
      borderRadius: "0.75rem"
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

export const TestReturnButton = ({ openModal, gameState, isEnglish, activeTestId, test, audioRef, urlPath }) => (
    <button
      translate="no"
      className={`btn btn-warning test_button_hover ${activeTestId === test.id || activeTestId === null ? 'active' : 'd-none'}`}
      style={{
                borderRadius: "0.75rem",
                border: "2px solid #333",
                background: "linear-gradient(180deg, #222, #333)",
                overflow: "hidden",
                height: '50px',
                width: '400px',
                marginBottom: '20px',
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
        {isEnglish ? 'Go back from ' : ''}
        {(test.name_ar && urlPath === "/ar/") ? test.name_ar : test.name}{!isEnglish ? 'から戻る!' : ''}
      </span>
    </button>
);

export const TestButtons = ({ test, activeCategory, activeTestId, toggleQuestionDetails, maxScores, isEnglish, audioRef, urlPath }) => {
   
  const currentMaxScore = maxScores.find(score => score.test === test.id);

  return (
    <button
      className={`btn btn-warning test_buttons test_button_hover ${activeCategory === test.category && activeTestId === null ? 'active' : 'd-none'}`}
      style={{
                borderRadius: "0.75rem",
                border: "2px solid #333",
                background: "linear-gradient(180deg, #222, #333)",
                overflow: "hidden",
      }}
      onClick={() => toggleQuestionDetails({
        testId: test.id,
        testDescription: test.description,
        testDescriptionSound: test.sound_url,
        numberOfQuestions: test.number_of_questions,
        testName: test.name,
        category: undefined,
        maxPossibleScore: test.total_score,
        multiplier: test.score_multiplier,
        currentMaxScore: currentMaxScore ? currentMaxScore.score : 0 
      })}
    >
      <span className="text-center text-white text_shadow" style={{ fontSize: '15px' }}>
        {(test.name_ar && urlPath === "/ar/") ? test.name_ar : test.name}
      </span>
      {test.picture_url && <img src={test.picture_url} alt="Question" width="170" height="170" style={{ border: '5px solid black', borderRadius: '0.5rem' }} />}
      <div>
        {currentMaxScore
          ? <h5 className="text-white">{isEnglish ? "High score: " : "最高記録："}{currentMaxScore.score}/{test.total_score}</h5>
          : <h5 className="text-white">{isEnglish ? "Still " : "まだ"}0/{test.total_score}</h5>
        }
      </div>
    </button>
  );
};
