export const initialGameState = {
    scoreCounter: 0,
    testScores: {},
    activeQuestionIndex: 0,
    shuffledKeys: [],
};

export const gameReducer = (state, action) => {
    switch (action.type) {
        case 'INCREMENT_SCORE':
            return {
                ...state,
                scoreCounter: state.scoreCounter + 1,
                testScores: {
                    ...state.testScores,
                    [action.payload.testId]: (state.testScores[action.payload.testId] || 0) + 1,
                },
            };
        case 'SET_ACTIVE_QUESTION_INDEX':
            return {
                ...state,
                activeQuestionIndex: action.payload,
            };
        case 'SET_SHUFFLED_KEYS':
            return {
                ...state,
                shuffledKeys: action.payload,
            };
        case 'RESET_GAME':
            return {
                ...initialGameState,
                shuffledKeys: state.shuffledKeys,
            };
        default:
            return state;
    }
};
