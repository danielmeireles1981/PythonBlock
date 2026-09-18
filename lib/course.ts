import "server-only";
import course from "@/content/course.json";
export const chapters = course.chapters;
export const lessons = course.lessons;
export function lessonById(id: string) { return lessons.find(l => l.id === id); }
export function publicLesson(id: string) { const lesson=lessonById(id); if(!lesson)return null; const {solution,quiz,...safe}=lesson; return {...safe,quiz:quiz?.map(({answer,explanation,...q})=>q)||[]}; }
