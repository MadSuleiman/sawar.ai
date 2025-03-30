"use client";

import { Button } from "@/components/ui/button";

type ExampleTopicsProps = {
  onSelectTopic: (topic: string) => void;
  isDisabled?: boolean;
};

const exampleTopics = [
  "Quantum Physics",
  "Marine Biology",
  "Ancient Rome",
  "Artificial Intelligence",
  "Astronomy",
  "Psychology",
  "Culinary Arts",
  "Architecture",
];

export default function ExampleTopics({
  onSelectTopic,
  isDisabled = false,
}: ExampleTopicsProps) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium">Try one of these topics:</p>
      <div className="flex flex-wrap gap-2">
        {exampleTopics.map((topic) => (
          <Button
            key={topic}
            variant="outline"
            size="sm"
            onClick={() => onSelectTopic(topic)}
            className="text-xs"
            disabled={isDisabled}
          >
            {topic}
          </Button>
        ))}
      </div>
    </div>
  );
}
