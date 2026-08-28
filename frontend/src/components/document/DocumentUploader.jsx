import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, FileText, FileType, CheckCircle2, AlertCircle } from "lucide-react";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
};

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

export default function DocumentUploader({ onFileAccepted, compact = false }) {
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [progress, setProgress] = useState(0);
  const [activeFile, setActiveFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const runUploadAnimation = useCallback(
    (file) => {
      setActiveFile(file);
      setStatus("uploading");
      setProgress(0);
      setErrorMessage("");

      let pct = 0;
      const tick = setInterval(() => {
        pct = Math.min(pct + Math.random() * 28 + 12, 100);
        setProgress(pct);
        if (pct >= 100) {
          clearInterval(tick);
          setStatus("success");
          onFileAccepted(file);
          setTimeout(() => setStatus("idle"), 1400);
        }
      }, 160);
    },
    [onFileAccepted]
  );

  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected?.length) {
        setStatus("error");
        setErrorMessage(rejected[0].errors[0]?.message ?? "That file couldn't be uploaded.");
        return;
      }
      if (accepted?.length) runUploadAnimation(accepted[0]);
    },
    [runUploadAnimation]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    maxSize: 25 * 1024 * 1024,
  });

  const isBusy = status === "uploading";

  if (compact) {
    return (
      <button
        {...getRootProps()}
        disabled={isBusy}
        className="flex items-center gap-2 rounded-md border border-line bg-paper-2 px-3 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-brass hover:bg-paper-3 disabled:opacity-60"
      >
        <input {...getInputProps()} />
        {isBusy ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-brass" />
            Uploading… {Math.round(progress)}%
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 size={14} className="text-verified" /> Uploaded
          </>
        ) : (
          <>
            <UploadCloud size={14} /> Upload Document
          </>
        )}
      </button>
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragActive ? "border-brass bg-paper-2" : "border-line bg-paper-2 hover:border-brass-light"
        } ${isBusy ? "cursor-wait" : ""}`}
      >
        <input {...getInputProps()} disabled={isBusy} />

        <AnimatePresence mode="wait">
          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-xs flex-col items-center gap-3"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-3 text-brass-dark">
                <UploadCloud size={22} className="animate-pulse" />
              </span>
              <p className="truncate text-[13.5px] font-medium text-ink">{activeFile?.name}</p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <motion.div
                  className="h-full rounded-full bg-brass"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.15 }}
                />
              </div>
              <p className="text-[11.5px] text-slate-light">{Math.round(progress)}% · {formatSize(activeFile?.size)}</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verified-bg text-verified">
                <CheckCircle2 size={22} />
              </span>
              <p className="text-[14px] font-medium text-ink">{activeFile?.name} uploaded</p>
              <p className="text-[12px] text-slate">Ready for research and analysis.</p>
            </motion.div>
          )}

          {(status === "idle" || status === "error") && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-3 text-brass-dark">
                <UploadCloud size={22} />
              </span>
              <div>
                <p className="text-[14px] font-medium text-ink">
                  {isDragActive ? "Drop the file to upload" : "Drag and drop a document, or click to browse"}
                </p>
                <p className="mt-1 text-[12.5px] text-slate">Supports PDF and TXT files up to 25MB</p>
              </div>
              <div className="mt-1 flex items-center gap-4 text-[11.5px] text-slate-light">
                <span className="flex items-center gap-1.5">
                  <FileText size={13} /> PDF
                </span>
                <span className="flex items-center gap-1.5">
                  <FileType size={13} /> TXT
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(fileRejections.length > 0 || (status === "error" && errorMessage)) && (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-alert">
          <AlertCircle size={13} />
          {errorMessage || fileRejections[0]?.errors[0]?.message || "That file couldn't be uploaded."}
        </p>
      )}
    </div>
  );
}
