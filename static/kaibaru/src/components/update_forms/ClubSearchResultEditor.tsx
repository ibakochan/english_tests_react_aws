import React, { useState } from "react";
import { useClubFileUpdate } from "../../hooks/useClubFileUpdate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import type { Club } from "../types";
import { ClubTitleUpdate, ClubDescriptionUpdate } from "./ClubTitleDescriptionUpdate";

interface Props {
  club: Club;
  onUpdated?: (field: string, value: string) => void;
}

const ClubSearchResultEditor: React.FC<Props> = ({ club, onUpdated }) => {
  const { loading: faviconLoading, error: faviconError, updateFile: updateFavicon } = useClubFileUpdate("favicon", club.id);
  const [favicon, setFavicon] = useState<string | undefined>(club.favicon);

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await updateFavicon(file);
      if (data.favicon) {
        setFavicon(data.favicon);
        onUpdated?.("favicon", data.favicon);
      }
    } catch {
      // error handled in hook
    }
  };

  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "15px",
      backgroundColor: "#fff",
      width: "100%",       // take full parent width
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      flex: 1,             // <-- add this line
    }}>
      <div style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "#fafafa",
        marginTop: "15px"
      }}>
      {/* Top Row: favicon + domain info */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        {favicon && (
          <img
            src={favicon}
            alt="favicon"
            style={{ borderRadius: "50%", width: "40px", height: "40px" }}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "16px", color: "#777" }}>kaibaru.jp</span>
          <span style={{ fontSize: "18px", color: "#006621" }}>https://{club.subdomain}.kaibaru.jp</span>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          minHeight: "1em",
          width: "100%",
          whiteSpace: "pre-wrap", // wrap text
          wordBreak: "break-word", // break long words
          overflowWrap: "break-word",
        }}
      >
        <ClubTitleUpdate
          clubId={club.id}
          value={club.title || ""}
          onUpdated={(val) => onUpdated?.("title", val)}
          fontSize={36}
          maxWidth={550}
          textColor="#1a0dab"
        />
      </div>

      {/* Description */}
      <div>
        <ClubDescriptionUpdate
          clubId={club.id}
          value={club.search_description || ""}
          onUpdated={(val) => onUpdated?.("search_description", val)}
          fontSize={28}
          rows={3}
          textColor="#545454"
        />
      </div>
      </div>

      {/* Favicon Upload */}

      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div className="file-input-wrapper">
          <input
            id={`faviconInput-${club.id}`}
            type="file"
            accept="image/*"
            onChange={handleFaviconChange}
            disabled={faviconLoading}
          />
          <label htmlFor={`faviconInput-${club.id}`}>
            Favicon変更 <FontAwesomeIcon icon={faUpload} />
          </label>
        </div>
        {favicon && (
          <img
            src={favicon}
            alt="favicon"
            style={{ borderRadius: "50%", width: "40px", height: "40px", border: "1px solid #ddd" }}
          />
        )}
        {faviconError && <p style={{ color: "red", marginLeft: "10px" }}>{faviconError}</p>}
      </div>

      <p style={{ padding: "10px 0 0 0", fontSize: "25px", color: "#555", fontStyle: "italic" }}>
        上は検索結果で表示される際の例です。
      </p>
      <p style={{ padding: "10px 0 0 0", fontSize: "25px", color: "#555", fontStyle: "italic" }}>
        設定したタイトルや説明が検索結果に反映されるまでには通常数時間〜数週間かかります。
      </p>
    </div>
  );
};

export default ClubSearchResultEditor;
