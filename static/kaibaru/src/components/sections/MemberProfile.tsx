import React from "react";
import type { Member, Club } from "../types";
import { safeParseJSON } from "../../utils/safeParseJSON";


interface Props {
  club: Club;
  currentMember?: Member;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  successMessage?: string | null;

}

const MemberProfile: React.FC<Props> = ({ successMessage, club, currentMember, setShowModal }) => {
  if (!currentMember) return null;
  const levelNames: Record<string, string> = safeParseJSON(club.level_names);

  const getLevelLabel = (lvl: number) =>
    levelNames[String(lvl)] && levelNames[String(lvl)].trim() !== ""
      ? levelNames[String(lvl)]
      : `レベル ${lvl}`;

  const currentLevel = currentMember.level;
  const currentLevelLabel = getLevelLabel(currentLevel);

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "2rem auto",
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "24px",
        textAlign: "center",
      }}
    >
      {successMessage !== "" && (
        <h2 style={{ color: "green", marginBottom: "1rem" }}>
          {successMessage}
        </h2>
      )}
      <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
        <img
          src={currentMember.picture}
          alt={currentMember.full_name}
          style={{
            width: "140px",
            height: "140px",
            objectFit: "cover",
            borderRadius: "50%",
            border: "3px solid #ddd",
          }}
        />
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            backgroundColor: "#007bff",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          ✎
        </button>
      </div>

      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        {currentMember.full_name}
      </h2>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        メンバータイプ：{currentMember.member_type || "不明"}
      </p>
      {club.has_attendance &&
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          backgroundColor: "#f7f7f7",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ fontSize: "0.9rem", color: "#777" }}>トータル</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>
            {currentMember.total_participation ?? 0}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.9rem", color: "#777" }}>今月</div>
          {club.has_attendance &&
          <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>
            {currentMember.this_month_participation ?? 0}
          </div>
          }
        </div>
        <div>
          {club.has_levels &&
          <>
          <div style={{ fontSize: "0.9rem", color: "#777" }}>
            レベル：{currentLevelLabel}
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>
            {currentMember.level_participation?.[currentMember.level] ?? 0}
          </div>
          </>
          }
        </div>
      </div>
      }

      <div style={{ textAlign: "left", color: "#444", fontSize: "0.95rem" }}>
        <p><strong>電話番号：</strong>{currentMember.phone_number || "未登録"}</p>
        <p><strong>緊急連絡先：</strong>{currentMember.emergency_number || "未登録"}</p>
        <p><strong>契約内容：</strong>{currentMember.contract || "未登録"}</p>
        <p><strong>その他：</strong>{currentMember.other_information || "なし"}</p>
      </div>
    </div>
  );
};

export default MemberProfile;
