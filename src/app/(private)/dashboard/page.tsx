import { GridCards } from "@/components/dashboard/grid-cards";
import { OnboardingChecklist } from "@/components/frigade/onboarding-checklist";

const GettingStartedSteps = async () => {
  return (
    <main className="space-y-8 p-8">
      {/* <div>
        <div className="mb-8 text-left">
          <h1 className="text-xl font-semibold tracking-tight text-black">
            Your LinkedIn Growth Journey Begins!
          </h1>
          <p className="text-sm text-gray-500">
            Follow these steps to supercharge your LinkedIn presence and start
            creating impactful content.
          </p>
        </div>

        <OnboardingChecklist />
      </div> */}
      <div>
        <div className="mb-8 text-left">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Explore Our Features and Resources
          </h1>
          <p className="text-sm text-muted-foreground">
            Discover how our tools and resources can help you enhance your
            LinkedIn presence and achieve your goals.
          </p>
        </div>
        <GridCards />
      </div>
    </main>
  );
};

export default GettingStartedSteps;
