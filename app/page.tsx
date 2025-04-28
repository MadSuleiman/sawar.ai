"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, ArrowRight } from "lucide-react";
import InfoDialog from "@/components/info";
import { ScrollArea } from "@/components/ui/scroll-area";

type StyleOption = {
  id: string;
  name: string;
  image: string;
  color: string;
};

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  const styles: StyleOption[] = [
    {
      id: "ghibli",
      name: "Studio Ghibli Style",
      image: "/covers/ghibli.jpg",
      color: "bg-blue-500",
    },
    {
      id: "cartoon",
      name: "90's Cartoon",
      image: "/covers/cartoon.png",
      color: "bg-green-500",
    },
    {
      id: "disney",
      name: "Disney Renaissance Style (90s Era)",
      image: "/covers/disney.png",
      color: "bg-gray-500",
    },
    {
      id: "comic",
      name: "Comic",
      image: "/covers/comic.png",
      color: "bg-pink-500",
    },
    // {
    //   id: "timBurton",
    //   name: "Tim Burton Style",
    //   image: "/covers/comic.png",
    //   color: "bg-purple-500",
    // },
    // {
    //   id: "abstract",
    //   name: "Abstract",
    //   image: "/covers/comic.png",
    //   color: "bg-yellow-500",
    // },
    // {
    //   id: "portrait",
    //   name: "Portrait Photography",
    //   image: "/covers/comic.png",
    //   color: "bg-red-500",
    // },
    // {
    //   id: "landscape",
    //   name: "Landscape Photography",
    //   image: "/covers/comic.png",
    //   color: "bg-teal-500",
    // },
  ];

  const handleStyleSelect = (style: StyleOption) => {
    setSelectedStyle(style);
    setTimeout(() => {
      setShowUpload(true);
    }, 800);
  };

  const handleBack = () => {
    setShowUpload(false);
    setTimeout(() => {
      setSelectedStyle(null);
    }, 300);
  };

  // Find the index of the selected style
  const selectedIndex = selectedStyle
    ? styles.findIndex((s) => s.id === selectedStyle.id)
    : -1;

  return (
    <ScrollArea className="w-full bg-gray-900 min-h-screen h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-[rgba(83,101,88)] py-4 px-6 flex justify-between items-center z-50 ">
        <h1 className="text-3xl font-bold text-white">Sawar AI</h1>

        <InfoDialog />
      </header>

      <div className="relative z-10 flex-1">
        {/* Selected style title (fixed at top) */}
        <AnimatePresence>
          {selectedStyle && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`bg-[rgb(83,101,88)] absolute top-0 left-0 right-0 z-30 py-4 flex justify-center items-center`}
            >
              <h2 className="text-3xl font-bold text-white text-center">
                {selectedStyle.name}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {!selectedStyle ? (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full overflow-y-auto no-scrollbar"
            >
              <div className="grid sm:grid-cols-1 md:grid-cols-2 l:grid-cols-3 xl:grid-cols-4 auto-rows-[33vh] w-full">
                {styles.map((style) => (
                  <motion.div
                    key={style.id}
                    onMouseEnter={() => setHoveredStyle(style.id)}
                    onMouseLeave={() => setHoveredStyle(null)}
                    className={`relative overflow-hidden cursor-pointer flex items-center justify-center filter ${hoveredStyle && hoveredStyle !== style.id ? "blur-sm" : ""}`}
                    style={{
                      backgroundImage: style.image
                        ? `url(${style.image})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundBlendMode: style.image ? "darken" : undefined,
                      backgroundColor: style.image
                        ? "rgba(0,0,0,0.5)"
                        : undefined,
                    }}
                    onClick={() => handleStyleSelect(style)}
                  >
                    <span className="z-10 text-white font-bold text-lg text-center px-2">
                      {style.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{
                height: `calc(100% / ${styles.length})`,
                y: selectedIndex * (100 / styles.length) + "%",
                opacity: 1,
              }}
              animate={{
                height: "100%",
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              exit={{
                height: `calc(100% / ${styles.length})`,
                y: selectedIndex * (100 / styles.length) + "%",
                opacity: 0,
                transition: {
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              className={`${selectedStyle.color} w-full flex flex-col items-center justify-center min-h-screen h-screen`}
              style={{
                backgroundImage: selectedStyle.image
                  ? `url(${selectedStyle.image})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundBlendMode: selectedStyle.image ? "darken" : "normal",
                backgroundColor: selectedStyle.image
                  ? "rgba(0, 0, 0, 0.5)"
                  : "",
              }}
            >
              <AnimatePresence>
                {showUpload && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        delay: 0.5,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl w-[90%] max-w-md z-10 mx-4 mt-16"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl md:text-2xl font-bold">
                        {selectedStyle.name}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={handleBack}>
                        Back
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 md:p-8 mb-6 text-center">
                      <Upload className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Drag and drop your image here
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                        Supports JPG, PNG, WEBP (Max 10MB)
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Browse Files
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Select a file to upload</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <p>File browser would appear here</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Button className="w-full" size="lg">
                      Convert <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
