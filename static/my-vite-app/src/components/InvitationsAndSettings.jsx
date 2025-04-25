import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { useUser } from "../context/UserContext";
import { useWebsocket } from "../context/WebsocketContext";
import { gameReducer, initialGameState } from "../context/GameReducer";
import useFetch from "../hooks/useFetch";
import { ws, connect, disconnect, sendData, setConnectedUsersCallback, setInvitationCallback, setInvitationResponseCallback, setUserNotFoundCallback, setCategoryToggleCallback, setTestToggleCallback, setQuestionsDataCallback, setAnswerSubmitCallback } from '../websockets/websocketConnect';


import { InvitationModal } from '../utils/TestModalHelpers';



const InvitationsAndSettings = () => {
  const { handleRunAway, connected, connectedUsers, invitations, targetUsername, setTargetUsername, inviter, handleAcceptInvitation, handleDeclineInvitation, handleSendInvitation, opponentA, volume, setVolume, isPractice, setIsPractice } = useWebsocket();
  const { currentUser, setCurrentUser, activeTestId, setActiveTestId, lvl, setLvl, petLevel, setPetLevel, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish } = useUser();
  const [activeNakama, setActiveNakama] = useState(false);

  const urlPath = window.urlPath


  const handlePracticeChange = (e) => {
    setIsPractice(e.target.checked);
  };

  const handleLanguageChange = (e) => {
    setIsEnglish(e.target.checked);
  };

  return (
        <div>
          <div>
          {opponentA === "" &&
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: urlPath === "/portfolio/" ? '0' : '20px' }}>
            <input
                type="text"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                placeholder="Enter username"
            />
            <button className="btn btn-primary submit_buttons" onClick={() => {handleSendInvitation(); }}>バトルに誘う</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button
                className={`btn btn-primary category_button mt-3 ${urlPath === "/portfolio/" ? "" : "mb-3"}`}
                onClick={() => {
                  setActiveNakama(prev=> !prev); 
                }}
              >
                {!activeNakama ? "仲間と戦う！" : "戻る"}
            </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: urlPath === "/portfolio/" ? '0' : '20px' }}>
            {opponentA === "" && activeNakama && connectedUsers.filter(username => username !== currentUser.username).map((username) => {
              let matchedStudent = null;

              for (const cls of (currentUser.teacher ? currentUser.teacher.classrooms : currentUser.student.classrooms)) {
                const student = cls.students.find(
                  (s) => s.user.username === username
                );
                if (student) {
                  matchedStudent = student;
                  break;
                }
              }

              if (!matchedStudent) return null;

              const displayName =
                matchedStudent.user.last_name?.trim() !== ""
                  ? matchedStudent.user.last_name
                  : matchedStudent.user.username;
              return (
              <button
                key={username}
                className={`btn btn-success category_button ${urlPath === "/portfolio/" ? "" : "mb-3"}`}
                onClick={() => {
                  handleSendInvitation(username); 
                }}
              >
                {displayName}
              </button>
              );
            })}
            {urlPath === "/portfolio/" &&
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div>Here you can invite another user to a battle of who can answer fastest</div>
                <div>The battle comes down to a milliesecond to decide win, lose, or draw</div>
                <div>You can invite them either by writing username and then click send</div>
                <div>Or click on "Battle comrades!" button and click on an online users last name</div>
                <div>Only online users that shares atleast on classroom with you are displayed here</div>
              </div>
            }
            </div>
          </div>
          }
          {opponentA !== "" &&
            <button
              className="btn btn-danger mb-3 category_button"
              onClick={() => {
                handleRunAway(opponentA); 
              }}
            >
              {opponentA}から逃げる
            </button>
          }
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <label htmlFor="volume-slider" style={{ fontSize: '20px' }}>
              {isEnglish ? "Adjust Ivar's reaction voice volume" : "イバルの反応の声音量調整"}
            </label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '200px' }}
            />
          </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          {activeTestId === null &&
          <div>
            <span className='size-20-20'>{isEnglish ? 'Practice' : '練習'}：</span>
            <input
              type="checkbox"
              className='size-20-20'
              checked={isPractice}
              onChange={handlePracticeChange}
            />
          </div>
          }
          <div>
            <span className='size-20-20'>{isEnglish ? '英語' : 'English'}：</span>
            <input
              type="checkbox"
              className='size-20-20'
              checked={isEnglish}
              onChange={handleLanguageChange}
            />
          </div>
          </div>
        </div>
  );       
};
export default InvitationsAndSettings;