"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PreloadedList } from "@/types";

type SavedListsProps = {
  savedLists: PreloadedList[];
  onSelectList: (list: PreloadedList) => void;
  onRemoveList: (id: string) => void;
};

export default function SavedLists({
  savedLists,
  onSelectList,
  onRemoveList,
}: SavedListsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (listToDelete) {
      onRemoveList(listToDelete);
      setListToDelete(null);
    }
  };

  const filteredLists = searchTerm
    ? savedLists.filter(
        (list) =>
          list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          list.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : savedLists;

  if (savedLists.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-2 text-muted-foreground">
            You haven&apos;t saved any vocabulary lists yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Generated lists will appear here after you save them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Saved Lists</CardTitle>
        <CardDescription>
          Access your previously saved vocabulary lists
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search saved lists..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredLists.map((list) => (
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
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onSelectList(list)}>
                    Study
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500"
                    onClick={() => setListToDelete(list.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredLists.length === 0 && (
            <div className="col-span-2 py-8 text-center text-muted-foreground">
              No saved lists found matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog
        open={!!listToDelete}
        onOpenChange={() => setListToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this saved list?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this vocabulary list from your saved
              lists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
