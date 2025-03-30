"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, BookOpen, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateVocabulary } from "@/app/actions/generate-vocabulary";
import ExampleTopics from "./example-topics";
import { PreloadedList } from "@/types";

type TopicFormProps = {
  onVocabularyGenerated: (list: PreloadedList) => void;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

export default function TopicForm({
  onVocabularyGenerated,
  setIsLoading,
  error,
  setError,
}: TopicFormProps) {
  const [topic, setTopic] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setError(null);
    setLocalLoading(true);
    setIsLoading(true);

    try {
      const list = await generateVocabulary(topic);

      // Ensure we have at least 5 items for multiple choice
      if (list.vocabulary.length < 5) {
        setError(
          "Not enough vocabulary items generated. Please try a different topic.",
        );
        return;
      }

      onVocabularyGenerated(list);
    } catch (err) {
      console.error("Error generating vocabulary:", err);
      setError("Failed to generate vocabulary. Please try again.");
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
    if (error) setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Generate Custom Vocabulary
        </CardTitle>
        <CardDescription>
          Enter a topic you&apos;re interested in, and we&apos;ll generate
          vocabulary words for you to study.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Enter a topic (e.g., astronomy, medicine, literature)"
            value={topic}
            onChange={handleTopicChange}
            className="flex-1"
            disabled={localLoading}
          />
          <Button type="submit" disabled={localLoading}>
            {localLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </form>

        <ExampleTopics
          onSelectTopic={(selectedTopic) => {
            setTopic(selectedTopic);
            // Automatically submit the form when an example topic is selected
            setError(null);
            setLocalLoading(true);
            setIsLoading(true);
            generateVocabulary(selectedTopic)
              .then((list) => {
                if (list.vocabulary.length < 5) {
                  setError(
                    "Not enough vocabulary items generated. Please try a different topic.",
                  );
                  return;
                }
                onVocabularyGenerated(list);
              })
              .catch((err) => {
                console.error("Error generating vocabulary:", err);
                setError("Failed to generate vocabulary. Please try again.");
              })
              .finally(() => {
                setLocalLoading(false);
                setIsLoading(false);
              });
          }}
          isDisabled={localLoading}
        />
      </CardContent>
    </Card>
  );
}
