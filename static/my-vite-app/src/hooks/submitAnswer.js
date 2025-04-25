export const useHandleSubmit = ({
    ws, sendData, timestamp, youAnsweredCorrect, setYouAnsweredCorrect, setCorrectWord, setCorrectSound, setCorrectPicture, setCorrectLabel, setCorrectEikenWord,
    setSelectedOption, setInputValue, setShowModal, setCorrectAnswerKey,
    setIsCorrect, setCurrentCorrectAudioIndex, currentCorrectAudioIndex, setCurrentWrongAudioIndex, currentWrongAudioIndex,
    setQuestions, activeFinals, isEnglish, volume,
    opponentA, correctOption, opponentAnsweredWrong,
    randomNumbers, randomWord, sound3, randomSound3, sound2, randomSound2, randomSound,
    randomEikenUrl, randomUrl, randomPicture, word2, randomWord2, randomLabel, randomCorrect,
    randomAlphabet, correctAudioUrls, correctEnglishAudioUrls,
    wrongAudioUrls, wrongEnglishAudioUrls, dispatchGame, gameState, setYouAnsweredWrong
  }) => {
  const handleSubmit = async ({e, questionId, question, optionId, testId}) => {
        e.preventDefault();
    
        setCorrectWord(randomNumbers ? randomNumbers : randomWord);
        setCorrectSound(sound3 ? randomSound3 : sound2 ? randomSound2 : randomSound !== null ? randomSound : randomEikenUrl !== 't' ? randomEikenUrl : randomUrl);
        setCorrectPicture(randomPicture);
        setCorrectLabel(word2 ? randomWord2 : randomLabel);
        setCorrectEikenWord(randomCorrect);
    
        setSelectedOption(null)
        setInputValue('');
    
        if (opponentA === "" || correctOption || opponentAnsweredWrong) {
          setShowModal(true);
        }
        setCorrectAnswerKey(randomAlphabet);
    
        let audioUrl, audioElement;
        if (correctOption) {
          dispatchGame({
            type: 'INCREMENT_SCORE',
            payload: { testId },
          });    
          const answered_wrong = false;

          if (opponentA !== "" && ws && ws.readyState === WebSocket.OPEN) {
            sendData({
              type: "answer_submit",
              target_username: opponentA,
              answered_wrong: answered_wrong,
            });
          };
          setIsCorrect(true);
          setCurrentWrongAudioIndex(0);
          audioUrl = currentCorrectAudioIndex >= 9
            ? (isEnglish ? correctEnglishAudioUrls[8] : correctAudioUrls[8])
            : (isEnglish ? correctEnglishAudioUrls[currentCorrectAudioIndex] : correctAudioUrls[currentCorrectAudioIndex]);
          audioElement = new Audio(audioUrl);
          setCurrentCorrectAudioIndex((prevIndex) => {
            const newIndex = (prevIndex + 1);
            return newIndex;
          });
        } else {
          setIsCorrect(false);
          setCurrentCorrectAudioIndex(0);
          audioUrl =  currentWrongAudioIndex >= 4
            ?  (isEnglish ? wrongEnglishAudioUrls[3] : wrongAudioUrls[3])
            :  (isEnglish ? wrongEnglishAudioUrls[currentWrongAudioIndex] : wrongAudioUrls[currentWrongAudioIndex]);
          audioElement = new Audio(audioUrl);
          setCurrentWrongAudioIndex((prevIndex) => {
            const newIndex = (prevIndex + 1);
            return newIndex;
          });
        }
    
        audioElement.volume = volume;
        if (opponentA === "") {
          audioElement.play();
        }    
        if (gameState.activeQuestionIndex === 4 && activeFinals) {
          setQuestions(null);
        };
  };
    
  
  
  return handleSubmit;
};  