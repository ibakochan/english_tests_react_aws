import React, { useState } from "react";
import type { Member, Club } from "../types";
import { safeParseJSON } from "../../utils/safeParseJSON";
import { Modal, Button } from "react-bootstrap";
import { MemberActionModal } from "../../utils/Modals";
import { FaUserMinus, FaPauseCircle } from "react-icons/fa";



interface Props {
  club: Club;
  members: Member[];
  selectedMember: Member | null;
  setSelectedMember: React.Dispatch<React.SetStateAction<Member | null>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setClub: React.Dispatch<React.SetStateAction<any>>;
}




const MemberManagement: React.FC<Props> = ({ setClub, club, members, selectedMember, setSelectedMember, setShowModal }) => {
  if (!members || members.length === 0) return null;

  const levelNames = safeParseJSON(club.level_names); 
  const getLevelLabel = (lvl: number) => levelNames[lvl] ? levelNames[lvl] : `レベル ${lvl}`;
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const selectedMemberFromClub = selectedMember
    ? club.members.find((m) => m.id === selectedMember.id) || selectedMember
    : null;


  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: "10px" }}>
      {members.map((member: Member) => (
        <div
          key={member.full_name}
          style={{
            flex: "0 1 120px",
            textAlign: "center",
            cursor: "pointer",
            transition: "transform 0.2s ease",
            backgroundColor: "#f9f9f9",
            borderRadius: "12px",
            padding: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
          onClick={() => setSelectedMember(member)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src={member.picture}
            alt={member.full_name}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              border: "2px solid #ccc",
              borderRadius: "8px",
            }}
          />
          <div style={{ marginTop: "0.5rem", fontWeight: "600", fontSize: "0.95rem" }}>
            {member.full_name}
          </div>
          {club.has_attendance &&
          <div style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "#333" }}>
            トータル：{member.total_participation ?? 0}<br />
            今月：{member.this_month_participation ?? 0}<br />
            { club.has_levels && (() => {
              const level = member.level;
              const levelName = getLevelLabel(level);
              const label = levelName && levelName.trim() !== "" ? levelName : `レベル${level}`;
              const count = member.level_participation?.[level] ?? 0;

              return `${label}：${count}`;
            })()}
          </div>
          }
        </div>
      ))}
      {!club?.frozen &&
      <>
      <Modal show={!!selectedMember} onHide={() => setSelectedMember(null)} centered>
            <Modal.Header closeButton>
              <Modal.Title>{selectedMemberFromClub?.full_name}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: "center" }}>
              <img
                src={selectedMemberFromClub?.picture}
                alt={selectedMemberFromClub?.full_name}
                className="modal-member-img"
                />
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="member-edit-button"
              >
                ✎
              </button>
              {!selectedMemberFromClub?.is_kyukai ? (
              <div style={{ marginTop: "1rem", textAlign: "left" }}>
                {selectedMemberFromClub?.member_type && <p><strong>会員種類:</strong> {selectedMemberFromClub.member_type}</p>}
                {selectedMemberFromClub?.introduction && <p><strong>自己紹介:</strong> {selectedMemberFromClub.introduction}</p>}
                {selectedMemberFromClub?.phone_number && <p><strong>電話番号:</strong> {selectedMemberFromClub.phone_number}</p>}
                {selectedMemberFromClub?.emergency_number && <p><strong>緊急連絡先:</strong> {selectedMemberFromClub.emergency_number}</p>}
                {selectedMemberFromClub?.other_information && <p><strong>その他情報:</strong> {selectedMemberFromClub.other_information}</p>}
                {selectedMemberFromClub?.level && club.has_levels && <p><strong>レベル:</strong> {getLevelLabel(selectedMemberFromClub.level)}</p>}
              </div>
              ) : (
                <div style={{ marginTop: "1rem", textAlign: "left" }}>
                  <p>
                   {selectedMemberFromClub?.kyukai_since} から休会
                  </p>
                  {!selectedMemberFromClub?.is_kyukai_paid && (
                    <p style={{ color: "red" }}>
                      このメンバーは休会後の最後の 100 円分の支払いがまだ行われていないため、次回のお支払いに 100 円 が含まれます。
                    </p>
                  )}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              {selectedMemberFromClub && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setModalOpen(true);
                    }}
                    className="text-orange-500 flex items-center"
                  >
                    <FaPauseCircle size={20} style={{ marginRight: "4px" }} />
                    休会か
                    <FaUserMinus size={20} style={{ margin: "0 4px" }} />
                    削除
                  </button>
      
                </div>
              )}
              <Button variant="secondary" onClick={() => setSelectedMember(null)}>Close</Button>
            </Modal.Footer>
    </Modal>
    {selectedMemberFromClub && (
    <MemberActionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActionType(null);
        }}
        member={selectedMemberFromClub}          // pass the full member object
        setClub={setClub}         // state setter for the club
        actionType={actionType}
        setActionType={setActionType}
    />
    )}
    </>
    }
    </div>
  );
};

export default MemberManagement;
