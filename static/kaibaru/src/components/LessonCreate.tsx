import React, { useState } from "react";
import { useCookies } from "react-cookie";
import type { Member } from "./types";

interface Instructor {
  id: number;
  full_name: string;
  user: number;
  is_instructor: boolean;
  introduction?: string;
  phone_number?: string;
  emergency_number?: string;
  member_type?: string;
  contract?: string | null;
  other_information?: string | null;
  picture_url?: string;
}


interface LessonResponse {
  id: number;
  title: string;
  weekday: number;
  start_time: string;
  end_time: string;
  description: string;
  picture_url?: string;
  is_instructor: boolean;
}

interface Props {
  instructors: Instructor[];
  clubSubdomain: string;
  onCreated?: (lesson: LessonResponse) => void;
  setClub?: React.Dispatch<React.SetStateAction<{ lessons: LessonResponse[]; members?: Member[] } | null>>;
}

const weekdays = [
  { value: 0, label: "月曜日" },
  { value: 1, label: "火曜日" },
  { value: 2, label: "水曜日" },
  { value: 3, label: "木曜日" },
  { value: 4, label: "金曜日" },
  { value: 5, label: "土曜日" },
  { value: 6, label: "日曜日" },
];

const LessonCreate: React.FC<Props> = ({ setClub, instructors, clubSubdomain, onCreated }) => {
  const [cookies] = useCookies(["csrftoken"]);
  const [title, setTitle] = useState("");
  const [weekday, setWeekday] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instructor, setInstructor] = useState<string>("");


  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("club_subdomain", clubSubdomain);
      formData.append("title", title);
      formData.append("weekday", String(weekday));
      formData.append("start_time", startTime);
      formData.append("end_time", endTime);
      formData.append("description", description);
      if (picture) formData.append("picture", picture);
      if (instructor) formData.append("instructor_id", instructor);


      const res = await fetch("/api/lessons/", {
        method: "POST",
        headers: { "X-CSRFToken": cookies.csrftoken },
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "レッスン作成に失敗しました");
        setLoading(false);
        return;
      }

      if (setClub) {
        setClub(prevClub => {
          if (!prevClub) return prevClub;
          return {
            ...prevClub,
            lessons: [...(prevClub.lessons || []), data]  // add new lesson
          };
        });
      }

      onCreated?.(data);

      // reset form
      setTitle("");
      setWeekday(0);
      setStartTime("");
      setEndTime("");
      setDescription("");
      setPicture(null);
      setInstructor("");

    } catch (err) {
      console.error(err);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
        onSubmit={handleLessonSubmit}
        style={{ maxWidth: 400, margin: "0 auto" }}
    >
        <label style={{ display: "block", marginBottom: "5px" }}>タイトル：</label>
        <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
        />

        <label style={{ display: "block", marginBottom: "5px" }}>曜日：</label>
        <select
            value={weekday}
            onChange={e => setWeekday(Number(e.target.value))}
            style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
        >
            {weekdays.map(day => (
                <option key={day.value} value={day.value}>
                    {day.label}
                </option>
            ))}
        </select>

        <label style={{ display: "block", marginBottom: "5px" }}>開始時間：</label>
        <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
        />

        <label style={{ display: "block", marginBottom: "5px" }}>終了時間：</label>
        <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
        />

        <label style={{ display: "block", marginBottom: "5px" }}>説明（任意）：</label>
        <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
        />

        <label style={{ display: "block", marginBottom: "5px" }}>画像（任意）：</label>
        <input
            type="file"
            accept="image/*"
            onChange={e => setPicture(e.target.files?.[0] || null)}
            style={{ marginBottom: "15px" }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <label style={{ display: "block", marginBottom: "5px" }}>担当の先生（任意）：</label>
        <select
          value={instructor}
          onChange={e => setInstructor(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
        >
          <option value="">選択してください</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.full_name}
            </option>
          ))}
        </select>


        <button
            type="submit"
            disabled={loading}
            style={{ padding: "8px 16px", width: "100%" }}
        >
            {loading ? "作成中..." : "作成"}
        </button>
    </form>


  );
};

export default LessonCreate;
