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
      badge: "Made for better service days",
      title: "A little less waiting. A lot more caring.",
      description:
        "Bring your bookings, queues, and team together. Give your customers a smooth experience, and your day a little more breathing room.",
      imageAlt: "A welcoming reception in a contemporary service studio",
      eyebrow: "Thoughtful tools for service businesses",
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
      imageAlt: "A stylist consulting with a customer in a bright, welcoming studio",
    },
    features: {
      badge: "CORE FEATURES",
      title: "Everything your service day needs",
      description:
        "From the first booking to the last customer, keep the details connected and your team in sync.",
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
      imageAlt: "A customer arranging an appointment from a peaceful café",
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
      title: "One place. A smoother day.",
      description:
        "Thoughtful tools for your customers, your team, and the everyday details of running a service business.",
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
          title: "Team & Branches",
          description: "Keep staff, services, opening hours, and branch permissions organized in one place.",
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
          description: "Manage bookings, queues, customers, and shop settings through connected APIs.",
        },
      ],
    },
    cta: {
      title: "Ready to turn your service queue into a smoother customer experience?",
      imageAlt: "A welcoming reception for a well organized service day",
    },
    footer: {
      title: "Need help planning your queue workflow?",
      description: "Join to receive product updates, release notes, and service operation ideas from EZQueue.",
      emailPlaceholder: "Enter email",
      groups: [
        { title: "Platform", links: ["Dashboard", "Booking", "Queue", "Customers"] },
        { title: "Operations", links: ["Services", "Staff roles", "Branch hours", "Shop management"] },
        { title: "Resources", links: ["Use cases", "Features", "Settings"] },
      ],
      contactTitle: "Start here",
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
      badge: "ให้ทุกวันของการบริการเป็นวันที่ดี",
      title: "จัดคิวให้ง่าย มีเวลาใส่ใจลูกค้ามากขึ้น",
      description:
        "เชื่อมการจอง คิว และทีมงานไว้ในที่เดียว ให้ลูกค้าได้รับประสบการณ์ที่ราบรื่น และให้คุณมีเวลาดูแลร้านได้อย่างเต็มที่",
      imageAlt: "บรรยากาศการต้อนรับลูกค้าที่เคาน์เตอร์ร้านบริการ",
      eyebrow: "เครื่องมือที่เข้าใจธุรกิจบริการ",
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
        "ลูกค้าจองบริการออนไลน์ พนักงานเรียกคิวและให้บริการ เจ้าของร้านดูรายงานการดำเนินงานและจัดการบริการ พนักงาน สาขา และสิทธิ์ใช้งานจากข้อมูลจริง",
      imageAlt: "พนักงานให้คำปรึกษาลูกค้าในร้านที่สว่างและอบอุ่น",
    },
    features: {
      badge: "ฟีเจอร์หลัก",
      title: "ครบทุกจังหวะของงานบริการ",
      description:
        "ตั้งแต่การจองครั้งแรกจนถึงลูกค้าคนสุดท้าย ให้ข้อมูลเชื่อมถึงกัน และให้ทีมของคุณทำงานได้อย่างลงตัว",
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
            "ติดตามการจอง คิวรอ งานที่กำลังให้บริการ และงานที่เสร็จแล้ว พร้อมดูภาพรวมแยกตามสาขา",
          variant: "primary",
        },
        {
          question: "จัดการร้านพร้อมใช้งานจริง",
          answer:
            "จัดการบริการ พนักงาน สิทธิ์ ลูกค้า เวลาทำการ และวันหยุดของแต่ละสาขาได้จากที่เดียว",
          variant: "success",
        },
      ],
      imageAlt: "ลูกค้าเลือกนัดหมายจากโทรศัพท์ในบรรยากาศผ่อนคลาย",
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
      title: "ที่เดียว ดูแลได้ทั้งวัน",
      description:
        "เครื่องมือที่ช่วยดูแลลูกค้า ทีมงาน และรายละเอียดเล็ก ๆ ในทุกวันของธุรกิจบริการ",
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
          title: "ทีมงานและสาขา",
          description: "จัดการพนักงาน บริการ เวลาทำการ และสิทธิ์ของแต่ละสาขาอย่างเป็นระบบ",
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
          description: "จัดการการจอง คิว ลูกค้า และการตั้งค่าร้านผ่าน API ที่เชื่อมต่อข้อมูลจริง",
        },
      ],
    },
    cta: {
      title: "พร้อมเปลี่ยนคิวหน้าร้านให้เป็นประสบการณ์ที่ลื่นไหลขึ้นหรือยัง?",
      imageAlt: "เคาน์เตอร์ต้อนรับสำหรับวันทำงานที่ราบรื่น",
    },
    footer: {
      title: "ต้องการช่วยวาง workflow ระบบคิวไหม?",
      description: "ติดตามข่าวสารสินค้า release notes และไอเดียการบริหารงานบริการจาก EZQueue",
      emailPlaceholder: "กรอกอีเมล",
      groups: [
        { title: "แพลตฟอร์ม", links: ["Dashboard", "การจอง", "คิว", "ลูกค้า"] },
        { title: "การปฏิบัติงาน", links: ["บริการ", "สิทธิ์พนักงาน", "เวลาทำการ", "จัดการร้าน"] },
        { title: "แหล่งข้อมูล", links: ["ตัวอย่างใช้งาน", "ฟีเจอร์", "ตั้งค่า"] },
      ],
      contactTitle: "เริ่มต้นที่นี่",
      location: "กรุงเทพฯ ประเทศไทย",
      copyright: "© 2026 EZQueue - แพลตฟอร์มจัดการคิวและการจองบริการ",
    },
  },
} as const;

export type HomepageCopy = (typeof homepageCopy)[HomepageLocale];
