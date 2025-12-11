import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VAISFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VAISFeedbackModal({
  open,
  onOpenChange,
}: VAISFeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSendFeedback = () => {
    if (!rating || !comment.trim()) {
      alert("Please provide a rating and comment");
      return;
    }

    console.log("VAIS Feedback submitted:", { rating, comment });
    setRating(null);
    setComment("");
    onOpenChange(false);

    toast({
      title: "Thank you for your feedback!",
      description:
        "We appreciate your input and will use it to improve our service.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white p-0">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Rate your experience! 👋
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Text */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-gray-700 leading-relaxed">
              We love to hear from you! How's your experience with the{" "}
              <span className="text-valasys-orange font-medium">
                Valasys AI Score
              </span>
              ?
            </p>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="transition-all duration-200 hover:scale-110"
                  type="button"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-all duration-200",
                      hoveredRating !== null && star <= hoveredRating
                        ? "fill-gray-400 text-gray-400"
                        : rating !== null && star <= rating
                          ? "fill-gray-400 text-gray-400"
                          : "text-gray-300",
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Subtext */}
            <p className="text-xs text-gray-500">
              Your feedback helps us improve our service.
              <br />
              Please share your thoughts and suggestions below.
            </p>
          </div>

          {/* Comment Input */}
          <textarea
            placeholder="Any comment for us?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-valasys-orange focus:border-transparent min-h-28"
          />

          {/* Submit Button */}
          <Button
            onClick={handleSendFeedback}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-base"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
