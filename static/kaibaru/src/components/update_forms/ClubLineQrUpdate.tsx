// ClubLineQrUpdate.tsx
import React from "react";
import { useClubFileUpdate } from "../../hooks/useClubFileUpdate";

interface Props {
  clubId: number;
  onUpdated?: (newQrUrl: string) => void;
}

const ClubLineQrUpdate: React.FC<Props> = ({ clubId, onUpdated }) => {
  const { loading, error, updateFile } = useClubFileUpdate("line_qr_code", clubId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await updateFile(file);
      if (onUpdated && data.line_qr_code) {
        onUpdated(data.line_qr_code);
      }
    } catch (err) {
      // error is already handled in the hook
    }
  };

  return (
    <div>
      <label
        htmlFor="lineQrInput"
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
        QRコード変更
      </label>
      <input
        id="lineQrInput"
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

export default ClubLineQrUpdate;
