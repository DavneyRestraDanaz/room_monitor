// app/api/sensors/route.js
import { Pool } from 'pg';

// Koneksi database PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// API untuk menambahkan data sensor
export async function POST(req) {
    const body = await req.json();
    const { temperature, humidity, water_sensor, sensor_pir, sensor_api, servo } = body;

    // Validasi input
    const missingFields = validateSensorData(body);
    if (missingFields) {
        return new Response(JSON.stringify({ success: false, message: `Missing fields: ${missingFields.join(', ')}` }), { status: 400 });
    }

    try {
        // Menyimpan data sensor ke database
        const query = `
            INSERT INTO sensors (temperature, humidity, water_sensor, sensor_pir, sensor_api, servo, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [temperature, humidity, water_sensor, sensor_pir, sensor_api, new Date().toISOString()];

        const { rows } = await pool.query(query, values);

        return new Response(JSON.stringify({ success: true, message: "Sensor data added successfully!", data: rows[0] }), { status: 201 });
    } catch (error) {
        console.error("Error inserting sensor data:", error);
        return new Response(JSON.stringify({ success: false, message: "Failed to add sensor data due to a database error." }), { status: 500 });
    }
}

// API untuk mengambil semua data sensor
export async function GET() {
    try {
        const { rows } = await pool.query('SELECT * FROM sensors;');
        return new Response(JSON.stringify({ success: true, data: rows }), { status: 200 });
    } catch (error) {
        console.error("Error fetching sensors data:", error);
        return new Response(JSON.stringify({ success: false, message: "Failed to retrieve sensor data due to a database error." }), { status: 500 });
    }
}

// Fungsi untuk validasi data
function validateSensorData(data) {
    const requiredFields = ['temperature', 'humidity', 'water_sensor', 'sensor_pir', 'sensor_api', 'servo'];
    const missingFields = requiredFields.filter(field => data[field] === undefined);
    return missingFields.length > 0 ? missingFields : null;
}
