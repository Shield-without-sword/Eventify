//RSVPPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GetEmployeeDetailsById } from '../api';
import { createRSVPResponse } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, Users} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const RSVPPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    response: 'null'
  });
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate if response is selected
    if (!formData.response) {
      setError('Please select whether you are accepting or declining the invitation');
      return;
    }
  
    try {
      const response = await createRSVPResponse({
        ...formData,
        eventId: id
      });
  
      if (response.success) {
        // You could add a success toast/alert here
        navigate('/dashboard/employee');
      } else {
        throw new Error(response.message || 'Failed to submit RSVP');
      }
    } catch (err) {
      setError('Failed to submit RSVP: ' + err.message);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResponseChange = (value) => {
    setFormData(prev => ({
      ...prev,
      response: value
    }));
  };

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
                      alt={"${employee.name}'s photo"}
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

{/* RSVP Form Section */}
<Card>
  <CardHeader>
    <CardTitle>RSVP Form</CardTitle>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              className="mt-1"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Label>Your Response</Label>
        <div className="mt-2 space-y-2">
          <Button
            type="button"
            onClick={() => handleResponseChange('going')}
            className={`w-full ${
              formData.response === 'going' 
                ? 'bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-green-100'
            }`}
          >
            I will attend
          </Button>
          <Button
            type="button"
            onClick={() => handleResponseChange('not-going')}
            className={`w-full ${
              formData.response === 'not-going' 
                ? 'bg-red-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-red-100'
            }`}
          >
            I cannot attend
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!formData.response}
        >
          Submit RSVP
        </Button>
      </div>
    </form>
  </CardContent>
</Card>      </div>
    </div>
  );
};

export default RSVPPage;