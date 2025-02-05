import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import Balancer from "react-wrap-balancer";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Send, SquarePen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ApplyDialog({
  children,
  job,
}: {
  children: React.ReactNode;
  job?: Job;
}) {
  const { register, handleSubmit, reset } = useForm();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: Record<string, any>) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof FileList) {
        if (value.length > 0) {
          formData.append(key, value[0]);
        } else {
          formData.append(key, "");
        }
      } else {
        formData.append(key, value);
      }
    });

    reset();
    setOpen(false);

    const res = await fetch("/api/application", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      toast({
        description: "Error submitting form",
        title: res.status.toString(),
        duration: 3000,
      });
    } else {
      toast({
        title: "Application submitted!",
        description: `Thank you for your interest in ${job?.name}.`,
        duration: 3000,
      });
    }
  };

  const jobQuestions = useMemo(() => {
    return job
      ? job?.questions.map((question) => {
          const inputType =
            question.name === "phone"
              ? "tel"
              : question.name === "email"
              ? "email"
              : question.type === "short_text"
              ? "text"
              : question.type === "long_text"
              ? "textarea"
              : question.type === "attachment"
              ? "file"
              : "text";

          return (
            <div key={question.name} className="flex flex-col gap-1">
              <Label className="font-semibold" htmlFor={question.name}>
                {question.label}
              </Label>
              {inputType !== "textarea" ? (
                <Input
                  id={question.name}
                  placeholder={question.label}
                  type={inputType}
                  required={!!question.required}
                  pattern={inputType === "tel" ? "[0-9]*" : undefined}
                  {...register(question.name)}
                />
              ) : (
                <textarea
                  id={question.name}
                  placeholder={question.label}
                  required={question.required}
                  className="resize-none h-24 border border-gray-300 rounded-md p-2"
                  {...register(question.name)}
                />
              )}
            </div>
          );
        })
      : null;
  }, [job]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col gap-8 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center gap-2 sm:justify-start">
            <SquarePen className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Submit application</span>
          </DialogTitle>
          <DialogDescription>
            <Balancer>
              Please verify entries as they cannot be modified once sent. Click
              save when you're done.
            </Balancer>
          </DialogDescription>
        </DialogHeader>
        <form
          id="application-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {jobQuestions}
          <Input type="hidden" value={job?.id} {...register("job_id")} />
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="application-form"
            className="flex justify-center items-center gap-2"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Send</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
