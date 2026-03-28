import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ExpensesLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-12 w-48 rounded-2xl" />
          <Skeleton className="h-5 w-64 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-2xl">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-24 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-36 rounded-xl" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
