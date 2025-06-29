import React from 'react';
import {jwtDecode} from 'jwt-decode';
import { useState } from 'react';
import Navbar from '../components/Navbar';
const ReportPage=()=>{
    const[weeklyData, setWeeklyData]=useState(null);
    const[showForm, setShowForm]=useState(true);
    const[currentTab, setCurrentTab]=useState('');
    const[startDate, setStartDate]=useState('');
    const[endDate, setEndDate]=useState('');
    const[month, setMonth]=useState('');
    const[year, setYear]=useState(0);
    const[month1, setMonth1]=useState('');
    const[year1, setYear1]=useState(0);
    const[month2, setMonth2]=useState('');
    const[year2, setYear2]=useState(0);

    const handleWeeklyReport=async(e)=>{
        e.preventDefault();
        const token=localStorage.getItem('token');
        const decoded=jwtDecode(token);
        const userId=decoded.user.id;
        console.log("fetching for", startDate, endDate);
        try{
            const res = await fetch(`http://localhost:3001/api/reports/weekly/${userId}?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
                }
            );
            const data=await res.json();
            console.log("Response:", data);
            setWeeklyData(data.data);
            setShowForm(false);
        }
        catch(error){
            console.error("Error fetching weekly report", error);
        }
    }
    
    return (
        <div className='bg-gray-400 min-h-screen'>
            <Navbar/>
            <h1 className="text-gray-800 text-3xl sm:4xl md:text-5xl font-bold mb-6 px-4 py-4">Get your REPORT</h1>
            <div className="grid grid-cols-2 gap-4 mx-4 mb-6 sm:flex sm:justify-center sm:space-x-4 sm:gap-0">
                <button onClick={()=>{setCurrentTab('weekly');
                                        setShowForm(true);}
                 }
                        className={`px-4 py-4 shadow-md rounded ${currentTab==="weekly"?"bg-blue-500 text-white hover:bg-blue-600 font-bold":"bg-gray-600 hover:bg-gray-500 text-white"}`}>Weekly</button>
                <button onClick={()=>{setCurrentTab('monthlyy');
                                        setShowForm(true);
                                        setWeeklyData(null);}}
                        className={`px-4 py-4 shadow-md rounded ${currentTab==="monthly"?"bg-blue-500 text-white hover:bg-blue-600 font-bold":"bg-gray-600 hover:bg-gray-500 text-white"}`}>Monthly</button>
                <button onClick={()=>{setCurrentTab('occasional');
                                        setShowForm(true);}}
                        className={`px-4 py-4 shadow-md rounded ${currentTab==="occasional"?"bg-blue-500 hover:bg-blue-600 text-white font-bold":"bg-gray-600 hover:bg-gray-500 text-white"}`}>Occasional</button>
                <button onClick={()=>{setCurrentTab('compare');
                                        setShowForm(true);}}
                        className={`px-4 py-4 shadow-md rounded ${currentTab==="compare"?"bg-blue-500 hover:bg-blue-600 text-white font-bold":"bg-gray-600 hover:bg-gray-500 text-white"}`}>Compare</button>
            </div>
            
                {currentTab==="weekly" &&
                        (showForm &&(
                            <div className="bg-gray-200 flex flex-col justify-center items-center rounded w-full mb-6 max-w-md mx-4 px-5 sm:mx-auto">
                                <form onSubmit={handleWeeklyReport} className="w-full py-6">
                                    <h2 className="text-2xl mb-4 mt-4 font-bold">Enter dates</h2>
                                    <div className="mb-4">
                                        <label className="text-sm text-gray-800 mb-1 font-bold block">Start date</label>
                                        <input 
                                            type="date"
                                            value={startDate}
                                            onChange={(e)=>setStartDate(e.target.value)}
                                            placeholder="Enter start date"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-sm text-gray-800 mb-1 font-bold block">End date</label>
                                        <input 
                                            type="date"
                                            value={endDate}
                                            onChange={(e)=>setEndDate(e.target.value)}
                                            placeholder="Enter start date"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full bg-gray-600 text-white font-bold hover:bg-blue-500 p-1 rounded shadow-md"
                                    >Fetch report</button>
                                </form>
                            </div>))}
                            {currentTab==='weekly' && !showForm && weeklyData && Object.keys(weeklyData).length>0 &&(
                                <div className='flex justify-center w-screen items-center'>
                                    <div className='flex items-center justify-center w-full max-w-md mt-4'>
                                    <div className='bg-gray-200 flex flex-col justify-center rounded-lg p-6 space-y-2  w-full border-gray-400 max-wd-md mx-auto shadow-lg'>
                                        <h2 className='text-2xl font-bold mb-4 border-b pb-2 text-gray-800'>Weekly report</h2>
                                        <div className='flex justify-between'>
                                            <span>Food:</span>
                                            <span>₹{weeklyData.totalFood ||0}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span>Travel:</span>
                                            <span>₹{weeklyData.totalTravel ||0}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span>Entertainment:</span>
                                            <span>₹{weeklyData.totalEntertainment||0}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span>Shopping:</span>
                                            <span>₹{weeklyData.totalShopping ||0}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span>Others:</span>
                                            <span>₹{weeklyData.totalOthers ||0}</span>
                                        </div>
                                        <div className='mt-4 pt-2 border-t text-xl font-bold text-gray-800 flex justify-between'>
                                            <span>Total expense:</span>
                                            <span>₹{weeklyData.totalAmount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                </div>
                                
                                    
                                )}
                                {currentTab==='weekly' && !showForm && (!weeklyData || Object.keys(weeklyData).length===0) &&
                                    (<div className='bg-red-100 text-red-700 p-4 rounded shadow max-w-md mx-auto'>No data for this range</div>)}
                        
                    {currentTab==="monthly" &&
                            <div className="bg-gray-200 flex flex-col justify-center items-center rounded w-full mb-6 max-w-md mx-4 px-5 sm:mx-auto">
                                <h2 className="text-2xl mb-4 mt-4 font-bold">Enter month and year</h2>
                                <form  className="w-full py-6">
                                    <div className="mb-4">
                                        <label className="text-sm text-gray-800 mb-1 font-bold block">Month</label>
                                        <select
                                            value={month}
                                            onChange={(e)=>setMonth(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                        <option value="">Select month</option>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July',
                                             'August', 'September', 'October', 'November', 'December'].map((m)=>(
                                                <option key={m} value={m}>{m}</option>
                                             ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-sm text-gray-800 mb-1 font-bold block">Year</label>
                                        <input 
                                            type="number"
                                            value={year}
                                            onChange={(e)=>setYear(e.target.value)}
                                            placeholder="Enter year"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full bg-gray-600 text-white font-bold hover:bg-blue-500 p-1 rounded shadow-md"
                                    >Fetch report</button>
                                </form>
                            </div>
                    }
                    {currentTab==="occasional" &&
                        <div className='bg-gray-200 flex flex-col justify-center items-center rounded w-full mb-6 max-w-md mx-4 px-5 sm:mx-auto'>
                            <h1 className='text-gray-800 text-2xl mb-4 mt-4 font-bold'>Enter year</h1>
                            <form className='w-full py-6'>
                                <div className='mb-4'>
                                    <label className="text-sm text-gray-800 mb-1 font-bold block">Year</label>
                                        <input 
                                            type="number"
                                            value={year}
                                            onChange={(e)=>setYear(e.target.value)}
                                            placeholder="Enter year"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                </div>
                                <button 
                                        type="submit"
                                        className="w-full bg-gray-600 text-white font-bold hover:bg-blue-500 p-1 rounded shadow-md"
                                    >Fetch report</button>
                            </form>
                        </div>
                    }
                    {currentTab==="compare" &&
                            <div className="bg-gray-200 flex flex-col justify-center items-center rounded w-full mb-6 max-w-md mx-4 px-5 sm:mx-auto">
                                <form  className="w-full py-6">
                                    <div className="mb-4">
                                        <h1 className="text-2xl mb-4 mt-4 font-bold">Enter first month and year</h1>
                                        <label className="text-sm text-gray-800 mb-1 font-bold block">Month</label>
                                        <select
                                            value={month1}
                                            onChange={(e)=>setMonth1(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                        <option value="">Select month</option>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July',
                                             'August', 'September', 'October', 'November', 'December'].map((m)=>(
                                                <option key={m} value={m}>{m}</option>
                                             ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-sm text-gray-800 mb-1 font-bold block">Year</label>
                                        <input 
                                            type="number"
                                            value={year1}
                                            onChange={(e)=>setYear1(e.target.value)}
                                            placeholder="Enter year"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <h1 className="text-2xl mb-4 mt-4 font-bold">Enter second month and year</h1>
                                        <label className="text-sm text-gray-800 mb-1 font-bold block">Month</label>
                                        <select
                                            value={month2}
                                            onChange={(e)=>setMonth2(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                        <option value="">Select month</option>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July',
                                             'August', 'September', 'October', 'November', 'December'].map((m)=>(
                                                <option key={m} value={m}>{m}</option>
                                             ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-sm text-gray-800 mb-1 font-bold block">Year</label>
                                        <input 
                                            type="number"
                                            value={year2}
                                            onChange={(e)=>setYear2(e.target.value)}
                                            placeholder="Enter year"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full bg-gray-600 text-white font-bold hover:bg-blue-500 p-1 rounded shadow-md"
                                    >Fetch report</button>
                                </form>
                            </div>
                    }
            
        </div>
    );
};
export default ReportPage;