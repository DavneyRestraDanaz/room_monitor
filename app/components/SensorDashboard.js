"use client";

import { useEffect, useState, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables); // Register all necessary components

async function fetchSensorData() {
    const response = await fetch('http://localhost:3000/api/sensors'); // Fetch from Next.js API
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data; // Assuming the response format
}

export default function SensorDashboard() {
    const [sensorData, setSensorData] = useState([]);
    const chartRef = useRef(null); // Reference to the chart element

    useEffect(() => {
        const fetchDataAndRenderChart = async () => {
            const data = await fetchSensorData();
            setSensorData(data); // Store sensor data in state

            // Prepare data for the chart
            const labels = data.map(sensor => new Date(sensor.created_at).toLocaleString());
            const temperatureData = data.map(sensor => sensor.temperature);
            const humidityData = data.map(sensor => sensor.humidity);

            // Create chart
            const ctx = chartRef.current.getContext("2d");
            const chart = new Chart(ctx, {
                type: "line", // Choose the chart type
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Temperature",
                            data: temperatureData,
                            borderColor: "red",
                            borderWidth: 2,
                            fill: false,
                        },
                        {
                            label: "Humidity",
                            data: humidityData,
                            borderColor: "blue",
                            borderWidth: 2,
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Time",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Values",
                            },
                        },
                    },
                },
            });

            return () => {
                // Cleanup chart on component unmount
                if (chart) {
                    chart.destroy();
                }
            };
        };

        fetchDataAndRenderChart().catch(console.error);
    }, []); // Empty dependency array to run only on mount

    return (
        <div>
            <header>
                <h1>Room Monitoring Dashboard</h1>
            </header>

            <section className="sensor-data">
                <div className="sensor temperature-sensor">
                    <h3>Temperature</h3>
                    <p>Value: <span>{sensorData.length > 0 ? sensorData[sensorData.length - 1].temperature : "Loading..."}</span></p>
                </div>

                <div className="sensor humidity-sensor">
                    <h3>Humidity</h3>
                    <p>Value: <span>{sensorData.length > 0 ? sensorData[sensorData.length - 1].humidity : "Loading..."}</span></p>
                </div>

                <div className="sensor water-sensor">
                    <h3>Water Sensor</h3>
                    <p>Status: <span>{sensorData.length > 0 ? (sensorData[sensorData.length - 1].water_sensor ? "Detected" : "Not Detected") : "Loading..."}</span></p>
                </div>

                <div className="sensor pir-sensor">
                    <h3>PIR Sensor</h3>
                    <p>Status: <span>{sensorData.length > 0 ? (sensorData[sensorData.length - 1].sensor_pir ? "Motion Detected" : "No Motion") : "Loading..."}</span></p>
                </div>

                <div className="sensor fire-sensor">
                    <h3>Fire Sensor</h3>
                    <p>Status: <span>{sensorData.length > 0 ? (sensorData[sensorData.length - 1].sensor_api ? "Fire Detected" : "No Fire") : "Loading..."}</span></p>
                </div>

                <div className="sensor servo-status">
                    <h3>Servo Status</h3>
                    <p>Status: <span>{sensorData.length > 0 ? (sensorData[sensorData.length - 1].servo ? "Closed" : "Locked") : "Loading..."}</span></p>
                </div>
            </section>

            <section className="charts">
                <div className="chart-container">
                    <h2>Temperature and Humidity Chart</h2>
                    <canvas ref={chartRef} width="400" height="200"></canvas> {/* Canvas for Chart.js */}
                </div>
            </section>
        </div>
    );
}
