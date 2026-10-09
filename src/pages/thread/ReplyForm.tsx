import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState, type RefObject, type SubmitEvent } from "react";
import { useReply } from "../../api/hooks/useReply";
import { InlineError } from "../../error-handling/components/InlineError";

const HEADING_ID = "reply-heading";
const HINT = "Markdown is supported.";

type ReplyFormProps = {
  conversationId: string;
  /** The text field, so the pinned Reply button can send focus to it. */
  fieldRef: RefObject<HTMLTextAreaElement | null>;
};

/** The one place to answer a thread. The reply shows in the thread once the server has taken it, not before. */
export const ReplyForm = ({ conversationId, fieldRef }: ReplyFormProps) => {
  const reply = useReply(conversationId);
  const [content, setContent] = useState("");
  const [missing, setMissing] = useState(false);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reply.isPending) {
      return;
    }
    if (content.trim() === "") {
      setMissing(true);
      fieldRef.current?.focus();
      return;
    }
    reply.mutate(content, { onSuccess: () => setContent("") });
  };

  return (
    <Box component="form" noValidate aria-labelledby={HEADING_ID} onSubmit={submit}>
      <Typography id={HEADING_ID} variant="h2" sx={{ mb: 1.5 }}>
        Your reply
      </Typography>
      <TextField
        id="reply-content"
        inputRef={fieldRef}
        multiline
        minRows={4}
        fullWidth
        placeholder="Write a reply"
        value={content}
        error={missing}
        helperText={missing ? "Write your reply before you post it." : HINT}
        onChange={(event) => {
          setContent(event.target.value);
          setMissing(false);
          // A refusal is about the reply as it was sent. Once it is edited, the message no longer applies.
          if (reply.isError) {
            reply.reset();
          }
        }}
        slotProps={{
          htmlInput: { "aria-labelledby": HEADING_ID, "aria-required": true, readOnly: reply.isPending },
          formHelperText: { sx: { mx: 0, typography: "caption" } },
        }}
      />
      {reply.isError && (
        <Box sx={{ mt: 1.5 }}>
          <InlineError message={reply.error.message} />
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Typography role="status" variant="body2" color="text.secondary">
          {reply.isPending ? "Posting your reply…" : reply.isSuccess ? "Your reply is posted." : ""}
        </Typography>
        {/* Not `disabled` while posting: the button has focus, and a disabled button would drop it. */}
        <Button
          type="submit"
          variant="contained"
          aria-disabled={reply.isPending || undefined}
          startIcon={reply.isPending ? <CircularProgress aria-hidden size={16} color="inherit" /> : undefined}
        >
          Post reply
        </Button>
      </Box>
    </Box>
  );
};
