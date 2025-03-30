"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bookmark,
  Download,
  Loader2,
  RotateCcw,
  Share2,
  Trophy,
  CheckCircle,
} from "lucide-react";
import { VocabularyWord } from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ResultsSummaryProps = {
  vocabulary: VocabularyWord[];
  knownWords: number;
  totalAnswered: number;
  missedWords: VocabularyWord[];
  topic: string;
  onReset: () => void;
  onSaveList: () => void;
};

export default function ResultsSummary({
  vocabulary,
  knownWords,
  totalAnswered,
  missedWords,
  topic,
  onReset,
  onSaveList,
}: ResultsSummaryProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isMissedWordsOpen, setIsMissedWordsOpen] = useState(false);

  // Calculate accuracy based on total vocabulary words (not just attempted)
  const accuracy =
    vocabulary.length > 0
      ? Math.round((knownWords / vocabulary.length) * 100)
      : 0;

  // Calculate completion progress (capped at 100%)
  const progress = Math.min(
    100,
    Math.round((knownWords / vocabulary.length) * 100),
  );

  const handleDownload = () => {
    const csvContent = [
      ["Word", "Definition", "Status"],
      ...vocabulary.map((item) => {
        const isMissed = missedWords.some(
          (missed) => missed.word === item.word,
        );
        const status = isMissed
          ? "Corrected after multiple attempts"
          : "Known on first try";
        return [item.word, item.definition, status];
      }),
    ]
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `vocabulary-${topic.toLowerCase().replace(/\s+/g, "-")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Vocabulary Study: ${topic}`,
          text: `I've been studying ${topic} vocabulary and learned ${knownWords} out of ${vocabulary.length} words with ${totalAnswered} total attempts!`,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      navigator.clipboard
        .writeText(
          `I've been studying ${topic} vocabulary and learned ${knownWords} out of ${vocabulary.length} words with ${totalAnswered} total attempts!`,
        )
        .then(() => {
          alert("Results copied to clipboard!");
        })
        .catch((err) => {
          console.error("Error copying to clipboard:", err);
        });
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Add a small delay to show the saving state
    setTimeout(() => {
      onSaveList();
      setIsSaving(false);
    }, 600);
  };

  // Determine performance message
  const getPerformanceMessage = () => {
    if (accuracy >= 90) return "Excellent work!";
    if (accuracy >= 70) return "Good job!";
    if (accuracy >= 50) return "Nice effort!";
    return "Keep practicing!";
  };

  return (
    <Card className="mt-4 overflow-hidden border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl md:text-2xl">Study Results</CardTitle>
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Topic: <span className="font-medium text-foreground">{topic}</span>
        </p>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="mb-6 mt-2 text-center">
          <div className="text-2xl font-bold text-primary md:text-3xl">
            {accuracy}%
          </div>
          <p className="text-sm font-medium">{getPerformanceMessage()}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 rounded-lg bg-card p-4 shadow-sm">
          <div className="flex flex-col items-center space-y-1 text-center">
            <div className="text-3xl font-bold text-foreground">
              {knownWords}
            </div>
            <div className="text-xs text-muted-foreground md:text-sm">
              Words Mastered
            </div>
          </div>
          <div className="flex flex-col items-center space-y-1 text-center">
            <div className="text-3xl font-bold text-foreground">
              {totalAnswered}
            </div>
            <div className="text-xs text-muted-foreground md:text-sm">
              Total Attempts
            </div>
          </div>
        </div>
      </CardContent>

      {missedWords.length > 0 && (
        <CardContent className="pb-2">
          <Collapsible
            open={isMissedWordsOpen}
            onOpenChange={setIsMissedWordsOpen}
            className="rounded-md border"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full justify-between p-4"
              >
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-amber-500" />
                  <span className="font-medium">
                    {missedWords.length} Words Corrected After Multiple Attempts
                  </span>
                </div>
                <span>{isMissedWordsOpen ? "▲" : "▼"}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="rounded-md bg-muted/50 p-2">
                <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                  {missedWords.map((word, index) => (
                    <li key={index} className="flex justify-between py-1">
                      <span className="font-medium">{word.word}</span>
                      <span className="text-muted-foreground">
                        {word.definition}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}

      <CardContent className="space-y-4 p-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Completion</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2.5"
            style={{
              background: "rgba(var(--primary), 0.2)",
            }}
          />
          <p className="text-xs text-muted-foreground">
            You&apos;ve mastered {knownWords} out of {vocabulary.length} words
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2"
            size="sm"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Results</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2"
            size="sm"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                <span>Save List</span>
              </>
            )}
          </Button>

          <Button
            variant="default"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2"
            size="sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span>New List</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
