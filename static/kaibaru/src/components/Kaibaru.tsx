import React, { useState, useEffect } from "react";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";

import { exampleMembers } from "../data/exampleMembers";

import ClubPictureUpdate from './update_forms/ClubPictureUpdate';
import StripeCheckout from "./Stripe";

import Home from "./sections/Home";
import Schedule from "./sections/Schedule";
import System from "./sections/System";
import Trial from "./sections/Trial";
import Contact from "./sections/Contact";
import Teacher from "./sections/Teacher";
import MemberProfile from "./sections/MemberProfile";
import MemberManagement from "./sections/MemberManagement";
import Settings from "./sections/Settings";
import Join from "./sections/Join";

import MemberCreate from './MemberCreate';
import type { Member } from "./types";

import { PaymentModal } from "../utils/Modals";


import { Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import { FaCog } from "react-icons/fa";

const KaibaruPage: React.FC = () => {

  const urlToSection: { [key: string]: string } = {
    "/": "home",
    "/schedule": "schedule",
    "/system": "system",
    "/trial": "trial",
    "/member": "member",
    "/contact": "contact",
    "/teacher": "teacher",
    "/settings": "settings",
    "/join": "join",
  };
  const normalizePath = (path: string) => path.replace(/\/$/, "");

  const [activeSection, setActiveSection] = useState<string>(() => {
    const path = normalizePath(window.location.pathname);
    return urlToSection[path] || "home";
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingMemberRedirect, setPendingMemberRedirect] = useState(false);


  const [club, setClub] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showModal, setShowModal] = useState(false);

  const hostname = window.location.hostname;
  const kaibarudomain = hostname.split(".")[0];
  const currentPath = window.location.pathname + window.location.search;
  const currentUrl = window.location.href;

  const [realCurrentMember, setRealCurrentMember] = useState<Member | null>(null);

  const [perspective, setPerspective] = useState<"owner" | "manager" | "instructor" | "member" | "non_member">("owner");


  const currentMember = club?.members?.find(
    (m: Member) => m.user === club?.current_user?.id
  );

  const instructor = currentMember?.is_instructor
  const manager = currentMember?.is_manager

  const currentUser = (window as any).currentUser || null;
  const csrfToken = (window as any).csrfToken || "";
  const owner = (club && currentMember && (club?.owner === club?.current_user?.id))

  


  const handleNavClick = (section: string) => {
    setActiveSection(section);
    const path = section === "home" ? "/" : `/${section}`;
    window.history.pushState({}, "", path);
  };



  useEffect(() => {
    if (pendingMemberRedirect && currentMember) {
      setActiveSection("member");
      window.history.pushState({}, "", "/member");
      setPendingMemberRedirect(false);
    }
  }, [pendingMemberRedirect, currentMember]);

  useEffect(() => {
    const onPopState = () => {
      const path = normalizePath(window.location.pathname);
      const section = urlToSection[path] || "home";
      const allowed = allowedSectionsForUser();
  
      if (!allowed.includes(section)) {
        setActiveSection("home");
        window.history.replaceState({}, "", "/");
      } else {
        setActiveSection(section);
      }
    };
  
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [club, owner, currentMember]);



  


  const [scale, setScale] = useState(1);

  useEffect(() => {
    const baseWidth = 1200;
    const minWidth = 600;

    const handleResize = () => {
      const vw = window.innerWidth;
      const newScale = vw < baseWidth
        ? Math.max(vw / baseWidth, minWidth / baseWidth)
        : vw / baseWidth;
      setScale(newScale);
      document.body.style.overflowX = vw < minWidth ? "auto" : "hidden";
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [club, perspective, activeSection]);







  const switchPerspective = (type: "manager" | "instructor" | "member" | "non_member") => {
    if (!club || !currentMember) return;

    if (!realCurrentMember) {
      setRealCurrentMember(currentMember);
    }

    if (type === "non_member") {
      setClub((prev: any) => ({
        ...prev,
        owner: 0,
        members: prev.members.filter((m: Member) => m.id !== currentMember.id),
      }));

      setPerspective("non_member");
      return;
    }

    setClub((prev: any) => ({
      ...prev,
      owner: 0, // temporarily remove ownership
      members: prev.members.map((m: Member) =>
        m.id === currentMember.id
          ? {
              ...m,
              is_manager: type === "manager",
              is_instructor: type === "instructor",
            }
          : m
      ),
    }));

    setPerspective(type);
  };

  const resetPerspective = () => {
    if (!club || !realCurrentMember) return;

    setClub((prev: any) => {
      if (!prev) return prev;

      // Check if realCurrentMember is already in members
      const memberExists = prev.members.some((m: Member) => m.id === realCurrentMember.id);

      return {
        ...prev,
        owner: realCurrentMember.user, // restore ownership if needed
        members: memberExists
          ? prev.members.map((m: Member) =>
              m.id === realCurrentMember.id
                ? {
                    ...m,
                    is_manager: realCurrentMember.is_manager,
                    is_instructor: realCurrentMember.is_instructor,
                  }
                : m
            )
          : [...prev.members, realCurrentMember], // re-add if missing
      };
    });

    setPerspective("owner");
  };





  const fetchData = async (url: string, options: AxiosRequestConfig = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios({ url, ...options });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error fetching data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSubdomain = () => {
    const host = window.location.hostname; 
    const parts = host.split(".");
    if (parts.length > 2) {
      return parts[0]; 
    }
    return null; 
  };

  const fetchClub = async () => {
    const subdomain = getSubdomain();
    if (!subdomain || subdomain === "www") return;

    const data = await fetchData(`/api/clubs/by-subdomain/${subdomain}/`);
    if (data) setClub(data);
  };

  useEffect(() => {
    fetchClub();
  }, []);



  const navItems: { label: string; section: string; icon?: React.ReactNode }[] = [
    { label: "ホーム", section: "home" },
    { label: "スケジュール", section: "schedule" },
    { label: "システム", section: "system" },
    
    ...((club?.trial || kaibarudomain === "kaibaru" || owner || manager)
    ? [{ label: "体験", section: "trial" }]
    : []),

    ...(currentMember
      ? [{ label: "会員管理", section: "member" }]
      : []),

    { label: "連絡", section: "contact" },
    { label: "先生", section: "teacher" },

    ...(!club?.frozen && (owner || manager)
    ? [
        {
          label: "設定",
          section: "settings",
          icon: <FaCog />,
        },
      ]
    : []),

    ...(!currentMember ? [{ label: "入会/ログイン", section: "join" }] : []),
  ];

  const allowedSectionsForUser = () => navItems.map(item => item.section);

  useEffect(() => {
    if (!club) return;

    const path = normalizePath(window.location.pathname);
    const section = urlToSection[path] || "home";
    const allowed = allowedSectionsForUser();
  
    if (!allowed.includes(section)) {
      // Not allowed → go to home
      setActiveSection("home");
      window.history.replaceState({}, "", "/");
    } else {
      setActiveSection(section);
    }
  }, [club, owner, currentMember]);
  
  if (!owner && !manager) {
    navItems.forEach((item) => {
      if (item.section === "member") {
        item.label = "プロファイル";
      }
    });
  }

  return (
    <>
      {/* LOADING / ERROR STATES */}
      {loading ? (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>
      ) : error ? (
        <p style={{ textAlign: "center", marginTop: "2rem", color: "red" }}>
          Error: {error}
        </p>
      ) : club?.frozen && club.owner !== club.current_user?.id ? (
        <p style={{ textAlign: "center", marginTop: "2rem", color: "orange" }}>
          このクラブは現在凍結されています。編集はできず、オーナー以外のユーザーには表示されません。
        </p>
      ) : (
        <div
          className="kaibaru-page"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: "1200px",
            margin: 0,
            position: "absolute",
            left: 0,
            top: 0,
            paddingRight: `${15 * scale}px`,
          }}
        >
          {/* HEADER */}
          <header
            className="kaibaru-header_style"
            style={{
              position: "relative",
              backgroundImage: `url(${club?.picture_url || "https://storage.googleapis.com/ibaru_repair/kaibaruslogan.png"})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "5px",
                left: "5px",
                fontSize: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {club && (owner || manager) && (
                <ClubPictureUpdate
                  clubId={club.id}
                  onUpdated={(updatedPicture: string) =>
                    setClub((prev: any) => ({ ...prev, picture_url: updatedPicture }))
                  }
                />
              )}
            </div>
          </header>

          {/* PERSPECTIVE BUTTONS */}
          {club && owner && perspective === "owner" && (
            <div>
              <Button className="perspective-button" onClick={() => switchPerspective("manager")}>
                管理者の視点
              </Button>
              <Button className="perspective-button" onClick={() => switchPerspective("instructor")}>
                先生の視点
              </Button>
              <Button className="perspective-button" onClick={() => switchPerspective("member")}>
                会員の視点
              </Button>
              <Button className="perspective-button" onClick={() => switchPerspective("non_member")}>
                非会員の視点
              </Button>
            </div>
          )}

          {!owner && ["member", "manager", "instructor", "non_member"].includes(perspective) && (
            <Button
              style={{ border: "2px solid black", padding: "5px", borderRadius: "4px" }}
              variant="secondary"
              onClick={resetPerspective}
            >
              {perspective === "member" && "会員としての視点をやめる"}
              {perspective === "manager" && "管理人としての視点をやめる"}
              {perspective === "instructor" && "先生としての視点をやめる"}
              {perspective === "non_member" && "非会員としての視点をやめる"}
            </Button>
          )}

          {/* NAV */}
          <nav className="kaibaru-nav">
            {navItems.map((item) => {
              const isActive = activeSection === item.section;
              return (
                <button
                  key={item.section}
                  className={`nav-button ${isActive ? "active" : ""}`}
                  onClick={() => handleNavClick(item.section)}
                >
                  {item.label}
                  {item.icon}
                </button>
              );
            })}
          </nav>

          {/* MAIN CONTENT */}
          <main className="kaibaru-main">

            <div className="content-box">
              {activeSection === "schedule" && (
                <Schedule
                  manager={manager}
                  club={club}
                  setClub={setClub}
                  owner={owner}
                  instructor={instructor}
                  clubSubdomain={kaibarudomain || ""}
                />
              )}
              {activeSection === "home" && (
                <Home
                  club={club}
                  manager={manager}
                  owner={owner}
                  kaibarudomain={kaibarudomain}
                  setClub={setClub}
                  scale={scale}
                />
              )}
              {activeSection === "system" && <System club={club} owner={owner} setClub={setClub} scale={scale} />}
              {activeSection === "trial" && <Trial club={club} owner={owner} setClub={setClub} scale={scale} />}
              {activeSection === "member" && club && (owner || manager) && (
                <MemberManagement
                  setClub={setClub}
                  club={club}
                  members={club?.members?.length > 0 ? club.members : exampleMembers}
                  setSelectedMember={setSelectedMember}
                  selectedMember={selectedMember}
                  setShowModal={setShowModal}
                />
              )}
              {activeSection === "member" && !manager && club && !owner && (                
                  <MemberProfile successMessage={successMessage} club={club} currentMember={currentMember} setShowModal={setShowModal} />
              )}
              {activeSection === "contact" && <Contact club={club} manager={manager} owner={owner} setClub={setClub} scale={scale} />}
              {activeSection === "teacher" && <Teacher club={club} />}
              {activeSection === "settings" && <Settings club={club} setClub={setClub} owner={owner} />}
              
              {activeSection === "join" && club && (
                <Join
                  club={club}
                  currentUser={currentUser}
                  currentMember={currentMember}
                  onCreated={(newMember: Member) => {
                    setClub((prevClub: any) => {
                      if (!prevClub) return prevClub;
                      const memberExists = prevClub.members.some((m: Member) => m.id === newMember.id);
                      return {
                        ...prevClub,
                        members: memberExists
                          ? prevClub.members.map((m: Member) => (m.id === newMember.id ? newMember : m))
                          : [...prevClub.members, newMember],
                      };
                    });
                    setSuccessMessage("会員登録が完了しました！");
                    setPendingMemberRedirect(true);
                  }}
                />
              )}


            </div>
          </main>

          {/* LOGIN / LOGOUT */}
          {!currentUser ? (
            <a
              href={`https://kaibaru.jp/start_google_login/?next=${encodeURIComponent(currentUrl)}`}
              className="btn btn-light submit_buttons mb-2 d-flex align-items-center justify-content-center"
              style={{ marginLeft: "10px", border: "5px solid black" }}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google logo"
                style={{ width: "20px", height: "20px", marginRight: "10px" }}
              />
              <span>Googleでログイン</span>
            </a>
          ) : (
            <form method="post" action={`/accounts/logout/?next=${encodeURIComponent(currentPath)}`}>
              <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
              <button type="submit" style={{ width: 200, border: "4px solid black" }} className="btn btn-danger">
                ログアウト
              </button>
            </form>
          )}

          {club && (
            <StripeCheckout club={club} />
          )}

          {/* MEMBER CREATE MODAL */}
          <MemberCreate
            perspective={perspective}
            owner={owner}
            manager={manager}
            showModal={showModal}
            setShowModal={setShowModal}
            club={club}
            member={selectedMember || currentMember}
            onCreated={(updatedMember) => {
              setClub((prevClub: { members: Member[] } | null) => {
                if (!prevClub) return prevClub;
                const memberExists = prevClub.members.some((m) => m.id === updatedMember.id);
                if (selectedMember?.id === updatedMember.id) setSelectedMember(updatedMember);
                return {
                  ...prevClub,
                  members: memberExists
                    ? prevClub.members.map((m) => (m.id === updatedMember.id ? updatedMember : m))
                    : [...prevClub.members, updatedMember],
                };
              });
            }}
          />
        </div>
      )}
      <PaymentModal club={club} />
    </>
  );

};

export default KaibaruPage;
