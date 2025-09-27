import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Cursuri',
  description: 'Get in touch with us. We\'d love to hear from you about our courses or any questions you might have.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[color:var(--ai-background)] pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[color:var(--ai-foreground)] mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-[color:var(--ai-muted)] max-w-2xl mx-auto">
            Have a question about our courses or need help getting started? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-6">Send us a Message</h2>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)]"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)]"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)]"
                >
                  <option value="">Select a subject</option>
                  <option value="course-inquiry">Course Inquiry</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)] resize-vertical"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:ring-offset-2"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">📧</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-1">Email</h3>
                    <a
                      href="mailto:contact@cursuri.dev"
                      className="text-[color:var(--ai-primary)] hover:underline"
                    >
                      contact@cursuri.dev
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🕒</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-1">Response Time</h3>
                    <p className="text-[color:var(--ai-muted)]">
                      We typically respond within 24 hours during business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-1">Global Support</h3>
                    <p className="text-[color:var(--ai-muted)]">
                      We provide support to students worldwide in English and Romanian.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">Do you offer refunds?</h3>
                  <p className="text-[color:var(--ai-muted)]">
                    Yes, we offer a 30-day money-back guarantee on all courses.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">Can I access courses on mobile?</h3>
                  <p className="text-[color:var(--ai-muted)]">
                    Absolutely! Our platform is fully responsive and works great on all devices.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">Do you provide certificates?</h3>
                  <p className="text-[color:var(--ai-muted)]">
                    Yes, you'll receive a certificate of completion for each course you finish.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-6">Follow Us</h2>
              
              <div className="flex gap-4">
                <a
                  href="https://github.com/dragoscv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                >
                  <span className="text-[color:var(--ai-primary)] text-lg">🐙</span>
                </a>
                <a
                  href="https://tiktok.com/@dragoscatalin.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                >
                  <span className="text-[color:var(--ai-primary)] text-lg">🎵</span>
                </a>
                <a
                  href="https://dragoscatalin.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                >
                  <span className="text-[color:var(--ai-primary)] text-lg">🌐</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}