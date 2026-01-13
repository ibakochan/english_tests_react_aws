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
