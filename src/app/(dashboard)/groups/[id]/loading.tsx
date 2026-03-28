import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GroupDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full hidden md:block" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-64 rounded-2xl" />
          <Skeleton className="h-5 w-40 rounded-xl" />
        </div>
      </div>

      <Skeleton className="h-52 rounded-[2.5rem] w-full" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <Skeleton className="h-6 w-40 rounded-xl" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1">
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
        <div>
          <Card className="rounded-2xl">
            <CardHeader>
              <Skeleton className="h-6 w-24 rounded-xl" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                    <Skeleton className="h-3 w-16 rounded-lg" />
                  </div>
                </div>
              ))}
              <Skeleton className="h-11 w-full rounded-xl mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
