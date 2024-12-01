import GitHubActivityGraph from "@/components/GitHubActivityGraph.tsx";
import { useState } from "react";
import { Form, redirect, useActionData } from "react-router";
// import type {ClientActionArgs} from "@react-router/dev"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ContributionData {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: {
              date: string; // ISO date format: "YYYY-MM-DD"
              contributionCount: number;
            }[];
          }[];
        };
      };
    };
  };
}

export interface FilteredData {
  date: string;
  contributionCount: number;
}

interface Final_data {
  date: string;
  commit: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const clientAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const { username, year } = Object.fromEntries(formData);

  if (!username || !year) {
    throw new Error("Username and Year are required.");
  }

  const queryBody = {
    query: `
      query($userName: String!, $startDate: DateTime!, $endDate: DateTime!) {
        user(login: $userName) {
          contributionsCollection(from: $startDate, to: $endDate) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      userName: username || "bisw4sh",
      startDate: `${year}-01-01T00:00:00Z`,
      endDate: `${year}-12-31T23:59:59Z`,
    },
  };

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN_CLASSIC}`,
      },
      body: JSON.stringify(queryBody),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data_obj: ContributionData = await response.json();
    const filtered: FilteredData[] =
      data_obj.data.user.contributionsCollection.contributionCalendar.weeks
        .flatMap((week) => week.contributionDays)
        .map((day) => ({
          date: day.date,
          contributionCount: day.contributionCount,
        }));

    console.log(filtered);
    return filtered;
  } catch (error) {
    console.error("Error during fetch:", error);
  }

  return redirect("/");
};

function App() {
  const date = new Date();
  const [year, setYear] = useState<number>(date.getFullYear());
  const action_data = useActionData<FilteredData[]>();
  const [clicked, setClicked] = useState<number[]>(new Array(366).fill(0));

  const handleDownload = () => {
    const data_Obj: Final_data[] = [];

    action_data?.forEach((dc, idx) => {
      if (clicked[idx] > 0) {
        data_Obj.push({ date: dc.date, commit: clicked[idx] });
      }
    });

    const jsonData = JSON.stringify(data_Obj, null, 2);

    const blob = new Blob([jsonData], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "backdates.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-4 text-center">
          GitHub Activity Graph
        </h1>
        <p className="text-center mb-4">
          Click on the cells to increment the activity count! Refresh the page
          to reset the canvas and details
        </p>
        <section className="w-full flex flex-row justify-around items-start gap-3">
          <GitHubActivityGraph
            year={year}
            daycon={action_data}
            clicked={clicked}
            setClicked={setClicked}
          />
          <aside className="flex flex-col justify-between items-center gap-3 py-2">
            <div className="flex gap-[2px] items-center justify-center">
              <h1 className="text-[9px] mr-1">Less</h1>
              <div className="h-[14px] w-[14px] bg-slate-200" />
              <div className="h-[14px] w-[14px] bg-ghgreen-1" />
              <div className="h-[14px] w-[14px] bg-ghgreen-2" />
              <div className="h-[14px] w-[14px] bg-ghgreen-3" />
              <div className="h-[14px] w-[14px] bg-ghgreen-4" />
              <h1 className="text-[9px] ml-1">More</h1>
            </div>
            <Form className="w-[8rem] flex flex-col gap-2" method="POST">
              <Input type="text" placeholder="Username" name="username" />
              <Input
                type="number"
                placeholder="Year"
                className="no-spinners"
                name="year"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    setYear(value);
                  }
                }}
              />
              <Button variant="default" type="submit">
                Fetch
              </Button>
            </Form>
            <Button
              variant="destructive"
              className="self-start w-[8rem]"
              onClick={handleDownload}
            >
              Download
            </Button>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default App;
