import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { useUser } from "../context/UserContext";

const Classrooms = () => {
  const { currentUser, setCurrentUser, lvl, setLvl, petLevel, setPetLevel, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish } = useUser();
  const [joinedClassroomName, setJoinedClassroomName] = useState("");
  const [createdClassroomName, setCreatedClassroomName] = useState("");
  const [message, setMessage] = useState("");
  const [leaveModal, setLeaveModal] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);

  const urlPath = window.urlPath

  const openLeaveModal = () => {
    setLeaveModal(true);
  };

  const closeLeaveModal = () => {
    setLeaveModal(false);
  };

  const handleLeave = () => {
    closeLeaveModal();
    handleLeaveClassroom(currentUser.id, activeClassroomId);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();

    if (currentUser?.student?.classrooms.some(c => c.name === joinedClassroomName) || currentUser?.teacher?.classrooms.some(c => c.name === joinedClassroomName)) {
      alert("この教室はすでに入っている！");
      return;
    }

    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        "/join_classroom/",
        { classroom_name: joinedClassroomName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "X-CSRFToken": csrfToken
          },
        }
      );
      if (response.data.status === "success") {
        const newClassroom = response.data.classroom;
        setCurrentUser((prevUser) => {
          if (!prevUser) return prevUser;
          const updatedUser = { ...prevUser };
  
          if (updatedUser.student) {
            updatedUser.student = { 
              ...updatedUser.student, 
              classrooms: [...updatedUser.student.classrooms, newClassroom]
            };
          } else if (updatedUser.teacher) {
            updatedUser.teacher = { 
              ...updatedUser.teacher, 
              classrooms: [...updatedUser.teacher.classrooms, newClassroom]
            };
          }

          setActiveClassroomId(newClassroom.id);
          setActiveClassroomName(newClassroom.name);
  
          return updatedUser;
        });
      }
      setMessage({ type: response.data.status, text: response.data.message });
      setJoinedClassroomName("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred.",
      });
    }
  };

  const handleClassroomCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        "/classroom/create/",
        { classroom_name: createdClassroomName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "X-CSRFToken": csrfToken
          },
        }
      );
      if (response.data.status === "success") {
        const newClassroom = response.data.classroom;
        setCurrentUser((prevUser) => {
          if (!prevUser) return prevUser;
          const updatedUser = { ...prevUser };
      
          updatedUser.teacher = { 
            ...updatedUser.teacher, 
            classrooms: [...updatedUser.teacher.classrooms, newClassroom]
          };
      
          return updatedUser;
        });
      }    

      setMessage({ type: response.data.status, text: response.data.message });
      setCreatedClassroomName("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred.",
      });
    }
  };


  const handleLeaveClassroom = async (userId, classroomId) => {
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
      setCurrentUser((prevUser) => {
        if (!prevUser) return prevUser;
  
        const updatedUser = { ...prevUser };
  
        if (updatedUser.student) {
          const classrooms = updatedUser.student.classrooms.filter(c => c.id !== activeClassroomId);
  
          updatedUser.student = { 
            ...updatedUser.student, 
            classrooms
          };
        
          if (classrooms.length > 0) {
            setActiveClassroomId(classrooms[0].id);
            setActiveClassroomName(classrooms[0].name);
          } else {
            setActiveClassroomId(null);
            setActiveClassroomName("");
          }
        } else if (updatedUser.teacher) {
          const classrooms = updatedUser.teacher.classrooms.filter(c => c.id !== activeClassroomId);

          updatedUser.teacher = { 
            ...updatedUser.teacher, 
            classrooms 
          };
        
          if (classrooms.length > 0) {
            setActiveClassroomId(classrooms[0].id);
            setActiveClassroomName(classrooms[0].name);
          } else {
            setActiveClassroomId(null);
            setActiveClassroomName("");
          }
        }
  
        return updatedUser;
      });

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting the account.');
    }
  };

  return (
    <div>
      {message && (
        <div className="message" style={{color: message.type === "success" ? "#32CD32" : "#FF4500"}}>
          {message.text}
        </div>
      )}
      {(currentUser?.teacher || urlPath === '/portfolio/') && (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <form onSubmit={handleClassroomCreateSubmit}>
          <input
            type="text"
            placeholder={isEnglish ? "Enter classroom name" : "教室名入力して"}
            value={createdClassroomName}
            onChange={(e) => setCreatedClassroomName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary submit_buttons"
            style={{ marginLeft: "10px", border: "5px solid black" }}
          >
            {isEnglish ? "Create classroom" : "教室を作る"}
          </button>
        </form>
      </div>
      )}
      <div style={{ display: "flex", justifyContent: "center" }}>
      <form onSubmit={handleJoinSubmit}>
        <input
          type="text"
          placeholder={isEnglish ? "Enter classroom name" : "教室名入力して"}
          value={joinedClassroomName}
          onChange={(e) => setJoinedClassroomName(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn btn-primary submit_buttons"
          style={{ marginLeft: "10px", border: "5px solid black" }}
        >
          {isEnglish ? "Enter classroom" : "教室に入る"}
        </button>
      </form>
      </div>
  
      <div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <select
            value={activeClassroomName}
            style={{ width: "188px", height: "30px"}}
            onChange={(e) => {
              const selectedClassroom = userClassrooms.find(
                (c) => c.name === e.target.value
              );
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
          <button
            className="btn btn-danger mb-3 submit_buttons"
            style={{ marginLeft: "10px", border: "5px solid black" }}
            onClick={openLeaveModal}
          >
            <span className="text-center">{isEnglish ? "Leave classroom" : "教室から抜ける"}</span>
          </button>
        </div>
      </div>
      {urlPath === "/portfolio/" &&
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div>If you are a teacher you can create classrooms, leave classrooms and send requests to join other classrooms</div>
              <div>If you are a student you can join and leave classrooms</div>
            </div>
      }
      <Modal show={leaveModal} onHide={closeLeaveModal}>
        <Modal.Body>
          <p>{isEnglish ? "Are you sure you want to leave this classroom?" : "本当にこの教室から抜けるんですか？"}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeLeaveModal}>{isEnglish ? "No" : "いいえ"}</Button>
          <Button variant="primary" onClick={handleLeave}>{isEnglish ? "Yes" : "はい"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Classrooms;
  