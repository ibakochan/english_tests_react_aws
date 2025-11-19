// ClubTitleUpdate.tsx
import React from "react";
import { useClubFieldUpdate } from "../../hooks/useClubFieldUpdate";

interface Props {
  clubId: number;
  initialTitle?: string;
  onUpdated?: (newTitle: string) => void;
}

const ClubTitleUpdate: React.FC<Props> = ({ clubId, initialTitle, onUpdated }) => {
  const { value, setValue, loading, error, updateField } = useClubFieldUpdate(
    "title", // field name in your API
    clubId,
    initialTitle
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateField();
      if (onUpdated) onUpdated(value);
    } catch (err) {
      // error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <label>
        ページタイトル:
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例: 威張る英語 - 小中学生向け英語学習"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>
      {/* Professional brief explanation in Japanese */}
      <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: "10px" }}>
        このタイトルは検索結果やブラウザのタブに表示される、クラブページの正式なページタイトルです。<br />
        適切なタイトルを設定することで、SEOやクリック率の向上に役立ちます。
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "更新中..." : "タイトル更新"}
      </button>
    </form>
  );
};

export default ClubTitleUpdate;
