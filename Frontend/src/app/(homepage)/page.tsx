import { cookies } from "next/headers";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Feature from "./components/Feature";
import Workflow, { type WorkflowCopy } from "./components/Workflow";
import Service from "./components/Service";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import { getHomepageLocale, homepageCopy } from "./i18n";

const HomePage = async () => {
  const cookieStore = await cookies();
  const locale = getHomepageLocale(cookieStore.get("locale")?.value);
  const copy = homepageCopy[locale];
  const workflow: WorkflowCopy = "workflow" in copy
    ? copy.workflow
    : {
        badge: "วิธีใช้งาน",
        title: "ตั้งค่าร้าน รับจอง และบริหารคิว",
        description: "ระบบเชื่อมข้อมูลระหว่างเจ้าของร้าน พนักงาน และลูกค้าไว้ในขั้นตอนเดียว",
        stepLabel: "ขั้นตอน",
        steps: [
          { title: "ตั้งค่าสาขา", description: "เพิ่มบริการ พนักงาน เวลาทำการ วันหยุด และกติกาการจองของแต่ละบริการ" },
          { title: "ลูกค้าเลือกเวลา", description: "ลูกค้าเลือกบริการและช่วงเวลาจากหน้าจองสาธารณะ โดยไม่ต้องใช้ OTP" },
          { title: "พนักงานดูแลคิว", description: "ทีมงานเห็นรายการจอง เรียกคิว ปรับสถานะ และให้บริการได้ต่อเนื่อง" },
        ],
      };

  return (
    <>
      <Header locale={locale} copy={copy} />
      <Hero locale={locale} copy={copy.hero} actions={copy.actions} />
      <About copy={copy.about} actions={copy.actions} />
      <Feature copy={copy.features} />
      <Workflow copy={workflow} />
      <Service copy={copy.service} />
      <CTA locale={locale} copy={copy.cta} actions={copy.actions} />
      <Footer copy={copy.footer} />
    </>
  );
};

export default HomePage;
