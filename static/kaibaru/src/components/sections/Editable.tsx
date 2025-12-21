// Editable.tsx
import React, { useState } from "react";
import { FaEdit, FaTimesCircle } from "react-icons/fa";
import { RenderSlateContent } from "./RenderSlateContent";
import ClubSlateUpdate from "../update_forms/ClubHomeSlateUpdate";
import type { Club, Member } from "../types";

interface Props {
  club?: Club;
  owner?: boolean;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  scale: number;
  rawData?: string;
  category: "home" | "trial" | "system" | "contact";
  placeholder?: string | React.ReactNode;
  extraBottom?: React.ReactNode; // e.g., icons, QR codes, etc.
}

const Editable: React.FC<Props> = ({
  club,
  owner,
  setClub,
  scale,
  rawData,
  category,
  placeholder,
  extraBottom,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentMember = club?.members?.find(
    (m: Member) => m.user === club?.current_user?.id
  );

  const manager = currentMember?.is_manager

  const handleUpdate = (newData: any) => {
    setClub((prev: any) => ({
      ...prev,
      [category]: JSON.stringify(newData),
    }));
    setIsEditing(false);
  };

  const renderEmptyMessage = () => {
    if (!placeholder) return "こちらには、クラブや学校などのメインコンテンツを記載できます。文章は、一般的なワード文書のように段落ごとに作成可能です。";
    return typeof placeholder === "string" ? placeholder : undefined;
  };

  const renderExtraPlaceholder = () => {
    if (!rawData && placeholder && typeof placeholder !== "string") {
      return placeholder;
    }
    return null;
  };

  return (
    <div className="home-content-container">
      {/* Edit / Stop Edit button */}
      {(owner || manager) && !club?.frozen &&  (
        <div
          style={{
            marginBottom: "12px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: "50%",
            border: "2px solid #ccc",
            width: "48px",
            height: "48px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
          }}
          onClick={() => setIsEditing((prev) => !prev)}
          title={isEditing ? "編集を終了" : "編集する"}
        >
          {isEditing ? (
            <FaTimesCircle size={26} color="#d9534f" />
          ) : (
            <FaEdit size={24} color="#007bff" />
          )}
        </div>
      )}

      {/* Main content */}
      <div style={{ caretColor: "black", outline: "none", fontWeight: 500, padding: "0 2px" }}>
        {isEditing && club ? (
          <ClubSlateUpdate
            club={club}
            clubId={club.id}
            onUpdated={handleUpdate}
            scale={scale}
            category={category}
          />
        ) : (
          <RenderSlateContent rawData={rawData} emptyMessage={renderEmptyMessage()} />
        )}
      </div>

      {/* Extra content below (JSX placeholder or icons, QR codes, etc.) */}
      {renderExtraPlaceholder()}
      {extraBottom}
    </div>
  );
};

export default Editable;
