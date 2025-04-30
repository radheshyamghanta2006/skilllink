import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { FeaturedProviders } from "@/components/featured-providers"
import { HowItWorks } from "@/components/how-it-works"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <CategorySection />
        <HowItWorks />
        <FeaturedProviders />
        <section className="py-16 bg-gradient-to-r from-purple-100 to-blue-100">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Connect?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join our community today and start exchanging skills with people in your neighborhood.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/explore">Explore Skills</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
