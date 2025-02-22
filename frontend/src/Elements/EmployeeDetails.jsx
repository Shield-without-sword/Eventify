import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GetEmployeeDetailsById } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FileDown } from 'lucide-react';
import showdown from 'showdown';

// Add converter instance
const converter = new showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});
const MonthlyReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productionData, setProductionData] = useState([]);

  const GEMINI_API_KEY = 'AIzaSyDdK7ukD2lO9kli33tX1v0wv1RBzbxhAgY';

  const fetchEmployeeDetails = async () => {
    try {
      const data = await GetEmployeeDetailsById(id);
      setEmployee(data);

      // Transform production data for the chart
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
      setError('Failed to fetch cattle data: ' + err.message);
      return null;
    }
  };



  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  return (
        <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6 flex gap-4">
        <Button 
  variant="outline" 
  onClick={() => navigate(`/photo`)} 
  className="w-full md:w-auto"
>
  Go to RSVP Page
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
            <div className="text-sm text-gray-500">capacity</div>
            <div className="text-lg font-semibold">{employee.capacity} </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">location</div>
            <div className="text-lg font-semibold">{employee.location} </div>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
          </Card>

          {/* AI Analysis */}
          {report && (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly Analysis Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: report.analysis }} 
          />
        </CardContent>
      </Card>
    )}
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;