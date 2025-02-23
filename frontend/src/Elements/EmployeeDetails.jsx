import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GetEmployeeDetailsById, GetAllRSVPs } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Camera, Calendar, MapPin, Users, Mail, Phone, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EventLocationMap = ({ location }) => {
  useEffect(() => {
    // Initialize map after component mounts
    const map = L.map('map').setView([0, 0], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Geocode the location and set marker
    const searchLocation = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
        );
        const data = await response.json();

        if (data && data[0]) {
          const { lat, lon } = data[0];
          map.setView([lat, lon], 13);
          
          // Custom marker icon
          const customIcon = L.divIcon({
            html: `<div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                     <div class="w-6 h-6 text-white">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                     </div>
                   </div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });

          L.marker([lat, lon], { icon: customIcon })
            .addTo(map)
            .bindPopup(location)
            .openPopup();
        }
      } catch (error) {
        console.error('Error geocoding location:', error);
      }
    };

    searchLocation();

    // Cleanup
    return () => {
      map.remove();
    };
  }, [location]);

  return <div id="map" style={{ height: '400px' }} />;
};

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [rsvps, setRSVPs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployeeDetails = async () => {
    try {
      const data = await GetEmployeeDetailsById(id);
      setEmployee(data);
      console.log(data)
      return data;
    } catch (err) {
      setError('Failed to fetch employee details: ' + err.message);
      return null;
    }
  };

  const fetchRSVPData = async () => {
    try {
      const data = await GetAllRSVPs('', 1, 100);
      if (Array.isArray(data)) {
        setRSVPs(data);
      } else if (data.rsvps && Array.isArray(data.rsvps)) {
        setRSVPs(data.rsvps);
      } else {
        console.error('Unexpected RSVP data structure:', data);
        setRSVPs([]);
      }
    } catch (err) {
      setError('Failed to fetch RSVP data: ' + err.message);
      setRSVPs([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchEmployeeDetails(), fetchRSVPData()]);
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            variant="outline"
            onClick={() => navigate('/photo')}
            className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <Camera size={18} />
            Gallery
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/rsvp/${id}`)}
            className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <Calendar size={18} />
            RSVP Page
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard/employee')}
            className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {employee && (
          <div className="space-y-8">
            {/* Event Information Card */}
            <Card className="overflow-hidden border-none shadow-2xl bg-white/5 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <CardTitle className="text-2xl font-bold text-white">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left side - Image */}
                  <div className="relative h-[400px] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                    <img
                      src={employee.profileImage}
                      alt={`${employee.name}'s photo`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 "
                    />
                    <div className="absolute bottom-0 left-0 p-6 z-20">
                      <h3 className="text-3xl font-bold text-white mb-2">{employee.name}</h3>
                      <p className="text-white/80">Event Host : Yash</p>
                    </div>
                  </div>

                  {/* Right side - Stats */}
                  <div className="p-8 bg-white/5 backdrop-blur-lg space-y-8">
                    <div className="flex items-center gap-6 p-6 rounded-xl bg-white/5 backdrop-blur-lg transition-all duration-300 hover:bg-white/10">
                      <Users className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-white/60 text-sm">Event Capacity</p>
                        <p className="text-white text-xl font-semibold">{employee.capacity} people</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 rounded-xl bg-white/5 backdrop-blur-lg transition-all duration-300 hover:bg-white/10">
                      <Users className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-white/60 text-sm">Date</p>
                        <p className="text-white text-xl font-semibold"> {format(parseISO(employee.createdAt), "dd-MM-yyyy")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 rounded-xl bg-white/5 backdrop-blur-lg transition-all duration-300 hover:bg-white/10">
                      <MapPin className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-white/60 text-sm">Location</p>
                        <p className="text-white text-xl font-semibold">{employee.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Location Map */}
            <EventLocationMap location={employee.location} />

            {/* RSVP Information Card */}
            <Card className="overflow-hidden border-none shadow-2xl bg-white/5 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <CardTitle className="text-2xl font-bold text-white">RSVP Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-4 px-6 text-left font-medium text-white/60">Guest</th>
                        <th className="py-4 px-6 text-left font-medium text-white/60">Contact</th>
                        <th className="py-4 px-6 text-left font-medium text-white/60">Status</th>
                        <th className="py-4 px-6 text-left font-medium text-white/60">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(rsvps) && rsvps.length > 0 ? (
                        rsvps.map((rsvp, index) => (
                          <tr 
                            key={rsvp._id || index}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="font-medium text-white">{rsvp.name}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-white/80">
                                  <Mail size={14} />
                                  {rsvp.email}
                                </div>
                                <div className="flex items-center gap-2 text-white/80">
                                  <Phone size={14} />
                                  {rsvp.phone}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                rsvp.response === 'going' 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                {rsvp.response === 'going' ? 'Going' : 'Not Going'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-white/80">
                              {rsvp.createdAt ? format(parseISO(rsvp.createdAt), 'MMM dd, yyyy') : 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-white/60">
                            No RSVP responses yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;