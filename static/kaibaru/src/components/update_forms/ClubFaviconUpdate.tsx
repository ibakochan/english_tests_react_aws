// ClubFaviconUpdate.tsx
import React from "react";
import { useClubFileUpdate } from "../../hooks/useClubFileUpdate";

interface Props {
  clubId: number;
  onUpdated?: (newFaviconUrl: string) => void;
}

const ClubFaviconUpdate: React.FC<Props> = ({ clubId, onUpdated }) => {
  const { loading, error, updateFile } = useClubFileUpdate("favicon", clubId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await updateFile(file);
      if (onUpdated && data.favicon) {
        onUpdated(data.favicon);
      }
    } catch (err) {
      // error already handled in the hook
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <p style={{ fontStyle: "italic", color: "#555", marginBottom: "5px" }}>
        このファビコンはブラウザのタブやブックマークに表示されます。推奨サイズは48x48px以上です。
      </p>
      <label
        htmlFor="faviconInput"
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          borderRadius: "4px",
          cursor: "pointer",
          border: "2px solid black",
          width: "200px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ファビコン変更
      </label>
      <input
        id="faviconInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        style={{ display: "none" }}
      />
      {loading && <p>アップロード中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ClubFaviconUpdate;
