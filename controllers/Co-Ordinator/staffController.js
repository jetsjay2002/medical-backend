const pool = require('../../config/db');

const getStatusCounts = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(CASE WHEN status = 'Flight Delay' THEN 1 END) AS flightDelay,
                COUNT(CASE WHEN status = 'Flight Cancel' THEN 1 END) AS flightCancel,
                COUNT(CASE WHEN status = 'On Board' THEN 1 END) AS onBoard,
                COUNT(CASE WHEN status = 'Arrival' THEN 1 END) AS arrival,
                COUNT(CASE WHEN status = 'Waiting for Approval' THEN 1 END) AS waitingForApproval,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) AS approved,
                COUNT(CASE WHEN status = 'Operation' THEN 1 END) AS operation,
                COUNT(CASE WHEN status = 'Recuperate' THEN 1 END) AS recuperate,
                COUNT(CASE WHEN status = 'Departure' THEN 1 END) AS departure
            FROM ProcedureRequests;
        `;
        
        const result = await pool.query(query);
        const counts = result.rows[0];
        
        res.json(counts);
    } catch (error) {
        console.error('Error fetching status counts:', error);
        res.status(500).json({ error: 'Failed to fetch status counts' });
    }
};

const getAllProcedures = async (req, res) => {
    try {
        const validStatuses = [
            'Waiting for Approval',
            'Approved',
            'Flight Cancel',
            'Flight Delay',
            'On Board',
            'Arrival',
            'Operation',
            'Recuperate',
            'Departure'
        ];

        const query = `
            SELECT 
                pr.ProcedureID,
                pd.first_name || ' ' || pd.last_name AS patient_name,
                p.packageName,
                COALESCE(MAX(tb.taxi_status), '-') AS taxi_status, -- Use MAX to pick one taxi_status
                COALESCE(MAX(hb.hotel_status), '-') AS hotel_status, -- Use MAX to pick one hotel_status
                pr.status AS procedure_status,
                pr.surgeon,
                pr.ArriveDate,
                pr.DepartureDate
            FROM ProcedureRequests pr
            JOIN PatientDetails pd ON pr.HN = pd.HN
            JOIN Packages p ON pr.PackagesID = p.PackagesID
            LEFT JOIN TaxiBookings tb ON pr.ProcedureID = tb.ProcedureID
            LEFT JOIN HotelBookings hb ON pr.ProcedureID = hb.ProcedureID
            WHERE pr.status = ANY($1::text[])
            GROUP BY pr.ProcedureID, pd.first_name, pd.last_name, p.packageName, pr.status, pr.surgeon, pr.ArriveDate, pr.DepartureDate
            ORDER BY pr.ProcedureID ASC;
        `;

        const result = await pool.query(query, [validStatuses]);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows); // Returning all rows
        } else {
            res.status(404).json({ message: 'No procedures found' });
        }

    } catch (err) {
        console.error('Error fetching procedures:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// const getReplyCounts = async (req, res) => {
//     try {
//         // Query to get ReplyID and DateReply for each reply where HN has an AgentID
//         const query = `
//             SELECT rm.ReplyID, rm.DateReply
//             FROM ReplyMessage AS rm
//             INNER JOIN UserAccount AS ua ON rm.HN = ua.HN
//             WHERE ua.AgentID IS NOT NULL;
//         `;

//         const result = await pool.query(query);
//         const replies = result.rows; // This will return an array of ReplyID and DateReply

//         return res.status(200).json({ replies });
//     } catch (error) {
//         console.error('Error fetching replies and DateReply by HN and AgentID:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };

// const getReplyCounts = async (req, res) => {
//     try {
//         // Step 1: Count how many users replied per day (group by DateReply)
//         const countUsersByDateQuery = `
//             SELECT 
//                 TO_CHAR(rm.DateReply, 'YYYY-MM-DD') AS replyDate,  -- Format the date
//                 COUNT(DISTINCT ua.HN) AS userCount,                 -- Count distinct users (HN)
//                 COUNT(DISTINCT rm.ReplyID) AS replyIdCount          -- Count distinct ReplyID
//             FROM ReplyMessage AS rm
//             INNER JOIN UserAccount AS ua ON rm.HN = ua.HN
//             WHERE ua.AgentID IS NOT NULL
//             GROUP BY TO_CHAR(rm.DateReply, 'YYYY-MM-DD')
//             ORDER BY replyDate;
//         `;

//         const result = await pool.query(countUsersByDateQuery);
//         const replyCountsByDate = result.rows; // Array of reply counts grouped by date

//         return res.status(200).json({
//             replyCountsByDate // Send the grouped data to the frontend
//         });
//     } catch (error) {
//         console.error('Error fetching reply counts by date:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };
// const getReplyCounts = async (req, res) => {
//     try {
//         const countUsersByDateQuery = `
//             SELECT 
//                 TO_CHAR(rm.DateReply, 'YYYY-MM-DD') AS replyDate,  -- Format the date
//                 COUNT(DISTINCT ua.HN) AS userCount,                 -- Count distinct users (HN)
//                 COUNT(rm.ReplyID) AS replyIdCount                   -- Count all ReplyID entries
//             FROM ReplyMessage AS rm
//             INNER JOIN UserAccount AS ua ON rm.HN = ua.HN
//             WHERE ua.AgentID IS NOT NULL
//             GROUP BY TO_CHAR(rm.DateReply, 'YYYY-MM-DD')
//             ORDER BY replyDate;
//         `;

//         const result = await pool.query(countUsersByDateQuery);
//         const replyCountsByDate = result.rows; // Array of reply counts grouped by date

//         return res.status(200).json({
//             replyCountsByDate // Send the grouped data to the frontend
//         });
//     } catch (error) {
//         console.error('Error fetching reply counts by date:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };
// const getReplyCounts = async (req, res) => {
//     try {
//         const countUsersByDateQuery = `
//             SELECT 
//                 TO_CHAR(rm.DateReply, 'YYYY-MM-DD') AS replyDate,  -- Format the date
//                 COUNT(DISTINCT ua.HN) AS userCount,                 -- Count distinct users (HN)
//                 COUNT(rm.ReplyID) AS replyIdCount                   -- Count all ReplyID entries
//             FROM ReplyMessage AS rm
//             INNER JOIN UserAccount AS ua ON rm.HN = ua.HN
//             WHERE ua.AgentID IS NOT NULL
//             GROUP BY TO_CHAR(rm.DateReply, 'YYYY-MM-DD')
//             ORDER BY replyDate;
//         `;

//         const result = await pool.query(countUsersByDateQuery);
//         const replyCountsByDate = result.rows; // Array of reply counts grouped by date

//         return res.status(200).json({
//             replyCountsByDate // Send the grouped data to the frontend
//         });
//     } catch (error) {
//         console.error('Error fetching reply counts by date:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };
const getReplyCounts = async (req, res) => {
    try {
        // Step 1: Count how many users replied and total ReplyID for each day
        const countUsersByDateQuery = `
            SELECT 
                TO_CHAR(rm.DateReply, 'YYYY-MM-DD') AS replyDate,  -- Format the date
                COUNT(DISTINCT ua.HN) AS userCount,                 -- Count distinct users (HN)
                COUNT(rm.ReplyID) AS replyIdCount                   -- Count all ReplyID entries (including duplicates)
            FROM ReplyMessage AS rm
            INNER JOIN UserAccount AS ua ON rm.HN = ua.HN
            WHERE ua.AgentID IS NOT NULL
            GROUP BY TO_CHAR(rm.DateReply, 'YYYY-MM-DD')           -- Group by reply date
            ORDER BY replyDate;
        `;

        const result = await pool.query(countUsersByDateQuery);
        const replyCountsByDate = result.rows; // Array of reply counts grouped by date

        // Step 2: Fetch all users and all reply IDs
        const totalUserQuery = `
            SELECT 
                COUNT(DISTINCT ua.HN) AS totalUsers,               -- Count distinct users overall
                COUNT(rm.ReplyID) AS totalReplies                  -- Count all ReplyID entries overall
            FROM ReplyMessage AS rm
            INNER JOIN UserAccount AS ua ON rm.HN = ua.HN
            WHERE ua.AgentID IS NOT NULL;
        `;

        const totalResult = await pool.query(totalUserQuery);
        const totalCounts = totalResult.rows[0];  // Overall counts (single row)

        return res.status(200).json({
            replyCountsByDate,      // Data grouped by date
            totalUsers: totalCounts.totalusers,  // Total unique users
            totalReplies: totalCounts.totalreplies  // Total reply IDs
        });
    } catch (error) {
        console.error('Error fetching reply counts by date:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const getReplyCountsPatient = async (req, res) => {
    try {
        // Step 1: Count how many users replied and total ReplyID for each day
        const countUsersByDateQuery = `
            SELECT 
                TO_CHAR(rm.DateReply, 'YYYY-MM-DD') AS replyDate,  -- Format the date
                COUNT(DISTINCT ua.HN) AS userCount,                 -- Count distinct users (HN)
                COUNT(rm.ReplyID) AS replyIdCount                   -- Count all ReplyID entries (including duplicates)
            FROM ReplyMessage AS rm
            INNER JOIN UserAccount AS ua ON rm.HN = ua.HN
            WHERE ua.AgentID IS NULL
            GROUP BY TO_CHAR(rm.DateReply, 'YYYY-MM-DD')           -- Group by reply date
            ORDER BY replyDate;
        `;

        const result = await pool.query(countUsersByDateQuery);
        const replyCountsByDate = result.rows; // Array of reply counts grouped by date

        // Step 2: Fetch all users and all reply IDs
        const totalUserQuery = `
            SELECT 
                COUNT(DISTINCT ua.HN) AS totalUsers,               -- Count distinct users overall
                COUNT(rm.ReplyID) AS totalReplies                  -- Count all ReplyID entries overall
            FROM ReplyMessage AS rm
            INNER JOIN UserAccount AS ua ON rm.HN = ua.HN
            WHERE ua.AgentID IS NULL;
        `;

        const totalResult = await pool.query(totalUserQuery);
        const totalCounts = totalResult.rows[0];  // Overall counts (single row)

        return res.status(200).json({
            replyCountsByDate,      // Data grouped by date
            totalUsers: totalCounts.totalusers,  // Total unique users
            totalReplies: totalCounts.totalreplies  // Total reply IDs
        });
    } catch (error) {
        console.error('Error fetching reply counts by date:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



const getNotifyStaff = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ProcedureID, HN, status, procedure, surgeon, SurgeryDate, ArriveDate, DepartureDate, DateRequest
             FROM ProcedureRequests
             ORDER BY DateRequest DESC
             LIMIT 99`
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
}


const getUserByUsernamer = async (req, res) => {
    const { staffid } = req.params; // Extract the StaffID from URL parameters

    try {
        // Fetch user details from the Coordinator table based on username
        const result = await pool.query('SELECT * FROM Coordinator WHERE StaffID = $1', [staffid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Respond with user data
        return res.json({
            firstName: user.firstname,
            lastName: user.lastname,
        });

    } catch (error) {
        console.error('Error fetching user by StaffID:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// Export the controller functions
module.exports = {
    getStatusCounts,
    getAllProcedures,
    getReplyCounts,
    getReplyCountsPatient,
    getNotifyStaff,
    getUserByUsernamer
};
