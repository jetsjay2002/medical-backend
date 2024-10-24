const pool = require('../config/db');

// Get list of doctors
const getDoctors = async (req, res) => {
    try {
        const result = await pool.query('SELECT DoctorsID, first_name, last_name, image FROM Doctors');
        const doctors = result.rows;
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getDoctorDetails = async (req, res) => {
    const { doctorId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM Doctors WHERE DoctorsID = $1', [doctorId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const selectDoctor = async (req, res) => {
    console.log('Incoming request to select doctor:', req.body);  // Log request body

    const { doctorId, procedureId } = req.body;

    try {
        // Assuming the procedure already exists and we're updating it with the doctor selection
        const query = `
            UPDATE ProcedureRequests
            SET DoctorsID = $1
            WHERE ProcedureID = $2 RETURNING ProcedureID;
        `;
        const values = [doctorId, procedureId];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Procedure not found' });
        }

        res.status(200).json({ message: 'Doctor selected successfully', procedure: result.rows[0] });
    } catch (error) {
        console.error('Error updating ProcedureRequests:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
    getDoctors,
    getDoctorDetails,
    selectDoctor
};
