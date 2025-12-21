import { FaInstagram, FaFacebook } from "react-icons/fa";
import ClubInstagramUpdate from "../update_forms/ClubInstagramUpdate";
import ClubFacebookUpdate from "../update_forms/ClubFacebookUpdate";
import ClubCreate from "../ClubCreate";
import type { Club } from "../types";
import Editable from "./Editable";

interface Props {
  club?: Club;
  manager?: boolean;
  owner?: boolean;
  kaibarudomain?: string;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  scale: number;
}

const Home: React.FC<Props> = ({ club, manager, owner, kaibarudomain, setClub, scale }) => {
  

  return (
    <>
      <div className="home-content-container" style={{ position: "relative" }}>
        <Editable
          club={club}
          owner={owner}
          setClub={setClub}
          scale={scale}
          category="home"
          rawData={club?.home}
          placeholder={
            <div>
              <div>こちらには、クラブや学校などのメインコンテンツを書くことができます。</div>
              <p></p>
              <div>通常のワード文書のように、段落ごとに文章を作成できます。</div>
              <p></p>
              <div>
                「FacebookやInstagramのリンクを追加すると、下のアイコンをクリックして各ページにアクセスできます。」
              </div>
            </div>
          }
        />

        {/* SNS icons */}
        <div style={{ marginTop: "15px", marginBottom: "10px" }}>
          {(club?.instagram_url || (owner || manager) || !club) && (
            <a
              href={club?.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: "12px" }}
            >
              <FaInstagram size={28} color="#E1306C" />
            </a>
          )}
          {(club?.facebook_url || (owner || manager) || !club) && (
            <a href={club?.facebook_url} target="_blank" rel="noopener noreferrer">
              <FaFacebook size={28} color="#1877F2" />
            </a>
          )}
        </div>

        {/* Create club prompt */}
        {!club?.home && (kaibarudomain === "kaibaru" || kaibarudomain === "www") && <ClubCreate />}

        {/* Instagram / Facebook update forms */}
        {club && !club?.frozen && (owner || manager) && (
          <div style={{ marginBottom: "15px" }}>
            <ClubInstagramUpdate
              clubId={club.id}
              initialInstagram={club.instagram_url}
              onUpdated={(updatedInstagram: string) =>
                setClub((prev: any) => ({ ...prev, instagram_url: updatedInstagram }))
              }
            />
            <ClubFacebookUpdate
              clubId={club.id}
              initialFacebook={club.facebook_url}
              onUpdated={(updatedFacebook: string) =>
                setClub((prev: any) => ({ ...prev, facebook_url: updatedFacebook }))
              }
            />
          </div>
        )}
      </div>

    </>
  );
};

export default Home;
