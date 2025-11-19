import React from 'react';
import { Helmet } from 'react-helmet';

const btnStyle = {
  width: '200px',
  height: '40px',
  fontWeight: 500,
  textDecoration: 'none',
};

const Login = () => {
  return (
    <div>
      <Helmet>
        <title>威張る英語</title>
        <meta name="description" content="小中学生向けの英語と英検練習サイト。英検5級〜3級、フォニックス、数字、英語の基礎を楽しく学べます！"/>
      </Helmet>
      <div>登録してないかログインしていない</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href="https://eibaru.jp/accounts/signup/"
          className="btn btn-success submit_buttons mb-2"
          style={{ marginLeft: "10px", border: "5px solid black" }}
          rel="noopener noreferrer"
        >
          登録
        </a>

        <a
          href="https://eibaru.jp/accounts/login"
          className="btn btn-primary submit_buttons mb-2"
          style={{ marginLeft: "10px", border: "5px solid black" }}
          rel="noopener noreferrer"
        >
          ログイン
        </a>
        <a
          href={'/account/google/login/'}
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
      </div>
      <div className="mt-3">ログインしたら点数記録できるよ</div>
    </div>
  );
};

export default Login;
