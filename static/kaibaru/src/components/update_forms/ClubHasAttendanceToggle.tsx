import React from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";
import type { Club } from "../types";

interface Props {
  club: Club;
  initialHasAttendance?: boolean;
  onUpdated?: (newValue: boolean) => void;
}

const ClubHasAttendanceToggle: React.FC<Props> = ({
  club,
  initialHasAttendance,
  onUpdated
}) => {
  const { value, setValue, loading, error, updateField } = useClubFieldUpdate(
    "has_attendance",
    club.id,
    initialHasAttendance ? "true" : "false"
  );

  const boolValue = value === "true";

  const handleToggle = async (checked: boolean) => {
    const newValue = checked ? "true" : "false";
    setValue(newValue);

    try {
      await updateField(newValue);
      onUpdated?.(checked);
    } catch {
      // error handled inside hook
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#fafafa",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginTop: "20px",
      }}
    >
      {/* Big Toggle */}
      <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={boolValue}
          disabled={loading}
          onChange={(e) => handleToggle(e.target.checked)}
          style={{
            width: "26px",
            height: "26px",
            marginRight: "12px",
            cursor: "pointer"
          }}
        />
        <span style={{ fontSize: "22px", fontWeight: "bold" }}>
          出席管理を有効にする
        </span>
      </label>

      {!boolValue &&
      <p style={{ fontSize: "18px", lineHeight: 1.6, marginTop: "12px", color: "#444" }}>
        これを有効にすると、生徒の出席を各レッスンごとに管理できるようになります。<br />
        もし「レベル」機能も有効になっていれば、生徒の各レベルでの参加回数を確認でき、
        一定回数に達した際に自動でレベルアップさせることもできます。
      </p>
      }

      {error && (
        <p style={{ color: "red", marginTop: "10px", fontSize: "16px" }}>{error}</p>
      )}
    </div>
  );
};

export default ClubHasAttendanceToggle;
