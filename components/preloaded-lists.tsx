"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { shuffle } from "@/utils/shuffle";
import { PreloadedList } from "@/types";
import {
  getVocabularyLists,
  searchVocabularyLists,
} from "@/lib/handlers/lists-handler";

type PreloadedListsProps = {
  onSelectList: (list: PreloadedList) => void;
};

export default function PreloadedLists({ onSelectList }: PreloadedListsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState<string | null>(null);
  const [lists, setLists] = useState<PreloadedList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lists on initial load
  useEffect(() => {
    async function fetchLists() {
      try {
        const data = await getVocabularyLists();
        setLists(data);
      } catch (err) {
        setError("Failed to load vocabulary lists");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLists();
  }, []);

  // Handle search
  useEffect(() => {
    async function handleSearch() {
      if (!searchTerm) {
        const data = await getVocabularyLists();
        setLists(data);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchVocabularyLists(searchTerm);
        setLists(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce search
    const debounce = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSelectList = (list: PreloadedList) => {
    setLoadingList(list.id);
    setTimeout(() => {
      const shuffledList = {
        ...list,
        vocabulary: shuffle(list.vocabulary),
      };
      onSelectList(shuffledList);
      setLoadingList(null);
    }, 500); // Small delay to show loading state for UX feedback
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preloaded Vocabulary Lists</CardTitle>
        <CardDescription>
          Select from our curated vocabulary lists to start studying immediately
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lists..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {lists.length > 0 ? (
              lists.map((list) => (
                <Card key={list.id} className="overflow-hidden border">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{list.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {list.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between p-4 pt-0">
                    <div className="text-sm text-muted-foreground">
                      {list.vocabulary.length} words
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectList(list)}
                      disabled={loadingList === list.id}
                    >
                      {loadingList === list.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Study Now"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-muted-foreground">
                No vocabulary lists found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
