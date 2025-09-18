import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { useCreateNewConversation } from "@/hooks/conversation/use-create-conversation";

export default function StartNewSession() {
  const { mutateAsync: createConversation, isPending } =
    useCreateNewConversation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      createConversation(file);
    } else {
      alert("Only PDF is supported");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="text-center max-w-100">
        <h3 className="heading-5">Start New Conversation</h3>
        <p className="text-text-secondary text-base font-normal">
          Launch a new AI-powered document conversation session now by uploading
          your document
        </p>
      </div>

      <Button asChild>
        <Label htmlFor="document" className="flex gap-2">
          {isPending && <Spinner size={20} />}{" "}
          {isPending ? <span>Uploading</span> : <span>Upload</span>}
        </Label>
      </Button>

      <input
        type="file"
        className="hidden"
        id="document"
        accept=".pdf"
        onChange={handleFileChange}
      />
    </div>
  );
}
