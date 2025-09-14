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
  const [changedLastName, setChangedLastName] = useState("");

  const urlPath = window.urlPath

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (changedStudentNumber === "" && changedLastName === "") {
      alert("出席番号または名字を入れてください！");
      return;
    }

    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        "/update/profile/",
        { 
          studentNumber: changedStudentNumber, 
          lastName: changedLastName 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "X-CSRFToken": csrfToken
          },
        }
      );

      if (response.data.status === "success") {
        const { student_number, last_name } = response.data;

        setCurrentUser((prevUser) => {
          if (!prevUser) return prevUser;
          const updatedUser = { ...prevUser };

          if (student_number && prevUser.student) {
            updatedUser.student = { 
              ...prevUser.student, 
              student_number 
            };
          }

          if (last_name) {
            updatedUser.last_name = last_name;
          }

          return updatedUser;
        });
      }

      setMessage({ type: response.data.status, text: response.data.message });
      setChangedStudentNumber("");
      setChangedLastName("");
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
          <h4>{isEnglish ? "Last Name" : "名字"}：{currentUser?.last_name}</h4>
          <h4>{isEnglish ? "Student number" : "出席番号"}：{currentUser?.student?.student_number}</h4>
          <form onSubmit={handleUpdateProfile}>
            <input
              type="number"
              placeholder={isEnglish ? "Change student ID" : "出席番号変更"}
              value={changedStudentNumber}
              onChange={(e) => setChangedStudentNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder={isEnglish ? "Change last name" : "名字変更"}
              value={changedLastName}
              onChange={(e) => setChangedLastName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary submit_buttons" style={{ border: '5px solid black' }}>{isEnglish ? "Change name and ID" : "名字番号変更"}</button>
          </form>
          </div>
          }
          {urlPath === "/portfolio/" &&
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              {isEnglish
                ? 'Here you can update your student number if you are a student'
                : 'ここで、生徒の場合は出席番号を変更できます'
              }
            </div>
            <div style={{ marginTop: '40px' }}>
              {isEnglish
                ? "If you are a superuser you can create tests below. But since only I can create tests currently and have no plans to change this soon, the test creation section is a bit messy, so no need to check that."
                : "スーパーユーザーの場合、以下でテストを作成できます。ただし、現在は私だけがテスト作成可能で、近いうちに変更する予定もないため、テスト作成セクションは少し雑ですので、私以外は見れません"
              }
            </div>
          </div>
          }
        </div>
    </div>
  )

};
export default StudentProfile;
