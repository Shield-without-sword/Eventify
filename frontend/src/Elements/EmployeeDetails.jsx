import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GetEmployeeDetailsById, GetAllRSVPs } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';


const EmployeeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [rsvps, setRSVPs] = useState([]);
  const [error, setError] = useState(null);


  const fetchEmployeeDetails = async () => {
    try {
      const data = await GetEmployeeDetailsById(id);
      setEmployee(data);

      if (data.production && Array.isArray(data.production)) {
        const formattedData = data.production
          .map(item => ({
            date: format(parseISO(item.date), 'MMM dd'),
            amount: item.amount
          }))
          .sort((a, b) => parseISO(a.date) - parseISO(b.date));

        setProductionData(formattedData);
      }
      return data;
    } catch (err) {
      return null;
    }
  };

  const fetchRSVPData = async () => {
    try {
      const data = await GetAllRSVPs('', 1, 100);
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setRSVPs(data);
      } else if (data.rsvps && Array.isArray(data.rsvps)) {
        // If the data is wrapped in an object with a rsvps property
        setRSVPs(data.rsvps);
      } else {
        // If we get unexpected data structure, set empty array
        console.error('Unexpected RSVP data structure:', data);
        setRSVPs([]);
      }
    } catch (err) {
      setError('Failed to fetch RSVP data: ' + err.message);
      setRSVPs([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
    fetchRSVPData();
  }, [id]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6 flex gap-4">
      <Button 
          variant="outline" 
          onClick={() => navigate(`/photo`)} 
          className="w-full md:w-auto"
        >
          Gallery
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/rsvp/${id}`)} 
          className="w-full md:w-auto"
        >
          Go to RSVP Page
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/dashboard/employee')}
          className="w-full md:w-auto"
        >
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {employee && (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left side - Image */}
                <div className="lg:w-1/2">
                  <div className="relative rounded-lg overflow-hidden h-full">
                    <img
                      src={employee.profileImage}
                      alt={`${employee.name}'s photo`}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Right side - Stats */}
                <div className="lg:w-1/2 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="text-lg font-semibold">{employee.name}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-sm text-gray-500">Capacity</div>
                      <div className="text-lg font-semibold">{employee.capacity}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="text-lg font-semibold">{employee.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

{/* RSVP Data Card */}
<Card className="p-6">
  <CardHeader>
    <CardTitle>RSVP Information</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4 text-left font-medium text-gray-600">Name</th>
            <th className="p-4 text-left font-medium text-gray-600">Email</th>
            <th className="p-4 text-left font-medium text-gray-600">Phone</th>
            <th className="p-4 text-left font-medium text-gray-600">Response</th>
            <th className="p-4 text-left font-medium text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(rsvps) && rsvps.map((rsvp, index) => (
            <tr 
              key={rsvp._id || index}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="p-4">{rsvp.name}</td>
              <td className="p-4">{rsvp.email}</td>
              <td className="p-4">{rsvp.phone}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded ${
                  rsvp.response === 'going' ? 'bg-green-100 text-green-800' :
                  rsvp.response === 'not-going' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {rsvp.response === 'going' ? 'Going' : 'Not Going'}
                </span>
              </td>
              <td className="p-4">
                {rsvp.createdAt ? format(parseISO(rsvp.createdAt), 'MMM dd, yyyy') : 'N/A'}
              </td>
            </tr>
          ))}
          {(!Array.isArray(rsvps) || rsvps.length === 0) && (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No RSVP data available
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
  );
};

export default EmployeeDetails;