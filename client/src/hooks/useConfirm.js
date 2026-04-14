import { useState, useCallback } from "react";

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
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false }));
  }, [state]);

  const ConfirmDialog = require("../components/common/ConfirmDialog").default;

  const confirmDialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel="Delete"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirmDialog, confirm };
}
