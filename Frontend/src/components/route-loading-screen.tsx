import Image from "next/image";

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
      aria-label="EZQueue"
    >
      <div className="route-loading__content">
        <div className="route-loading__mark">
          <span className="route-loading__ring" aria-hidden="true" />
          <Image
            src="/images/brand/new-logo-transparent.png"
            alt=""
            width={72}
            height={72}
            priority
          />
        </div>
        <div className="route-loading__brand">EZQueue</div>
        <span className="route-loading__bar" aria-hidden="true" />
      </div>
    </div>
  );
}
