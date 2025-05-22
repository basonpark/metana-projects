"use client";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  score: number;
  maxStars?: number;
  showScore?: boolean;
}

export const StarRating = ({
  score,
  maxStars = 10,
  showScore = true,
}: StarRatingProps) => {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = maxStars - Math.ceil(score);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="w-4 h-4 text-slate-600" />
          <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400 absolute top-0 left-0" />
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-slate-600" />
      ))}
      {showScore && <span className="ml-2 text-slate-300">({score})</span>}
    </div>
  );
};
