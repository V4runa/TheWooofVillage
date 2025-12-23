import { LandingHeader } from "@/components/LandingHeader";
import { Container } from "@/components/ui/Container";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Container size="md" className="py-10">
        <Card
          variant="elevated"
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <CardHeader className="pb-2">
            <LandingHeader />
          </CardHeader>

          <CardContent className="pt-3">
            <p className="text-sm text-gray-700">
              Browse available pups, reserve with a deposit, and message us with
              any questions.
            </p>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
