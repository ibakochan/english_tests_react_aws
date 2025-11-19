// ClubFacebookUpdate.tsx
import React from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";

interface Props {
  clubId: number;
  initialFacebook?: string;
  onUpdated?: (newFacebook: string) => void;
}

const ClubFacebookUpdate: React.FC<Props> = ({ clubId, initialFacebook, onUpdated }) => {
  const { value, setValue, loading, error, updateField } = useClubFieldUpdate(
    "facebook_url", // field name in your API
    clubId,
    initialFacebook
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateField(); // calls PATCH automatically
      if (onUpdated) onUpdated(value);
    } catch (err) {
      // error is handled inside the hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Facebook URL:
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://facebook.com/yourpage"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "更新中..." : "Facebook更新"}
      </button>
    </form>
  );
};

export default ClubFacebookUpdate;
