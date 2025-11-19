import React, { useState } from "react";
import { FaEdit, FaTimesCircle } from "react-icons/fa";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";
import { useClubFileUpdate } from "../../hooks/useClubFileUpdate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface Props {
  clubId: number;
  initialTitle?: string;
  initialDescription?: string;
  initialFavicon?: string;
  subdomain: string;
  onUpdated?: (field: string, value: string) => void;
}

const ClubSearchResultEditor: React.FC<Props> = ({
  clubId,
  initialTitle,
  initialDescription,
  initialFavicon,
  subdomain,
  onUpdated
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const { value: title, setValue: setTitle, updateField: updateTitle } = useClubFieldUpdate("title", clubId, initialTitle);
  const { value: description, setValue: setDescription, updateField: updateDescription } = useClubFieldUpdate("search_description", clubId, initialDescription);
  const { loading: faviconLoading, error: faviconError, updateFile: updateFavicon } = useClubFileUpdate("favicon", clubId);
  const [favicon, setFavicon] = useState(initialFavicon);

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await updateFavicon(file);
      if (data.favicon) {
        setFavicon(data.favicon);
        if (onUpdated) onUpdated("favicon", data.favicon);
      }
    } catch {}
  };

  const saveTitle = async () => {
    try {
      await updateTitle();
      setIsEditingTitle(false);
      if (onUpdated) onUpdated("title", title);
    } catch {}
  };

  const saveDescription = async () => {
    try {
      await updateDescription();
      setIsEditingDescription(false);
      if (onUpdated) onUpdated("search_description", description);
    } catch {}
  };

  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "25px",
      backgroundColor: "#f9f9f9",
      maxWidth: "600px"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
        {favicon && <img src={favicon} alt="favicon" style={{ width: "20px", height: "20px", marginRight: "8px" }} />}
        {isEditingTitle ? (
          <>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ fontSize: "36px", flex: 1 }} />
            <FaTimesCircle size={24} color="#d9534f" onClick={() => setIsEditingTitle(false)} style={{ cursor: "pointer", marginLeft: "5px" }} />
            <button onClick={saveTitle} style={{ marginLeft: "5px" }}>保存</button>
          </>
        ) : (
          <>
            <h3 style={{ margin: 0, fontSize: "36px", color: "#1a0dab", flex: 1 }}>{title || "クラブタイトル未設定"}</h3>
            <FaEdit size={24} color="#007bff" onClick={() => setIsEditingTitle(true)} style={{ cursor: "pointer", marginLeft: "5px" }} />
          </>
        )}
      </div>

      <p style={{ fontSize: "28px", color: "#006621", margin: "2px 0" }}>https://{subdomain}.kaibaru.jp</p>

      <div style={{ position: "relative" }}>
        {isEditingDescription ? (
          <>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", fontSize: "32px", color: "#545454" }}
              rows={3}
            />
            <FaTimesCircle size={24} color="#d9534f" onClick={() => setIsEditingDescription(false)} style={{ cursor: "pointer", position: "absolute", right: 5, top: 5, marginLeft: "5px" }} />
            <button onClick={saveDescription}>保存</button>
          </>
        ) : (
          <>
            <p style={{ fontSize: "32px", color: "#545454" }}>{description || "検索用説明がここに表示されます。"}</p>
            <FaEdit size={24} color="#007bff" onClick={() => setIsEditingDescription(true)} style={{ cursor: "pointer", position: "absolute", right: 5, top: 0, marginLeft: "10px" }} />
          </>
        )}
      </div>

      <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
        <div className="file-input-wrapper">
          <input
            id={`faviconInput-${clubId}`}
            type="file"
            accept="image/*"
            onChange={handleFaviconChange}
            disabled={faviconLoading}
          />
          <label htmlFor={`faviconInput-${clubId}`}>
            Favicon変更
            <FontAwesomeIcon icon={faUpload} />
          </label>
        </div>
        {favicon && <img src={favicon} alt="favicon" style={{ width: "40px", height: "40px", border: "1px solid #ddd" }} />}
        {faviconError && <p style={{ color: "red", marginLeft: "10px" }}>{faviconError}</p>}
      </div>
    </div>
  );
};

export default ClubSearchResultEditor;
