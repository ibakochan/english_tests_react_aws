import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { useUser } from "../context/UserContext";

const StudentProfile = () => {
  const { currentUser, setCurrentUser, lvl, setLvl, petLevel, setPetLevel, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish } = useUser();
  const [changedStudentNumber, setChangedStudentNumber] = useState("");
  const [message, setMessage] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);

  const urlPath = window.urlPath

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (changedStudentNumber === "") {
      alert("出席番号を入れてください！");
      return;
    }

    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        "/update/profile/",
        { studentNumber: changedStudentNumber },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "X-CSRFToken": csrfToken
          },
        }
      );
      if (response.data.status === "success") {
        const newStudentNumber = response.data.student_number;
        setCurrentUser((prevUser) => {
          if (!prevUser) return prevUser;

          const updatedUser = { ...prevUser };
        
          if (newStudentNumber !== "" && prevUser.student) {
            updatedUser.student = { 
              ...prevUser.student, 
              student_number: newStudentNumber 
            };
          }
        
          return updatedUser;
        });
      }

      setMessage({ type: response.data.status, text: response.data.message });
      setChangedStudentNumber("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred.",
      });
    }
  };

  return (
    <div style={{ marginBottom: '25px', marginTop: '25px' }}>
        <div>
          {(currentUser?.student || urlPath === "/portfolio/") &&
          <div style={{ border: "2px solid black", padding: "15px", borderRadius: "10px", backgroundColor: "#000", color: "#fff", maxWidth: "400px", margin: "20px auto", textAlign: "center" }}>
          {message && (
            <div className="message" style={{color: message.type === "success" ? "#32CD32" : "#FF4500"}}>
              {message.text}
            </div>
          )}
          <h2>{currentUser?.username}</h2>
          <h4>{isEnglish ? "User Name" : "ユーザーネーム"}：{currentUser?.username}</h4>
          <h4>{isEnglish ? "Student number" : "出席番号"}：{currentUser?.student?.student_number}</h4>
          <form onSubmit={handleUpdateProfile}>
            <input
              type="number"
              placeholder={isEnglish ? "Change student ID" : "出席番号変更"}
              value={changedStudentNumber}
              onChange={(e) => setChangedStudentNumber(e.target.value)}
            />
            <button type="submit" className="btn btn-primary submit_buttons" style={{ border: '5px solid black' }}>{isEnglish ? "Change name and ID" : "名字番号変更"}</button>
          </form>
          </div>
          }
          {urlPath === "/portfolio/" &&
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              Here you can update your student number if you are a student
            </div>
            <div style={{ marginTop: '40px' }}>If you are a superuser you can create tests below. but since only I am currrently able to create tests and I have no plans on changing this anytime soon the test create section is pretty messy so no need to check that</div>
          </div>
          }
        </div>
    </div>
  )

};
export default StudentProfile;
