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
  const { currentUser, setCurrentUser, activeTestId, setActiveTestId, lvl, setLvl, petLevel, setPetLevel, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish, student, teacher } = useUser();
  const [activeNakama, setActiveNakama] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);
  const [userNameInput, setUserNameInput] = useState('');
  const [input, setInput] = useState('');

  const handleUserNameSubmit = () => {
    setUserNameInput(input);
  };

  const urlPath = window.urlPath

  const activeClassroom = userClassrooms?.find(classroom => classroom.id === activeClassroomId);

  const [battlePermission, setBattlePermission] = useState(false);
  useEffect(() => {
    if (activeClassroom?.battle_permission !== undefined) {
      setBattlePermission(activeClassroom.battle_permission);
    }
  }, [activeClassroom]);

  const handleRoleSelection = async (role) => {
    try {
      const csrfToken = cookies.csrftoken;
    
      const response = await axios.post(
        '/choose-role/', 
        { role }, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'X-CSRFToken': csrfToken,
          },
        }
      );

      const data = response.data;

      setCurrentUser((prevUser) => ({
        ...prevUser,
        teacher: role === 'teacher' ? data.teacher : null,
        student: role === 'student' ? data.student : null,
      }));

      setUserNameInput('');
      setInput('');

      console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`);

    } catch (error) {
      console.error(`Failed to assign role ${role}:`, error);
    }
  };

  const toggleBattlePermission = async () => {
    try {
      const csrfToken = cookies.csrftoken;
  
      const response = await axios.post(
        `/classrooms/${activeClassroomId}/toggle-battle/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'X-CSRFToken': csrfToken,
          },
        }
      );
      setBattlePermission(prev => (!prev))
  
      const { battle_permission } = response.data;
      console.log('Battle permission is now:', battle_permission);
  
    } catch (error) {
      console.error('Failed to toggle battle permission:', error);
    }
  };

  const handlePracticeChange = (e) => {
    setIsPractice(e.target.checked);
  };

  const handleLanguageChange = (e) => {
    setIsEnglish(e.target.checked);
  };

  return (
        <div>
          <div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '80px' }}>
            {activeTestId === null &&
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPractice}
                    onChange={handlePracticeChange}
                    style={{
                      width: '70px',
                      height: '70px',
                      accentColor: '#3B82F6',
                      borderRadius: '20px',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.35)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                    }}
                  />
                  <span style={{ fontSize: '3rem', fontWeight: '900', color: '#FFFFFF' }}>
                    {isEnglish ? 'Practice' : '練習'}
                  </span>
                </label>
              </div>
            }

            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isEnglish}
                  onChange={handleLanguageChange}
                  style={{
                    width: '70px',
                    height: '70px',
                    accentColor: '#10B981',
                    borderRadius: '20px',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.35)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                  }}
                />
                <span style={{ fontSize: '3rem', fontWeight: '900', color: '#FFFFFF' }}>
                  {isEnglish ? '英語' : 'English'}
                </span>
              </label>
            </div>
          </div>
          {opponentA === "" && (!activeClassroom || activeClassroom?.battle_permission) &&
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: urlPath === "/portfolio/" ? '0' : '20px' }}>
            <input
                type="text"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                placeholder={isEnglish ? "Enter username" : "ユーザネーム入力"}
            />
            <button style={{ marginLeft: "10px", border: "5px solid black" }} className="btn btn-primary submit_buttons" onClick={() => {handleSendInvitation(); }}>{isEnglish ? "Invite to battle" : "バトルに誘う"}</button>
            </div>
            {userClassrooms?.length !== 0 &&
            <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button
                className="category_button"
                style={{ marginLeft: "10px", border: "5px solid black" }}
                onClick={() => {
                  setActiveNakama(prev=> !prev); 
                }}
              >
                {!activeNakama ? (isEnglish ? "Battle friends" : "仲間と戦う！") : (isEnglish ? "go back" : "戻る")}
            </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: urlPath === "/portfolio/" ? '0' : '20px' }}>
            {opponentA === "" && activeNakama &&
  (currentUser.teacher ? currentUser.teacher.classrooms : currentUser.student.classrooms)
                .filter(c => c.id === activeClassroomId)
                .flatMap(c => c.students)
                .filter(s => s.user.username !== currentUser.username)
                .map(s => {
                  const displayName = s.user.last_name?.trim() !== "" ? s.user.last_name : s.user.username;
                  return (
                    <button
                      key={s.user.username}
                      className={`btn btn-success category_button ${urlPath === "/portfolio/" ? "" : "mb-3"}`}
                      style={{ marginLeft: "10px", border: "5px solid black" }}
                      onClick={() => handleSendInvitation(s.user.username)}
                    >
                      {displayName}{s.student_number}
                    </button>
                 );
                })
            }
            </div>
            </>
            }
            <div>
              {isEnglish ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                You can only invite someone if they share a classroom with you and the classroom has battle permission on
                </div> 
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                  共通教室がある上に、その教室のバトル許可があればバトルできる
                </div>
              )
              }
            </div>
            {urlPath === "/portfolio/" && (
              isEnglish ? (
                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div>Here you can invite another user to a battle of who can answer fastest</div>
                  <div>The battle comes down to a millisecond to decide win, lose, or draw</div>
                  <div>You can invite them either by writing username and then click send</div>
                  <div>Or click on "Battle comrades!" button and click on an online users last name</div>
                  <div>Only online users that shares at least one classroom with you are displayed here</div>
                </div>
              ) : (
                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div>こちらは、他のユーザーを招待して早押し対戦ができる機能です。</div>
                  <div>対戦はミリ秒単位のスピードで勝敗が決まります。</div>
                  <div>ユーザー名を入力して「送信」ボタンを押すか、</div>
                  <div>「仲間と戦う！」ボタンを押して、オンラインで同じ教室にいるユーザーの名前を選んで招待できます。</div>
                  <div>表示されるのは、あなたと教室が少なくとも1つ共通しているオンラインユーザーのみです。</div>
                </div>
              )
            )}
          </div>
          }
          {opponentA !== "" &&
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button
              className="btn btn-danger mb-3 category_button"
              style={{ marginLeft: "10px", border: "5px solid black" }}
              onClick={() => {
                handleRunAway(opponentA); 
              }}
            >
              {opponentA}から逃げる
            </button>
            </div>
          }
          {teacher &&
          <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button style={{ border: "5px solid black" }} className="btn btn-primary submit_buttons" onClick={toggleBattlePermission}>
              {battlePermission ? 'バトル許可中 (ON)' : 'バトル未許可 (OFF)'}
            </button>
          </div>
          </>
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
          <div>
          <p style={{ color: 'white', marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
                {isEnglish
                  ? (teacher || student
                      ? "If you change, you'll be removed from any classroom you're in"
                      : "If you're a school teacher or student then choose teacher or student")
                  : (teacher || student
                      ? "変更すると今の教室からすべて抜けてしまいます"
                      : "学校の先生か生徒ならそれぞれ先生か生徒をえらんでください")
                }
          </p>
          {(student || teacher) &&
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isEnglish ? "Enter username" : "ユーザネーム入力"}
          />
          <button className="btn btn-success submit_buttons" style={{ marginLeft: "10px", border: "5px solid black" }} onClick={handleUserNameSubmit}>
            {isEnglish 
              ? (teacher ? 'Change to student' : student ? 'Change to teacher' : '') 
              : (teacher ? '生徒に変更' : student ? '先生に変更' : '')
            }
          </button>
          </div>
          }
          {((userNameInput === currentUser?.username) || (!student && !teacher)) &&
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            {!teacher &&
            <button className="btn btn-success submit_buttons" style={{ border: "5px solid black" }} onClick={() => handleRoleSelection('teacher')}>
              {isEnglish ? 'Become teacher' : '先生になる'}
            </button>
            }
            {!student &&
            <button className="btn btn-success submit_buttons" style={{ border: "5px solid black" }} onClick={() => handleRoleSelection('student')}>
              {isEnglish ? 'Become student' : '生徒になる'}
            </button>
            }
          </div>
          }
          </div>
        </div>
  );       
};
export default InvitationsAndSettings;