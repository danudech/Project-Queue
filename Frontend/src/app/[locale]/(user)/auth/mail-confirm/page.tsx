"use client";
import Logo from "@/components/partials/auth/logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from '@/i18n/routing';
// ✅ 1. Import useTranslations
import { useTranslations } from "next-intl"; 

const MailConfirm = () => {
    const t = useTranslations("EmailConfirmation");

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="absolute left-0 top-0 w-full z-10">
                <div className="flex justify-between items-center py-6 container">
                    <div>
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>
                    <div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/contact">{t("contact_us")}</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container flex-grow flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center max-w-[500px] mx-auto">
                    <Image 
                        height={300} 
                        width={300} 
                        src="/images/svg/img-1.svg"
                        alt="Email Sent" 
                        className="mb-8"
                    />
                    
                    <h4 className="text-3xl font-semibold text-default-900 mb-4">
                        {t("check_email_title")}
                    </h4>
                    <p className="font-normal text-base text-default-500 mb-8 leading-relaxed">
                        {t("check_email_desc_1")} <br />
                        {t("check_email_desc_2")}
                    </p>

                    <div className="flex flex-col w-full gap-4">
                        <Button className="h-12 w-full text-base" asChild>
                            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                                {t("open_mail_app")}
                            </a>
                        </Button>
                        <p className="text-sm text-default-500">
                            {t("didnt_receive_email")}{" "}
                            <button className="text-primary font-medium hover:underline">
                                {t("resend_link")}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <div className="container">
                    <div className="md:flex justify-between items-center flex-wrap space-y-4 py-6 border-t border-default-100">
                        <div>
                           <p className="text-sm text-default-500 text-center md:text-left">
                               © {new Date().getFullYear()} QueueApp. All rights reserved.
                           </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MailConfirm;