'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Heart, Users, Globe, ArrowRight, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AuthButton from '@/components/ui/AuthButton';
import { CartButton } from '@/components/cart/CartComponents';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-organic flex items-center justify-center">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Home() {
  return (
    <ClientOnly>
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
        
        {/* Product Gallery Section */}
        <ProductGallerySection />
        
        {/* Team Section */}
        <TeamSection />
        
        {/* Contact Section */}
        <ContactSection />
        
        {/* Footer */}
        <Footer />
        
        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/255767266355"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce hover:animate-none"
          aria-label="Contact us on WhatsApp"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </a>
      </div>
    </ClientOnly>
  );
}

function Header() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-green-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Image 
              src="/images/logos/Romana_Logo_page-0001-removebg-preview.png" 
              alt="Romana Logo" 
              width={240} 
              height={96} 
              className="h-16 w-auto" 
              priority
            />
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="#home" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="#about" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/store" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Store
              </Link>
              <Link href="/orders" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                My Orders
              </Link>
              <Link href="/track" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Track Order
              </Link>
              <Link href="#contact" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <CartButton />
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section id="home" ref={ref} className="pt-24 pb-16 bg-organic min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Empowering Communities Through{' '}
                <span className="text-gradient-green">Nature</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover our range of organic, natural products designed to nourish your body and delight your senses. 
                We&apos;re committed to making healthy eating accessible and affordable for all.
              </p>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              At Romana Natural Products, we believe in the power of nature to transform lives. 
              Through innovative food production and sustainable farming practices, we&apos;re building 
              a healthier future for communities across Tanzania and beyond.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/store">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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
              <Image
                src="/images/products/WhatsApp Image 2025-07-20 at 19.51.03.jpeg"
                alt="Romana Natural Products - Fresh Organic Juices"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent z-10"></div>
              <div className="absolute bottom-6 left-6 text-white z-20">
                <div className="flex items-center mb-2">
                  <Leaf className="h-6 w-6 text-green-400 mr-2" />
                  <p className="text-lg font-semibold">Fresh, Organic, Natural</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Inspiring a healthier, more sustainable way of living
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our story began with a simple yet powerful vision: to make nutritious, 
                organic food accessible to everyone while supporting local communities and 
                promoting sustainable farming practices.
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We partner with local farmers across Tanzania, providing them with the tools, 
                knowledge, and fair compensation they need to grow the highest quality organic 
                produce. Every product we create tells a story of community empowerment and 
                environmental stewardship.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                From our state-of-the-art processing facilities to our commitment to zero-waste 
                packaging, every aspect of our operation is designed with sustainability in mind. 
                We believe that caring for our planet and our people isn&apos;t just good business—it&apos;s the right thing to do.
              </p>
            </div>
            
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Learn More About Our Mission
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/products/child.jpeg"
                alt="From Heart to Health - Tanzanian Natural Beauty"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <div className="flex items-center mb-3">
                  <Heart className="h-7 w-7 text-red-400 mr-3" />
                  <p className="text-xl font-bold">From Heart to Health</p>
                </div>
                <p className="text-green-200 font-semibold text-lg">Tanzanian Natural Beauty</p>
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
      icon: Leaf,
      title: 'Sustainability',
      description: 'We prioritize environmental responsibility in every aspect of our operations, from farming to packaging.',
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'We believe in empowering local communities and creating opportunities that benefit everyone.',
    },
    {
      icon: Users,
      title: 'Quality',
      description: 'Our commitment to excellence ensures that every product meets the highest standards of purity and nutrition.',
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'We work tirelessly to make healthy, organic food affordable and available to all communities.',
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These principles guide everything we do, from the seeds we plant to the communities we serve.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="bg-white border-green-200 hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">{value.description}</p>
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
      title: 'Premium Organic Juices',
      description: 'Fresh-pressed juices made from the finest organic fruits, bursting with natural vitamins and minerals.',
      features: ['100% Organic', 'No Added Sugar', 'Rich in Vitamins', 'Fresh Daily'],
      image: '/images/products/WhatsApp Image 2025-07-20 at 19.51.04.jpeg',
    },
    {
      title: 'Natural Health Foods',
      description: 'Wholesome, nutrient-dense foods that support your wellness journey and fuel your active lifestyle.',
      features: ['Locally Sourced', 'Nutrient Dense', 'Sustainable', 'Traditional Methods'],
      image: '/images/products/WhatsApp Image 2025-07-21 at 19.03.45.jpeg',
    },
    {
      title: 'Organic Superfood Blends',
      description: 'Carefully crafted combinations of superfoods designed to boost energy and support optimal health.',
      features: ['Antioxidant Rich', 'Energy Boosting', 'Immune Support', 'Premium Quality'],
      image: '/images/products/WhatsApp Image 2025-07-21 at 19.03.47.jpeg',
    },
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Products</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our carefully curated selection of organic products, each crafted with love and designed to nourish your body naturally.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="bg-white border-green-200 hover:shadow-xl transition-all duration-300 h-full group">
                <div className="relative h-64 overflow-hidden rounded-t-lg">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-gray-900">{product.title}</CardTitle>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {product.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                      Learn More
                    </Button>
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

function ProductGallerySection() {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const galleryImages = [
    { 
      src: '/images/products/WhatsApp Image 2025-07-20 at 19.51.09.jpeg',
      alt: 'Fresh Organic Juice Collection',
      title: 'Fresh Organic Juices',
      description: 'Pure, natural juices packed with vitamins and minerals. Our fresh-pressed juices are made from the finest organic fruits, ensuring maximum nutrition and taste.',
      benefits: ['100% Organic', 'No Preservatives', 'Rich in Vitamins', 'Freshly Pressed Daily']
    },
    { 
      src: '/images/products/WhatsApp Image 2025-07-20 at 19.51.12.jpeg',
      alt: 'Premium Natural Products',
      title: 'Premium Natural Products',
      description: 'High-quality organic products for health and wellness. Each product is carefully crafted using traditional methods and sustainable practices.',
      benefits: ['Sustainably Sourced', 'Traditional Methods', 'Premium Quality', 'Community Supported']
    },
    { 
      src: '/images/products/WhatsApp Image 2025-07-20 at 19.51.14.jpeg',
      alt: 'Healthy Organic Foods',
      title: 'Healthy Organic Foods',
      description: 'Wholesome foods for better nutrition and lifestyle. Our organic foods support your wellness journey with natural goodness.',
      benefits: ['Nutrient Dense', 'Organic Certified', 'Locally Sourced', 'Health Supporting']
    },
    { 
      src: '/images/products/WhatsApp Image 2025-07-21 at 19.03.48.jpeg',
      alt: 'Superfood Blends',
      title: 'Superfood Blends',
      description: 'Nutrient-dense superfoods for energy and vitality. Our carefully crafted blends combine the best superfoods for optimal health benefits.',
      benefits: ['Antioxidant Rich', 'Energy Boosting', 'Immune Support', 'Natural Ingredients']
    },
    { 
      src: '/images/products/WhatsApp Image 2025-07-21 at 19.03.50.jpeg',
      alt: 'Natural Health Products',
      title: 'Natural Health Products',
      description: 'Supporting your wellness journey naturally with products designed to nourish your body and enhance your well-being.',
      benefits: ['All Natural', 'Wellness Focused', 'Scientifically Backed', 'Gentle on Body']
    },
    { 
      src: '/images/products/WhatsApp Image 2025-07-21 at 19.03.53.jpeg',
      alt: 'Organic Product Range',
      title: 'Organic Product Range',
      description: 'Complete selection of organic goodness from farm to table. Our diverse range ensures there\'s something for every health-conscious individual.',
      benefits: ['Farm Fresh', 'Complete Range', 'Quality Assured', 'Organic Certified']
    },
  ];

  // Duplicate array for seamless infinite scroll
  const infiniteProducts = [...galleryImages, ...galleryImages, ...galleryImages];

  const handleProductClick = async (index: number) => {
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 200)); // Short delay for flip animation
    setSelectedProduct(index);
    setIsAnimating(false);
  };

  const handleCloseModal = async () => {
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 200)); // Short delay for flip animation
    setSelectedProduct(null);
    setIsAnimating(false);
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Flowing Product Gallery</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch our products flow through this endless gallery. Tap any product to explore its benefits and features in detail.
          </p>
        </motion.div>

        {/* Endless Flowing Gallery */}
        <div className="relative h-96 overflow-hidden">
          <motion.div
            className="flex gap-6 h-full"
            animate={{
              x: [`0px`, `-${galleryImages.length * 326}px`],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ width: `${infiniteProducts.length * 326}px` }}
          >
            {infiniteProducts.map((product, index) => (
              <motion.div
                key={`${index}-${product.title}`}
                className="relative w-80 h-80 cursor-pointer flex-shrink-0"
                onClick={() => handleProductClick(index % galleryImages.length)}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  z: 50,
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ rotateY: 0 }}
                animate={{ 
                  rotateY: isAnimating && selectedProduct === (index % galleryImages.length) ? 180 : 0,
                }}
                transition={{ 
                  duration: 0.6, 
                  ease: "easeInOut",
                  type: "spring",
                  stiffness: 100,
                }}
                style={{ 
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Product Card */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl bg-white transform-gpu">
                  <Image
                    src={product.src}
                    alt={product.alt}
                    fill
                    className="object-cover transition-transform duration-300"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-sm opacity-90">Tap to explore</p>
                    </div>
                  </div>
                  
                  {/* Floating elements for visual appeal */}
                  <motion.div
                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Modal for expanded view */}
        {selectedProduct !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: -180 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeInOut",
                type: "spring",
                stiffness: 100,
              }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                {/* Image Side */}
                <div className="relative h-64 lg:h-full">
                  <Image
                    src={galleryImages[selectedProduct].src}
                    alt={galleryImages[selectedProduct].alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30"></div>
                </div>

                {/* Content Side */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {galleryImages[selectedProduct].title}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {galleryImages[selectedProduct].description}
                    </p>

                    <div className="space-y-3 mb-8">
                      <h3 className="text-lg font-semibold text-gray-900">Key Benefits:</h3>
                      {galleryImages[selectedProduct].benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex space-x-4">
                      <Button className="bg-primary hover:bg-primary/90 text-white flex-1">
                        Learn More
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCloseModal}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        Close
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
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
      name: 'Jeremy Moye',
      role: 'Chief Operating Officer',
      description: 'With extensive education from Italy and deep expertise in sustainable agriculture, Jeremy leads our operational excellence and strategic partnerships across East Africa.',
      image: '/images/team/coo.jpeg',
      education: 'Educated in Italy',
      expertise: 'Sustainable Agriculture & Operations',
    },
    {
      name: 'Joel Moye',
      role: 'Chief Financial Officer',
      description: 'Bringing valuable experience from BCG and Ascent, Joel drives financial strategy and business development to scale our impact across communities.',
      image: '/images/team/cfo.jpg',
      experience: 'Former BCG & Ascent',
      expertise: 'Financial Strategy & Business Development',
    },
  ];

  return (
    <section id="team" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the passionate leaders driving our mission to transform communities through sustainable, organic nutrition.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="bg-white border-green-200 hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="relative h-80 overflow-hidden rounded-t-lg">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                    <p className="text-green-200 font-medium">{member.role}</p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-gray-900">{member.name}</CardTitle>
                  <div className="text-center space-y-2">
                    <p className="text-primary font-semibold">{member.expertise}</p>
                    <p className="text-gray-600 text-sm">
                      {member.education || member.experience}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-center">{member.description}</p>
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
    <section id="contact" ref={ref} className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to join our mission? We&apos;d love to hear from you. Reach out to learn more about our products, partnerships, or career opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">info@romana.co.tz</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Call Us</h3>
                  <a href="https://wa.me/255767266355" className="text-primary hover:text-primary/80 transition-colors">
                    +255 767 266 355
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Visit Us</h3>
                  <p className="text-gray-600">Dar es Salaam, Tanzania</p>
                </div>
              </div>
              
              {/* Social Media Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  {/* WhatsApp Button */}
                  <a
                    href="https://wa.me/255767266355"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span className="font-medium">WhatsApp</span>
                  </a>
                  
                  {/* Instagram Button */}
                  <a
                    href="https://www.instagram.com/romananatural_products/profilecard/?igsh=MWN4ZmtpeTBrZDhzaA=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="font-medium">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
                <CardDescription>
                  We&apos;ll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tell us about your interest in our products or partnership opportunities..."
                    ></textarea>
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
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
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Image 
                src="/images/logos/Romana_Logo_page-0001-removebg-preview.png" 
                alt="Romana Logo" 
                width={120} 
                height={48} 
                className="h-12 w-auto mr-3" 
              />
            </div>
            <p className="text-gray-400 leading-relaxed">
              Empowering communities through innovative food production and sustainable farming practices.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Products</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Organic Juices</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Health Foods</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Superfood Blends</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#team" className="hover:text-white transition-colors">Our Team</Link></li>
              <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-2 text-gray-400">
              <li>admin@romana-natural-products.org | jeremythadeus98@gmail.com</li>
              <li>
                <a href="https://wa.me/255767266355" className="hover:text-white transition-colors">
                  +255 767 266 355
                </a>
              </li>
              <li>Dar es Salaam, Tanzania</li>
            </ul>
            
            {/* Social Media Links */}
            <div className="pt-4">
              <h4 className="text-md font-semibold mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/255767266355" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
                  aria-label="Contact us on WhatsApp"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/romananatural_products/profilecard/?igsh=MWN4ZmtpeTBrZDhzaA==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-400 hover:to-pink-400 transition-all duration-300"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@romana_products?_t=ZM-8yFBf5rfd9J&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  aria-label="Follow us on TikTok"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.6 8.1a5.4 5.4 0 01-4.5-5.3V2h-3.2v14.2a2.1 2.1 0 11-2.1-2.1c.2 0 .4 0 .6.1V11a5.4 5.4 0 104.5 5.3V9.7a8.5 8.5 0 004.7 1.4V8.1z"/>
                  </svg>
                </a>
                </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Romana Natural Products. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
