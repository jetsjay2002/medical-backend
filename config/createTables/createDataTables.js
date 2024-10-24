const pool = require('../db');

const createDataTables = async () => {
    const client = await pool.connect();
    try {

        const createPackagesTable = `
            CREATE TABLE IF NOT EXISTS Packages (
                PackagesID VARCHAR(4) PRIMARY KEY,
                packageName VARCHAR(255) NOT NULL,
                description TEXT,
                price NUMERIC(10,2) NOT NULL,
                image VARCHAR(255), 
                target_audience TEXT,
                purpose TEXT
            );
        `;
        await client.query(createPackagesTable);
        console.log('Packages table created successfully');

        const insertPackageQuery = `
            INSERT INTO Packages (PackagesID, packageName, description, price, image, target_audience, purpose)
            VALUES
                ('0001', 'Health Check Basic', 'Basic health check package', 99.99, 'https://wellmedbangkok.com/wp-content/uploads/2023/06/AW_Packages-04.jpg', 'General Public', 'Preventive Health'),
                ('0002', 'Dental Care Package', 'Comprehensive dental care package', 199.99, 'https://www.letssmile-dent.com/wp-content/uploads/2019/07/cover-page-Eng-04.jpg', 'Adults', 'Dental Health'),
                ('0003', 'Cardiac Health Package', 'Cardiac health screening package', 299.99, 'https://www.indushealthplus.com/front/media/package_img/thumbnail_image/1717743284_cardiac-health-checkup-package-superia.jpg', 'Adults', 'Heart Health')
            ON CONFLICT (PackagesID) DO NOTHING;

        `;
        await client.query(insertPackageQuery);
        console.log('Insert Packages created successfully');

        const createDoctorsTable = `
            CREATE TABLE IF NOT EXISTS Doctors (
                DoctorsID VARCHAR(4) PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                image VARCHAR(255), 
                biography TEXT,
                speciality VARCHAR(255),
                language VARCHAR(255),
                education TEXT,
                qualification TEXT
            );
        `;
        await client.query(createDoctorsTable);
        console.log('Doctor table created successfully');

        const insertDoctorQuery = `
                INSERT INTO Doctors (DoctorsID, first_name, last_name, image, biography, speciality, language, education, qualification)
                VALUES 
                    ('0001', 'Passaratep', 'Anurukpaliboon', 'https://www.phuketinternationalhospital.com/en/wp-content/uploads/sites/4/2016/10/%E0%B8%94%E0%B8%A3.%E0%B8%99%E0%B8%9E.%E0%B8%A0%E0%B8%B1%E0%B8%AA%E0%B8%A3%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A2-2.png', 'Dr. Passaratep Anurukpaliboon is a renowned cardiologist in America, with 20 years of experience in the field.', 'Cardiologist', 'Thai, English', 'Faculty of Medicine Prince of Songkla University', 'Orthodontics branch Prince of Songkla University'),
                    ('0002', 'Sithiporn', 'Teachatamanant', 'https://www.phuketinternationalhospital.com/en/wp-content/uploads/sites/4/2016/10/%E0%B8%99%E0%B8%9E.%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%9E%E0%B8%A3-01.png', 'Dr. Sithiporn Teachatamanant is an expert in dental surgery.', 'Dental Surgeon', 'Thai, English', 'Chulalongkorn University', 'Certified Oral Surgeon'),
                    ('0003', 'Sanguan', 'Kunaporn', 'https://www.phuketinternationalhospital.com/en/wp-content/uploads/sites/4/2016/10/DR.SANGUAN.png', 'Dr. Sanguan Kunaporn specializes in plastic surgery.', 'Plastic Surgeon', 'English, French', 'Harvard Medical School', 'Board Certified in Plastic Surgery')
                ON CONFLICT (DoctorsID) DO NOTHING;
        `;
        await client.query(insertDoctorQuery);
        console.log('Doctors inserted successfully');


        const createProcedureRequestTable = `
            CREATE TABLE IF NOT EXISTS ProcedureRequests (
                ProcedureID VARCHAR(7) PRIMARY KEY,
                HN VARCHAR(13) NOT NULL REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                DoctorsID VARCHAR(4) REFERENCES Doctors(DoctorsID),
                PackagesID VARCHAR(4) REFERENCES Packages(PackagesID),
                status VARCHAR(255),
                procedure VARCHAR(255),
                surgeon VARCHAR(255),
                Additional TEXT,
                SurgeryDate DATE,
                ArriveDate DATE,
                DepartureDate DATE,
                DateRequest TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createProcedureRequestTable);
        console.log('Procedure Requests table created successfully');


        const creatHabitTable = `
            CREATE TABLE IF NOT EXISTS Habits (
                ProcedureID VARCHAR(7) PRIMARY KEY REFERENCES ProcedureRequests(ProcedureID) ON DELETE CASCADE,
                HN VARCHAR(13) REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                smoking VARCHAR(255),
                drinking VARCHAR(255)
            );
        `;
        await client.query(creatHabitTable);
        console.log('Habit table created successfully');


        const creatWomanTable = `
            CREATE TABLE IF NOT EXISTS WomenForms (
                ProcedureID VARCHAR(7) PRIMARY KEY REFERENCES ProcedureRequests(ProcedureID) ON DELETE CASCADE,
                HN VARCHAR(13) REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                birth_control_pills VARCHAR(255),
                pregnant VARCHAR(255),
                plan_pregnancies VARCHAR(255),
                age_child INT,
                last_breastfed DATE
            );
        `;
        await client.query(creatWomanTable);
        console.log('Women Form table created successfully');


        const creatBreastSurgeryTable = `
            CREATE TABLE IF NOT EXISTS BreastSurgeryDetails (
                ProcedureID VARCHAR(7) PRIMARY KEY REFERENCES ProcedureRequests(ProcedureID) ON DELETE CASCADE,
                HN VARCHAR(13) REFERENCES PatientDetails(HN) ON DELETE CASCADE,
                bra_size INT,
                request_size INT,
                desired_placement TEXT,
                desired_implant TEXT,
                desired_incision TEXT,
                expected_outcome TEXT
            );
        `;
        await client.query(creatBreastSurgeryTable);
        console.log('BreastSurgery Form table created successfully');


    } catch (err) {
        console.error('Error creating data table:', err);
    } finally {
        client.release();
    }
};

module.exports = { createDataTables };
