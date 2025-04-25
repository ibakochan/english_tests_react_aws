import React from "react";

const Practice = ({ questions, handlePlay, isPlayDisabled, activeTestDescription, activeTestDescriptionSound }) => (
  <>
    <div>
      {activeTestDescription.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}<br />
        </React.Fragment>
      ))}
      {activeTestDescriptionSound ? (
        <audio controls>
          <source src={activeTestDescriptionSound} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      ) : null}
    </div>

    <div key={questions.id} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {(() => {
        const keys = Object.keys(questions.question_list);

        return keys.map((key) => {
          const value = questions.question_list[key];

          return (
            <div key={key} style={value.picture ? { margin: '10px' } : { flex: '1 1 50%', padding: '10px' }}>
              <button
                className="btn btn-info"
                style={{ height: value.picture ? '170px' : '70px', width: value.picture ? '170px' : 'auto', padding: '10px', border: '5px solid black', position: 'relative', backgroundColor: 'lightblue' }}
                onClick={(e) => handlePlay(value[1] !== 't' && value[1] !== undefined ? value[1] : questions.sound3 ? value.sound3 : questions.sound2 ? value.sound2 : value.sound ? value.sound : value, e.target)}
                disabled={isPlayDisabled}
              >
                {((value.picture && value.word) || (!value.picture && !value.word)) && (
                  <span className={`${value.picture ? 'text-center text-with-picture' : 'text-without-picture'} text-white`}>
                    {value.numbers ? value.numbers : value.label ? value.label : value.word ? value.word : key}{value[0] !== undefined && value[0] !== 'h' ? ` = ${value[0]}` : ""}
                  </span>
                )}
                {!value.picture && value.word && (
                  <span className={`${value.picture ? 'text-center text-with-picture' : 'text-without-picture'} text-white`}>
                    {value.numbers ? value.numbers : ''}{value.word}
                  </span>
                )}
                {value.picture ? <img src={value.picture} alt={`Picture of ${value.word || key}`} width="120" height="120" /> : null}
              </button>
            </div>
          );
        });
      })()}
    </div>
  </>
);

export default Practice;