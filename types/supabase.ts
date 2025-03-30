export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      vocabulary_lists: {
        Row: {
          id: string;
          title: string;
          description: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
        };
      };
      vocabulary_words: {
        Row: {
          id: string;
          list_id: string;
          word: string;
          definition: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          word: string;
          definition: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          word?: string;
          definition?: string;
        };
      };
    };
  };
}
