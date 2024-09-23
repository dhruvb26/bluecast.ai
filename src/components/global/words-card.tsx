import React from "react";
import {
  Card,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WordsCardProps {
  words: number;
}

const WordsCard: React.FC<WordsCardProps> = ({ words }) => {
  const wordsGenerated = words;
  const wordLimit = 50000;
  const wordPercentage = (wordsGenerated / wordLimit) * 100;
  const formatNumber = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };

  return (
    <>
      {/* <p className="text-xs text-center text-brand-gray-500 mb-2">
        Press{" "}
        <span className="inline-flex items-center">
          ⌘<span className="mx-0.5">+</span>S
        </span>{" "}
        to collapse
      </p> */}
      <Card className="border-none p-0 w-full">
        <CardHeader className="p-2 pt-2 md:p-2">
          <CardTitle className="mb-2 flex items-center justify-between">
            <Badge className="bg-blue-600 text-xs">Launch</Badge>
            <span className="text-xs text-foreground">
              {formatNumber(wordsGenerated)} / {formatNumber(wordLimit)}
            </span>
          </CardTitle>
          <div className="mb-2 h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
              style={{ width: `${wordPercentage}%` }}
            ></div>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            This plan allows you to generate 50k words as of now. More features
            & plans coming soon.
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  );
};

export default WordsCard;
