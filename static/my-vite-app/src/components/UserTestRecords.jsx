import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Button, Form, Modal } from 'react-bootstrap';
import { useUser } from "../context/UserContext";
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { CategoryButtons, CategoryReturnButton } from "./TestChildren/CategoryTogglers";
import { FinalsButton, FinalsReturnButton, TestReturnButton, TestButtons } from './TestChildren/TestTogglers';


const UserTestRecords = () => {
  const { currentUser, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish } = useUser();
  const [activatedClassroomId, setActivatedClassroomId] = useState(null);
  const [activeUserManagement, setActiveUserManagement] = useState(null);
  const [activeRequests, setActiveRequests] = useState(false);
  const [classroomRequests, setClassroomRequests] = useState([]); 
  const [tests, setTests] = useState([]);
  const [users, setUsers] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);
  const [maxScores, setMaxScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeUserDeleteId, setActiveUserDeleteId] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);
  const [userDetailButtonActive, setUserDetailButtonActive] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState(null);


  const urlPath = window.urlPath



  const openModal = (userId) => {
    setActiveUserDeleteId(userId);
    setModalIsOpen(true);
  };

  const closeReturnModal = () => {
    setModalIsOpen(false);
    setActiveUserDeleteId(null);
  };

  const handleBackClick = () => {
    closeReturnModal();
    handleAccountRemove(activeUserDeleteId, activeClassroomId);
  };


  const resetStudentPassword = async (userId, newPassword) => {
    try {
      const csrfToken = cookies.csrftoken;
  
      const response = await axios.post(
        `/accounts/update/password/${userId}`,
        { password: newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
  
      alert('Password reset successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing the password.');
    }
  };
  

  const fetchClassroomRequests = async () => {
        try {
            const response = await axios.get(`/api/classroomrequest/by-classroom/${activeClassroomId}/`);
            setClassroomRequests(response.data);
        } catch (error) {
            console.error('Error fetching classroom requests:', error);
        }
  };

  const toggleAccept = async (requestId, unchangeable) => {
    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(`/classroom_accept/${requestId}/`, { unchangeable }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });
      const { status, success } = response.data;
      setAcceptMessage(status)
      setClassroomRequests(prevRequests =>
          prevRequests.map(request =>
              request.id === requestId ? { ...request, is_accepted: !request.is_accepted } : request
          )
      );

    } catch (error) {
      console.error('Error deleting submissions:', error);
      setError('失敗しました');
    }
  };

  const handleAccountRemove = async (userId, classroomId) => {
    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        `/remove/account/${userId}/`, { classroomId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'X-CSRFToken': csrfToken,
          },
        }
      );

      setUsers(prevUsers =>
          prevUsers.filter(user => user.id !== userId)
      );

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting the account.');
    }
  };



  const fetchTestsByCategory = async (category) => {
    try {
      const response = await axios.get(`/api/name-id-tests/by-category/?category=${category}`);
        setTests(prevTests => ({
          ...prevTests,
          [`category_${category}`]: response.data,
        }));
    } catch (error) {
      console.error(`Error fetching tests for category ${category}:`, error);
    }
  };

  const toggleCategories = async (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      try {
        setActiveCategory(category);
        await fetchTestsByCategory(category);
      } catch (error) {
        console.error('Error fetching tests by category:', error);
        setError('Failed to fetch tests by category.');
      }
    }
  };

  const fetchUsers = async (classroomId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const usersResponse = await axios.get(`/api/users/by-classroom/${classroomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const sortedUsers = usersResponse.data.sort((a, b) => {
        const numA = a.student?.student_number || '0000';
        const numB = b.student?.student_number || '0000';
        return numA.localeCompare(numB, undefined, { numeric: true });
      });

      console.log('Fetched users:', sortedUsers);
      setUsers(sortedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users.');
      setLoading(false);
    }
  };





  const toggleUserDetailsForUserDetailButton = async (classroomId) => {
    if (userDetailButtonActive) {
      setUserDetailButtonActive(null);
      setUsers([]);
      setActiveUserManagement()
      setActivity("")
    } else {
      setActiveUserManagement(classroomId);
      setActivity("user_records")
      setUserDetailButtonActive(classroomId);
      await fetchUsers(classroomId);
    }
  };


  const fetchMaxScores = async (testId) => {
    try {
      setError(null);
      const maxScoresResponse = await axios.get(`/api/maxscore/by-classroom_and_test/${testId}/`);
      console.log('Fetched sessions:', maxScoresResponse.data);
      return maxScoresResponse.data;
    } catch (error) {
      console.error('Error fetching maxScores:', error);
      setError('Failed to fetch maxScores.');
    }
  };


  const toggleClassroomDetails = async (classroomId) => {
    if (activatedClassroomId === classroomId) {
      setActivity("")
      setActivatedClassroomId(null);
      setTests([]);
      setUsers([]);
    } else {
      setActivity("user_records")
      setActivatedClassroomId(classroomId);
      await fetchUsers(classroomId);
    }
  };

  const toggleRequests = async () => {
    if (activeRequests) {
      setActiveRequests(false)
      setAcceptMessage(null)
      setActivity("")
      setClassroomRequests([])
    } else {
      setActivity("user_records")
      setActiveRequests(true)
      await fetchClassroomRequests();
    }
  };

  const toggleTestDetails = async (testId) => {
    if (activeTestId === testId) {
      setActiveTestId(null);
      setActiveUserId(null);
    } else {
      setActiveTestId(testId);
      setActiveUserId(null);
      try {
        const scores = await fetchMaxScores(testId);

        if (scores) {
          setMaxScores(scores);
        } else {
          console.error('No scores found for category:', category);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  const toggleUserDetails = async (userId) => {
    if (activeUserId === userId) {
      setActiveUserId(null);
    } else {
      setActiveUserId(userId);
    }
  };


  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const renderAudio = (question) => {
    if (question.question_sound) {
      return <audio controls src={question.question_sound} />;
    }
    return null;
  };



  return (
    <span>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
          <span>
            <span>
                <span>
                <span style={{ display: 'flex', justifyContent: 'center', marginBottom: urlPath === "/portfolio/" ? '0' : '20px' }}>
                {activity === "" &&
                <>
                <select
                  style={{ width: "150px", height: "30px" }}
                  className="form-select"
                  value={activeClassroomName}
                  placeholder={isEnglish ? "Currently no classrooms" : "教室まだない"}
                  onChange={(e) => {
                    const selectedClassroom = userClassrooms.find(c => c.name === e.target.value);
                    if (selectedClassroom) {
                      setActiveClassroomId(selectedClassroom.id);
                      setActiveClassroomName(selectedClassroom.name);
                    }
                  }}
                >
                  {userClassrooms.length === 0 ? (
                    <option value="" disabled selected>
                      {isEnglish ? "No classrooms" : "教室まだない"}
                    </option>
                  ) : (
                    userClassrooms.map(classroom => (
                      <option key={classroom.id} value={classroom.name}>
                        {classroom.name}
                      </option>
                    ))
                  )}
                </select>
                </>
                }
                {!activatedClassroomId && !activeUserManagement &&
                <button
                  style={{ position: 'relative', height: '50px', width: !activeRequests ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
                  className={`btn btn-warning ${activeRequests ? 'mb-5 mt-5' : 'mb-3'}`}
                  onClick={() => toggleRequests()}
                >
                  <span 
                    className="text-center text-white text_shadow">{activeRequests && <><FaArrowLeft style={{ marginRight: '10px' }} /></>}{!activeRequests ? (isEnglish ? 'Teacher requests' : '先生リクエスト') : (isEnglish ? 'Go back' : '戻る！')}
                  </span>
                </button>
                }
                {!activeUserManagement && !activeRequests && !activeCategory &&
                <button
                  style={{ height:'50px', width: !activatedClassroomId ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
                  className={`btn btn-dark ${activatedClassroomId ? 'mb-5 mt-5' : 'mb-3'} toggle-classroom-btn${activatedClassroomId === activeClassroomId ? ' active' : ''}`}
                  onClick={() => toggleClassroomDetails(activeClassroomId)}
                >
                  <span className="text-center text-white text_shadow">
                    {activatedClassroomId && <><FaArrowLeft style={{ marginRight: '10px' }} /></>}{!activatedClassroomId ? (isEnglish ? 'test records' : 'テスト記録') : (isEnglish ? 'Go back' : '戻る！')}
                  </span>
                </button>
                }
                {!activatedClassroomId && !activeRequests &&
                <button
                  style={{ height: '50px', width: !activeUserManagement ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
                  className={`btn btn-primary ${activeUserManagement ? 'mb-5 mt-5' : 'mb-3'}`}
                  onClick={() => toggleUserDetailsForUserDetailButton(activeClassroomId)}
                >
                  <span className="text-center text-white text_shadow">
                    {activeUserManagement && <><FaArrowLeft style={{ marginRight: '10px' }} /></>}{!activeUserManagement ? (isEnglish ? 'student management' : '生徒管理') : (isEnglish ? 'Go back' : '戻る！')}
                    </span>
                </button>
                }
                </span>
                </span>
                {currentUser?.teacher.classrooms.length > 0 &&
                <div>
                {acceptMessage && <h5 className="text-center mb-2">{acceptMessage}</h5>}
                {classroomRequests.map((request) => (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <button
                      className="btn btn-dark mb-3 category_button"
                      onClick={() => toggleAccept(request.id, false)}
                      key={request.id}>
                        {request.teacher.user.username}
                        {request.is_accepted ? (
                            <span className="text-success" style={{ fontSize: '50px' }}>&#x2713;</span>
                        ) : (
                            <span className="text-danger" style={{ fontSize: '50px' }}>&#x2717;</span>
                        )}
                    </button>
                    </div>
                ))}
                {userDetailButtonActive && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {users.map(user => (
                      <span key={user.id}>
                      <button
                        style={{ height: 'flex', width: '250px', padding: '10px', margin: '5px', border: '5px solid black' }}
                        className={`btn btn-success mb-3`}
                      >
                        <h5>{user.username} - {user.student.student_number}</h5>
                        <h5>{user.last_name}</h5>
                        <h5>最大記録トータル＝{user.total_max_scores}</h5>
                        <h5>英検トータル＝{user.total_eiken_score}</h5>
                      <button className={`btn btn-danger submit_buttons`} style={{ border: '5px solid black' }} onClick={() => openModal(user.id)}>
                        {isEnglish ? "Remove from classroom" : "教室から追い出す"}
                      </button>
                      <div style={{ marginTop: '10px' }}>
                        <input
                          type="password"
                          placeholder={isEnglish ? "New password" : "新しいパスワード"}
                          value={user.newPassword || ''}
                          onChange={(e) => {
                            const updatedUsers = users.map(u =>
                              u.id === user.id ? { ...u, newPassword: e.target.value } : u
                            );
                            setUsers(updatedUsers);
                          }}
                          className="form-control mb-2"
                        />
                        <button
                          className="btn btn-warning"
                          onClick={() => {
                            if (user.newPassword) {
                              resetStudentPassword(user.id, user.newPassword);
    
                              const updatedUsers = users.map(u =>
                                u.id === user.id ? { ...u, newPassword: '' } : u
                              );
                              setUsers(updatedUsers);
                            } else {
                              alert(isEnglish ? 'Please enter a password' : 'パスワードを入力してください');
                            }
                          }}
                        >
                          {isEnglish ? "Reset Password" : "パスワードをリセット"}
                        </button>
                      </div>
                      </button>
                      </span>
                    ))}
                  </div>
                )}
                {activatedClassroomId === activeClassroomId && (
                  <div className="classroom-details">
                  <div style={{ justifyContent: 'center' }}>
                    <CategoryButtons isEnglish={isEnglish} toggleCategories={toggleCategories} activeCategory={activeCategory} currentUser={currentUser} />
                    {!activeTestId &&
                      <CategoryReturnButton isEnglish={isEnglish} toggleCategories={toggleCategories} activeCategory={activeCategory} activeTestId={activeTestId} />
                    }
                  </div>
                    {Object.values(tests).flat().sort((a, b) => a.lesson_number - b.lesson_number).map(test => (
                      <span key={test.id}>
                        {activeTestId === null || activeTestId === test.id ? (
                        <span>
                        <button
                          className={`btn btn-warning test_buttons test_button_hover ${activeCategory === test.category && activeTestId === null ? 'active' : 'd-none'}`}
                          onClick={() => toggleTestDetails(test.id)}
                        >
                          <span
                            className="text-center text-white text_shadow"
                          >
                            {test.name}
                          </span>
                          {test.picture_url && (
                            <img src={test.picture_url} alt="Question" width="170" height="170" />
                          )}
                        </button>
                        </span>
                        ) : null}
                        {activeTestId !== null &&
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          translate="no"
                          className={`btn btn-warning test_button_hover ${activeTestId === test.id || activeTestId === null ? 'active' : 'd-none'}`}
                          style={{ height: '50px', width: '400px', border: '5px solid black', marginBottom: '20px' }}
                          onClick={() => {
                            setActiveTestId(null);  
                          }}
                        >
                          <span className="text-center text-white text_shadow">
                            <FaArrowLeft style={{ marginRight: '10px' }} />
                            {isEnglish ? 'Go back from ' : ''}
                            {test.name}{!isEnglish ? 'から戻る!' : ''}
                          </span>
                        </button>
                        </div>
                        }
                        {activeTestId === test.id && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {users.map(user => (
                              <span key={user.id}>
                                {activeUserId === null || activeUserId === user.id ? (
                                <button
                                  className={`btn btn-success mb-3 toggle-user-btn${activeUserId === user.id ? ' active' : ''}`}
                                  style={{ height: '150px', width: '250px', padding: '10px', margin: '5px', border: '5px solid black' }}
                                  onClick={() => toggleUserDetails(user.id)}
                                >
                                  <h5>{user.username}</h5>
                                  <h5>出席番号: {user.student.student_number}</h5>
                                  {maxScores.map(score =>
                                    score.user === user.id && (
                                      <h5>最大記録：{score.score}/{score.total_questions}</h5>
                                    )
                                  )}
                                </button>
                                ) : null}
                              </span>
                            ))}
                          </div>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                </div>
                }
                {urlPath === "/portfolio/" &&
                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                {isEnglish ? (
                  <>
                    <div>This section is only available to teachers</div>
                    <div>You can manage students in your active classroom</div>
                    <div>You can check their test scores</div>
                    <div>You can remove them from your active classroom</div>
                    <div>You can accept teacher requests to join your active classroom</div>
                  </>
                ) : (
                  <>
                    <div>このセクションは教師のみ利用できます</div>
                    <div>選択した教室の生徒を管理できます</div>
                    <div>生徒らのテスト結果を確認できます</div>
                    <div>選択した教室から生徒を除けます</div>
                    <div>選択した教室に他の教師入室依頼を承認できます</div>
                  </>
                )}
                </div>
                }
            </span>
          </span>
      <Modal show={modalIsOpen} onHide={closeReturnModal}>
        <Modal.Body>
          <p>{isEnglish ? "Are you sure you want to remove this student from the classroom?" : "この生徒を本当に教室から追い出すんですか？"}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeReturnModal}>{isEnglish ? "No" : "いいえ"}</Button>
          <Button variant="primary" onClick={handleBackClick}>{isEnglish ? "Yes" : "はい"}</Button>
        </Modal.Footer>
      </Modal>
    </span>
  );
};

export default UserTestRecords;