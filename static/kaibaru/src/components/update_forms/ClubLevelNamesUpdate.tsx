import React, { useState, useEffect } from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";
import type { Club } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { safeParseJSON } from "../../utils/safeParseJSON";


interface Props {
  club: Club;
  onUpdated?: (newLevelNames: Record<number, string>) => void;
}



const ClubLevelNamesUpdate: React.FC<Props> = ({ club, onUpdated }) => {
  const clubId = club.id;
  const initialLevels = safeParseJSON(club.level_names);
  const [levelNames, setLevelNames] = useState<Record<number, string>>(initialLevels);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [inputValue, setInputValue] = useState("");
  const { updateField, loading, error } = useClubFieldUpdate("level_names", clubId, JSON.stringify(initialLevels));

  useEffect(() => setInputValue(levelNames[selectedLevel] || ""), [selectedLevel, levelNames]);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    const updatedLevels = { ...levelNames, [selectedLevel]: inputValue.trim() };
    await updateField(JSON.stringify(updatedLevels));
    setLevelNames(updatedLevels);
    onUpdated?.(updatedLevels);
    if (!levelNames[selectedLevel + 1]) setSelectedLevel(selectedLevel + 1);
  };

  const handleRemove = async (levelToRemove: number) => {
    const updatedLevels: Record<number, string> = {};
    Object.entries(levelNames).forEach(([lvlStr, name]) => {
      const lvl = parseInt(lvlStr);
      if (lvl < levelToRemove) updatedLevels[lvl] = name;
      else if (lvl > levelToRemove) updatedLevels[lvl - 1] = name;
    });
    await updateField(JSON.stringify(updatedLevels));
    setLevelNames(updatedLevels);
    onUpdated?.(updatedLevels);
    const maxLevel = Math.max(...Object.keys(updatedLevels).map(Number), 1);
    if (selectedLevel > maxLevel) setSelectedLevel(maxLevel);
  };

  const levelOptions = Array.from({ length: Math.max(...Object.keys(levelNames).map(Number), 0) + 1 }, (_, i) => i + 1);

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
      <h3 style={{ marginBottom: "10px", color: "#333" }}>レベル名の設定</h3>
      <p style={{ color: "#555" }}>
        各レベルに名前をつけることができます。
      </p>
      <p style={{ color: "#555" }}>
        例えば武道クラブなら：
      </p>
      <p style={{ color: "#555" }}>
        1=白帯
      </p>
      <p style={{ color: "#555" }}>
        2=青帯
      </p>

      {/* Input row */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(Number(e.target.value))}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {levelOptions.map((lvl) => <option key={lvl} value={lvl}>レベル {lvl}</option>)}
        </select>

        <input
          type="text"
          placeholder="レベル名を入力"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          maxLength={15}
          style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
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

      {/* Level list */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {Object.entries(levelNames)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([lvl, name]) => (
            <li key={lvl} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 10px",
              borderBottom: "1px solid #eee"
            }}>
              <span>{`レベル ${lvl}: ${name}`}</span>
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

export default ClubLevelNamesUpdate;
