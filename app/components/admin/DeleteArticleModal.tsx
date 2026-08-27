"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteArticleModal({
  articleTitle,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  articleTitle: string | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {articleTitle !== null && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-marica-rose-deep/10 text-marica-rose-deep"
            >
              <AlertTriangle className="h-7 w-7" />
            </motion.div>

            <h3 className="mt-4 font-display text-lg font-semibold text-marica-ink">
              Hapus Artikel?
            </h3>
            <p className="mt-2 font-body text-sm text-marica-ink-soft">
              Apakah kamu yakin ingin menghapus artikel{" "}
              <span className="font-semibold text-marica-ink">&ldquo;{articleTitle}&rdquo;</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 rounded-full border border-black/10 py-2.5 font-body text-sm font-semibold text-marica-ink-soft transition hover:bg-black/3 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-marica-rose-deep py-2.5 font-body text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
