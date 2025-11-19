import React from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";

interface Props {
  clubId: number;
  initialSearchDescription?: string;
  onUpdated?: (newDescription: string) => void;
}

const ClubSearchUpdate: React.FC<Props> = ({ clubId, initialSearchDescription, onUpdated }) => {
  const { value, setValue, loading, error, updateField } = useClubFieldUpdate(
    "search_description", // field name in the API
    clubId,
    initialSearchDescription
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateField(); // PATCH request handled by hook
      if (onUpdated) onUpdated(value);
    } catch (err) {
      // error is already handled inside the hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        検索用説明:
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="このクラブの検索用説明を入力してください"
          style={{ width: "100%", margin: "10px 0", minHeight: "100px" }}
        />
      </label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "更新中..." : "説明を更新"}
      </button>
    </form>
  );
};

export default ClubSearchUpdate;
