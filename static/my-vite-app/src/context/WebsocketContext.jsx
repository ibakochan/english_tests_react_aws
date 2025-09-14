import React, { createContext, useContext, useEffect, useState } from "react";
import { ws, connect, disconnect, sendData, setConnectedUsersCallback, setInvitationCallback, setInvitationResponseCallback, setUserNotFoundCallback, setCategoryToggleCallback, setTestToggleCallback, setQuestionsDataCallback, setAnswerSubmitCallback, setRunAwayCallback } from '../websockets/websocketConnect';

import { useUser } from "./UserContext";
import { useTest } from "./TestContext";

const WebsocketContext = createContext();

export function WebsocketProvider({ children }) {
  const { currentUser, activity, activeClassroomId } = useUser();
  const { maxScores, tests } = useTest();
  const [connected, setConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [opponentA, setOpponentA] = useState("");
  const [targetUsername, setTargetUsername] = useState('');
  const [inviter, setInviter] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [isPractice, setIsPractice] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [battleModalPicture, setBattleModalPicture] = useState('');
  const [invitationModalPicture, setInvitationModalPicture] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [battleModalText, setBattleModalText] = useState('');
  const [battleFinishMessage, setBattleFinishMessage] = useState('');
  const [battleScore, setBattleScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const battleTests = Object.values(tests)
  .flat()
  .filter(test => {
    const maxScore = maxScores?.find(ms => ms.test === test.id);
    return maxScore && (maxScore.score / test.total_score) >= 0.7;
  });



  useEffect(() => {
    if (currentUser && !connected) {
        connect(currentUser, activeClassroomId);
        setConnected(true);
    }

    setConnectedUsersCallback(users => {
      setConnectedUsers(users);
    });    
    setInvitationCallback(senderUsername => {
      if (opponentA === "" && activity === "") {
        setInvitations(prev => [...prev, senderUsername]);
        setInvitationModalPicture("https://storage.googleapis.com/battle_mode/invitation.png");
        setShowInvitationModal(true);
      };   
    });
    setInvitationResponseCallback(data => {
      if (data.type === "invitation_accept" && opponentA === "") {
          setOpponentA(data.target_username);
          setShowInvitationModal(true);
          setInvitationModalPicture("https://storage.googleapis.com/battle_mode/battlepic.png");
          setInvitationMessage("伝説の戦いのはじまりだ！");
          if (data.inviter) {
              setInviter(true);
          }
      }
      if (data.type === "invitation_decline" && opponentA === "") {
        setShowInvitationModal(true);
        setInvitationModalPicture("https://storage.googleapis.com/battle_mode/runaway.png");
        setInvitationMessage("相手が君を恐れて逃げた。。。。");
      }
    });
    setUserNotFoundCallback(message => alert(message));
    setRunAwayCallback(data => {
      setOpponentA("");
      setInviter(false);
      setShowInvitationModal(true);
      setInvitationModalPicture("https://storage.googleapis.com/battle_mode/runaway.png");
      setInvitationMessage("相手が君を恐れて逃げた。。。。");
    }); 
    return () => {
      if (!currentUser) {
          disconnect(currentUser);
          setOpponentA("");
          setInviter(false);
      }
    };
  }, [currentUser, opponentA, inviter, battleModalPicture, battleModalText, battleFinishMessage]);

  
  const handleAcceptInvitation = (senderUsername) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        sendData({
          type: "invitation_accept",
          sender_username: senderUsername,
          inviting: true,
        });
        setInvitations(prev => prev.filter(user => user !== senderUsername));
        setOpponentA(senderUsername);
        setInvitationModalPicture("https://storage.googleapis.com/battle_mode/battlepic.png");
        setInvitationMessage("伝説の戦いのはじまりだ！");
    }
  };

  const handleDeclineInvitation = (senderUsername) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        sendData({
          type: "invitation_decline",
          sender_username: senderUsername,
        });
        setInvitations(prev => prev.filter(user => user !== senderUsername));
        setShowInvitationModal(false);
    }
  };

  const handleSendInvitation = (username = targetUsername) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        sendData({
          type: "invitation",
          target_username: username,
        });
        setTargetUsername('');
    }
  };

  const handleRunAway = (username) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendData({
        type: "run",
        target_username: username,
      })
      setOpponentA("");
      setInviter(false);
      setShowInvitationModal(true);
      setInvitationModalPicture("https://storage.googleapis.com/battle_mode/run.jpeg");
      setInvitationMessage("それでも侍か！？！？");
    }
  }


  return (
    <WebsocketContext.Provider
      value={{ handleRunAway, invitationModalPicture, setInvitationModalPicture, invitationMessage, setInvitationMessage, showInvitationModal, setShowInvitationModal, battleScore, setBattleScore, opponentScore, setOpponentScore, connectedUsers, invitations, opponentA, targetUsername, setTargetUsername, inviter, sendData, handleAcceptInvitation, handleDeclineInvitation, handleSendInvitation, volume, setVolume, isPractice, setIsPractice, showModal, setShowModal, battleModalPicture, setBattleModalPicture, battleModalText, setBattleModalText, battleFinishMessage, setBattleFinishMessage }}
    >
      {children}
    </WebsocketContext.Provider>
  );
}

export function useWebsocket() {
  return useContext(WebsocketContext);
}