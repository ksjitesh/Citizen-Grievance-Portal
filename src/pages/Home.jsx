import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import DashboardPreview from "../components/DashboardPreview";
import Footer from "../components/Footer";

function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A] dark:bg-black dark:text-white">
      <Navbar />

      <Hero />

      <Stats />

      <Features />

      <HowItWorks />

      <DashboardPreview />

      <Footer />
    </main>
  );
}

export default Home;