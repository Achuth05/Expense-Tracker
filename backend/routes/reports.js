const express=require('express');
const mongoose=require('mongoose');
const router=express.Router();
const auth = require('../middleware/auth');
const daily=require('../models/DailyExp');
const monthly=require('../models/MonthlyBill');
const nonRegular=require('../models/NonRegular');
router.get('/weekly/:id', auth, async(req,res)=>{
    try{
        const id=req.params.id;
        const {startDate, endDate}=req.query;
        if(!startDate||!endDate){
            return res.status(400).json({msg:"Start and end dates are required"});
        }
        const start=new Date(startDate);
        const end= new Date(endDate);
        end.setHours(23, 59, 59, 999);
        console.log("Received startdate and enddate", startDate, endDate);
        console.log("Converted to",start, end);
        const weeklyExpense= await daily.aggregate([
            {
                $match:{
                userId: new mongoose.Types.ObjectId(id),
                date: {$gte:start, $lte:end}
                }
            },
            {
                 $group:{
                    _id:null,
                    totalFood:{$sum:'$food'},
                    totalTravel:{$sum:'$travel'},
                    totalEntertainment:{$sum:'$entertainment'},
                    totalShopping:{$sum:'$shopping'},
                    totalOthers:{$sum:'$others'},
                    totalAmount:{$sum:'$total'}
                }
            }
        ]);

        res.status(200).json({msg:'Weekly report', data:weeklyExpense[0]||{}});

    }
    catch(error){
        console.error("Error in weekly route:", error);
        res.status(500).json({msg:'Server error'});    
    }
});
router.get('/monthly/:id/:month/:year', auth, async(req,res)=>{
    try{
        const id=req.params.id;
        const reqMonth=req.params.month;
        const reqYear=parseInt(req.params.year);
        const currentDate=new Date();
        const months = [
           'January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December'
        ];
        if(currentDate.getMonth()==months.indexOf(reqMonth) && currentDate.getFullYear()==reqYear){
            res.status(400).json({msg:'Report not generated'});
            return;
        }
        else{
            const monthlyExpense=await monthly.aggregate([
                {
                    $match:{
                        userId: new mongoose.Types.ObjectId(id),
                        month:reqMonth,
                        year:reqYear
                    }
                },
                {
                    $group:{
                         _id:null,
                        totalElectricity:{$sum:'$electricity'},
                        totalWater:{$sum:'$water'},
                        totalRent:{$sum:'$rent'},
                        totalOthers:{$sum:'$others'},
                        totalMonthly:{$sum:'$total'}
                    }
                }
            ]);
            res.status(200).json({msg:'Monthly report',data:monthlyExpense[0]||{}});
        }
    }
    catch(error){
        res.status(400).send('Report failed');
    }
 }); 

router.get('/occasional/:id/:year', auth, async(req, res)=>{
    try{
        const id=req.params.id;
        const year=parseInt(req.params.year);
        const occasional=await nonRegular.aggregate([
            {
                $match:{
                    userId: new mongoose.Types.ObjectId(id),
                    $expr:{
                        $eq:[{$year:"$date"}, parseInt(year)]
                    }
                }
            },
            {
                $group:{
                    _id:null,
                    totalInsurance:{$sum:"$insurance"},
                    totalSchoolFee:{$sum:"$schoolFee"},
                    totalRepair:{$sum:"$repair"},
                    totalOccasional:{$sum:"$total"}
                }
            }
        ]);
        res.status(200).json({msg:"Occasional report", data:occasional[0]||{}});
    }
    catch(error){
        res.status(400).send("Report failed");
    }
});
   
router.get('/compare/:id/:month1/:year1/:month2/:year2', auth, async(req,res)=>{
    try{
        const{id, month1, month2}=req.params;
        const year1=parseInt(req.params.year1);
        const year2=parseInt(req.params.year2);
        const compare=await monthly.aggregate([
            {
                $match:{
                    userId: new mongoose.Types.ObjectId(id),
                    $or:[
                        {month:month1, year:parseInt(year1)},
                        {month:month2, year:parseInt(year2)}
                    ]
                }
            },
            {
                $group:{
                    _id:{month:"$month",year:"$year"},
                    totalElectricity:{$sum:'$electricity'},
                    totalWater:{$sum:'$water'},
                    totalRent:{$sum:'$rent'},
                    totalOthers:{$sum:'$others'},
                    totalMonthly:{$sum:'$total'}
                }
            }
        ]);
        if(compare.length<2){
            res.status(400).send("Insufficient data");
            return;
        }
        else{
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            compare.sort((a, b) => {
                const y1 = a._id.year, y2 = b._id.year;
                const m1 = months.indexOf(a._id.month), m2 = months.indexOf(b._id.month);
                if (y1 !== y2) return y1 - y2;
                return m1 - m2;
            });
            const [monthA, monthB] = compare;
            const fields = ['totalElectricity', 'totalWater', 'totalRent', 'totalOthers'];
            const differences={};
            fields.forEach(field=>{
                const value1=monthA[field]||0;
                const value2=monthB[field]||0;
                const diff=Math.abs(value1-value2);
                const greater=value1===value2?'Equal':(value1>value2?monthA._id.month:monthB._id.month);
                differences[field]={
                    [`${monthA._id.month}, ${monthA._id.year}`]:value1,
                    [`${monthB._id.month}, ${monthB._id.year}`]:value2,
                    difference:diff,
                    moreIn:greater
                };
            });

            const subFields = ['totalElectricity', 'totalWater', 'totalRent', 'totalOthers'];
            let maxDiff = 0;
            let spike = '';

            
            subFields.forEach(field => {
                const value1 = monthA[field] || 0;
                const value2 = monthB[field] || 0;
                const diff = Math.abs(value1 - value2);

                if (diff > maxDiff) {
                    maxDiff= diff;
                    spike=field.replace('total', '');
                }
            });

            
            res.status(200).json({
                totalComp:{
                    [`${monthA._id.month}, ${monthA._id.year}`]:monthA.totalMonthly,
                    [`${monthB._id.month}, ${monthB._id.year}`]:monthB.totalMonthly,
                    difference:Math.abs(monthA.totalMonthly-monthB.totalMonthly),
                    more:monthA.totalMonthly>monthB.totalMonthly?`${monthA._id.month}, ${monthA._id.year}`:`${monthB._id.month}, ${monthB._id.year}`,
                    reason: spike ? `Major difference was in ${spike}` : 'No significant spike'
                },
                individual:differences
            });
        }
        
    }
    catch(error){
        res.status(400).send('Comparison failed');
    }
});

router.get('/summary/:id', auth, async(req,res)=>{
    const getMonthName=(monthNo)=>{
        const months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October', 'November', 'December'];
        return months[monthNo];
    }
    try{
        const id=req.params.id;
        const currDate=new Date();
        const currMonth=currDate.getMonth();
        const currYear=currDate.getFullYear();
        const monthName=getMonthName(currMonth);
        const [dailySum, monthlySum, occasionalSum]= await Promise.all([
            daily.aggregate([
                {
                    $match:{
                        userId: new mongoose.Types.ObjectId(id),
                        $expr:{
                            $and:[
                                {$eq:[{$month:"$date"}, currMonth+1]},
                                {$eq:[{$year:"$date"}, currYear]}
                            ]
                        }
                    }
                },
                {
                    $group:{_id:null, total:{$sum:"$total"}}
                }
            ]),
            monthly.aggregate([
                {
                    $match:{
                        userId:new mongoose.Types.ObjectId(id),
                        month:getMonthName(currMonth),
                        year:currYear
                    }
                },
                {
                    $group:{_id:null, total:{$sum:"$total"}}
                }
            ]),
            nonRegular.aggregate([
                {
                    $match:{
                        userId: new mongoose.Types.ObjectId(id),
                        $expr:{
                            $and:[
                                {$eq:[{$month:"$date"}, currMonth+1]},
                                {$eq:[{$year:"$date"}, currYear]}
                            ]
                        }
                    }
                },
                {
                    $group:{_id:null, total:{$sum:"$total"}}
                }
            ])
        ]);
        res.json({
            month:monthName,
            dailySum:dailySum[0]?.total || 0,
            monthlySum:monthlySum[0]?.total || 0,
            occasionalSum:occasionalSum[0]?.total || 0,
            total:(dailySum[0]?.total || 0)+(monthlySum[0]?.total || 0)+(occasionalSum[0]?.total || 0)
        });
    }
    catch(err){
         console.error("Failed to fetch current summary", err);   
    }
})

module.exports=router;
