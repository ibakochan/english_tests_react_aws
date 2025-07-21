import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useCookies } from 'react-cookie';
import { useWebsocket } from "../context/WebsocketContext";

export const useScoreHelpers = () => {
  const { setCurrentUser, setLvl, setPetLevel } = useUser();
  const [cookies] = useCookies(['csrftoken']);
  const { battleScore, setBattleScore, opponentScore, setOpponentScore } = useWebsocket();


  const recordFinalsScores = async (gameState, category, setRecordMessage, setShowModal, setError, setSignupModal) => {
    try {
      const csrfToken = cookies.csrftoken;
      const data = { scores: gameState.testScores };

      const response = await axios.post(`/final/${category}/score/`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });

      const rd = response.data;
      setRecordMessage(rd.message);
      setShowModal(true);

      setCurrentUser(prev => ({
        ...prev,
        ...rd.user_data,
      }));

      const level = Math.floor((rd.user_data.total_eiken_score + rd.user_data.total_4eiken_score + rd.user_data.total_eiken3_score + rd.user_data.total_eiken_pre2_score + rd.user_data.total_eiken2_score + rd.user_data.total_numbers_score + rd.user_data.total_phonics_score) / 100);
      const userLevel = Math.floor(rd.user_data.total_max_scores / 50);

      setPetLevel(level);
      setLvl(userLevel);

    } catch (error) {
      console.error('Error recording final scores:', error);
      setError('Failed to record test scores.');
      setSignupModal(true);
    }
  };

  const recordScore = async (gameState, testId, setRecordMessage, setShowModal, setMaxScores, setError, setSignupModal) => {
    try {
      const csrfToken = cookies.csrftoken;
      const data = { score: gameState.scoreCounter };

      const response = await axios.post(`/score/${testId}/record/`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });

      const rd = response.data;
      setRecordMessage(rd.message);
      setShowModal(true);

      const newMaxScore = rd.maxscore;
      setMaxScores(prev => {
        const exists = prev.some(score => score.id === newMaxScore.id);
        if (!exists) return [...prev, newMaxScore];
        return prev.map(score =>
          score.id === newMaxScore.id && score.score < newMaxScore.score ? newMaxScore : score
        );
      });

      if (rd.user_data) {
        setCurrentUser(prev => ({
          ...prev,
          ...rd.user_data,
        }));
      
        const level = Math.floor(
          (rd.user_data.total_eiken_score +
            rd.user_data.total_4eiken_score +
            rd.user_data.total_eiken3_score +
            rd.user_data.total_eiken_pre2_score +
            rd.user_data.total_eiken2_score +
            rd.user_data.total_numbers_score +
            rd.user_data.total_phonics_score) / 100
        );
      
        const userLevel = Math.floor(rd.user_data.total_max_scores / 50);
      
        setPetLevel(level);
        setLvl(userLevel);
      }



    } catch (error) {
      console.error('Error recording score:', error);
      setError('Failed to record test score.');
      setSignupModal(true);
    }
  };

  const declareWinner = async (setShowModal, setBattleFinishMessage, setbBattleModalPicture) => {
    console.log("Battle Score:", battleScore);
    console.log("Opponent Score:", opponentScore);
    if (battleScore > opponentScore) {
      setBattleFinishMessage("YEEEEEEEAH! 相手を倒した！");
      setbBattleModalPicture("https://storage.googleapis.com/ivar_reactions/openart-5eda95374c2140e3a6dad00334c41fef_raw%20(3).jpg");
    } else if (battleScore < opponentScore) {
      setBattleFinishMessage("NOOOOOOOOO!  ま。。け。。たあああああああああああ！");
      setbBattleModalPicture("https://storage.googleapis.com/ivar_reactions/openart-42849cd925af4fdba5bc73bf93394019_raw%20(7).jpg");
    } else if (battleScore === opponentScore) {
      setBattleFinishMessage("決着ついていない。。。。");
      setbBattleModalPicture("https://storage.googleapis.com/ivar_reactions/WhatsApp画像%202024-02-14%2013.27.37_9343389c%20(3).jpg");
    }
    setShowModal(true);
  };

  return {
    recordFinalsScores,
    recordScore,
    declareWinner,
  };
};