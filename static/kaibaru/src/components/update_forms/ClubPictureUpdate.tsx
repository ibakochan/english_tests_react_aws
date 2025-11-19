// ClubPictureUpdate.tsx
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { useClubFileUpdate } from "../../hooks/useClubFileUpdate";

interface Props {
  clubId: number;
  onUpdated?: (newPictureUrl: string) => void;
}

const ClubPictureUpdate: React.FC<Props> = ({ clubId, onUpdated }) => {
  const { loading, error, updateFile } = useClubFileUpdate("picture", clubId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await updateFile(file);
      if (onUpdated && data.picture) {
        onUpdated(data.picture);
      }
    } catch (err) {
      // error is handled by the hook
    }
  };

  return (
    <div>
      <div className="file-input-wrapper">
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
        <label htmlFor="fileInput">
          ページ写真変更
          <FontAwesomeIcon icon={faUpload} />
        </label>
      </div>
      {loading && <p>アップロード中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ClubPictureUpdate;
