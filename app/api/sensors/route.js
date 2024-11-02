import { Pool } from 'pg';
import Cors from 'next-cors';

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

async function applyCors(req) {
    await Cors(req, {
        methods: ['GET', 'POST', 'OPTIONS'], // Metode yang diizinkan
        origin: '*', // Ganti dengan domain spesifik jika perlu
        allowedHeaders: ['Content-Type'], // Header yang diizinkan
    });
}

export async function POST(req) {
    await applyCors(req); // Terapkan CORS sebelum memproses permintaan
    const body = await req.json();
    const { temperature, humidity, water_sensor, sensor_pir, sensor_api, servo } = body;

    const missingFields = validateSensorData(body);
    if (missingFields) {
        return new Response(
            JSON.stringify({ success: false, message: `Missing fields: ${missingFields.join(', ')}` }),
            { status: 400 }
        );
    }

    try {
        const query = `
            INSERT INTO sensors (temperature, humidity, water_sensor, sensor_pir, sensor_api, servo, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [temperature, humidity, water_sensor, sensor_pir, sensor_api, servo, new Date().toISOString()];
        const { rows } = await pool.query(query, values);

        return new Response(
            JSON.stringify({ success: true, message: "Sensor data added successfully!", data: rows[0] }),
            { status: 201 }
        );
    } catch (error) {
        console.error("Error inserting sensor data:", error.message);
        return new Response(
            JSON.stringify({ success: false, message: "Failed to add sensor data due to a database error." }),
            { status: 500 }
        );
    }
}

export async function GET(req) {
    await applyCors(req); // Terapkan CORS sebelum memproses permintaan
    try {
        const { rows } = await pool.query('SELECT * FROM sensors;');
        return new Response(JSON.stringify({ success: true, data: rows }), { status: 200 });
    } catch (error) {
        console.error("Error fetching sensors data:", error.message);
        return new Response(
            JSON.stringify({ success: false, message: "Failed to retrieve sensor data due to a database error." }),
            { status: 500 }
        );
    }
}

export async function OPTIONS(req) {
    await applyCors(req); // Terapkan CORS untuk OPTIONS
    return new Response(null, { status: 204 });
}

function validateSensorData(data) {
    const requiredFields = ['temperature', 'humidity', 'water_sensor', 'sensor_pir', 'sensor_api', 'servo'];
    const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);
    return missingFields.length > 0 ? missingFields : null;
}
