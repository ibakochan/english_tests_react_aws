import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import type { Member, Club } from "../components/types";

import { X, UserMinus, PauseCircle } from "lucide-react";
import { useCookies } from "react-cookie";


interface MemberActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  actionType: string | null;
  setActionType: React.Dispatch<React.SetStateAction<string | null>>;
}



export const MemberActionModal: React.FC<MemberActionModalProps> = ({
  isOpen,
  onClose,
  member,
  setClub,
  actionType,
  setActionType,
}) => {
  const [cookies] = useCookies(["csrftoken"]);
  const [loading, setLoading] = useState(false);
 

  const handleAction = async () => {
    if (actionType === null) return;
    setLoading(true);

    try {
      if (actionType === "kyukai") {
        const res = await fetch(`/api/members/${member.id}/freeze/`, {
          method: "POST",
          headers: { "X-CSRFToken": cookies.csrftoken },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "操作に失敗しました");

        setClub((prev: Club) => {
          const updatedMembers = prev.members.map((m: Member) =>
            m.id === member.id
              ? { ...m, is_kyukai: data.is_kyukai, kyukai_since: data.kyukai_since, is_kyukai_paid: data.is_kyukai_paid }
              : m
          );
          return {
            ...prev,
            members: updatedMembers,
          };
        });
      } else if (actionType === "delete") {
        const res = await fetch(`/api/members/${member.id}/remove/`, {
          method: "DELETE",
          headers: { "X-CSRFToken": cookies.csrftoken },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "削除に失敗しました");

        setClub((prev: Club) => {
          const updatedMembers = prev.members.filter((m: Member) => m.id !== member.id);
          return {
            ...prev,
            members: updatedMembers,
          };
        });
      }

      setActionType(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header>
        <Modal.Title>メンバー操作: {member.full_name}</Modal.Title>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </Modal.Header>

      <Modal.Body>
        <p>以下の操作を行いますか？</p>
        <ul>
          <li>休会 (Kyūkai): 名前と写真以外の情報は編集・閲覧できなくなります。</li>
          <li>削除: メンバー情報は永久に削除されます。削除後は復元できません。</li>
          {!actionType && <li>休会や削除を押してから実行を押さない限り実行しません</li>}
        </ul>

        {actionType === "kyukai" && (
          <p className="text-sm text-gray-600">
            {member?.is_kyukai ? (
                member.is_kyukai_paid ? (
                  "休会を解除すると、メンバーはアクティブに戻ります。また毎月の料金にその分１００円増えます。"
                ) : (
                  "このメンバーは休会後の最後の100円分の支払いがまだ行われていないため、休会を解除しても次回のお支払い金額は変わりません。"
                )
              ) : (
                "※ このメンバーを休会にしても、次回のお支払いには 100円 が含まれます。その後のお支払いでは、メンバーの休会を解除しない限り、料金には含まれません。"
            )}
          </p>
        )}
        {actionType === "delete" && (
          <p className="text-sm text-gray-600">
            ※ このメンバーを削除したら、今後のお支払いには 100円 が含まれません。  
          </p>
        )}

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>

          <Button
            variant="warning"
            className="d-flex align-items-center"
            onClick={() => setActionType("kyukai")}
          >
            <PauseCircle size={18} className="me-2" />
            {member?.is_kyukai
              ? "休会を解除する"
              : "休会にする"}
          </Button>

          <Button
            variant="danger"
            className="d-flex align-items-center"
            onClick={() => setActionType("delete")}
          >
            <UserMinus size={18} className="me-2" /> 削除
          </Button>
        </div>

        {actionType !== null && (
          <div className="mt-3 d-flex justify-content-end">
            <Button
              variant={actionType === "kyukai" ? "warning" : "danger"}
              onClick={handleAction}
              disabled={loading}
            >
              実行
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};




interface PaymentModalProps {
  club?: Club;
}

export function PaymentModal({ club }: PaymentModalProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      const amount = params.get("amount");
      const type = params.get("type");

      if (type === "prorated") {
        setMessage(`Prorated payment successful! You paid ¥${amount}.`);
      } else {
        setMessage("Payment successful!");
      }
      setShowPaymentModal(true);
    }

    if (paymentStatus === "cancel") {
      setMessage("Payment was canceled. No charges were made.");
      setShowPaymentModal(true);
    }

    if (club?.warning_message) {
      setMessage(club.warning_message);
      setShowPaymentModal(true);
    }

    if (paymentStatus) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [club]);

  return (
    <Modal
      show={showPaymentModal}
      onHide={() => setShowPaymentModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>お知らせ</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => setShowPaymentModal(false)}>
          閉じる
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
