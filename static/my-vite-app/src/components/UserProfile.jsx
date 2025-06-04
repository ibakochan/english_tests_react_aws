import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { useUser } from "../context/UserContext";

const UserProfile = () => {
  const { currentUser, setCurrentUser, lvl, setLvl, petLevel, setPetLevel, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish } = useUser();
  const [activeMemories, setActiveMemories] = useState(false);
  const [activeSites, setActiveSites] = useState(false);
  const [activeEikenMemories, setActiveEikenMemories] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);


  const activeClassroom = userClassrooms?.find(classroom => classroom.id === activeClassroomId);
  const [characterVoice, setCharacterVoice] = useState(false);

  useEffect(() => {
    if (activeClassroom?.character_voice !== undefined) {
      setCharacterVoice(activeClassroom.character_voice);
    }
  }, [activeClassroom]);


  const toggleCharacterVoice = async () => {
    try {
      const csrfToken = cookies.csrftoken;
  
      const response = await axios.post(
        `/classrooms/${activeClassroomId}/toggle-character-voice/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'X-CSRFToken': csrfToken,
          },
        }
      );
      setCharacterVoice(prev => (!prev))
  
      const { character_voice } = response.data;
      console.log('Character voice is now:', character_voice);
  
    } catch (error) {
      console.error('Failed to toggle character voice:', error);
    }
  };

  const toggleMemories = () => {
    setActiveMemories(prev => !prev);
    if (activity === "memories") {
      setActivity("")  
    } else {
      setActivity("memories");
    }
  };

  const toggleEikenMemories = () => {
    setActiveEikenMemories(prev => !prev);
    if (activity === "memories") {
      setActivity("")  
    } else {
      setActivity("memories");
    }
  };

  const urlPath = window.urlPath

  return (
    <div className="flex-center-column">
    <div>
    {!activeMemories && !activeEikenMemories && (
        <figure style={{ margin: 0 }}>
        <h1 style={{ fontWeight: 'bold' }}>{currentUser?.username}</h1>
        <img
          src={currentUser ? currentUser.profile_asset?.[lvl]?.image : "https://storage.googleapis.com/profile_assets/a-crying.jpeg"}
          alt="Level Image"
          className="profile_pic"
          style={{ marginBottom: '20px' }}
          onClick={() => !characterVoice && document.getElementById('audio').play()}        
        />
        <img
          src={currentUser ? currentUser?.pets?.[petLevel]?.image : 'https://storage.googleapis.com/profile_pets/one_cell.png'}
          alt="Level Image"
          style={{ height: '150px', width: '150px', border: '5px solid black' }}
          onClick={() => !characterVoice && document.getElementById('pet_audio').play()}
        />
        {urlPath !== "/portfolio/" ? (
        <>
        <figcaption className="profile-text-style">
              {isEnglish ? 'you ' : '君は'}{isEnglish ? (currentUser ? currentUser?.profile_asset?.[lvl]?.english_text : "are a baby that can do nothing but cry") : (currentUser ? currentUser?.profile_asset?.[lvl]?.text: "泣くことしかできない生まれたての赤ちゃんです")}
        </figcaption>
        <figcaption className="profile-text-style">
              {isEnglish ? 'your pet is ' : '君のペットは'}{isEnglish ? (currentUser ? currentUser?.pets?.[petLevel]?.english_text : 'still only a one celled organism') : (currentUser ? currentUser?.pets?.[petLevel]?.text : 'まだ細胞一つしかない生物')}
        </figcaption>
        <figcaption className="profile-text-style">
                  <strong>
                    {isEnglish ? 'Total max scores=' : (
                      <>
                        <span>（</span>
                        <span style={{ color: '#e67e22' }}>文字、数字、</span>
                        <span style={{ color: '#2ecc71' }}>小、中</span>
                        <span>）最大記録トータル＝</span>
                      </>
                    )}
                    {currentUser ? currentUser?.total_max_scores : 0}    {isEnglish ? 'points untill growth=' : '成長まで＝'} {50 - (currentUser ? currentUser?.total_max_scores % 50 : 0)}{isEnglish ? 'points' : '点'}</strong>
        </figcaption>
        <figcaption className="profile-text-style">
                  <strong>
                    {isEnglish ? 'Total Eiken score=' : (
                      <>
                        <span>（</span>
                        <span style={{ color: '#e67e22' }}>文字、数字、</span>
                        <span style={{ color: '#3498db' }}>英検</span>
                        <span>）最大記録トータル＝</span>
                      </>
                    )}
                    {currentUser ? (currentUser?.total_eiken_score + currentUser.total_4eiken_score + currentUser?.total_numbers_score + currentUser.total_phonics_score) : 0}    {isEnglish ? 'points untill evolution=' : '進化まで＝'} {100 - (currentUser ? (currentUser?.total_eiken_score +  currentUser?.total_4eiken_score + currentUser?.total_numbers_score + currentUser?.total_phonics_score) % 100 : 0)}{isEnglish ? 'points' : '点'}</strong>
        </figcaption>
        {currentUser?.teacher &&
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button style={{ border: "5px solid black" }} className="btn btn-primary submit_buttons" onClick={toggleCharacterVoice}>
            {!characterVoice ? 'キャラ音声 (ON)' : 'キャラ音声 (OFF)'}
          </button>
        </div>
        }
        <audio id="audio" src={currentUser ? (isEnglish ? currentUser?.profile_asset?.[lvl]?.english_audio : currentUser?.profile_asset?.[lvl]?.audio) : "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_19_1.mp3"} />
        <audio id="pet_audio" src={currentUser ? currentUser?.pets?.[petLevel]?.audio : 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_25_1.mp3'} />
        </>
        ) : (
        <>
        <div style={{ marginBottom: '20px' }}>
          Here is your character and pet that evolves as you gather English test points
        </div>
        <button
        className="btn btn-primary shadow-lg transition-transform hover:scale-105"
        style={{
            marginBottom: "30px",
            height: '200px',
            width: '440px',
            border: '5px solid black',
            borderRadius: '20px',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            background: 'linear-gradient(to right, #ff6ec4, #7873f5)',
            color: 'white',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-8px)'
        }}
        onClick={() => {
          setActiveSites(prev=> !prev); 
        }}
        >
        {!activeSites ? "My portfolio" : "Return"}
        </button>
        {activeSites && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
        <div>
        <a 
          href="https://eibaru.jp" 
          target="_blank" 
          rel="noopener noreferrer"
          className="portfolio-button"
        >
          eibaru
        </a>
        <div>
        <a 
          href="https://github.com/ibakochan/english_tests_react_aws" 
          target="_blank" 
          rel="noopener noreferrer"
          className="portfolio-button"
        >
          github
        </a>
        </div>
          <ul>
            <li><strong>Currently used by multiple schools and hundreds of students</strong></li>
            <li><strong>Been working on it for 9 month. Now I would make all of this from scratch in less than 3months.</strong></li>
            <li><strong>Introduction of content is on this page</strong></li>
          </ul>
        </div>
        <div>
        <a 
          href="https://triforcesank.pythonanywhere.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="portfolio-button"
        >
          triforcesank
        </a>
        <div>
        <a 
          href="https://github.com/ibakochan/bjj/tree/master" 
          target="_blank" 
          rel="noopener noreferrer"
          className="portfolio-button"
        >
          github
        </a>
        </div>
          <ul style={{ marginTop: '0.5rem' }}>
            <li><strong>Currently in use by Triforce Kix</strong></li>
            <li><strong>Took me 3 months to make. Would take me a week now.</strong></li>
            <li style={{ marginTop: '4rem' }}><strong>Contents and functionality of this site:</strong></li>
            <li>Manage gym members information</li>
            <li>Take attendance by lesson</li>
            <li>Timestamps for participations</li>
            <li>Monthly participation records</li>
            <li>Create schedules within 2 separate schools</li>
            <li>Binary data picture uploads</li>

            <li style={{ marginTop: '4rem' }}><strong>My very first usable website, so unfortunately:</strong></li>
            <li>No React</li>
            <li>Very little JavaScript to avoid page refreshes</li>
            <li>Very little pagination and inefficient loops</li>
            <li>excessive backend hits</li>
            <li>No cloud uploads for pictures</li>
          </ul>
        </div>
        <div>
        <a 
          href="https://ymcawakayama.pythonanywhere.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="portfolio-button"
        >
          ymcawakayama
        </a>
        <div>
        <a 
          href="https://github.com/ibakochan/Japanese_schools/tree/master" 
          target="_blank" 
          rel="noopener noreferrer"
          className="portfolio-button"
        >
          github
        </a>
        </div>
          <ul>
            <li><strong>Currently not in use</strong></li>
            <li><strong>took me a month to make. would take me a week now.</strong></li>
            <li style={{ marginTop: '4rem' }}><strong>Contents and functionality of this site:</strong></li>
            <li>Manage students information</li>
            <li>Attendance by lesson and lesson category</li>
            <li>Timestamps for participations</li>
            <li>Create both schools and schedules</li>
            <li>Student grading and submitting of work</li>
            <li>Binary data picture uploads</li>
            <li>todo list dynamically updated with javascript</li>

            <li style={{ marginTop: '4rem' }}><strong>My second usable website, so unfortunately:</strong></li>
            <li>No react</li>
            <li>Only some javascript to avoid page refreshes</li>
            <li>very litte pagination and inefficient loops</li>
            <li>excessive backend hits</li>
            <li>no cloud uploads for pictures</li>
          </ul>
        </div>
        </div>
        )}
        </>
        )}
        </figure>
    )}
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
    {!activeEikenMemories && (
    <button
      onClick={() => toggleMemories()}
      className=".memory-button"
      style={{ height: !activeMemories ? '100px' : '50px', width: !activeMemories ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
    ><span className={`text-white ${activeMemories ? 'text_shadow' : ''}`}>{!activeMemories ? (isEnglish ? 'Memories' : '思い出を見る') : (isEnglish ? 'Go back' : '戻る！')}</span></button>
    )}
    {!activeMemories && (
    <button
      onClick={() => toggleEikenMemories()}
      className=".memory-button"
      style={{ height: !activeEikenMemories ? '100px' : '50px', width: !activeEikenMemories ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
    ><span className={`text-white ${activeEikenMemories ? 'text_shadow' : ''}`}>{!activeEikenMemories ? (isEnglish ? 'Pet memories' : 'ペットの思い出を見る') : (isEnglish ? 'Go back' : '戻る！')}</span></button>
    )}
    </div>
    {urlPath === "/portfolio/" &&
      <div style={{ marginTop: '20px' }}>Here we have a collection of all the stages your character and pet has grown</div>
    }
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    {activeMemories && (
      Object.keys(currentUser?.memories || {}).map((key) => (
        <span key={key}>
          <img
            src={currentUser?.memories[key].image}
            alt={`Level ${key} Image`}
            className="profile_pic"
            onClick={() => !characterVoice  && document.getElementById(`audio-${key}`).play()}
          />
          <audio id={`audio-${key}`} src={isEnglish ? currentUser?.memories[key].english_audio : currentUser?.memories[key].audio} />
        </span>
      ))
    )}
    {activeEikenMemories && (
      Object.keys(currentUser?.eiken_memories || {}).map((key) => (
        <span key={key}>
          <img
            src={currentUser?.eiken_memories[key].image}
            alt={`Level ${key} Image`}
            className="profile_pic"
            onClick={() => !characterVoice && document.getElementById(`audio-${key}`).play()}
          />
          <audio id={`audio-${key}`} src={isEnglish ? currentUser?.eiken_memories[key].audio : currentUser?.eiken_memories[key].audio} />
        </span>
      ))
    )}
    </div>
    </div>
  )
};
export default UserProfile;