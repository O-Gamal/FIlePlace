import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
  search: z.string().min(0).max(200),
});

type FormValues = z.infer<typeof formSchema>;

const SearchBar = () => {
  const router = useRouter();
  const searchParmas = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: searchParmas.get("q") ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    router.push(`?q=${values.search}`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-4 w-1/3 "
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    type="search"
                    placeholder="Search for a file..."
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />
        <Button type="submit">
          <SearchIcon className="w-5 h-5" />
        </Button>
      </form>
    </Form>
  );
};

export default SearchBar;
