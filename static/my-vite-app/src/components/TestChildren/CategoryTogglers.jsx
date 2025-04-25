import React from "react";
import { FaPlay, FaArrowLeft } from 'react-icons/fa';

export const CategoryButtons = ({ isEnglish, toggleCategories, activeCategory, currentUser }) => {
  
  const getCategoryButton = (key, label, scoreKey, questionKey) => (
    <button
      key={key}
      onClick={() => toggleCategories(key)}
      className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
    >
      {label}
      <h5 className="text-white">
        {isEnglish ? 'Total Score:' : 'トータル：'}
        {currentUser?.[scoreKey]}/{currentUser?.question_counts[questionKey]}
      </h5>
    </button>
  );

  return (
    <>
      {getCategoryButton('english_5', isEnglish ? '5th grade English' : '５年英語', 'total_english_5_score', 'total_english_5_questions')}
      {getCategoryButton('english_6', isEnglish ? '6th grade English' : '６年英語', 'total_english_6_score', 'total_english_6_questions')}
      {getCategoryButton('phonics', isEnglish ? 'Alphabet and phonics' : 'アルファベットとフォニックス', 'total_phonics_score', 'total_phonics_questions')}
      {getCategoryButton('numbers', isEnglish ? 'Numbers/days/months' : '数字/曜日/月', 'total_numbers_score', 'total_numbers_questions')}
      {getCategoryButton('eiken', isEnglish ? 'Eiken' : '英検', 'total_eiken_score', 'total_eiken_questions')}
    </>
  );
};

export const CategoryReturnButton = ({ isEnglish, toggleCategories, activeCategory, activeTestId }) => {
    return (
      <button
        className={`btn btn-success mb-3 ${activeCategory !== null && (activeTestId === null || activeTestId === undefined) ? 'active' : 'd-none'}`}
        style={{ height: '50px', width: '290px', padding: '10px', border: '5px solid black', position: 'relative', marginBottom: '10px' }}
        onClick={() => toggleCategories(activeCategory)}
      >
        <span className="text-center text-white text_shadow">
          <FaArrowLeft style={{ marginRight: '10px' }} /> {isEnglish ? 'Go back!' : '戻る！'}
        </span>
      </button>
    );
};