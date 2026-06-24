import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  return (
    <div className="bg-[#0E0E0E] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white">
      {/*<style>{`html, body {overflow-x: hidden;}`}</style>*/}
      <ReturnUrlComponent />
      <div className="flex flex-col py-[40px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white p-[12px] bg-[#1A1919]">
        <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
          <LogoTextComponent />
          <div className="flex">{children}</div>
        </div>
      </div>
      <div className="flex-1 hidden lg:flex flex-col justify-center items-center px-[48px] relative overflow-hidden rounded-[12px]">
        <div className="absolute w-[460px] h-[460px] rounded-full bg-[#FF2364] opacity-[0.16] blur-[130px] -top-[60px] -right-[40px] pointer-events-none" />
        <div className="absolute w-[380px] h-[380px] rounded-full bg-[#00D2C8] opacity-[0.12] blur-[130px] bottom-[10px] left-[10px] pointer-events-none" />
        <div className="relative w-full max-w-[460px] flex flex-col gap-[22px]">
          <div className="text-[13px] tracking-[0.24em] uppercase text-[#FF2364] font-semibold">
            Woodstock &amp; Wifi
          </div>
          <div className="text-[44px] leading-[1.08] font-bold text-white">
            Media Manager
          </div>
          <div className="text-[18px] leading-[1.5] text-white/70">
            The internal command center for planning, publishing and measuring
            Woodstock &amp; Wifi social content across every channel.
          </div>
          <div className="mt-[8px] flex flex-col gap-[12px] text-[15px] text-white/60">
            <div className="flex items-center gap-[12px]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#FF2364]" />
              Plan every post on one shared calendar
            </div>
            <div className="flex items-center gap-[12px]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#00D2C8]" />
              Publish to all connected channels at the right time
            </div>
            <div className="flex items-center gap-[12px]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#FF2364]" />
              Track what resonates and double down on it
            </div>
          </div>
          <div className="mt-[18px] text-[14px] leading-[1.5] text-white/35 italic">
            “Mensen kopen geen producten, ze kopen verhalen.”
          </div>
        </div>
      </div>
    </div>
  );
}
