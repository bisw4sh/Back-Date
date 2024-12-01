import { cn } from "@/lib/utils";
import { FilteredData } from "../App.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GitHubActivityGraph = ({
  year,
  daycon,
  clicked,
  setClicked,
}: {
  year: number;
  daycon: FilteredData[] | undefined;
  clicked: number[];
  setClicked: (updater: (prevClicked: number[]) => number[]) => void;
}) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const squares = Array.from({ length: 365 }, (_, index) => index);
  const yr = new Date(`January 1, ${year}`);
  const start = yr.getDay();
  const max = Math.max(...(daycon?.map((day) => day.contributionCount) || []));

  const updateClicked = (index: number, value: number) => {
    setClicked((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = [...prev];
      updated[index] += value;
      return updated;
    });
  };

  return (
    <section className="space-y-2">
      <ul className="flex justify-around px-4">
        {months.map((month) => (
          <li key={month}>{month}</li>
        ))}
      </ul>

      <div className="p-4 bg-white rounded-lg shadow-md grid grid-rows-7 grid-flow-col gap-1 col-start-3">
        {/* the days text */}
        {daysOfWeek.map((day) => (
          <aside key={day} className="text-[7px] lowercase text-center">
            {day}
          </aside>
        ))}

        {/* invisble boxes to align */}
        {Array.from({ length: start }, (_, index) => index).map((_, index) => (
          <div className="h-[14px] w-[14px] bg-transparent" key={index}></div>
        ))}

        {/* legit activity squares */}
        {daycon
          ? daycon.map((dc, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={cn(
                        "h-[14px] w-[14px] bg-slate-200 rounded-[3px]",
                        dc.contributionCount + clicked[index] > 0 &&
                          dc.contributionCount + clicked[index] <= max / 4 &&
                          "bg-ghgreen-1",
                        dc.contributionCount + clicked[index] > max / 4 &&
                          dc.contributionCount + clicked[index] <= max / 2 &&
                          "bg-ghgreen-2",
                        dc.contributionCount + clicked[index] > max / 2 &&
                          dc.contributionCount + clicked[index] <=
                            (3 * max) / 4 &&
                          "bg-ghgreen-3",
                        dc.contributionCount + clicked[index] > (3 * max) / 4 &&
                          "bg-ghgreen-4"
                      )}
                      onClick={() =>
                        updateClicked(
                          index,
                          Math.floor(max / 4) < 1 ? 1 : Math.floor(max / 4)
                        )
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{`${dc.contributionCount + clicked[index]} contribution${
                      dc.contributionCount + clicked[index] > 1 ? "s" : ""
                    } on ${
                      months[
                        Math.floor(index / 30) < 12
                          ? Math.floor(index / 30)
                          : 11
                      ]
                    } ${dc.date.slice(8, 10)}`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          : squares.map((_, index) => (
              <div
                className={cn(
                  "h-[14px] w-[14px] bg-slate-200 rounded-[3px]",
                  index % 23 == 0 && "bg-ghgreen-1",
                  index % 26 == 0 && "bg-ghgreen-2",
                  index % 25 == 0 && "bg-ghgreen-3",
                  index % 24 == 0 && "bg-ghgreen-4"
                )}
                key={index}
              ></div>
            ))}
      </div>
    </section>
  );
};

export default GitHubActivityGraph;
