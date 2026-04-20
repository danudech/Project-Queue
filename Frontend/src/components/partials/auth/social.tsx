"use client";
import Image from "next/image";

const Social = ({ locale }: { locale: string }) => {
  const signIn = (provider: string, options: { locale: string }) => {
    console.log(`Signing in with ${provider} and locale ${options.locale}`);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">      
      <ul className="flex items-center justify-center gap-5">
        {/* Facebook */}
        <li>
          <button
            onClick={() => signIn("facebook", { locale })}
            className="group flex h-11 w-11 items-center justify-center rounded-full bg-[#395599] p-2.5 transition-transform hover:scale-110 active:scale-95 shadow-md"
            aria-label="Sign in with Facebook"
          >
            <Image 
              width={24} 
              height={24} 
              className="h-full w-full object-contain" 
              src="/images/icon/fb.svg" 
              alt="Facebook" 
            />
          </button>
        </li>

        {/* Google */}
        <li>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              signIn("google", { locale });
            }}
          >
            <button 
              type="submit" 
              className="inline-flex h-11 w-11 p-2 bg-[#EA4335] text-white text-2xl flex-col items-center justify-center rounded-full hover:scale-110 active:scale-95 shadow-md border border-gray-100"
              aria-label="Sign in with Google"
            >
              <Image 
                width={24} 
                height={24} 
                className="h-full w-full object-contain" 
                src="/images/icon/gp.svg"
                alt="Google" 
              />
            </button>
          </form>
        </li>
      </ul>
    </div>
  );
};

export default Social;