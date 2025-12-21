// Trial.tsx
import React from "react";
import type { Club } from "../types";
import Editable from "./Editable";

interface Props {
  club?: Club;
  owner?: boolean;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  scale: number;
}

const Trial: React.FC<Props> = ({ club, owner, setClub, scale }) => {
  return (
    <div className="home-content-container" style={{ position: "relative" }}>
    <Editable
      club={club}
      owner={owner}
      setClub={setClub}
      scale={scale}
      category="trial"
      rawData={club?.trial}
      placeholder={
        <div>
          <div>ここでは、体験レッスンの制度についての情報をご記入いただけます。</div>
          <p></p>
          <div>通常のワード文書のように、段落ごとに文章を作成できます。</div>
        </div>
      }
    />
    </div>
  );
};

export default Trial;
