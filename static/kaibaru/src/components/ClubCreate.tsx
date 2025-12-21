import React, { useState } from "react";
import { useCookies } from 'react-cookie';


interface ClubResponse {
  id: number;
  join_key: string;
  subdomain: string;
}

interface Props {
  onCreated?: (club: ClubResponse) => void; 
}

const ClubCreate: React.FC<Props> = ({ onCreated }) => {
  const [cookies] = useCookies(['csrftoken']);
  const [subdomain, setSubdomain] = useState("");
  const [joinKey, setJoinKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = (window as any).currentUser || null;

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain.trim() || !joinKey.trim()) {
      setError("すべての項目を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/clubs/create-trial/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookies.csrftoken,
        },
        body: JSON.stringify({ subdomain, join_key: joinKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.subdomain || "クラブの作成に失敗しました。";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // 作成成功 → サブドメインページへリダイレクト
      if (data.subdomain) {
        window.location.href = `https://${data.subdomain}.kaibaru.jp/join`;
      }

      if (onCreated) {
        onCreated(data);
      }

    } catch (err) {
      console.error(err);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>お試しマイページ作成</h2>
      <p style={{ fontSize: "14px", color: "#555", marginBottom: "15px" }}>
        あなた専用のホームページ兼会員管理システムを作成できます。<br />
        ページ名とサブドメインを入力してください。作成後、自動的にそのページに移動します。
      </p>
      {!currentUser ? (
        <>
          <p style={{ fontSize: "14px", color: "#555", marginBottom: "15px" }}>
            ページを作成するには、まずGoogleアカウントでログインしてください。
          </p>
          <a
            href="/account/google/login/"
            className="btn btn-light submit_buttons mb-2 d-flex align-items-center justify-content-center"
            style={{ marginLeft: "10px", border: "5px solid black" }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              style={{ width: '20px', height: '20px', marginRight: '10px' }}
            />
            <span>Googleでログイン</span>
          </a>
        </>
      ) : (
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "15px" }}>
          ログイン済みです。これであなただけのページを作成できます。
        </p>
      )}


      <label style={{ display: "block", marginBottom: "5px" }}>サブドメイン：</label>
      <input
        type="text"
        placeholder="例：piano, yoga"
        value={subdomain}
        onChange={(e) => setSubdomain(e.target.value)}
        required
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <label style={{ display: "block", marginBottom: "5px" }}>入会キー：</label>
      <input
        type="text"
        placeholder="入会キー入力"
        value={joinKey}
        onChange={(e) => setJoinKey(e.target.value)}
        required
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <p style={{ fontSize: "12px", color: "#777", marginBottom: "10px" }}>
        入会キーは、会員がクラブに参加する際に入力するパスワードのようなものです。<br/>
        これを設定しておくことで、知らない人が勝手に参加するのを防げます。
      </p>

      <p style={{ fontSize: "12px", color: "#777", marginTop: "-10px", marginBottom: "15px" }}>
        ※ページのURLは「https://(サブドメイン).kaibaru.jp」となります。
      </p>
      <p style={{ fontSize: "12px", color: "#777", marginTop: "-10px", marginBottom: "15px" }}>
        後から検索用の説明文を追加すれば、Googleなどで見つけられる自分専用のホームページとして活用できます。
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
        {loading ? "作成中..." : "お試しページを作成"}
      </button>
    </form>
  );
};

export default ClubCreate;
