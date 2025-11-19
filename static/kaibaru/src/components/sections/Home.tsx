// Home.tsx
import { FaInstagram, FaFacebook } from "react-icons/fa";
import ClubInstagramUpdate from "../update_forms/ClubInstagramUpdate";
import ClubFacebookUpdate from "../update_forms/ClubFacebookUpdate";
import ClubOgImageUpdate from "../update_forms/ClubOgImageUpdate";
import ClubSearchResultEditor from "../update_forms/ClubSearchResultEditor";
import ClubCreate from "../ClubCreate";
import type { Club } from "../types";
import Editable from "./Editable";

interface Props {
  club?: Club;
  owner?: boolean;
  kaibarudomain?: string;
  setClub: React.Dispatch<React.SetStateAction<any>>;
  scale: number;
}

const Home: React.FC<Props> = ({ club, owner, kaibarudomain, setClub, scale }) => {

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
          {(club?.instagram_url || owner || !club) && (
            <a
              href={club?.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: "12px" }}
            >
              <FaInstagram size={28} color="#E1306C" />
            </a>
          )}
          {(club?.facebook_url || owner || !club) && (
            <a href={club?.facebook_url} target="_blank" rel="noopener noreferrer">
              <FaFacebook size={28} color="#1877F2" />
            </a>
          )}
        </div>

        {/* Create club prompt */}
        {!club?.home && kaibarudomain === "kaibaru" && <ClubCreate />}

        {/* Instagram / Facebook update forms */}
        {club && owner && (
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
              <div style={{ marginTop: "20px" }}>
                <ClubOgImageUpdate
                  clubId={club.id}
                  onUpdated={(updatedOg: string) =>
                    setClub((prev: any) => ({ ...prev, og_image: updatedOg }))
                  }
                />
              </div>
              <div style={{ marginTop: "20px" }}>
                <ClubSearchResultEditor
                  clubId={club.id}
                  subdomain={club.subdomain}
                  initialTitle={club.title}
                  initialDescription={club.search_description}
                  initialFavicon={club.favicon}
                  onUpdated={(field, value) =>
                    setClub((prev: any) => ({ ...prev, [field]: value }))
                  }
                />
              </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
