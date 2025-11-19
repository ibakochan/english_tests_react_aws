import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Modal, Button, Form } from "react-bootstrap";
import type { Member, Club } from "./types";




interface MemberResponse {
  id: number;
  level: number;
  full_name: string;
  picture: string;
  introduction?: string;
}

interface Props {
  club: Club;
  member?: Member | null;
  onCreated?: (member: MemberResponse) => void;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const MemberCreate: React.FC<Props> = ({ showModal, setShowModal, club, member, onCreated }) => {
  const [cookies] = useCookies(["csrftoken"]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency, setEmergency] = useState("");
  const [memberType, setMemberType] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [introduction, setIntroduction] = useState("");
  const [isInstructor, setIsInstructor] = useState(member?.is_instructor ?? false);
  const [level, setLevel] = useState(member?.level ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showIntroForm, setShowIntroForm] = useState(false);

  const currentMember = club?.members?.find(
      (m) => m.user === club?.current_user?.id
  );

  const editingOtherMember = member && member !== currentMember;


  const dismissable = currentMember && !(currentMember.is_instructor && !currentMember.introduction);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || "");
      setPhone(member.phone_number || "");
      setEmergency(member.emergency_number || "");
      setMemberType(member.member_type || "");
      setIntroduction(member.introduction || "");
      setIsInstructor(member.is_instructor ?? false);
    }
  }, [member]);

  useEffect(() => {
    if (!club || !club.current_user || !club.members) return;

    if (!currentMember) {
      setShowModal(true); // new member creation
    } else if (currentMember.is_instructor && !currentMember.introduction) {
      setShowModal(true);
      setShowIntroForm(true); // show only introduction update form
      setIntroduction("");
    }
  }, []);

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showIntroForm) {
      if (!introduction) {
        setError("自己紹介を入力してください。");
        return;
      }
    } else {
      if (!fullName || !phone || !emergency || !memberType || (!member && !picture)) {
        setError("すべての必須項目を入力してください。");
        return;
      }
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();

    if (showIntroForm) {
      formData.append("introduction", introduction);
    } else {
      formData.append("full_name", fullName);
      formData.append("phone_number", phone);
      formData.append("emergency_number", emergency);
      formData.append("member_type", memberType);
      if (picture) formData.append("picture", picture!);
      // Include introduction if user is owner
      if (club.current_user?.id === club.owner) {
        formData.append("introduction", introduction);
      }
      formData.append("club_subdomain", club.subdomain);
      if (editingOtherMember) {
        formData.append("level", String(level));
      }
      if (club.current_user?.id === club.owner) {
          formData.append("is_instructor", isInstructor ? "true" : "false");
      }
    }

    try {
        const url = member
            ? `/api/members/${member.id}/`
            : "/api/members/";
        const method = member ? "PATCH" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "X-CSRFToken": cookies.csrftoken },
            body: formData,
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            setError(JSON.stringify(data));
            setLoading(false);
            return;
        }

        onCreated?.(data);
        setShowModal(false);
        setFullName("");
        setPhone("");
        setEmergency("");
        setMemberType("");
        setPicture(null);
        setIntroduction("");
    } catch (err) {
        console.error(err);
        setError("エラーが発生しました。もう一度お試しください。");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal show={showModal} backdrop={dismissable ? true : "static"} keyboard={dismissable} centered onHide={() => dismissable && setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>
          {showIntroForm ? "自己紹介を入力" : "会員情報の登録"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleMemberSubmit}>
          {!showIntroForm && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>名前</Form.Label>
                <Form.Control
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>電話番号</Form.Label>
                <Form.Control
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>緊急連絡先</Form.Label>
                <Form.Control
                  type="text"
                  value={emergency}
                  onChange={(e) => setEmergency(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>会員タイプ</Form.Label>
                <Form.Control
                  type="text"
                  value={memberType}
                  onChange={(e) => setMemberType(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>写真</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    setPicture(target.files ? target.files[0] : null);
                  }}
                  required={!member}
                />
              </Form.Group>
            </>
          )}

          {editingOtherMember && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>レベル</Form.Label>
                <Form.Control
                  type="number"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  required
                />
              </Form.Group>

              {club.current_user?.id === club.owner && (
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="インストラクター"
                    checked={isInstructor}
                    onChange={(e) => setIsInstructor(e.target.checked)}
                  />
                </Form.Group>
              )}
            </>
          )}


          {(showIntroForm || (club?.current_user?.id === club?.owner && (!editingOtherMember || member.is_instructor))) && (
            <Form.Group className="mb-3">
              <Form.Label>自己紹介</Form.Label>
              <Form.Control
                as="textarea"
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                required
              />
            </Form.Group>
          )}

          {error && <p className="text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-100">
            {loading
              ? "登録中..."
              : showIntroForm
              ? "更新"
              : "登録"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MemberCreate;
