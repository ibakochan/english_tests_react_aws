Eibaru & Kaibaru Projects

This repository contains two web applications built and maintained by me: Kaibaru and Eibaru.
Both projects are integrated under the same backend infrastructure but serve distinct purposes.

Kaibaru.jp — Website Builder & Membership Platform
Overview:
Kaibaru is a work-in-progress platform built with Django, React, and TypeScript.
It allows users to create custom websites with dedicated subdomains using a simplified, Wix-like page builder.
The platform also includes an integrated membership system.

Key Features:
Customizable websites with a JSON-driven page structure.
Predefined templates for fast website creation.
Membership management, attendance tracking, and member progress monitoring.
Subscription-based payments via Stripe.
Ongoing development for richer content embedding and flexible site structure.
Centralized login via Kaibaru for kaibaru subdomains, including Google OAuth.

Deployment Notes:
Kaibaru uses Route53 to provide automatically updated wildcard SSL certificates for subdomains.
The frontend build is run locally due to memory limitations on the Lightsail instance.
Deployment is done via a local command that runs build, rsync, collectstatic, and restarts Daphne.
Frontend repository is private on GitHub but can be shared with employers on request.


Tech Stack:
Python, TypeScript, HTML, CSS, Django, React, Daphne, Redis, Celery, django-hosts, AWS Lightsail, Google Cloud Storage, Google OAuth, AWS RDS (MySQL), Stripe.



Eibaru.jp — Multiplayer English Learning Platform
Overview:
Eibaru is a multiplayer web application designed to support English education for elementary school students.
The platform combines interactive quizzes with a character-based leveling system to motivate learning through gamification.

Key Features:
Separate teacher and student roles.
Teachers can manage classrooms, monitor student progress, and assist with account recovery.
Real-time multiplayer quizzes for classroom competitions.
Actively used by approximately 1,000 students.

Tech Stack:
Python, JavaScript, HTML, CSS, Django, Django Channels, React, Daphne, Redis, AWS Lightsail, Google Cloud Storage, Google OAuth, AWS RDS (MySQL).





Shared Infrastructure
Both projects run on the same Lightsail instance but operate with separate Daphne processes.
Shared user model between Kaibaru and Eibaru with separate session cookies.
Eibaru serves React components from the server, while Kaibaru’s frontend is built locally for deployment.
Development & Deployment
The repository contains both backend codebases.
Kaibaru’s frontend is private but can be shared with interested parties.

Deployment workflow: local build → rsync to server → collectstatic → restart Daphne.

Both applications leverage AWS, Redis, and Daphne for scalable real-time handling.




Eibaru & Kaibaru プロジェクト
このリポジトリには、私が開発・運用している2つのウェブアプリケーション、Kaibaru と Eibaru が含まれています。両プロジェクトは同じバックエンドインフラを共有していますが、それぞれ異なる目的で運用されています。

Kaibaru.jp — ウェブサイトビルダー & 会員管理プラットフォーム
概要:
Kaibaru は Django、React、TypeScript で構築された進行中のプラットフォームです。
ユーザーは簡単な Wix 風のページビルダーを使い、専用サブドメイン付きのウェブサイトを作成できます。
また、会員管理システムも統合されています。

主な機能:
JSON ベースのページ構造でウェブサイトを自由にカスタマイズ可能
事前定義されたテンプレートで迅速にサイト作成
会員管理、出席管理、会員の進捗確認
Stripe を利用したサブスクリプション課金
よりリッチなコンテンツ埋め込みや柔軟なサイト構造を実現する開発中機能
Kaibaru サブドメイン向けの中央ログイン（Google OAuth 対応）

デプロイ関連:
Route53 を利用してサブドメイン向けのワイルドカード SSL を自動更新
Lightsail インスタンスのメモリ制限により、フロントエンドビルドはローカルで実行
デプロイはローカルコマンドで build → rsync → collectstatic → Daphne 再起動
フロントエンドリポジトリは GitHub 上で非公開ですが、希望者には提供可能

技術スタック:
Python, TypeScript, HTML, CSS, Django, React, Daphne, Redis, Celery, django-hosts, AWS Lightsail, Google Cloud Storage, Google OAuth, AWS RDS (MySQL), Stripe



Eibaru.jp — 小学生向けマルチプレイヤー英語学習プラットフォーム
概要:
Eibaru は小学生向けの英語学習をサポートするマルチプレイヤーウェブアプリケーションです。
インタラクティブなクイズとキャラクター成長システムを組み合わせ、ゲーム感覚で学習を促進します。

主な機能:
教師・生徒の役割を分けた管理機能
教師はクラス管理、学習進捗の確認、アカウントサポートが可能
クラス単位のリアルタイムマルチプレイヤークイズ
約1,000名の生徒が実際に利用中
技術スタック:
Python, JavaScript, HTML, CSS, Django, Django Channels, React, Daphne, Redis, AWS Lightsail, Google Cloud Storage, Google OAuth, AWS RDS (MySQL)



共通インフラ：
両プロジェクトは同じ Lightsail インスタンス上で動作していますが、Daphne プロセスは別々に運用
Kaibaru と Eibaru は共通のユーザーモデルを使用しつつ、セッションクッキーは別管理
Eibaru はサーバー側で React コンポーネントを提供
Kaibaru はローカルでビルドしてからデプロイ

開発 & デプロイ：
このリポジトリには両方のバックエンドコードベースが含まれます
Kaibaru のフロントエンドは非公開ですが、希望者には提供可能

デプロイフロー:
ローカルビルド → rsync でサーバーへ → collectstatic → Daphne 再起動
両アプリケーションは AWS、Redis、Daphne を活用してリアルタイム処理に対応