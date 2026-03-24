import React from 'react';
import './Testimonials.css';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Daily Commuter',
    content: 'ParkShare has saved me at least 30 minutes every morning. I book my spot the night before and just drive straight in. No more circling blocks!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Property Owner',
    content: 'I live near the stadium and my driveway was always empty while people paid exorbitant prices down the street. Now I make an extra $400 a month doing literally nothing.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=11'
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Weekend Traveler',
    content: 'Whenever we visit the city, we use ParkShare. It is so much cheaper than hotel parking and feels much more secure since we park in private residential garages.',
    rating: 4,
    avatar: 'https://i.pravatar.cc/150?img=5'
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials section">
      <div className="container">
        <div className="text-center section-header">
          <h2 className="section-title">Trusted by 10,000+ Users</h2>
          <div className="trust-stats">
            <div className="stat-pill">
              <strong>4.9/5</strong> App Store Rating
            </div>
            <div className="stat-pill">
              <strong>15k+</strong> Successful Bookings
            </div>
            <div className="stat-pill">
              <strong>$1M+</strong> Earned by Hosts
            </div>
          </div>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="stars">
                 {'★'.repeat(testimonial.rating)}{'☆'.repeat(5-testimonial.rating)}
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
              <div className="testimonial-author">
                <img src={testimonial.avatar} alt={testimonial.name} className="avatar" />
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
