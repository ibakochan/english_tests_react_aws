import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Modal, Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import type { Member, Club } from "./types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons";

import { safeParseJSON } from "../utils/safeParseJSON";
import 'bootstrap-icons/font/bootstrap-icons.css';



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
  owner?: boolean; 
  manager?: boolean;
  perspective?: string;
}

const MemberCreate: React.FC<Props> = ({ perspective, owner, manager, showModal, setShowModal, club, member, onCreated }) => {
  const [cookies] = useCookies(["csrftoken"]);
  const [phone, setPhone] = useState("");
  const [emergency, setEmergency] = useState("");
  const [memberType, setMemberType] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [introduction, setIntroduction] = useState("");
  const [isInstructor, setIsInstructor] = useState(member?.is_instructor ?? false);
  const [isManager, setIsManager] = useState(member?.is_manager ?? false);
  const [level, setLevel] = useState(member?.level ?? 0);
  const [joinKey, setJoinKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showIntroForm, setShowIntroForm] = useState(false);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastFurigana, setLastFurigana] = useState("");
  const [firstFurigana, setFirstFurigana] = useState("");

  const [manualTotalCount, setManualTotalCount] = useState<number>(0);
  const [participationLimit, setParticipationLimit] = useState<number | null>(
    member?.participation_limit ?? null
  );

 


 




  const [manualLevelCounts, setManualLevelCounts] = useState<Record<number, number>>(
    member?.manual_level_counts || {}
  );

  const sumOfLevelCounts = Object.values(manualLevelCounts).reduce(
    (a, b) => a + b,
    0
  );

  const levelNames = safeParseJSON(club?.level_names);
  const getLevelLabel = (lvl: number) => levelNames[lvl] ? levelNames[lvl] : `レベル ${lvl}`;

  const currentMember = club?.members?.find(
      (m) => m.user === club?.current_user?.id
  );

  const editingOtherMember = member && member !== currentMember;


  const dismissable = (currentMember || !(club?.owner === club?.current_user?.id)) && !(currentMember?.is_instructor && !currentMember?.introduction);
  
  const [newLevel, setNewLevel] = useState("");
  const [newCount, setNewCount] = useState("");

  useEffect(() => {
    if (manualTotalCount < sumOfLevelCounts) {
      setManualTotalCount(sumOfLevelCounts);
    }
  }, [sumOfLevelCounts]);

  const handleAddRecord = () => {
    const levelNum = Number(newLevel);
    const countNum = Number(newCount) || 0;
   
    if (!newLevel || isNaN(levelNum) || levelNum < 1) return;
  
    setManualLevelCounts((prev) => ({
      ...prev,
      [levelNum]: countNum, // replace if level exists
    }));
  
    setNewLevel("");
    setNewCount("");
  };
  
  // Add type for lvl parameter
  const handleDelete = (lvl: string) => {
    const lvlNum = Number(lvl);
    const newCounts = { ...manualLevelCounts };
    delete newCounts[lvlNum];
    setManualLevelCounts(newCounts);
  };

  
  useEffect(() => {
    if (member) {
      const nameParts = member.full_name?.split(" ") || [];
      setLastName(nameParts[0] || "");
      setFirstName(nameParts[1] || "");
    
      const furiganaParts = member.furigana?.split(" ") || [];
      setLastFurigana(furiganaParts[0] || "");
      setFirstFurigana(furiganaParts[1] || "");

      setPhone(member.phone_number || "");
      setEmergency(member.emergency_number || "");
      setMemberType(member.member_type || "");
      setLevel(member.level || 1);
      setParticipationLimit(member.participation_limit ?? null);
      setIntroduction(member.introduction || "");
      setIsInstructor(member.is_instructor ?? false);
      setIsManager(member.is_manager ?? false);
    }
  }, [member]);

  useEffect(() => {
    if (currentMember?.is_instructor && (!currentMember?.introduction || currentMember?.introduction === "")) {
      setShowModal(true);
      setShowIntroForm(true); // show only introduction update form
      setIntroduction("");
    }
  }, [club]);

  useEffect(() => {
    if (member) {
      setManualTotalCount(member.manual_total_participation || 0);
      setManualLevelCounts(member.manual_level_counts || {});
    }
  }, [member]);


  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showIntroForm) {
      if (!introduction) {
        setError("自己紹介を入力してください。");
        return;
      }
    } else {
      if (!phone || !emergency || (!member && !picture)) {
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
      formData.append("full_name", `${lastName} ${firstName}`.trim());
      formData.append("furigana", `${lastFurigana} ${firstFurigana}`.trim());

      formData.append("phone_number", phone);
      formData.append("emergency_number", emergency);
      formData.append("member_type", memberType);
      if (picture) formData.append("picture", picture!);
      // Include introduction if user is owner
      if (club.current_user?.id === club.owner) {
        formData.append("introduction", introduction);
      }
      formData.append("club_subdomain", club.subdomain);
      if (!currentMember) {
        formData.append("join_key", joinKey);
      }

      if (editingOtherMember) {
        formData.append("level", String(level));
      }
      if (editingOtherMember && (manager || owner)) {
        formData.append("manual_total_participation", String(manualTotalCount));
        formData.append("manual_level_counts", JSON.stringify(manualLevelCounts));
        if (participationLimit !== null) {
          formData.append("participation_limit", String(participationLimit));
        } else {
          formData.append("participation_limit", "");
        }

      }
      if (club.current_user?.id === club.owner) {
          formData.append("is_instructor", isInstructor ? "true" : "false");
          formData.append("is_manager", isManager ? "true" : "false");
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
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="苗字"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                  <Form.Control
                    type="text"
                    placeholder="名前"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>フリガナ</Form.Label>
                <div className="d-flex gap-2">
                <Form.Control
                    type="text"
                    placeholder="ミョウジ"
                    value={lastFurigana}
                    onChange={(e) => setLastFurigana(e.target.value)}
                    required
                  />
                  <Form.Control
                    type="text"
                    placeholder="ナマエ"
                    value={firstFurigana}
                    onChange={(e) => setFirstFurigana(e.target.value)}
                    required
                  />
                </div>
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
                <Form.Label>
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id="memberType-tooltip">
                        ここには「通常」「月8回」など、クラブ独自の会員タイプを入力できます。特に指定がない場合は空欄でも大丈夫です。
                      </Tooltip>
                    }
                  >
                    <span className="info-bubble">?</span>
                  </OverlayTrigger>
                  会員種類
                
                </Form.Label>
                <Form.Control
                  type="text"
                  value={memberType}
                  onChange={(e) => setMemberType(e.target.value)}
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
              
              {(!currentMember) &&
              <Form.Group className="mb-3">
                <Form.Label>入会キー</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="クラブ参加のパスワード"
                  value={joinKey}
                  onChange={(e) => setJoinKey(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  入会キーは、クラブに参加するために必要です。間違えると登録できません。
                </Form.Text>
              </Form.Group>
              }
            </>
          )}

          {editingOtherMember && (
            <>
              {club.has_levels &&
              <Form.Group className="mb-3">
                <Form.Label>レベル</Form.Label>
                <Form.Control
                  type="number"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  required
                />
              </Form.Group>
              }
              {club.has_attendance &&
              <>
              <Form.Group className="mb-3">
                <Form.Label>
                  月ごとの出席数制限
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id="participationLimit-tooltip">
                        ここで月ごとの出席上限を設定できます。例えば「8」と設定すると、先生がこのメンバーの出席を8回以上取ろうとした場合、警告が表示されます。それでも出席させるか選択できます。
                      </Tooltip>
                    }
                  >
                    <span className="info-bubble">?</span>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="なし"
                  value={participationLimit !== null ? participationLimit : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setParticipationLimit(null); // blank → no limit
                    } else {
                      const num = Number(val);
                      if (!isNaN(num)) setParticipationLimit(num);
                    }
                  }}
                 />
              </Form.Group>


              <Form.Group className="mb-3">
                <Form.Label>
                  手動トータル参加数を足す
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id="manualTotal-tooltip">
                        ここに過去の出席記録など、手動で追加したい参加回数を入力できます。通常のレッスンから得られる出席数に追加されます。
                      </Tooltip>
                    }
                  >
                    <span className="info-bubble">?</span>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={manualTotalCount}
                  min={sumOfLevelCounts}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val < sumOfLevelCounts) val = sumOfLevelCounts;
                    setManualTotalCount(val);
                  }}
                />
              </Form.Group>
              </>
              }
                  {club.has_levels && club.has_attendance &&
                  <Form.Group className="mb-3">

                    <Form.Label>
                      手動でレベル参加数を足す
                      <OverlayTrigger
                        placement="right"
                        overlay={
                          <Tooltip id="manualLevel-tooltip">
                            各レベルごとに手動で追加出席数を設定できます。手動トータルカウントが未入力の場合でも、自動で合計が反映されます。
                          </Tooltip>
                        }
                      >
                        <span className="info-bubble">?</span>
                      </OverlayTrigger>
                    </Form.Label>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Form.Control
                        type="number"
                        placeholder="レベル"
                        min={1}
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value)}
                      />
                      <Form.Control
                        type="number"
                        placeholder="参加数"
                        min={0}
                        value={newCount}
                        onChange={(e) => setNewCount(e.target.value)}
                      />
                      <Button variant="success" onClick={handleAddRecord}>
                        <FontAwesomeIcon icon={faSave} />
                      </Button>
                    </div>

                    {Object.entries(manualLevelCounts).map(([lvl, count]) => (
                      <div key={lvl} className="d-flex align-items-center mb-2 gap-2">
                        <Form.Control type="text" value={`${getLevelLabel(Number(lvl))} : ${count}`} readOnly />
                        <Button variant="danger" onClick={() => handleDelete(lvl)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    ))}
               
                  </Form.Group>
                  }
              
                  {(club.current_user?.id === club.owner || manager) &&
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Form.Check
                      type="checkbox"
                      id="instructor-checkbox"
                      label="インストラクター"
                      checked={isInstructor}
                      onChange={(e) => setIsInstructor(e.target.checked)}
                    />
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip id="instructor-tooltip">
                          このメンバーはインストラクターになります。出席を管理したり、レッスンを担当できます。
                        </Tooltip>
                      }
                    >
                      <span className="info-bubble">?</span>
                    </OverlayTrigger>
                  </div>
                  }
                  {club.current_user?.id === club.owner &&
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Form.Check
                      type="checkbox"
                      id="manager-checkbox"
                      label="管理人"
                      checked={isManager}
                      onChange={(e) => setIsManager(e.target.checked)}
                    />
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip id="manager-tooltip">
                          このメンバーは管理人になります。管理人はオーナーと同じ権限を持ちますが、他のメンバーを管理人にすることはできません。
                        </Tooltip>
                      }
                    >
                      <span className="info-bubble">?</span>
                    </OverlayTrigger>
                  </div>
                  }
            </>
          )}


          {(showIntroForm || (club?.current_user?.id === club?.owner && (!editingOtherMember || member.is_instructor))) && (
            <Form.Group className="mb-3">
              <Form.Label>自己紹介</Form.Label>
              <Form.Control
                as="textarea"
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                required={(!editingOtherMember && member?.is_instructor)}
              />
            </Form.Group>
          )}

          {error && <p className="text-danger">{error}</p>}

          <Button
            type={perspective !== "non_member" ? "submit" : undefined}
            disabled={loading || perspective === "non_member"}
            className="w-100"
          >
            {perspective === "non_member"
              ? "二回は登録できない"
              : loading
              ? member
                ? "更新中..."
                : "登録中..."
              : showIntroForm
              ? "更新"
              : member
              ? member.id === currentMember?.id
                ? "自分を更新"
                : "会員を更新"
              : "登録"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MemberCreate;
