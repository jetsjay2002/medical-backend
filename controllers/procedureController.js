const pool = require('../config/db');

const getProcedureRequestByProcedureId = async (req, res) => {
    const { procedureId } = req.params;

    try {
        const query = `
            SELECT pr.*, 
                   COALESCE(d.first_name || ' ' || d.last_name, 'No doctor') AS doctor_name, 
                   COALESCE(p.packageName, 'No package') AS package_name
            FROM ProcedureRequests pr
            LEFT JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
            LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID
            WHERE pr.procedureId = $1
        `;
        const values = [procedureId];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Procedure request not found' });
        }

        res.json(result.rows[0]);  // Send back the first (and only) row
    } catch (error) {
        console.error('Error fetching procedure request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const saveHabitData = async (procedureId, HN, smoking, drinking) => {
  
  try {
      const query = `
          INSERT INTO Habits (procedureId, HN, smoking, drinking)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (procedureId) 
          DO UPDATE SET smoking = $3, drinking = $4
      `;
      const values = [procedureId, HN, smoking || null, drinking || null];
      await pool.query(query, values);
  } catch (error) {
      console.error('Error saving habit data:', error);
      throw error;
  }
};

const saveWomenFormData = async (procedureId, HN, birthControlPills, pregnant, planningMorePregnancies, ageYoungestChild, lastBreastfed) => {
  try {
      const query = `
          INSERT INTO WomenForms (procedureId, HN, birth_control_pills, pregnant, plan_pregnancies, age_child, last_breastfed)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (procedureId)
          DO UPDATE SET birth_control_pills = $3, pregnant = $4, plan_pregnancies = $5, age_child = $6, last_breastfed = $7
      `;
      const values = [
          procedureId,
          HN,
          birthControlPills || null,
          pregnant || null,
          planningMorePregnancies || null,
          ageYoungestChild || null,
          lastBreastfed || null
      ];
      await pool.query(query, values);
  } catch (error) {
      console.error('Error saving women form data:', error);
      throw error;
  }
};

const saveBreastSurgeryData = async (procedureId, HN, braSize, requestSize, desiredPlacement, desiredImplant, desiredIncision, expectedOutcome) => {
  try {
      const query = `
          INSERT INTO BreastSurgeryDetails (procedureId, HN, bra_size, request_size, desired_placement, desired_implant, desired_incision, expected_outcome)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (procedureId)
          DO UPDATE SET bra_size = $3, request_size = $4, desired_placement = $5, desired_implant = $6, desired_incision = $7, expected_outcome = $8
      `;
      const values = [
          procedureId,
          HN,
          braSize || null,
          requestSize || null,
          desiredPlacement || null,
          desiredImplant || null,
          desiredIncision || null,
          expectedOutcome || null
      ];
      await pool.query(query, values);
  } catch (error) {
      console.error('Error saving breast surgery data:', error);
      throw error;
  }
};


const saveProcedureDetails = async (req, res) => {
  const { procedureId, HN, habitData, womenFormData, breastFormData, additional_comments, preferred_surgery_date, arrive_date, departure_date, procedure, surgeon } = req.body;

  try {
    // Update ProcedureRequests table with additional information, procedure, and surgeon name
    const updateProcedureQuery = `
      UPDATE ProcedureRequests
      SET Additional = $1, SurgeryDate = $2, ArriveDate = $3, DepartureDate = $4, procedure = $5, surgeon = $6, status = 'Waiting for Approval'
      WHERE ProcedureID = $7
    `;
    await pool.query(updateProcedureQuery, [
      additional_comments || null,
      preferred_surgery_date || null,
      arrive_date || null,
      departure_date || null,
      procedure || null,
      surgeon || null,
      procedureId
    ]);

    // Save Habit data
    await saveHabitData(procedureId, HN, habitData.smoking, habitData.drinking);

    // Save Women Form data
    await saveWomenFormData(
      procedureId,
      HN,
      womenFormData.birthControlPills,
      womenFormData.pregnant,
      womenFormData.planningMorePregnancies,
      womenFormData.ageYoungestChild,
      womenFormData.lastBreastfed
    );

    // Save Breast Surgery Details
    await saveBreastSurgeryData(
      procedureId,
      HN,
      breastFormData.braSize,
      breastFormData.requestSize,
      breastFormData.desiredPlacement,
      breastFormData.desiredImplant,
      breastFormData.desiredIncision,
      breastFormData.expectedOutcome
    );

    res.status(200).json({ message: 'Procedure details saved successfully' });
  } catch (error) {
    console.error('Error saving procedure details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getProcessTreatmentData = async (req, res) => {
  const { HN, procedureId } = req.params;

  try {
      const query = `
          SELECT 
              pr.status, 
              pr.ProcedureID, 
              d.first_name || ' ' || d.last_name AS doctor_name,
              p.packageName, 
              c.Hospital AS hospital_name
          FROM ProcedureRequests pr
          LEFT JOIN Doctors d ON pr.DoctorsID = d.DoctorsID
          LEFT JOIN Packages p ON pr.PackagesID = p.PackagesID
          LEFT JOIN Clinic c ON pr.HN = c.HN  -- Join using HN
          WHERE pr.HN = $1 AND pr.ProcedureID = $2
      `;

      const values = [HN, procedureId];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Data not found' });
      }

      res.json(result.rows[0]); // Return the result from the database
  } catch (error) {
      console.error('Error fetching process treatment data:', error);
      res.status(500).json({ message: 'Server error' });
  }
};



// Update procedure and travel details
const updateProcedureAndTravelDetails = async (req, res) => {
  const { procedureId } = req.params;
  const { surgeryDate, arrivalDate, departureDate } = req.body;

  const client = await pool.connect();
  try {
      await client.query('BEGIN');

      // Update SurgeryDate in ProcedureRequests table
      const updateProcedureQuery = `
          UPDATE ProcedureRequests
          SET SurgeryDate = $1
          WHERE ProcedureID = $2
      `;
      await client.query(updateProcedureQuery, [surgeryDate, procedureId]);

      // Update ArrivalDate and DepartureDate in TravelDetails table
      const updateTravelQuery = `
          UPDATE TravelDetails
          SET arrival_date = $1, departure_date = $2
          WHERE ProcedureID = $3
      `;
      await client.query(updateTravelQuery, [arrivalDate, departureDate, procedureId]);

      await client.query('COMMIT');
      res.status(200).json({ message: 'Procedure and travel details updated successfully' });
  } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating procedure and travel details:', error);
      res.status(500).json({ error: 'Failed to update procedure and travel details' });
  } finally {
      client.release();
  }
};


module.exports = {
    getProcedureRequestByProcedureId,
    saveProcedureDetails,
    getProcessTreatmentData,
    updateProcedureAndTravelDetails 
};
