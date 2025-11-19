import React from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";

interface Props {
  clubId: number;
  initialInstagram?: string;
  onUpdated?: (newInstagram: string) => void;
}

const ClubInstagramUpdate: React.FC<Props> = ({ clubId, initialInstagram, onUpdated }) => {
  const { value, setValue, loading, error, updateField  } = useClubFieldUpdate(
    "instagram_url", // <-- the field name in your API
    clubId,
    initialInstagram
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateField();  
      if (onUpdated) onUpdated(value);
    } catch (err) {
   
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      <label>
        Instagram URL:
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://instagram.com/yourpage"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "更新中..." : "Instagram更新"}
      </button>
    </form>
  );
};

export default ClubInstagramUpdate;