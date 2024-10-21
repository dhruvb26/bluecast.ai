import * as Frigade from "@frigade/react";
import { env } from "@/env";
const TourVideoAnnouncement = () => {
  return (
    <Frigade.Announcement
      dismissible={true}
      className="[&_.fr-title]:text-xl [&_.fr-title]:font-semibold [&_.fr-title]:tracking-tight [&_.fr-subtitle]:text-sm [&_.fr-subtitle]:text-muted-foreground [&_.fr-card]:focus:outline-none [&_.fr-card]:focus:ring-0"
      flowId={
        env.NODE_ENV === "development" ? "flow_3VBfmKHD" : "flow_3VBfmKHD"
      }
    />
  );
};
export default TourVideoAnnouncement;
