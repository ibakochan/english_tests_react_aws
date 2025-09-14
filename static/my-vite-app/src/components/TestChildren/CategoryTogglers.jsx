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


  const getCategoryButton = (key, label, scoreKey, questionKey, picture) => (
    <button
      key={key}
      onClick={() => toggleCategories(key)}
      className={`btn btn-warning test_buttons test_button_hover ${activeCategory === null ? 'active' : 'd-none'}`}
      style={{ background: getBackgroundByCategory(key), borderRadius: "0.75rem", overflow: "hidden",}}
    >
      <span className="text-center text-white text_shadow" style={{ fontSize: '15px' }}>
        {label}
      </span>
      <img src={picture} alt="Question" width="170" height="170" style={{ border: '5px solid black', borderRadius: '0.5rem' }} />
      <h5 className="text-white">
        {isEnglish ? 'Total Score:' : 'トータル：'}
        {currentUser?.[scoreKey]}/{currentUser?.question_counts[questionKey]}
      </h5>
    </button>
  );

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
      {getCategoryButton('phonics', isEnglish ? 'Alphabet and phonics' : 'フォニックス', 'total_phonics_score', 'total_phonics_questions', "https://storage.googleapis.com/the-alphabet/%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89%20(1).jpeg")}
      {getCategoryButton('numbers', isEnglish ? 'Numbers/days/months' : '数字/曜日/月', 'total_numbers_score', 'total_numbers_questions', "https://storage.googleapis.com/english-numbers/1000.jpeg")}
      {getCategoryButton('eiken', isEnglish ? 'Eiken5' : '英検（えいけん）５級', 'total_eiken_score', 'total_eiken_questions', "https://storage.googleapis.com/eiken5_image/eiken5vocab.png")}
      {getCategoryButton('eiken4', isEnglish ? 'Eiken4' : '英検（えいけん）４級', 'total_4eiken_score', 'total_eiken4_questions', "https://storage.googleapis.com/eiken5_image/eiken4_wolf.png")}
      {getCategoryButton('eiken3', isEnglish ? 'Eiken3' : '英検（えいけん）３級', 'total_eiken3_score', 'total_eiken3_questions', "https://storage.googleapis.com/eiken5_image/eiken3panther_serious.png")}
      {getCategoryButton('eiken_pre2', isEnglish ? 'Eiken Pre2' : '英検（えいけん）準２級', 'total_eiken_pre2_score', 'total_eiken_pre2_questions', "https://storage.googleapis.com/eiken5_image/powerfullion.png")}
      {getCategoryButton('eiken2', isEnglish ? 'Eiken2' : '英検（えいけん）２級', 'total_eiken2_score', 'total_eiken2_questions', "https://storage.googleapis.com/eiken5_image/eiken2polarpower.png")}
      {getCategoryButton('english_5', isEnglish ? '5th grade English' : '（小）５年英語', 'total_english_5_score', 'total_english_5_questions', "https://storage.googleapis.com/grade5_lesson1/names.png")}
      {getCategoryButton('english_6', isEnglish ? '6th grade English' : '（小）６年英語', 'total_english_6_score', 'total_english_6_questions', "https://storage.googleapis.com/6-grade-countries/OIG2%20(2).jpeg")}
      {getCategoryButton('jr_1', isEnglish ? 'Junior High English 1' : '（中）１英語', 'total_jr_1_score', 'total_jr_1_questions', "https://storage.googleapis.com/jr_high_1/mamashmamasu.png")}
      {getCategoryButton('jr_2', isEnglish ? 'Junior High English 2' : '（中）2英語', 'total_jr_2_score', 'total_jr_2_questions', "https://storage.googleapis.com/stories_conversations/hiking.png")}
      {getCategoryButton('jr_3', isEnglish ? 'Junior High English 3' : '（中）3英語', 'total_jr_3_score', 'total_jr_3_questions', "https://storage.googleapis.com/stories_conversations/basketball.png")}
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