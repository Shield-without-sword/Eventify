import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeTable from './EmployeeTable';
import { GetAllEmployees } from '../api';
import { ToastContainer } from 'react-toastify';
import { Button } from "@/components/ui/button"

const EmployeeManagementApp = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);

    const fetchEmployees = async (search = '') => {
        console.log('Called fetchEmployees');
        try {
            const data = await GetAllEmployees(search, 1, 1000);
            console.log(data);
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
        <div className="flex flex-col justify-center items-center w-full p-6">
            <h1 className="text-2xl font-bold mb-4">Event Listing</h1>
            <div className="w-full flex justify-center">
                <div className="w-4/5 border bg-gray-100 p-6 rounded shadow">
                    <div className="flex justify-between mb-4">
                        <Button 
                            variant="default" 
                            onClick={() => navigate('/dashboard/employee/add')}
                        >
                            Add
                        </Button>
                        <input
                            onChange={handleSearch}
                            type="text"
                            placeholder="Search..."
                            className="form-control w-1/2 border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <EmployeeTable
                        employees={employees}
                        handleUpdateEmployee={handleUpdateEmployee}
                    />
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
            />
        </div>
    );
};

export default EmployeeManagementApp;