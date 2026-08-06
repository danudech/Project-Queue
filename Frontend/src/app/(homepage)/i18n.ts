export const homepageLocales = ["en", "th"] as const;

export type HomepageLocale = (typeof homepageLocales)[number];

export const defaultHomepageLocale: HomepageLocale = "en";

export const isHomepageLocale = (locale?: string): locale is HomepageLocale =>
  homepageLocales.includes(locale as HomepageLocale);

export const getHomepageLocale = (locale?: string): HomepageLocale =>
  isHomepageLocale(locale) ? locale : defaultHomepageLocale;

export const localePath = (locale: HomepageLocale, path: string) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${cleanPath}`;
};

export const homepageCopy = {
  en: {
    language: {
      label: "Language",
      thai: "TH",
      english: "EN",
    },
    nav: {
      home: "Home",
      about: "About",
      features: "Features",
      howItWorks: "How it works",
      service: "Solutions",
    },
    actions: {
      login: "Log in",
      signup: "Sign up",
      tryFree: "Try it for free",
      learnMore: "Explore features",
      readMore: "Explore platform",
      buyNow: "Choose plan",
      exploreMore: "Explore more",
      readCase: "Read use case",
      getStarted: "Get started",
      subscribe: "Subscribe",
    },
    hero: {
      badge: "Queue, booking, staff, customer, payment",
      title: "A calmer way to run bookings, queues, staff, and payments",
      description:
        "EZQueue helps service businesses manage public booking, live queues, staff workload, customer records, invoices, payments, and shop settings from one API-ready frontend.",
      imageAlt: "EZQueue dashboard preview for queue and booking operations",
      eyebrow: "API-ready frontend for service operations",
      metrics: [
        { value: "38", label: "Bookings today" },
        { value: "12m", label: "Average wait" },
        { value: "97%", label: "Payment success" },
      ],
      preview: {
        title: "Live branch overview",
        subtitle: "Main branch queue",
        waiting: "Waiting",
        serving: "Serving",
        completed: "Completed",
      },
    },
    about: {
      badge: "ABOUT EZQUEUE",
      titlePrefix: "Built for service businesses that need",
      titleHighlight: "faster queues and cleaner bookings",
      description:
        "EZQueue connects public booking, branch hours, live queue operations, staff assignment, customer records, and shop settings in one workflow built for service businesses.",
      imageAlt: "EZQueue service operation overview illustration",
    },
    features: {
      badge: "CORE FEATURES",
      title: "The workflows already available in EZQueue",
      description:
        "Each capability below maps to a working customer or dashboard route in this project.",
      items: [
        {
          question: "Public booking and queue intake",
          answer:
            "Customers can reserve time slots from a public booking page while the shop keeps queue numbers, service categories, branch holidays, and business hours aligned.",
          variant: "warning",
        },
        {
          question: "Live operations and analytics",
          answer:
            "The dashboard and queue views show active bookings, waiting customers, staff assignment, and completed work for the branch.",
          variant: "primary",
        },
        {
          question: "Admin-ready shop management",
          answer:
            "Owners can manage services, staff, roles, customers, branch hours, holidays, and shop settings from the dashboard.",
          variant: "success",
        },
      ],
      imageAlt: "Feature dashboard and analytics illustration",
    },
    pricing: {
      badge: "PRICING",
      title: "Simple plans for every service branch",
      description: "Start with one branch, then scale into staff, billing, reporting, and multi-branch operations.",
      period: " / Month",
      listTitle: "Included modules:",
      popular: "Popular",
      plans: [
        {
          name: "Starter",
          note: "For one shop getting online",
          price: "THB 590",
          features: ["1 branch", "Public booking page", "Live queue board", "Customer records", "Basic support"],
        },
        {
          name: "Growth",
          note: "For busy teams with staff and payments",
          price: "THB 990",
          popular: true,
          features: ["Up to 3 branches", "Staff and role setup", "Payment transaction screens", "Invoice workspace", "Priority support"],
        },
        {
          name: "Business",
          note: "For multi-branch operations",
          price: "THB 2,490",
          features: ["Unlimited branches", "Advanced analytics", "Subscription management", "System audit logs", "API-ready implementation"],
        },
      ],
    },
    service: {
      badge: "SOLUTIONS",
      title: "A complete frontend for queue-heavy service operations",
      description:
        "EZQueue covers the flow from a customer booking a service to staff serving the queue, collecting payment, and reviewing performance.",
      items: [
        {
          title: "Online Booking",
          description: "Let customers choose branches, services, dates, and time slots before they arrive.",
        },
        {
          title: "Live Queue Board",
          description: "Track waiting, serving, completed, skipped, and branch status from the dashboard.",
        },
        {
          title: "Customer CRM",
          description: "Keep customer profiles, booking history, tags, and follow-up context together.",
        },
        {
          title: "Payment & Billing",
          description: "Prepare invoice, subscription, and payment screens for gateway integration.",
        },
      ],
    },
    workflow: {
      badge: "HOW IT WORKS",
      title: "From setup to a smoother service day",
      description: "A simple workflow connects the owner, staff, and customers around the same queue and booking information.",
      stepLabel: "Step",
      steps: [
        { title: "Set up your branch", description: "Add services, staff, business hours, holidays, and booking rules for each service." },
        { title: "Customers choose a slot", description: "Customers select a service and available time from the public booking page, without an OTP." },
        { title: "Staff serve the queue", description: "The team sees waiting bookings, calls the next customer, updates status, and keeps the branch moving." },
      ],
    },
    blog: {
      badge: "USE CASES",
      title: "Designed for the daily rhythm of real service counters",
      items: [
        {
          image: "/images/homepage/blog/ezqueue-usecase-peak-hours.png",
          title: "Reduce front-desk pressure during peak hours",
          description: "Let customers book ahead and keep staff focused on serving instead of manually arranging walk-ins.",
        },
        {
          image: "/images/homepage/blog/ezqueue-usecase-operations.png",
          title: "Control incoming and completed bookings",
          description: "Review today's queue, active bookings, completed jobs, and payments in one operational view.",
        },
        {
          image: "/images/homepage/blog/ezqueue-usecase-api.png",
          title: "Prepare API contracts screen by screen",
          description: "Use the mocked frontend to define backend data shapes for booking, queue, customer, invoice, and system modules.",
        },
      ],
    },
    cta: {
      title: "Ready to turn your service queue into a smoother customer experience?",
      imageAlt: "EZQueue dashboard preview",
    },
    footer: {
      title: "Need help planning your queue workflow?",
      description: "Join to receive product updates, release notes, and service operation ideas from EZQueue.",
      emailPlaceholder: "Enter email",
      groups: [
        { title: "Platform", links: ["Dashboard", "Booking", "Queue", "Customers"] },
        { title: "Operations", links: ["Services", "Staff roles", "Payments", "Invoices"] },
        { title: "Resources", links: ["Use cases", "Pricing", "Settings"] },
      ],
      contactTitle: "Contact us",
      location: "Bangkok, Thailand",
      copyright: "© 2026 EZQueue - Queue and booking platform",
    },
  },
  th: {
    language: {
      label: "ภาษา",
      thai: "ไทย",
      english: "EN",
    },
    nav: {
      home: "หน้าแรก",
      about: "เกี่ยวกับ",
      features: "ฟีเจอร์",
      price: "ราคา",
      service: "โซลูชัน",
      blog: "ตัวอย่างใช้งาน",
    },
    actions: {
      login: "เข้าสู่ระบบ",
      signup: "สมัครใช้งาน",
      tryFree: "ทดลองใช้งาน",
      learnMore: "ดูฟีเจอร์",
      readMore: "ดูระบบเพิ่มเติม",
      buyNow: "เลือกแพ็กเกจ",
      exploreMore: "ดูรายละเอียด",
      readCase: "อ่านตัวอย่าง",
      getStarted: "เริ่มใช้งาน",
      subscribe: "ติดตาม",
    },
    hero: {
      badge: "คิว จองบริการ พนักงาน ลูกค้า และชำระเงิน",
      title: "จัดการการจอง คิว พนักงาน และชำระเงินให้ลื่นไหลกว่าเดิม",
      description:
        "EZQueue ช่วยธุรกิจบริการจัดการหน้าจองออนไลน์ คิวสด ภาระงานพนักงาน ข้อมูลลูกค้า ใบแจ้งหนี้ การชำระเงิน และตั้งค่าร้าน ผ่าน Frontend ที่พร้อมเชื่อมต่อ API จริง",
      imageAlt: "ตัวอย่าง Dashboard ของ EZQueue สำหรับจัดการคิวและการจอง",
      eyebrow: "Frontend พร้อมเชื่อม API สำหรับธุรกิจบริการ",
      metrics: [
        { value: "38", label: "จองวันนี้" },
        { value: "12m", label: "เวลารอเฉลี่ย" },
        { value: "97%", label: "ชำระเงินสำเร็จ" },
      ],
      preview: {
        title: "ภาพรวมสาขาแบบสด",
        subtitle: "คิวสาขาหลัก",
        waiting: "รอคิว",
        serving: "กำลังบริการ",
        completed: "เสร็จสิ้น",
      },
    },
    about: {
      badge: "เกี่ยวกับ EZQUEUE",
      titlePrefix: "สร้างมาเพื่อธุรกิจบริการที่ต้องการ",
      titleHighlight: "คิวเร็วขึ้นและการจองเป็นระบบขึ้น",
      description:
        "ระบบออกแบบจากงานหน้าร้านจริง ลูกค้าจองบริการออนไลน์ พนักงานเรียกคิวและให้บริการ เจ้าของร้านดูประสิทธิภาพสาขา และผู้ดูแลจัดการบริการ สิทธิ์ใช้งาน แพ็กเกจ และบิลได้ครบ ทุกส่วนในหน้า Homepage เชื่อมโยงกับโมดูล Dashboard ที่ทำ mockup ไว้แล้ว",
      imageAlt: "ภาพรวมการทำงานของระบบบริการ EZQueue",
    },
    features: {
      badge: "ฟีเจอร์หลัก",
      title: "ครบทุกหน้าที่ร้านต้องใช้ก่อนเชื่อม API จริง",
      description:
        "Frontend ถูกวางเป็นฐานผลิตภัณฑ์เต็มรูปแบบ ทีม Backend จึงสามารถเชื่อมข้อมูลจริงทีละโมดูล โดยไม่ต้องออกแบบ flow ลูกค้าใหม่",
      items: [
        {
          question: "หน้าจองบริการและรับคิวออนไลน์",
          answer:
            "ลูกค้าจองเวลาบริการจากหน้า public booking ได้ พร้อมรองรับเลขคิว หมวดหมู่บริการ วันหยุดสาขา และเวลาทำการของร้าน",
          variant: "warning",
        },
        {
          question: "คิวสดและรายงานภาพรวม",
          answer:
            "Dashboard ครอบคลุมสถานะคิว ยอดจองวันนี้ เวลารอ งานที่เสร็จแล้ว ความสำเร็จการชำระเงิน กิจกรรมลูกค้า และรายงานแยกสาขา",
          variant: "primary",
        },
        {
          question: "จัดการร้านพร้อมใช้งานจริง",
          answer:
            "มี route สำหรับพนักงาน สิทธิ์ บริการ ลูกค้า แท็ก ใบแจ้งหนี้ แพ็กเกจ ตั้งค่าระบบ และ audit log แยกชัดเจน พร้อมทำ API contract",
          variant: "success",
        },
      ],
      imageAlt: "ภาพฟีเจอร์ Dashboard และรายงานของ EZQueue",
    },
    pricing: {
      badge: "แพ็กเกจ",
      title: "ราคาเรียบง่ายสำหรับร้านบริการทุกขนาด",
      description: "เริ่มจากสาขาเดียว แล้วขยายไปสู่ทีมงาน การชำระเงิน รายงาน และการบริหารหลายสาขา",
      period: " / เดือน",
      listTitle: "โมดูลที่รวมในแพ็กเกจ:",
      popular: "แนะนำ",
      plans: [
        {
          name: "Starter",
          note: "สำหรับร้านเดียวที่เริ่มรับจองออนไลน์",
          price: "590 บาท",
          features: ["1 สาขา", "หน้าจองบริการ", "กระดานคิวสด", "ข้อมูลลูกค้า", "ซัพพอร์ตพื้นฐาน"],
        },
        {
          name: "Growth",
          note: "สำหรับทีมที่มีพนักงานและรับชำระเงิน",
          price: "990 บาท",
          popular: true,
          features: ["สูงสุด 3 สาขา", "พนักงานและสิทธิ์ใช้งาน", "หน้าธุรกรรมชำระเงิน", "พื้นที่ใบแจ้งหนี้", "ซัพพอร์ตด่วน"],
        },
        {
          name: "Business",
          note: "สำหรับธุรกิจหลายสาขา",
          price: "2,490 บาท",
          features: ["ไม่จำกัดสาขา", "รายงานขั้นสูง", "จัดการ Subscription", "System audit log", "พร้อมเชื่อมต่อ API จริง"],
        },
      ],
    },
    service: {
      badge: "โซลูชัน",
      title: "Frontend ครบชุดสำหรับธุรกิจบริการที่มีคิวหน้างาน",
      description:
        "EZQueue ครอบคลุมตั้งแต่ลูกค้าจองบริการ พนักงานเรียกคิว รับชำระเงิน ไปจนถึงการดูรายงานหลังให้บริการ",
      items: [
        {
          title: "จองบริการออนไลน์",
          description: "ให้ลูกค้าเลือกสาขา บริการ วันที่ และช่วงเวลาก่อนมาถึงร้าน",
        },
        {
          title: "กระดานคิวสด",
          description: "ติดตามคิวรอ ให้บริการ เสร็จสิ้น ข้ามคิว และสถานะสาขาจาก Dashboard",
        },
        {
          title: "Customer CRM",
          description: "รวมข้อมูลลูกค้า ประวัติการจอง แท็ก และบริบทการติดตามไว้ด้วยกัน",
        },
        {
          title: "ชำระเงินและวางบิล",
          description: "เตรียมหน้าจอใบแจ้งหนี้ แพ็กเกจ และการชำระเงินก่อนเชื่อม Payment gateway",
        },
      ],
    },
    blog: {
      badge: "ตัวอย่างการใช้งาน",
      title: "ออกแบบมาให้เข้ากับจังหวะงานจริงของเคาน์เตอร์บริการ",
      items: [
        {
          image: "/images/homepage/blog/ezqueue-usecase-peak-hours.png",
          title: "ลดภาระหน้าร้านในช่วงคิวแน่น",
          description: "ให้ลูกค้าจองล่วงหน้าและช่วยให้พนักงานโฟกัสกับการให้บริการแทนการจัดคิวด้วยมือ",
        },
        {
          image: "/images/homepage/blog/ezqueue-usecase-operations.png",
          title: "คุมงานจองและงานที่เสร็จแล้วในจุดเดียว",
          description: "ดูคิววันนี้ การจองที่กำลังใช้งาน งานที่เสร็จแล้ว และการชำระเงินในมุมมองเดียว",
        },
        {
          image: "/images/homepage/blog/ezqueue-usecase-api.png",
          title: "เตรียม API contract จากหน้าจอจริง",
          description: "ใช้ Frontend mockup เพื่อกำหนดโครงข้อมูลสำหรับ booking, queue, customer, invoice และ system modules",
        },
      ],
    },
    cta: {
      title: "พร้อมเปลี่ยนคิวหน้าร้านให้เป็นประสบการณ์ที่ลื่นไหลขึ้นหรือยัง?",
      imageAlt: "ตัวอย่าง Dashboard ของ EZQueue",
    },
    footer: {
      title: "ต้องการช่วยวาง workflow ระบบคิวไหม?",
      description: "ติดตามข่าวสารสินค้า release notes และไอเดียการบริหารงานบริการจาก EZQueue",
      emailPlaceholder: "กรอกอีเมล",
      groups: [
        { title: "แพลตฟอร์ม", links: ["Dashboard", "การจอง", "คิว", "ลูกค้า"] },
        { title: "การปฏิบัติงาน", links: ["บริการ", "สิทธิ์พนักงาน", "ชำระเงิน", "ใบแจ้งหนี้"] },
        { title: "แหล่งข้อมูล", links: ["ตัวอย่างใช้งาน", "ราคา", "ตั้งค่า"] },
      ],
      contactTitle: "ติดต่อเรา",
      location: "กรุงเทพฯ ประเทศไทย",
      copyright: "© 2026 EZQueue - แพลตฟอร์มจัดการคิวและการจองบริการ",
    },
  },
} as const;

export type HomepageCopy = (typeof homepageCopy)[HomepageLocale];
