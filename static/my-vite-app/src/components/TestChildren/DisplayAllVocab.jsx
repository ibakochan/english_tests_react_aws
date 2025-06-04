import React from "react";

const DisplayAllVocab = ({ questions }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {Object.keys(questions.question_list).map((key) => {
        const value = questions.question_list[key];

        return (
          <div key={key} style={{ margin: '10px', textAlign: 'center' }}>
            <div
              className={`${value.picture ? 'text-center' : ''} text-white`}
              style={
                !value.picture
                  ? {
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }
                  : {
                      background: 'rgba(0, 0, 0, 0.5)',
                      padding: '5px',
                      borderRadius: '5px',
                      justifyContent: 'center',
                      fontSize: '15px',
                      lineHeight: '1',
                    }
              }
            >
              {questions.display_all ? value.word : (value.label || value.word || key)}
            </div>
            {value.picture && (
              <img
                src={value.picture}
                alt={`Picture of ${value.word || key}`}
                width="100"
                height="100"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DisplayAllVocab;
