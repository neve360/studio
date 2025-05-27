
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-2xl mx-auto p-4">
      <Card className="w-full shadow-2xl">
        <CardHeader className="items-center text-center">
          <Trophy className="h-20 w-20 text-primary mb-4 opacity-50" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2">
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24 hidden sm:block" />
              </div>
            ))}
          </div>
           <div className="flex justify-center mt-8">
             <Loader2 className="h-12 w-12 text-primary animate-spin" />
           </div>
        </CardContent>
        <CardFooter className="mt-6">
          <Skeleton className="h-12 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
}
