import React from "react";
import type { Club, Member } from "../types";

interface Props {
  club?: Club;
}

const Teacher: React.FC<Props> = ({ club }) => {
  if (!club) return null;

  // Filter instructors and owner
  const instructors = club.members
    .filter((m: Member) => m.is_instructor || m.user === club.owner)
    .sort((a: Member, b: Member) =>
      a.user === club.owner ? -1 : b.user === club.owner ? 1 : 0
    );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        justifyContent: "flex-start",
      }}
    >
      {instructors.length > 0 ? (
        instructors.map((instructor: Member) => {
          const isOwner = instructor.user === club.owner;

          return (
            <div
              key={instructor.id}
              style={{
                width: "220px",
                textAlign: "center",
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "15px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                background: isOwner ? "#fffbe6" : "#fff",
                borderColor: isOwner ? "#ffcc00" : "#ccc",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={instructor.picture}
                alt={instructor.full_name}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "2px solid black",
                }}
              />
              <div style={{ marginTop: "0.8rem", fontWeight: "bold", fontSize: "1rem" }}>
                名前：{instructor.full_name}
              </div>
              {isOwner && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#d48806",
                    marginBottom: "0.5rem",
                  }}
                >
                  代表
                </div>
              )}
              {instructor.introduction && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#555",
                    textAlign: "left",
                    whiteSpace: "pre-line",
                  }}
                >
                  {instructor.introduction.split("\n").map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p>インストラクターはまだ登録されていません</p>
      )}
    </div>
  );
};

export default Teacher;
