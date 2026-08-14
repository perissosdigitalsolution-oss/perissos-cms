'use client'

import React from 'react'

export interface ContactProps {
  title: string
  titleHighlight?: string
  description?: string
  contactItems?: Array<{ icon: string; label: string; value: string }>
  socials?: Array<{ icon: string; url?: string }>
  formFields?: Array<{
    type: 'text' | 'email' | 'textarea' | 'select'
    name: string
    label: string
    placeholder?: string
    required?: boolean
    options?: Array<{ value: string; label: string }>
  }>
  submitButtonText?: string
  submitButtonIcon?: string
}

export function ContactSection({
  title = 'Get In Touch',
  titleHighlight = 'Touch',
  description = 'Have a project in mind? We would love to hear from you. Send us a message and we will respond as soon as possible.',
  contactItems = [
    { icon: 'fas fa-map-marker-alt', label: 'Visit Us', value: '123 Digital Street, Tech City, TC 12345' },
    { icon: 'fas fa-envelope', label: 'Email Us', value: 'hello@digitalagency.com' },
    { icon: 'fas fa-phone', label: 'Call Us', value: '+1 (555) 123-4567' },
  ],
  socials = [
    { icon: 'fab fa-facebook-f', url: '#' },
    { icon: 'fab fa-twitter', url: '#' },
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-linkedin-in', url: '#' },
  ],
  formFields = [
    { type: 'text', name: 'name', label: 'Your Name', placeholder: 'John', required: true },
    { type: 'email', name: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
    { type: 'text', name: 'subject', label: 'Subject', placeholder: 'Project Inquiry', required: true },
    { type: 'textarea', name: 'message', label: 'Message', placeholder: 'Tell us about your project...', required: true },
  ],
  submitButtonText = 'Send Message',
  submitButtonIcon = 'fas fa-paper-plane',
}: ContactProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#181817] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 md:gap-24">
          <div className="pt-5 md:pt-0">
            <h2 className="mb-6 text-left leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>
              {title.split(titleHighlight).map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < title.split(titleHighlight).length - 1 && <span style={{ color: '#FF6600' }}>{titleHighlight}</span>}
                </React.Fragment>
              ))}
            </h2>
            {description && <p className="text-lg text-[#7A7A74] mb-12" style={{ fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>{description}</p>}
            {contactItems && contactItems.length > 0 && (
              <div className="mb-12 space-y-6">
                {contactItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FF6600]/10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#FF6600] text-[18px]">
                      <i className={item.icon} />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', fontWeight: 600 }}>{item.label}</h4>
                      <p className="text-[#7A7A74]" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {socials && socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map((s, i) => (
                  <a key={i} href={s.url || '#'} className="w-11 h-11 bg-[#1E1E1D] border border-[#3A3A38] rounded-xl flex items-center justify-center text-white text-[16px] transition-all duration-300 hover:bg-[#FF6600] hover:border-[#FF6600]" style={{ borderRadius: '10px' }}>
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="bg-[#1E1E1D] border border-[#3A3A38] rounded-2xl p-8 md:p-10" style={{ borderRadius: '20px' }}>
            <form className="space-y-5">
              {formFields?.map((field, i) => (
                <div key={i}>
                  <label htmlFor={field.name} className="block mb-2 text-sm font-medium" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 500 }}>
                    {field.label}
                    {field.required && <span className="text-[#FF6600] ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4.5 py-3.5 bg-[#181817] border border-[#3A3A38] rounded-xl text-white placeholder-[#7A7A74] focus:outline-none focus:border-[#FF6600] transition-all duration-300 resize-y min-h-[120px]"
                      style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', borderRadius: '12px' }}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      className="w-full px-4.5 py-3.5 bg-[#181817] border border-[#3A3A38] rounded-xl text-white focus:outline-none focus:border-[#FF6600] transition-all duration-300 appearance-none"
                      style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', borderRadius: '12px' }}
                    >
                      {field.options?.map((opt, j) => (
                        <option key={j} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4.5 py-3.5 bg-[#181817] border border-[#3A3A38] rounded-xl text-white placeholder-[#7A7A74] focus:outline-none focus:border-[#FF6600] transition-all duration-300"
                      style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', borderRadius: '12px' }}
                    />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#FF6600] rounded-full hover:bg-[#E55B00] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6600]/25" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, borderRadius: '50px' }}>
                {submitButtonText || 'Send Message'}
                {submitButtonIcon && <i className={submitButtonIcon} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}