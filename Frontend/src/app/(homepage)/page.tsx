import { cookies } from "next/headers";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Feature from "./components/Feature";
import Pricing from "./components/Pricing";
import Service from "./components/Service";
import Blog from "./components/Blog";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import { getHomepageLocale, homepageCopy } from "./i18n";

const HomePage = async () => {
  const cookieStore = await cookies();
  const locale = getHomepageLocale(cookieStore.get("locale")?.value);
  const copy = homepageCopy[locale];

  return (
    <>
      <Header locale={locale} copy={copy} />
      <Hero locale={locale} copy={copy.hero} actions={copy.actions} />
      <About locale={locale} copy={copy.about} actions={copy.actions} />
      <Feature copy={copy.features} />
      <Pricing locale={locale} copy={copy.pricing} actions={copy.actions} />
      <Service locale={locale} copy={copy.service} actions={copy.actions} />
      <Blog locale={locale} copy={copy.blog} actions={copy.actions} />
      <CTA locale={locale} copy={copy.cta} actions={copy.actions} />
      <Footer copy={copy.footer} actions={copy.actions} />
    </>
  );
};

export default HomePage;
