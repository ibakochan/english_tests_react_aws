export let ws = null;
let connectedUsersCallback = null;
let invitationCallback = null;
let invitationResponseCallback = null;
let userNotFoundCallback = null;
let categoryToggleCallback = null;
let testToggleCallback = null;
let questionsDataCallback = null;
let answerSubmitCallback = null;
let answerEchoSubmitCallback = null;
let runAwayCallback = null;
let battleTestsCallback = null;

export const connect = (currentUser, activeClassroomId) => {
    if (!currentUser || !activeClassroomId) return;
    const classrooms = currentUser.teacher?.classrooms || currentUser.student?.classrooms || [];

    const activeClassroom = classrooms.find(c => c.id === activeClassroomId);

    const hasBattlePermission = activeClassroom?.battle_permission === true;
    if (!ws && hasBattlePermission) {
        ws = new WebSocket("wss://eibaru.jp/ws/test/");

        ws.onopen = () => {
            console.log("WebSocket Connected");
            ws.send(JSON.stringify({ type: "join", username: currentUser.username }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "shared_user_list" && connectedUsersCallback) {
                connectedUsersCallback(data.users);
            } else if (data.type === "user_joined" && connectedUsersCallback) {
                connectedUsersCallback(prev => prev.some(u => u.username === data.username) ? prev : [...prev, { username: data.username, student_number: data.student_number }]);
            } else if (data.type === "user_left" && connectedUsersCallback) {
                connectedUsersCallback(prev => prev.filter(u => u.username !== data.username));
            } else if (data.type === "invitation" && invitationCallback) {
                invitationCallback(data.sender_username);
            } else if ((data.type === "invitation_accept" || data.type === "invitation_decline") && invitationResponseCallback) {
                invitationResponseCallback(data);
            } else if (data.type === "user_not_found" && userNotFoundCallback) {
                userNotFoundCallback(data.message);
            } else if (data.type === "category_toggle" && categoryToggleCallback) {
                categoryToggleCallback(data.category); 
            } else if (data.type === "test_toggle" && testToggleCallback) {
                testToggleCallback(data); 
            } else if (data.type === "questions_data" && questionsDataCallback) {
                questionsDataCallback(data); 
            } else if (data.type === "answer_submit" && answerSubmitCallback) {
                answerSubmitCallback(data); 
            } else if (data.type === "answer_submit_echo" && answerEchoSubmitCallback) {
                answerEchoSubmitCallback(data);
            } else if (data.type === "run" && runAwayCallback) {
                runAwayCallback(data);
            } else if (data.type === "battle_tests" && battleTestsCallback) {
                battleTestsCallback(data);
            };
        };

        ws.onclose = () => {
            console.log("WebSocket Disconnected");
        };
    }
};

export const disconnect = (currentUser) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave", username: currentUser.username }));
        ws.close();
        ws = null;
    }
};

export const sendData = (data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
};

export const setConnectedUsersCallback = (callback) => {
    connectedUsersCallback = callback;
};

export const setInvitationCallback = (callback) => {
    invitationCallback = callback;
};

export const setInvitationResponseCallback = (callback) => {
    invitationResponseCallback = callback;
};

export const setUserNotFoundCallback = (callback) => {
    userNotFoundCallback = callback;
};

export const setCategoryToggleCallback = (callback) => {
    categoryToggleCallback = callback;
};

export const setTestToggleCallback = (callback) => {
    testToggleCallback = callback;
};

export const setQuestionsDataCallback = (callback) => {
    questionsDataCallback = callback; 
};

export const setAnswerSubmitCallback = (callback) => {
    answerSubmitCallback = callback; 
};

export const setAnswerEchoSubmitCallback = (callback) => {
    answerEchoSubmitCallback = callback; 
};

export const setRunAwayCallback = (callback) => {
    runAwayCallback = callback; 
};

export const setBattleTestsCallback = (callback) => {
    battleTestsCallback = callback; 
};
