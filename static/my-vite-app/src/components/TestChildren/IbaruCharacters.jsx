// CharactersSection.jsx
import React from "react";

const IbaruCharacters = ({ isEnglish }) => {
  const characters = [
    {
      name: "ドロボッチ",
      en_name: "Dorobocchi",
      age: "19歳",
      en_age: "19 years old",
      img: "https://storage.googleapis.com/jr_high_1/burglarwoman.png",
      desc: "ドロボッチはお金や金、ダイヤなどの宝石が大好きな泥棒だ。でも何よりもお母さんが好き。生まれてから一度も買い物をしたことがない。いつも盗むからだ。",
      en_desc: "Dorobocchi is a thief who loves money, gold, and gems like diamonds. But above all, she loves her mother. She has never once gone shopping since birth because she always steals."
    },
    {
      name: "ラバティオス",
      en_name: "Lavatios",
      age: "20歳",
      en_age: "20 years old",
      img: "https://storage.googleapis.com/jr_high_1/lavaguy.png",
      desc: "2000度を超えるマグマ魔法を使える。そこそこイケメンと言われている。",
      en_desc: "He can use magma magic over 2000°C. People say he’s fairly handsome."
    },
    {
      name: "イバル",
      en_name: "Ivar",
      age: "2540歳",
      en_age: "2540 years old",
      img: "https://storage.googleapis.com/profile_assets/ghibliibaru.jpg",
      desc: "主人公。最強の存在。不死身だ。",
      en_desc: "The main character. The strongest being. Immortal."
    },
    {
      name: "ママシュママシュ",
      en_name: "Mamashmamash",
      age: "年齢不明",
      en_age: "Age unknown",
      img: "https://storage.googleapis.com/jr_high_1/mamashmamasu.png",
      desc: "生まれたときから完璧なカレーを作れる。10キロのA5神戸牛か松阪牛を渡せば、カレーを一食くれるらしい。",
      en_desc: "They can cook perfect curry from the moment they're born. If given 10 kg of A5 Kobe or Matsusaka beef, They’ll serve you one plate of curry."
    },
    {
      name: "操りぴこ",
      en_name: "Ayatsuripiko",
      age: "25歳",
      en_age: "25 years old",
      img: "https://storage.googleapis.com/jr_high_1/manipulatinggirl.png",
      desc: "洗脳と人の心を操る天才だ。",
      en_desc: "A genius at brainwashing and manipulating people’s hearts."
    },
    {
      name: "モンスタリオ",
      en_name: "Monstario",
      age: "年齢不明",
      en_age: "Age unknown",
      img: "https://storage.googleapis.com/jr_high_1/mosterhammer.png",
      desc: "人間ではない。体重1トン。イバルの次に一番強い。",
      en_desc: "Not human. Weighs one ton. The second strongest after Ibaru."
    },
    {
      name: "ロー自信ガール",
      en_name: "Lowjishingirl",
      age: "14歳",
      en_age: "14 years old",
      img: "https://storage.googleapis.com/jr_high_1/noconfidentgirl.png",
      desc: "数学以外の才能がまったくない。自信も極めて少ない。",
      en_desc: "She has no talent outside of math and has very little confidence."
    },
    {
      name: "ロー自信ボーイ",
      en_name: "Lowjishinboy",
      age: "13歳",
      en_age: "13 years old",
      img: "https://storage.googleapis.com/jr_high_1/noconfinentboy.png",
      desc: "ロー自信ガールの弟。才能も自信もまったくない。",
      en_desc: "The younger brother of Lowjishingirl. He has neither talent nor confidence."
    },
    {
      name: "サムライト",
      en_name: "Samuraito",
      age: "30歳",
      en_age: "30 years old",
      img: "https://storage.googleapis.com/jr_high_1/samuraihero.png",
      desc: "山で侍の達人たちに侍の道を教わった侍。モンスタリオには勝てないが、ラバティオスとはいい勝負をする。",
      en_desc: "A samurai who learned the way of the sword from masters in the mountains. He can’t defeat Monstario, but he fights evenly with Lavatios."
    },
    {
      name: "サイエントリスト",
      en_name: "Scientristo",
      age: "15歳",
      en_age: "15 years old",
      img: "https://storage.googleapis.com/jr_high_1/weaponboy.png",
      desc: "世界一と言っていい科学者であり発明家。有名な物理学者ビルベルト・ウェインステインの息子だ。",
      en_desc: "Perhaps the greatest scientist and inventor in the world. Son of the famous physicist Bilbert Weinstein."
    }
  ];

  return (
    <section className="container my-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">威張るの伝説キャラ紹介</h2>
        <h2 className="fw-bold">中１レッスン１０から中３のレッスン７まで以下のキャラについての実話がある</h2>
      </div>

      <div
        className="d-flex flex-wrap justify-content-center"
        style={{ gap: "0px" }} // no space between buttons
      >
        {characters.map((c) => (
          <div key={c.name}>
            <button
              className="btn btn-dark test_buttons test_button_hover d-flex flex-column align-items-center p-2"
              style={{
                borderRadius: "0.75rem",
                border: "2px solid #333",
                background: "linear-gradient(180deg, #222, #333)",
                height: "320px",
                width: "160px",
                overflow: "hidden",
                margin: "0", // remove margin that might add gaps
              }}
              onClick={() => console.log(`${c.name} clicked`)}
            >
              <img
                src={c.img}
                alt={isEnglish ? c.en_name : c.name}
                loading="lazy"
                width="140"
                height="140"
                style={{ marginBottom: "8px" }}
              />
              <span className="fw-bold text-white">{isEnglish ? c.en_name : c.name}</span>
              <small className="text-muted">{isEnglish ? c.en_age : c.age}</small>
              <p
                className="small text-white text-center mt-1"
                style={{ lineHeight: 1.3, overflowY: "auto", flexGrow: 1 }}
              >
                {isEnglish ? c.en_desc : c.desc}
              </p>
            </button>
          </div>
        ))}
      </div>


      <style>{`
        button.btn {
          transition: transform .15s ease, box-shadow .15s ease;
        }
        button.btn:hover {
          transform: scale(1.05);
          box-shadow: 0 .75rem 1.25rem rgba(0,0,0,.2);
        }
      `}</style>
    </section>
  );
};

export default IbaruCharacters;