import { MigrationInterface, QueryRunner } from "typeorm";
import { randomUUID } from "crypto";

export class SeedInitialData20260508000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed insurance providers
    const providers = [
      {
        name: "CNOPS",
        code: "CNOPS",
        clinicId: "00000000-0000-4000-8000-000000000001",
      },
      {
        name: "CNSS",
        code: "CNSS",
        clinicId: "00000000-0000-4000-8000-000000000001",
      },
      {
        name: "RMA Watanya",
        code: "RMA",
        clinicId: "00000000-0000-4000-8000-000000000001",
      },
      {
        name: "Saham Assurance",
        code: "SAHAM",
        clinicId: "00000000-0000-4000-8000-000000000001",
      },
      {
        name: "AXA Assurance",
        code: "AXA",
        clinicId: "00000000-0000-4000-8000-000000000001",
      },
      {
        name: "Allianz Maroc",
        code: "ALLIANZ",
        clinicId: "00000000-0000-4000-8000-000000000001",
      },
      {
        name: "Wafa Assurance",
        code: "WAFA",
        clinicId: "00000000-0000-4000-8000-000000000001",
      },
      {
        name: "Atlanta Assurance",
        code: "ATLANTA",
        clinicId: "00000000-0000-4000-8000-000000000001",
      },
    ];

    for (const provider of providers) {
      const id = randomUUID();
      await queryRunner.query(
        `INSERT INTO insurance_providers (id, clinic_id, name, code, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
        [id, provider.clinicId, provider.name, provider.code],
      );
    }

    // Seed patients
    const patients = [
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Alice",
        lastName: "Johnson",
        phone: "555-0101",
        email: "alice.j@example.com",
        dateOfBirth: "1985-06-15",
        gender: "FEMALE",
        address: "123 Main St, Springfield",
        allergies: "Penicillin",
        chronicConditions: "Hypertension",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Michael",
        lastName: "Chen",
        phone: "555-0203",
        email: "m.chen@example.com",
        dateOfBirth: "1992-11-22",
        gender: "MALE",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Sarah",
        lastName: "Williams",
        phone: "555-0305",
        email: "sarah.w@example.com",
        dateOfBirth: "1978-03-08",
        gender: "FEMALE",
        allergies: "Latex",
        chronicConditions: "Diabetes Type 2",
        status: "INACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "David",
        lastName: "Martinez",
        phone: "555-0407",
        email: "d.martinez@example.com",
        dateOfBirth: "2000-09-30",
        gender: "MALE",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Emma",
        lastName: "Thompson",
        phone: "555-0509",
        email: "emma.t@example.com",
        dateOfBirth: "1995-12-12",
        gender: "FEMALE",
        allergies: "Aspirin",
        chronicConditions: "Asthma",
        currentMedications: "Salbutamol inhaler",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Omar",
        lastName: "Al-Rashid",
        phone: "555-0611",
        email: "omar.r@example.com",
        dateOfBirth: "1988-07-03",
        gender: "MALE",
        cnie: "MR-11234",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Priya",
        lastName: "Sharma",
        phone: "555-0713",
        email: "priya.s@example.com",
        dateOfBirth: "1997-02-18",
        gender: "FEMALE",
        allergies: "Sulfa drugs",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "James",
        lastName: "Carter",
        phone: "555-0815",
        email: "j.carter@example.com",
        dateOfBirth: "1983-04-22",
        gender: "MALE",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Aisha",
        lastName: "Patel",
        phone: "555-0917",
        email: "aisha.p@example.com",
        dateOfBirth: "2001-08-14",
        gender: "FEMALE",
        allergies: "Penicillin",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Lucas",
        lastName: "Fernandez",
        phone: "555-1019",
        email: "l.fernandez@example.com",
        dateOfBirth: "1990-12-03",
        gender: "MALE",
        chronicConditions: "High cholesterol",
        currentMedications: "Atorvastatin 20mg",
        status: "INACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Yuki",
        lastName: "Tanaka",
        phone: "555-1121",
        email: "yuki.t@example.com",
        dateOfBirth: "1996-06-18",
        gender: "FEMALE",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Fatima",
        lastName: "Nour",
        phone: "555-1223",
        email: "fatima.n@example.com",
        dateOfBirth: "1987-09-29",
        gender: "FEMALE",
        allergies: "Ibuprofen",
        chronicConditions: "Migraine",
        currentMedications: "Sumatriptan",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Ethan",
        lastName: "Brooks",
        phone: "555-1325",
        email: "e.brooks@example.com",
        dateOfBirth: "1994-01-07",
        gender: "MALE",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Nina",
        lastName: "Kowalski",
        phone: "555-1427",
        email: "nina.k@example.com",
        dateOfBirth: "1980-11-25",
        gender: "FEMALE",
        allergies: "Sulfa drugs",
        chronicConditions: "Arthritis",
        status: "INACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Carlos",
        lastName: "Mendez",
        phone: "555-1529",
        email: "c.mendez@example.com",
        dateOfBirth: "1975-05-11",
        gender: "MALE",
        chronicConditions: "Type 1 Diabetes",
        currentMedications: "Insulin",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Sophie",
        lastName: "Laurent",
        phone: "555-1631",
        email: "sophie.l@example.com",
        dateOfBirth: "1999-03-16",
        gender: "FEMALE",
        allergies: "Latex",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Amir",
        lastName: "Hassan",
        phone: "555-1733",
        email: "amir.h@example.com",
        dateOfBirth: "1986-10-08",
        gender: "MALE",
        chronicConditions: "Hypertension",
        currentMedications: "Lisinopril 10mg",
        cnie: "MR-98765",
        status: "ACTIVE",
      },
      {
        clinicId: "00000000-0000-4000-8000-000000000001",
        firstName: "Mia",
        lastName: "Johansson",
        phone: "555-1835",
        email: "mia.j@example.com",
        dateOfBirth: "2003-07-20",
        gender: "FEMALE",
        allergies: "Aspirin",
        status: "ACTIVE",
      },
    ];

    for (const patient of patients) {
      const id = randomUUID();
      await queryRunner.query(
        `INSERT INTO patients (id, clinic_id, first_name, last_name, phone, email, date_of_birth, gender, address, allergies, chronic_conditions, current_medications, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          patient.clinicId,
          patient.firstName,
          patient.lastName,
          patient.phone,
          patient.email,
          patient.dateOfBirth,
          patient.gender,
          patient.address,
          patient.allergies,
          patient.chronicConditions,
          patient.currentMedications,
          patient.status,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DELETE FROM patients WHERE clinic_id = '00000000-0000-4000-8000-000000000001'",
    );
    await queryRunner.query(
      "DELETE FROM insurance_providers WHERE clinic_id = '00000000-0000-4000-8000-000000000001'",
    );
  }
}
