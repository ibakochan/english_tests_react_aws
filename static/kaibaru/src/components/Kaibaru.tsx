import React, { useState, useEffect } from "react";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";

import { exampleMembers } from "../data/exampleMembers";

import ClubPictureUpdate from './update_forms/ClubPictureUpdate';

import Home from "./sections/Home";
import Schedule from "./sections/Schedule";
import System from "./sections/System";
import Trial from "./sections/Trial";
import Contact from "./sections/Contact";
import Teacher from "./sections/Teacher";
import MemberProfile from "./sections/MemberProfile";
import MemberManagement from "./sections/MemberManagement";

import MemberCreate from './MemberCreate';
import type { Member } from "./types";

import { Modal, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const KaibaruPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [club, setClub] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showModal, setShowModal] = useState(false);

  const hostname = window.location.hostname;
  const kaibarudomain = hostname.split(".")[0];
  const currentPath = window.location.pathname + window.location.search;
  const currentUrl = window.location.href;

  const [perspective, setPerspective] = useState<"owner" | "manager" | "instructor" | "member">("owner");
  
  const currentMember = club?.members?.find(
    (m: Member) => m.user === club?.current_user?.id
  );

  const instructor = currentMember?.is_instructor
  const manager = currentMember?.is_manager

  const currentUser = (window as any).currentUser || null;
  const csrfToken = (window as any).csrfToken || "";

  const owner = (club && currentMember && (club?.owner === club?.current_user?.id))

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







  const switchPerspective = (type: "manager" | "instructor" | "member") => {
    if (!club || !currentMember) return;

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
    if (!club || !currentMember) return;

    setClub((prev: any) => ({
      ...prev,
      owner: club.current_user.id, // restore owner
      members: prev.members.map((m: Member) =>
        m.id === currentMember.id
          ? {
              ...m,
              is_manager: currentMember.is_manager,
              is_instructor: currentMember.is_instructor,
            }
          : m
      ),
    }));

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
    if (!subdomain) return;

    const data = await fetchData(`/api/clubs/by-subdomain/${subdomain}/`);
    if (data) setClub(data);
  };

  useEffect(() => {
    fetchClub();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const navItems: { label: string; section: string }[] = [
    { label: "ホーム", section: "home" },
    { label: "スケジュール", section: "schedule" },
    { label: "システム", section: "system" },
    
    ...((club?.trial || kaibarudomain === "kaibaru" || owner)
    ? [{ label: "体験", section: "trial" }]
    : []),

    ...(currentMember
      ? [{ label: "会員管理", section: "member" }]
      : []),

    { label: "連絡", section: "contact" },
    { label: "先生", section: "teacher" },
  ];

  if (!owner && !manager) {
    navItems.forEach((item) => {
      if (item.section === "member") {
        item.label = "プロファイル";
      }
    });
  }

  return (
    <>
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
        paddingRight: `${15 * scale}px`
      }}
    >

      <header 
        className="kaibaru-header_style"
        style={{
          position: "relative", backgroundImage: `url(${club?.picture_url || "https://storage.googleapis.com/ibaru_repair/kaibaruslogan.png"})`,
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
        {club && owner &&
            <ClubPictureUpdate
              clubId={club.id}
              onUpdated={(updatedPicture: string) =>
                setClub((prev: any) => ({ ...prev, picture_url: updatedPicture }))
              }
            />
        }
        </div>
      </header>

      {club && owner &&
        <div>

        {perspective === "owner" &&
          <>
            <Button className="perspective-button" onClick={() => switchPerspective("manager")}>管理者の視点</Button>
            <Button className="perspective-button" onClick={() => switchPerspective("instructor")}>先生の視点</Button>
            <Button className="perspective-button" onClick={() => switchPerspective("member")}>会員の視点</Button>
          </>
        }
        </div>
      }
      {!owner && (perspective === "member" || perspective === "manager" || perspective === "instructor") &&
        <Button style={{ border: "2px solid black", padding: "5px", borderRadius: "4px" }} variant="secondary" onClick={resetPerspective}>
            {perspective === "member" && "会員としての視点をやめる"}
            {perspective === "manager" && "マネージャーとしての視点をやめる"}
            {perspective === "instructor" && "インストラクターとしての視点をやめる"}
       </Button>
      }
      
      <nav className="kaibaru-nav">
        {navItems.map((item) => {
          const isActive = activeSection === item.section;
          return (
            <button
              key={item.section}
              className={`nav-button ${isActive ? "active" : ""}`}
              onClick={() => setActiveSection(item.section)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <main className="kaibaru-main">
        <div className="content-box">

          {activeSection === "schedule" && (
            <Schedule
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
              owner={owner}
              kaibarudomain={kaibarudomain}
              setClub={setClub}
              scale={scale}
            />
          )}

          {activeSection === "system" && (
            <System
              club={club}
              owner={owner}
              setClub={setClub}
              scale={scale}
            />
          )}

          {activeSection === "trial" && (
            <Trial
              club={club}
              owner={owner}
              setClub={setClub}
              scale={scale}
            />
          )}

          {activeSection === "member" && club && (owner || manager) && (
            <MemberManagement
              members={club?.members?.length > 0 ? club.members : exampleMembers}
              setSelectedMember={setSelectedMember}
            />
          )}

          {activeSection === "member" && (!manager && club && !owner) && (
            <MemberProfile currentMember={currentMember} setShowModal={setShowModal} />
          )}

          {activeSection === "contact" && (
            <Contact
              club={club}
              owner={owner}
              setClub={setClub}
              scale={scale}
            />
          )}

          {activeSection === "teacher" && <Teacher club={club} />}
        </div>
      </main>

    <>
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
          <input
            type="hidden"
            name="csrfmiddlewaretoken"
            value={csrfToken}
          />
          <button
            type="submit"
            style={{ width: 200, border: "4px solid black" }}
            className="btn btn-danger"
          >
            ログアウト
          </button>
        </form>
      )}
    </>

    </div>
    <Modal show={!!selectedMember} onHide={() => setSelectedMember(null)} centered>
            <Modal.Header closeButton>
              <Modal.Title>{selectedMember?.full_name}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: "center" }}>
              <img
                src={selectedMember?.picture}
                alt={selectedMember?.full_name}
                className="modal-member-img"
                />
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="member-edit-button"
              >
                ✎
              </button>
              <div style={{ marginTop: "1rem", textAlign: "left" }}>
                {selectedMember?.member_type && <p><strong>会員種類:</strong> {selectedMember.member_type}</p>}
                {selectedMember?.introduction && <p><strong>自己紹介:</strong> {selectedMember.introduction}</p>}
                {selectedMember?.phone_number && <p><strong>電話番号:</strong> {selectedMember.phone_number}</p>}
                {selectedMember?.emergency_number && <p><strong>緊急連絡先:</strong> {selectedMember.emergency_number}</p>}
                {selectedMember?.other_information && <p><strong>その他情報:</strong> {selectedMember.other_information}</p>}
                {selectedMember?.level && <p><strong>レベル:</strong> {selectedMember.level}</p>}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedMember(null)}>Close</Button>
            </Modal.Footer>
    </Modal>

    <MemberCreate showModal={showModal} setShowModal={setShowModal} club={club} member={selectedMember || currentMember}
    onCreated={(updatedMember) => {
      setClub((prevClub: { members: Member[] } | null) => {
        if (!prevClub) return prevClub;

        const memberExists = prevClub.members.some(m => m.id === updatedMember.id);
        if (selectedMember?.id === updatedMember.id) {
          setSelectedMember(updatedMember);
        }
        return {
          ...prevClub,
          members: memberExists
            ? prevClub.members.map((m: Member) =>
                m.id === updatedMember.id ? updatedMember : m
              )
            : [...prevClub.members, updatedMember], // append if new
        };
      });
    }}
    />

    </>
  );
};

export default KaibaruPage;
