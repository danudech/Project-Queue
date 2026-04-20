"use client";
import Logo from "@/components/partials/auth/logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from '@/i18n/routing';

const MailConfirm = () => {
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
                            <Link href="/contact">Contact Us</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container flex-grow flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center max-w-[500px] mx-auto">
                    {/* Replaced maintenance image with a mail-themed illustration */}
                    <Image 
                        height={300} 
                        width={300} 
                        src="/images/svg/img-1.svg"
                        alt="Email Sent" 
                        className="mb-8"
                    />
                    
                    <h4 className="text-3xl font-semibold text-default-900 mb-4">
                        Check your email
                    </h4>
                    <p className="font-normal text-base text-default-500 mb-8 leading-relaxed">
                        We have sent a verification link to your email address. <br />
                        Please click the link in the email to confirm your registration.
                    </p>

                    <div className="flex flex-col w-full gap-4">
                        <Button className="h-12 w-full text-base" asChild>
                            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                                Open Mail App
                            </a>
                        </Button>
                        <p className="text-sm text-default-500">
                            Didn't receive the email?{" "}
                            <button className="text-primary font-medium hover:underline">
                                Resend link
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full">
                <div className="container">
                    <div className="md:flex justify-between items-center flex-wrap space-y-4 py-6 border-t border-default-100">
                        <div>
                           <p className="text-sm text-default-500 text-center md:text-left">
                               © {new Date().getFullYear()} DashCode. All rights reserved.
                           </p>
                        </div>
                        <div>
                            <ul className="flex justify-center space-x-6">
                                <li>
                                    <Link href="#" className="text-default-500 text-sm transition duration-150 hover:text-default-900">
                                        Privacy policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-default-500 text-sm transition duration-150 hover:text-default-900">
                                        Faq
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-default-500 text-sm transition duration-150 hover:text-default-900">
                                        Email us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MailConfirm;