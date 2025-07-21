import { shuffleArray, getRandomizedValues, getRandomizedOptions } from "../utils/TestHelpers";


export const useToggleQuestionDetails = ({
    testQuestions, setQuestions, setRandomizedValues, setRandomizedOptions,
    setActiveTestId, setActiveTestName, setActiveTestDescription, setActiveTestDescriptionSound,
    activeTestId, activeTestDescription, activeTestDescriptionSound, isPractice, activeFinals, activeCategory,
    fetchQuestionsByTest, fetchTestQuestionsAndOptions, setTotalQuestions, inviter, opponentA, setError, dispatchGame, setBattleScore, setOpponentScore, setMaximumScore, setScoreMultiplier, setActiveTestMaxScore,
  }) => {

    const toggleQuestionDetails = async ({testId, testDescription, testDescriptionSound, numberOfQuestions, testName, category, maxPossibleScore, multiplier, currentMaxScore}) => {
      dispatchGame({ type: "RESET_GAME" });
      setBattleScore(0);
      setOpponentScore(0);
  
      const filteredQuestions = testQuestions.questions.filter(
        (question) =>
          (question.test === testId && !question.category) ||
          (activeFinals && question.category === category)
      );
  
      const oneQuestion = filteredQuestions.find((q) => q.sound3) || filteredQuestions[0];
      setQuestions(oneQuestion);
  
      if (oneQuestion && oneQuestion.question_list) {
        const keys = Object.keys(oneQuestion.question_list);
        const shuffled = shuffleArray([...keys]);
        dispatchGame({
          type: "SET_SHUFFLED_KEYS",
          payload: shuffled,
        });
      }
  
      const randomizedValues = getRandomizedValues(testQuestions.questions);
      setRandomizedValues(randomizedValues);
  
      const randomizedOptions = getRandomizedOptions(testQuestions.questions, randomizedValues);
      setRandomizedOptions(randomizedOptions);
  
      if (isPractice) {
        if (activeTestDescription === testDescription && activeTestDescriptionSound === testDescriptionSound) {
          setActiveTestDescription("");
          setActiveTestDescriptionSound("");
        } else {
          setActiveTestDescription(testDescription);
          setActiveTestDescriptionSound(testDescriptionSound);
        }
      }
  
      if (activeTestId === testId) {
        setActiveTestId(null);
        setActiveTestName("");
      } else {
        try {
          setActiveTestId(testId);
          setActiveTestName(testName);
          setMaximumScore(maxPossibleScore);
          setScoreMultiplier(multiplier);
          setActiveTestMaxScore(currentMaxScore);
  
          if (isPractice) {
            await fetchQuestionsByTest(testId);
          } else {
            const questionArray = Object.values(testQuestions).flat();
  
            const testExists = questionArray.some((question) => question.test === testId && !question.category);
            const finalTestExists = questionArray.some((question) => question.category === category);
  
            if (inviter || opponentA === "") {
              if ((!testExists && !category) || (!finalTestExists && category)) {
                await fetchTestQuestionsAndOptions(testId, numberOfQuestions, category);
              } else if (category === activeCategory) {
                setTotalQuestions(testQuestions.questions.filter((question) => question.category === category).length);
              } else {
                setTotalQuestions(testQuestions.questions.filter((question) => question.test === testId && !question.category).length);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching test questions and options:", error);
          setError("Failed to fetch test questions and options.");
        }
      }
    };
  
    return toggleQuestionDetails;
  };

export const useToggleCategories = (
    inviter, ws, opponentA, activeCategory, setActiveCategory, setActivity,
    tests, fetchTestsByCategory, setError, maxScores, fetchMaxScores, sendData,
  ) => {
  const toggleCategories = async (category) => {
      if (inviter && ws && ws.readyState === WebSocket.OPEN) {
        sendData({
            type: "category_toggle",
            target_username: opponentA,
            category: category,
        });
      }
      
      if (activeCategory === category) {
        setActiveCategory(null);
        setActivity("");
      } else {
        try {
          setActiveCategory(category);
          setActivity("test");
          
          const testsArray = Object.values(tests).flat();
  
          const categoryExists = testsArray.some(test => test.category === category);
  
          if (!categoryExists && (inviter === true || opponentA === "")) {
              const fetchedTests = await fetchTestsByCategory(category);
          }
  
        } catch (error) {
          console.error('Error fetching tests by category:', error);
          setError('Failed to fetch tests by category.');
        }
        if (maxScores?.length === 0) {
          fetchMaxScores();
        };
      }
  };
  return toggleCategories;
}