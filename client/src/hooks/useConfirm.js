import { useState, useCallback } from "react";
import ConfirmDialog from "../components/common/ConfirmDialog";

export function useConfirm() {
  const [state, setState] = useState({
    open: false,
    title: "",
    message: "",
    resolve: null,
  });

  const confirm = useCallback((message, title = "Confirm") => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((s) => {
      s.resolve?.(true);
      return { ...s, open: false };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState((s) => {
      s.resolve?.(false);
      return { ...s, open: false };
    });
  }, []);

  const confirmDialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel="Confirm"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirmDialog, confirm };
}
