import React from "react";
import { FaPlay, FaArrowLeft } from 'react-icons/fa';

export const CategoryButtons = ({ isEnglish, toggleCategories, activeCategory, currentUser }) => {
  
  const getBackgroundByCategory = (key) => {
    const green = 'linear-gradient(180deg, #2ecc71, #27ae60)';
    const blue = 'linear-gradient(180deg, #3498db, #2980b9)';
    const orange = 'linear-gradient(180deg, #f39c12, #e67e22)';

    if (['english_5', 'english_6', 'jr_1'].includes(key)) return green;
    if (['eiken', 'eiken4', 'eiken3', 'eiken_pre2', 'eiken2'].includes(key)) return blue;
    if (['phonics', 'numbers'].includes(key)) return orange;

    return green;
  };


  const getCategoryButton = (key, label, scoreKey, questionKey) => (
    <button
      key={key}
      onClick={() => toggleCategories(key)}
      className={`category_button ${activeCategory === null ? 'active' : 'd-none'}`}
      style={{ background: getBackgroundByCategory(key) }}
    >
      {label}
      <h5 className="text-white">
        {isEnglish ? 'Total Score:' : 'トータル：'}
        {currentUser?.[scoreKey]}/{currentUser?.question_counts[questionKey]}
      </h5>
    </button>
  );

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
      {getCategoryButton('phonics', isEnglish ? 'Alphabet and phonics' : 'アルファベットとフォニックス', 'total_phonics_score', 'total_phonics_questions')}
      {getCategoryButton('numbers', isEnglish ? 'Numbers/days/months' : '数字/曜日/月', 'total_numbers_score', 'total_numbers_questions')}
      {getCategoryButton('eiken', isEnglish ? 'Eiken5' : '英検（えいけん）５級', 'total_eiken_score', 'total_eiken_questions')}
      {getCategoryButton('eiken4', isEnglish ? 'Eiken4' : '英検（えいけん）４級', 'total_4eiken_score', 'total_eiken4_questions')}
      {getCategoryButton('eiken3', isEnglish ? 'Eiken3' : '英検（えいけん）３級', 'total_eiken3_score', 'total_eiken3_questions')}
      {getCategoryButton('eiken_pre2', isEnglish ? 'Eiken Pre2' : '英検（えいけん）準２級', 'total_eiken_pre2_score', 'total_eiken_pre2_questions')}
      {getCategoryButton('english_5', isEnglish ? '5th grade English' : '（小）５年英語', 'total_english_5_score', 'total_english_5_questions')}
      {getCategoryButton('english_6', isEnglish ? '6th grade English' : '（小）６年英語', 'total_english_6_score', 'total_english_6_questions')}
      {getCategoryButton('jr_1', isEnglish ? 'Junior High English 1' : '（中）１英語', 'total_jr_1_score', 'total_jr_1_questions')}
    </div>
  );
};

export const CategoryReturnButton = ({ isEnglish, toggleCategories, activeCategory, activeTestId }) => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
      <button
        className={`btn btn-success mb-3 ${activeCategory !== null && (activeTestId === null || activeTestId === undefined) ? 'active' : 'd-none'}`}
        style={{ height: '50px', width: '290px', padding: '10px', border: '5px solid black', position: 'relative', marginBottom: '10px' }}
        onClick={() => toggleCategories(activeCategory)}
      >
        <span className="text-center text-white text_shadow">
          <FaArrowLeft style={{ marginRight: '10px' }} /> {isEnglish ? 'Go back!' : '戻る！'}
        </span>
      </button>
      </div>
    );
};