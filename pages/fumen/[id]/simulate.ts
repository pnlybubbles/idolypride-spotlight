import { LiveData } from "../../../data/live";
import { Idol, Skill } from "../../../data/idol";
import isNonNullable from "is-non-nullable";

type Result = ({
  beat: number;
} & (
  | {
      type: "sp" | "a" | "p";
      lane: number;
      fail: boolean;
    }
  | {
      type: "buff";
      lane: number[];
      span: number;
    }
))[];

// 発生したスキルを記録する
type State = {
  lane: number; // スキルが発生したレーン
  beat: number; // スキルが発生したビート
  skill: Skill | null; // アイドルのスキル, nullのときは失敗
}[];

export function simulate(live: LiveData, idol: Idol[]) {
  const BEATS = new Array(live.beat).fill(0).map((_, i) => i);
  return BEATS.reduce(
    ({ result, state }, currentBeat) => {
      // Aスキルの発動チェック
      const aState: State = live.a
        .map((laneData, lane) => {
          // いまのビートがAのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat);
          if (skillTiming === undefined) {
            return null;
          }
          // アイドルが発動可能なAスキルを持っているかをチェック
          // アイドルの過去に発動したAスキルのうちCT中のもの
          const aSkillsCT = state
            .map((v) => (v.skill === null ? null : { ...v, skill: v.skill }))
            .filter(isNonNullable)
            .filter(
              (v) =>
                v.lane === lane &&
                v.skill?.type === "a" &&
                v.beat + v.skill.ct >= currentBeat
            );
          if (lane === 3) {
            console.log("ct", aSkillsCT);
          }
          // 発動可能なAスキルを絞り込む
          const aSkillCanTrigger = idol[lane].skills
            .filter(
              (skill) =>
                !aSkillsCT.map((v) => v.skill.index).includes(skill.index)
            )
            .filter((v) => v.type === "a");
          if (lane === 3) {
            console.log("can", aSkillCanTrigger);
          }
          const aSkillHead =
            aSkillCanTrigger.length > 0 ? aSkillCanTrigger[0] : null;
          return { lane, beat: currentBeat, skill: aSkillHead };
        })
        .filter(isNonNullable);
      const aResult: Result = aState.map(({ lane, skill }) => ({
        type: "a" as const,
        beat: currentBeat,
        lane: lane,
        fail: skill === null,
      }));

      // Aスキルによるバフ
      const aBuffResult: Result = aState
        .map(({ lane, skill }) =>
          skill !== null
            ? {
                type: "buff" as const,
                beat: currentBeat,
                lane: [0, 1, 2, 3, 4],
                span: skill.span,
              }
            : null
        )
        .filter(isNonNullable);

      // SPスキルの発動チェック
      const spState: State = live.sp
        .map((laneData, lane) => {
          // いまのビートがSPのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat);
          if (skillTiming === undefined) {
            return null;
          }
          // アイドルがSPを持っているかどうかをチェック
          const skill = idol[lane].skills.find((skill) => skill.type === "sp");
          if (skill === undefined) {
            return { lane, beat: currentBeat, skill: null };
          }
          return { lane, beat: currentBeat, skill };
        })
        .filter(isNonNullable);
      const spResult: Result = spState.map(({ lane, skill }) => ({
        type: "sp" as const,
        beat: currentBeat,
        lane: lane,
        fail: skill === null,
      }));

      return {
        result: [...result, ...aResult, ...[], ...spResult],
        state: [...state, ...aState, ...spState],
      };
    },
    { result: [] as Result, state: [] as State }
  );
}
