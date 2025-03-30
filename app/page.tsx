"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, RotateCcw } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import MultipleChoice from "@/components/multiple-choice";
import FlashCard from "@/components/flash-card";
import TopicForm from "@/components/topic-form";
import ResultsSummary from "@/components/results-summary";
import PreloadedLists from "@/components/preloaded-lists";
import SavedLists from "@/components/saved-lists";
import { shuffle } from "@/utils/shuffle";
import type { PreloadedList, VocabularyWord } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const [currentList, setCurrentList] = useState<PreloadedList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "generate" | "preloaded" | "saved"
  >("preloaded");
  const [knownWords, setKnownWords] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [missedWords, setMissedWords] = useState<VocabularyWord[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [savedLists, setSavedLists] = useState<PreloadedList[]>([]);
  const [studyMode, setStudyMode] = useState<"multiple-choice" | "flashcard">(
    "multiple-choice",
  );

  // Load saved lists on component mount
  useEffect(() => {
    try {
      const savedListsData = localStorage.getItem("qamus-saved-lists");
      if (savedListsData) {
        const lists = JSON.parse(savedListsData) as PreloadedList[];
        setSavedLists(lists);
      }
    } catch (err) {
      console.error("Error loading saved data:", err);
    }
  }, []);

  const handleListChange = useCallback((newList: PreloadedList | null) => {
    if (newList) {
      setCurrentList({
        ...newList,
        vocabulary: shuffle(newList.vocabulary),
      });
    } else {
      setCurrentList(null);
    }
    setKnownWords(0);
    setTotalAnswered(0);
    setMissedWords([]);
    setShowResults(false);
  }, []);

  const handleReset = useCallback(() => {
    handleListChange(null);
  }, [handleListChange]);

  const handleComplete = useCallback(
    (known: number, total: number, missed: VocabularyWord[]) => {
      setKnownWords(known);
      setTotalAnswered(total);
      setMissedWords(missed);
      setShowResults(true);
    },
    [],
  );

  const saveCurrentList = useCallback(() => {
    if (!currentList) return;

    const exists = savedLists.some((list) => list.id === currentList.id);

    if (!exists) {
      const updatedLists = [...savedLists, currentList];
      setSavedLists(updatedLists);
      localStorage.setItem("qamus-saved-lists", JSON.stringify(updatedLists));

      toast("List Saved", {
        description: `"${currentList.title}" has been added to your saved lists.`,
        duration: 3000,
      });
    } else {
      toast("Already Saved", {
        description: `"${currentList.title}" is already in your saved lists.`,
        duration: 3000,
      });
    }
  }, [currentList, savedLists]);

  const removeSavedList = useCallback(
    (listId: string) => {
      const updatedLists = savedLists.filter((list) => list.id !== listId);
      setSavedLists(updatedLists);
      localStorage.setItem("qamus-saved-lists", JSON.stringify(updatedLists));
    },
    [savedLists],
  );

  return (
    <ScrollArea className="flex flex-col h-[100dvh] bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-4 flex flex-col h-full">
        <header
          className={`flex items-center justify-between mb-4 shrink-0 ${!currentList || showResults ? "justify-center" : ""}`}
        >
          {currentList && !showResults && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={saveCurrentList}
              >
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Save List</span>
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Image
              className="dark:"
              src="/logos/logo-white.svg"
              alt="Qamus AI"
              width={30}
              height={30}
            />
            <h1 className="text-2xl font-bold text-center text-primary">
              Qamus AI
            </h1>
          </div>
          {currentList && !showResults && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col min-h-0">
          {!currentList ? (
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "generate" | "preloaded" | "saved")
              }
              className="flex flex-col flex-1"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="preloaded">Preloaded Lists</TabsTrigger>
                <TabsTrigger value="generate">Generate Custom</TabsTrigger>
                <TabsTrigger value="saved">
                  Saved Lists ({savedLists.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-visible">
                <TabsContent
                  value="preloaded"
                  className="h-full overflow-visible pb-4"
                >
                  <PreloadedLists onSelectList={handleListChange} />
                </TabsContent>

                <TabsContent
                  value="generate"
                  className="h-full overflow-visible pb-4"
                >
                  <TopicForm
                    onVocabularyGenerated={handleListChange}
                    setIsLoading={setIsLoading}
                    error={error}
                    setError={setError}
                  />
                </TabsContent>

                <TabsContent
                  value="saved"
                  className="h-full overflow-visible pb-4"
                >
                  <SavedLists
                    savedLists={savedLists}
                    onSelectList={handleListChange}
                    onRemoveList={removeSavedList}
                  />
                </TabsContent>
              </div>
            </Tabs>
          ) : !showResults ? (
            <div className="flex flex-col flex-1">
              <div className="text-center mb-4 shrink-0">
                <h2 className="text-xl font-medium">
                  Studying:{" "}
                  <span className="text-primary">{currentList.title}</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentList.vocabulary.length} words loaded
                  {currentList.description && ` • ${currentList.description}`}
                </p>
              </div>

              {isLoading ? (
                <Card className="flex-1 flex items-center justify-center">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-muted-foreground">
                      Loading vocabulary...
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  <Tabs
                    value={studyMode}
                    onValueChange={(value) =>
                      setStudyMode(value as "multiple-choice" | "flashcard")
                    }
                    className="flex flex-col flex-1"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="multiple-choice">
                        Multiple Choice
                      </TabsTrigger>
                      <TabsTrigger value="flashcard">Flashcards</TabsTrigger>
                    </TabsList>

                    <Card className="flex-1 overflow-visible">
                      <CardContent className="p-4 h-full">
                        {studyMode === "multiple-choice" ? (
                          <MultipleChoice
                            vocabulary={currentList.vocabulary}
                            onComplete={handleComplete}
                          />
                        ) : (
                          <FlashCard
                            vocabulary={currentList.vocabulary}
                            onComplete={handleComplete}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Tabs>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-visible">
              <ResultsSummary
                vocabulary={currentList.vocabulary}
                knownWords={knownWords}
                totalAnswered={totalAnswered}
                missedWords={missedWords}
                topic={currentList.title}
                onReset={handleReset}
                onSaveList={saveCurrentList}
              />
            </div>
          )}
        </div>

        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-lg font-medium">Loading vocabulary...</p>
            </div>
          </div>
        )}

        <Toaster />
      </div>
    </ScrollArea>
  );
}
