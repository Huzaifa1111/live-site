'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Send, User, Mail, MessageSquare, ChevronDown } from 'lucide-react';

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-plus-jakarta-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-600 ml-0.5">
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
              <User size={14} />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all duration-500 text-[13px] text-black font-bold placeholder:text-gray-300 placeholder:font-medium outline-none"
              placeholder="E.g. Alexander Sterling"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-600 ml-0.5">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
              <Mail size={14} />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all duration-500 text-[13px] text-black font-bold placeholder:text-gray-300 placeholder:font-medium outline-none"
              placeholder="liaison@domain.com"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-600 ml-0.5">
          Subject
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
            <Send size={14} />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
            <ChevronDown size={14} />
          </div>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full pl-10 pr-8 py-3 bg-gray-50/50 border border-gray-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all duration-500 text-[13px] text-black font-bold appearance-none cursor-pointer outline-none"
          >
            <option value="">Select Subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Billing Question">Billing Question</option>
            <option value="Product Feedback">Product Feedback</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-600 ml-0.5">
          Message
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-5 text-gray-300 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
            <MessageSquare size={14} />
          </div>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            minLength={10}
            className="w-full pl-10 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all duration-500 text-[13px] text-black font-bold placeholder:text-gray-300 placeholder:font-medium resize-none outline-none"
            placeholder="How can we help you?"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-black hover:bg-emerald-600 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.4em] transition-all duration-700 shadow-2xl shadow-emerald-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
      >
        <div className="relative z-10 flex items-center justify-center">
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full"></div>
              <span>Sending...</span>
            </div>
          ) : (
            <>
              <span>Send Message</span>
              <Send className="w-3.5 h-3.5 ml-2.5 transition-transform duration-700 group-hover:translate-x-2 group-hover:-translate-y-1" />
            </>
          )}
        </div>
        <div className="absolute inset-0 bg-emerald-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]"></div>
      </Button>
    </form>
  );
}
