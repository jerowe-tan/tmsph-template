import { ButtonLink } from "@/components/ui/button/button-link";
import { FramedImage } from "@/components/ui/image/framed-image";
import { ViewportBody } from "@/components/ui/layout/viewport-body";
import { Body } from "@/components/ui/typography/body";
import { Display } from "@/components/ui/typography/display";
export default function Home() {
  return (
    <ViewportBody>
      <div className="mt-[calc(10vh+1rem)]">
        <Display size="sm" margin="none">Welcome to</Display>
        <Display size="lg" margin="xl">
          Toyota Mobility Solutions
        </Display>
        <FramedImage 
          src="https://www.toyota-mobilitysolutions.ph/img/contact-us/contact-us.jpg"
          alt="Toyota Mobility Solutions"
          width={1000}
          loading="eager"
          sizes={"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        />
      </div>
      <div>
        <hr className="invisible my-2" />
        <Body>Join us today and discover the future of mobility.</Body>
        <hr className="invisible my-2" />
        <div className="flex justify-start gap-2">
          <ButtonLink 
            href="/register"
          >
            Sign Up
          </ButtonLink>
          <ButtonLink
            href="/login"
          >
            Log In
          </ButtonLink>
        </div>
      </div>
    </ViewportBody>
  );
}
