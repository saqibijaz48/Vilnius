import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, ShoppingBag, Award } from "lucide-react";

function AboutPage() {
  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8 text-blue-600" />,
      title: "Wide Product Range",
      description: "Discover thousands of products across multiple categories including fashion, electronics, and more."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Customer Focused",
      description: "We prioritize customer satisfaction with 24/7 support and easy returns policy."
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: "Quality Assured",
      description: "All products are carefully selected and quality tested before reaching our customers."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-orange-600" />,
      title: "Secure Shopping",
      description: "Shop with confidence using our secure payment system and data protection."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Vilnius Shopping</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted online shopping destination, bringing you the best products 
          with exceptional service and unbeatable prices.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded with a vision to revolutionize online shopping, Vilnius Shopping 
            has grown from a small startup to a leading e-commerce platform serving 
            customers worldwide.
          </p>
          <p className="text-gray-600 mb-4">
            We believe that shopping should be convenient, enjoyable, and accessible 
            to everyone. That's why we've built a platform that combines cutting-edge 
            technology with personalized service.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <Badge variant="secondary">Est. 2024</Badge>
            <Badge variant="secondary">10,000+ Products</Badge>
            <Badge variant="secondary">50,000+ Happy Customers</Badge>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
          <p className="text-gray-700 mb-4">
            To provide an exceptional online shopping experience by offering 
            high-quality products, competitive prices, and outstanding customer service.
          </p>
          <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
          <p className="text-gray-700">
            To become the most trusted and preferred e-commerce platform globally, 
            connecting customers with the products they love.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-semibold text-center mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-center mb-8">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Integrity</h3>
            <p className="text-gray-600">
              We conduct business with honesty, transparency, and ethical practices 
              in all our interactions.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3 text-green-600">Innovation</h3>
            <p className="text-gray-600">
              We continuously improve our platform and services to provide the 
              best shopping experience.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3 text-purple-600">Excellence</h3>
            <p className="text-gray-600">
              We strive for excellence in everything we do, from product selection 
              to customer service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;