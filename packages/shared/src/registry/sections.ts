import { z } from 'zod';

export const SectionCategory = [
  'hero',
  'services',
  'about',
  'whyUs',
  'team',
  'portfolio',
  'blog',
  'pricing',
  'cta',
  'contact',
  'menu',
  'menuHighlights',
  'reservation',
  'gallery',
  'testimonials',
  'specials',
] as const;

export type SectionCategoryType = (typeof SectionCategory)[number];

export interface SectionRegistryEntry {
  key: SectionCategoryType;
  label: string;
  description: string;
  icon: string;
  category: 'layout' | 'content' | 'marketing' | 'conversion';
  schema: z.ZodObject<any>;
  defaultProps: Record<string, any>;
}

const HeroSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-bolt'),
  badgeText: z.string().optional().default('#1 Digital Agency'),
  title: z.string().min(1).default('We Build Digital Experiences That Matter'),
  titleHighlight: z.string().optional().default('Digital'),
  description: z.string().optional().default('Transforming businesses through innovative technology solutions. We craft cutting-edge digital products that drive growth and engagement.'),
  primaryButtonText: z.string().optional().default('Start a Project'),
  primaryButtonIcon: z.string().optional().default('fas fa-arrow-right'),
  primaryButtonUrl: z.string().optional().default('#contact'),
  secondaryButtonText: z.string().optional().default('View Our Work'),
  secondaryButtonIcon: z.string().optional().default('fas fa-play'),
  secondaryButtonUrl: z.string().optional().default('#portfolio'),
  stats: z.array(z.object({
    value: z.string().default('250+'),
    label: z.string().default('Projects Completed'),
  })).optional().default([
    { value: '250+', label: 'Projects Completed' },
    { value: '50+', label: 'Team Members' },
    { value: '98%', label: 'Client Satisfaction' },
  ]),
  floatingCards: z.array(z.object({
    icon: z.string().default('fas fa-chart-line'),
    label: z.string().default('Revenue Growth'),
    value: z.string().default('+127% This Year'),
  })).optional().default([
    { icon: 'fas fa-chart-line', label: 'Revenue Growth', value: '+127% This Year' },
    { icon: 'fas fa-users', label: 'Happy Clients', value: '250+ Worldwide' },
  ]),
});

const ServicesSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-cog'),
  badgeText: z.string().optional().default('Our Services'),
  title: z.string().min(1).default('Solutions That Drive Digital Growth'),
  titleHighlight: z.string().optional().default('Digital'),
  description: z.string().optional().default('We offer a comprehensive suite of digital services designed to elevate your business in the digital landscape.'),
  items: z.array(z.object({
    icon: z.string().default('fas fa-code'),
    title: z.string().default('Web Development'),
    description: z.string().default('Custom web solutions built with modern technologies. From responsive websites to complex web applications.'),
    linkText: z.string().optional().default('Learn More'),
    linkIcon: z.string().optional().default('fas fa-arrow-right'),
    linkUrl: z.string().optional().default('#'),
  })).optional().default([
    { icon: 'fas fa-code', title: 'Web Development', description: 'Custom web solutions built with modern technologies. From responsive websites to complex web applications.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-mobile-alt', title: 'Mobile Apps', description: 'Native and cross-platform mobile applications that deliver exceptional user experiences on iOS and Android.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-paint-brush', title: 'UI/UX Design', description: 'User-centered design that transforms complex ideas into intuitive and beautiful digital experiences.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-bullhorn', title: 'Digital Marketing', description: 'Data-driven marketing strategies that increase visibility, engagement, and conversions for your brand.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-brain', title: 'AI Solutions', description: 'Intelligent automation and AI-powered solutions that revolutionize how your business operates.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-cloud', title: 'Cloud Services', description: 'Scalable cloud infrastructure and migration services to optimize performance and reduce costs.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
  ]),
});

const AboutSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-info-circle'),
  badgeText: z.string().optional().default('About Us'),
  title: z.string().min(1).default("We're a Team of Digital Experts"),
  titleHighlight: z.string().optional().default('Digital'),
  description: z.string().optional().default('Since 2012, we have been helping businesses of all sizes transform their digital presence. Our team combines creativity with technical expertise to deliver solutions that truly make a difference.'),
  experienceNumber: z.string().optional().default('12+'),
  experienceLabel: z.string().optional().default('Years Experience'),
  features: z.array(z.object({
    icon: z.string().optional().default('fas fa-check'),
    text: z.string().default('Custom Development'),
  })).optional().default([
    { icon: 'fas fa-check', text: 'Custom Development' },
    { icon: 'fas fa-check', text: '24/7 Support' },
    { icon: 'fas fa-check', text: 'Agile Methodology' },
    { icon: 'fas fa-check', text: 'ROI Focused' },
  ]),
  buttonText: z.string().optional().default('Learn More'),
  buttonIcon: z.string().optional().default('fas fa-arrow-right'),
  buttonUrl: z.string().optional().default('#contact'),
});

const WhyUsSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-star'),
  badgeText: z.string().optional().default('Why Choose Us'),
  title: z.string().min(1).default('Why Businesses Trust Us'),
  titleHighlight: z.string().optional().default('Trust Us'),
  items: z.array(z.object({
    icon: z.string().default('fas fa-award'),
    label: z.string().default('Award-Winning Team'),
    description: z.string().default('Recognized for excellence in design and development across multiple industry awards.'),
  })).optional().default([
    { icon: 'fas fa-award', label: 'Award-Winning Team', description: 'Recognized for excellence in design and development across multiple industry awards.' },
    { icon: 'fas fa-shield-alt', label: 'Secure & Reliable', description: 'Enterprise-grade security measures to protect your data and ensure 99.9% uptime.' },
    { icon: 'fas fa-clock', label: 'On-Time Delivery', description: 'We respect deadlines and deliver projects on schedule without compromising quality.' },
  ]),
  stats: z.array(z.object({
    icon: z.string().default('fas fa-project-diagram'),
    number: z.string().default('250+'),
    label: z.string().default('Projects Completed'),
  })).optional().default([
    { icon: 'fas fa-project-diagram', number: '250+', label: 'Projects Completed' },
    { icon: 'fas fa-trophy', number: '15+', label: 'Awards Won' },
    { icon: 'fas fa-globe', number: '30+', label: 'Countries Served' },
    { icon: 'fas fa-heart', number: '98%', label: 'Happy Clients' },
  ]),
});

const TeamSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-users'),
  badgeText: z.string().optional().default('Our Team'),
  title: z.string().min(1).default('Meet the Experts'),
  titleHighlight: z.string().optional().default('Experts'),
  description: z.string().optional().default('Our talented team of professionals is dedicated to delivering exceptional results for every project.'),
  members: z.array(z.object({
    name: z.string().default('Alex Johnson'),
    role: z.string().default('CEO & Founder'),
    avatarIcon: z.string().optional().default('fas fa-user'),
    social: z.array(z.object({
      icon: z.string().default('fab fa-linkedin-in'),
      url: z.string().optional().default('#'),
    })).optional().default([
      { icon: 'fab fa-linkedin-in', url: '#' },
      { icon: 'fab fa-twitter', url: '#' },
      { icon: 'fab fa-dribbble', url: '#' },
    ]),
  })).optional().default([
    { name: 'Alex Johnson', role: 'CEO & Founder', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in' }, { icon: 'fab fa-twitter' }, { icon: 'fab fa-dribbble' }] },
    { name: 'Sarah Williams', role: 'Creative Director', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in' }, { icon: 'fab fa-twitter' }, { icon: 'fab fa-dribbble' }] },
    { name: 'Michael Chen', role: 'Lead Developer', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in' }, { icon: 'fab fa-twitter' }, { icon: 'fab fa-dribbble' }] },
    { name: 'Emily Brown', role: 'Marketing Manager', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in' }, { icon: 'fab fa-twitter' }, { icon: 'fab fa-dribbble' }] },
  ]),
});

const PortfolioSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-briefcase'),
  badgeText: z.string().optional().default('Portfolio'),
  title: z.string().min(1).default('Our Recent Projects'),
  titleHighlight: z.string().optional().default('Projects'),
  description: z.string().optional().default('Explore our latest work showcasing innovative solutions across various industries.'),
  filters: z.array(z.object({
    label: z.string().default('All'),
  })).optional().default([
    { label: 'All' },
    { label: 'Web Design' },
    { label: 'Mobile App' },
    { label: 'Branding' },
    { label: 'Marketing' },
  ]),
  projects: z.array(z.object({
    icon: z.string().default('fas fa-shopping-cart'),
    category: z.string().default('Web Development'),
    title: z.string().default('E-Commerce Platform'),
    linkText: z.string().optional().default('View Project'),
    linkIcon: z.string().optional().default('fas fa-arrow-right'),
    linkUrl: z.string().optional().default('#'),
  })).optional().default([
    { icon: 'fas fa-shopping-cart', category: 'Web Development', title: 'E-Commerce Platform', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-heartbeat', category: 'Mobile App', title: 'Healthcare App', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-university', category: 'UI/UX Design', title: 'Banking Dashboard', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-plane', category: 'Web Application', title: 'Travel Booking', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-utensils', category: 'Branding', title: 'Restaurant Branding', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-graduation-cap', category: 'Education', title: 'E-Learning Platform', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
  ]),
});

const BlogSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-pen-nib'),
  badgeText: z.string().optional().default('Blog'),
  title: z.string().min(1).default('Latest Insights'),
  titleHighlight: z.string().optional().default('Insights'),
  description: z.string().optional().default('Stay updated with the latest trends and insights in digital technology.'),
  posts: z.array(z.object({
    icon: z.string().default('fas fa-robot'),
    tag: z.string().default('AI Technology'),
    title: z.string().default('The Future of AI in Digital Transformation'),
    author: z.string().optional().default('Admin'),
    readTime: z.string().optional().default('5 Min Read'),
    date: z.string().optional().default('Jan 15, 2025'),
  })).optional().default([
    { icon: 'fas fa-robot', tag: 'AI Technology', title: 'The Future of AI in Digital Transformation', author: 'Admin', readTime: '5 Min Read', date: 'Jan 15, 2025' },
    { icon: 'fas fa-chart-bar', tag: 'Marketing', title: '10 Digital Marketing Strategies for 2025', author: 'Admin', readTime: '7 Min Read', date: 'Jan 10, 2025' },
    { icon: 'fas fa-laptop-code', tag: 'Development', title: 'Modern Web Development Best Practices', author: 'Admin', readTime: '6 Min Read', date: 'Jan 05, 2025' },
  ]),
});

const PricingSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-tag'),
  badgeText: z.string().optional().default('Pricing'),
  title: z.string().min(1).default('Flexible Pricing Plans'),
  titleHighlight: z.string().optional().default('Pricing'),
  description: z.string().optional().default('Choose the plan that best fits your business needs and budget.'),
  plans: z.array(z.object({
    name: z.string().default('Starter'),
    description: z.string().default('Perfect for small businesses'),
    price: z.string().default('$499'),
    period: z.string().optional().default('/project'),
    featured: z.boolean().optional().default(false),
    featuredBadge: z.string().optional().default('Most Popular'),
    features: z.array(z.object({
      icon: z.string().optional().default('fas fa-check'),
      text: z.string().default('Responsive Design'),
    })).optional().default([
      { icon: 'fas fa-check', text: 'Responsive Design' },
      { icon: 'fas fa-check', text: '5 Pages Website' },
      { icon: 'fas fa-check', text: 'Basic SEO' },
      { icon: 'fas fa-check', text: 'Contact Form' },
      { icon: 'fas fa-check', text: '1 Month Support' },
    ]),
    buttonText: z.string().optional().default('Get Started'),
    buttonStyle: z.enum(['primary', 'outline']).optional().default('outline'),
    buttonUrl: z.string().optional().default('#contact'),
  })).optional().default([
    { name: 'Starter', description: 'Perfect for small businesses', price: '$499', period: '/project', featured: false, features: [{ text: 'Responsive Design' }, { text: '5 Pages Website' }, { text: 'Basic SEO' }, { text: 'Contact Form' }, { text: '1 Month Support' }], buttonText: 'Get Started', buttonStyle: 'outline' },
    { name: 'Professional', description: 'Best for growing businesses', price: '$999', period: '/project', featured: true, featuredBadge: 'Most Popular', features: [{ text: 'Everything in Starter' }, { text: '15 Pages Website' }, { text: 'Advanced SEO' }, { text: 'CMS Integration' }, { text: '3 Months Support' }], buttonText: 'Get Started', buttonStyle: 'primary' },
    { name: 'Enterprise', description: 'For large-scale projects', price: '$2499', period: '/project', featured: false, features: [{ text: 'Everything in Professional' }, { text: 'Unlimited Pages' }, { text: 'Custom Features' }, { text: 'E-Commerce Ready' }, { text: '12 Months Support' }], buttonText: 'Get Started', buttonStyle: 'outline' },
  ]),
});

const CTASchema = z.object({
  title: z.string().min(1).default('Ready to Start Your Next Project?'),
  description: z.string().optional().default("Let's collaborate and create something amazing together. Get in touch with us today and let's bring your vision to life."),
  buttonText: z.string().optional().default('Start a Project'),
  buttonIcon: z.string().optional().default('fas fa-arrow-right'),
  buttonUrl: z.string().optional().default('#contact'),
});

const ContactSchema = z.object({
  title: z.string().min(1).default('Get In Touch'),
  titleHighlight: z.string().optional().default('Touch'),
  description: z.string().optional().default('Have a project in mind? We would love to hear from you. Send us a message and we will respond as soon as possible.'),
  contactItems: z.array(z.object({
    icon: z.string().default('fas fa-map-marker-alt'),
    label: z.string().default('Visit Us'),
    value: z.string().default('123 Digital Street, Tech City, TC 12345'),
  })).optional().default([
    { icon: 'fas fa-map-marker-alt', label: 'Visit Us', value: '123 Digital Street, Tech City, TC 12345' },
    { icon: 'fas fa-envelope', label: 'Email Us', value: 'hello@digitalagency.com' },
    { icon: 'fas fa-phone', label: 'Call Us', value: '+1 (555) 123-4567' },
  ]),
  socials: z.array(z.object({
    icon: z.string().default('fab fa-facebook-f'),
    url: z.string().optional().default('#'),
  })).optional().default([
    { icon: 'fab fa-facebook-f', url: '#' },
    { icon: 'fab fa-twitter', url: '#' },
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-linkedin-in', url: '#' },
  ]),
  formFields: z.array(z.object({
    type: z.enum(['text', 'email', 'textarea', 'select']).default('text'),
    name: z.string().default('name'),
    label: z.string().default('Your Name'),
    placeholder: z.string().optional().default('John'),
    required: z.boolean().optional().default(true),
    options: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),
  })).optional().default([
    { type: 'text', name: 'name', label: 'Your Name', placeholder: 'John', required: true },
    { type: 'email', name: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
    { type: 'text', name: 'subject', label: 'Subject', placeholder: 'Project Inquiry', required: true },
    { type: 'textarea', name: 'message', label: 'Message', placeholder: 'Tell us about your project...', required: true },
  ]),
  submitButtonText: z.string().optional().default('Send Message'),
  submitButtonIcon: z.string().optional().default('fas fa-paper-plane'),
});

const MenuSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-utensils'),
  badgeText: z.string().optional().default('Our Menu'),
  title: z.string().min(1).default('Crafted Flavors, Thoughtfully Served'),
  titleHighlight: z.string().optional().default('Flavors'),
  description: z.string().optional().default('Explore our carefully curated menu featuring the finest ingredients and seasonal creations.'),
  categories: z.array(z.object({
    name: z.string().default('Appetizers'),
    items: z.array(z.object({
      name: z.string().default('Truffle Mushroom Soup'),
      description: z.string().optional().default('Creamy wild mushroom soup infused with white truffle oil.'),
      price: z.string().default('$12'),
      image: z.string().optional().default(''),
      dietaryTags: z.array(z.string()).optional().default([]),
      isRecommended: z.boolean().optional().default(false),
    })).optional().default([
      { name: 'Truffle Mushroom Soup', description: 'Creamy wild mushroom soup infused with white truffle oil.', price: '$12', isRecommended: true },
      { name: 'Crispy Calamari', description: 'Lightly fried with marinara sauce.', price: '$14' },
      { name: 'Burrata & Heirloom Tomatoes', description: 'Fresh burrata with seasonal tomatoes.', price: '$16' },
    ]),
  })).optional().default([
    { name: 'Appetizers', items: [
      { name: 'Truffle Mushroom Soup', description: 'Creamy wild mushroom soup infused with white truffle oil.', price: '$12', isRecommended: true },
      { name: 'Crispy Calamari', description: 'Lightly fried with marinara sauce.', price: '$14' },
      { name: 'Burrata & Heirloom Tomatoes', description: 'Fresh burrata with seasonal tomatoes.', price: '$16' },
    ]},
    { name: 'Main Courses', items: [
      { name: 'Herb-Crusted Ribeye Steak', description: 'Prime cut with garlic herb butter.', price: '$38' },
      { name: 'Lemon Butter Grilled Salmon', description: 'Fresh Atlantic salmon fillet.', price: '$29' },
      { name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms.', price: '$24' },
    ]},
    { name: 'Desserts & Beverages', items: [
      { name: 'Classic Tiramisu', description: 'Traditional Italian dessert.', price: '$11' },
      { name: 'Molten Chocolate Lava Cake', description: 'Warm chocolate center with vanilla ice cream.', price: '$13' },
      { name: 'Specialty Artisan Coffee', description: 'Single-origin pour over.', price: '$6' },
    ]},
  ]),
  buttonText: z.string().optional().default('View Full Menu'),
  buttonIcon: z.string().optional().default('fas fa-arrow-right'),
  buttonUrl: z.string().optional().default('#menu'),
});

const MenuHighlightsSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-star'),
  badgeText: z.string().optional().default('Menu Highlights'),
  title: z.string().min(1).default('Discover Our Signature Creations'),
  titleHighlight: z.string().optional().default('Signature'),
  description: z.string().optional().default('Our chef\'s most celebrated dishes, crafted with passion and the finest seasonal ingredients.'),
  items: z.array(z.object({
    name: z.string().default('Truffle Mushroom Risotto'),
    description: z.string().optional().default('Creamy arborio rice with wild mushrooms, truffle oil, and parmesan.'),
    price: z.string().default('$24'),
    image: z.string().optional().default(''),
  })).optional().default([
    { name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms, truffle oil, and parmesan.', price: '$24' },
    { name: 'Herb-Crusted Rack of Lamb', description: 'Tender lamb with herb crust, served with roasted vegetables.', price: '$34' },
    { name: 'Pan-Seared Atlantic Salmon', description: 'Fresh salmon fillet with lemon butter sauce and seasonal greens.', price: '$29' },
    { name: 'Classic Eggs Benedict', description: 'Poached eggs on English muffin with hollandaise and bacon.', price: '$16' },
    { name: 'Artisan Margherita Pizza', description: 'Hand-tossed dough with San Marzano tomatoes and fresh mozzarella.', price: '$18' },
    { name: 'Grilled Ribeye Steak', description: 'Prime cut grilled to perfection with garlic herb butter.', price: '$38' },
  ]),
  buttonText: z.string().optional().default('View Full Menu'),
  buttonIcon: z.string().optional().default('fas fa-arrow-right'),
  buttonUrl: z.string().optional().default('#menu'),
});

const ReservationSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-calendar-check'),
  badgeText: z.string().optional().default('Reservations'),
  title: z.string().min(1).default('Book Your Table in Seconds'),
  titleHighlight: z.string().optional().default('Table'),
  description: z.string().optional().default('Reserve your dining experience with us. Instant confirmation, no booking fees.'),
  benefits: z.array(z.object({
    icon: z.string().default('fas fa-check-circle'),
    text: z.string().default('Instant Confirmation'),
  })).optional().default([
    { icon: 'fas fa-check-circle', text: 'Instant Confirmation' },
    { icon: 'fas fa-check-circle', text: 'No Booking Fees' },
    { icon: 'fas fa-check-circle', text: 'Free Cancellation Within 24 Hours' },
  ]),
  submitButtonText: z.string().optional().default('Confirm Reservation'),
  submitButtonIcon: z.string().optional().default('fas fa-check'),
});

const GallerySchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-camera'),
  badgeText: z.string().optional().default('Gallery'),
  title: z.string().min(1).default('Moments Worth Capturing'),
  titleHighlight: z.string().optional().default('Moments'),
  description: z.string().optional().default('A glimpse into our kitchen, dining room, and the experiences we create every day.'),
  images: z.array(z.object({
    url: z.string().default(''),
    caption: z.string().optional().default(''),
    alt: z.string().optional().default(''),
  })).optional().default([
    { url: '', caption: 'Plated Dish Artistry', alt: 'Chef plating a dish' },
    { url: '', caption: 'Dining Room & Patio', alt: 'Elegant dining area' },
    { url: '', caption: 'Kitchen Action Shots', alt: 'Chef in the kitchen' },
    { url: '', caption: 'Guest Celebration', alt: 'Guests enjoying their meal' },
  ]),
});

const TestimonialsSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-quote-left'),
  badgeText: z.string().optional().default('Testimonials'),
  title: z.string().min(1).default('"Absolutely wonderful dining experience"'),
  titleHighlight: z.string().optional().default('wonderful'),
  description: z.string().optional().default('Don\'t just take our word for it — hear from our guests.'),
  testimonials: z.array(z.object({
    name: z.string().default('Eleanor Pena'),
    role: z.string().default('Verified Diner'),
    avatar: z.string().optional().default(''),
    rating: z.number().min(1).max(5).default(5),
    text: z.string().default('Everything was perfect. Our server remembered our special night.'),
  })).optional().default([
    { name: 'Eleanor Pena', role: 'Verified Diner', rating: 5, text: 'My husband and I recently celebrated our tenth anniversary here. Everything was perfect. Our server remembered our special night.' },
    { name: 'Darrell Steward', role: 'Regular Guest', rating: 5, text: 'I go every Sunday for brunch and am never disappointed. The eggs benedict are the best.' },
    { name: 'Guy Hawkins', role: 'Corporate Client', rating: 5, text: 'Our company\'s quarterly celebration was flawless. The event coordinator made a customized menu.' },
  ]),
  socials: z.array(z.object({
    icon: z.string().default('fab fa-instagram'),
    url: z.string().optional().default('#'),
  })).optional().default([
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-linkedin-in', url: '#' },
    { icon: 'fab fa-facebook-f', url: '#' },
    { icon: 'fab fa-youtube', url: '#' },
  ]),
});

const SpecialsSchema = z.object({
  badgeIcon: z.string().optional().default('fas fa-tags'),
  badgeText: z.string().optional().default('Special Offers'),
  title: z.string().min(1).default('Exclusive Offers Just for You'),
  titleHighlight: z.string().optional().default('Exclusive'),
  description: z.string().optional().default('Take advantage of our limited-time promotions and special deals.'),
  offers: z.array(z.object({
    title: z.string().default('Early Bird Dinner'),
    description: z.string().default('Enjoy a special discount when you dine with us before 6 PM on weekdays.'),
    discountPercent: z.number().default(20),
    counterTarget: z.number().default(20),
    label: z.string().optional().default('off'),
  })).optional().default([
    { title: 'Early Bird Dinner', description: 'Enjoy a special discount when you dine with us before 6 PM on weekdays.', discountPercent: 20, counterTarget: 20, label: 'off' },
    { title: 'Happy Hour Special', description: 'Half-price select appetizers and cocktails every weekday from 4 to 6 PM.', discountPercent: 50, counterTarget: 50, label: 'off' },
    { title: 'Loyalty Members Save', description: 'Sign up for our loyalty program and receive exclusive member-only discounts.', discountPercent: 15, counterTarget: 15, label: 'save' },
  ]),
});

export const sectionSchemas: Record<SectionCategoryType, z.ZodObject<any>> = {
  hero: HeroSchema,
  services: ServicesSchema,
  about: AboutSchema,
  whyUs: WhyUsSchema,
  team: TeamSchema,
  portfolio: PortfolioSchema,
  blog: BlogSchema,
  pricing: PricingSchema,
  cta: CTASchema,
  contact: ContactSchema,
  menu: MenuSchema,
  menuHighlights: MenuHighlightsSchema,
  reservation: ReservationSchema,
  gallery: GallerySchema,
  testimonials: TestimonialsSchema,
  specials: SpecialsSchema,
};

export const sectionRegistry: SectionRegistryEntry[] = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'Full-screen hero section with stats and floating cards',
    icon: 'fas fa-rocket',
    category: 'layout',
    schema: HeroSchema,
    defaultProps: HeroSchema.parse({}),
  },
  {
    key: 'services',
    label: 'Services',
    description: 'Grid of service cards with icons and links',
    icon: 'fas fa-cogs',
    category: 'content',
    schema: ServicesSchema,
    defaultProps: ServicesSchema.parse({}),
  },
  {
    key: 'about',
    label: 'About',
    description: 'About section with experience badge and feature list',
    icon: 'fas fa-info-circle',
    category: 'content',
    schema: AboutSchema,
    defaultProps: AboutSchema.parse({}),
  },
  {
    key: 'whyUs',
    label: 'Why Choose Us',
    description: 'Why choose us list with stats cards',
    icon: 'fas fa-star',
    category: 'marketing',
    schema: WhyUsSchema,
    defaultProps: WhyUsSchema.parse({}),
  },
  {
    key: 'team',
    label: 'Team',
    description: 'Team member grid with social links on hover',
    icon: 'fas fa-users',
    category: 'content',
    schema: TeamSchema,
    defaultProps: TeamSchema.parse({}),
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    description: 'Filterable project gallery with overlay',
    icon: 'fas fa-briefcase',
    category: 'marketing',
    schema: PortfolioSchema,
    defaultProps: PortfolioSchema.parse({}),
  },
  {
    key: 'blog',
    label: 'Blog',
    description: 'Blog post grid with tags and metadata',
    icon: 'fas fa-pen-nib',
    category: 'content',
    schema: BlogSchema,
    defaultProps: BlogSchema.parse({}),
  },
  {
    key: 'pricing',
    label: 'Pricing',
    description: 'Three-tier pricing cards with feature lists',
    icon: 'fas fa-tag',
    category: 'conversion',
    schema: PricingSchema,
    defaultProps: PricingSchema.parse({}),
  },
  {
    key: 'cta',
    label: 'Call to Action',
    description: 'Simple CTA section with gradient background',
    icon: 'fas fa-bullhorn',
    category: 'conversion',
    schema: CTASchema,
    defaultProps: CTASchema.parse({}),
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'Contact info + form with validation',
    icon: 'fas fa-envelope',
    category: 'conversion',
    schema: ContactSchema,
    defaultProps: ContactSchema.parse({}),
  },
  {
    key: 'menu',
    label: 'Menu',
    description: 'Categorized food menu with items, prices, and dietary tags',
    icon: 'fas fa-utensils',
    category: 'content',
    schema: MenuSchema,
    defaultProps: MenuSchema.parse({}),
  },
  {
    key: 'menuHighlights',
    label: 'Menu Highlights',
    description: 'Featured signature dishes with images and prices',
    icon: 'fas fa-star',
    category: 'content',
    schema: MenuHighlightsSchema,
    defaultProps: MenuHighlightsSchema.parse({}),
  },
  {
    key: 'reservation',
    label: 'Reservation',
    description: 'Table booking form with date, time, guests, and seating preference',
    icon: 'fas fa-calendar-check',
    category: 'conversion',
    schema: ReservationSchema,
    defaultProps: ReservationSchema.parse({}),
  },
  {
    key: 'gallery',
    label: 'Gallery',
    description: 'Image gallery with captions and carousel navigation',
    icon: 'fas fa-camera',
    category: 'layout',
    schema: GallerySchema,
    defaultProps: GallerySchema.parse({}),
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    description: 'Customer reviews with avatars, ratings, and social links',
    icon: 'fas fa-quote-left',
    category: 'marketing',
    schema: TestimonialsSchema,
    defaultProps: TestimonialsSchema.parse({}),
  },
  {
    key: 'specials',
    label: 'Special Offers',
    description: 'Limited-time offers with discount counters',
    icon: 'fas fa-tags',
    category: 'marketing',
    schema: SpecialsSchema,
    defaultProps: SpecialsSchema.parse({}),
  },
];

export function getSectionRegistry(): SectionRegistryEntry[] {
  return sectionRegistry;
}

export function getSectionSchema(key: SectionCategoryType): z.ZodObject<any> {
  return sectionSchemas[key];
}

export function getSectionDefaultProps(key: SectionCategoryType): Record<string, any> {
  return sectionRegistry.find(s => s.key === key)?.defaultProps || {};
}

export function validateSectionProps(key: SectionCategoryType, props: unknown) {
  return sectionSchemas[key].safeParse(props);
}

export function sectionRegistryToPayloadFields(key: SectionCategoryType) {
  const schema = sectionSchemas[key];
  const shape = schema.shape as Record<string, z.ZodTypeAny>;
  const fields: any[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const field = zodToPayloadField(fieldName, fieldSchema);
    if (field) fields.push(field);
  }

  return fields;
}

function zodToPayloadField(name: string, schema: z.ZodTypeAny): any | null {
  const isOptional = schema.isOptional?.() ?? false;
  const isArray = schema instanceof z.ZodArray;

  if (isArray) {
    const elementSchema = schema.element;
    const elementShape = elementSchema instanceof z.ZodObject ? elementSchema.shape as Record<string, z.ZodTypeAny> : null;

    if (elementShape) {
      const subFields: any[] = [];
      for (const [subName, subSchema] of Object.entries(elementShape)) {
        const subField = zodToPayloadField(subName, subSchema);
        if (subField) subFields.push(subField);
      }

      return {
        name,
        type: 'array',
        label: formatLabel(name),
        fields: subFields,
        minRows: 0,
        maxRows: 20,
      };
    }
    return null;
  }

  if (schema instanceof z.ZodString) {
    return {
      name,
      type: 'text',
      label: formatLabel(name),
      required: !isOptional,
    };
  }

  if (schema instanceof z.ZodBoolean) {
    return {
      name,
      type: 'checkbox',
      label: formatLabel(name),
      required: !isOptional,
    };
  }

  if (schema instanceof z.ZodNumber) {
    return {
      name,
      type: 'number',
      label: formatLabel(name),
      required: !isOptional,
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      name,
      type: 'select',
      label: formatLabel(name),
      required: !isOptional,
      options: schema._def.values.map((v: any) => ({ label: v, value: v })),
    };
  }

  if (schema instanceof z.ZodDefault) {
    return zodToPayloadField(name, schema._def.innerType);
  }

  return null;
}

function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

export type SectionPropsMap = {
  hero: z.infer<typeof HeroSchema>;
  services: z.infer<typeof ServicesSchema>;
  about: z.infer<typeof AboutSchema>;
  whyUs: z.infer<typeof WhyUsSchema>;
  team: z.infer<typeof TeamSchema>;
  portfolio: z.infer<typeof PortfolioSchema>;
  blog: z.infer<typeof BlogSchema>;
  pricing: z.infer<typeof PricingSchema>;
  cta: z.infer<typeof CTASchema>;
  contact: z.infer<typeof ContactSchema>;
  menu: z.infer<typeof MenuSchema>;
  menuHighlights: z.infer<typeof MenuHighlightsSchema>;
  reservation: z.infer<typeof ReservationSchema>;
  gallery: z.infer<typeof GallerySchema>;
  testimonials: z.infer<typeof TestimonialsSchema>;
  specials: z.infer<typeof SpecialsSchema>;
};

export type BlockType = SectionCategoryType;

export interface Block {
  blockType: BlockType;
  blockName?: string;
  [key: string]: any;
}