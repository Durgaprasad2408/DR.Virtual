import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  MessageCircle,
  Clock,
  TrendingUp,
  Heart,
  FileText,
  CalendarDays
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/appointments?limit=5')
      const appointments = response.data.appointments || []

      setRecentAppointments(appointments)

      // Calculate stats
      const now = new Date()
      const stats = {
        totalAppointments: appointments.length,
        upcomingAppointments: appointments.filter(
          (apt) => new Date(apt.appointmentDate) > now && apt.status !== 'cancelled'
        ).length,
        completedAppointments: appointments.filter((apt) => apt.status === 'completed').length,
        pendingAppointments: appointments.filter((apt) => apt.status === 'pending').length
      }

      setStats(stats)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner h-8 w-8 sm:h-12 sm:w-12"></div>
      </div>
    )
  }

  const dashboardCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Upcoming',
      value: stats.upcomingAppointments,
      icon: Clock,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Completed',
      value: stats.completedAppointments,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'Pending',
      value: stats.pendingAppointments,
      icon: Heart,
      color: 'bg-orange-500',
      change: '+3%'
    }
  ]

  return (
    <div className="space-mobile">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-responsive-2xl font-bold text-gray-800">
          {user?.role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
        </h1>
        <p className="text-gray-600 mt-1 text-responsive-sm">
          {user?.role === 'doctor'
            ? 'Manage your appointments and patients'
            : 'Track your health appointments and consultations'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="responsive-grid mb-6 sm:mb-8">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-responsive-xs font-medium text-gray-600">{card.title}</p>
                <p className="text-responsive-xl font-bold text-gray-800 mt-1">{card.value}</p>
                <p className="text-responsive-xs text-green-600 mt-1 hidden sm:block">
                  {card.change} from last month
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${card.color} flex-shrink-0`}>
                <card.icon className="text-white" size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-responsive-lg font-semibold text-gray-800">Recent Appointments</h2>
          <Link
            to="/appointments"
            className="text-primary-600 hover:text-primary-700 font-medium text-responsive-sm"
          >
            View All
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-responsive-base">No appointments yet</p>
            <p className="text-responsive-sm text-gray-500 mt-1">
              {user?.role === 'patient'
                ? 'Book your first appointment with a doctor'
                : 'Appointments will appear here once patients book with you'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recentAppointments
              .filter((a) => a && (a.patient || a.doctor))
              .map((appointment) => {
                const patientName = appointment?.patient
                  ? `${appointment.patient.firstName || 'Unknown'} ${appointment.patient.lastName || ''}`
                  : 'Unknown Patient'
                const doctorName = appointment?.doctor
                  ? `Dr. ${appointment.doctor.firstName || 'Unknown'} ${appointment.doctor.lastName || ''}`
                  : 'Unknown Doctor'

                return (
                  <div
                    key={appointment._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="text-primary-600" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 text-responsive-sm truncate">
                          {user?.role === 'doctor' ? patientName : doctorName}
                        </h3>
                        <p className="text-responsive-xs text-gray-600">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                        {user?.role === 'doctor' && (
                          <p className="text-responsive-xs text-gray-500 mt-1 line-clamp-2">
                            Symptoms: {appointment.symptoms || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status
                          ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
                          : 'Unknown'}
                      </span>
                      {(appointment.status === 'confirmed' ||
                        appointment.status === 'completed') && (
                        <Link
                          to={`/chat/${appointment._id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors touch-target"
                          title="Open Chat"
                        >
                          <MessageCircle size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h2 className="text-responsive-lg font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="responsive-grid-3">
          {user?.role === 'patient' ? (
            <>
              <Link
                to="/doctors"
                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center touch-target"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                    <Users className="text-white" size={24} />
                  </div>
                  <span className="text-responsive-sm font-semibold text-gray-700 group-hover:text-blue-800 transition-colors duration-300">
                    Find Doctors
                  </span>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-600 transition-colors duration-300">
                    Browse available healthcare providers
                  </p>
                </div>
              </Link>
              <Link
                to="/med-vault"
                className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center touch-target"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors duration-300">
                    <FileText className="text-white" size={24} />
                  </div>
                  <span className="text-responsive-sm font-semibold text-gray-700 group-hover:text-green-800 transition-colors duration-300">
                    My Records
                  </span>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-green-600 transition-colors duration-300">
                    Access your medical history
                  </p>
                </div>
              </Link>
              <Link
                to="/appointments"
                className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center touch-target"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600 transition-colors duration-300">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <span className="text-responsive-sm font-semibold text-gray-700 group-hover:text-purple-800 transition-colors duration-300">
                    View Appointments
                  </span>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-purple-600 transition-colors duration-300">
                    Manage your scheduled visits
                  </p>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/schedule"
                className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center touch-target"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 transition-colors duration-300">
                    <CalendarDays className="text-white" size={24} />
                  </div>
                  <span className="text-responsive-sm font-semibold text-gray-700 group-hover:text-indigo-800 transition-colors duration-300">
                    Manage Schedule
                  </span>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-indigo-600 transition-colors duration-300">
                    Set your availability
                  </p>
                </div>
              </Link>
              <Link
                to="/patient-records"
                className="group relative overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center touch-target"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-600 transition-colors duration-300">
                    <Users className="text-white" size={24} />
                  </div>
                  <span className="text-responsive-sm font-semibold text-gray-700 group-hover:text-teal-800 transition-colors duration-300">
                    Patient Records
                  </span>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-teal-600 transition-colors duration-300">
                    View patient information
                  </p>
                </div>
              </Link>
              <Link
                to="/appointments"
                className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center touch-target"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors duration-300">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <span className="text-responsive-sm font-semibold text-gray-700 group-hover:text-orange-800 transition-colors duration-300">
                    View Appointments
                  </span>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-orange-600 transition-colors duration-300">
                    Check upcoming consultations
                  </p>
                </div>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
