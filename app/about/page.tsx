import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Cursuri',
  description: 'Learn about our mission to provide high-quality programming courses and help developers advance their careers.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[color:var(--ai-background)] pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[color:var(--ai-foreground)] mb-6">
            About Cursuri
          </h1>
          <p className="text-xl text-[color:var(--ai-muted)] max-w-2xl mx-auto">
            We're passionate about empowering developers with the skills and knowledge needed to succeed in today's fast-paced tech industry.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-6">Our Mission</h2>
          <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
            <p className="text-lg text-[color:var(--ai-foreground)] leading-relaxed mb-4">
              At Cursuri, we believe that high-quality education should be accessible to everyone. Our mission is to bridge the gap between traditional education and industry demands by providing practical, project-based learning experiences.
            </p>
            <p className="text-lg text-[color:var(--ai-foreground)] leading-relaxed">
              We focus on modern technologies and real-world applications, ensuring our students are ready to tackle the challenges of professional software development from day one.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-3">Project-Based Learning</h3>
              <p className="text-[color:var(--ai-muted)]">
                Learn by building real-world projects that you can add to your portfolio. Every course includes hands-on projects that mirror industry workflows.
              </p>
            </div>
            
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-3">Expert Instructors</h3>
              <p className="text-[color:var(--ai-muted)]">
                Our instructors are experienced professionals working in the industry. They bring real-world insights and best practices to every lesson.
              </p>
            </div>
            
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-3">Up-to-Date Content</h3>
              <p className="text-[color:var(--ai-muted)]">
                Technology evolves rapidly, and so do our courses. We regularly update content to ensure you're learning the latest tools and techniques.
              </p>
            </div>
            
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-3">Community Support</h3>
              <p className="text-[color:var(--ai-muted)]">
                Join a community of learners and professionals. Get help when you need it and share your knowledge with others.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-8">Our Values</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[color:var(--ai-primary)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">Quality First</h3>
                <p className="text-[color:var(--ai-muted)]">We never compromise on quality. Every course is carefully crafted and thoroughly tested.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[color:var(--ai-primary)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">Accessibility</h3>
                <p className="text-[color:var(--ai-muted)]">Learning should be accessible to everyone, regardless of background or experience level.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[color:var(--ai-primary)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">Continuous Improvement</h3>
                <p className="text-[color:var(--ai-muted)]">We're always learning and improving, just like our students.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-4">Ready to Start Learning?</h2>
          <p className="text-[color:var(--ai-muted)] mb-6">
            Join thousands of developers who have advanced their careers with our courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Browse Courses
            </a>
            <a
              href="/contact"
              className="border border-[color:var(--ai-primary)] text-[color:var(--ai-primary)] px-8 py-3 rounded-lg font-medium hover:bg-[color:var(--ai-primary)]/10 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}