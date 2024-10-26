import { getDrafts } from "@/actions/draft";
import Calendar from "@/components/scheduler/calendar-component";
export const dynamic = "force-dynamic";
import { Draft } from "@/actions/draft";

interface GetDraftsResult {
  success: boolean;
  message: string;
  data: Draft[];
}

const SchedulerPage = async () => {
  let drafts: Draft[] = [];
  try {
    const result = (await getDrafts("scheduled")) as GetDraftsResult;
    drafts = result.success ? result.data : [];
  } catch (error) {
    console.error("Error fetching drafts:", error);
  }

  return (
    <div className="p-4">
      <Calendar drafts={drafts} />
    </div>
  );
};

export default SchedulerPage;
