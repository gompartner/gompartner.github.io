import { careerItems } from "@/data/career";
import { TimelineItem } from "./TimelineItem";

export function Timeline() {
  return (
    <div aria-label="경력 타임라인">
      {careerItems.map((item, index) => (
        <TimelineItem
          key={item.id}
          item={item}
          index={index}
          isLast={index === careerItems.length - 1}
        />
      ))}
    </div>
  );
}
