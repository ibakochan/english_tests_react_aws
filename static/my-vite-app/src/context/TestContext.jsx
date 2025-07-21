import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const TestContext = createContext();

export function TestProvider({ children }) {
  const [maxScores, setMaxScores] = useState([]);
  const [tests, setTests] = useState([]);
  const [testQuestions, setTestQuestions] = useState({ questions: [] });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState(null);
  const [maximumScore, setMaximumScore] = useState(0);
  const [scoreMultiplier, setScoreMultiplier] = useState(0);
  const [activeTestMaxScore, setActiveTestMaxScore] = useState(0);

  return (
    <TestContext.Provider       
      value={{
        maxScores, setMaxScores, tests, setTests, testQuestions, setTestQuestions, totalQuestions, setTotalQuestions, questions, setQuestions, maximumScore, setMaximumScore, scoreMultiplier, setScoreMultiplier, activeTestMaxScore, setActiveTestMaxScore
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  return useContext(TestContext);
}