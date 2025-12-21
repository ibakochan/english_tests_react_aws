import React from "react";
import type { Club } from "../types";
import Editable from "./Editable";

interface Props {
  club?: Club;
  owner?: boolean;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  scale: number;
}

const System: React.FC<Props> = ({ club, owner, setClub, scale }) => {
  const placeholder = (
    <div>
      <div>ここでは、レッスン料や月謝、またその仕組みについてご案内できます。</div>
      <p></p>
      <div>通常のワード文書のように、段落ごとに文章を作成できます。</div>
    </div>
  );

  return (
    <div className="home-content-container" style={{ position: "relative" }}>
    <Editable
      club={club}
      owner={owner}
      setClub={setClub}
      scale={scale}
      rawData={club?.system}
      category="system"
      placeholder={placeholder}
    />
    </div>
  );
};

export default System;
