import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { Form, Button } from "react-bootstrap";
import type { Club, Member } from "../types";

interface Props {
  club: Club;
  currentUser: any | null; // Google logged-in user
  currentMember: Member | null; // existing member or null
  onCreated?: (member: Member) => void; // callback to dynamically update club
}

const Join: React.FC<Props> = ({ club, currentUser, currentMember, onCreated }) => {
  const [cookies] = useCookies(["csrftoken"]);
  const [phone, setPhone] = useState("");
  const [emergency, setEmergency] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [joinKey, setJoinKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastFurigana, setLastFurigana] = useState("");
  const [firstFurigana, setFirstFurigana] = useState("");



  const currentUrl = window.location.href;

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(firstName || lastName) || !(lastFurigana || firstFurigana) || !phone || !emergency || !picture || !joinKey) {
      setError("すべての必須項目を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("full_name", `${lastName} ${firstName}`.trim());
      formData.append("furigana", `${lastFurigana} ${firstFurigana}`.trim());
      formData.append("phone_number", phone);
      formData.append("emergency_number", emergency);
      formData.append("picture", picture!);
      formData.append("join_key", joinKey);
      formData.append("club_subdomain", club.subdomain);

      const response = await fetch("/api/members/", {
        method: "POST",
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

      // dynamically update club
      onCreated?.(data);

      // reset form
      setPhone("");
      setEmergency("");
      setPicture(null);
      setJoinKey("");
    } catch (err) {
      console.error(err);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    // Not logged in → show Google login
    return (
      <div
        className="text-center mt-6"
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontWeight: 600 }}>会員になるにはログインしてください</h2>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5", marginBottom: "30px" }}>
          あなたはまだログインまたは会員登録をしていません。<br />
          会員になるには、まず下のGoogleログインで認証してください。<br />
          認証後、入会キーを使って会員登録フォームを入力できます。
        </p>
        <a
          href={`https://kaibaru.jp/start_google_login/?next=${encodeURIComponent(currentUrl)}`}
          className="d-inline-flex align-items-center justify-content-center"
          style={{
            padding: "12px 20px",
            backgroundColor: "#fff",
            border: "2px solid #4285F4",
            borderRadius: "6px",
            textDecoration: "none",
            color: "#4285F4",
            fontWeight: 500,
            fontSize: "16px",
            transition: "all 0.2s",
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            style={{ width: "24px", height: "24px", marginRight: "12px" }}
          />
          <span>Googleでログイン</span>
        </a>
      </div>
    );
  }

  if (currentUser && !currentMember) {
    // Logged in but not a member → show member creation form
    return (
      <div className="text-center mt-6" style={{ maxWidth: "600px", margin: "50px auto" }}>
        <h2 style={{ marginBottom: "20px", fontWeight: 600 }}>会員登録フォーム</h2>
        <Form onSubmit={handleMemberSubmit}>
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
            <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>緊急連絡先</Form.Label>
            <Form.Control type="text" value={emergency} onChange={(e) => setEmergency(e.target.value)} required />
          </Form.Group>



          <Form.Group className="mb-3">
            <Form.Label>写真</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                setPicture(target.files ? target.files[0] : null);
              }}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>入会キー</Form.Label>
            <Form.Control type="text" value={joinKey} onChange={(e) => setJoinKey(e.target.value)} required />
            <Form.Text className="text-muted">入会キーはクラブオーナーから取得してください。</Form.Text>
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-100">
            {loading ? "登録中..." : "会員登録"}
          </Button>
        </Form>
      </div>
    );
  }

  // Logged in and already a member
  return (
    <div className="text-center mt-6">
      <p style={{ fontSize: "16px", color: "#555" }}>あなたはすでに会員です。</p>
    </div>
  );
};

export default Join;
