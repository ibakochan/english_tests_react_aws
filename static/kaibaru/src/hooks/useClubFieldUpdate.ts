import { useState } from "react";
import { useCookies } from "react-cookie";

export function useClubFieldUpdate(fieldName: string, clubId: number, initialValue?: string) {
  const [cookies] = useCookies(["csrftoken"]);
  const [value, setValue] = useState(initialValue || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = async (newValue?: string) => {
    const finalValue = newValue ?? value;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/clubs/${clubId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": cookies.csrftoken,
        },
        body: JSON.stringify({ [fieldName]: finalValue }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "更新に失敗しました。");

      setValue(finalValue);
      return data;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "エラーが発生しました。");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { value, setValue, loading, error, updateField };
}
