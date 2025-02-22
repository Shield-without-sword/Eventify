import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GetEmployeeDetailsById } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const RSVPPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);

  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const data = await GetEmployeeDetailsById(id);
        setEmployee(data);
      } catch (err) {
        setError('Failed to fetch data: ' + err.message);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6 flex gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate('/dashboard/employee')}
          className="w-full md:w-auto"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        <Card className="p-6">
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2">
                <div className="relative rounded-lg overflow-hidden h-[400px]">
                  {employee.profileImage ? (
                    <img
                      src={employee.profileImage}
                      alt={`${employee.name}'s photo`}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:w-1/2 space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">{employee.name}</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{employee.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span>Capacity: {employee.capacity || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span>
                     Period: {formatDate(employee.startAt)} - {formatDate(employee.endAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">About</h3>
                  <p className="text-gray-700">{employee.about || 'No description available'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4"> 
              </div>
              <Button 
          variant="outline"
          onClick={() => navigate('/dashboard/employee')}
          className="bg-yellow-300 w-full md:w-auto"
        >
          RSVP
        </Button>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-gray-600">{formatDate(employee.startAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">End Date</p>
                    <p className="text-gray-600">{formatDate(employee.endAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RSVPPage;