// ClubLineLinkUpdate.tsx
import React from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";

interface Props {
  clubId: number;
  initialLineLink?: string;
  onUpdated?: (newLineLink: string) => void;
}

const ClubLineLinkUpdate: React.FC<Props> = ({ clubId, initialLineLink, onUpdated }) => {
  const { value, setValue, loading, error, updateField } = useClubFieldUpdate(
    "line_url", // field name in your API
    clubId,
    initialLineLink
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateField(); // PATCH request handled by hook
      if (onUpdated) onUpdated(value);
    } catch (err) {
      // error state is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        LINE URL:
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://line.me/youraccount"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "更新中..." : "LINEリンク更新"}
      </button>
    </form>
  );
};

export default ClubLineLinkUpdate;
