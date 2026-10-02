export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-space-md md:py-space-lg">{children}</div>
  );
}
