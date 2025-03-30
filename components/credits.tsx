import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import Image from "next/image";

export default function CreditsDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Image src="/logos/logo.png" alt="Logo" width={50} height={50} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Credits</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Created by  */}
          <div className="flex items-center gap-2">
            <Image
              src="/me.jpg"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
            <span className="text-xl font-semibold ml-auto">
              Ahmad Suleiman
            </span>
          </div>

          {/* Portfolio Link */}
          <a
            href="https://www.ahmadsul.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-center hover:underline"
          >
            ahmadsul.com
          </a>
          <Image
            src="/logos/logo.png"
            alt="Logo"
            width={400}
            height={400}
            className="mx-auto w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
