import React, { useState } from "react";
import { FaCreditCard, FaTimesCircle } from "react-icons/fa";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useCookies } from "react-cookie";

interface StripeProps {
  club: any;
  setClub?: React.Dispatch<React.SetStateAction<any>>;
}

const StripeCheckout: React.FC<StripeProps> = ({ club, setClub }) => {
  const [cookies] = useCookies(["csrftoken"]);

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [confirmSubdomain, setConfirmSubdomain] = useState("");
  const [confirmNyukaiKey, setConfirmNyukaiKey] = useState("");

  /* ---------------- Checkout ---------------- */

  const handleCheckout = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/create_checkout_session/${club.id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": cookies.csrftoken,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "決済の開始に失敗しました");
      }

      const stripe = (window as any).Stripe(
        (window as any).STRIPE_PUBLISHABLE_KEY
      );
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Unsubscribe (Hard delete) ---------------- */

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("subdomain", confirmSubdomain);
      formData.append("nyukai_key", confirmNyukaiKey);

      const res = await fetch(`/unsubscribe/${club.id}/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": cookies.csrftoken,
        },
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "解約に失敗しました");
      }

      setMessage("クラブを完全に削除しました。");
      setShowUnsubscribeModal(false);

      if (setClub) {
        setClub(null);
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = !!club.stripe_subscription_id;

  return (
    <>
      <div className="d-flex flex-column gap-3">
        {!isSubscribed && (
          <Button
            variant="success"
            onClick={handleCheckout}
            disabled={loading}
            className="d-flex align-items-center"
          >
            <FaCreditCard className="me-2" />
            支払い・サブスク登録
          </Button>
        )}

        {isSubscribed && (
          <Button
            variant="danger"
            onClick={() => setShowUnsubscribeModal(true)}
            disabled={loading}
            className="d-flex align-items-center"
          >
            <FaTimesCircle className="me-2" />
            サブスク解約（クラブ削除）
          </Button>
        )}

        {message && <Alert variant="info">{message}</Alert>}
      </div>

      {/* ================= Unsubscribe Modal ================= */}

      <Modal
        show={showUnsubscribeModal}
        onHide={() => setShowUnsubscribeModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            ⚠️ クラブを完全に削除します
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="danger">
            <strong>この操作は取り消せません。</strong>
            <br />
            サブスクリプションは解約され、クラブ・会員・データはすべて削除されます。
          </Alert>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                サブドメインを入力してください（<code>{club.subdomain}</code>）
              </Form.Label>
              <Form.Control
                value={confirmSubdomain}
                onChange={(e) => setConfirmSubdomain(e.target.value)}
                placeholder={club.subdomain}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>入会キー（Nyukai Key）</Form.Label>
              <Form.Control
                value={confirmNyukaiKey}
                onChange={(e) => setConfirmNyukaiKey(e.target.value)}
                placeholder="********"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUnsubscribeModal(false)}
            disabled={loading}
          >
            キャンセル
          </Button>

          <Button
            variant="danger"
            onClick={handleUnsubscribe}
            disabled={
              loading ||
              confirmSubdomain !== club.subdomain ||
              !confirmNyukaiKey
            }
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                削除中…
              </>
            ) : (
              "完全に削除する"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StripeCheckout;
