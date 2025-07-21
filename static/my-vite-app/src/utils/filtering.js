export const filterTests = (tests, maxScores, opponentA, opponentATests) => {
    return Object.values(tests)
      .flat()
      .sort((a, b) => a.lesson_number - b.lesson_number)
  };
  