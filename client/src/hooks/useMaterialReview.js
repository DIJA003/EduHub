import { useState } from "react";
import {
  useApproveMaterial,
  useRejectMaterial,
} from "../features/materials/hooks/useMaterials";

export function useMaterialReview() {
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [feedback, setFeedback] = useState("");

  const approveMutation = useApproveMaterial();
  const rejectMutation = useRejectMaterial();

  const openReview = (material, action) => {
    setReviewTarget(material);
    setReviewAction(action);
    setFeedback("");
  };

  const closeReview = () => {
    setReviewTarget(null);
    setReviewAction("");
    setFeedback("");
  };

  const submitReview = (onSuccess) => {
    const mutation =
      reviewAction === "approve" ? approveMutation : rejectMutation;
    mutation.mutate(
      { id: reviewTarget._id, feedback },
      {
        onSuccess: () => {
          closeReview();
          onSuccess?.();
        },
      },
    );
  };

  const isLoading = approveMutation.isPending || rejectMutation.isPending;

  return {
    reviewTarget,
    reviewAction,
    feedback,
    setFeedback,
    openReview,
    closeReview,
    submitReview,
    isLoading,
  };
}
