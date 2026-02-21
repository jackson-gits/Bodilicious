import { useState } from 'react';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-silk-light border-t border-silk">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-6 py-14">
          <div className="md:col-span-1">
            <h3 className="text-[10px] font-sans font-bold tracking-widest uppercase text-dark-red mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-sm font-sans text-grey-beige mb-5 leading-relaxed">
              Sign up for skincare tips, expert advice and exclusive offers from Bodilicious.
            </p>
            {subscribed ? (
              <p className="text-sm font-sans text-ruby-red font-medium">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 border border-silk-dark bg-white px-3 py-2.5 text-xs font-sans text-dark-red placeholder-grey-beige/70 focus:outline-none focus:border-dark-red transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="bg-dark-red text-silk px-4 py-2.5 text-[10px] font-sans font-bold tracking-widest uppercase hover:bg-ruby-red transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}

           
          </div>

          <div>
            <h3 className="text-[10px] font-sans font-bold tracking-widest uppercase text-dark-red mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2.5">
              {['Contact Us', 'Shipping & Returns', 'FAQs'].map(item => (
                <li key={item}>
                  <button className="text-sm font-sans text-grey-beige hover:text-ruby-red transition-colors tracking-wide">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-sans font-bold tracking-widest uppercase text-dark-red mb-4">
              Information
            </h3>
            <ul className="space-y-2.5">
              {[
                'Store Locator',
                'Terms & Conditions of Sale',
                'Terms & Conditions of Use',
                'Accessibility Declaration',
                'Privacy Policy',
                'Careers',
                'Student Savings',
              ].map(item => (
                <li key={item}>
                  <button className="text-sm font-sans text-grey-beige hover:text-ruby-red transition-colors tracking-wide">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-sans font-bold tracking-widest uppercase text-dark-red mb-4">
              Social
            </h3>
            <div className="flex gap-4 flex-wrap">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Youtube, label: 'YouTube' },
                { Icon: Twitter, label: 'Twitter' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="text-grey-beige hover:text-ruby-red transition-colors"
                >
                  <Icon size={20} />
                </button>
              ))}
              <button
                aria-label="TikTok"
                className="text-grey-beige hover:text-ruby-red transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-silk flex items-center justify-between">
          <p className="text-xs font-sans text-grey-beige tracking-wide">
            © {new Date().getFullYear()} Bodilicious – International
          </p>
        </div>
      </div>
    </footer>
  );
}
