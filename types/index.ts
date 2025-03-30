export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
}

export interface PreloadedList {
  id: string;
  title: string;
  description: string;
  vocabulary: VocabularyWord[];
}

export type StudySession = {
  list: PreloadedList;
  knownWords: number;
  totalAnswered: number;
  timestamp: number;
};
