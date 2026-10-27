import { BrandLogo } from "@/components/brand-logo";
import { BRAND } from "@/config/brand";

type RouteLoadingScreenProps = {
  visible?: boolean;
};

export default function RouteLoadingScreen({
  visible = true,
}: RouteLoadingScreenProps) {
  return (
    <div
      className="route-loading"
      data-visible={visible}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      aria-label={BRAND.name}
    >
      <div className="route-loading__content">
        <div className="route-loading__mark">
          <span className="route-loading__ring" aria-hidden="true" />
          <BrandLogo compact symbolClassName="size-[72px]" />
        </div>
        <div className="route-loading__brand">{BRAND.name}</div>
        <span className="route-loading__bar" aria-hidden="true" />
      </div>
    </div>
  );
}
