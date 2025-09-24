import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing
              <span className="block text-secondary-400">Study Tours & Camps</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Find the perfect educational adventure from our curated collection of study tours,
              summer camps, and international programs worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/campsites">
                <Button size="lg" variant="secondary">
                  Explore Campsites
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose StudyTour?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy to find and compare educational programs worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-lg p-6 mb-4 inline-block">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Search & Filter
              </h3>
              <p className="text-gray-600">
                Find programs by location, category, age group, and ratings with our powerful search tools
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary-100 rounded-lg p-6 mb-4 inline-block">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real Reviews & Ratings
              </h3>
              <p className="text-gray-600">
                Read authentic reviews from parents and students who have experienced these programs firsthand
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-lg p-6 mb-4 inline-block">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Global Network
              </h3>
              <p className="text-gray-600">
                Access programs from around the world, from local summer camps to international study tours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of families who have found their perfect educational experience through StudyTour
          </p>
          <Link href="/campsites">
            <Button size="lg">
              Browse Campsites Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}