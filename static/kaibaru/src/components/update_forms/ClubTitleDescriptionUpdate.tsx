import React, { useState, useEffect } from "react";
import { FaEdit, FaTimesCircle } from "react-icons/fa";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";

interface TitleProps {
  clubId: number;
  value: string;
  fieldName?: string;
  onUpdated?: (value: string) => void;
  fontSize?: number;
  maxWidth?: number;
  textColor?: string; // NEW
}

export const ClubTitleUpdate: React.FC<TitleProps> = ({
  clubId,
  value,
  fieldName = "title",
  onUpdated,
  fontSize = 32,
  maxWidth = 280,
  textColor = "#000" // default black
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { value: title, setValue, updateField } = useClubFieldUpdate(fieldName, clubId, value);

  useEffect(() => setValue(value), [value, setValue]);

  const save = async () => {
    try {
      await updateField();
      setIsEditing(false);
      onUpdated?.(title);
    } catch {}
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {isEditing ? (
        <>
          <input
            value={title}
            onChange={(e) => setValue(e.target.value)}
            style={{ fontWeight: "bold", fontSize, flex: 1, maxWidth, color: textColor }}
          />
          <FaTimesCircle
            size={fontSize / 1.5}
            color="#d9534f"
            onClick={() => setIsEditing(false)}
            style={{ cursor: "pointer", marginLeft: "5px" }}
          />
          <button onClick={save} style={{ marginLeft: "5px", fontSize: fontSize / 2 }}>保存</button>
        </>
      ) : (
        <>
          <p style={{ fontWeight: "bold", fontSize, margin: 0, flex: 1, color: textColor }}>
            {title || "クラブタイトル"}
          </p>
          <FaEdit
            size={fontSize / 1.1}
            color="#007bff"
            onClick={() => setIsEditing(true)}
            style={{ cursor: "pointer", marginLeft: "5px" }}
          />
        </>
      )}
    </div>
  );
};

interface DescriptionProps {
  clubId: number;
  value: string;
  fieldName?: string;
  onUpdated?: (value: string) => void;
  fontSize?: number;
  rows?: number;
  textColor?: string; // NEW
}

export const ClubDescriptionUpdate: React.FC<DescriptionProps> = ({
  clubId,
  value,
  fieldName = "search_description",
  onUpdated,
  fontSize = 28,
  rows = 2,
  textColor = "#555" // default gray
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { value: description, setValue, updateField } = useClubFieldUpdate(fieldName, clubId, value);

  useEffect(() => setValue(value), [value, setValue]);

  const save = async () => {
    try {
      await updateField();
      setIsEditing(false);
      onUpdated?.(description);
    } catch {}
  };

  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
      {isEditing ? (
        <>
          <textarea
            value={description}
            onChange={(e) => setValue(e.target.value)}
            style={{ fontSize, flex: 1, color: textColor }}
            rows={rows}
          />
          <FaTimesCircle
            size={fontSize / 1.2}
            color="#d9534f"
            onClick={() => setIsEditing(false)}
            style={{ cursor: "pointer", marginLeft: "5px" }}
          />
          <button onClick={save} style={{ marginLeft: "5px", fontSize: fontSize / 2 }}>保存</button>
        </>
      ) : (
        <>
          <p style={{ fontSize, margin: 0, flex: 1, color: textColor }}>
            {description || "ここに検索用説明が表示されます。"}
          </p>
          <FaEdit
            size={fontSize / 1.1}
            color="#007bff"
            onClick={() => setIsEditing(true)}
            style={{ cursor: "pointer", marginLeft: "5px" }}
          />
        </>
      )}
    </div>
  );
};
