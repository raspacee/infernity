import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";

const FlashCard = ({
  frontContent,
  backContent,
}: {
  frontContent: string;
  backContent: string;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="bg-fill2 flex items-center justify-center bg-gradient-to-br p-4">
      <div className="perspective-1000 w-full">
        <div
          className={`transform-style-3d relative h-64 w-full cursor-pointer transition-transform duration-500 ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={handleFlip}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front of card */}
          <Card
            className="absolute h-full w-full overflow-y-scroll shadow-xl transition-shadow backface-hidden hover:shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardContent className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <p className="text-2xl font-semibold text-slate-800">
                  {frontContent}
                </p>
                <p className="mt-4 text-sm text-slate-500">Click to flip</p>
              </div>
            </CardContent>
          </Card>

          {/* Back of card */}
          <Card
            className="absolute h-full w-full overflow-y-scroll bg-blue-50 py-4 shadow-xl transition-shadow backface-hidden hover:shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardContent className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-900">
                  {backContent}
                </p>
                <p className="mt-4 text-sm text-blue-600">Click to flip back</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
