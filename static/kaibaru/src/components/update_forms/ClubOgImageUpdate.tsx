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

const ClubOgImageUpdate: React.FC<Props> = ({ club, onUpdated }) => {
  const { loading, error, updateFile } = useClubFileUpdate("og_image", club.id);
  const [ogImage, setOgImage] = useState<string | undefined>(club.og_image);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await updateFile(file);
      if (data.og_image) {
        setOgImage(data.og_image);
        onUpdated?.("og_image", data.og_image);
      }
    } catch {}
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
      {/* OG Image */}
      {ogImage && (
        <div style={{ width: "100%", height: "189px", overflow: "hidden" }}>
          <img
            src={ogImage}
            alt="OG Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Title & Description */}
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
          fontSize={32}
          maxWidth={280}
        />
      </div>
      <div>
        <ClubDescriptionUpdate
          clubId={club.id}
          value={club.search_description || ""}
          onUpdated={(val) => onUpdated?.("search_description", val)}
          fontSize={28}
          rows={2}
        />
      </div>
      </div>

      {/* Bottom Upload Row */}

      <div style={{ padding: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div className="file-input-wrapper">
          <input
            id={`ogImageInput-${club.id}`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor={`ogImageInput-${club.id}`} style={{ fontSize: "16px" }}>
            OG画像変更 <FontAwesomeIcon icon={faUpload} />
          </label>
        </div>

        {/* Small Preview */}
        {ogImage && (
          <img
            src={ogImage}
            alt="OG Preview Small"
            style={{ width: "40px", height: "40px", objectFit: "cover", border: "1px solid #ddd" }}
          />
        )}
      </div>

      {loading && <p style={{ padding: "0 10px", color: "#555", fontSize: "16px" }}>アップロード中...</p>}
      {error && <p style={{ padding: "0 10px", color: "red", fontSize: "16px" }}>{error}</p>}

      <p style={{ padding: "0 10px 10px 10px", fontSize: "25px", color: "#555", fontStyle: "italic" }}>
        上はSNSでリンクを送った際の表示例です。
      </p>
    </div>
  );
};

export default ClubOgImageUpdate;
