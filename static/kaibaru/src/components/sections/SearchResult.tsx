import React from "react";

interface Props {
  title?: string;
  favicon?: string;
  description?: string;
  subdomain: string;
}

const SearchResult: React.FC<Props> = ({ title, favicon, description, subdomain }) => {
  const displayTitle = title || "クラブタイトル未設定";
  const displayDescription = description || "検索用説明がここに表示されます。";
  const displayUrl = `https://${subdomain}.eibaru.jp`;

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
        {favicon && (
          <img
            src={favicon}
            alt="favicon"
            style={{ width: "16px", height: "16px", marginRight: "8px" }}
          />
        )}
        <h3 style={{ margin: 0, fontSize: "16px", color: "#1a0dab" }}>{displayTitle}</h3>
      </div>
      <p style={{ fontSize: "14px", color: "#006621", margin: "2px 0" }}>{displayUrl}</p>
      <p style={{ fontSize: "14px", color: "#545454", marginTop: "5px" }}>{displayDescription}</p>
    </div>
  );
};

export default SearchResult;
