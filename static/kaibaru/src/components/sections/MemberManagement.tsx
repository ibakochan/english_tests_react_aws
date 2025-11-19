import React from "react";
import type { Member } from "../types";

interface Props {
  members: Member[];
  setSelectedMember: React.Dispatch<React.SetStateAction<Member | null>>;
}

const MemberManagement: React.FC<Props> = ({ members, setSelectedMember }) => {
  if (!members || members.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: "10px" }}>
      {members.map((member: Member) => (
        <div
          key={member.full_name}
          style={{
            flex: "0 1 120px",
            textAlign: "center",
            cursor: "pointer",
            transition: "transform 0.2s ease",
            backgroundColor: "#f9f9f9",
            borderRadius: "12px",
            padding: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
          onClick={() => setSelectedMember(member)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src={member.picture}
            alt={member.full_name}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              border: "2px solid #ccc",
              borderRadius: "8px",
            }}
          />
          <div style={{ marginTop: "0.5rem", fontWeight: "600", fontSize: "0.95rem" }}>
            {member.full_name}
          </div>
          <div style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "#333" }}>
            トータル：{member.total_participation ?? 0}<br />
            今月：{member.this_month_participation ?? 0}<br />
            レベル{member.level}：{member.level_participation?.[member.level] ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberManagement;
