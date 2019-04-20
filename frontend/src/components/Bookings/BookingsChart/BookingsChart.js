import React from 'react';

import { Bar as BarChart } from 'react-chartjs';

const BOOKINGS_BUCKET = {
    Cheap: {
        min: 0,
        max: 100
    },
    Normal: {
        min: 100,
        max: 200
    },
    Expensive: {
        min: 200,
        max: 100000
    }
};

const bookingsChart = props => {
    let chartData = {
        labels: [],
        datasets: []
    }
    let values = []
    let output = []
    for (const bucket in BOOKINGS_BUCKET){
        const filteredBookingsCount = props.bookings.reduce((prev, current)=>{
            console.log(current)
            if(current.event.price > BOOKINGS_BUCKET[bucket].min && current.event.price < BOOKINGS_BUCKET[bucket].max) {
                return prev + 1
            } else {
                return prev
            }
        }, 0)
        output[bucket] = filteredBookingsCount
        values.push(filteredBookingsCount)
        chartData.labels.push(bucket)
        chartData.datasets.push({
            fillColor: "rgba(220,220,220,0.5)",
			strokeColor: "rgba(220,220,220,0.8)",
			highlightFill: "rgba(220,220,220,0.75)",
			highlightStroke: "rgba(220,220,220,1)",
            data: values
        }) 
        values = [...values]
        values[values.length-1]=0
    }
    console.log(output)

    return (
        <div style={{textAlign:"center"}}>
            <BarChart
                data={chartData}
            />
        </div>
    )
}

export default bookingsChart