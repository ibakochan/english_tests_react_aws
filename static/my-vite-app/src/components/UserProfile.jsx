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
                    {currentUser ? currentUser?.total_max_scores : 0}    {isEnglish ? 'points untill growth=' : '自分成長まで＝'} {50 - (currentUser ? currentUser?.total_max_scores % 50 : 0)}{isEnglish ? 'points' : '点'}</strong>
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
                    {currentUser ? (currentUser?.total_eiken_score + currentUser.total_4eiken_score + currentUser.total_eiken3_score + currentUser.total_eiken_pre2_score + currentUser.total_eiken2_score +  currentUser?.total_numbers_score + currentUser.total_phonics_score) : 0}    {isEnglish ? 'points untill evolution=' : 'ペット進化まで＝'} {100 - (currentUser ? (currentUser?.total_eiken_score +  currentUser?.total_4eiken_score + currentUser?.total_numbers_score + currentUser?.total_phonics_score) % 100 : 0)}{isEnglish ? 'points' : '点'}</strong>
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
          {isEnglish
            ? 'Here is your character and pet that evolves as you gather English test points'
            : 'ここは英語のテストポイントを集めることで成長や進化するキャラクターとペットです'
          }
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
            {isEnglish ? (
              <>
                <li><strong>Currently used by multiple schools and hundreds of students</strong></li>
                <li><strong>I have been working on and off on this website tweaking and adding English test content for a year. A site with similar level of function and code would take me maybe 500 hours to make today.</strong></li>
                <li><strong>Introduction of content is on this page</strong></li>
              </>
            ) : (
              <>
                <li><strong>現在、複数の学校で利用されており、数百人の生徒が実際に使用しています。</strong></li>
                <li><strong>この英語テストサイトは、1年ほどかけて断続的に改良やコンテンツ追加を行ってきました。同じレベルの機能とコードを持つサイトを、現在のスキルで新たに制作するにはおよそ500時間かかる見込みです。</strong></li>
                <li><strong>コンテンツの紹介もこのページ内に記載しています。</strong></li>
              </>
            )}
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
            {isEnglish ? (
              <>
                <li><strong>Currently in use by Triforce Kix</strong></li>
                <li><strong>I can make something of similar level within 40 hours. If you want to add react to make it smoother but still similar level of functionality then maybe 80 hours.</strong></li>

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
              </>
            ) : (
              <>
                <li><strong>現在、Triforce Kix（柔術道場）で実際に利用されています。</strong></li>
                <li><strong>同程度の機能のサイトなら約40時間で制作可能です。Reactを使って操作性を向上させつつ、同じレベルの機能を実装する場合は、約80時間かかります。</strong></li>
            
                <li style={{ marginTop: '4rem' }}><strong>このサイトの主な機能:</strong></li>
                <li>ジム会員情報の管理</li>
                <li>レッスンごとの出席管理</li>
                <li>参加記録のタイムスタンプ取得</li>
                <li>月ごとの参加履歴の確認</li>
                <li>2つの異なるスクールごとのスケジュール作成</li>
                <li>バイナリ形式での写真アップロード機能</li>
            
                <li style={{ marginTop: '4rem' }}><strong>初めて作った実用的なWebサイトだったため、以下の点が未熟でした:</strong></li>
                <li>React未使用</li>
                <li>ページリロードを避けるためのJavaScriptは最小限</li>
                <li>Paginationがほとんどなく、ループ処理が非効率</li>
                <li>バックエンドへのアクセスが多すぎる</li>
                <li>画像のクラウドアップロード未対応</li>
              </>
            )}
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
            {isEnglish ? (
              <>
                <li><strong>Currently not in use</strong></li>
                <li><strong>I can make something of similar level within 40 hours. If you want to add react to make it smoother but still similar level of functionality then maybe 80 hours.</strong></li>

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
                <li>very little pagination and inefficient loops</li>
                <li>excessive backend hits</li>
                <li>no cloud uploads for pictures</li>
              </>
            ) : (
              <>
                <li><strong>現在は使用されていません</strong></li>
                <li><strong>同程度の機能のサイトなら約40時間で制作可能です。Reactを使って操作性を向上させつつ、同じレベルの機能を実装する場合は、約80時間かかります。。</strong></li>

                <li style={{ marginTop: '4rem' }}><strong>このサイトの主な機能:</strong></li>
                <li>生徒情報の管理</li>
                <li>レッスンおよびカテゴリ別の出席管理</li>
                <li>参加記録のタイムスタンプ取得</li>
                <li>学校とスケジュールの作成</li>
                <li>成績管理および課題提出機能</li>
                <li>バイナリ形式での写真アップロード</li>
                <li>JavaScriptによる動的なToDoリスト更新</li>

                <li style={{ marginTop: '4rem' }}><strong>2作目の実用的なサイトだったため、以下の点が未熟でした:</strong></li>
                <li>React未使用</li>
                <li>ページリロードを避けるためのJavaScriptは一部だけ使用</li>
                <li>paginationがほとんどなく、ループが非効率</li>
                <li>バックエンドへのリクエストが過剰</li>
                <li>画像のクラウドアップロード未対応</li>
              </>
            )}
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
      <div style={{ marginTop: '20px' }}>
        {isEnglish
          ? 'Here we have a collection of all the stages your character and pet has grown'
          : 'ここは自分のキャラクターとペットの今までの成長や進化過程を確認できます'
        }
      </div>
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