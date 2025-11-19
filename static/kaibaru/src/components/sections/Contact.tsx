// Contact.tsx
import React from "react";
import ClubLineQrUpdate from "../update_forms/ClubLineQrUpdate";
import ClubLineLinkUpdate from "../update_forms/ClubLineLinkUpdate";
import type { Club } from "../types";
import Editable from "./Editable";

interface Props {
  club?: Club;
  owner?: boolean;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  scale: number;
}

const Contact: React.FC<Props> = ({ club, owner, setClub, scale }) => {
  return (
    <div className="home-content-container">
      <Editable
        club={club}
        owner={owner}
        setClub={setClub}
        scale={scale}
        category="contact"
        rawData={club?.contact}
        placeholder={
          <div style={{ marginBottom: "20px", color: "#555", fontSize: "14px" }}>
            <div>ここには、連絡先情報をご記入いただけます。</div>
            <p></p>
            <div>通常のワード文書のように、段落ごとに文章を作成できます。</div>
          </div>
        }
      />

      {/* QR + Link section container (left aligned) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          marginTop: "20px",
          gap: "20px",
        }}
      >
        {/* LINE QR section */}
        {(club?.line_qr_code || owner) && (
          <div
            style={{
              flex: "0 0 200px",
              backgroundColor: "#f9f9f9",
              padding: "15px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center",
            }}
          >
            <h5 style={{ marginBottom: "10px", color: "#333", fontSize: "16px" }}>
              LINE 公式アカウント
            </h5>

            <div style={{ position: "relative", display: "inline-block", marginBottom: "12px" }}>
              <img
                src={club?.line_qr_code || "https://storage.googleapis.com/ibaru_repair/qrcode.jpg"}
                alt="LINE QR Code"
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  objectFit: "cover",
                }}
              />
              {!club?.line_qr_code && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "red",
                    fontWeight: "bold",
                    fontSize: 14,
                    backgroundColor: "rgba(255,255,255,0.6)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  これは例です
                </div>
              )}
            </div>

            {club && owner && (
              <ClubLineQrUpdate
                clubId={club.id}
                onUpdated={(newQrUrl) => setClub({ ...club, line_qr_code: newQrUrl })}
              />
            )}
          </div>
        )}

        {/* LINE Link section */}
        {(club?.line_url || owner) && (
          <div
            style={{
              flex: "0 0 200px",
              backgroundColor: "#f9f9f9",
              padding: "15px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center",
            }}
          >
            <h5 style={{ marginBottom: "10px", color: "#333", fontSize: "16px" }}>
              LINE 公式アカウント
            </h5>

            <div style={{ marginBottom: "12px" }}>
              <a
                href={club?.line_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  backgroundColor: "#06C755",
                  color: "white",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#04a848")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#06C755")}
              >
                LINEで友だち追加
              </a>
            </div>

            {club && owner && (
              <ClubLineLinkUpdate
                clubId={club.id}
                initialLineLink={club.line_url}
                onUpdated={(updatedLineLink: string) =>
                  setClub((prev: any) => ({ ...prev, line_url: updatedLineLink }))
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
