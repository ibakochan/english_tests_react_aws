export const filterTests = (tests, maxScores, opponentA, opponentATests) => {
    return Object.values(tests)
      .flat()
      .sort((a, b) => a.lesson_number - b.lesson_number)
      .filter((test) => {
        const isNonEikenCategory = !['eiken', 'eiken4', 'eiken3'].includes(test.category);
        const isLesson1 = test.lesson_number === 1;
        const isEikenWithLesson21 = test.category === 'eiken' && test.lesson_number === 21;
        const isEiken4WithLesson17 = test.category === 'eiken4' && test.lesson_number === 17;
        if ((isNonEikenCategory || isLesson1 || isEikenWithLesson21 || isEiken4WithLesson17) && opponentA === "") {
          return true;
        }

        if (opponentA !== "") {
          const testScore = maxScores.find(maxScore => (maxScore.test === test.id))
          const opponentHasTest = opponentATests.some(t => t.id === test.id);
          if (opponentHasTest && testScore && testScore.score / test.total_score >= 0.7) {
            return true;
          }
        }
    
        const previousTest = Object.values(tests)
          .flat()
          .find(t => (t.category === "eiken" || t.category === "eiken4" || t.category === "eiken3") && t.lesson_number === test.lesson_number - 1);
    
        if (!previousTest) {
          return false;
        }
    
        const previousMaxScore = maxScores.find(maxScore => maxScore.test === previousTest.id);
    
        if (!previousMaxScore) {
          return false;
        }
        if (opponentA === "") {
          return previousMaxScore.score / previousTest.total_score >= 0.7;
        }    
      });
  };
  