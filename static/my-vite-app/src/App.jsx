import React from 'react';
import Test from './components/Test';
import UserTestRecords from './components/UserTestRecords';
import Classrooms from './components/Classrooms';
import StudentProfile from './components/StudentProfile';
import UserProfile from './components/UserProfile';
import TestCreate from './components/TestCreate';
import InvitationsAndSettings from './components/InvitationsAndSettings';
import { UserProvider, useUser } from "./context/UserContext";
import { WebsocketProvider, useWebsocket } from "./context/WebsocketContext";
import { TestProvider, useTest } from "./context/TestContext";
import './App.css';

function AppContent() {
  const { currentUser } = useUser();
  const { activity } = useUser();

  const urlPath = window.urlPath

  return (
    <>
      {(currentUser?.teacher || urlPath === "/portfolio/") && activity !== "test" &&  (
        <div>
          <UserTestRecords />
        </div>
      )}
      {activity !== "user_records" && activity !== "test" && activity !== "ibaru" && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <UserProfile />
        </div>
      )}
      {activity !== "user_records" &&  (
      <div>
        <Test />
        <div>
        <InvitationsAndSettings />
        </div>
      </div>
      )}
      {activity !== "test" && (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Classrooms />
      </div>
      )}
      {activity === "" &&
        <div>
           <StudentProfile />
        </div>
      }

      {currentUser?.is_superuser && (
        <div>
          <TestCreate />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <TestProvider>
        <WebsocketProvider>
          <AppContent />
        </WebsocketProvider>
      </TestProvider>
    </UserProvider>
  );
}
export default App;