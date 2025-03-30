"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { VocabularyWord } from "@/types";

type FlashCardProps = {
  vocabulary: VocabularyWord[];
  onComplete: (
    knownWords: number,
    totalWords: number,
    missedWords: VocabularyWord[],
  ) => void;
};

export default function FlashCard({ vocabulary, onComplete }: FlashCardProps) {
  const [wordQueue, setWordQueue] = useState<number[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<Set<number>>(new Set());
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

  // Handle completion when all words are processed
  useEffect(() => {
    // Only complete when wordQueue is empty AND we've had at least one attempt
    if (wordQueue.length === 0 && attemptCount > 0) {
      setIsComplete(true);
      // Only include words that were initially missed but later known
      const correctedMissedWords = Array.from(missedWords)
        .filter((idx) => eventuallyKnownWords.has(idx))
        .map((idx) => vocabulary[idx]);
      onComplete(knownWords.size, attemptCount, correctedMissedWords);
    }
  }, [
    wordQueue,
    knownWords.size,
    attemptCount,
    missedWords,
    eventuallyKnownWords,
    vocabulary,
    onComplete,
  ]);

  const currentWordIndex = wordQueue[0] || 0;
  const currentWord = vocabulary[currentWordIndex];

  // Toggle card flip state
  const handleFlip = () => setIsFlipped(!isFlipped);

  // Navigate to previous card
  const handlePrevious = () => {
    setIsFlipped(false);
    if (wordQueue.length > 1) {
      const prevIndex = wordQueue[wordQueue.length - 1];
      setWordQueue((prev) => [prevIndex, ...prev.slice(0, prev.length - 1)]);
    }
  };

  // Navigate to next card
  const handleNext = () => {
    setIsFlipped(false);
    if (wordQueue.length > 1) {
      setWordQueue((prev) => [...prev.slice(1), prev[0]]);
    }
  };

  // Mark current word as known
  const handleKnown = () => {
    setAttemptCount((prev) => prev + 1);
    const current = wordQueue[0];

    if (missedWords.has(current)) {
      // If this word was previously missed but now known
      setEventuallyKnownWords((prev) => new Set(prev).add(current));
    }

    setKnownWords((prev) => new Set(prev).add(current));

    // Remove the current word from the queue
    setWordQueue((prev) => prev.slice(1));
    setIsFlipped(false);
  };

  // Mark current word as unknown
  const handleUnknown = () => {
    setAttemptCount((prev) => prev + 1);
    const current = wordQueue[0];

    // Mark as missed if not already in missed words
    if (!missedWords.has(current)) {
      setMissedWords((prev) => new Set(prev).add(current));
    }

    // Move this word to the end of the queue for review
    setWordQueue((prev) => [...prev.slice(1), current]);
    setIsFlipped(false);
  };

  // Complete session and calculate results
  const handleFinish = () => {
    const correctedMissedWords = Array.from(missedWords)
      .filter((idx) => eventuallyKnownWords.has(idx))
      .map((idx) => vocabulary[idx]);

    setIsComplete(true);
    onComplete(knownWords.size, attemptCount, correctedMissedWords);
  };

  const progress = Math.min(
    100,
    Math.round((knownWords.size / vocabulary.length) * 100),
  );

  if (isComplete) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Word {knownWords.size + 1} of {vocabulary.length}
          {missedWords.size > 0 &&
            ` (${missedWords.size} with multiple attempts)`}
        </div>
        <div className="text-sm font-medium">
          Known: {knownWords.size} | {attemptCount} attempts
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <div
        className="perspective-1000 relative h-64 w-full cursor-pointer"
        onClick={handleFlip}
      >
        <div
          className={`transform-style-3d absolute h-full w-full transition-all duration-500 ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          <Card
            className={`backface-hidden absolute h-full w-full ${isFlipped ? "invisible" : ""}`}
          >
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center">
                <h3 className="mb-2 text-3xl font-bold">{currentWord.word}</h3>
                <p className="text-muted-foreground">
                  Click to reveal definition
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`backface-hidden rotate-y-180 absolute h-full w-full ${!isFlipped ? "invisible" : ""}`}
          >
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-xl">{currentWord.definition}</p>
                <p className="text-muted-foreground">Click to see word</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-500"
            onClick={handleUnknown}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            {"Don't Know"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-green-500"
            onClick={handleKnown}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Know It
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={wordQueue.length > 1 ? handleNext : handleFinish}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {wordQueue.length > 1 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleFinish}>
            <Flag className="mr-2 h-4 w-4" />
            Finish Review
          </Button>
        </div>
      )}
    </div>
  );
}
