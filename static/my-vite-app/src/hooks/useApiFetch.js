import useFetch from "./useFetch";
import { shuffleArray, getRandomizedValues, getRandomizedOptions } from "../utils/TestHelpers";

export const useMaxScores = (currentUser, setMaxScores, setLoading, setError) => {
  const { fetchData } = useFetch('', 'GET', null, setLoading, setError);
  
  const fetchMaxScores = async () => {
      if (!currentUser || !currentUser.id) {
          console.error("currentUser is not available", currentUser);
          return;
      }
      const scores = await fetchData(`/api/maxscore/by-user/${currentUser.id}/`);
      setMaxScores(scores);
  };
  
  return fetchMaxScores;
};

export const useTestsByCategory = (setTests, setLoading, setError) => {
  const { fetchData } = useFetch('', 'GET', null, setLoading, setError);
  
  const fetchTestsByCategory = async (category) => {
    const data = await fetchData(`/api/name-id-tests/by-category/?category=${category}`);
    if (data) {
      setTests((prevTests) => ({
        ...prevTests,
        [`category_${category}`]: data,
      }));
    }
  };
  
  return fetchTestsByCategory;
};

export const useQuestionsByTest = (setQuestions, setLoading, setError) => {
  const { fetchData } = useFetch('', 'GET', null, setLoading, setError);
  
  const fetchQuestionsByTest = async (testId) => {
    const data = await fetchData(`/api/test-questions/one-question/${testId}/`);
    if (data) {
      setQuestions(data);
    }
  };
  
  return fetchQuestionsByTest;
};

export const useTestQuestionsAndOptions = (setQuestions, setTestQuestions, setTotalQuestions, setRandomizedOptions, setRandomizedValues, dispatchGame, setLoading, setError, activeCategory) => {
  const { fetchData } = useFetch('', 'GET', null, setLoading, setError);

  const fetchTestQuestionsAndOptions = async (testId, numberOfQuestions = 10, category) => {
    let apiUrl = category 
      ? `/api/test-questions/by-category/${category}/` 
      : `/api/test-questions/by-test/${testId}/`;

    const fetchedQuestions = await fetchData(apiUrl);
    if (!fetchedQuestions) return;

    let questions = fetchedQuestions.flatMap((question) =>
      Array(category ? Math.floor(question.number_of_questions / 5) : numberOfQuestions).fill(null).map((_, index) => ({
        ...question,
        duplicateId: `${question.id}-${index}`
      }))
    );

    if (category) {
      questions = questions.map(question => ({
        ...question,
        category: category,
      }));
    }

    const oneQuestion = questions.find(q => q.sound3) || questions[0];
    setQuestions(oneQuestion);

    if (oneQuestion && oneQuestion.question_list) {
      const keys = Object.keys(oneQuestion.question_list);
      const shuffled = shuffleArray([...keys]);
      dispatchGame({
        type: 'SET_SHUFFLED_KEYS',
        payload: shuffled,
      });
    }

    setTestQuestions(prevQuestions => ({
      ...prevQuestions,
      questions: [...(prevQuestions.questions || []), ...questions],
    }));

    const total = category
      ? questions.filter(q => q.category === activeCategory).length
      : questions.filter(q => q.test === testId && !q.category).length;

    setTotalQuestions(total);

    const randomizedValues = getRandomizedValues(questions);
    setRandomizedValues(randomizedValues);

    const randomizedOptions = getRandomizedOptions(questions, randomizedValues);
    setRandomizedOptions(randomizedOptions);
  };

  return fetchTestQuestionsAndOptions;
};
