import { supabaseClient } from "@/lib/supabase/client";
import { PreloadedList } from "@/types";

export async function getVocabularyLists(): Promise<PreloadedList[]> {
  // Fetch all lists
  const { data: lists, error: listsError } = await supabaseClient
    .from("vocabulary_lists")
    .select("*");

  if (listsError) {
    console.error("Error fetching vocabulary lists:", listsError);
    throw listsError;
  }

  // Fetch words for all lists
  const { data: words, error: wordsError } = await supabaseClient
    .from("vocabulary_words")
    .select("*");

  if (wordsError) {
    console.error("Error fetching vocabulary words:", wordsError);
    throw wordsError;
  }

  // Combine lists with their words
  const listsWithWords = lists.map((list) => {
    const listWords = words
      .filter((word) => word.list_id === list.id)
      .map(({ id, word, definition }) => ({ id, word, definition }));

    return {
      ...list,
      vocabulary: listWords,
    };
  });

  return listsWithWords || [];
}

export async function getVocabularyListById(
  id: string,
): Promise<PreloadedList | null> {
  // Fetch the list
  const { data: list, error: listError } = await supabaseClient
    .from("vocabulary_lists")
    .select("*")
    .eq("id", id)
    .single();

  if (listError) {
    console.error(`Error fetching vocabulary list with id ${id}:`, listError);
    return null;
  }

  // Fetch words for this list
  const { data: words, error: wordsError } = await supabaseClient
    .from("vocabulary_words")
    .select("*")
    .eq("list_id", id);

  if (wordsError) {
    console.error(
      `Error fetching vocabulary words for list ${id}:`,
      wordsError,
    );
    return null;
  }

  // Combine list with its words
  return {
    ...list,
    vocabulary: words.map(({ id, word, definition }) => ({
      id,
      word,
      definition,
    })),
  };
}

export async function searchVocabularyLists(
  searchTerm: string,
): Promise<PreloadedList[]> {
  // Fetch lists that match the search term
  const { data: lists, error: listsError } = await supabaseClient
    .from("vocabulary_lists")
    .select("*")
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

  if (listsError) {
    console.error("Error searching vocabulary lists:", listsError);
    throw listsError;
  }

  if (!lists || lists.length === 0) {
    return [];
  }

  // Get list IDs
  const listIds = lists.map((list) => list.id);

  // Fetch words for these lists
  const { data: words, error: wordsError } = await supabaseClient
    .from("vocabulary_words")
    .select("*")
    .in("list_id", listIds);

  if (wordsError) {
    console.error(
      "Error fetching vocabulary words for search results:",
      wordsError,
    );
    throw wordsError;
  }

  // Combine lists with their words
  const listsWithWords = lists.map((list) => {
    const listWords = (words || [])
      .filter((word) => word.list_id === list.id)
      .map(({ id, word, definition }) => ({ id, word, definition }));

    return {
      ...list,
      vocabulary: listWords,
    };
  });

  return listsWithWords;
}
