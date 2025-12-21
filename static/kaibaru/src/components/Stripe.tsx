import React, { useState } from "react";
import { FaCreditCard, FaTimesCircle, FaRedo } from "react-icons/fa";

interface StripeProps {
  club: any; // include the whole club object
  setClub?: React.Dispatch<React.SetStateAction<any>>; // optional if you want to update parent
}

const StripeCheckout: React.FC<StripeProps> = ({ club, setClub }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/create_checkout_session/${club.id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.id) {
        const stripe = (window as any).Stripe((window as any).STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/unsubscribe/${club.id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Subscription canceled successfully.");
        if (setClub) {
          setClub((prev: any) => ({
            ...prev,
            stripe_subscription_id: null,
            subscription_active: false,
          }));
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/resubscribe/${club.id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.id) {
        const stripe = (window as any).Stripe((window as any).STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = !!club.stripe_subscription_id;
  const canResubscribe = !club.subscription_active && !club.stripe_subscription_id && !!club.stripe_customer_id;

  return (
    <div className="d-flex flex-column align-items-start gap-2">
      {!isSubscribed && !canResubscribe && (
        <button
          onClick={handleCheckout}
          className="btn btn-success d-flex align-items-center"
          disabled={loading}
        >
          <FaCreditCard style={{ marginRight: "8px" }} />
          支払い・サブスク登録
        </button>
      )}

      {isSubscribed && (
        <button
          onClick={handleUnsubscribe}
          className="btn btn-danger d-flex align-items-center"
          disabled={loading}
        >
          <FaTimesCircle style={{ marginRight: "8px" }} />
          サブスク解約
        </button>
      )}

      {canResubscribe && (
        <button
          onClick={handleResubscribe}
          className="btn btn-warning d-flex align-items-center"
          disabled={loading}
        >
          <FaRedo style={{ marginRight: "8px" }} />
          サブスク再登録
        </button>
      )}

      {message && (
        <div className="alert alert-info mt-2" role="alert">
          {message}
        </div>
      )}
    </div>
  );
};

export default StripeCheckout;
