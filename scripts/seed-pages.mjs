#!/usr/bin/env node
/**
 * Seed script: Creates the Digital Agency template as an editable Page
 * with EXACT content extracted from template/digital Agency/index.html
 */

const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#'

async function fetchJson(url, options = {}) {
  const res = await fetch(`${BACKOFFICE_URL}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  return res.json()
}

async function login() {
  const data = await fetchJson('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!data.token) throw new Error(`Login failed: ${JSON.stringify(data)}`)
  console.log('✓ Logged in')
  return data.token
}

const digitalAgencyPage = {
  title: 'Digital Agency',
  slug: 'home',
  sections: [
    {
      blockType: 'hero',
      badgeIcon: 'fas fa-bolt',
      badgeText: '#1 Digital Agency',
      title: 'We Build Digital Experiences That Matter',
      titleHighlight: 'Digital',
      description: 'Transforming businesses through innovative technology solutions. We craft cutting-edge digital products that drive growth and engagement.',
      primaryButtonText: 'Start a Project',
      primaryButtonIcon: 'fas fa-arrow-right',
      primaryButtonUrl: '#contact',
      secondaryButtonText: 'View Our Work',
      secondaryButtonIcon: 'fas fa-play',
      secondaryButtonUrl: '#portfolio',
      stats: [
        { value: '250+', label: 'Projects Completed' },
        { value: '50+', label: 'Team Members' },
        { value: '98%', label: 'Client Satisfaction' },
      ],
      floatingCards: [
        { icon: 'fas fa-chart-line', label: 'Revenue Growth', value: '+127% This Year' },
        { icon: 'fas fa-users', label: 'Happy Clients', value: '250+ Worldwide' },
      ],
    },
    {
      blockType: 'services',
      badgeIcon: 'fas fa-cog',
      badgeText: 'Our Services',
      title: 'Solutions That Drive Digital Growth',
      titleHighlight: 'Digital',
      description: 'We offer a comprehensive suite of digital services designed to elevate your business in the digital landscape.',
      items: [
        { icon: 'fas fa-code', title: 'Web Development', description: 'Custom web solutions built with modern technologies. From responsive websites to complex web applications.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-mobile-alt', title: 'Mobile Apps', description: 'Native and cross-platform mobile applications that deliver exceptional user experiences on iOS and Android.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-paint-brush', title: 'UI/UX Design', description: 'User-centered design that transforms complex ideas into intuitive and beautiful digital experiences.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-bullhorn', title: 'Digital Marketing', description: 'Data-driven marketing strategies that increase visibility, engagement, and conversions for your brand.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-brain', title: 'AI Solutions', description: 'Intelligent automation and AI-powered solutions that revolutionize how your business operates.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-cloud', title: 'Cloud Services', description: 'Scalable cloud infrastructure and migration services to optimize performance and reduce costs.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
      ],
    },
    {
      blockType: 'about',
      badgeIcon: 'fas fa-info-circle',
      badgeText: 'About Us',
      title: "We're a Team of Digital Experts",
      titleHighlight: 'Digital',
      description: "Since 2012, we've been helping businesses of all sizes transform their digital presence. Our team combines creativity with technical expertise to deliver solutions that truly make a difference.",
      experienceNumber: '12+',
      experienceLabel: 'Years Experience',
      features: [
        { icon: 'fas fa-check', text: 'Custom Development' },
        { icon: 'fas fa-check', text: '24/7 Support' },
        { icon: 'fas fa-check', text: 'Agile Methodology' },
        { icon: 'fas fa-check', text: 'ROI Focused' },
      ],
      buttonText: 'Learn More',
      buttonIcon: 'fas fa-arrow-right',
      buttonUrl: '#contact',
    },
    {
      blockType: 'whyUs',
      badgeIcon: 'fas fa-star',
      badgeText: 'Why Choose Us',
      title: 'Why Businesses Trust Us',
      titleHighlight: 'Trust Us',
      items: [
        { icon: 'fas fa-award', label: 'Award-Winning Team', description: 'Recognized for excellence in design and development across multiple industry awards.' },
        { icon: 'fas fa-shield-alt', label: 'Secure & Reliable', description: 'Enterprise-grade security measures to protect your data and ensure 99.9% uptime.' },
        { icon: 'fas fa-clock', label: 'On-Time Delivery', description: 'We respect deadlines and deliver projects on schedule without compromising quality.' },
      ],
      stats: [
        { icon: 'fas fa-project-diagram', number: '250+', label: 'Projects Completed' },
        { icon: 'fas fa-trophy', number: '15+', label: 'Awards Won' },
        { icon: 'fas fa-globe', number: '30+', label: 'Countries Served' },
        { icon: 'fas fa-heart', number: '98%', label: 'Happy Clients' },
      ],
    },
    {
      blockType: 'team',
      badgeIcon: 'fas fa-users',
      badgeText: 'Our Team',
      title: 'Meet the Experts',
      titleHighlight: 'Experts',
      description: 'Our talented team of professionals is dedicated to delivering exceptional results for every project.',
      members: [
        { name: 'Alex Johnson', role: 'CEO & Founder', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] },
        { name: 'Sarah Williams', role: 'Creative Director', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] },
        { name: 'Michael Chen', role: 'Lead Developer', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] },
        { name: 'Emily Brown', role: 'Marketing Manager', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] },
      ],
    },
    {
      blockType: 'portfolio',
      badgeIcon: 'fas fa-briefcase',
      badgeText: 'Portfolio',
      title: 'Our Recent Projects',
      titleHighlight: 'Projects',
      description: 'Explore our latest work showcasing innovative solutions across various industries.',
      filters: [{ label: 'All' }, { label: 'Web Design' }, { label: 'Mobile App' }, { label: 'Branding' }, { label: 'Marketing' }],
      projects: [
        { icon: 'fas fa-shopping-cart', category: 'Web Development', title: 'E-Commerce Platform', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-heartbeat', category: 'Mobile App', title: 'Healthcare App', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-university', category: 'UI/UX Design', title: 'Banking Dashboard', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-plane', category: 'Web Application', title: 'Travel Booking', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-utensils', category: 'Branding', title: 'Restaurant Branding', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
        { icon: 'fas fa-graduation-cap', category: 'Education', title: 'E-Learning Platform', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
      ],
    },
    {
      blockType: 'blog',
      badgeIcon: 'fas fa-pen-nib',
      badgeText: 'Blog',
      title: 'Latest Insights',
      titleHighlight: 'Insights',
      description: 'Stay updated with the latest trends and insights in digital technology.',
      posts: [
        { icon: 'fas fa-robot', date: 'Jan 15, 2025', tag: 'AI Technology', title: 'The Future of AI in Digital Transformation', author: 'Admin', readTime: '5 Min Read' },
        { icon: 'fas fa-chart-bar', date: 'Jan 10, 2025', tag: 'Marketing', title: '10 Digital Marketing Strategies for 2025', author: 'Admin', readTime: '7 Min Read' },
        { icon: 'fas fa-laptop-code', date: 'Jan 05, 2025', tag: 'Development', title: 'Modern Web Development Best Practices', author: 'Admin', readTime: '6 Min Read' },
      ],
    },
    {
      blockType: 'pricing',
      badgeIcon: 'fas fa-tag',
      badgeText: 'Pricing',
      title: 'Flexible Pricing Plans',
      titleHighlight: 'Pricing',
      description: 'Choose the plan that best fits your business needs and budget.',
      plans: [
        { name: 'Starter', description: 'Perfect for small businesses', price: '$499', period: '/project', features: [{ icon: 'fas fa-check', text: 'Responsive Design' }, { icon: 'fas fa-check', text: '5 Pages Website' }, { icon: 'fas fa-check', text: 'Basic SEO' }, { icon: 'fas fa-check', text: 'Contact Form' }, { icon: 'fas fa-check', text: '1 Month Support' }], buttonText: 'Get Started', buttonUrl: '#contact', buttonStyle: 'outline' },
        { name: 'Professional', description: 'Best for growing businesses', price: '$999', period: '/project', features: [{ icon: 'fas fa-check', text: 'Everything in Starter' }, { icon: 'fas fa-check', text: '15 Pages Website' }, { icon: 'fas fa-check', text: 'Advanced SEO' }, { icon: 'fas fa-check', text: 'CMS Integration' }, { icon: 'fas fa-check', text: '3 Months Support' }], buttonText: 'Get Started', buttonUrl: '#contact', buttonStyle: 'primary', featured: true, featuredBadge: 'Most Popular' },
        { name: 'Enterprise', description: 'For large-scale projects', price: '$2499', period: '/project', features: [{ icon: 'fas fa-check', text: 'Everything in Professional' }, { icon: 'fas fa-check', text: 'Unlimited Pages' }, { icon: 'fas fa-check', text: 'Custom Features' }, { icon: 'fas fa-check', text: 'E-Commerce Ready' }, { icon: 'fas fa-check', text: '12 Months Support' }], buttonText: 'Get Started', buttonUrl: '#contact', buttonStyle: 'outline' },
      ],
    },
    {
      blockType: 'cta',
      title: 'Ready to Start Your Next Project?',
      description: "Let's collaborate and create something amazing together. Get in touch with us today and let's bring your vision to life.",
      buttonText: 'Start a Project',
      buttonIcon: 'fas fa-arrow-right',
      buttonUrl: '#contact',
    },
    {
      blockType: 'contact',
      title: 'Get In Touch',
      titleHighlight: 'Touch',
      description: "Have a project in mind? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      contactItems: [
        { icon: 'fas fa-map-marker-alt', label: 'Visit Us', value: '123 Digital Street, Tech City, TC 12345' },
        { icon: 'fas fa-envelope', label: 'Email Us', value: 'hello@digitalagency.com' },
        { icon: 'fas fa-phone', label: 'Call Us', value: '+1 (555) 123-4567' },
      ],
      socials: [
        { icon: 'fab fa-facebook-f', url: '#' },
        { icon: 'fab fa-twitter', url: '#' },
        { icon: 'fab fa-instagram', url: '#' },
        { icon: 'fab fa-linkedin-in', url: '#' },
      ],
    },
  ],
}

async function run() {
  console.log(`\n🌱 Seeding Digital Agency page to ${BACKOFFICE_URL}\n`)

  try {
    const token = await login()

    const existing = await fetchJson('/api/pages?where[slug][equals]=home', {
      headers: { Authorization: `JWT ${token}` },
    })

    if (existing.docs?.length > 0) {
      console.log('⚠ Page with slug "home" already exists. Updating...')
      const res = await fetchJson(`/api/pages/${existing.docs[0].id}`, {
        method: 'PUT',
        headers: { Authorization: `JWT ${token}` },
        body: JSON.stringify(digitalAgencyPage),
      })
      if (res.doc) {
        console.log(`✓ Updated page: ${res.doc.title} (id: ${res.doc.id})`)
      }
    } else {
      const res = await fetchJson('/api/pages', {
        method: 'POST',
        headers: { Authorization: `JWT ${token}` },
        body: JSON.stringify(digitalAgencyPage),
      })
      if (res.doc) {
        console.log(`✓ Created page: ${res.doc.title} (id: ${res.doc.id})`)
      }
    }

    console.log('\n✅ Seed complete!\n')
  } catch (err) {
    console.error(`\n❌ Seed failed: ${err.message}\n`)
    process.exit(1)
  }
}

run()
