import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { exampleLessons } from "../../data/exampleLessons";
import { exampleMembers } from "../../data/exampleMembers";
import type { LessonType, Member, Club } from "../types";
import LessonUpdate from '../update_forms/LessonUpdate';
import LessonCreate from '../LessonCreate';



interface Props {
  club: any;
  owner?: boolean;
  instructor?: boolean;
  manager?: boolean;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  clubSubdomain: string;
}

function safeParseJSON<T>(input: any, fallback: T): T {
  if (!input) return fallback;
  if (typeof input === "object") return input;
  if (typeof input === "string") {
    try {
      const once = JSON.parse(input);
      if (typeof once === "string") return JSON.parse(once);
      return once;
    } catch {
      console.error("Invalid JSON:", input);
      return fallback;
    }
  }
  return fallback;
}


const Schedule: React.FC<Props> = ({ club, owner, instructor, manager, setClub, clubSubdomain }) => {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);
  const [showLessonUpdateModal, setShowLessonUpdateModal] = useState(false);
  const [presentMembers, setPresentMembers] = useState<Record<number, Record<number, boolean>>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [levelUpMember, setLevelUpMember] = useState<{ member: Member; newLevel: number } | null>(null);
  const [limitConfirmMember, setLimitConfirmMember] = useState<Member | null>(null);



  const levelNames = safeParseJSON<Record<string, string>>(club?.level_names, {});


  
  const [cookies] = useCookies(["csrftoken"]);

  const currentLessonId = selectedLesson?.id ?? 0;
  const instructors = club?.members?.filter((m: any) => m.is_instructor) || [];

  const daysOfWeek = ["月曜日","火曜日","水曜日","木曜日","金曜日","土曜日","日曜日"];

  const toggleParticipation = async (memberId: number) => {
    if (!currentLessonId || isUpdating) return; // prevent clicks while updating
    setIsUpdating(true);

    const isPresent = !presentMembers[currentLessonId]?.[memberId];

    setPresentMembers(prev => ({
      ...prev,
      [currentLessonId]: {
        ...prev[currentLessonId],
        [memberId]: isPresent
      }
    }));

    if (memberId <= 0) {
      const change = isPresent ? 1 : -1;
      exampleMembers.forEach(member => {
        if (member.id === memberId) {
          member.total_participation = (member.total_participation || 0) + change;
          member.this_month_participation = (member.this_month_participation || 0) + change;
          const level = member.level;
          member.level_participation = {
            ...member.level_participation,
            [level]: Math.max((member.level_participation?.[level] || 0) + change, 0)
          };
        }
      });
      setIsUpdating(false);
      return;
    }

    try {
      const res = await fetch(`/api/participations/toggle-count/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": cookies.csrftoken,
        },
        body: JSON.stringify({
          member: memberId,
          lesson: currentLessonId,
          is_present: isPresent,
        }),
      });

      if (!res.ok) throw new Error("Network error");
      const data = await res.json();


      setClub((prevClub: { members: Member[]; lessons: LessonType[] } | null) => {
        if (!prevClub) return prevClub;

        if (data?.member_data.level_up) {
          const leveledUpMember = prevClub.members.find(m => m.id === memberId);
          if (leveledUpMember) {
            setLevelUpMember({ member: leveledUpMember, newLevel: data.member_data.current_level });
          }
        }


        const updatedMembers = prevClub.members.map((member: Member) => {
          if (member.id === memberId) {
            const change = isPresent ? 1 : -1;
            
            const level = data?.member_data.current_level;
            const levelUp = data?.member_data.level_up;
            
            
            const participationDate = data?.last_participation_date ?? null;

            const newLevelParticipation = levelUp
              ? { ...member.level_participation, [level]: 0 }
              : { 
                  ...member.level_participation, 
                  [level]: Math.max((member.level_participation?.[Number(level)] || 0) + change, 0) 
                };

            const updatedParticipations = [
              ...(member.participations?.filter(p => p.lesson !== currentLessonId) ?? []),
              {
                lesson: currentLessonId,
                last_participation_date: isPresent ? participationDate : null,
              },
            ];


            return {
              ...member,
              total_participation: (member.total_participation || 0) + change,
              this_month_participation: (member.this_month_participation || 0) + change,
              level_participation: newLevelParticipation,
              participations: updatedParticipations,
              level: level,
            };
          }
          return member;
        });
        const change = isPresent ? 1 : -1;
        const updatedLessons = prevClub.lessons.map((lesson: LessonType) =>
           
          lesson.id === currentLessonId
                ? {
                    ...lesson,
                    total_participation: (lesson.total_participation || 0) + change,
                    monthly_participation: (lesson.monthly_participation || 0) + change,
                  }
                : lesson
        );
        if (selectedLesson?.id === currentLessonId) {
          setSelectedLesson(prev => prev ? {
              ...prev,
              total_participation: (prev.total_participation || 0) + change,
              monthly_participation: (prev.monthly_participation || 0) + change
          } : prev);
        }

        return { ...prevClub, members: updatedMembers, lessons: updatedLessons };
      });
    } catch (error) {
      console.error("Failed to update participation:", error);
      setPresentMembers(prev => ({
        ...prev,
        [currentLessonId]: {
          ...prev[currentLessonId],
          [memberId]: !isPresent,
        },
      }));
    } finally {
      setIsUpdating(false); // enable members again
    }
  };

  useEffect(() => {
    if (!club || !selectedLesson) return;

    const today = club.today; 

    const newPresent: { [memberId: number]: boolean } = {};

    (club.members || []).forEach((member: Member) => {
      const participationToday = member.participations?.some((p: any) => 
        p.lesson === selectedLesson.id && p.last_participation_date === today
      );
      newPresent[member.id] = !!participationToday;
    });

    setPresentMembers(prev => ({
      ...prev,
      [selectedLesson.id]: newPresent
    }));
  }, [selectedLesson]);

  return (
    <>
      {!club?.frozen && (owner || manager) && club && (
        <Button
          variant="primary"
          style={{ marginBottom: "15px", border: "2px solid black", borderRadius: "4px", cursor: "pointer", }}
          onClick={() => setShowLessonModal(true)}
        >
          レッスン作成
        </Button>
      )}

      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          {daysOfWeek.map((day, dayIndex) => (
            <div key={day} style={{ flex: "1 1 80%", minWidth: "120px", margin: "0 5px" }}>
              <div style={{ textAlign: "center", marginBottom: "5px" }}>{day}</div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", alignItems: "center" }}
              >
                {(club?.lessons?.length > 0 ? club.lessons : exampleLessons)
                  .filter((l: LessonType) => l.weekday === dayIndex)
                  .sort((a: LessonType, b: LessonType) => {
                    const [aH, aM] = (a.start_time ?? "00:00").split(":").map(Number);
                    const [bH, bM] = (b.start_time ?? "00:00").split(":").map(Number);
                    return aH * 60 + aM - (bH * 60 + bM);
                  })
                  .map((lesson: LessonType) => (
                    <div
                      key={lesson.title}
                      className="schedule-lesson-card"
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <img
                        src={lesson.picture}
                        alt={lesson.title}
                        style={{ width: "100%", height: "70%", borderRadius: "5px", border: "2px solid black" }}
                      />
                      <div style={{ textAlign: "center", marginTop: "5px" }}>
                        <div>{lesson.title}</div>
                        <div>
                          {lesson.start_time?.slice(0, 5)} - {lesson.end_time?.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    {!club?.frozen &&
    <>
      <Modal show={!!selectedLesson} onHide={() => setSelectedLesson(null)} centered className={club?.has_attendance && (owner || instructor || manager) ? "fullwidth-modal" : ""}>
        <Modal.Header style={{ textAlign: "center"}} closeButton>
          <Modal.Title>{selectedLesson?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "center"}}>
          {selectedLesson && (
            <>
              <img
                src={selectedLesson.picture}
                alt={selectedLesson.title}
                style={{ width: "150px", height: "150px", objectFit: "cover", border: "3px solid black", borderRadius: "15px" }}
              />
              <div style={{ marginTop: "1rem" }}>
                <p><strong>Day:</strong> {daysOfWeek[selectedLesson.weekday]}</p>
                {selectedLesson.description && (
                  <p><strong>Description:</strong> {selectedLesson.description}</p>
                )}
                {selectedLesson.instructor && (
                  <p><strong>Instructor:</strong> {selectedLesson.instructor.full_name}</p>
                )}
                <p>
                  <strong>Time:</strong>{" "}
                  {selectedLesson.start_time?.slice(0, 5)} - {selectedLesson.end_time?.slice(0, 5)}
                </p>
              </div>
            </>
          )}

          {club && (owner || manager) && (
            <div>
              <Button
                variant="primary"
                style={{ marginBottom: "15px", border: "2px solid black", borderRadius: "4px", cursor: "pointer", }}
                onClick={() => setShowLessonUpdateModal(true)}
              >
                レッスン内容変更
              </Button>
            </div>
          )}
          {selectedLesson && (owner || manager) && club?.has_attendance &&
            <div style={{ marginBottom: "10px", textAlign: "center" }}>
              <div>
                <strong>トータル出席:</strong> {selectedLesson.total_participation ?? 0}
              </div>
              <div>
                <strong>今月の出席:</strong> {selectedLesson.monthly_participation ?? 0}
              </div>
              <div>
                <strong>平均/月:</strong> {selectedLesson.monthly_average ?? 0}
              </div>
            </div>
          }

          {club?.has_attendance && (instructor || owner || manager) && (
            <>
            <h5>メンバーを押すだけで出席を取れます。もう一度押すと取り消せます。</h5>
            </>
          )}

          {club?.has_attendance && (club?.members?.length > 0 ? club.members : exampleMembers).length > 0 &&
            (instructor || owner || manager) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {(club?.members?.length > 0 ? club.members : exampleMembers)
                  .slice()
                  .sort((a: Member, b: Member) => {
                    const getLatest = (m: Member) => {
                      const dates =
                        m.participations
                          ?.filter(p => p.lesson === currentLessonId)
                          .map(p => p.last_participation_date)
                          .filter(Boolean) ?? [];
                      return dates.length ? Math.max(...dates.map(d => new Date(d!).getTime())) : 0;
                    };
                    return getLatest(b) - getLatest(a);
                  })
                  .map((member: Member) => {
                    const isPresent = presentMembers[currentLessonId ?? 0]?.[member.id] || false;
                    return (
                      <div
                        key={member.full_name}
                        className="member-card"
                        onClick={() => {
                          if (isUpdating) return;

                          if (!isPresent && (member.this_month_participation ?? 0) >= (member.participation_limit ?? Infinity)) {
                            setLimitConfirmMember(member);
                            return;
                          }
                          toggleParticipation(member.id);
                        }}
                      >
                        <img
                          src={member.picture}
                          alt={member.full_name}
                          className={`schedule-member-picture ${isPresent ? "present" : ""}`}
                        />
                        {isPresent && (
                          <div className="presence-overlay">
                            出席
                          </div>
                        )}
                        <div style={{ marginTop: "0.5rem", fontWeight: "500" }}>
                          {member.full_name}
                        </div>
                        <div style={{ marginTop: "0.25rem", fontSize: "0.7rem", textAlign: "left" }}>
                          <div>トータル：{member.total_participation ?? 0}</div>
                          <div>今月：{member.this_month_participation ?? 0}</div>
                          {club?.has_levels &&
                          <div>
                            {(() => {
                              const level = member.level;
                              const levelName = levelNames[String(level)] || `レベル${level}`;
                              const shortLabel = levelName.length > 5 ? levelName.slice(0, 5) : levelName;
                              const count = member.level_participation?.[level] ?? 0;
                              return `${shortLabel}：${count}`;
                            })()}
                          </div>
                          }
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedLesson(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    
    <Modal
        show={showLessonUpdateModal}
        onHide={() => setShowLessonUpdateModal(false)}
        centered
        size="xl"
    >
        <Modal.Header closeButton>
            <Modal.Title>レッスンを編集</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ textAlign: "center" }}>
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
                {selectedLesson && (
                    <LessonUpdate
                        lesson={selectedLesson}
                        instructors={instructors}
                        onUpdated={(updatedLesson: LessonType) => {
                            setClub((prevClub: Club) => ({
                                ...prevClub,
                                lessons: prevClub.lessons.map((lesson: LessonType) =>
                                    lesson.id === updatedLesson.id ? updatedLesson : lesson
                                ),
                            }));
                            setSelectedLesson(updatedLesson);
                            setShowLessonUpdateModal(false);
                        }}
                        onDeleted={(deletedLessonId: number) => {
                            setClub((prevClub: Club) => ({
                                ...prevClub,
                                lessons: prevClub.lessons.filter((lesson: LessonType) => lesson.id !== deletedLessonId),
                            }));
                            setSelectedLesson(null);
                            setShowLessonUpdateModal(false);
                        }}
                    />
                )}
            </div>
        </Modal.Body>

        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowLessonUpdateModal(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
    
    <Modal
        show={showLessonModal}
        onHide={() => setShowLessonModal(false)}
        centered
        size="lg"
    >
        
        <Modal.Header closeButton>
            <Modal.Title>レッスン作成</Modal.Title>
        </Modal.Header>
    

        <Modal.Body style={{ textAlign: "center" }}>
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
                <LessonCreate
                    setClub={setClub}
                    instructors={instructors}
                    clubSubdomain={clubSubdomain}
                    onCreated={() => {
                        setShowLessonModal(false);
                    }}
                />
            </div>
        </Modal.Body>

        <Modal.Footer>
            <Button 
            variant="secondary" 
            onClick={() => setShowLessonModal(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>

    <Modal
      show={!!levelUpMember}
      onHide={() => setLevelUpMember(null)}
      centered
      backdrop={true}   // or just remove this line entirely
      keyboard={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>おめでとう！🎉</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ textAlign: "center" }}>
        {levelUpMember && (
          <>
            <img
              src={levelUpMember.member.picture} // <- .member
              alt={levelUpMember.member.full_name}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                border: "3px solid gold",
                marginBottom: "1rem",
              }}
            />
            <h4 style={{ fontWeight: "bold", color: "goldenrod", textShadow: "1px 1px 4px #000" }}>
              {levelUpMember.member.full_name} さんが
              {safeParseJSON<Record<string, string>>(club?.level_names, {})[levelUpMember.newLevel] ??
                `レベル${levelUpMember.newLevel}`} にレベルアップしました！
            </h4>
          </>
        )}
      </Modal.Body>
    </Modal>
    <Modal
      show={!!limitConfirmMember}
      onHide={() => setLimitConfirmMember(null)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>注意 ⚠️</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ textAlign: "center" }}>
        {limitConfirmMember && (
          <p>
            {limitConfirmMember.full_name} さんは今月の参加上限に達しています。<br />
            それでもこのレッスンに参加させますか？
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setLimitConfirmMember(null)}>
          キャンセル
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (limitConfirmMember) {
              toggleParticipation(limitConfirmMember.id);
              setLimitConfirmMember(null);
            }
          }}
        >
          はい
        </Button>
      </Modal.Footer>
    </Modal>
    </>
    }
    </>
  );
};

export default Schedule;