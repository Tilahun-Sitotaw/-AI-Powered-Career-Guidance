import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 text-lg">Last updated: May 2024</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                CareerPath AI ("we", "us", "our", or "Company") operates the CareerPath AI website and mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information Collection and Use</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect several different types of information for various purposes to provide and improve our Service to you.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Personal Data: Name, email address, phone number, and profile information</li>
                <li>Usage Data: Browser type, IP address, pages visited, and time spent on pages</li>
                <li>Cookies and Tracking Technologies: To enhance user experience and analyze usage patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Use of Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                CareerPath AI uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our Service</li>
                <li>To monitor the usage of our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Security of Data</h2>
              <p className="text-gray-700 leading-relaxed">
                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                Email: <a href="mailto:privacy@careerpath.ai" className="text-cyan-600 hover:text-cyan-700">privacy@careerpath.ai</a>
              </p>
            </section>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <Link to="/" className="text-cyan-600 hover:text-cyan-700 font-semibold">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
