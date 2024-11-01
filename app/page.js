// app/page.js
import './fonts/globals.css'; // Ensure your global styles are imported
import SensorDashboard from './components/SensorDashboard';

export default function Home() {
    return (
        <div>
            <h1>Sensor Dashboard</h1>
            <SensorDashboard />
        </div>
    );
}
