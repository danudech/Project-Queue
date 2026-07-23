export type LegalKind = "terms" | "privacy";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalCopy = {
  badge: string;
  title: string;
  description: string;
  effectiveLabel: string;
  effectiveDate: string;
  contents: string;
  back: string;
  relatedLabel: string;
  relatedTitle: string;
  relatedDescription: string;
  contactLabel: string;
  contactDescription: string;
  notice: string;
  sections: LegalSection[];
};

export const legalContent: Record<"en" | "th", Record<LegalKind, LegalCopy>> = {
  en: {
    terms: {
      badge: "Legal · Terms",
      title: "Terms & Conditions",
      description:
        "The practical rules for using EZQueue—written for the businesses that run their operations on the platform and the customers who book or join a queue.",
      effectiveLabel: "Effective date",
      effectiveDate: "22 July 2026",
      contents: "On this page",
      back: "Back to registration",
      relatedLabel: "How we handle information",
      relatedTitle: "Read our Privacy Notice",
      relatedDescription: "See what data is used, why it is needed, and the rights available to you.",
      contactLabel: "Need to discuss these terms?",
      contactDescription: "Tell us which account, workspace, booking, or queue your question concerns.",
      notice:
        "By creating an account, accepting an order, or continuing to use EZQueue, you agree to these terms. If you act for a business, you confirm that you are authorised to bind that business.",
      sections: [
        {
          id: "scope",
          title: "1. Who these terms apply to",
          paragraphs: [
            "These terms govern access to EZQueue websites and the queue, booking, customer, staff, branch, reporting, billing, and related features that we make available from time to time (the “Service”). “EZQueue”, “we”, and “us” mean the operator of the Service identified in your order, invoice, or direct correspondence with us.",
            "A “Business User” is a business, organisation, owner, administrator, or staff member using a workspace. A “Visitor” is a person who makes a booking, joins a queue, or checks a queue through EZQueue. Some clauses apply only to the relevant type of user.",
          ],
        },
        {
          id: "accounts",
          title: "2. Accounts and authority",
          paragraphs: [
            "Account information must be accurate and kept up to date. Login credentials are personal to the authorised user and must be protected. Workspace owners are responsible for staff invitations, roles, permissions, and removing access when it is no longer required.",
            "Tell us promptly at hello@ezqueue.app if you suspect unauthorised access. We may ask for information reasonably needed to verify the account or the authority of the person giving instructions.",
          ],
        },
        {
          id: "roles",
          title: "3. Our role and the business’s role",
          paragraphs: [
            "EZQueue provides software that helps a business organise its own services. Unless we expressly say otherwise, EZQueue is not the shop, clinic, salon, office, or other provider shown on a booking or queue page, and we do not set that provider’s prices, service standards, cancellation rules, or opening hours.",
            "The relevant business is responsible for the underlying service and for dealing with its customers, including service quality, availability, changes, cancellations, refunds, and consumer complaints. Visitors should contact that business first about the underlying service. We will assist with platform-related issues within our control.",
          ],
        },
        {
          id: "service-use",
          title: "4. Bookings, queues, and estimates",
          paragraphs: [
            "A booking confirmation or queue number records a request in the system; it is not a guarantee that service will begin at an exact time. Queue order, estimated waiting time, counter availability, and appointment slots can change because of late arrivals, cancellations, staffing, emergencies, or instructions entered by the relevant business.",
            "Business Users are responsible for checking service settings and for communicating operational changes to Visitors. Visitors must provide usable contact details, arrive as instructed, and follow reasonable on-site rules.",
          ],
        },
        {
          id: "plans",
          title: "5. Plans, charges, renewal, and cancellation",
          paragraphs: [
            "If a paid plan is offered, its price, billing period, included features, taxes, renewal arrangement, and any trial conditions will be shown before purchase or stated in an order. Those commercial details form part of these terms. We will not add a recurring charge unless that arrangement is clearly presented and accepted.",
            "A Business User may cancel a renewal through the method shown in its account or order. Cancellation normally takes effect at the end of the paid period unless the order or mandatory law provides otherwise. Refunds are considered under the plan terms, the reason for cancellation, Service use, and any non-excludable rights under applicable law; these terms do not remove a refund or remedy required by law.",
          ],
        },
        {
          id: "business-data",
          title: "6. Business data and lawful instructions",
          paragraphs: [
            "Business Users retain their rights in data they submit. They instruct us to host, organise, back up, transmit, and otherwise process that data only as needed to provide, secure, support, and maintain the Service and as described in our Privacy Notice.",
            "A Business User must have a lawful reason to place customer, staff, or other personal data in EZQueue, provide any notice required to those people, keep the data relevant and accurate, and avoid entering sensitive or excessive information when it is not needed for the service.",
          ],
        },
        {
          id: "acceptable-use",
          title: "7. Fair and lawful use",
          paragraphs: ["You must not use the Service to harm another person, the Service, or its users. In particular, you must not:"],
          bullets: [
            "submit unlawful, deceptive, infringing, discriminatory, or malicious content;",
            "access another account or data without permission, evade access controls, or test vulnerabilities without written authorisation;",
            "interfere with availability, send malware, overload the Service, scrape it at unreasonable scale, or use it to send spam;",
            "copy, resell, reverse engineer, or create a competing service from protected parts of EZQueue except where the law expressly permits it; or",
            "use queue priority, customer notes, or staff permissions in a way that unlawfully discriminates or violates another person’s rights.",
          ],
        },
        {
          id: "third-parties",
          title: "8. Third-party services",
          paragraphs: [
            "Some features may connect to payment, messaging, maps, hosting, identity, or other third-party services. Their own terms and privacy practices may apply. We are responsible for the EZQueue components we operate, but not for an independent third party’s systems or decisions. Where a third-party failure affects EZQueue, we will take reasonable steps to restore or provide an alternative where practical.",
          ],
        },
        {
          id: "ownership",
          title: "9. Ownership and permission to use EZQueue",
          paragraphs: [
            "EZQueue software, interfaces, branding, documentation, and original content belong to us or our licensors. While your account is active and these terms are followed, we grant you a limited, non-exclusive, non-transferable permission to use the Service for its intended purpose. This does not transfer ownership of EZQueue or of another user’s data.",
            "If you send suggestions, we may use them to improve the Service without restricting your ability to use the same ideas yourself. We will not publish your confidential business information as a testimonial or case study without permission.",
          ],
        },
        {
          id: "availability",
          title: "10. Availability and changes to the Service",
          paragraphs: [
            "We work to keep EZQueue reliable and secure, but internet services cannot be promised to run without interruption or error. Planned maintenance, urgent security work, third-party outages, network conditions, and events beyond reasonable control may affect availability.",
            "We may improve or replace features. If a change materially reduces a paid feature during its current billing period, we will provide reasonable notice where practical and an appropriate remedy having regard to the impact, the order, and applicable law.",
          ],
        },
        {
          id: "suspension",
          title: "11. Suspension, closure, and access to data",
          paragraphs: [
            "We may limit or suspend access where reasonably necessary to contain a security risk, prevent unlawful or harmful use, comply with a lawful order, investigate a credible breach, or address overdue charges. Except in urgent cases, we will normally explain the issue and allow a reasonable opportunity to remedy it.",
            "When a workspace closes, access and data handling will follow the selected plan, any applicable order, our Privacy Notice, and legal retention duties. Business Users should export information they need before closure. We may retain limited records where required for security, disputes, accounting, or law.",
          ],
        },
        {
          id: "responsibility",
          title: "12. Responsibility and rights that cannot be excluded",
          paragraphs: [
            "Each party is responsible for loss it causes through fraud, wilful misconduct, breach of confidentiality, infringement of another person’s rights, or failure to meet obligations that the law does not allow it to exclude. EZQueue remains responsible for providing the Service with reasonable care and skill.",
            "To the extent the law permits, neither party is responsible for indirect loss that was not reasonably foreseeable when the agreement was made. Nothing in these terms excludes mandatory consumer rights or liability that cannot lawfully be limited. A Visitor’s rights against the business providing the underlying service remain unaffected.",
          ],
        },
        {
          id: "electronic-notices",
          title: "13. Electronic agreement and changes to these terms",
          paragraphs: [
            "Checking an acceptance box, creating an account, accepting an electronic order, or continuing after a notified effective date may record agreement electronically, as permitted by applicable electronic-transactions law.",
            "We may revise these terms when the Service, law, security requirements, or our way of doing business changes. The current version and effective date will remain available here. We will give reasonable advance notice of a material change that disadvantages current paid use, unless an urgent legal or security reason requires faster action.",
          ],
        },
        {
          id: "law-contact",
          title: "14. Governing law, complaints, and contact",
          paragraphs: [
            "These terms are governed by Thai law. The parties should first try to resolve a dispute in good faith through the contact below. If that does not resolve it, either party may use the competent Thai courts or any consumer complaint or dispute-resolution channel available by law.",
            "Contact hello@ezqueue.app and include the relevant account, workspace, booking, queue, invoice, and contact details where available. Do not send passwords or unnecessary sensitive information.",
          ],
        },
      ],
    },
    privacy: {
      badge: "Legal · Privacy",
      title: "Privacy Notice",
      description:
        "A clear account of the personal data used by EZQueue, the reason for each use, who may receive it, how long it is kept, and how you can exercise your rights.",
      effectiveLabel: "Effective date",
      effectiveDate: "22 July 2026",
      contents: "On this page",
      back: "Back to registration",
      relatedLabel: "Rules for using EZQueue",
      relatedTitle: "Read our Terms & Conditions",
      relatedDescription: "Understand the responsibilities of EZQueue, businesses, staff, and visitors.",
      contactLabel: "Privacy question or request?",
      contactDescription: "Tell us enough to identify the relevant account or interaction—never send your password.",
      notice:
        "EZQueue uses personal data for identified purposes and only to the extent reasonably needed. Where a business controls data entered in its workspace, requests about that data should normally be made to that business first.",
      sections: [
        {
          id: "controller",
          title: "1. Who is responsible for your data",
          paragraphs: [
            "This notice applies to the personal data handled by the operator of EZQueue identified in your order, invoice, or direct correspondence with us. For account administration, our website, billing, security, and support, that operator acts as the data controller.",
            "For customer, visitor, or staff data that a Business User places in its workspace, the Business User normally decides why and how that data is used and acts as controller. EZQueue handles it on the Business User’s instructions as a processor, except where we must use limited information for our own security, legal, or service-administration purposes.",
          ],
        },
        {
          id: "sources",
          title: "2. Where the data comes from",
          paragraphs: [
            "We receive data directly from you when you register, book, join a queue, update a profile, make a purchase, or contact support. We may also receive it from a workspace owner or authorised staff member, from the device and browser used to access EZQueue, and from connected service providers such as payment or communications providers when those features are enabled.",
            "If a Business User gives us data about another person, that Business User is responsible for having authority to do so and for giving the person any notice required by law.",
          ],
        },
        {
          id: "data-categories",
          title: "3. Personal data we may handle",
          paragraphs: ["The exact data depends on the features used and may include:"],
          bullets: [
            "identity and contact data, such as name, email address, telephone number, account identifier, and language;",
            "business and employment data, such as business name, branch, role, permissions, staff schedule, and workspace activity;",
            "booking and queue data, such as the selected service, date and time, queue number, status, arrival or service timestamps, and notes supplied by the business or visitor;",
            "billing and transaction data, such as plan, invoice details, amount, payment status, and provider reference—we do not need to store a full payment-card number where payment is handled by an external gateway;",
            "technical and security data, such as IP address, device, browser, session identifiers, access logs, timestamps, error reports, and actions recorded for audit or fraud prevention; and",
            "communications, support requests, attachments, feedback, and the history needed to respond to them.",
          ],
        },
        {
          id: "purposes-bases",
          title: "4. Why we use data and our legal bases",
          paragraphs: ["Depending on the relationship and circumstances, we use personal data as follows:"],
          bullets: [
            "To register users, provide bookings and queues, manage workspaces, and deliver purchased plans—because this is necessary to enter into or perform a contract, or to follow a controller’s lawful instructions.",
            "To authenticate users, keep audit records, detect abuse, secure the Service, and investigate incidents—on the basis of our legitimate interests in operating a safe service and, where applicable, legal obligations.",
            "To issue invoices, keep accounting or tax records, respond to lawful requests, and establish or defend legal claims—because the law requires it or it is necessary for legitimate legal interests.",
            "To send booking confirmations, queue updates, service notices, and support responses—because they are necessary for the requested service or our legitimate interest in communicating about it.",
            "To measure reliability, diagnose faults, and improve workflows using proportionate usage data—on the basis of our legitimate interests, with safeguards and choices where required.",
            "To send optional promotions or use non-essential marketing technologies—only where permitted by law, including consent where consent is required. Consent may be withdrawn at any time without affecting earlier lawful processing.",
          ],
        },
        {
          id: "required-data",
          title: "5. Data we need from you",
          paragraphs: [
            "Fields marked as required, together with credentials and basic technical records, are generally needed to create an account, secure a session, make a booking, join a queue, or complete a purchase. If required data is not provided, the relevant feature may not work. Optional fields may be left blank unless the relevant business explains why they are needed.",
            "EZQueue is not intended for decisions based solely on automated processing that produce legal or similarly significant effects. Queue estimates and operational dashboards assist people; the relevant business remains responsible for service decisions.",
          ],
        },
        {
          id: "disclosure",
          title: "6. Who may receive the data",
          paragraphs: ["We disclose only what is reasonably necessary to the relevant recipient, which may include:"],
          bullets: [
            "the Business User, workspace owner, and authorised staff responsible for the booking, queue, branch, or customer relationship;",
            "providers that support hosting, storage, email or messaging, payment, monitoring, security, analytics, and customer support under appropriate contractual and access controls;",
            "professional advisers, auditors, insurers, and parties involved in a genuine corporate transaction, subject to confidentiality and lawful safeguards; and",
            "courts, regulators, law-enforcement bodies, or other persons where disclosure is required by law, needed to protect legal rights or safety, or made with valid authority.",
          ],
        },
        {
          id: "international-transfer",
          title: "7. Transfers outside Thailand",
          paragraphs: [
            "A cloud, communications, or support provider may process data outside Thailand. Before making a transfer that is subject to the Personal Data Protection Act, we assess the destination and use a lawful safeguard where required, such as an adequate protection mechanism, appropriate contractual protection, an applicable statutory exception, or consent in the circumstances allowed by law.",
          ],
        },
        {
          id: "retention",
          title: "8. How long we keep data",
          paragraphs: [
            "We keep data only for as long as it is needed for the purpose collected. The period is determined by the account and workspace lifecycle, the Business User’s documented instructions, active bookings or disputes, security needs, backup cycles, and accounting, tax, limitation, or other legal duties.",
            "When data is no longer needed, we delete it, anonymise it, or restrict access until secure deletion from backups. Some records may remain longer where the law requires retention or where they are needed to establish, exercise, or defend a legal claim.",
          ],
        },
        {
          id: "security-incidents",
          title: "9. Security and personal-data incidents",
          paragraphs: [
            "We use risk-appropriate organisational and technical measures, including role-based access, authentication controls, encrypted transmission, logs, backups, vulnerability management, and limits on provider access where appropriate to the Service configuration.",
            "No online system is risk-free. If a personal-data breach occurs, we will assess it, contain it, preserve necessary records, and notify the competent authority and affected individuals within the time and circumstances required by applicable law. Users should protect their credentials and notify us promptly of suspicious activity.",
          ],
        },
        {
          id: "rights",
          title: "10. Your rights",
          paragraphs: [
            "Subject to the conditions and exceptions in applicable law, you may ask to access and obtain a copy of your data; obtain data portability; object to processing; have data erased, destroyed, or anonymised; restrict use; correct inaccurate data; withdraw consent; and lodge a complaint with the Personal Data Protection Committee.",
            "Send a request to hello@ezqueue.app. We may verify identity and ask for enough detail to locate the data. We will act without undue delay and within the period required by law. If a Business User controls the requested workspace data, we may refer the request to that business and assist it with the response.",
          ],
        },
        {
          id: "cookies",
          title: "11. Cookies and local storage",
          paragraphs: [
            "EZQueue uses technologies needed to maintain sessions, remember language, protect forms, balance traffic, and preserve core settings. Blocking these may prevent sign-in or other essential functions. Non-essential analytics or advertising technologies, if introduced, will be described and offered with the choice required by law before use.",
          ],
        },
        {
          id: "sensitive-children",
          title: "12. Sensitive data and children",
          paragraphs: [
            "Do not enter health, disability, biometric, religious, criminal-record, or other sensitive data into free-text fields unless the relevant service genuinely requires it and the controller has a lawful basis and suitable safeguards. EZQueue does not ask for sensitive data merely to create a standard business account or queue entry.",
            "Business workspaces are not intended to be administered independently by children. If a service requires data about a child or a person who cannot lawfully consent on their own, the responsible controller must follow the consent and notice rules that apply to that person.",
          ],
        },
        {
          id: "changes",
          title: "13. Changes to this notice",
          paragraphs: [
            "We may revise this notice when the Service, our processing, or legal requirements change. The current version and effective date will remain on this page. If a change materially affects how existing data is used, we will provide an additional notice or seek consent where the law requires it.",
          ],
        },
        {
          id: "contact-complaint",
          title: "14. Contact and complaints",
          paragraphs: [
            "For a privacy question, rights request, or complaint, email hello@ezqueue.app and identify the relevant account, workspace, booking, or queue where possible. Do not send a password or unrelated sensitive information.",
            "You also have the right to complain to Thailand’s Personal Data Protection Committee if you believe personal data has been handled unlawfully. Contacting us first may help resolve the matter quickly, but it does not take away that right.",
          ],
        },
      ],
    },
  },
  th: {
    terms: {
      badge: "ข้อมูลทางกฎหมาย · ข้อกำหนด",
      title: "ข้อกำหนดและเงื่อนไขการใช้บริการ",
      description:
        "กติกาการใช้ EZQueue สำหรับทั้งธุรกิจที่นำระบบไปจัดการงาน และลูกค้าที่ใช้บริการจองหรือรับคิว เขียนให้เข้าใจได้โดยไม่ต้องแปลภาษากฎหมายอีกชั้นหนึ่ง",
      effectiveLabel: "มีผลตั้งแต่",
      effectiveDate: "22 กรกฎาคม 2569",
      contents: "สารบัญ",
      back: "กลับไปหน้าสมัครสมาชิก",
      relatedLabel: "ข้อมูลของคุณถูกใช้อย่างไร",
      relatedTitle: "อ่านประกาศความเป็นส่วนตัว",
      relatedDescription: "ดูรายละเอียดข้อมูลที่ใช้ เหตุผล ระยะเวลาจัดเก็บ และสิทธิของคุณ",
      contactLabel: "ต้องการสอบถามข้อกำหนด?",
      contactDescription: "แจ้งบัญชี ร้าน สาขา รายการจอง หรือหมายเลขคิวที่เกี่ยวข้อง เพื่อให้เราตรวจสอบได้ตรงเรื่อง",
      notice:
        "เมื่อคุณสร้างบัญชี ยอมรับใบสั่งซื้อ หรือใช้ EZQueue ต่อไป ถือว่าคุณยอมรับข้อกำหนดนี้ หากดำเนินการแทนกิจการ คุณรับรองว่ามีอำนาจผูกพันกิจการนั้น",
      sections: [
        {
          id: "scope",
          title: "1. ข้อกำหนดนี้ใช้กับใคร",
          paragraphs: [
            "ข้อกำหนดนี้ใช้กับเว็บไซต์ EZQueue และฟังก์ชันด้านคิว การจอง ลูกค้า พนักงาน สาขา รายงาน การเรียกเก็บเงิน รวมถึงฟังก์ชันที่เราเปิดให้ใช้เพิ่มเติมเป็นครั้งคราว (รวมเรียกว่า “บริการ”) คำว่า “EZQueue” หรือ “เรา” หมายถึงผู้ดำเนินการบริการที่ระบุในใบสั่งซื้อ ใบแจ้งหนี้ หรือการติดต่อโดยตรงกับคุณ",
            "“ผู้ใช้ฝั่งธุรกิจ” หมายถึงกิจการ องค์กร เจ้าของ ผู้ดูแลระบบ หรือพนักงานที่ใช้พื้นที่ทำงาน ส่วน “ผู้ใช้บริการหน้าร้าน” หมายถึงบุคคลที่จองบริการ รับคิว หรือตรวจสอบคิวผ่าน EZQueue ข้อกำหนดบางข้อจึงใช้เฉพาะกับผู้ใช้แต่ละกลุ่มตามบริบท",
          ],
        },
        {
          id: "accounts",
          title: "2. บัญชีผู้ใช้และอำนาจดำเนินการ",
          paragraphs: [
            "ข้อมูลบัญชีต้องถูกต้องและเป็นปัจจุบัน รหัสผ่านและข้อมูลเข้าสู่ระบบเป็นข้อมูลเฉพาะของผู้ได้รับอนุญาต เจ้าของพื้นที่ทำงานมีหน้าที่กำหนดบทบาท สิทธิการเข้าถึง และยกเลิกสิทธิของพนักงานเมื่อไม่จำเป็นต้องใช้งานแล้ว",
            "หากสงสัยว่ามีผู้อื่นเข้าถึงบัญชี โปรดแจ้ง hello@ezqueue.app โดยเร็ว เราอาจขอข้อมูลเท่าที่จำเป็นเพื่อยืนยันบัญชีหรือตรวจสอบอำนาจของผู้ที่ส่งคำสั่งมา",
          ],
        },
        {
          id: "roles",
          title: "3. บทบาทของ EZQueue และกิจการผู้ให้บริการ",
          paragraphs: [
            "EZQueue เป็นซอฟต์แวร์ที่ช่วยให้กิจการจัดระเบียบบริการของตนเอง เว้นแต่เราจะระบุไว้ชัดเจน EZQueue ไม่ใช่ร้าน คลินิก ร้านเสริมสวย สำนักงาน หรือผู้ให้บริการที่ปรากฏในหน้าจองหรือหน้าคิว และเราไม่ได้เป็นผู้กำหนดราคา มาตรฐานบริการ เงื่อนไขการยกเลิก หรือเวลาทำการของกิจการนั้น",
            "กิจการที่รับจองหรือออกคิวเป็นผู้รับผิดชอบบริการจริง รวมถึงคุณภาพบริการ เวลาว่าง การเปลี่ยนแปลง การยกเลิก การคืนเงิน และข้อร้องเรียนของผู้บริโภค ผู้ใช้บริการหน้าร้านควรติดต่อกิจการดังกล่าวก่อนเมื่อปัญหาเกี่ยวข้องกับบริการจริง ส่วนเราจะช่วยตรวจสอบปัญหาที่เกิดจากระบบในขอบเขตที่เราดูแลได้",
          ],
        },
        {
          id: "service-use",
          title: "4. การจอง ลำดับคิว และเวลารอ",
          paragraphs: [
            "ข้อความยืนยันการจองหรือหมายเลขคิวเป็นหลักฐานว่าระบบได้รับรายการแล้ว ไม่ใช่คำรับรองว่าจะเริ่มรับบริการตรงเวลาทุกกรณี ลำดับคิว เวลารอโดยประมาณ จำนวนเคาน์เตอร์ และช่วงเวลาที่เปิดให้จองอาจเปลี่ยนจากการมาสาย การยกเลิก จำนวนพนักงาน เหตุฉุกเฉิน หรือคำสั่งที่กิจการบันทึกในระบบ",
            "ผู้ใช้ฝั่งธุรกิจต้องตรวจสอบการตั้งค่าบริการและแจ้งการเปลี่ยนแปลงที่สำคัญแก่ลูกค้า ส่วนผู้ใช้บริการหน้าร้านต้องให้ข้อมูลติดต่อที่ใช้งานได้ มาตามเวลาหรือคำแนะนำที่ได้รับ และปฏิบัติตามกติกาหน้างานที่สมเหตุสมผล",
          ],
        },
        {
          id: "plans",
          title: "5. แพ็กเกจ ค่าบริการ การต่ออายุ และการยกเลิก",
          paragraphs: [
            "หากมีแพ็กเกจแบบชำระเงิน เราจะแสดงราคา รอบเรียกเก็บ ฟังก์ชันที่รวม ภาษี เงื่อนไขการต่ออายุ และเงื่อนไขทดลองใช้ก่อนชำระเงิน หรือระบุไว้ในใบสั่งซื้อ รายละเอียดดังกล่าวถือเป็นส่วนหนึ่งของข้อกำหนดนี้ เราจะไม่เรียกเก็บเงินแบบต่อเนื่องหากไม่ได้แสดงและรับการยอมรับไว้อย่างชัดเจน",
            "ผู้ใช้ฝั่งธุรกิจยกเลิกการต่ออายุได้ตามช่องทางที่แสดงในบัญชีหรือใบสั่งซื้อ โดยทั่วไปการยกเลิกมีผลเมื่อสิ้นสุดรอบที่ชำระแล้ว เว้นแต่ใบสั่งซื้อหรือกฎหมายกำหนดต่างออกไป การคืนเงินจะพิจารณาจากเงื่อนไขแพ็กเกจ เหตุที่ยกเลิก การใช้งานที่ผ่านมา และสิทธิที่กฎหมายห้ามตัดทอน",
          ],
        },
        {
          id: "business-data",
          title: "6. ข้อมูลของกิจการและคำสั่งที่ชอบด้วยกฎหมาย",
          paragraphs: [
            "ผู้ใช้ฝั่งธุรกิจยังคงมีสิทธิในข้อมูลที่นำเข้าสู่ระบบ และมอบหมายให้เราจัดเก็บ จัดระเบียบ สำรอง ส่งต่อ หรือประมวลผลเท่าที่จำเป็นต่อการให้บริการ ดูแลความปลอดภัย ช่วยเหลือ และบำรุงรักษาระบบ ตามรายละเอียดในประกาศความเป็นส่วนตัว",
            "ก่อนนำข้อมูลลูกค้า พนักงาน หรือบุคคลอื่นเข้าสู่ EZQueue ผู้ใช้ฝั่งธุรกิจต้องมีฐานกฎหมาย แจ้งรายละเอียดแก่เจ้าของข้อมูลตามที่กฎหมายกำหนด ดูแลข้อมูลให้ตรงกับวัตถุประสงค์และเป็นปัจจุบัน และไม่บันทึกข้อมูลอ่อนไหวหรือข้อมูลเกินจำเป็นลงในช่องข้อความ",
          ],
        },
        {
          id: "acceptable-use",
          title: "7. การใช้งานอย่างเป็นธรรมและถูกกฎหมาย",
          paragraphs: ["ห้ามใช้บริการในลักษณะที่ทำให้บุคคลอื่น ระบบ หรือผู้ใช้รายอื่นเสียหาย โดยเฉพาะการกระทำต่อไปนี้:"],
          bullets: [
            "นำเข้าข้อมูลที่ผิดกฎหมาย หลอกลวง ละเมิดสิทธิ เลือกปฏิบัติโดยมิชอบ หรือมีโปรแกรมอันตราย",
            "เข้าถึงบัญชีหรือข้อมูลของผู้อื่นโดยไม่ได้รับอนุญาต หลีกเลี่ยงการควบคุมสิทธิ หรือทดสอบช่องโหว่โดยไม่มีหนังสืออนุญาต",
            "รบกวนการให้บริการ ส่งมัลแวร์ ทำให้ระบบรับภาระเกินสมควร ดึงข้อมูลในปริมาณผิดปกติ หรือส่งข้อความรบกวน",
            "คัดลอก ขายต่อ ทำวิศวกรรมย้อนกลับ หรือสร้างบริการแข่งขันจากส่วนที่ได้รับความคุ้มครองของ EZQueue เว้นแต่กฎหมายอนุญาตไว้โดยชัดแจ้ง",
            "ใช้สิทธิลัดคิว บันทึกลูกค้า หรือกำหนดสิทธิพนักงานในลักษณะที่เลือกปฏิบัติโดยผิดกฎหมายหรือละเมิดสิทธิผู้อื่น",
          ],
        },
        {
          id: "third-parties",
          title: "8. บริการของบุคคลภายนอก",
          paragraphs: [
            "บางฟังก์ชันอาจเชื่อมกับระบบชำระเงิน การส่งข้อความ แผนที่ โฮสติ้ง การยืนยันตัวตน หรือบริการอื่นของบุคคลภายนอก ซึ่งอาจมีข้อกำหนดและแนวทางดูแลข้อมูลของตนเอง เรารับผิดชอบส่วนของ EZQueue ที่เราดำเนินการ แต่ไม่อาจควบคุมระบบหรือการตัดสินใจของผู้ให้บริการอิสระ หากเหตุขัดข้องของบุคคลภายนอกกระทบ EZQueue เราจะดำเนินการตามสมควรเพื่อกู้คืนหรือหาทางเลือกเมื่อทำได้",
          ],
        },
        {
          id: "ownership",
          title: "9. ทรัพย์สินทางปัญญาและสิทธิใช้งาน",
          paragraphs: [
            "ซอฟต์แวร์ หน้าจอ เครื่องหมายการค้า เอกสาร และเนื้อหาต้นฉบับของ EZQueue เป็นของเราหรือผู้อนุญาต ตราบใดที่บัญชียังใช้งานและคุณปฏิบัติตามข้อกำหนด เราให้สิทธิใช้บริการตามวัตถุประสงค์แบบจำกัด ไม่ผูกขาด และโอนไม่ได้ สิทธินี้ไม่ทำให้คุณเป็นเจ้าของ EZQueue หรือข้อมูลของผู้ใช้อื่น",
            "หากคุณส่งข้อเสนอแนะ เราอาจนำไปปรับปรุงบริการได้โดยไม่จำกัดสิทธิที่คุณจะใช้แนวคิดเดียวกัน เราจะไม่นำข้อมูลลับของกิจการไปเผยแพร่เป็นคำรับรองหรือกรณีศึกษาโดยไม่ได้รับอนุญาต",
          ],
        },
        {
          id: "availability",
          title: "10. ความพร้อมใช้งานและการเปลี่ยนแปลงบริการ",
          paragraphs: [
            "เราดูแลให้ EZQueue มีความน่าเชื่อถือและปลอดภัย แต่บริการผ่านอินเทอร์เน็ตไม่อาจรับประกันได้ว่าจะไม่หยุดชะงักหรือไม่มีข้อผิดพลาด การบำรุงรักษา งานความปลอดภัยเร่งด่วน ระบบภายนอกขัดข้อง เครือข่าย และเหตุที่เกินการควบคุมตามสมควรอาจกระทบการใช้งาน",
            "เราอาจปรับปรุงหรือทดแทนฟังก์ชัน หากการเปลี่ยนแปลงลดทอนฟังก์ชันแบบชำระเงินอย่างมีนัยสำคัญระหว่างรอบที่ชำระแล้ว เราจะแจ้งล่วงหน้าตามสมควรเมื่อทำได้ และพิจารณาแนวทางเยียวยาตามผลกระทบ ใบสั่งซื้อ และกฎหมายที่ใช้บังคับ",
          ],
        },
        {
          id: "suspension",
          title: "11. การระงับ ปิดบัญชี และการเข้าถึงข้อมูล",
          paragraphs: [
            "เราอาจจำกัดหรือระงับการใช้งานเท่าที่จำเป็นเพื่อควบคุมความเสี่ยงด้านความปลอดภัย ป้องกันการใช้งานที่ผิดกฎหมายหรือเป็นอันตราย ปฏิบัติตามคำสั่งที่ชอบด้วยกฎหมาย ตรวจสอบการละเมิดที่มีมูล หรือจัดการค่าบริการค้างชำระ กรณีไม่เร่งด่วน เราจะชี้แจงปัญหาและให้เวลาแก้ไขตามสมควร",
            "เมื่อปิดพื้นที่ทำงาน การเข้าถึงและการจัดการข้อมูลจะเป็นไปตามแพ็กเกจ ใบสั่งซื้อ ประกาศความเป็นส่วนตัว และหน้าที่จัดเก็บตามกฎหมาย ผู้ใช้ฝั่งธุรกิจควรส่งออกข้อมูลที่จำเป็นก่อนปิดบัญชี เราอาจเก็บบันทึกบางส่วนต่อเท่าที่จำเป็นต่อความปลอดภัย ข้อพิพาท บัญชี หรือกฎหมาย",
          ],
        },
        {
          id: "responsibility",
          title: "12. ความรับผิดและสิทธิที่ไม่อาจตัดทอน",
          paragraphs: [
            "แต่ละฝ่ายรับผิดชอบความเสียหายที่ตนก่อจากการฉ้อโกง การจงใจกระทำผิด การละเมิดความลับ การละเมิดสิทธิของผู้อื่น หรือการฝ่าฝืนหน้าที่ที่กฎหมายไม่อนุญาตให้ยกเว้น ส่วน EZQueue ยังมีหน้าที่ให้บริการด้วยความระมัดระวังและทักษะตามสมควร",
            "เท่าที่กฎหมายอนุญาต คู่สัญญาไม่รับผิดในความเสียหายทางอ้อมที่ไม่อาจคาดหมายได้ตามสมควรในเวลาทำข้อตกลง ไม่มีข้อความใดในข้อกำหนดนี้ตัดสิทธิผู้บริโภคหรือความรับผิดที่กฎหมายห้ามจำกัด และไม่กระทบสิทธิของผู้ใช้บริการหน้าร้านที่มีต่อกิจการผู้ให้บริการจริง",
          ],
        },
        {
          id: "electronic-notices",
          title: "13. การยอมรับทางอิเล็กทรอนิกส์และการแก้ไขข้อกำหนด",
          paragraphs: [
            "การทำเครื่องหมายในช่องยอมรับ การสร้างบัญชี การยอมรับใบสั่งซื้อทางอิเล็กทรอนิกส์ หรือการใช้บริการต่อหลังวันที่แก้ไขซึ่งได้แจ้งให้ทราบ อาจใช้เป็นหลักฐานการแสดงเจตนาทางอิเล็กทรอนิกส์ตามกฎหมายที่เกี่ยวข้อง",
            "เราอาจแก้ไขข้อกำหนดเมื่อบริการ กฎหมาย มาตรการความปลอดภัย หรือรูปแบบธุรกิจเปลี่ยนไป โดยจะเก็บฉบับปัจจุบันและวันที่มีผลไว้ในหน้านี้ หากการเปลี่ยนแปลงสำคัญกระทบผู้ใช้แบบชำระเงินในทางเสียประโยชน์ เราจะแจ้งล่วงหน้าตามสมควร เว้นแต่มีเหตุทางกฎหมายหรือความปลอดภัยที่ต้องดำเนินการเร็วกว่านั้น",
          ],
        },
        {
          id: "law-contact",
          title: "14. กฎหมาย การร้องเรียน และการติดต่อ",
          paragraphs: [
            "ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย หากเกิดข้อพิพาท ทั้งสองฝ่ายควรพยายามหาข้อยุติโดยสุจริตผ่านช่องทางด้านล่างก่อน หากยังตกลงกันไม่ได้ แต่ละฝ่ายยังใช้สิทธิต่อศาลไทยที่มีเขตอำนาจ หรือใช้ช่องทางร้องเรียนและระงับข้อพิพาทของผู้บริโภคตามกฎหมายได้",
            "ติดต่อ hello@ezqueue.app โดยระบุบัญชี พื้นที่ทำงาน รายการจอง หมายเลขคิว หรือใบแจ้งหนี้ที่เกี่ยวข้องเท่าที่มี โปรดอย่าส่งรหัสผ่านหรือข้อมูลอ่อนไหวที่ไม่จำเป็น",
          ],
        },
      ],
    },
    privacy: {
      badge: "ข้อมูลทางกฎหมาย · ความเป็นส่วนตัว",
      title: "ประกาศความเป็นส่วนตัว",
      description:
        "รายละเอียดว่าข้อมูลส่วนบุคคลใดถูกใช้ ใช้ด้วยเหตุผลอะไร ส่งต่อให้ใคร เก็บไว้นานเท่าใด และคุณจัดการสิทธิของตนเองได้อย่างไร",
      effectiveLabel: "มีผลตั้งแต่",
      effectiveDate: "22 กรกฎาคม 2569",
      contents: "สารบัญ",
      back: "กลับไปหน้าสมัครสมาชิก",
      relatedLabel: "กติกาการใช้ EZQueue",
      relatedTitle: "อ่านข้อกำหนดและเงื่อนไข",
      relatedDescription: "ทำความเข้าใจหน้าที่ของ EZQueue กิจการ พนักงาน และผู้ใช้บริการหน้าร้าน",
      contactLabel: "สอบถามหรือใช้สิทธิด้านข้อมูล?",
      contactDescription: "แจ้งข้อมูลเท่าที่ช่วยค้นหาบัญชีหรือรายการที่เกี่ยวข้อง และโปรดอย่าส่งรหัสผ่าน",
      notice:
        "EZQueue ใช้ข้อมูลส่วนบุคคลตามวัตถุประสงค์ที่แจ้งและเท่าที่จำเป็น หากข้อมูลอยู่ในพื้นที่ทำงานที่กิจการเป็นผู้ควบคุมข้อมูล ควรยื่นคำขอต่อกิจการนั้นก่อน",
      sections: [
        {
          id: "controller",
          title: "1. ใครเป็นผู้รับผิดชอบข้อมูลของคุณ",
          paragraphs: [
            "ประกาศนี้ใช้กับข้อมูลส่วนบุคคลที่ผู้ดำเนินการ EZQueue ตามชื่อที่ระบุในใบสั่งซื้อ ใบแจ้งหนี้ หรือการติดต่อโดยตรงกับคุณเป็นผู้ดูแล สำหรับข้อมูลบัญชี เว็บไซต์ การเรียกเก็บเงิน ความปลอดภัย และฝ่ายช่วยเหลือ ผู้ดำเนินการดังกล่าวทำหน้าที่เป็นผู้ควบคุมข้อมูลส่วนบุคคล",
            "สำหรับข้อมูลลูกค้า ผู้มาติดต่อ หรือพนักงานที่ผู้ใช้ฝั่งธุรกิจนำเข้าในพื้นที่ทำงาน โดยทั่วไปกิจการนั้นเป็นผู้กำหนดวัตถุประสงค์และวิธีใช้ข้อมูล จึงทำหน้าที่เป็นผู้ควบคุมข้อมูล ส่วน EZQueue ประมวลผลตามคำสั่งของกิจการ เว้นแต่ข้อมูลบางส่วนที่เราจำเป็นต้องใช้ในฐานะผู้ควบคุมข้อมูลเพื่อความปลอดภัย การปฏิบัติตามกฎหมาย หรือการดูแลบริการของเราเอง",
          ],
        },
        {
          id: "sources",
          title: "2. เราได้รับข้อมูลมาจากไหน",
          paragraphs: [
            "เราได้รับข้อมูลจากคุณโดยตรงเมื่อสมัครสมาชิก จองบริการ รับคิว แก้ไขโปรไฟล์ ซื้อแพ็กเกจ หรือติดต่อฝ่ายช่วยเหลือ นอกจากนี้อาจได้รับจากเจ้าของพื้นที่ทำงานหรือพนักงานที่ได้รับอนุญาต จากอุปกรณ์และเบราว์เซอร์ที่ใช้เข้า EZQueue และจากผู้ให้บริการที่เชื่อมต่อ เช่น ระบบชำระเงินหรือระบบส่งข้อความ เมื่อมีการเปิดใช้ฟังก์ชันนั้น",
            "หากผู้ใช้ฝั่งธุรกิจส่งข้อมูลของบุคคลอื่นให้เรา ผู้ใช้ฝั่งธุรกิจมีหน้าที่ตรวจสอบว่ามีอำนาจหรือฐานกฎหมายที่จะทำเช่นนั้น และแจ้งรายละเอียดแก่เจ้าของข้อมูลตามที่กฎหมายกำหนด",
          ],
        },
        {
          id: "data-categories",
          title: "3. ข้อมูลส่วนบุคคลที่อาจถูกใช้",
          paragraphs: ["ข้อมูลจริงขึ้นอยู่กับฟังก์ชันที่คุณใช้ และอาจประกอบด้วย:"],
          bullets: [
            "ข้อมูลระบุตัวและติดต่อ เช่น ชื่อ อีเมล หมายเลขโทรศัพท์ รหัสบัญชี และภาษาที่เลือก",
            "ข้อมูลกิจการและการทำงาน เช่น ชื่อกิจการ สาขา ตำแหน่ง บทบาท สิทธิการเข้าถึง ตารางพนักงาน และกิจกรรมในพื้นที่ทำงาน",
            "ข้อมูลการจองและคิว เช่น บริการที่เลือก วันที่ เวลา หมายเลขคิว สถานะ เวลาเข้ารับหรือเสร็จสิ้นบริการ และหมายเหตุที่กิจการหรือลูกค้าให้ไว้",
            "ข้อมูลเรียกเก็บเงินและธุรกรรม เช่น แพ็กเกจ รายละเอียดใบแจ้งหนี้ จำนวนเงิน สถานะการชำระ และเลขอ้างอิงจากผู้ให้บริการ โดยเราไม่จำเป็นต้องเก็บหมายเลขบัตรชำระเงินเต็มชุดหากเกตเวย์ภายนอกเป็นผู้รับชำระ",
            "ข้อมูลเทคนิคและความปลอดภัย เช่น IP อุปกรณ์ เบราว์เซอร์ รหัสเซสชัน บันทึกการเข้าใช้ เวลา รายงานข้อผิดพลาด และกิจกรรมที่บันทึกเพื่อตรวจสอบหรือป้องกันการทุจริต",
            "ข้อความที่ติดต่อฝ่ายช่วยเหลือ เอกสารแนบ ความเห็น และประวัติที่จำเป็นต่อการตอบเรื่อง",
          ],
        },
        {
          id: "purposes-bases",
          title: "4. เราใช้ข้อมูลเพื่ออะไรและอาศัยฐานกฎหมายใด",
          paragraphs: ["ฐานกฎหมายจะแตกต่างตามความสัมพันธ์และเหตุการณ์ โดยเราใช้ข้อมูลเพื่อวัตถุประสงค์ต่อไปนี้:"],
          bullets: [
            "สมัครสมาชิก ให้บริการจองและคิว จัดการพื้นที่ทำงาน และส่งมอบแพ็กเกจที่ซื้อ โดยอาศัยความจำเป็นเพื่อเข้าทำหรือปฏิบัติตามสัญญา หรือเพื่อทำตามคำสั่งที่ชอบด้วยกฎหมายของผู้ควบคุมข้อมูล",
            "ยืนยันตัวตน เก็บหลักฐานการใช้งาน ตรวจหาการใช้งานผิดปกติ รักษาความปลอดภัย และตรวจสอบเหตุการณ์ โดยอาศัยประโยชน์โดยชอบด้วยกฎหมายในการดูแลระบบที่ปลอดภัย และหน้าที่ตามกฎหมายในกรณีที่เกี่ยวข้อง",
            "ออกใบแจ้งหนี้ เก็บเอกสารบัญชีหรือภาษี ตอบคำขอโดยชอบด้วยกฎหมาย และก่อตั้ง ใช้ หรือยกขึ้นต่อสู้สิทธิเรียกร้อง โดยอาศัยหน้าที่ตามกฎหมายหรือประโยชน์โดยชอบด้วยกฎหมาย",
            "ส่งข้อความยืนยันการจอง แจ้งสถานะคิว แจ้งเรื่องบริการ และตอบคำขอช่วยเหลือ เพราะจำเป็นต่อบริการที่ขอหรือประโยชน์โดยชอบด้วยกฎหมายในการสื่อสารเกี่ยวกับบริการ",
            "วัดความน่าเชื่อถือ วิเคราะห์ข้อผิดพลาด และปรับปรุงขั้นตอนการใช้งานจากข้อมูลที่ได้สัดส่วน โดยอาศัยประโยชน์โดยชอบด้วยกฎหมาย พร้อมมาตรการคุ้มครองและทางเลือกเมื่อกฎหมายกำหนด",
            "ส่งข่าวส่งเสริมการขายหรือใช้เทคโนโลยีการตลาดที่ไม่จำเป็น เฉพาะเมื่อกฎหมายอนุญาต รวมถึงขอความยินยอมในกรณีที่ต้องขอ คุณถอนความยินยอมได้ทุกเมื่อโดยไม่กระทบการใช้ข้อมูลที่ชอบด้วยกฎหมายก่อนถอน",
          ],
        },
        {
          id: "required-data",
          title: "5. ข้อมูลที่จำเป็นต้องให้",
          paragraphs: [
            "ช่องที่ระบุว่าจำเป็น ข้อมูลเข้าสู่ระบบ และบันทึกทางเทคนิคพื้นฐาน มักจำเป็นต่อการสร้างบัญชี รักษาความปลอดภัยของเซสชัน จองบริการ รับคิว หรือซื้อแพ็กเกจ หากไม่ให้ข้อมูลดังกล่าว ฟังก์ชันที่เกี่ยวข้องอาจใช้งานไม่ได้ ส่วนข้อมูลในช่องไม่บังคับไม่จำเป็นต้องให้ เว้นแต่กิจการผู้ให้บริการอธิบายเหตุผลที่ต้องใช้",
            "EZQueue ไม่ได้ออกแบบมาเพื่อใช้ตัดสินใจโดยระบบอัตโนมัติเพียงอย่างเดียวซึ่งก่อผลทางกฎหมายหรือกระทบสิทธิอย่างมีนัยสำคัญ การคาดการณ์เวลารอและรายงานการดำเนินงานมีไว้ช่วยประกอบการทำงาน โดยกิจการยังเป็นผู้รับผิดชอบการตัดสินใจให้บริการ",
          ],
        },
        {
          id: "disclosure",
          title: "6. ใครบ้างที่อาจได้รับข้อมูล",
          paragraphs: ["เราเปิดเผยข้อมูลเท่าที่จำเป็นต่อผู้รับแต่ละราย ซึ่งอาจได้แก่:"],
          bullets: [
            "กิจการ เจ้าของพื้นที่ทำงาน และพนักงานที่ได้รับอนุญาตซึ่งรับผิดชอบรายการจอง คิว สาขา หรือความสัมพันธ์กับลูกค้านั้น",
            "ผู้ให้บริการด้านโฮสติ้ง พื้นที่จัดเก็บ อีเมลหรือข้อความ การชำระเงิน การเฝ้าระวัง ความปลอดภัย การวิเคราะห์ และฝ่ายช่วยเหลือ ภายใต้สัญญาและการควบคุมสิทธิที่เหมาะสม",
            "ที่ปรึกษาวิชาชีพ ผู้สอบบัญชี บริษัทประกัน และผู้เกี่ยวข้องกับธุรกรรมองค์กรที่เกิดขึ้นจริง ภายใต้หน้าที่รักษาความลับและมาตรการตามกฎหมาย",
            "ศาล หน่วยงานกำกับ เจ้าหน้าที่ผู้บังคับใช้กฎหมาย หรือบุคคลอื่น เมื่อกฎหมายกำหนด จำเป็นต่อการคุ้มครองสิทธิหรือความปลอดภัย หรือมีอำนาจที่ชอบด้วยกฎหมาย",
          ],
        },
        {
          id: "international-transfer",
          title: "7. การส่งข้อมูลไปต่างประเทศ",
          paragraphs: [
            "ผู้ให้บริการคลาวด์ การสื่อสาร หรือฝ่ายช่วยเหลือบางรายอาจประมวลผลข้อมูลนอกประเทศไทย ก่อนส่งข้อมูลที่อยู่ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล เราจะพิจารณาระดับการคุ้มครองของประเทศปลายทาง และใช้กลไกที่กฎหมายรองรับเมื่อจำเป็น เช่น มาตรการคุ้มครองที่เพียงพอ ข้อสัญญาที่เหมาะสม ข้อยกเว้นตามกฎหมาย หรือความยินยอมในกรณีที่กฎหมายอนุญาต",
          ],
        },
        {
          id: "retention",
          title: "8. เราเก็บข้อมูลไว้นานเท่าใด",
          paragraphs: [
            "เราเก็บข้อมูลเท่าที่จำเป็นต่อวัตถุประสงค์ที่แจ้ง โดยพิจารณาจากช่วงที่บัญชีและพื้นที่ทำงานยังใช้งาน คำสั่งที่เป็นลายลักษณ์อักษรของกิจการ รายการจองหรือข้อพิพาทที่ยังไม่สิ้นสุด ความจำเป็นด้านความปลอดภัย รอบการสำรองข้อมูล และหน้าที่ตามกฎหมายบัญชี ภาษี อายุความ หรือกฎหมายอื่น",
            "เมื่อหมดความจำเป็น เราจะลบ ทำให้ไม่สามารถระบุตัวบุคคล หรือจำกัดการเข้าถึงจนกว่าจะลบออกจากข้อมูลสำรองอย่างปลอดภัย บันทึกบางรายการอาจเก็บนานขึ้นเมื่อกฎหมายกำหนด หรือจำเป็นต่อการก่อตั้ง ใช้ หรือยกขึ้นต่อสู้สิทธิเรียกร้อง",
          ],
        },
        {
          id: "security-incidents",
          title: "9. ความปลอดภัยและเหตุละเมิดข้อมูล",
          paragraphs: [
            "เราใช้มาตรการด้านองค์กรและเทคนิคตามระดับความเสี่ยง เช่น การกำหนดสิทธิตามบทบาท การควบคุมการยืนยันตัวตน การเข้ารหัสระหว่างส่ง บันทึกเหตุการณ์ การสำรองข้อมูล การจัดการช่องโหว่ และการจำกัดสิทธิของผู้ให้บริการภายนอกตามความเหมาะสมของระบบ",
            "ไม่มีระบบออนไลน์ใดปราศจากความเสี่ยง หากเกิดเหตุละเมิดข้อมูลส่วนบุคคล เราจะประเมิน ระงับเหตุ เก็บหลักฐานที่จำเป็น และแจ้งสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคลกับเจ้าของข้อมูลภายในเวลาและเงื่อนไขที่กฎหมายกำหนด ผู้ใช้ควรดูแลข้อมูลเข้าสู่ระบบและแจ้งเหตุผิดปกติแก่เราโดยเร็ว",
          ],
        },
        {
          id: "rights",
          title: "10. สิทธิของเจ้าของข้อมูล",
          paragraphs: [
            "ภายใต้เงื่อนไขและข้อยกเว้นของกฎหมาย คุณมีสิทธิขอเข้าถึงและรับสำเนาข้อมูล ขอรับหรือโอนข้อมูล คัดค้านการประมวลผล ขอให้ลบ ทำลาย หรือทำให้ไม่สามารถระบุตัวบุคคล ระงับการใช้ แก้ไขข้อมูลให้ถูกต้อง ถอนความยินยอม และร้องเรียนต่อคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล",
            "ส่งคำขอได้ที่ hello@ezqueue.app เราอาจตรวจสอบตัวตนและขอรายละเอียดเท่าที่จำเป็นเพื่อค้นหาข้อมูล เราจะดำเนินการโดยไม่ชักช้าและภายในระยะเวลาที่กฎหมายกำหนด หากกิจการเป็นผู้ควบคุมข้อมูลในพื้นที่ทำงาน เราอาจส่งคำขอให้กิจการนั้นและช่วยดำเนินการตอบคำขอ",
          ],
        },
        {
          id: "cookies",
          title: "11. คุกกี้และพื้นที่จัดเก็บในอุปกรณ์",
          paragraphs: [
            "EZQueue ใช้เทคโนโลยีที่จำเป็นต่อการรักษาเซสชัน จดจำภาษา ป้องกันแบบฟอร์ม กระจายการใช้งาน และเก็บค่าพื้นฐาน การปิดเทคโนโลยีเหล่านี้อาจทำให้เข้าสู่ระบบหรือใช้ฟังก์ชันหลักไม่ได้ หากภายหลังมีเทคโนโลยีวิเคราะห์หรือโฆษณาที่ไม่จำเป็น เราจะแจ้งรายละเอียดและให้ตัวเลือกก่อนใช้งานตามที่กฎหมายกำหนด",
          ],
        },
        {
          id: "sensitive-children",
          title: "12. ข้อมูลอ่อนไหวและข้อมูลของเด็ก",
          paragraphs: [
            "อย่าบันทึกข้อมูลสุขภาพ ความพิการ ชีวมิติ ศาสนา ประวัติอาชญากรรม หรือข้อมูลอ่อนไหวอื่นในช่องข้อความทั่วไป เว้นแต่บริการนั้นจำเป็นต้องใช้จริงและผู้ควบคุมข้อมูลมีฐานกฎหมายพร้อมมาตรการคุ้มครองที่เหมาะสม EZQueue ไม่ขอข้อมูลอ่อนไหวเพียงเพื่อเปิดบัญชีธุรกิจหรือออกคิวทั่วไป",
            "พื้นที่ทำงานสำหรับธุรกิจไม่ได้ออกแบบให้เด็กดูแลด้วยตนเอง หากบริการจำเป็นต้องใช้ข้อมูลเด็กหรือบุคคลที่ไม่อาจให้ความยินยอมได้ด้วยตนเอง ผู้ควบคุมข้อมูลที่รับผิดชอบต้องปฏิบัติตามหลักเกณฑ์เรื่องความยินยอมและการแจ้งข้อมูลสำหรับบุคคลนั้น",
          ],
        },
        {
          id: "changes",
          title: "13. การแก้ไขประกาศนี้",
          paragraphs: [
            "เราอาจแก้ไขประกาศเมื่อบริการ วิธีประมวลผล หรือข้อกฎหมายเปลี่ยนแปลง โดยจะแสดงฉบับปัจจุบันและวันที่มีผลไว้ในหน้านี้ หากการเปลี่ยนแปลงกระทบวิธีใช้ข้อมูลเดิมอย่างมีนัยสำคัญ เราจะแจ้งเพิ่มเติมหรือขอความยินยอมเมื่อกฎหมายกำหนด",
          ],
        },
        {
          id: "contact-complaint",
          title: "14. การติดต่อและร้องเรียน",
          paragraphs: [
            "หากมีคำถาม ต้องการใช้สิทธิ หรือร้องเรียนเรื่องข้อมูลส่วนบุคคล โปรดอีเมล hello@ezqueue.app พร้อมระบุบัญชี พื้นที่ทำงาน รายการจอง หรือหมายเลขคิวที่เกี่ยวข้องเท่าที่มี โปรดอย่าส่งรหัสผ่านหรือข้อมูลอ่อนไหวที่ไม่เกี่ยวข้อง",
            "คุณมีสิทธิร้องเรียนต่อคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล หากเห็นว่ามีการใช้ข้อมูลโดยไม่ชอบด้วยกฎหมาย การติดต่อเราก่อนอาจช่วยให้แก้ปัญหาได้เร็วขึ้น แต่ไม่ตัดสิทธิในการร้องเรียนดังกล่าว",
          ],
        },
      ],
    },
  },
};
