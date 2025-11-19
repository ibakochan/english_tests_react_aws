import React from "react";
import { useClubFileUpdate } from "../../hooks/useClubFileUpdate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface Props {
  clubId: number;
  onUpdated?: (newOgImageUrl: string) => void;
}

const ClubOgImageUpdate: React.FC<Props> = ({ clubId, onUpdated }) => {
  const { loading, error, updateFile } = useClubFileUpdate("og_image", clubId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await updateFile(file);
      if (onUpdated && data.og_image) {
        onUpdated(data.og_image);
      }
    } catch (err) {
      // error is already handled in the hook
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <p style={{ fontStyle: "italic", color: "#555", marginBottom: "5px" }}>
        このOG画像はSNSでリンクを共有した際に表示される画像です。推奨サイズは1200x630pxです。
      </p>
      <div className="file-input-wrapper">
        <input
          id={`ogImageInput-${clubId}`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
        <label htmlFor={`ogImageInput-${clubId}`}>
          OG画像変更
          <FontAwesomeIcon icon={faUpload} />
        </label>
      </div>
      {loading && <p>アップロード中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ClubOgImageUpdate;
