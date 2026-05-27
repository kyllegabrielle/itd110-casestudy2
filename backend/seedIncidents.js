const { session, driver, checkConnection } = require('./config/db');
const { v4: uuidv4 } = require('uuid');

const incidents = [
  {
    title: 'Street Robbery at Central Mall',
    crimeType: 'Robbery',
    description: 'A suspect snatched a bag from a victim near the south entrance.',
    date: '2026-05-10',
    time: '14:30',
    status: 'Solved',
    locationName: 'Central Mall',
    barangay: 'Poblacion',
    suspectName: 'Mark "The Snake" Sison',
    victimName: 'Elena Gilbert',
    officerName: 'Officer Ramos'
  },
  {
    title: 'Shoplifting in ABC Grocery',
    crimeType: 'Theft',
    description: 'Individual caught trying to leave with unpaid items.',
    date: '2026-05-12',
    time: '10:15',
    status: 'Solved',
    locationName: 'ABC Grocery',
    barangay: 'San Jose',
    suspectName: 'Mark "The Snake" Sison',
    victimName: 'ABC Management',
    officerName: 'Officer Ramos'
  },
  {
    title: 'Physical Assault at Night Market',
    crimeType: 'Assault',
    description: 'Heated argument led to a physical altercation between two men.',
    date: '2026-05-15',
    time: '21:45',
    status: 'Active',
    locationName: 'Public Night Market',
    barangay: 'Poblacion',
    suspectName: 'Jake Varga',
    victimName: 'Robert Deniro',
    officerName: 'Officer Ramos'
  },
  {
    title: 'Bicycle Theft',
    crimeType: 'Theft',
    description: 'Mountain bike stolen from residential porch.',
    date: '2026-05-18',
    time: '03:00',
    status: 'Pending',
    locationName: 'Greenwood Residences',
    barangay: 'San Jose',
    suspectName: 'Unknown',
    victimName: 'Sarah Connor',
    officerName: 'Officer Chen'
  },
  {
    title: 'Vandalism on Public Wall',
    crimeType: 'Vandalism',
    description: 'Graffiti sprayed on the side of the library building.',
    date: '2026-05-20',
    time: '23:30',
    status: 'Pending',
    locationName: 'Public Library',
    barangay: 'Poblacion',
    suspectName: 'Jake Varga',
    victimName: 'Local Government',
    officerName: 'Officer Chen'
  },
  {
    title: 'Illegal Drug Possession',
    crimeType: 'Illegal Drugs',
    description: 'Suspect found with prohibited substances during a routine check.',
    date: '2026-05-22',
    time: '19:00',
    status: 'Active',
    locationName: 'Central Mall',
    barangay: 'Poblacion',
    suspectName: 'Mark "The Snake" Sison',
    victimName: 'Society',
    officerName: 'Officer Smith'
  },
  {
    title: 'Pickpocketing in Crowded Bus',
    crimeType: 'Theft',
    description: 'Victim reported wallet missing after riding the route 7 bus.',
    date: '2026-05-23',
    time: '08:45',
    status: 'Pending',
    locationName: 'Bus Terminal',
    barangay: 'San Jose',
    suspectName: 'Mark "The Snake" Sison',
    victimName: 'David Miller',
    officerName: 'Officer Chen'
  },
  {
    title: 'Cyber Bullying Case',
    crimeType: 'Cybercrime',
    description: 'Victim reported persistent harassment via social media platforms.',
    date: '2026-05-24',
    time: '16:00',
    status: 'Active',
    locationName: 'Online',
    barangay: 'Global',
    suspectName: 'Anonymous123',
    victimName: 'Sarah Connor',
    officerName: 'Officer Smith'
  },
  {
    title: 'Domestic Dispute',
    crimeType: 'Assault',
    description: 'Neighbor reported loud shouting and crashing sounds.',
    date: '2026-05-25',
    time: '22:10',
    status: 'Solved',
    locationName: 'Greenwood Residences',
    barangay: 'San Jose',
    suspectName: 'Robert Deniro',
    victimName: 'Sarah Connor',
    officerName: 'Officer Smith'
  }
];

const seedIncidents = async () => {
  const s = session();
  try {
    await checkConnection();
    console.log('--- Starting Incident Seeding ---');

    for (const data of incidents) {
      const id = uuidv4();
      await s.run(
        `MERGE (i:Incident {incidentId: $id})
         SET i.title = $title,
             i.description = $description,
             i.date = $date,
             i.time = $time,
             i.status = $status
         
         MERGE (ct:CrimeType {name: $crimeType})
         MERGE (i)-[:HAS_TYPE]->(ct)
         
         MERGE (l:Location {name: $locationName, barangay: $barangay})
         MERGE (i)-[:OCCURRED_AT]->(l)
         
         MERGE (suspect:Suspect {name: $suspectName})
         MERGE (suspect)-[:INVOLVED_IN]->(i)
         
         MERGE (v:Victim {name: $victimName})
         MERGE (v)-[:AFFECTED_BY]->(i)
         
         MERGE (o:Officer {name: $officerName})
         MERGE (o)-[:HANDLED]->(i)
         
         RETURN i`,
        {
          id: id,
          ...data
        }
      );
      console.log(`Seeded Incident: ${data.title}`);
    }

    console.log('--- Incident Seeding Complete ---');
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    await s.close();
    await driver.close();
    process.exit(0);
  }
};

seedIncidents();
