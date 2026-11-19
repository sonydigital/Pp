import { JUNIOR_LESSONS } from "./leagueJunior";
import { SENIOR_LESSONS } from "./leagueSenior";

export type League = "explorers" | "makers";
export type TrainerType = "quiz" | "prompt_builder" | "hallucination_hunt" | "fix_prompt" | "hallucination" | "blocks";
export type LessonCard = { title: string; body: string; bad: string; good: string };
export type Trainer = { type: TrainerType; prompt: string; options: string[]; correctOption: number; explanation: string };
export type Lesson = {
  id: string;
  league: League;
  number: number;
  module: number;
  moduleTitle: string;
  title: string;
  shortTitle: string;
  cards: LessonCard[];
  trainer: Trainer;
  mission: string;
  gameTitle: string;
  gameHint: string;
  accent: string;
};

const modes: TrainerType[] = ["quiz", "prompt_builder", "hallucination_hunt", "fix_prompt"];
export const LESSONS: Lesson[] = [...JUNIOR_LESSONS, ...SENIOR_LESSONS].map((lesson, index) => ({ ...lesson, trainer: { ...lesson.trainer, type: modes[index % modes.length] } }));
export const getLessons = (league: League) => LESSONS.filter((lesson) => lesson.league === league);
export const getModules = (league: League) => [1, 2, 3].map((module) => ({ module, title: getLessons(league).find((lesson) => lesson.module === module)?.moduleTitle || "Модуль", lessons: getLessons(league).filter((lesson) => lesson.module === module) }));
