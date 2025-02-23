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
import emailjs from '@emailjs/browser';


const RSVPPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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


  const sendConfirmationEmail = async () => {
    try {
      const templateParams = {
        to_name: formData.name,
        to_email: formData.email,
        event_name: employee.name,
        event_date: formatDate(employee.startAt),
        event_location: employee.location,
        response_status: formData.response === 'going' ? 'Accepted' : 'Declined',
      };


      await emailjs.send(
        'service_wtdtxrk',
        'template_hetvc4v',
        templateParams,
        'JB2YupqQ3psOuc9HO'
      );
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send confirmation email');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.response) {
      setError('Please select whether you are accepting or declining the invitation');
      setLoading(false);
      return;
    }
  
    try {
      // First, create the RSVP response
      const response = await createRSVPResponse({
        ...formData,
        eventId: id
      });
  
      if (response.success) {
        // Then, send the confirmation email
        await sendConfirmationEmail();
        navigate('/dashboard/employee');
      } else {
        throw new Error(response.message || 'Failed to submit RSVP');
      }
    } catch (err) {
      setError('Failed to process RSVP: ' + err.message);
    } finally {
      setLoading(false);
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
    <div className="container bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 ">
      <div className="space-y-6">
        {/* Hero Section */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <CardContent className="text-white" >
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

              <div className="lg:w-1/2 space-y-6 ">
                <div className="bg-gradient-to-br from-slate-700 via-purple-700 to-slate-700 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">{employee.name}</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-white" />
                      <span className="h-5 w-5 text-white" >{employee.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-white" />
                      <span className="text-white" >Capacity: {employee.capacity || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-white" />
                      <span className=" text-white" >
                        Period: {formatDate(employee.createdAt)} - {formatDate(employee.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-700 via-purple-700 to-slate-700 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">About</h3>
                  <p className="text-white">{employee.about || 'No description available'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

{/* RSVP Form Section */}
<Card className=" text-white bg-gradient-to-br from-slate-700 via-purple-700 to-slate-700">
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
            disabled={!formData.response || loading}
          >
            {loading ? 'Submitting...' : 'Submit RSVP'}
          </Button>
        </div>
      </form>
  </CardContent>
</Card>      
</div>
    </div>
  );
};

export default RSVPPage;