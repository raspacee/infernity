import { Conversation } from "@/types/conversation.types";
import { Button } from "../ui/button";
import { DialogBody, DialogClose, DialogFooter } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import {
  UpdateConversationFields,
  updateConversationSchema,
} from "@/validators/conversation.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateConversation } from "@/hooks/conversation/use-update-conversation";

export default function UpdateConversationForm({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { mutateAsync: updateConversation, isPending } =
    useUpdateConversation();

  const form = useForm<UpdateConversationFields>({
    resolver: zodResolver(updateConversationSchema),
    defaultValues: {
      title: conversation.title,
    },
  });

  const onSubmit = (data: UpdateConversationFields) => {
    updateConversation({ ...data, id: conversation.id });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <DialogBody>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="What do you want to rename it to?"
                    {...field}
                    type="text"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button color="neutral" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
