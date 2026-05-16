import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSmartphone, FiTarget, FiCode, FiStar } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const carouselRef = useRef(null);

  // Auto-scroll carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const scrollInterval = setInterval(() => {
      if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth) {
        carousel.scrollLeft = 0;
      } else {
        carousel.scrollLeft += 400;
      }
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(scrollInterval);
  }, []);

  const scroll = (direction, ref) => {
    // Scroll function removed - using auto-scroll instead
  };

  const services = [
    {
      icon: <FiSmartphone className="text-5xl" />,
      title: 'Career Guidance',
      description: 'Receive AI-powered personalized career recommendations tailored to your unique skills and interests.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: <FiTarget className="text-5xl" />,
      title: 'Skill Development',
      description: 'Follow structured learning paths designed to help you master in-demand skills for your career advancement.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: <FiCode className="text-5xl" />,
      title: 'Interview Preparation',
      description: 'Practice with real interview questions and receive expert guidance from industry professionals.',
      color: 'from-purple-500 to-pink-600'
    },
  ];

  const images = [
    '/Images/career-growth.jpg',
    '/Images/professional-team.jpg',
    '/Images/success-story-1.jpg',
    '/Images/success-story-2.jpg',
    '/Images/Techtonic one.jpg',
    '/Images/Techtonic2.jpg',
  ];

  const process = [
    {
      number: '01',
      title: 'Assessment',
      description: 'We thoroughly analyze your skills, interests, and career goals to create a comprehensive understanding of your unique profile.'
    },
    {
      number: '02',
      title: 'Planning',
      description: 'We develop a personalized roadmap with specific milestones, timelines, and measurable learning objectives.'
    },
    {
      number: '03',
      title: 'Execution',
      description: 'Follow your customized career path with continuous support, mentorship, and real-time progress tracking.'
    },
  ];

  const testimonials = [
    {
      text: 'CareerPath AI helped me transition from frontend to full-stack development. The personalized roadmap was exactly what I needed!',
      author: 'Sarah Johnson',
      role: 'Software Engineer',
      image: '/Images/career-growth.jpg'
    },
    {
      text: 'The skill gap analysis was incredibly accurate. I knew exactly what to focus on to land my dream job.',
      author: 'Mike Chen',
      role: 'Data Scientist',
      image: '/Images/professional-team.jpg'
    },
    {
      text: 'Best career guidance tool I\'ve used. The interview prep questions are spot-on!',
      author: 'Emma Davis',
      role: 'Product Manager',
      image: '/Images/success-story-1.jpg'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600 to-cyan-600 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  Transform Your
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Career Path</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Get AI-powered personalized career guidance and accelerate your professional growth with our intelligent platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                >
                  <span>Get Started Free</span>
                  <FiArrowRight size={20} />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center space-x-2 border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-900 hover:bg-opacity-30 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"
                >
                  <span>Learn More</span>
                </Link>
              </div>
            </div>

            {/* Right Video - Hero video */}
            <div className="relative h-96">
              {/* Background gradient */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl blur-2xl opacity-30"></div>
              </div>

              {/* Video player */}
              <video
                src="/Images/vidssave.com  720P.mp4"
                controls
                autoPlay
                muted
                loop
                playsInline
                className="rounded-3xl shadow-2xl w-full h-full object-cover"
                style={{ display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Empowering your career growth with intelligent solutions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20"
              >
                <div className={`bg-gradient-to-br ${service.color} p-6 rounded-xl w-fit mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">Our Business Process</h2>
            <p className="text-xl text-gray-600">How we help you succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < process.length - 1 && (
                  <div className="hidden md:block absolute top-24 left-1/2 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                )}

                <div className="relative bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20">
                  <div className="text-6xl font-bold text-cyan-500 mb-4 opacity-20">{step.number}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-5xl font-bold text-white mb-3">OUR Gallery Stories</h2>
            <p className="text-xl text-cyan-300">See the transformations our students have achieved</p>
          </div>

          {/* Carousel */}
          <div className="relative group">
            <div
              ref={carouselRef}
              className="flex gap-8 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth', scrollPaddingLeft: '1rem' }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 snap-center rounded-3xl overflow-hidden border-2 border-cyan-600 hover:border-cyan-400 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/50 group/card"
                >
                  {/* Image Only */}
                  <div className="relative h-80 overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-600">
                    <img
                      src={image}
                      alt="Success story"
                      className="w-full h-full object-cover group-hover/card:scale-125 transition-transform duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls - REMOVED */}
            {/* Auto-scroll is now enabled */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">Our Testimonials</h2>
            <p className="text-xl text-gray-600">What our happy customers say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 border-2 border-gray-200 hover:border-cyan-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.author}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 text-cyan-100">
            Join thousands of students who are already building their dream careers with CareerPath AI
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center space-x-2 bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            <span>Start Your Free Journey</span>
            <FiArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
