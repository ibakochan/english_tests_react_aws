import { useState } from "react";
import { useCookies } from "react-cookie";

export function useClubFileUpdate(fieldName: string, clubId: number) {
  const [cookies] = useCookies(["csrftoken"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFile = async (file: File) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      const res = await fetch(`/api/clubs/${clubId}/`, {
        method: "PATCH",
        headers: { "X-CSRFToken": cookies.csrftoken },
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "アップロードに失敗しました。");

      return data;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "エラーが発生しました。");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, updateFile };
}
