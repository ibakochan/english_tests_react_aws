import React, { useState, useEffect } from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";
import type { Club } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { safeParseJSON } from "../../utils/safeParseJSON";

interface Props {
  club: Club;
  onUpdated?: (newMilestones: Record<number, number>) => void;
}



const ClubLevelMilestonesUpdate: React.FC<Props> = ({ club, onUpdated }) => {
  const clubId = club.id;
  const initialMilestones = safeParseJSON(club.level_milestones);
  const levelNames = safeParseJSON(club.level_names);

  const [milestones, setMilestones] = useState<Record<number, number>>(initialMilestones);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [inputValue, setInputValue] = useState("");

  const { updateField, loading, error } = useClubFieldUpdate(
    "level_milestones",
    clubId,
    JSON.stringify(initialMilestones)
  );

  useEffect(() => setInputValue(milestones[selectedLevel]?.toString() || ""), [selectedLevel, milestones]);

  const getLevelLabel = (lvl: number) => levelNames[lvl] ? levelNames[lvl] : `レベル ${lvl}`;

  const handleSave = async () => {
    if (!inputValue.trim() || isNaN(Number(inputValue))) return;
    const updated = { ...milestones, [selectedLevel]: Number(inputValue) };
    await updateField(JSON.stringify(updated));
    setMilestones(updated);
    onUpdated?.(updated);
    if (!milestones[selectedLevel + 1]) setSelectedLevel(selectedLevel + 1);
  };

  const handleRemove = async (levelToRemove: number) => {
    const updated: Record<number, number> = {};
    Object.entries(milestones).forEach(([lvlStr, ms]) => {
      const lvl = parseInt(lvlStr);
      if (lvl < levelToRemove) updated[lvl] = ms;
      else if (lvl > levelToRemove) updated[lvl - 1] = ms;
    });
    await updateField(JSON.stringify(updated));
    setMilestones(updated);
    onUpdated?.(updated);
    const maxLevel = Math.max(...Object.keys(updated).map(Number), 1);
    if (selectedLevel > maxLevel) setSelectedLevel(maxLevel);
  };

  const levelOptions = Array.from({ length: Math.max(...Object.keys(milestones).map(Number), 0) + 1 }, (_, i) => i + 1);

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "20px",
      backgroundColor: "#fff",
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      flex: 1
    }}>
      <h3 style={{ marginBottom: "10px", color: "#333" }}>レベル マイルストーン設定</h3>
      <p style={{ color: "#666", marginBottom: "10px" }}>各レベルにおける次のレベルへの到達に必要な参加回数を設定できます。</p>
      <p style={{ color: "#666", marginBottom: "15px" }}>例：レベル4のマイルストーンを50と設定した場合、レベル4としての参加回数が50に達すると、自動的にレベル5に昇格します。</p>

      {/* Input row */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", marginTop: "6px" }}>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(Number(e.target.value))}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {levelOptions.map((lvl) => <option key={lvl} value={lvl}>{getLevelLabel(lvl)}</option>)}
        </select>

        <input
          type="number"
          placeholder="マイルストーン値"
          value={inputValue}
          onChange={(e) => {
            if (e.target.value.length <= 5) {
              setInputValue(e.target.value);
            }
          }}
          style={{
            width: "140px",       
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={handleSave}
          disabled={loading || !inputValue.trim()}
          style={{
            backgroundColor: "#4CAF50",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          <FontAwesomeIcon icon={faSave} />
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Milestone list */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {Object.entries(milestones)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([lvl, ms]) => (
            <li key={lvl} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 10px",
              borderBottom: "1px solid #eee"
            }}>
              <span>{`${getLevelLabel(Number(lvl))}: ${ms}`}</span>
              <button
                onClick={() => handleRemove(Number(lvl))}
                style={{ backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ClubLevelMilestonesUpdate;
