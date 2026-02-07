import Sources from "./sources";
import FlashCards from "./flash-cards";
import MindMap from "./mind-map";

export default function PdfFeaturesButtons() {
  return (
    <div className="ml-10 flex gap-2">
      <FlashCards />
      <MindMap />
      <Sources />
    </div>
  );
}
