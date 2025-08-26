import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Zap, Users, Calendar, CreditCard } from "lucide-react";

const gradients = "bg-[radial-gradient(80%_60%_at_50%_-20%,hsl(var(--primary)/0.25),transparent_60%),radial-gradient(60%_40%_at_80%_10%,hsl(var(--muted-foreground)/0.25),transparent_40%)]";

export default function Landing() {
  return (
    <div className={`min-h-screen ${gradients} relative overflow-hidden`}>
      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      </div>

      {/* Top Nav */}
      <header className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/landing" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 overflow-hidden">
            <img
              src="/android-chrome-192x192.png"
              alt="SocietyHub"
              className="h-full w-full object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.ico'; }}
            />
          </div>
          <span className="font-semibold">SocietyHub</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#why" className="hover:text-foreground">Why Us</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button>Launch app</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">All-in-one Society Management</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Run your housing society with
            <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent"> speed and clarity</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Billing, maintenance, events, announcements, and member management — unified in a delightful, modern workspace.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup"><Button size="lg">Get started free</Button></Link>
            <a href="#features"><Button size="lg" variant="outline">Explore features</Button></a>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">No credit card required</div>
        </div>

        {/* Social proof */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 items-center opacity-80">
          {[
            "GreenHeights",
            "SkyResidency",
            "Lakeview",
            "PalmOrchid",
          ].map((brand) => (
            <div key={brand} className="text-center text-sm text-muted-foreground">
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section id="features" className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<CreditCard className="h-5 w-5" />}
            title="Automated Billing"
            desc="Generate invoices, track dues, and reconcile payments with a click."
          />
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="Member Directory"
            desc="Maintain resident, tenant, and staff records with role-based access."
          />
          <FeatureCard
            icon={<Calendar className="h-5 w-5" />}
            title="Events & Bookings"
            desc="Plan events and manage amenity bookings with instant notifications."
          />
        </div>
      </section>

      {/* Value props */}
      <section id="why" className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <ValueCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Secure by design"
            desc="Built with industry best practices and role-based permissions."
          />
          <ValueCard
            icon={<Zap className="h-5 w-5" />}
            title="Fast and delightful"
            desc="Snappy UI, clean design, and workflows that feel effortless."
          />
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-2xl text-center rounded-2xl border bg-background/60 backdrop-blur p-8">
          <h3 className="text-2xl font-semibold">Start managing your society today</h3>
          <p className="mt-2 text-muted-foreground">Kick off with sample data. Upgrade anytime.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/signup"><Button size="lg">Create account</Button></Link>
            <Link to="/dashboard"><Button size="lg" variant="outline">View dashboard</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 pb-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} SocietyHub. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-background/70 backdrop-blur p-6 hover:shadow-lg transition-shadow">
      <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-background/70 backdrop-blur p-6 md:p-8">
      <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-muted p-2 text-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-muted-foreground text-sm">{desc}</p>
      <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <li>• Role-based access</li>
        <li>• Real-time updates</li>
        <li>• Audit logs</li>
        <li>• Mobile responsive</li>
      </ul>
    </div>
  );
}
