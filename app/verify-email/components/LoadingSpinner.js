// LoadingSpinner.js
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function LoadingSpinner({ message = 'กำลังโหลด...' }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}