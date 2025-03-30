"use server";

import OpenAI from "openai";
import type { PreloadedList } from "@/types";
import { shuffle } from "@/utils/shuffle";
import { cookies } from "next/headers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache for recently generated lists to avoid API calls for same topics
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function generateVocabulary(
  topic: string,
): Promise<PreloadedList> {
  try {
    // Generate a consistent ID for this topic
    const topicId = topic.toLowerCase().replace(/\s+/g, "-");

    // Check server-side cache (cookies) for this topic
    const cookieStore = await cookies();
    const cachedListCookie = cookieStore.get(`qamus-list-${topicId}`);

    if (cachedListCookie) {
      try {
        const cachedList = JSON.parse(cachedListCookie.value) as {
          list: PreloadedList;
          timestamp: number;
        };

        // If cache is still valid, return the cached list
        if (Date.now() - cachedList.timestamp < CACHE_DURATION) {
          return cachedList.list;
        }
      } catch (err) {
        console.error("Error parsing cached list:", err);
        // Continue with API call if cache parsing fails
      }
    }

    // If no valid cache, call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates vocabulary lists. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: `Generate a list of 10-15 vocabulary words related to the topic: "${topic}".
          
For each word, provide a clear and concise definition.

Your response must be a valid JSON object with the following structure:
{
  "id": "${topic.toLowerCase().replace(/\s+/g, "-")}",
  "title": "${topic}",
  "description": "Vocabulary related to ${topic}",
  "vocabulary": [
    {"word": "example_word", "definition": "example definition"},
    {"word": "another_word", "definition": "another definition"}
  ]
}

The vocabulary array should contain 10-15 items. Each item must have "word" and "definition" properties.
Only return the JSON object, nothing else.`,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0.7,
      max_tokens: 8192,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Parse the response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(content) as PreloadedList;

    // Validate the response format
    if (
      !parsedResponse.vocabulary ||
      !Array.isArray(parsedResponse.vocabulary)
    ) {
      console.error(
        "Response does not contain a vocabulary array:",
        parsedResponse,
      );
      throw new Error("Invalid response format from AI");
    }

    if (parsedResponse.vocabulary.length === 0) {
      console.error("Empty vocabulary array");
      throw new Error("No vocabulary items were generated");
    }

    // Check if the first item has the expected structure
    if (
      !parsedResponse.vocabulary[0].word ||
      !parsedResponse.vocabulary[0].definition
    ) {
      console.error(
        "Invalid vocabulary item structure:",
        parsedResponse.vocabulary[0],
      );
      throw new Error("Invalid vocabulary format");
    }

    // Ensure all items have word and definition properties
    const validVocabulary = parsedResponse.vocabulary.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.word === "string" &&
        item.word.trim() !== "" &&
        typeof item.definition === "string" &&
        item.definition.trim() !== "",
    );

    if (validVocabulary.length < parsedResponse.vocabulary.length) {
      console.warn(
        `Filtered out ${parsedResponse.vocabulary.length - validVocabulary.length} invalid items`,
      );
    }

    if (validVocabulary.length === 0) {
      throw new Error("No valid vocabulary items were found");
    }

    // Create a properly formatted list with shuffled vocabulary
    const formattedList: PreloadedList = {
      id: parsedResponse.id || topic.toLowerCase().replace(/\s+/g, "-"),
      title: parsedResponse.title || topic,
      description:
        parsedResponse.description || `Vocabulary related to ${topic}`,
      vocabulary: shuffle(validVocabulary),
    };

    // Save to server-side cache (cookies)
    // Note: Due to cookie size limitations, we may not be able to store large lists
    try {
      const cacheObject = {
        list: formattedList,
        timestamp: Date.now(),
      };
      await cookieStore.set(
        `qamus-list-${topicId}`,
        JSON.stringify(cacheObject),
        {
          maxAge: 60 * 60 * 24, // 24 hours
          path: "/",
        },
      );
    } catch (err) {
      console.warn("Could not cache vocabulary list in cookies:", err);
      // Continue without caching - functionality still works
    }

    return formattedList;
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    throw new Error("Failed to generate vocabulary");
  }
}
