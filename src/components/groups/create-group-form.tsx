"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createGroup } from "@/lib/actions/group.actions";
import { GroupType } from "@prisma/client";

const createGroupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters").max(50),
  description: z.string().max(200).optional(),
});

export default function CreateGroupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof createGroupSchema>) => {
    setIsLoading(true);
    try {
      const res = await createGroup({
        name: values.name,
        description: values.description,
        type: GroupType.OTHER, // Defaults for now
        baseCurrency: "INR",
      });

      if (res.success && res.group) {
        toast.success("Group created successfully!");
        router.push(`/groups/${res.group.id}`);
      } else {
        toast.error(res.error || "Failed to create group");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Group Name
        </label>
        <Input
          id="name"
          placeholder="e.g. Goa Trip, Apartment 4B"
          className="h-12 rounded-xl text-lg px-4 border-primary/30 focus-visible:ring-primary/50"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Description (Optional)
        </label>
        <Input
          id="description"
          placeholder="What's this group for?"
          className="h-12 rounded-xl text-base px-4 border-primary/30 focus-visible:ring-primary/50"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        size="lg"
        className="w-full h-14 rounded-xl text-lg font-medium shadow-md">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...
          </>
        ) : (
          "Create Group"
        )}
      </Button>
    </form>
  );
}
