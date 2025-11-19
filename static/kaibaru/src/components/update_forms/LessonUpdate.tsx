// LessonUpdate.tsx
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { Button, Form } from "react-bootstrap";
import type { Member } from "../types";

// same Instructor type as before
interface Instructor {
    id: number;
    full_name: string;
    user: number;
    is_instructor: boolean;
    picture_url?: string;
}

// Adjusted Lesson interface to match LessonType
interface Lesson {
    id: number;
    title: string;
    weekday: number;
    start_time: string;
    end_time: string;
    description?: string;
    picture: string;               // required now
    instructor?: Member | null;    // match LessonType
}

interface Props {
    lesson: Lesson;
    instructors: Instructor[];
    onUpdated?: (lesson: Lesson) => void;
    onDeleted?: (lessonId: number) => void;
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

const LessonUpdate: React.FC<Props> = ({
    lesson,
    instructors,
    onUpdated,
    onDeleted,
}) => {
    const [cookies] = useCookies(["csrftoken"]);
    const [title, setTitle] = useState(lesson.title);
    const [weekday, setWeekday] = useState(lesson.weekday);
    const [startTime, setStartTime] = useState(lesson.start_time);
    const [endTime, setEndTime] = useState(lesson.end_time);
    const [description, setDescription] = useState(lesson.description || "");
    const [picture, setPicture] = useState<File | null>(null);
    const [instructor, setInstructor] = useState(
        lesson.instructor?.id?.toString() || ""
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("weekday", String(weekday));
            formData.append("start_time", startTime);
            formData.append("end_time", endTime);
            formData.append("description", description);
            if (picture) formData.append("picture", picture);
            if (instructor) formData.append("instructor_id", instructor);

            const res = await fetch(`/api/lessons/${lesson.id}/`, {
                method: "PATCH",
                headers: { "X-CSRFToken": cookies.csrftoken },
                body: formData,
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || "レッスン更新に失敗しました");
                setLoading(false);
                return;
            }

            onUpdated?.(data);
        } catch (err) {
            console.error(err);
            setError("エラーが発生しました。もう一度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("本当にこのレッスンを削除しますか？")) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/lessons/${lesson.id}/`, {
                method: "DELETE",
                headers: { "X-CSRFToken": cookies.csrftoken },
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.detail || "削除に失敗しました");
                setLoading(false);
                return;
            }

            onDeleted?.(lesson.id);
        } catch (err) {
            console.error(err);
            setError("エラーが発生しました。もう一度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
                <Form.Label>タイトル</Form.Label>
                <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>曜日</Form.Label>
                <Form.Select
                    value={weekday}
                    onChange={(e) => setWeekday(Number(e.target.value))}
                >
                    {weekdays.map((d) => (
                        <option key={d.value} value={d.value}>
                            {d.label}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>開始時間</Form.Label>
                <Form.Control
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>終了時間</Form.Label>
                <Form.Control
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>説明（任意）</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>画像（任意）</Form.Label>
                <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setPicture(
                            (e.target as HTMLInputElement).files?.[0] || null
                        )
                    }
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>担当の先生（任意）</Form.Label>
                <Form.Select
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                >
                    <option value="">選択してください</option>
                    {instructors.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                            {inst.full_name}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}

            <div className="d-flex justify-content-between">
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? "削除中..." : "削除"}
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "更新中..." : "更新"}
                </Button>
            </div>
        </Form>
    );
};

export default LessonUpdate;
