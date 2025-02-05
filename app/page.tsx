"use client";

import { fetcher } from "@/lib/requests";
import useSWR from "swr";
import DOMPurify from "dompurify";
import { useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Banknote, MapPin, PencilLine, ScrollText, Timer } from "lucide-react";
import numeral from "numeral";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { ApplyDialog } from "@/app/components/apply-dialog";

export default function Home() {
  const { data, isLoading } = useSWR<Job[]>("/api/jobs", fetcher);
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    // still kinda suspicious, requires refresh to work since window.innerWidth
    // doesn't trigger side-effects

    // purpose is to allow text selection on desktop where people may want to copy/pasta into gpt
    // or other tools to help write/modify resumes/cover letters
    // and dragging makes it hard to drag-to-select
    if (window?.innerWidth > 640) {
      api?.reInit({ watchDrag: false });
    }
  }, [api, window?.innerWidth]);

  const jobPanels = useMemo(() => {
    return data?.map((job) => (
      <CarouselItem key={job.id} className="flex flex-col h-full">
        <div className="flex flex-col gap-2 h-[280px] p-8 justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">{job.name}</h2>
            <div className="flax items-center gap-2">
              {job.departments?.map((department) => (
                <div
                  key={department}
                  className="bg-gray-200 flex py-0.5 px-2 rounded-md w-fit text-sm"
                >
                  {department}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <span>
                {formatDistance(new Date(job.opened_at), new Date(), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5" />
              <span>{job.employment_type ?? "Full-Time"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              {job.salary_details ? (
                <span className="py-1 px-1 rounded-md font-semibold">
                  ${numeral(job.salary_details?.min_value ?? 0).format("0,0a")}{" "}
                  - $
                  {numeral(job.salary_details?.max_value ?? 0).format("0,0a")}
                </span>
              ) : (
                <span>TBD</span>
              )}
            </div>
          </div>
        </div>
        <div className="p-8 pt-12 flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Mission</h1>
          <span
            className=""
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(job.content),
            }}
          />
        </div>
      </CarouselItem>
    ));
  }, [data]);

  return (
    <main className="flex min-h-screen max-w-[100vw] flex-col items-center justify-between p-0 sm:p-24 pb-16 bg-neutral-100">
      <div className="absolute h-[280px] sm:h-[380px] w-full bg-orange-400 top-0 left-0" />
      <div className="relative w-full max-w-screen-lg">
        <Carousel className="flex w-full" setApi={setApi}>
          <CarouselContent className="w-full">{jobPanels}</CarouselContent>
          <CarouselNext className="absolute hidden sm:flex bg-primary text-white hover:bg-primary hover:opacity-80 hover:text-white" />
          <CarouselPrevious className="absolute hidden sm:flex bg-primary text-white hover:bg-primary hover:opacity-80 hover:text-white" />
        </Carousel>
      </div>
      <div className="fixed bottom-0 py-4 w-full bg-white flex items-center justify-center">
        <ApplyDialog job={data?.[activeIndex]}>
          <Button className="bg-orange-400 hover:bg-orange-500 text-primary px-24 py-6 flex justify-center -ml-4">
            <div className="flex gap-2 items-center">
              <PencilLine className="h-6 w-6 -ml-4" />
              <span className="font-semibold">Apply</span>
            </div>
          </Button>
        </ApplyDialog>
      </div>
    </main>
  );
}
