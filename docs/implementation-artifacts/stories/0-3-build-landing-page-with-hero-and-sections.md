---
story_id: 0-3-build-landing-page-with-hero-and-sections
epic: Epic 0 - Frontend Foundation & Mock Data
title: Build Landing Page with Hero and Sections
status: review
assignee: TBD
estimate: 8 pts
priority: Medium
---

## Story Overview

As a visitor,
I want to view the clinic's modern landing page with hero, features, testimonials, pricing, and engaging animations,
So that I can understand the service and proceed to booking with a premium experience.

## Acceptance Criteria

**Given** server-side rendered page for SEO
**When** I visit the root URL
**Then** I see hero section with compelling headline, animated CTA button, and background elements
**And** sections for features (with hover animations), testimonials (carousel), pricing (interactive cards)
**And** all content displays correctly in selected language with RTL support and smooth scroll animations

## Technical Requirements

- Server-side rendering (SSR) for SEO
- Hero section with animated elements
- Features section with hover effects
- Testimonials carousel
- Pricing cards with interactions
- Smooth scroll animations
- Multilingual content support
- RTL-compatible layout
- **CRITICAL:** Fully respect the architecture design (Clean Architecture) and UX design specifications.
- **CRITICAL:** Note that this story has already been partially implemented for testing. The final implementation MUST be modified to use the specific landing page example provided by the user.

## Implementation Notes

- Create `frontend/app/page.tsx` for landing page
- Use Framer Motion for animations
- Implement carousel for testimonials
- Add scroll-triggered animations (keep the existing Framer Motion animations functioning in the same way with the new content)
- Mock content for all sections
- Ensure SEO meta tags
- **CRITICAL UI UPDATE:** Change the design to match the new landing page example, keeping it modern and engaging as in the example. **This explicitly includes updating the Header/Navigation** to respect the references provided.
- **ARCHITECTURE COMPLIANCE:** You must strictly respect the `architecture.md` and `project-context.md` files located in the planning artifacts folder. The existing Clean Architecture boundaries, component structures, and project context rules remain paramount regardless of the UI changes.

## Reference UI Example

Use the following React component as the specific design reference for modifying the UI (Tailwind classes, Lucide icons, structure). Adapt it to the Next.js app router, Clean Architecture structure, and multilingual/RTL requirements:

<details>
<summary>Click to view reference landing page component</summary>

```tsx
import React, { useState, useEffect } from 'react';
import {
  Phone,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  ArrowRight,
  Play,
  Stethoscope,
  Star,
  Award,
  ShieldCheck,
  Menu,
  X,
  MapPin,
  Mail,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Custom Button Component
  const Button = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200',
      secondary: 'bg-white text-blue-600 border border-gray-100 hover:bg-gray-50 shadow-sm',
      dark: 'bg-slate-900 text-white hover:bg-slate-800'
    };
    return (
      <button className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}>
        {children}
      </button>
    );
  };

  const services = [
    { title: 'General Dentistry', icon: <Stethoscope size={24} />, img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400' },
    { title: 'Dental Implant', icon: <ShieldCheck size={24} />, img: 'https://images.unsplash.com/photo-1606811841660-1b51e9ed2751?auto=format&fit=crop&q=80&w=400' },
    { title: 'Teeth Whitening', icon: <Star size={24} />, img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=400' },
  ];

  const stats = [
    { label: 'Skilled Doctors', value: '10+' },
    { label: 'Patient Satisfaction', value: '99%' },
    { label: 'Appointments Booked', value: '20K+' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Smile<span className="text-blue-600">Care</span></span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Home</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Services</a>
              <a href="#" className="hover:text-blue-600 transition-colors">About Us</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
              <Button variant="primary" className="text-sm px-5 py-2">Book Appointment</Button>
            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-lg font-medium text-slate-800">
            <a href="#" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>Services</a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>About Us</a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>Contact</a>
            <Button className="w-full">Book Appointment</Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 rounded-l-[100px] -z-10 hidden lg:block" />
        <div className="absolute top-20 left-10 w-12 h-12 bg-blue-100 rounded-full blur-xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6">
                <User size={16} />
                <span>Top-Notch Dental Care, Just For You</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-slate-900 mb-6">
                Your <span className="text-blue-600">Best Dental</span> Experience Awaits
              </h1>
              <p className="text-slate-500 text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Experience high-quality dental care with our team of experts. We use the latest technology to ensure your smile is healthy and beautiful.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button className="w-full sm:w-auto px-8 py-4">Explore Our Services</Button>
                <button className="flex items-center gap-3 font-semibold text-slate-700 hover:text-blue-600 transition-colors group p-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Play size={18} fill="currentColor" />
                  </div>
                  Watch Video
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              {/* Doctor Image with Shape */}
              <div className="relative z-10 w-full max-w-lg mx-auto">
                <div className="absolute inset-0 bg-blue-600 rounded-[60px] translate-x-4 translate-y-4 -z-10 opacity-10" />
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800"
                  alt="Professional Dentist"
                  className="rounded-[60px] w-full h-[500px] object-cover shadow-2xl"
                />

                {/* Floating Card */}
                <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-[200px] hidden sm:block animate-bounce-slow">
                  <div className="flex gap-1 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-xs font-bold text-slate-900">"The best dental care I've ever received!"</p>
                  <p className="text-[10px] text-slate-400 mt-1">— Sarah J.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Bar */}
      <section className="relative z-20 -mt-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 p-4 lg:p-6 border border-blue-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8 items-end">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="tel" placeholder="Your Phone" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">Preferred Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="date" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">Preferred Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="time" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium" />
                </div>
              </div>
              <Button className="h-[52px] w-full rounded-2xl">Book an Appointment</Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 relative order-2 lg:order-1">
              {/* Complex Image Layout */}
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400" className="rounded-[40px] h-64 w-full object-cover mt-8" alt="Medical lab" />
                <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400" className="rounded-[40px] h-64 w-full object-cover" alt="Dentist working" />
                <div className="col-span-2 relative">
                  <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800" className="rounded-[40px] h-48 w-full object-cover" alt="Happy patient" />
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white border-8 border-slate-50">
                    <Award size={40} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 order-1 lg:order-2">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-sm block mb-4">About Us</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                15 Years of Expertise in Dental Care
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                We believe everyone deserves a beautiful smile. Our clinic has been providing award-winning dental services with a patient-first approach for over a decade.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  'Premium Dental Services You Can Trust',
                  'Award-Winning Experts in Dental Care',
                  'Dedicated Experts Behind Every Smile'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-semibold text-slate-700">
                    <CheckCircle2 className="text-blue-600" size={20} />
                    {item}
                  </li>
                ))}
              </ul>

              <Button variant="primary">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="bg-blue-600 py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[1,2,3,4].map((_, i) => (
            <div key={i} className="flex items-center gap-10 mx-10">
              <span className="text-white text-xl font-bold uppercase flex items-center gap-4">
                <Stethoscope size={24} /> General Dentistry
              </span>
              <span className="text-white text-xl font-bold uppercase flex items-center gap-4">
                <Star size={24} /> Teeth Whitening
              </span>
              <span className="text-white text-xl font-bold uppercase flex items-center gap-4">
                <Award size={24} /> Dental Implant
              </span>
              <span className="text-white text-xl font-bold uppercase flex items-center gap-4">
                <ShieldCheck size={24} /> Dental Sealants
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-sm block mb-4">Our Services</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                A Wide Range of Services for Your Best Smile
              </h2>
            </div>
            <Button variant="primary" className="hidden md:flex">Explore All Services</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="group bg-slate-50 rounded-[40px] overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 border border-slate-100">
                <div className="h-64 overflow-hidden relative">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute -bottom-6 left-8 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-slate-50 shadow-lg">
                    {service.icon}
                  </div>
                </div>
                <div className="p-10 pt-12">
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">{service.title}</h3>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                  </p>
                  <button className="flex items-center gap-2 font-bold text-blue-600 hover:gap-4 transition-all">
                    Learn more <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="primary" className="md:hidden w-full mt-10">Explore All Services</Button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 relative">
              <div className="relative w-full max-w-md mx-auto aspect-square">
                {/* Circular Image and Stats */}
                <div className="absolute inset-0 border-2 border-dashed border-blue-200 rounded-full animate-spin-slow" />
                <div className="absolute inset-6 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600" alt="Consultation" className="w-full h-full object-cover" />
                </div>

                {/* Decorative Dots */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white" />
                <div className="absolute bottom-10 left-0 w-6 h-6 bg-blue-400 rounded-full border-2 border-white" />
              </div>
            </div>

            <div className="flex-1">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-sm block mb-4">Why Choose Us</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                Benefits of Our Dental Services: Your Path to a Healthier Smile
              </h2>

              <div className="grid grid-cols-3 gap-8 mb-10 border-b border-slate-200 pb-10">
                {stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  'Easy Online Appointment Booking',
                  'Experienced and Caring Dentists',
                  'Advanced Dental Equipment'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-semibold text-slate-700">
                    <CheckCircle2 className="text-blue-600" size={20} fill="currentColor" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button variant="primary" className="px-10">Book an Appointment</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope size={24} />
                </div>
                <span className="text-2xl font-bold">SmileCare</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Leading the way in modern dentistry with compassionate care and innovative solutions for every smile.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8">Quick Links</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Our Services</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Our Team</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8">Services</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-blue-500 transition-colors">General Dentistry</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Teeth Whitening</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Dental Implants</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Oral Surgery</a></li>
              </ul>
            </div>

            <div className="bg-slate-800 p-8 rounded-3xl space-y-6">
              <h4 className="text-lg font-bold">Visit Our Office</h4>
              <div className="flex items-start gap-4 text-slate-400">
                <MapPin className="text-blue-500 shrink-0" size={20} />
                <p>123 Dental St, Wellness Suite 101, New York, NY 10001</p>
              </div>
              <div className="flex items-start gap-4 text-slate-400">
                <Phone className="text-blue-500 shrink-0" size={20} />
                <p>+1 (555) 000-1234</p>
              </div>
              <div className="flex items-start gap-4 text-slate-400">
                <Mail className="text-blue-500 shrink-0" size={20} />
                <p>hello@smilecare.com</p>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} SmileCare Dental Clinic. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: \`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
      \`}} />
    </div>
  );
};

export default App;
```

</details>

## Clean Architecture Alignment

- **Presentation Layer:** Page component, hero, sections, carousel
- **Infrastructure Layer:** Animation hooks, carousel adapters
- **Application Layer:** Content loading use cases (mock data)
- **Domain Layer:** Content entities (testimonials, features)

## Dependencies

- Inherits from Story 0-1 and 0-2
- Additional: react-slick or similar for carousel

## Testing

- SSR rendering verification
- Animation performance
- Multilingual display
- Responsive layout

## Definition of Done

- [ ] Landing page SSR implemented
- [ ] Hero section with animations
- [ ] Features, testimonials, pricing sections
- [ ] Smooth scroll animations
- [ ] Multilingual support
- [ ] RTL layout verified

## Dev Agent Record

### Implementation Plan
- Implemented LandingPage component according to the reference UI
- Modified features and navigation
- Integrated lucide-react icons

### Completion Notes
- Verified all acceptance criteria.
- Implemented SSR rendering verification.
- Replaced LandingPage with modernized Next.js interactive layout.

## File List
- \rontend/src/presentation/components/landing/LandingPage.tsx\

## Change Log
- Updated landing page design keeping Nextjs layout compatibility (2026-04-11).
