import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaPlay } from 'react-icons/fa';
import { ws, connect, disconnect, sendData, setConnectedUsersCallback, setInvitationCallback, setInvitationResponseCallback, setUserNotFoundCallback, setCategoryToggleCallback, setTestToggleCallback, setQuestionsDataCallback, setAnswerSubmitCallback } from '../websockets/websocketConnect';
import { useWebsocket } from "../context/WebsocketContext";


const TestModal = ({
  showModal,
  closeModal,
  currentCorrectAudioIndex,
  recordMessage,
  isCorrect,
  correctSound,
  handlePlay,
  isPlayDisabled,
  isEnglish,
  correctLabel,
  correctWord,
  correctEikenWord,
  correctAnswerKey,
  currentWrongAudioIndex,
  gameState,
  opponentA,
  countdown,
  battleModalPicture,
  battleModalText,
  battleFinishMessage,
  battleScore,
  opponentScore,
  timestamp,
  opponentATimestamp,
}) => (
  <Modal show={showModal} onHide={closeModal} centered backdrop={opponentA !== "" && battleFinishMessage === "" ? "static" : true} keyboard={opponentA !== ""}>
    <Modal.Header
      style={{
        backgroundImage:
          (opponentA !== "" || battleFinishMessage !== "") ? `url("${battleModalPicture}")`
          : currentCorrectAudioIndex >= 9 || recordMessage
            ? `url("https://storage.googleapis.com/ivar_reactions/WhatsApp画像%202024-02-14%2013.27.37_9343389c%20(3).jpg")`
            : currentCorrectAudioIndex === 1 || currentCorrectAudioIndex === 2 || currentCorrectAudioIndex === 3
            ? `url("https://storage.googleapis.com/ivar_reactions/openart-5eda95374c2140e3a6dad00334c41fef_raw%20(3).jpg")`
            : currentCorrectAudioIndex === 4
            ? `url("https://storage.googleapis.com/ivar_reactions/openart-12ba3e00450f41cc899c83c6a484c79f_raw%20(4).jpg")`
            : currentWrongAudioIndex
            ? `url("https://storage.googleapis.com/ivar_reactions/openart-6cf0de3a89b84f87983d9234bf1fa9d5_raw%20(2).jpg")`
            : `url("https://storage.googleapis.com/ivar_reactions/openart-42849cd925af4fdba5bc73bf93394019_raw%20(7).jpg")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '40vh'
      }}
    />
    <Modal.Body>
      {recordMessage ? (
        <div className="d-flex align-items-center justify-content-center">
          <h2 className="message">{recordMessage}</h2>
        </div>
      ) : battleFinishMessage !== "" ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div style={{ fontSize: '20px' }}>{battleFinishMessage}</div>
          {battleFinishMessage !== "" &&
          <>
            <div style={{ fontSize: '20px' }}>点数：{battleScore}</div>
            <div style={{ fontSize: '20px' }}>相手の点数:{opponentScore}</div>
          </>
          }
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center">
            {isCorrect === true ? (
              <>
                <span style={{ fontSize: '50px' }}>{isEnglish ? "Correct!" : "正解！"}</span>
                <span className="text-success" style={{ fontSize: '50px' }}>&#x2713;</span>
              </>
            ) : isCorrect === false ? (
              <div>
                <span style={{ fontSize: '50px' }}>{isEnglish ? "Naive!" : "あまい！"}</span>
                <span className="text-danger" style={{ fontSize: '50px' }}>&#x2717;</span>
                {correctSound && (
                  <p>
                    <button
                      className="play_buttons btn btn-success mb-3"
                      style={{ border: '5px solid black' }}
                      onClick={(e) => handlePlay(correctSound, e.target)}
                      disabled={isPlayDisabled}
                    >
                      {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                    </button>
                  </p>
                )}
                <h1>{isEnglish ? "Correct answer:" : "正解は："}{correctLabel ?? correctWord ?? correctEikenWord ?? correctAnswerKey}</h1>
              </div>
            ) : null}
          </div>
          <h1>{isEnglish ? "Correct streak: " : "連続正解："}{currentCorrectAudioIndex}</h1>
          {isCorrect && opponentA === "" && <h1>{isEnglish ? "Points: " : "点数："}{gameState.scoreCounter}</h1>}
          {opponentA !== "" && <h1>自分の点数：{battleScore}</h1>}
          {opponentA !== "" && <h1>相手の点数：{opponentScore}</h1>}
        </>
      )}
    </Modal.Body>
    <Modal.Footer className="d-flex justify-content-center">
      {opponentA === "" || battleFinishMessage !== "" ? (
        <Button variant="secondary" onClick={closeModal}>Next!</Button>
      ) : (
        <h3>ラウンド{gameState.activeQuestionIndex + 2}まで{countdown}</h3>
      )}
    </Modal.Footer>
  </Modal>
);

const ReturnConfirmModal = ({ modalIsOpen, closeReturnModal, handleBackClick }) => (
  <Modal show={modalIsOpen} onHide={closeReturnModal}>
    <Modal.Body>
      <p>まだテスト終わっていない。終わっていないまま戻ったら今までの点数しか記録されない。それでももどる？</p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={closeReturnModal}>いいえ</Button>
      <Button variant="primary" onClick={handleBackClick}>はい</Button>
    </Modal.Footer>
  </Modal>
);

const SignupPromptModal = ({ signupModal, closeSignupModal }) => (
  <Modal show={signupModal} onHide={closeSignupModal}>
    <Modal.Body>
      <h4>登録してないかログインしていない</h4>
      <div>
      <a href="https://eibaru.jp/accounts/signup/" className="btn btn-success mb-2" style={btnStyle} rel="noopener noreferrer">
        登録
      </a>
      </div>
      <div>
      <a href="https://eibaru.jp/accounts/login" className="btn btn-primary mb-2" style={btnStyle} rel="noopener noreferrer">
        ログイン
      </a>
      </div>
      <a
        href="/account/google/login/"
        className="btn btn-light d-flex align-items-center mt-3 justify-content-center"
        style={{
          border: '1px solid #dadce0',
          width: '200px',
          height: '40px',
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          style={{ width: '20px', height: '20px', marginRight: '10px' }}
        />
        <span>Googleでログイン</span>
      </a>
      <h5>ログインしたら点数記録できるよ</h5>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={closeSignupModal}>いいえ</Button>
    </Modal.Footer>
  </Modal>
);

const btnStyle = {
  width: '200px',
  border: '4px solid black',
  display: 'inline-block',
  padding: '6px 12px',
  textAlign: 'center',
  backgroundColor: '#007bff',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
};

const InvitationModal = () => {
  const {
    invitations,
    handleAcceptInvitation,
    handleDeclineInvitation,
    showInvitationModal,
    setShowInvitationModal,
    invitationModalPicture,
    setInvitationModalPicture,
    invitationMessage,
    setInvitationMessage,
    opponentA,
  } = useWebsocket();

  return (
    <Modal show={showInvitationModal} onHide={() => setShowInvitationModal(false)} backdrop keyboard centered>
      <Modal.Header
        style={{
          backgroundImage: `url("${invitationModalPicture}")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: '40vh'
        }}
      />
      <Modal.Body>
        <div className="d-flex align-items-center justify-content-center flex-column gap-3">
          {invitations.map(senderUsername => (
            <div key={senderUsername} className="text-center">
              <p>{senderUsername}がバトル招待を送ってきた</p>
              <button
                className="btn btn-success submit_buttons m-1"
                onClick={() => handleAcceptInvitation(senderUsername)}
              >
                戦う！
              </button>
              <button
                className="btn btn-danger submit_buttons m-1"
                onClick={() => handleDeclineInvitation(senderUsername)}
              >
                逃げる
              </button>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <h2>{invitationMessage}</h2>
        {opponentA !== "" &&
          <Button variant="secondary" onClick={() => setShowInvitationModal(false)}>Next!</Button>
        }
      </Modal.Footer>
    </Modal>
  );
};



export { TestModal, ReturnConfirmModal, SignupPromptModal, InvitationModal };

