import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [lvl, setLvl] = useState(0);
  const [petLevel, setPetLevel] = useState(0);
  const [activeClassroomName, setActiveClassroomName] = useState("");
  const [activity, setActivity] = useState("");
  const urlPath = window.urlPath;
  const [isEnglish, setIsEnglish] = useState(null);
  const [activeTestId, setActiveTestId] = useState(null);
  const userClassrooms = currentUser?.student?.classrooms || currentUser?.teacher?.classrooms || [];
  const [activeClassroomId, setActiveClassroomId] = useState(userClassrooms[0]?.id || null);

  const student = currentUser?.student
  const teacher = currentUser?.teacher


  const fetchCurrentUser = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get("/api/users/current-user/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Fetched current user:", response.data);
      setCurrentUser(response.data);
      const level = Math.floor((
        response.data.total_eiken_score +
        response.data.total_4eiken_score +
        response.data.total_eiken3_score +
        response.data.total_eiken_pre2_score +
        response.data.total_eiken2_score +
        response.data.total_numbers_score +
        response.data.total_phonics_score
      ) / 100);
      setPetLevel(level)
      const user_level = Math.floor((response.data.total_max_scores) / 50);
      setLvl(user_level)

      const classrooms = response.data?.teacher?.classrooms || response.data?.student?.classrooms;
      if (classrooms?.length > 0) {
        setActiveClassroomId(classrooms[0].id);
        setActiveClassroomName(classrooms[0].name);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      setError("Failed to fetch current user.");
    } finally {
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <UserContext.Provider       
      value={{
        currentUser,
        setCurrentUser,
        lvl,
        setLvl,
        petLevel,
        setPetLevel,
        activeClassroomId,
        setActiveClassroomId,
        activeClassroomName,
        setActiveClassroomName,
        userClassrooms,
        activity,
        setActivity,
        isEnglish, 
        setIsEnglish,
        activeTestId, 
        setActiveTestId,
        student,
        teacher,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}