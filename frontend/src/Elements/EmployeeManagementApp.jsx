import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeTable from './EmployeeTable';
import { GetAllEmployees } from '../api';
import { ToastContainer } from 'react-toastify';
import { Button } from "@/components/ui/button"
import { Search } from 'lucide-react';

const EmployeeManagementApp = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);

    const fetchEmployees = async (search = '') => {
        try {
            const data = await GetAllEmployees(search, 1, 1000);
            setEmployees(data.employees);
        } catch (err) {
            alert('Error', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSearch = (e) => {
        fetchEmployees(e.target.value);
    };

    const handleUpdateEmployee = (emp) => {
        navigate(`/dashboard/employee/edit/${emp._id}`, { state: { employee: emp } });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-12">
                <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl p-8">
                    <h1 className="text-4xl font-bold text-white mb-8 text-center">
                        Event Listing
                    </h1>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                        <Button 
                            className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                            onClick={() => navigate('/dashboard/employee/add')}
                        >
                            Add New Event
                        </Button>
                        
                        <div className="relative w-full md:w-1/2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                            <input
                                onChange={handleSearch}
                                type="text"
                                placeholder="Search events..."
                                className="w-full bg-white/10 text-white placeholder-white/60 border-0 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg">
                        <EmployeeTable
                            employees={employees}
                            handleUpdateEmployee={handleUpdateEmployee}
                        />
                    </div>
                </div>
            </div>
            
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                theme="dark"
            />
        </div>
    );
};

export default EmployeeManagementApp;