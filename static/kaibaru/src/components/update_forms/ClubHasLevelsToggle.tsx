import React from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";
import type { Club } from "../types";

interface Props {
  club: Club;
  initialHasLevels?: boolean;
  onUpdated?: (newValue: boolean) => void;
}

const ClubHasLevelsToggle: React.FC<Props> = ({
  club,
  initialHasLevels,
  onUpdated
}) => {
  const { value, setValue, loading, error, updateField } = useClubFieldUpdate(
    "has_levels",
    club.id,
    initialHasLevels ? "true" : "false"
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
          レベル機能を有効にする
        </span>
      </label>

      {!club.has_levels &&
      <p style={{ fontSize: "18px", lineHeight: 1.6, marginTop: "12px", color: "#444" }}>
        これを有効にすると、生徒の参加回数が「レベル」として管理されるようになります。
        生徒ごとに現在のレベルが表示され、レベルアップさせたり、
        各レベルで何回参加したかを確認できます。
        <br /><br />
        レベル名も自由に変更できます。例えば武道クラブであれば、
        <br />
        ・1 = 白帯<br />
        ・2 = 青帯<br />
        など、好きな名前を付けることができます。
      </p>
      }

      {error && (
        <p style={{ color: "red", marginTop: "10px", fontSize: "16px" }}>{error}</p>
      )}
    </div>
  );
};

export default ClubHasLevelsToggle;
