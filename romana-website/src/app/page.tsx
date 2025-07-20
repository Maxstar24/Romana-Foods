'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Heart, Users, Globe, ArrowRight, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-organic">
      {/* Navigation */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Values Section */}
      <ValuesSection />
      
      {/* Products Section */}
      <ProductsSection />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Contact Section */}
      <ContactSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-green-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-gradient-green">Romana</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#about" className="text-gray-700 hover:text-primary transition-colors">About</a>
              <a href="#values" className="text-gray-700 hover:text-primary transition-colors">Values</a>
              <a href="#products" className="text-gray-700 hover:text-primary transition-colors">Products</a>
              <a href="#team" className="text-gray-700 hover:text-primary transition-colors">Team</a>
              <a href="#contact" className="text-gray-700 hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <span className="sr-only">Open menu</span>
              ☰
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="relative pt-24 pb-16 bg-gradient-to-br from-green-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-gradient-green">Empowering</span><br />
              <span className="text-gray-900">Communities</span><br />
              <span className="text-primary">Through Nature</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Empowering communities through innovative food production and sustainable farming practices 
              to make healthy eating accessible and affordable for all.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                Discover Our Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8 py-3">
                Our Story
              </Button>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-gray-600">Organic</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent z-10"></div>
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <div className="text-center">
                  <Leaf className="h-24 w-24 text-primary mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Fresh, Organic, Natural</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section id="about" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Romana: A Journey to <span className="text-gradient-green">Health and Happiness</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-600 leading-relaxed">
              Once upon a time, in the heart of East Africa, Romana was born from a simple yet powerful idea: 
              <strong className="text-primary"> healthy eating should be accessible to everyone</strong>. 
              Inspired by the richness of nature and the need for wholesome nutrition, we set out to create 
              a brand that champions health, affordability, and sustainability.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              At Romana, we believe that every sip of juice and every bite of food should not only nourish 
              the body but also bring joy to the soul. From our humble beginnings, we've worked tirelessly 
              to craft products that are as pure as they are delicious, free from artificial additives and 
              full of natural goodness.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Our journey is guided by a commitment to <strong className="text-primary">empowering communities</strong>. 
              By sourcing local ingredients and embracing environmentally responsible practices, we're building 
              a healthier future for both our customers and the planet.
            </p>
            
            <div className="pt-6">
              <p className="text-xl font-semibold text-primary mb-4">
                Today, Romana is more than just a brand—it's a lifestyle.
              </p>
              <p className="text-lg text-gray-600">
                It's for the dreamers, the doers, and the changemakers who believe that health and happiness go hand in hand. 
                Welcome to Romana, where every product is a promise: of care, of quality, and of a better tomorrow.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="h-20 w-20 text-primary mx-auto mb-4" />
                  <p className="text-gray-700 text-lg font-medium">From Heart to Health</p>
                  <p className="text-gray-600">Tanzania's Natural Bounty</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const values = [
    {
      icon: Heart,
      title: "Health First",
      description: "We prioritize your wellbeing by providing products free from artificial additives, full of natural nutrients that nourish your body and soul."
    },
    {
      icon: Users,
      title: "Community",
      description: "Empowering local farmers and communities through sustainable partnerships, creating opportunities and building stronger, healthier societies."
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Committed to environmentally responsible practices, from farm to table, ensuring a healthier planet for future generations."
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making healthy, organic food affordable and accessible to all, because everyone deserves the opportunity to live well."
    }
  ];

  return (
    <section id="values" ref={ref} className="py-20 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-gradient-green">Core Values</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that guide everything we do, from growing and sourcing to delivering the finest organic products.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="h-full bg-white hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center leading-relaxed">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const products = [
    {
      title: "Organic Juices",
      description: "Fresh, cold-pressed juices made from locally sourced organic fruits. Pure nutrition in every sip.",
      features: ["100% Organic", "No Added Sugar", "Cold-Pressed", "Locally Sourced"],
      image: "🥤"
    },
    {
      title: "Organic Foods",
      description: "Wholesome, natural food products crafted with care. From farm to table, pure and delicious.",
      features: ["Chemical-Free", "Non-GMO", "Sustainably Grown", "Nutrient-Rich"],
      image: "🥬"
    }
  ];

  return (
    <section id="products" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-gradient-green">Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our range of organic, natural products designed to nourish your body and delight your senses.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="h-full bg-gradient-to-br from-green-50 to-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="text-6xl mb-4 text-center">{product.image}</div>
                  <CardTitle className="text-2xl text-center text-gray-900">{product.title}</CardTitle>
                  <CardDescription className="text-center text-gray-600 text-lg">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const team = [
    {
      name: "Chief Operating Officer",
      role: "COO",
      description: "With a strong foundation in food science and sustainable agriculture, earned during studies in Italy, and a master's degree in agribusiness. Driving Romana's mission of delivering healthy, affordable, and sustainable food solutions.",
      expertise: ["Food Science", "Sustainable Agriculture", "Agribusiness", "Operations Management"],
      education: "Italy (Food Science & Sustainable Agriculture)"
    },
    {
      name: "Chief Financial Officer", 
      role: "CFO",
      description: "Bringing wealth of experience from working with global organizations such as BCG and Ascent. With expertise in financial strategy, investment management, and business growth, playing a pivotal role in ensuring Romana's financial health and sustainability.",
      expertise: ["Financial Strategy", "Investment Management", "Business Growth", "Strategic Planning"],
      experience: "BCG & Ascent"
    }
  ];

  return (
    <section id="team" ref={ref} className="py-20 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Meet Our <span className="text-gradient-green">Leadership Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Passionate leaders driving innovation and sustainability in organic food production.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-center text-gray-900">{member.name}</CardTitle>
                  <div className="text-center">
                    <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                      {member.role}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {member.description}
                  </CardDescription>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Areas of Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Background:</strong> {member.education || member.experience}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section id="contact" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Get in <span className="text-gradient-green">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to join our journey towards healthier, sustainable living? We'd love to hear from you.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-gray-600">Tanzania, East Africa</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">info@romana.co.tz</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+255 XXX XXX XXX</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Follow Us</h3>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                  Facebook
                </Button>
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                  Instagram
                </Button>
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                  LinkedIn
                </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
                <CardDescription>
                  Interested in our products or have questions? Drop us a line!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Send Message
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center mb-6">
              <Leaf className="h-8 w-8 text-green-400 mr-2" />
              <span className="text-2xl font-bold">Romana</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering communities through innovative food production and sustainable farming practices 
              to make healthy eating accessible and affordable for all.
            </p>
            <p className="text-gray-400 text-sm">
              © 2025 Romana Natural Products Tanzania. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#about" className="hover:text-green-400 transition-colors">About Us</a></li>
              <li><a href="#products" className="hover:text-green-400 transition-colors">Products</a></li>
              <li><a href="#values" className="hover:text-green-400 transition-colors">Our Values</a></li>
              <li><a href="#team" className="hover:text-green-400 transition-colors">Team</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Tanzania, East Africa</li>
              <li>info@romana.co.tz</li>
              <li>+255 XXX XXX XXX</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>Let's raise a glass to health, sustainability, and a shared journey toward well-being! 🌱</p>
        </div>
      </div>
    </footer>
  );
}
