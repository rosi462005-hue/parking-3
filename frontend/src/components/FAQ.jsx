import React, { useState } from 'react';
import './FAQ.css';

const FAQ_DATA = [
  {
    question: 'How do I know my car is safe?',
    answer: 'All our property owners are verified, and many spaces are in secure residential driveways or private commercial lots. We also provide host ratings to ensure quality.'
  },
  {
    question: 'What if I need to cancel my booking?',
    answer: 'You can cancel up to 1 hour before your booking starts for a full refund. Cancellations after that time are subject to a small cancellation fee.'
  },
  {
    question: 'Are there any hidden fees?',
    answer: 'No. The price you see on the map is the total price you pay. We charge a small service fee to space owners, but renters pay what they see.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq section">
      <div className="container faq-container">
        <div className="faq-header text-center">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="subtitle">Everything you need to know about ParkShare.</p>
        </div>

        <div className="faq-list">
          {FAQ_DATA.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
            >
              <button 
                className="faq-question" 
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
