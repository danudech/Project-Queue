import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

type BlogProps = {
  locale: HomepageLocale;
  copy: HomepageCopy["blog"];
  actions: HomepageCopy["actions"];
};

const Blog = ({ locale, copy, actions }: BlogProps) => {
  return (
    <section className="section pb-0 bg-blog" id="blog">
      <div className="ez-container">
        <div className="ez-section-heading ez-section-heading-wide">
          <span className="ez-badge">{copy.badge}</span>
          <h2 className="ez-section-title">{copy.title}</h2>
        </div>

        <div className="ez-blog-grid">
          {copy.items.map((item) => (
            <article className="blog-card" key={item.title}>
              <div className="blog-image-wrap">
                <Image
                  src={item.image}
                  alt={item.title}
                  className="blog-img"
                  width={325}
                  height={300}
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, 325px"
                />
              </div>
              <div className="blog-body">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link href={localePath(locale, "/dashboard")} className="ez-inline-link">
                  {actions.readCase}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
