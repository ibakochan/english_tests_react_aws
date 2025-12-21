import React from "react";
import ClubOgImageUpdate from "../update_forms/ClubOgImageUpdate";
import ClubSearchResultEditor from "../update_forms/ClubSearchResultEditor";
import ClubHasLevelsToggle from "../update_forms/ClubHasLevelsToggle";
import ClubHasAttendanceToggle from "../update_forms/ClubHasAttendanceToggle";
import ClubLevelNamesUpdate from "../update_forms/ClubLevelNamesUpdate";
import ClubLevelMilestonesUpdate from "../update_forms/ClubLevelMilestonesUpdate";

import type { Club, Member } from "../types";

interface Props {
  club: Club;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  owner?: boolean;
}

const Settings: React.FC<Props> = ({ club, setClub, owner }) => {
  const currentMember = club?.members?.find(
    (m: Member) => m.user === club?.current_user?.id
  );

  const manager = currentMember?.is_manager
  if (!(owner || manager) || !club) return null;


  return (
    <div>
      <div>
        <ClubHasLevelsToggle
          club={club}
          initialHasLevels={club.has_levels}
          onUpdated={(newVal) =>
            setClub((prev: any) => ({ ...prev, has_levels: newVal }))
          }
        />
      </div>
      <div>
        <ClubHasAttendanceToggle
          club={club}
          initialHasAttendance={club.has_attendance}
          onUpdated={(newVal) =>
            setClub((prev: any) => ({ ...prev, has_attendance: newVal }))
          }
        />
      </div>
      {club.has_levels && (
      <div 
        style={{
          display: "flex",
          gap: "20px",       // space between cards
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          alignItems: "stretch", // makes both cards same height
        }}  
      >
      <div style={{ marginTop: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <ClubLevelNamesUpdate
          club={club}
          onUpdated={(newLevelNames) =>
            setClub((prev: any) => ({ ...prev, level_names: newLevelNames }))
          }
        />
      </div>
      {club.has_attendance &&
      <div style={{ marginTop: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <ClubLevelMilestonesUpdate
          club={club}
          onUpdated={(newMilestones) =>
            setClub((prev: any) => ({ ...prev, level_milestones: newMilestones }))
          }
        />
      </div>
      }
      </div>
      )}
      <div 
        style={{
          display: "flex",
          gap: "20px",       // space between cards
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          alignItems: "stretch", // makes both cards same height
        }}  
      >
      <div style={{ marginTop: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <ClubSearchResultEditor
          club={club}
          onUpdated={(field, value) =>
            setClub((prev: any) => ({ ...prev, [field]: value }))
          }
        />
      </div>
      <div style={{ marginTop: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <ClubOgImageUpdate
          club={club}
          onUpdated={(field, value) =>
            setClub((prev: any) => ({ ...prev, [field]: value }))
          }
        />
      </div>
      </div>
    </div>
  );
};

export default Settings;
