import React from "react";

export const formatTextAsHtml = (text) => {
  if (!text) return "";

  if (text.includes("B:")) {
    const parts = text.split("B:");
    return `<p>${parts[0]}</p><p>B:${parts[1]}</p>`;
  } else if (text.includes("。")) {
    const parts = text.split("。");
    return `<p>${parts[0]}。</p><p>${parts.slice(1).join("。")}</p>`;
  } else {
    return `<p>${text}</p>`;
  }
};



export const wrapTextSafe = (text, limit = 15) => {
  if (!text) return [];

  const lines = [];
  let i = 0;

  while (i < text.length) {
    let breakIndex = i + limit;
    while (breakIndex < text.length && text[breakIndex] !== ' ') {
      breakIndex++;
    }

    if (breakIndex >= text.length) {
      lines.push(text.slice(i).trim());
      break;
    }

    lines.push(text.slice(i, breakIndex).trim());
    i = breakIndex + 1;
  }

  return lines;
};



export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const getRandomizedValues = (questions) => {
    return questions.reduce((acc, question) => {
      const keys = Object.keys(question.question_list);
      const shuffledKeys = shuffleArray([...keys]);
  
      const unusedKeys = keys.filter(
        key => !Object.values(acc).some(item => item.randomAlphabet === key)
      );
  
      const randomKey = unusedKeys.length > 0
        ? unusedKeys[Math.floor(Math.random() * unusedKeys.length)]
        : keys[Math.floor(Math.random() * keys.length)];
  
      const randomValue = question.question_list[randomKey];
  
      let randomAlphabetSliced = null;
      if (question.first_letter) {
        randomAlphabetSliced = `_${randomKey.slice(1)}`;
      } else if (question.second_letter) {
        randomAlphabetSliced = `${randomKey[0]}_${randomKey.slice(2)}`;
      } else if (question.third_letter) {
        randomAlphabetSliced = `${randomKey.slice(0, 2)}_${randomKey.slice(3)}`;
      } else if (question.last_letter) {
        randomAlphabetSliced = `${randomKey.slice(0, randomKey.length - 1)}_`;
      }
  
      const isArray = Array.isArray(randomValue);
      const isArrayfour = isArray && randomValue.length >= 4;
      const isArrayfive = isArray && randomValue.length >= 5;
  
      acc[question.duplicateId] = {
        randomAlphabetSliced,
        randomAlphabet: randomKey || null,
        randomUrl: !isArray ? randomValue : null,
        randomTranslation: isArray ? randomValue[0] : null,
        randomEikenUrl: isArray ? randomValue[1] : null,
        randomWrongOne: isArrayfour ? randomValue[0] : null,
        randomWrongTwo: isArrayfour ? randomValue[1] : null,
        randomWrongThree: isArrayfour ? randomValue[2] : null,
        randomCorrect: isArrayfour ? randomValue[3] : null,
        randomFifth: isArrayfive ? randomValue[4] : null,
        randomNumbers: randomValue.numbers || null,
        randomWord: randomValue.word
          ? Array.isArray(randomValue.word)
            ? randomValue.word[0]
            : randomValue.word
          : randomValue.word || null,
        randomWord2: randomValue.word2 || null,
        randomJapanese: randomValue.japanese || null,
        randomPicture: randomValue.picture || null,
        randomSound: randomValue.sound || null,
        randomSound2: randomValue.sound2 || null,
        randomSound3: randomValue.sound3 || null,
        randomLabel: randomValue.label || null,
      };
  
      return acc;
    }, {});
};

export const getRandomizedOptions = (questions, randomizedValues) => {
  return questions.reduce((acc, question) => {
    const options = question.options;
    const shuffledOptions = shuffleArray([...options]);
    const optionKeys = Object.keys(question.question_list)
    const selectedKeys = new Set();

    const randomizedOptionsForQuestion = shuffledOptions.map((option) => {
      let randomOptionKey;
      do {
        randomOptionKey = optionKeys[Math.floor(Math.random() * optionKeys.length)];
      } while (randomOptionKey === randomizedValues[question.duplicateId].randomAlphabet || selectedKeys.has(randomOptionKey));

      selectedKeys.add(randomOptionKey);
      return { ...option, randomOptionKey };
    });

    acc[question.duplicateId] = randomizedOptionsForQuestion;
    return acc;
  }, {});
};

export const handlePlay = (audioUrl, button) => {
    if (button.disabled) return;
  
    button.disabled = true;
  
    const audio = new Audio(audioUrl);
    audio.play();
  
    audio.onended = () => {
      button.disabled = false;
    };
};  

export const useAutoPlay = (
  isPlayDisabled, setIsPlayDisabled, testQuestions, activeTestId, activeFinals, activeCategory, gameState,
  sound3, sound2, label, randomSound3, randomSound2, randomSound, randomUrl, audioRef,
  ) => {
  const handleAutoPlay = () => {
    if (isPlayDisabled || !testQuestions.questions.length) return;

    const activeQuestion = testQuestions.questions
      .filter(q => (q.test === activeTestId && !q.category) || (activeFinals && q.category === activeCategory))
      .sort((a, b) => (b.sound3 ? 1 : 0) - (a.sound3 ? 1 : 0))[gameState.activeQuestionIndex];

    if (!activeQuestion) return;

    let soundToPlay = null;

    if (sound3) {
      soundToPlay = randomSound3;
    } else if (sound2 || label) {
      soundToPlay = randomSound2;
    } else if (randomSound) {
      soundToPlay = randomSound;
    } else if (typeof randomUrl === 'string' && (randomUrl.includes('Record') || randomUrl.includes('mp3'))) {
      soundToPlay = randomUrl;
    }

    if (soundToPlay) {
      const audio = new Audio(soundToPlay);
      audioRef.current = audio;
      audio.play();

      setIsPlayDisabled(true);

      audio.onpause = () => {
        setIsPlayDisabled(false);
      };

      audio.onended = () => {
        setIsPlayDisabled(false); 
      };

      audio.onerror = () => {
        setIsPlayDisabled(false);
      };

      audio.play().catch(() => {
        setIsPlayDisabled(false);
      });
    }
  };

  return handleAutoPlay;
};

