"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { VocabularyWord } from "@/types";
import { shuffle } from "@/utils/shuffle"; // Import the proper shuffle utility

type MultipleChoiceProps = {
  vocabulary: VocabularyWord[];
  onComplete: (
    score: number,
    total: number,
    missedWords: VocabularyWord[],
  ) => void;
};

export default function MultipleChoice({
  vocabulary,
  onComplete,
}: MultipleChoiceProps) {
  const [wordQueue, setWordQueue] = useState<number[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [correctlyAnsweredWords, setCorrectlyAnsweredWords] = useState<
    Set<number>
  >(new Set());
  const [missedWords, setMissedWords] = useState<Set<number>>(new Set());
  const [eventuallyKnownWords, setEventuallyKnownWords] = useState<Set<number>>(
    new Set(),
  );
  const [attemptCount, setAttemptCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize word queue with indices of all vocabulary words
  useEffect(() => {
    setWordQueue([...Array(vocabulary.length).keys()]);
  }, [vocabulary.length]);

  // Generate options whenever the queue changes or vocabulary is updated
  useEffect(() => {
    if (vocabulary.length >= 5 && wordQueue.length > 0) {
      generateOptions();
    }
  }, [vocabulary, wordQueue]);

  // Handle completion when all words are processed
  useEffect(() => {
    // Only complete when wordQueue is empty AND we've had at least one attempt
    if (wordQueue.length === 0 && attemptCount > 0) {
      setIsComplete(true);
      // Only include words that were initially missed but later known
      const correctedMissedWords = Array.from(missedWords)
        .filter((idx) => eventuallyKnownWords.has(idx))
        .map((idx) => vocabulary[idx]);
      onComplete(
        correctlyAnsweredWords.size,
        attemptCount,
        correctedMissedWords,
      );
    }
  }, [
    wordQueue,
    correctlyAnsweredWords.size,
    attemptCount,
    missedWords,
    eventuallyKnownWords,
    vocabulary,
    onComplete,
  ]);

  // Generate multiple choice options for the current word
  const generateOptions = () => {
    const currentWordIndex = wordQueue[0];
    const correctDefinition = vocabulary[currentWordIndex].definition;

    // Get all possible incorrect definitions
    const otherDefinitions = vocabulary
      .filter((_, index) => index !== currentWordIndex)
      .map((item) => item.definition);

    // Shuffle all incorrect options to ensure true randomness
    const shuffledDefinitions = shuffle([...otherDefinitions]);

    // Take only what we need (up to 4)
    const selectedIncorrect = shuffledDefinitions.slice(0, 4);

    // Shuffle the combination of correct and incorrect options
    // This ensures the correct answer appears in random positions
    const allOptions = shuffle([correctDefinition, ...selectedIncorrect]);

    setOptions(allOptions);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsAutoAdvancing(false);
  };

  // Handle when a user selects an answer option
  const handleOptionSelect = (definition: string) => {
    if (isAnswered) return;

    setAttemptCount((prev) => prev + 1);
    setSelectedOption(definition);
    setIsAnswered(true);

    const currentWordIndex = wordQueue[0];
    const isCorrect = definition === vocabulary[currentWordIndex].definition;

    if (isCorrect) {
      if (missedWords.has(currentWordIndex)) {
        // If this word was previously missed but now known
        setEventuallyKnownWords((prev) => new Set(prev).add(currentWordIndex));
      }
      setCorrectlyAnsweredWords((prev) => new Set(prev).add(currentWordIndex));
    } else {
      // Mark as missed if not already in missed words
      if (!missedWords.has(currentWordIndex)) {
        setMissedWords((prev) => new Set(prev).add(currentWordIndex));
      }
    }

    setIsAutoAdvancing(true);
    const timer = setTimeout(() => {
      if (isCorrect) {
        // Remove the current word from the queue
        setWordQueue((prev) => prev.slice(1));
      } else {
        // Move this word to the end of the queue for review
        setWordQueue((prev) => [...prev.slice(1), currentWordIndex]);
      }
      setIsAnswered(false);
      setIsAutoAdvancing(false);
    }, 1500);

    return () => clearTimeout(timer);
  };

  // Handle manual advancement to the next question
  const handleNext = () => {
    const currentWordIndex = wordQueue[0];
    const isCorrect =
      selectedOption === vocabulary[currentWordIndex].definition;

    if (isCorrect) {
      // Remove the current word from the queue
      setWordQueue((prev) => prev.slice(1));
    } else {
      // Move this word to the end of the queue for review
      setWordQueue((prev) => [...prev.slice(1), currentWordIndex]);
    }
    setIsAnswered(false);
  };

  // Complete session and calculate results
  const handleFinish = () => {
    const correctedMissedWords = Array.from(missedWords)
      .filter((idx) => eventuallyKnownWords.has(idx))
      .map((idx) => vocabulary[idx]);

    setIsComplete(true);
    onComplete(correctlyAnsweredWords.size, attemptCount, correctedMissedWords);
  };

  const currentWordIndex = wordQueue[0] || 0;
  const progress = Math.min(
    100,
    Math.round((correctlyAnsweredWords.size / vocabulary.length) * 100),
  );

  if (isComplete) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Word {correctlyAnsweredWords.size + 1} of {vocabulary.length}
          {missedWords.size > 0 &&
            ` (${missedWords.size} with multiple attempts)`}
        </div>
        <div className="text-sm font-medium">
          Known: {correctlyAnsweredWords.size} | {attemptCount} attempts
        </div>
      </div>

      <Progress value={progress} className="mb-4 h-2" />

      <div className="mb-6 text-xl font-semibold">
        What is the definition of &quot;{vocabulary[currentWordIndex].word}
        &quot;?
      </div>

      <RadioGroup value={selectedOption || ""} className="space-y-3">
        {options.map((definition, index) => {
          const isCorrect =
            definition === vocabulary[currentWordIndex].definition;
          const isSelected = definition === selectedOption;

          return (
            <div
              key={index}
              className={`
                rounded-lg border p-4 transition-colors
                ${isAnswered && isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
                ${isAnswered && isSelected && !isCorrect ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}
                ${!isAnswered && isSelected ? "border-primary" : ""}
                ${!isAnswered && !isSelected ? "hover:border-primary/50" : ""}
                ${!isAnswered ? "cursor-pointer" : "cursor-default"}
              `}
              onClick={() => !isAnswered && handleOptionSelect(definition)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={definition}
                  id={`option-${index}`}
                  disabled={isAnswered}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {definition}
                </Label>

                {isAnswered && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={handleFinish}>
          Finish Review
        </Button>

        {isAnswered && !isAutoAdvancing && (
          <Button onClick={handleNext} className="ml-auto">
            Next Question
          </Button>
        )}

        {isAutoAdvancing && (
          <div className="ml-auto flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Continuing in a moment...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
